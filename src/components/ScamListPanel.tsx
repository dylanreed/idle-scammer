// ABOUTME: Panel component that renders tier-grouped scam cards in a scrollable list
// ABOUTME: Extracts the scam list rendering logic from GameScreen for better separation of concerns

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ScamCard } from './ScamCard';
import { TerminalText } from './TerminalText';
import { COLORS, SPACING } from './theme';
import { TIER_1_SCAMS } from '../game/scams/definitions';
import { TIER_2_SCAMS } from '../game/scams/tier2';
import { TIER_3_SCAMS } from '../game/scams/tier3';
import { TIER_4_SCAMS } from '../game/scams/tier4';
import { TIER_5_SCAMS } from '../game/scams/tier5';
import { isTierAccessible } from '../game/prestige/calculations';
import { getManagerByScamId } from '../game/managers/definitions';
import { useManagerStore } from '../game/managers/managerStore';
import { useEmployeeStore } from '../game/employees/employeeStore';
import { getEmployeesByScamId } from '../game/employees/definitions';
import { getEmployeeCostForScam, getMaxEmployeesPerType, getUnlockCostForScam } from '../game/employees/calculations';
import type { ScamTimer } from '../game/engine/types';
import type { ScamState, ScamTier, ScamDefinition } from '../game/scams/types';
import type { GameResources } from '../game/types';

/**
 * Props for the ScamListPanel component
 */
export interface ScamListPanelProps {
  /** Current game resources (money, trust, heat, etc.) */
  resources: GameResources;

  /** Map of scam IDs to their runtime state */
  scams: Record<string, ScamState>;

  /** Map of scam IDs to their active timers */
  timerMap: Record<string, ScamTimer>;

  /** ID of the next scam the player should save toward (always shown even if unaffordable) */
  nextGoalScamId: string | undefined;

  /** Called when the player starts a scam */
  onStart: (scamId: string) => void;

  /** Called when the player unlocks a scam */
  onUnlock: (scamId: string) => void;

  /** Called when the player upgrades a scam */
  onUpgrade: (scamId: string) => void;

  /** Called when the player hires an employee */
  onHireEmployee: (employeeId: string, scamId: string) => void;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Tier display names shown as section headers
 */
const TIER_NAMES: Record<ScamTier, string> = {
  1: 'SMALL TIME',
  2: 'GETTING SERIOUS',
  3: 'BIG LEAGUES',
  4: 'ORGANIZED CRIME',
  5: 'MASTERMIND',
};

/**
 * Scam arrays grouped by tier for iteration
 */
const SCAMS_BY_TIER: { tier: ScamTier; scams: ScamDefinition[] }[] = [
  { tier: 1, scams: TIER_1_SCAMS },
  { tier: 2, scams: TIER_2_SCAMS },
  { tier: 3, scams: TIER_3_SCAMS },
  { tier: 4, scams: TIER_4_SCAMS },
  { tier: 5, scams: TIER_5_SCAMS },
];

/**
 * Scrollable panel that renders scam cards organized by tier.
 * Filters tiers by accessibility (trust level) and scams by visibility
 * (unlocked, affordable, or next goal).
 */
export function ScamListPanel({
  resources,
  scams,
  timerMap,
  nextGoalScamId,
  onStart,
  onUnlock,
  onUpgrade,
  onHireEmployee,
  testID,
}: ScamListPanelProps): React.ReactElement {
  const isManagerHired = useManagerStore((state) => state.isManagerHired);

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      {SCAMS_BY_TIER.map(({ tier, scams: tierScams }) => {
        const accessible = isTierAccessible(tier, resources.trust);
        if (!accessible) return null;

        // Filter visible scams
        const visibleScams = tierScams.filter((scamDef) => {
          const scamState = scams[scamDef.id];
          if (scamState?.isUnlocked) return true;
          const dynamicCost = getUnlockCostForScam(scamDef.id);
          if (dynamicCost === undefined) return true;
          if (resources.money >= dynamicCost) return true;
          return scamDef.id === nextGoalScamId;
        });

        if (visibleScams.length === 0) return null;

        return (
          <View key={`tier-${tier}`}>
            {/* Tier Header */}
            <TerminalText
              size="md"
              color={COLORS.terminalGreenDim}
              style={styles.sectionTitle}
            >
              {`TIER ${tier}: ${TIER_NAMES[tier]}`}
            </TerminalText>

            {/* Scam Cards */}
            {visibleScams.map((scamDef) => {
              const manager = getManagerByScamId(scamDef.id);
              const hasManager = manager ? isManagerHired(manager.id) : false;

              // Look up employee for this scam
              const scamEmployees = getEmployeesByScamId(scamDef.id);
              const empDef = scamEmployees.length > 0 ? scamEmployees[0] : undefined;
              const empCount = empDef
                ? useEmployeeStore.getState().getEmployeeCount(empDef.id)
                : 0;
              const empBonuses = useEmployeeStore.getState().getScamBonuses(scamDef.id);
              const empCost = empDef
                ? getEmployeeCostForScam(scamDef.id, empCount, resources.snitchCount)
                : undefined;

              const empMaxCount = getMaxEmployeesPerType(resources.trust);

              return (
                <ScamCard
                  key={scamDef.id}
                  scamDefinition={scamDef}
                  scamState={scams[scamDef.id]}
                  timer={timerMap[scamDef.id]}
                  trust={resources.trust}
                  money={resources.money}
                  hasManager={hasManager}
                  onStart={() => onStart(scamDef.id)}
                  onUnlock={() => onUnlock(scamDef.id)}
                  onUpgrade={() => onUpgrade(scamDef.id)}
                  employeeDefinition={empDef}
                  employeeCount={empCount}
                  employeeMaxCount={empMaxCount}
                  employeeSpeedBonus={empBonuses.speedBonus}
                  employeeRewardBonus={empBonuses.rewardBonus}
                  onHireEmployee={
                    empDef ? () => onHireEmployee(empDef.id, scamDef.id) : undefined
                  }
                  employeeHireCost={empCost}
                  unlockCost={getUnlockCostForScam(scamDef.id)}
                  testID={`scam-card-${scamDef.id}`}
                />
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
});
