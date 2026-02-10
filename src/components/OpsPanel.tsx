// ABOUTME: Operations center panel combining bot assignment and manager hiring
// ABOUTME: Wraps BotAssignmentPanel and ManagerPanel in a scrollable container

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { BotAssignmentPanel } from './BotAssignmentPanel';
import { ManagerPanel } from './ManagerPanel';
import { SPACING } from './theme';
import type { GameResources } from '../game/types';
import type { ScamState } from '../game/scams/types';

export interface OpsPanelProps {
  /** Current game resources */
  resources: GameResources;

  /** Map of scam IDs to their runtime state */
  scams: Record<string, ScamState>;

  /** Check if a manager has been hired */
  isManagerHired: (managerId: string) => boolean;

  /** Called when the player hires a manager */
  onHireManager: (managerId: string, cost: number, scamId: string) => void;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Operations center panel that combines bot assignment and manager hiring.
 * Bot panel is first (frequent interaction), managers second (one-time purchases).
 */
export function OpsPanel({
  resources,
  scams,
  isManagerHired,
  onHireManager,
  testID,
}: OpsPanelProps): React.ReactElement {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      <BotAssignmentPanel testID="bot-assignment-panel" />
      <ManagerPanel
        resources={resources}
        scams={scams}
        isManagerHired={isManagerHired}
        onHireManager={onHireManager}
        testID="manager-panel"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
});
