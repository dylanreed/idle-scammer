// ABOUTME: Interactive card component for displaying and controlling a single scam
// ABOUTME: Shows scam state, progress bar, and action buttons (start, collect, unlock)

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { CRTFrame } from './CRTFrame';
import { PixelButton } from './PixelButton';
import { ProgressBar } from './ProgressBar';
import { TerminalText } from './TerminalText';
import { COLORS, SPACING } from './theme';
import { formatNumber, formatDuration } from '../utils/formatters';
import type { ScamDefinition } from '../game/scams/types';
import type { ScamState } from '../game/scams/types';
import type { EmployeeDefinition } from '../game/employees/types';
import type { ScamTimer } from '../game/engine/types';
import {
  calculateScamDuration,
  calculateScamReward,
  calculateUpgradeCost,
} from '../game/scams/calculations';
import { getScamIcon, getManagerPortrait } from '../game/assets';
import { getManagerByScamId } from '../game/managers/definitions';

/**
 * Possible states a scam card can be in.
 * Note: 'complete' is removed because we auto-collect rewards (no manual collect step).
 */
export type ScamCardStatus = 'locked' | 'idle' | 'running';

/**
 * Props for the ScamCard component
 */
export interface ScamCardProps {
  /** The scam definition containing base stats */
  scamDefinition: ScamDefinition;

  /** The runtime scam state (level, unlock status, etc) */
  scamState: ScamState | undefined;

  /** Active timer for this scam (if running) */
  timer: ScamTimer | undefined;

  /** Player's current trust value for reward calculation */
  trust: number;

  /** Player's current money for unlock/upgrade affordability check */
  money: number;

  /** Whether a manager is hired for this scam (affects button display) */
  hasManager?: boolean;

  /** Called when player clicks start button */
  onStart: () => void;

  /** Called when player clicks unlock button */
  onUnlock: () => void;

  /** Called when player clicks upgrade button */
  onUpgrade: () => void;

  /** Employee definition for this scam (if available) */
  employeeDefinition?: EmployeeDefinition;

  /** How many of this employee type are hired */
  employeeCount?: number;

  /** Maximum employees of this type allowed (trust-based cap) */
  employeeMaxCount?: number;

  /** Current employee speed bonus for this scam (decimal, e.g. 0.06 = 6%) */
  employeeSpeedBonus?: number;

  /** Current employee reward bonus for this scam (decimal, e.g. 0.24 = 24%) */
  employeeRewardBonus?: number;

  /** Bot speed bonus for this scam (decimal, e.g. 0.3 = 30% from 3 speed bots) */
  botSpeedBonus?: number;

  /** Bot profit bonus for this scam (decimal, e.g. 0.2 = 20% from 2 profit bots) */
  botProfitBonus?: number;

  /** Called when player hires an employee */
  onHireEmployee?: () => void;

  /** Cost to hire the next employee */
  employeeHireCost?: number;

  /** Dynamic unlock cost override (from cumulative income formula). Falls back to scamDefinition.unlockCost. */
  unlockCost?: number;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Determine the current status of a scam.
 * Note: With auto-collect, completed timers are immediately removed,
 * so we treat any complete timer as idle (ready to start again).
 */
function getScamStatus(
  scamState: ScamState | undefined,
  timer: ScamTimer | undefined
): ScamCardStatus {
  if (!scamState || !scamState.isUnlocked) {
    return 'locked';
  }

  // No timer or timer is complete means we're idle (auto-collect removes timers on completion)
  if (!timer || timer.isComplete) {
    return 'idle';
  }

  return 'running';
}

/**
 * Calculate progress (0-1) from a timer
 */
function getTimerProgress(timer: ScamTimer | undefined): number {
  if (!timer) {
    return 0;
  }

  if (timer.isComplete) {
    return 1;
  }

  const now = Date.now();
  const elapsed = now - timer.startTime;
  const progress = elapsed / timer.duration;
  return Math.min(Math.max(progress, 0), 1);
}

/**
 * Interactive scam card component.
 * Displays scam info, progress, and action buttons based on current state.
 */
export function ScamCard({
  scamDefinition,
  scamState,
  timer,
  trust,
  money,
  hasManager = false,
  onStart,
  onUnlock,
  onUpgrade,
  employeeDefinition,
  employeeCount = 0,
  employeeMaxCount,
  employeeSpeedBonus = 0,
  employeeRewardBonus = 0,
  botSpeedBonus = 0,
  botProfitBonus = 0,
  onHireEmployee,
  employeeHireCost,
  unlockCost: unlockCostProp,
  testID,
}: ScamCardProps): React.ReactElement {
  const status = getScamStatus(scamState, timer);
  const level = scamState?.level ?? 1;
  const isRunning = status === 'running';

  // Calculate values for display (including employee bonuses)
  const duration = calculateScamDuration(scamDefinition, level, employeeSpeedBonus, botSpeedBonus);
  const reward = calculateScamReward(scamDefinition, level, trust, botProfitBonus, employeeRewardBonus);
  const progress = getTimerProgress(timer);
  const upgradeCost = calculateUpgradeCost(scamDefinition, level);
  // Use dynamic unlock cost prop when provided, fall back to static definition
  const effectiveUnlockCost = unlockCostProp ?? scamDefinition.unlockCost;
  const canAffordUnlock =
    effectiveUnlockCost !== undefined && money >= effectiveUnlockCost;
  const canAffordUpgrade = money >= upgradeCost;

  // Resource type display
  const resourceLabel =
    scamDefinition.resourceType === 'bots' ? 'bots' : '$';
  const rewardDisplay =
    scamDefinition.resourceType === 'bots'
      ? `+${formatNumber(reward)} bots`
      : `+$${formatNumber(reward)}`;

  // Get scam icon
  const scamIcon = getScamIcon(scamDefinition.id);

  // Get manager portrait if hired
  const manager = getManagerByScamId(scamDefinition.id);
  const managerPortrait = hasManager && manager ? getManagerPortrait(manager.id) : undefined;

  return (
    <CRTFrame testID={testID} style={styles.card}>
      {/* Header with icon, name, level, and manager portrait */}
      <View style={styles.header}>
        {scamIcon && (
          <Image
            source={scamIcon}
            style={styles.scamIcon}
            testID={testID ? `${testID}-icon` : undefined}
          />
        )}
        <TerminalText size="lg" style={styles.name}>
          {scamDefinition.name}
        </TerminalText>
        {status !== 'locked' && (
          <TerminalText size="sm" color={COLORS.terminalGreenDim}>
            {`Lvl ${level}`}
          </TerminalText>
        )}
        {managerPortrait && (
          <Image
            source={managerPortrait}
            style={styles.managerPortrait}
            testID={testID ? `${testID}-manager` : undefined}
          />
        )}
      </View>

      {/* Description */}
      <TerminalText size="sm" color={COLORS.terminalGreenDim} style={styles.description}>
        {scamDefinition.description}
      </TerminalText>

      {/* Stats row - duration and reward preview */}
      {status !== 'locked' && (
        <View style={styles.statsRow}>
          <TerminalText size="sm" color={COLORS.textDim}>
            {formatDuration(duration)}
          </TerminalText>
          <TerminalText size="sm" color={COLORS.gold}>
            {rewardDisplay}
          </TerminalText>
        </View>
      )}

      {/* Progress bar (always visible when unlocked) */}
      {status !== 'locked' && (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            showPercentage
            testID={testID ? `${testID}-progress` : undefined}
          />
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        {status === 'locked' && (
          <PixelButton
            onPress={onUnlock}
            disabled={!canAffordUnlock}
            variant="gold"
            testID={testID ? `${testID}-unlock` : undefined}
          >
            {effectiveUnlockCost !== undefined
              ? `UNLOCK ($${formatNumber(effectiveUnlockCost)})`
              : 'UNLOCK (FREE)'}
          </PixelButton>
        )}

        {status === 'idle' && !hasManager && (
          <PixelButton
            onPress={onStart}
            variant="primary"
            testID={testID ? `${testID}-start` : undefined}
          >
            START
          </PixelButton>
        )}

        {status === 'idle' && hasManager && (
          <PixelButton
            onPress={() => {}}
            disabled
            variant="secondary"
            testID={testID ? `${testID}-auto` : undefined}
          >
            AUTO (MANAGED)
          </PixelButton>
        )}

        {isRunning && (
          <PixelButton
            onPress={() => {}}
            disabled
            variant="primary"
            testID={testID ? `${testID}-running` : undefined}
          >
            {hasManager ? 'AUTO RUNNING...' : 'RUNNING...'}
          </PixelButton>
        )}
      </View>

      {/* Upgrade button - always visible when unlocked */}
      {status !== 'locked' && (
        <View style={styles.upgradeContainer}>
          <PixelButton
            onPress={onUpgrade}
            disabled={!canAffordUpgrade}
            variant="secondary"
            testID={testID ? `${testID}-upgrade` : undefined}
          >
            {`UPGRADE ($${formatNumber(upgradeCost)})`}
          </PixelButton>
        </View>
      )}

      {/* Employee section - hire and view bonuses */}
      {status !== 'locked' && employeeDefinition && onHireEmployee && employeeHireCost !== undefined && (
        <View style={styles.employeeSection}>
          <View style={styles.employeeHeader}>
            <TerminalText size="sm" color={COLORS.terminalGreen}>
              {employeeMaxCount !== undefined
                ? `${employeeDefinition.name} x${employeeCount}/${employeeMaxCount}`
                : `${employeeDefinition.name} x${employeeCount}`}
            </TerminalText>
            {(employeeSpeedBonus > 0 || employeeRewardBonus > 0) && (
              <TerminalText size="sm" color={COLORS.terminalGreenDim}>
                {`Speed +${Math.round(employeeSpeedBonus * 100)}% / Reward +${Math.round(employeeRewardBonus * 100)}%`}
              </TerminalText>
            )}
          </View>
          {employeeMaxCount !== undefined && employeeCount >= employeeMaxCount ? (
            <PixelButton
              onPress={() => {}}
              disabled
              variant="secondary"
              testID={testID ? `${testID}-hire-employee` : undefined}
            >
              MAX
            </PixelButton>
          ) : (
            <PixelButton
              onPress={onHireEmployee}
              disabled={money < employeeHireCost}
              variant="secondary"
              testID={testID ? `${testID}-hire-employee` : undefined}
            >
              {`HIRE ($${formatNumber(employeeHireCost)})`}
            </PixelButton>
          )}
        </View>
      )}

      {/* Times completed counter */}
      {status !== 'locked' && scamState && scamState.timesCompleted > 0 && (
        <TerminalText
          size="sm"
          color={COLORS.terminalGreenFaded}
          style={styles.completedCount}
        >
          {`Completed: ${formatNumber(scamState.timesCompleted)}x`}
        </TerminalText>
      )}
    </CRTFrame>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  scamIcon: {
    width: 48,
    height: 48,
    marginRight: SPACING.sm,
  },
  managerPortrait: {
    width: 36,
    height: 36,
    marginLeft: SPACING.sm,
  },
  name: {
    flex: 1,
  },
  description: {
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  buttonContainer: {
    marginTop: SPACING.xs,
  },
  upgradeContainer: {
    marginTop: SPACING.sm,
  },
  employeeSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.terminalGreenDim + '40',
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  completedCount: {
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
