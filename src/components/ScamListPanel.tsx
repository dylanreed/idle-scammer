// ABOUTME: Panel component that renders tier-grouped scam cards in a scrollable list
// ABOUTME: Extracts the scam list rendering logic from GameScreen for better separation of concerns

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ScamCard } from './ScamCard';
import { TerminalText } from './TerminalText';
import { COLORS, SPACING } from './theme';
import { TIER_1_SCAMS } from '../game/scams/definitions';
import { TIER_2_SCAMS } from '../game/scams/tier2';
import { TIER_3_SCAMS } from '../game/scams/tier3';
import { TIER_4_SCAMS } from '../game/scams/tier4';
import { TIER_5_SCAMS } from '../game/scams/tier5';
import { isTierAccessible } from '../game/prestige/calculations';
import { isTierFullyUnlocked } from '../game/scams/calculations';
import { getManagerByScamId } from '../game/managers/definitions';
import { useManagerStore } from '../game/managers/managerStore';
import { useEmployeeStore } from '../game/employees/employeeStore';
import { useBotStore } from '../game/bots/botStore';
import { useSkillStore } from '../game/skills/skillStore';
import { getEmployeesByScamId } from '../game/employees/definitions';
import { getEmployeeCostForScam, getMaxEmployeesPerType, getUnlockCostForScam } from '../game/employees/calculations';
import type { ScamTimer } from '../game/engine/types';
import type { ScamState, ScamTier, ScamDefinition } from '../game/scams/types';
import type { GameResources } from '../game/types';

/**
 * Props for the ScamListPanel component
 */
export interface ScamListPanelProps {
  /** Current game resources (money, trust, heat, etc.) */
  resources: GameResources;

  /** Map of scam IDs to their runtime state */
  scams: Record<string, ScamState>;

  /** Map of scam IDs to their active timers */
  timerMap: Record<string, ScamTimer>;

  /** ID of the next scam the player should save toward (always shown even if unaffordable) */
  nextGoalScamId: string | undefined;

  /** Called when the player starts a scam */
  onStart: (scamId: string) => void;

  /** Called when the player unlocks a scam */
  onUnlock: (scamId: string) => void;

  /** Called when the player upgrades a scam */
  onUpgrade: (scamId: string) => void;

  /** Called when the player buys max upgrades for a scam */
  onMaxBuy: (scamId: string) => void;

  /** Called when the player hires an employee */
  onHireEmployee: (employeeId: string, scamId: string) => void;

  /** Set of tier numbers that are currently collapsed */
  collapsedTiers: Set<ScamTier>;

  /** Called when a tier header is pressed to toggle collapse */
  onToggleTier: (tier: ScamTier) => void;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Tier display names shown as section headers
 */
const TIER_NAMES: Record<ScamTier, string> = {
  1: 'SMALL TIME',
  2: 'GETTING SERIOUS',
  3: 'BIG LEAGUES',
  4: 'ORGANIZED CRIME',
  5: 'MASTERMIND',
};

/**
 * Scam arrays grouped by tier for iteration
 */
const SCAMS_BY_TIER: { tier: ScamTier; scams: ScamDefinition[] }[] = [
  { tier: 1, scams: TIER_1_SCAMS },
  { tier: 2, scams: TIER_2_SCAMS },
  { tier: 3, scams: TIER_3_SCAMS },
  { tier: 4, scams: TIER_4_SCAMS },
  { tier: 5, scams: TIER_5_SCAMS },
];

/**
 * Scrollable panel that renders scam cards organized by tier.
 * Filters tiers by accessibility (trust level) and scams by visibility
 * (unlocked, affordable, or next goal).
 * Tier headers are collapsible; tiers are locked until the previous tier is fully unlocked.
 */
export function ScamListPanel({
  resources,
  scams,
  timerMap,
  nextGoalScamId,
  onStart,
  onUnlock,
  onUpgrade,
  onMaxBuy,
  onHireEmployee,
  collapsedTiers,
  onToggleTier,
  testID,
}: ScamListPanelProps): React.ReactElement {
  const isManagerHired = useManagerStore((state) => state.isManagerHired);
  const getScamBotBonuses = useBotStore((state) => state.getScamBotBonuses);

  // Read skill bonuses and active effects for display.
  // Uses getState() to avoid infinite re-render from new-object comparison.
  // Parent component (GameScreen) subscribes to passiveRanks/abilities,
  // so skill changes trigger parent re-render → ScamListPanel re-render → fresh getState().
  const skillBonuses = useSkillStore.getState().getSkillBonuses();
  const activeEffects = useSkillStore.getState().getActiveEffects();

  // Compute display modifiers from skill state
  const skillDurationMultiplier = 1 - skillBonuses.durationReduction;
  const activeSpeedMultiplier = activeEffects.speedMultiplier;
  const skillRewardBase = 1 + skillBonuses.rewardBonus; // Silver Tongue
  const moneyBonus = 1 + skillBonuses.moneyBonus; // Creative Accounting
  const activeRewardMultiplier = activeEffects.rewardMultiplier;
  const skillUpgradeCostDiscount = skillBonuses.upgradeCostDiscount;
  const skillEmployeeCostDiscount = skillBonuses.employeeCostDiscount;
  const activeEmployeeBonusMultiplier = activeEffects.employeeBonusMultiplier;

  return (
    <ScrollView
      style={styles.container}
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      {SCAMS_BY_TIER.map(({ tier, scams: tierScams }) => {
        const accessible = isTierAccessible(tier, resources.trust);
        if (!accessible) return null;

        // Check if the previous tier is fully unlocked (tier 1 is never gated)
        const isLocked = tier > 1 && !isTierFullyUnlocked(tier - 1, scams);

        if (isLocked) {
          // Locked tier: show header with lock icon and message, no scam cards
          return (
            <View key={`tier-${tier}`}>
              <Pressable testID={`tier-header-${tier}`} disabled>
                <TerminalText
                  size="md"
                  color={COLORS.terminalGreenDim}
                  style={styles.sectionTitle}
                >
                  {`🔒 TIER ${tier}: ${TIER_NAMES[tier]}`}
                </TerminalText>
              </Pressable>
              <TerminalText
                size="sm"
                color={COLORS.warningRed}
                style={styles.lockMessage}
              >
                {`UNLOCK ALL TIER ${tier - 1} SCAMS FIRST`}
              </TerminalText>
            </View>
          );
        }

        // Filter visible scams
        const visibleScams = tierScams.filter((scamDef) => {
          const scamState = scams[scamDef.id];
          if (scamState?.isUnlocked) return true;
          const dynamicCost = getUnlockCostForScam(scamDef.id);
          if (dynamicCost === undefined) return true;
          if (resources.money >= dynamicCost) return true;
          return scamDef.id === nextGoalScamId;
        });

        if (visibleScams.length === 0) return null;

        const isCollapsed = collapsedTiers.has(tier);
        const chevron = isCollapsed ? '▶' : '▼';

        return (
          <View key={`tier-${tier}`}>
            {/* Tier Header - Pressable to toggle collapse */}
            <Pressable
              testID={`tier-header-${tier}`}
              onPress={() => onToggleTier(tier)}
              style={styles.tierHeaderRow}
            >
              <TerminalText
                size="md"
                color={COLORS.terminalGreenDim}
                style={styles.sectionTitle}
              >
                {`${chevron} TIER ${tier}: ${TIER_NAMES[tier]}`}
              </TerminalText>
              {!isCollapsed && (
                <TerminalText
                  size="sm"
                  color={COLORS.terminalGreenFaded}
                  style={styles.classifiedStamp}
                >
                  {'// CLASSIFIED'}
                </TerminalText>
              )}
            </Pressable>

            {/* Scam Cards (hidden when collapsed) */}
            {!isCollapsed && visibleScams.map((scamDef) => {
              const manager = getManagerByScamId(scamDef.id);
              const hasManager = manager ? isManagerHired(manager.id) : false;

              // Look up employee for this scam
              const scamEmployees = getEmployeesByScamId(scamDef.id);
              const empDef = scamEmployees.length > 0 ? scamEmployees[0] : undefined;
              const empCount = empDef
                ? useEmployeeStore.getState().getEmployeeCount(empDef.id)
                : 0;
              const rawEmpBonuses = useEmployeeStore.getState().getScamBonuses(scamDef.id);
              const empCost = empDef
                ? getEmployeeCostForScam(scamDef.id, empCount, resources.snitchCount, skillEmployeeCostDiscount)
                : undefined;

              const empMaxCount = getMaxEmployeesPerType(resources.trust);

              // Look up bot bonuses for this scam, amplified by skills
              const rawBotBonuses = getScamBotBonuses(scamDef.id);
              const amplifiedBotSpeed = rawBotBonuses.speedBonus * (1 + skillBonuses.botSpeedAmplifier);
              const amplifiedBotProfit = rawBotBonuses.profitBonus * (1 + skillBonuses.botProfitAmplifier);

              // Amplify employee bonuses with Deep Fake active ability
              const amplifiedEmpSpeed = rawEmpBonuses.speedBonus * activeEmployeeBonusMultiplier;
              const amplifiedEmpReward = rawEmpBonuses.rewardBonus * activeEmployeeBonusMultiplier;

              // Compute reward multiplier from skill bonuses
              const scamRewardMultiplier = skillRewardBase * moneyBonus;

              return (
                <ScamCard
                  key={scamDef.id}
                  scamDefinition={scamDef}
                  scamState={scams[scamDef.id]}
                  timer={timerMap[scamDef.id]}
                  trust={resources.trust}
                  money={resources.money}
                  hasManager={hasManager}
                  onStart={() => onStart(scamDef.id)}
                  onUnlock={() => onUnlock(scamDef.id)}
                  onUpgrade={() => onUpgrade(scamDef.id)}
                  onMaxBuy={() => onMaxBuy(scamDef.id)}
                  employeeDefinition={empDef}
                  employeeCount={empCount}
                  employeeMaxCount={empMaxCount}
                  employeeSpeedBonus={amplifiedEmpSpeed}
                  employeeRewardBonus={amplifiedEmpReward}
                  botSpeedBonus={amplifiedBotSpeed}
                  botProfitBonus={amplifiedBotProfit}
                  onHireEmployee={
                    empDef ? () => onHireEmployee(empDef.id, scamDef.id) : undefined
                  }
                  employeeHireCost={empCost}
                  unlockCost={getUnlockCostForScam(scamDef.id)}
                  skillDurationMultiplier={skillDurationMultiplier}
                  activeSpeedMultiplier={activeSpeedMultiplier}
                  skillRewardMultiplier={scamRewardMultiplier}
                  activeRewardMultiplier={activeRewardMultiplier}
                  skillUpgradeCostDiscount={skillUpgradeCostDiscount}
                  testID={`scam-card-${scamDef.id}`}
                />
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tierHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
  },
  classifiedStamp: {
    marginLeft: SPACING.sm,
    letterSpacing: 3,
  },
  lockMessage: {
    marginBottom: SPACING.md,
    marginLeft: SPACING.md,
  },
});
