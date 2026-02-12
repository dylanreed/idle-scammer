// ABOUTME: Bot assignment panel for distributing bots across scams for speed/profit bonuses
// ABOUTME: Smart component that subscribes to bot, game, and scam stores directly

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TerminalText } from './TerminalText';
import { PixelButton } from './PixelButton';
import { CRTFrame } from './CRTFrame';
import { COLORS, SPACING } from './theme';
import { useBotStore } from '../game/bots/botStore';
import { useGameStore } from '../game/store';
import { useScamStore } from '../game/scams/scamStore';
import { useEmployeeStore } from '../game/employees/employeeStore';
import { ALL_SCAMS } from '../game/scams/definitions';
import { IDLE_BOT_HEAT_REDUCTION } from '../game/bots/constants';
import { getMaxUsefulSpeedBots } from '../game/scams/calculations';

/**
 * Props for the BotAssignmentPanel component
 */
export interface BotAssignmentPanelProps {
  /** Test ID for testing */
  testID?: string;
}

/**
 * Panel for managing bot assignments across unlocked scams.
 * Displays a summary of total/deployed/idle bots and per-scam assignment controls
 * for speed and profit roles.
 */
export function BotAssignmentPanel({ testID }: BotAssignmentPanelProps): React.ReactElement {
  const totalBots = useGameStore((s) => s.resources.bots);
  const scams = useScamStore((s) => s.scams);
  const assignments = useBotStore((s) => s.assignments);
  const assignBot = useBotStore((s) => s.assignBot);
  const unassignBot = useBotStore((s) => s.unassignBot);
  const clearScamBots = useBotStore((s) => s.clearScamBots);
  const getTotalAssigned = useBotStore((s) => s.getTotalAssigned);
  const getAvailableBots = useBotStore((s) => s.getAvailableBots);
  const getScamBotBonuses = useBotStore((s) => s.getScamBotBonuses);

  const wholeBots = Math.floor(totalBots);
  const deployed = getTotalAssigned();
  const idle = getAvailableBots(totalBots);

  // Get unlocked scams
  const unlockedScams = ALL_SCAMS.filter((s) => scams[s.id]?.isUnlocked);

  return (
    <CRTFrame testID={testID} accentColor={COLORS.accent}>
      {/* Summary */}
      <TerminalText size="sm" color={COLORS.textSecondary} testID="bot-summary">
        {`Total: ${wholeBots} | Deployed: ${deployed} | Idle: ${idle}`}
      </TerminalText>

      {/* Heat reduction info */}
      {idle > 0 && (
        <TerminalText size="sm" color={COLORS.textSecondary} testID="bot-heat-info">
          {`Idle bots reduce heat by ${Math.round(IDLE_BOT_HEAT_REDUCTION * idle * 100)}%`}
        </TerminalText>
      )}

      {wholeBots === 0 && (
        <TerminalText size="sm" color={COLORS.textSecondary}>
          {'No bots available'}
        </TerminalText>
      )}

      {/* Per-scam assignment rows */}
      {unlockedScams.map((scamDef) => {
        const assignment = assignments[scamDef.id] ?? { speedBots: 0, profitBots: 0 };
        const bonuses = getScamBotBonuses(scamDef.id);
        const scamLevel = scams[scamDef.id]?.level ?? 1;
        const empBonuses = useEmployeeStore.getState().getScamBonuses(scamDef.id);
        const maxSpeedBots = getMaxUsefulSpeedBots(scamDef, scamLevel, empBonuses.speedBonus);

        return (
          <View key={scamDef.id} style={styles.scamRow} testID={`bot-row-${scamDef.id}`}>
            <TerminalText size="sm" color={COLORS.textSecondary} style={styles.scamName}>
              {scamDef.name}
            </TerminalText>

            <View style={styles.assignmentControls}>
              {/* Speed assignment */}
              <View style={styles.roleGroup}>
                <TerminalText size="sm" color={COLORS.textSecondary}>
                  {'SPD'}
                </TerminalText>
                <PixelButton
                  onPress={() => unassignBot(scamDef.id, 'speed')}
                  disabled={assignment.speedBots === 0}
                  variant="secondary"
                  style={styles.compactButton}
                  testID={`bot-spd-minus-${scamDef.id}`}
                >
                  {'-'}
                </PixelButton>
                <TerminalText size="sm" color={COLORS.terminalGreen} testID={`bot-spd-count-${scamDef.id}`}>
                  {String(assignment.speedBots)}
                </TerminalText>
                <PixelButton
                  onPress={() => assignBot(scamDef.id, 'speed')}
                  disabled={idle === 0 || assignment.speedBots >= maxSpeedBots}
                  variant="primary"
                  style={styles.compactButton}
                  testID={`bot-spd-plus-${scamDef.id}`}
                >
                  {'+'}
                </PixelButton>
              </View>

              {/* Profit assignment */}
              <View style={styles.roleGroup}>
                <TerminalText size="sm" color={COLORS.textSecondary}>
                  {'PROFIT'}
                </TerminalText>
                <PixelButton
                  onPress={() => unassignBot(scamDef.id, 'profit')}
                  disabled={assignment.profitBots === 0}
                  variant="secondary"
                  style={styles.compactButton}
                  testID={`bot-profit-minus-${scamDef.id}`}
                >
                  {'-'}
                </PixelButton>
                <TerminalText size="sm" color={COLORS.terminalGreen} testID={`bot-profit-count-${scamDef.id}`}>
                  {String(assignment.profitBots)}
                </TerminalText>
                <PixelButton
                  onPress={() => assignBot(scamDef.id, 'profit')}
                  disabled={idle === 0}
                  variant="primary"
                  style={styles.compactButton}
                  testID={`bot-profit-plus-${scamDef.id}`}
                >
                  {'+'}
                </PixelButton>
              </View>

              {/* Clear all bots from this scam */}
              <PixelButton
                onPress={() => clearScamBots(scamDef.id)}
                disabled={assignment.speedBots === 0 && assignment.profitBots === 0}
                variant="secondary"
                style={styles.compactButton}
                testID={`bot-clear-${scamDef.id}`}
              >
                {'CLR'}
              </PixelButton>
            </View>

            {/* Show bonus percentages if any bots assigned */}
            {(bonuses.speedBonus > 0 || bonuses.profitBonus > 0) && (
              <TerminalText size="sm" color={COLORS.textSecondary} testID={`bot-bonus-${scamDef.id}`}>
                {`SPD +${Math.round(bonuses.speedBonus * 100)}% | PROFIT +${Math.round(bonuses.profitBonus * 100)}%`}
              </TerminalText>
            )}
          </View>
        );
      })}
    </CRTFrame>
  );
}

const styles = StyleSheet.create({
  scamRow: {
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSecondary,
  },
  scamName: {
    marginBottom: SPACING.xs,
  },
  assignmentControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  compactButton: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
});
