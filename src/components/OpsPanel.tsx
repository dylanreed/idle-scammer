// ABOUTME: Operations center panel combining bot assignment and manager hiring
// ABOUTME: Wraps BotAssignmentPanel and ManagerPanel in a scrollable container with collapsible sections

import React, { useState } from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { BotAssignmentPanel } from './BotAssignmentPanel';
import { ManagerPanel } from './ManagerPanel';
import { PixelButton } from './PixelButton';
import { CRTFrame } from './CRTFrame';
import { TerminalText } from './TerminalText';
import { COLORS, SPACING } from './theme';
import type { GameResources } from '../game/types';
import type { ScamState, ScamTier } from '../game/scams/types';

export interface OpsPanelProps {
  /** Current game resources */
  resources: GameResources;

  /** Map of scam IDs to their runtime state */
  scams: Record<string, ScamState>;

  /** Check if a manager has been hired */
  isManagerHired: (managerId: string) => boolean;

  /** Called when the player hires a manager */
  onHireManager: (managerId: string, cost: number, scamId: string) => void;

  /** Called when the player voluntarily prestiges */
  onPrestige: () => void;

  /** Whether the player has completed at least one prestige (shows Bot Network + Escape Plan) */
  hasPrestiged?: boolean;

  /** Set of tier numbers that are currently collapsed (shared with ScamListPanel) */
  collapsedTiers: Set<ScamTier>;

  /** Called when a tier header is pressed to toggle collapse */
  onToggleTier: (tier: ScamTier) => void;

  /** Test ID for testing */
  testID?: string;
}

type OpsSection = 'bots' | 'managers';

/**
 * Operations center panel that combines bot assignment and manager hiring.
 * Each section has a collapsible header; Escape Plan is always visible.
 */
export function OpsPanel({
  resources,
  scams,
  isManagerHired,
  onHireManager,
  onPrestige,
  hasPrestiged = false,
  collapsedTiers,
  onToggleTier,
  testID,
}: OpsPanelProps): React.ReactElement {
  const [collapsedSections, setCollapsedSections] = useState<Set<OpsSection>>(new Set());

  const toggleSection = (section: OpsSection) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const botsCollapsed = collapsedSections.has('bots');
  const managersCollapsed = collapsedSections.has('managers');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      {/* Bot Network Section (hidden until first prestige) */}
      {hasPrestiged && (
        <>
          <Pressable
            testID="ops-section-bots"
            onPress={() => toggleSection('bots')}
          >
            <TerminalText
              size="md"
              color={COLORS.terminalGreen}
              style={styles.sectionHeader}
            >
              {`${botsCollapsed ? '▶' : '▼'} BOT NETWORK`}
            </TerminalText>
          </Pressable>
          {!botsCollapsed && <BotAssignmentPanel testID="bot-assignment-panel" />}
        </>
      )}

      {/* Managers Section */}
      <Pressable
        testID="ops-section-managers"
        onPress={() => toggleSection('managers')}
      >
        <TerminalText
          size="md"
          color={COLORS.terminalGreen}
          style={styles.sectionHeader}
        >
          {`${managersCollapsed ? '▶' : '▼'} MANAGERS`}
        </TerminalText>
      </Pressable>
      {!managersCollapsed && (
        <ManagerPanel
          resources={resources}
          scams={scams}
          isManagerHired={isManagerHired}
          onHireManager={onHireManager}
          collapsedTiers={collapsedTiers}
          onToggleTier={onToggleTier}
          testID="manager-panel"
        />
      )}

      {/* Escape Plan (hidden until first prestige) */}
      {hasPrestiged && (
        <CRTFrame testID="prestige-section">
          <TerminalText size="md" color={COLORS.terminalGreen}>
            {'ESCAPE PLAN'}
          </TerminalText>
          <TerminalText size="sm" color={COLORS.terminalGreenDim}>
            {'Cash out your trust and start fresh.'}
          </TerminalText>
          <PixelButton
            onPress={onPrestige}
            variant="primary"
            testID="flee-button"
          >
            {'FLEE THE COUNTRY'}
          </PixelButton>
        </CRTFrame>
      )}
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
  sectionHeader: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
});
