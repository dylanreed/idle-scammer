// ABOUTME: Interactive card component for displaying and controlling a single scam
// ABOUTME: Shows scam state, progress bar, and action buttons (start, collect, unlock)

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CRTFrame } from './CRTFrame';
import { PixelButton } from './PixelButton';
import { ProgressBar } from './ProgressBar';
import { TerminalText } from './TerminalText';
import { COLORS, SPACING } from './theme';
import { formatNumber, formatDuration } from '../utils/formatters';
import type { ScamDefinition } from '../game/scams/types';
import type { ScamState } from '../game/scams/types';
import type { ScamTimer } from '../game/engine/types';
import {
  calculateScamDuration,
  calculateScamReward,
} from '../game/scams/calculations';

/**
 * Possible states a scam card can be in
 */
export type ScamCardStatus = 'locked' | 'idle' | 'running' | 'complete';

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

  /** Player's current money for unlock affordability check */
  money: number;

  /** Called when player clicks start button */
  onStart: () => void;

  /** Called when player clicks collect button */
  onCollect: () => void;

  /** Called when player clicks unlock button */
  onUnlock: () => void;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Determine the current status of a scam
 */
function getScamStatus(
  scamState: ScamState | undefined,
  timer: ScamTimer | undefined
): ScamCardStatus {
  if (!scamState || !scamState.isUnlocked) {
    return 'locked';
  }

  if (!timer) {
    return 'idle';
  }

  if (timer.isComplete) {
    return 'complete';
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
  onStart,
  onCollect,
  onUnlock,
  testID,
}: ScamCardProps): React.ReactElement {
  const status = getScamStatus(scamState, timer);
  const level = scamState?.level ?? 1;

  // Calculate values for display
  const duration = calculateScamDuration(scamDefinition, level);
  const reward = calculateScamReward(scamDefinition, level, trust);
  const progress = getTimerProgress(timer);
  const canAffordUnlock =
    scamDefinition.unlockCost !== undefined && money >= scamDefinition.unlockCost;

  // Resource type display
  const resourceLabel =
    scamDefinition.resourceType === 'bots' ? 'bots' : '$';
  const rewardDisplay =
    scamDefinition.resourceType === 'bots'
      ? `+${formatNumber(reward)} bots`
      : `+$${formatNumber(reward)}`;

  return (
    <CRTFrame testID={testID} style={styles.card}>
      {/* Header with name and level */}
      <View style={styles.header}>
        <TerminalText size="lg" style={styles.name}>
          {scamDefinition.name}
        </TerminalText>
        {status !== 'locked' && (
          <TerminalText size="sm" color={COLORS.terminalGreenDim}>
            {`Lvl ${level}`}
          </TerminalText>
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

      {/* Progress bar (when running) */}
      {status === 'running' && (
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
            {scamDefinition.unlockCost !== undefined
              ? `UNLOCK ($${formatNumber(scamDefinition.unlockCost)})`
              : 'UNLOCK (FREE)'}
          </PixelButton>
        )}

        {status === 'idle' && (
          <PixelButton
            onPress={onStart}
            variant="primary"
            testID={testID ? `${testID}-start` : undefined}
          >
            START
          </PixelButton>
        )}

        {status === 'running' && (
          <PixelButton
            onPress={() => {}}
            disabled
            variant="primary"
            testID={testID ? `${testID}-running` : undefined}
          >
            RUNNING...
          </PixelButton>
        )}

        {status === 'complete' && (
          <PixelButton
            onPress={onCollect}
            variant="gold"
            testID={testID ? `${testID}-collect` : undefined}
          >
            COLLECT {rewardDisplay}
          </PixelButton>
        )}
      </View>

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
  completedCount: {
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
