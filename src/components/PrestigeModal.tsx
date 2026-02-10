// ABOUTME: Two-phase prestige modal overlay for the flee-the-country mechanic
// ABOUTME: Shows choice (Clean Escape vs Snitch) then result with trust change and bonuses

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CRTFrame } from './CRTFrame';
import { PixelButton } from './PixelButton';
import { TerminalText } from './TerminalText';
import { COLORS, SPACING, FONT_SIZES } from './theme';
import { formatNumber } from '../utils/formatters';
import { calculateStartingSkillPoints } from '../game/prestige/calculations';
import type { GameResources } from '../game/types';
import type { PrestigeResult } from '../game/prestige/types';

export interface PrestigeModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Current phase: choice or result */
  phase: 'choice' | 'result';
  /** Current game resources (shown in choice phase) */
  resources: GameResources;
  /** Prestige result (shown in result phase) */
  result?: PrestigeResult;
  /** Called when the player picks an escape route */
  onChoose: (choice: 'clean-escape' | 'snitch') => void;
  /** Called when the player dismisses the result screen */
  onContinue: () => void;
}

/**
 * Bonus type labels for display
 */
const BONUS_TYPE_LABELS: Record<string, string> = {
  money: 'Money',
  bots: 'Bots',
  reputation: 'Reputation',
  crypto: 'Crypto',
  'skill-points': 'Skill Points',
};

/**
 * Full-screen overlay that appears when heat hits max.
 * Phase 1 (choice): player picks Clean Escape or Snitch.
 * Phase 2 (result): shows trust change, bonuses kept, and CONTINUE.
 */
export function PrestigeModal({
  visible,
  phase,
  resources,
  result,
  onChoose,
  onContinue,
}: PrestigeModalProps): React.ReactElement | null {
  if (!visible) return null;

  return (
    <View style={styles.overlay} testID="prestige-modal">
      <CRTFrame style={styles.content}>
        {phase === 'choice' ? (
          <ChoicePhase resources={resources} onChoose={onChoose} />
        ) : (
          <ResultPhase result={result} onContinue={onContinue} />
        )}
      </CRTFrame>
    </View>
  );
}

/**
 * Choice phase: player decides how to flee
 */
function ChoicePhase({
  resources,
  onChoose,
}: {
  resources: GameResources;
  onChoose: (choice: 'clean-escape' | 'snitch') => void;
}): React.ReactElement {
  return (
    <View>
      {/* Header */}
      <TerminalText size="lg" color={COLORS.warningRed} animate>
        {'HEAT CRITICAL'}
      </TerminalText>
      <TerminalText size="sm" color={COLORS.terminalGreenDim} style={styles.subtext}>
        {'The feds are closing in. Choose your exit strategy.'}
      </TerminalText>

      {/* Current resource summary */}
      <View style={styles.resourceSummary} testID="prestige-resource-summary">
        <TerminalText size="sm" color={COLORS.terminalGreenDim}>
          {`Money: $${formatNumber(resources.money)}`}
        </TerminalText>
        <TerminalText size="sm" color={COLORS.terminalGreenDim}>
          {`Bots: ${formatNumber(resources.bots)}`}
        </TerminalText>
        <TerminalText size="sm" color={COLORS.terminalGreenDim}>
          {`Reputation: ${formatNumber(resources.reputation)}`}
        </TerminalText>
        <TerminalText size="sm" color={COLORS.terminalGreenDim}>
          {`Crypto: ${formatNumber(resources.crypto)}`}
        </TerminalText>
        <TerminalText size="sm" color={COLORS.trustBlue}>
          {`Trust: ${resources.trust}`}
        </TerminalText>
      </View>

      {/* Choice buttons */}
      <View style={styles.buttonRow}>
        <View style={styles.choiceContainer}>
          <PixelButton
            onPress={() => onChoose('clean-escape')}
            variant="primary"
            testID="prestige-clean-escape-btn"
          >
            {'CLEAN ESCAPE'}
          </PixelButton>
          <TerminalText size="sm" color={COLORS.terminalGreenDim} style={styles.choiceSubtext}>
            {'+10 Trust / Lose Everything'}
          </TerminalText>
        </View>

        <View style={styles.choiceContainer}>
          <PixelButton
            onPress={() => onChoose('snitch')}
            variant="danger"
            testID="prestige-snitch-btn"
          >
            {'SNITCH'}
          </PixelButton>
          <TerminalText size="sm" color={COLORS.terminalGreenDim} style={styles.choiceSubtext}>
            {'-5 Trust / Keep 10% Resources'}
          </TerminalText>
        </View>
      </View>
    </View>
  );
}

/**
 * Result phase: shows what happened and lets player continue
 */
function ResultPhase({
  result,
  onContinue,
}: {
  result?: PrestigeResult;
  onContinue: () => void;
}): React.ReactElement {
  if (!result) {
    return (
      <View>
        <TerminalText size="md" color={COLORS.warningRed}>
          {'ERROR: No result data'}
        </TerminalText>
      </View>
    );
  }

  const isCleanEscape = result.choice === 'clean-escape';
  const headerText = isCleanEscape ? 'YOU GOT AWAY CLEAN' : 'YOU RATTED THEM OUT';
  const headerColor = isCleanEscape ? COLORS.terminalGreen : COLORS.warningRed;
  const startingSP = calculateStartingSkillPoints(result.newTrust);

  return (
    <View>
      {/* Header */}
      <TerminalText size="lg" color={headerColor} animate>
        {headerText}
      </TerminalText>

      {/* Trust change */}
      <TerminalText size="md" color={COLORS.trustBlue} style={styles.trustChange}>
        {`Trust: ${result.previousTrust} → ${result.newTrust}`}
      </TerminalText>

      {/* Starting skill points for next run */}
      <TerminalText size="sm" color={COLORS.gold} style={styles.skillPoints}>
        {`Starting Skill Points: ${startingSP}`}
      </TerminalText>

      {/* Clean escape: reset message */}
      {isCleanEscape && (
        <TerminalText size="sm" color={COLORS.terminalGreenDim} style={styles.resetMessage}>
          {'ALL RESOURCES RESET'}
        </TerminalText>
      )}

      {/* Snitch: bonuses kept */}
      {!isCleanEscape && result.bonuses && result.bonuses.length > 0 && (
        <View style={styles.bonusList} testID="prestige-bonuses">
          <TerminalText size="sm" color={COLORS.terminalGreenDim} style={styles.bonusHeader}>
            {'Resources kept:'}
          </TerminalText>
          {result.bonuses
            .filter((bonus) => bonus.amount > 0)
            .map((bonus) => (
              <TerminalText
                key={bonus.type}
                size="sm"
                color={COLORS.terminalGreenDim}
              >
                {`  ${BONUS_TYPE_LABELS[bonus.type] ?? bonus.type}: ${formatNumber(bonus.amount)}`}
              </TerminalText>
            ))}
        </View>
      )}

      {/* Continue button */}
      <PixelButton
        onPress={onContinue}
        variant="gold"
        style={styles.continueButton}
        testID="prestige-continue-btn"
      >
        {'CONTINUE'}
      </PixelButton>
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
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    zIndex: 100,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  content: {
    maxHeight: '90%',
  },
  subtext: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  resourceSummary: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderDim,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  choiceContainer: {
    flex: 1,
    alignItems: 'center',
  },
  choiceSubtext: {
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  trustChange: {
    marginTop: SPACING.md,
  },
  skillPoints: {
    marginTop: SPACING.sm,
  },
  resetMessage: {
    marginTop: SPACING.md,
  },
  bonusList: {
    marginTop: SPACING.md,
  },
  bonusHeader: {
    marginBottom: SPACING.xs,
  },
  continueButton: {
    marginTop: SPACING.lg,
  },
});
