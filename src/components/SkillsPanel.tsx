// ABOUTME: Skills panel UI showing passive skill tree and active abilities
// ABOUTME: Displays SP counter, collapsible category sections, skill rank buttons, and ability cards

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { CRTFrame } from './CRTFrame';
import { TerminalText } from './TerminalText';
import { PixelButton } from './PixelButton';
import { COLORS, SPACING } from './theme';
import {
  SKILLS_BY_CATEGORY,
  CATEGORY_NAMES,
  CATEGORY_DESCRIPTIONS,
} from '../game/skills/definitions';
import { ALL_ACTIVE_ABILITIES } from '../game/skills/abilities';
import { getSkillRankCost } from '../game/skills/calculations';
import { useSkillStore } from '../game/skills/skillStore';
import type { SkillCategory, PassiveSkillDefinition, ActiveAbilityDefinition } from '../game/skills/types';

export interface SkillsPanelProps {
  /** Available skill points */
  skillPoints: number;

  /** Current passive skill ranks (skill ID -> rank) */
  passiveRanks: Record<string, number>;

  /** Map of ability ID -> { isUnlocked, cooldownRemainingMs, activeRemainingMs } */
  abilities: Record<string, {
    isUnlocked: boolean;
    cooldownRemainingMs: number;
    activeRemainingMs: number;
  }>;

  /** Called when player allocates a skill rank */
  onAllocateSkill: (skillId: string) => void;

  /** Called when player unlocks an ability */
  onUnlockAbility: (abilityId: string) => void;

  /** Called when player activates an ability */
  onActivateAbility: (abilityId: string) => void;

  /** Test ID for testing */
  testID?: string;
}

const CATEGORIES: SkillCategory[] = ['tech', 'social', 'finance', 'stealth'];

/**
 * Skills panel with collapsible passive categories and active abilities.
 */
export function SkillsPanel({
  skillPoints,
  passiveRanks,
  abilities,
  onAllocateSkill,
  onUnlockAbility,
  onActivateAbility,
  testID,
}: SkillsPanelProps): React.ReactElement {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<SkillCategory>>(new Set());
  const [abilitiesCollapsed, setAbilitiesCollapsed] = useState(false);

  const toggleCategory = (cat: SkillCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      {/* SP Counter */}
      <CRTFrame style={styles.spCounter} testID="sp-counter">
        <TerminalText size="sm" color={COLORS.gold}>
          {'SKILL POINTS'}
        </TerminalText>
        <TerminalText size="lg" color={COLORS.gold} testID="sp-value">
          {String(skillPoints)}
        </TerminalText>
      </CRTFrame>

      {/* Passive Skills by Category */}
      {CATEGORIES.map((category) => {
        const skills = SKILLS_BY_CATEGORY[category];
        const isCollapsed = collapsedCategories.has(category);

        return (
          <View key={category} style={styles.categorySection}>
            <Pressable
              onPress={() => toggleCategory(category)}
              style={styles.categoryHeader}
              testID={`category-${category}`}
            >
              <TerminalText size="md" color={COLORS.terminalGreen}>
                {`${isCollapsed ? '>' : 'v'} ${CATEGORY_NAMES[category]}`}
              </TerminalText>
              <TerminalText size="sm" color={COLORS.textDim}>
                {CATEGORY_DESCRIPTIONS[category]}
              </TerminalText>
            </Pressable>

            {!isCollapsed && (
              <View style={styles.skillList}>
                {skills.map((skill) => (
                  <PassiveSkillRow
                    key={skill.id}
                    skill={skill}
                    currentRank={passiveRanks[skill.id] ?? 0}
                    skillPoints={skillPoints}
                    onAllocate={onAllocateSkill}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Active Abilities */}
      <View style={styles.categorySection}>
        <Pressable
          onPress={() => setAbilitiesCollapsed(!abilitiesCollapsed)}
          style={styles.categoryHeader}
          testID="category-abilities"
        >
          <TerminalText size="md" color={COLORS.hotPink}>
            {`${abilitiesCollapsed ? '>' : 'v'} ABILITIES`}
          </TerminalText>
          <TerminalText size="sm" color={COLORS.textDim}>
            {'Activated Powers'}
          </TerminalText>
        </Pressable>

        {!abilitiesCollapsed && (
          <View style={styles.skillList}>
            {ALL_ACTIVE_ABILITIES.map((ability) => (
              <ActiveAbilityRow
                key={ability.id}
                ability={ability}
                state={abilities[ability.id]}
                skillPoints={skillPoints}
                onUnlock={onUnlockAbility}
                onActivate={onActivateAbility}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/**
 * Single passive skill row with rank indicator and upgrade button.
 */
function PassiveSkillRow({
  skill,
  currentRank,
  skillPoints,
  onAllocate,
}: {
  skill: PassiveSkillDefinition;
  currentRank: number;
  skillPoints: number;
  onAllocate: (skillId: string) => void;
}): React.ReactElement {
  const nextRank = currentRank + 1;
  const isMaxed = currentRank >= skill.maxRank;
  const cost = isMaxed ? 0 : getSkillRankCost(nextRank);
  const canAfford = skillPoints >= cost && !isMaxed;

  // Build rank dots: filled for purchased, empty for available
  const rankDots = Array.from({ length: skill.maxRank }, (_, i) =>
    i < currentRank ? '\u25C6' : '\u25C7'  // ◆ filled, ◇ empty
  ).join('');

  // Current effect value (or next rank preview)
  const currentValue = currentRank > 0
    ? skill.ranks[currentRank - 1]
    : 0;
  const nextValue = !isMaxed ? skill.ranks[nextRank - 1] : currentValue;

  return (
    <CRTFrame style={styles.skillRow} testID={`skill-${skill.id}`}>
      <View style={styles.skillInfo}>
        <TerminalText size="sm" color={COLORS.terminalGreen}>
          {skill.name}
        </TerminalText>
        <TerminalText size="sm" color={COLORS.textDim}>
          {rankDots}
        </TerminalText>
        <TerminalText size="sm" color={COLORS.textDim}>
          {skill.description}
        </TerminalText>
        {currentRank > 0 && (
          <TerminalText size="sm" color={COLORS.terminalGreenDim}>
            {formatEffectValue(skill.id, currentValue)}
          </TerminalText>
        )}
      </View>
      {!isMaxed && (
        <PixelButton
          onPress={() => onAllocate(skill.id)}
          variant={canAfford ? 'primary' : 'secondary'}
          disabled={!canAfford}
          style={styles.skillButton}
          testID={`allocate-${skill.id}`}
        >
          {`${cost} SP`}
        </PixelButton>
      )}
      {isMaxed && (
        <TerminalText size="sm" color={COLORS.gold} style={styles.maxLabel}>
          {'MAX'}
        </TerminalText>
      )}
    </CRTFrame>
  );
}

/**
 * Single active ability row with unlock/activate button and cooldown display.
 */
function ActiveAbilityRow({
  ability,
  state,
  skillPoints,
  onUnlock,
  onActivate,
}: {
  ability: ActiveAbilityDefinition;
  state: { isUnlocked: boolean; cooldownRemainingMs: number; activeRemainingMs: number } | undefined;
  skillPoints: number;
  onUnlock: (abilityId: string) => void;
  onActivate: (abilityId: string) => void;
}): React.ReactElement {
  const isUnlocked = state?.isUnlocked ?? false;
  const cooldownMs = state?.cooldownRemainingMs ?? 0;
  const activeMs = state?.activeRemainingMs ?? 0;
  const isOnCooldown = cooldownMs > 0;
  const isActive = activeMs > 0;
  const canUnlock = !isUnlocked && skillPoints >= ability.cost;
  const currentActivationCost = useSkillStore.getState().getActivationCost(ability.id);
  const canAffordActivation = skillPoints >= currentActivationCost;
  const canActivate = isUnlocked && !isOnCooldown && !isActive && canAffordActivation;

  return (
    <CRTFrame style={styles.skillRow} testID={`ability-${ability.id}`}>
      <View style={styles.skillInfo}>
        <TerminalText size="sm" color={COLORS.hotPink}>
          {ability.name}
        </TerminalText>
        <TerminalText size="sm" color={COLORS.textDim}>
          {ability.description}
        </TerminalText>
        {isActive && (
          <TerminalText size="sm" color={COLORS.gold}>
            {`ACTIVE: ${formatTimeMs(activeMs)}`}
          </TerminalText>
        )}
        {isOnCooldown && !isActive && (
          <TerminalText size="sm" color={COLORS.textDim}>
            {`CD: ${formatTimeMs(cooldownMs)}`}
          </TerminalText>
        )}
      </View>
      {!isUnlocked && (
        <PixelButton
          onPress={() => onUnlock(ability.id)}
          variant={canUnlock ? 'primary' : 'secondary'}
          disabled={!canUnlock}
          style={styles.skillButton}
          testID={`unlock-${ability.id}`}
        >
          {`${ability.cost} SP`}
        </PixelButton>
      )}
      {isUnlocked && (
        <PixelButton
          onPress={() => onActivate(ability.id)}
          variant={canActivate ? 'primary' : 'secondary'}
          disabled={!canActivate}
          style={styles.skillButton}
          testID={`activate-${ability.id}`}
        >
          {canActivate || (!isOnCooldown && !isActive) ? `${currentActivationCost} SP` : isActive ? 'ON' : formatTimeMs(cooldownMs)}
        </PixelButton>
      )}
    </CRTFrame>
  );
}

/**
 * Format a skill effect value for display based on skill type.
 */
function formatEffectValue(skillId: string, value: number): string {
  // Compound Interest is absolute $/sec
  if (skillId === 'compound-interest') {
    return `$${value}/s`;
  }
  // Ghost Protocol is flat +threshold
  if (skillId === 'ghost-protocol') {
    return `+${value} max heat`;
  }
  // Everything else is a percentage
  return `${Math.round(value * 100)}%`;
}

/**
 * Format milliseconds as compact time string (e.g., "2:30" or "45s").
 */
function formatTimeMs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${totalSeconds}s`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  spCounter: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  categorySection: {
    gap: SPACING.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  skillList: {
    gap: SPACING.xs,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  skillInfo: {
    flex: 1,
    gap: 2,
  },
  skillButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    minWidth: 60,
  },
  maxLabel: {
    paddingHorizontal: SPACING.sm,
  },
});
