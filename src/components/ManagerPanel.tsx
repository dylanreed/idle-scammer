// ABOUTME: Extracted manager panel component that renders tier-grouped manager lists
// ABOUTME: Displays hire buttons, cost, locked/hired status, and optional portraits per manager

import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { TerminalText } from './TerminalText';
import { PixelButton } from './PixelButton';
import { CRTFrame } from './CRTFrame';
import { COLORS, SPACING } from './theme';
import { ALL_MANAGERS } from '../game/managers/definitions';
import { getManagerPortrait } from '../game/assets';
import { isTierAccessible } from '../game/prestige/calculations';
import { getManagerCostForScam } from '../game/employees/calculations';
import { TIER_1_SCAMS } from '../game/scams/definitions';
import { TIER_2_SCAMS } from '../game/scams/tier2';
import { TIER_3_SCAMS } from '../game/scams/tier3';
import { TIER_4_SCAMS } from '../game/scams/tier4';
import { TIER_5_SCAMS } from '../game/scams/tier5';
import { formatNumber } from '../utils/formatters';
import type { ScamTier, ScamDefinition, ScamState } from '../game/scams/types';
import type { GameResources } from '../game/types';

/**
 * Props for the ManagerPanel component
 */
export interface ManagerPanelProps {
  /** Current game resources (money, trust, etc.) */
  resources: GameResources;

  /** Map of scam ID to current scam state */
  scams: Record<string, ScamState>;

  /** Check if a manager has been hired by ID */
  isManagerHired: (managerId: string) => boolean;

  /** Callback when hiring a manager */
  onHireManager: (managerId: string, cost: number, scamId: string) => void;

  /** Set of tier numbers that are currently collapsed (shared with ScamListPanel) */
  collapsedTiers?: Set<ScamTier>;

  /** Called when a tier header is pressed to toggle collapse */
  onToggleTier?: (tier: ScamTier) => void;

  /** Optional test ID */
  testID?: string;
}

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
 * Renders manager lists grouped by tier.
 * Each accessible tier with managers gets a CRTFrame section showing
 * manager name, cost or hired status, and a hire/locked button.
 */
export function ManagerPanel({
  resources,
  scams,
  isManagerHired,
  onHireManager,
  collapsedTiers = new Set(),
  onToggleTier,
  testID,
}: ManagerPanelProps): React.ReactElement {
  return (
    <View testID={testID}>
      {SCAMS_BY_TIER.map(({ tier, scams: tierScams }) => {
        const accessible = isTierAccessible(tier, resources.trust);
        if (!accessible) return null;

        // Filter managers that belong to this tier's scams and whose scam is unlocked
        const tierManagers = ALL_MANAGERS.filter((mgr) => {
          if (!tierScams.some((s) => s.id === mgr.scamId)) return false;
          const scamState = scams[mgr.scamId];
          return scamState?.isUnlocked ?? false;
        });

        if (tierManagers.length === 0) return null;

        const isCollapsed = collapsedTiers.has(tier);
        const chevron = isCollapsed ? '▶' : '▼';

        return (
          <View key={`tier-managers-${tier}`}>
            <Pressable
              testID={`manager-tier-header-${tier}`}
              onPress={() => onToggleTier?.(tier)}
            >
              <TerminalText
                size="sm"
                color={COLORS.textSecondary}
                style={styles.managersLabel}
              >
                {`${chevron} TIER ${tier} MANAGERS`}
              </TerminalText>
            </Pressable>
            {!isCollapsed && <CRTFrame style={styles.managersSection} accentColor={COLORS.gold}>
              <TerminalText size="sm" color={COLORS.textSecondary}>
                {'Managers automate your scams'}
              </TerminalText>
              <View style={styles.managersList}>
                {tierManagers.map((manager) => {
                  const hired = isManagerHired(manager.id);
                  const dynamicManagerCost = getManagerCostForScam(manager.scamId);
                  const canAfford = resources.money >= dynamicManagerCost;

                  const portrait = getManagerPortrait(manager.id);
                  return (
                    <View key={manager.id} style={styles.managerRow}>
                      {portrait && (
                        <Image
                          source={portrait}
                          style={styles.managerPortrait}
                          testID="manager-portrait"
                        />
                      )}
                      <View style={styles.managerInfo}>
                        <TerminalText
                          size="sm"
                          color={hired ? COLORS.terminalGreen : COLORS.terminalGreenDim}
                        >
                          {manager.name}
                        </TerminalText>
                        <TerminalText size="sm" color={COLORS.terminalGreenDim}>
                          {hired ? '✓ HIRED' : `$${formatNumber(dynamicManagerCost)}`}
                        </TerminalText>
                      </View>
                      {!hired && (
                        <PixelButton
                          onPress={() => onHireManager(manager.id, dynamicManagerCost, manager.scamId)}
                          disabled={!canAfford}
                          variant="primary"
                        >
                          HIRE
                        </PixelButton>
                      )}
                    </View>
                  );
                })}
              </View>
            </CRTFrame>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  managersLabel: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  managersSection: {
    marginBottom: SPACING.md,
  },
  managersList: {
    marginTop: SPACING.sm,
  },
  managerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSecondary,
  },
  managerPortrait: {
    width: 40,
    height: 40,
    marginRight: SPACING.sm,
  },
  managerInfo: {
    flex: 1,
  },
});
