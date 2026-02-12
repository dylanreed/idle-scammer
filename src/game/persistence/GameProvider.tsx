// ABOUTME: React component that orchestrates game persistence on mount and unmount
// ABOUTME: Handles load → migrate → hydrate → offline earnings → auto-save lifecycle

import React, { useEffect, useState, useRef } from 'react';
import { AppState, View, Text, StyleSheet } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { loadGame, saveGame } from './storage';
import { migrateIfNeeded, applySaveData, createSaveData, reconstructActiveTimers } from './saveManager';
import { calculateOfflineProgress } from '../engine/gameLoop';
import { calculateHeatDecay } from '../prestige/calculations';
import { AUTO_SAVE_INTERVAL_MS } from './types';
import { useGameStore } from '../store';
import { useScamStore } from '../scams/scamStore';
import { useManagerStore } from '../managers/managerStore';
import { useEmployeeStore } from '../employees/employeeStore';
import { useBotStore } from '../bots/botStore';
import { useSkillStore } from '../skills/skillStore';
import { useTutorialStore } from '../tutorial/tutorialStore';
import { useCryptoStore } from '../crypto/cryptoStore';
import { useOriginStore } from '../origin/originStore';
import { COLORS } from '../../components/theme';

interface GameProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the game screen and handles all persistence lifecycle:
 * 1. On mount: load save → migrate → hydrate stores → calculate offline earnings
 * 2. Auto-save every AUTO_SAVE_INTERVAL_MS
 * 3. Save on app background/inactive
 */
export function GameProvider({ children }: GameProviderProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load and hydrate on mount
  useEffect(() => {
    async function initializeGame() {
      try {
        const rawSave = await loadGame();

        if (rawSave) {
          // Migrate old save data to current version
          const migrated = migrateIfNeeded(rawSave);

          // Extract state from save
          const { resources, scams, managers, employees, botAssignments, skills, ascensions, tutorials, crypto, origin } = applySaveData(migrated);

          // Hydrate all stores
          useGameStore.getState().hydrate(resources);
          useGameStore.getState().hydrateAscensions(ascensions);
          useScamStore.getState().hydrate(scams);
          useManagerStore.getState().hydrate(managers);
          useEmployeeStore.getState().hydrate(employees);
          useBotStore.getState().hydrate(botAssignments);
          useSkillStore.getState().hydrate(skills);
          useTutorialStore.getState().hydrate(tutorials);
          useCryptoStore.getState().hydrate(crypto);
          useOriginStore.getState().hydrate(origin);

          // Calculate offline earnings
          const timers = reconstructActiveTimers(scams, managers);
          if (timers.length > 0) {
            const now = Date.now();
            const offlineState = {
              lastTickTime: migrated.savedAt,
              activeTimers: timers,
              isPaused: false,
            };

            const progress = calculateOfflineProgress(
              migrated.savedAt,
              now,
              offlineState,
              scams,
              resources.trust,
              resources.bots
            );

            // Apply heat decay for offline duration before adding new heat
            // Trust boosts decay rate via criminal network
            const offlineSeconds = progress.elapsedMs / 1000;
            const currentHeat = useGameStore.getState().resources.heat;
            if (currentHeat > 0 && offlineSeconds > 0) {
              const offlineTrust = useGameStore.getState().resources.trust;
              const decayedHeat = calculateHeatDecay(currentHeat, offlineSeconds, offlineTrust);
              const heatLost = currentHeat - decayedHeat;
              if (heatLost > 0) {
                useGameStore.getState().addHeat(-heatLost);
              }
            }

            // Apply offline earnings
            if (progress.earnings.money > 0) {
              useGameStore.getState().addMoney(progress.earnings.money);
            }
            if (progress.earnings.bots > 0) {
              useGameStore.getState().addBots(progress.earnings.bots);
            }
            if (progress.earnings.heat > 0) {
              useGameStore.getState().addHeat(progress.earnings.heat);
            }
            if (progress.earnings.crypto > 0) {
              useGameStore.getState().addCrypto(progress.earnings.crypto);
            }

            if (progress.completedScams > 0) {
              console.log(
                `[GameProvider] Offline earnings: ${progress.completedScams} scam cycles in ${Math.round(progress.elapsedMs / 1000)}s`,
                progress.earnings
              );
            }
          }
        }
      } catch (error) {
        console.warn('[GameProvider] Failed to load save:', error);
      }

      setIsLoading(false);
    }

    initializeGame();
  }, []);

  // Auto-save interval
  useEffect(() => {
    if (isLoading) return;

    autoSaveRef.current = setInterval(() => {
      performSave();
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      if (autoSaveRef.current !== null) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [isLoading]);

  // Save on app background/inactive
  useEffect(() => {
    if (isLoading) return;

    function handleAppStateChange(nextState: AppStateStatus) {
      if (nextState === 'background' || nextState === 'inactive') {
        performSave();
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Snapshots all store state and saves to AsyncStorage.
 */
function performSave() {
  const resources = useGameStore.getState().resources;
  const scams = useScamStore.getState().scams;
  const managers = useManagerStore.getState().managers;
  const employees = useEmployeeStore.getState().employees;
  const botAssignments = useBotStore.getState().assignments;
  const skills = useSkillStore.getState().toSaveData();
  const ascensions = useGameStore.getState().ascensions;
  const tutorials = useTutorialStore.getState().toSaveData();
  const crypto = useCryptoStore.getState().toSaveData();
  const origin = useOriginStore.getState().toSaveData();

  const saveData = createSaveData(resources, scams, managers, employees, botAssignments, skills, ascensions, tutorials, crypto, origin);
  saveGame(saveData).catch((error) => {
    console.warn('[GameProvider] Auto-save failed:', error);
  });
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 16,
  },
});
