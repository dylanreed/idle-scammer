// ABOUTME: Individual investment project card showing status and countdown
// ABOUTME: Displays project name, invested amount, timer progress, and rug pull status

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TerminalText } from './TerminalText';
import { PixelButton } from './PixelButton';
import { COLORS, SPACING } from './theme';
import type { ProjectState } from '../game/crypto/types';
import { PROJECT_DEFINITIONS } from '../game/crypto/constants';

export interface ProjectCardProps {
  /** The active project state */
  project: ProjectState;
  /** Whether the project has matured */
  isMatured: boolean;
  /** Called when the player collects a matured project */
  onCollect: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Formats remaining time in MM:SS format.
 */
function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Card displaying an active investment project with timer and collect button.
 */
export function ProjectCard({
  project,
  isMatured,
  onCollect,
  testID,
}: ProjectCardProps): React.ReactElement {
  const definition = PROJECT_DEFINITIONS.find((p) => p.id === project.definitionId);
  const name = definition?.name ?? project.definitionId;
  const remaining = definition
    ? project.startedAt + definition.durationMs - Date.now()
    : 0;

  const statusColor = project.isRugged
    ? COLORS.warningRed
    : isMatured
      ? COLORS.terminalGreen
      : COLORS.gold;

  const statusText = project.isRugged
    ? 'RUGGED'
    : isMatured
      ? `+${(project.investedAmount * project.returnMultiplier).toFixed(2)} crypto`
      : formatTimeRemaining(remaining);

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.header}>
        <TerminalText size="sm" color={COLORS.terminalGreen}>
          {name}
        </TerminalText>
        <TerminalText size="sm" color={COLORS.terminalGreenDim}>
          {`${project.investedAmount.toFixed(2)} invested`}
        </TerminalText>
      </View>
      <View style={styles.footer}>
        <TerminalText size="sm" color={statusColor}>
          {statusText}
        </TerminalText>
        {isMatured && (
          <PixelButton
            onPress={onCollect}
            variant={project.isRugged ? 'danger' : 'primary'}
            testID="collect-btn"
          >
            {project.isRugged ? 'DISMISS' : 'COLLECT'}
          </PixelButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.terminalGreenDim,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
