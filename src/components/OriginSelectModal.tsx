// ABOUTME: Origin backstory selection modal with three choosable origin cards
// ABOUTME: Pixel art styled full-screen overlay shown at game start before gameplay begins

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { TerminalText } from './TerminalText';
import { PixelButton } from './PixelButton';
import { COLORS, SPACING, BORDER_RADIUS } from './theme';
import { ORIGINS } from '../game/origin/constants';
import type { OriginId, OriginDefinition } from '../game/origin/types';
import { triggerHaptic } from '../utils/haptics';

export interface OriginSelectModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when the player confirms their origin choice */
  onSelect: (originId: OriginId) => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Accent colors for each origin card to give visual variety.
 */
const ORIGIN_ACCENT: Record<OriginId, string> = {
  'moms-basement': COLORS.accent,
  'internet-cafe': COLORS.secondary,
  'stolen-phone': COLORS.gold,
};

/**
 * Full-screen modal for selecting a backstory origin.
 * Displays three chunky cards with name, flavor text, and bonus description.
 * Player must select one and confirm with CHOOSE button.
 */
export function OriginSelectModal({
  visible,
  onSelect,
  testID,
}: OriginSelectModalProps): React.ReactElement | null {
  const [selectedId, setSelectedId] = useState<OriginId | null>(null);

  if (!visible) return null;

  const handleCardPress = (id: OriginId) => {
    setSelectedId(id);
    triggerHaptic('light');
  };

  const handleChoose = () => {
    if (selectedId) {
      triggerHaptic('heavy');
      onSelect(selectedId);
    }
  };

  return (
    <View style={styles.overlay} testID={testID ?? 'origin-select-modal'}>
      <View style={styles.content}>
        <TerminalText size="lg" color={COLORS.primary}>
          {'WHERE IT ALL BEGAN'}
        </TerminalText>

        <View style={styles.cardsContainer}>
          {(Object.values(ORIGINS) as OriginDefinition[]).map((origin) => {
            const isSelected = selectedId === origin.id;
            const accent = ORIGIN_ACCENT[origin.id];
            return (
              <Pressable
                key={origin.id}
                testID={`origin-card-${origin.id}`}
                onPress={() => handleCardPress(origin.id)}
                style={[
                  styles.card,
                  { borderColor: isSelected ? accent : COLORS.border },
                  isSelected && { borderWidth: 4 },
                ]}
              >
                <TerminalText size="md" color={accent} style={styles.cardName}>
                  {origin.name}
                </TerminalText>
                <TerminalText size="sm" color={COLORS.textSecondary} style={styles.cardDesc}>
                  {origin.description}
                </TerminalText>
                <View style={[styles.bonusBadge, { backgroundColor: accent + '33' }]}>
                  <TerminalText size="sm" color={accent}>
                    {origin.bonusDescription}
                  </TerminalText>
                </View>
              </Pressable>
            );
          })}
        </View>

        <PixelButton
          onPress={handleChoose}
          disabled={selectedId === null}
          variant="primary"
          style={styles.chooseButton}
          testID="origin-choose-btn"
        >
          {'CHOOSE'}
        </PixelButton>
      </View>
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
    backgroundColor: 'rgba(26, 26, 46, 0.97)',
    zIndex: 100,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  content: {
    maxHeight: '90%',
    alignItems: 'center',
  },
  cardsContainer: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 3,
    borderColor: COLORS.border,
    borderStyle: 'solid',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  cardName: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    marginBottom: SPACING.sm,
  },
  bonusBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  chooseButton: {
    marginTop: SPACING.lg,
    minWidth: 200,
  },
});
