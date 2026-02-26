// ABOUTME: Small "?" button that triggers context-sensitive help modals
// ABOUTME: Renders inline next to section headers with cyan accent styling

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { TerminalText } from './TerminalText';
import { COLORS } from './theme';

export interface HelpIconProps {
  /** Help topic key to pass back on press */
  topicKey: string;
  /** Called with the topic key when the icon is pressed */
  onPress: (topicKey: string) => void;
}

/**
 * Compact "?" button that opens a help modal for the given topic.
 * Designed to sit inline next to section headers without disrupting layout.
 */
export function HelpIcon({ topicKey, onPress }: HelpIconProps): React.ReactElement {
  return (
    <Pressable
      onPress={() => onPress(topicKey)}
      style={styles.container}
      testID={`help-icon-${topicKey}`}
      hitSlop={8}
    >
      <TerminalText size="sm" color={COLORS.accent}>
        {'?'}
      </TerminalText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
