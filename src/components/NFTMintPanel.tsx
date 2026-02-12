// ABOUTME: Panel for creating new NFT collections
// ABOUTME: Provides collection name input and create button with max collections display

import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { TerminalText } from './TerminalText';
import { PixelButton } from './PixelButton';
import { COLORS, SPACING } from './theme';
import { MAX_COLLECTIONS } from '../game/crypto/constants';

export interface NFTMintPanelProps {
  /** Current number of collections */
  collectionCount: number;
  /** Called when player creates a new collection */
  onCreate: (name: string) => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Panel for creating new NFT collections.
 */
export function NFTMintPanel({
  collectionCount,
  onCreate,
  testID,
}: NFTMintPanelProps): React.ReactElement {
  const [name, setName] = useState('');
  const canCreate = name.trim().length > 0 && collectionCount < MAX_COLLECTIONS;

  return (
    <View style={styles.container} testID={testID}>
      <TerminalText size="sm" color={COLORS.terminalGreen}>
        {`CREATE COLLECTION (${collectionCount}/${MAX_COLLECTIONS})`}
      </TerminalText>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Collection name..."
          placeholderTextColor={COLORS.terminalGreenDim}
          maxLength={30}
          testID="collection-name-input"
        />
        <PixelButton
          onPress={() => {
            if (canCreate) {
              onCreate(name.trim());
              setName('');
            }
          }}
          disabled={!canCreate}
          variant="primary"
          testID="create-collection-btn"
        >
          {'CREATE'}
        </PixelButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.terminalGreen,
    color: COLORS.terminalGreen,
    fontFamily: 'monospace',
    fontSize: 14,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
  },
});
