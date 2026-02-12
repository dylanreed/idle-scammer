// ABOUTME: Dismissable tutorial modal shown after first prestige to introduce game systems
// ABOUTME: Hacker-themed dark panel with green terminal text and CONTINUE button

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CRTFrame } from './CRTFrame';
import { PixelButton } from './PixelButton';
import { TerminalText } from './TerminalText';
import { COLORS, SPACING } from './theme';

export interface TutorialModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Tutorial title (e.g., "TRUST — Your Criminal Rep") */
  title: string;
  /** Array of body text paragraphs */
  body: string[];
  /** Called when the player dismisses this modal */
  onContinue: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Full-screen overlay that introduces a game system via terminal-styled text.
 * Used in a sequence after first prestige to explain Trust, Bots, and Skill Points.
 */
export function TutorialModal({
  visible,
  title,
  body,
  onContinue,
  testID,
}: TutorialModalProps): React.ReactElement | null {
  if (!visible) return null;

  return (
    <View style={styles.overlay} testID={testID ?? 'tutorial-modal'}>
      <CRTFrame style={styles.content}>
        <TerminalText size="lg" color={COLORS.terminalGreen} animate>
          {title}
        </TerminalText>

        <View style={styles.bodyContainer}>
          {body.map((paragraph, index) => (
            <TerminalText
              key={index}
              size="sm"
              color={COLORS.terminalGreenDim}
              style={styles.paragraph}
            >
              {paragraph}
            </TerminalText>
          ))}
        </View>

        <PixelButton
          onPress={onContinue}
          variant="primary"
          style={styles.continueButton}
          testID="tutorial-continue-btn"
        >
          {'CONTINUE'}
        </PixelButton>
      </CRTFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 10, 0.95)',
    zIndex: 100,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  content: {
    maxHeight: '80%',
  },
  bodyContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  paragraph: {
    marginBottom: SPACING.sm,
  },
  continueButton: {
    marginTop: SPACING.md,
  },
});
