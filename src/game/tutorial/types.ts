// ABOUTME: Type definitions and constants for the tutorial/progressive disclosure system
// ABOUTME: Defines TutorialSaveData interface and tutorial ID constants

/**
 * Save data structure for tutorial state.
 * Persists across sessions via the save system.
 */
export interface TutorialSaveData {
  /** Whether the player has ever completed a prestige (derived from prestigeCount >= 1) */
  hasPrestiged: boolean;
  /** Array of tutorial modal IDs that have been shown and dismissed */
  seen: string[];
  /** How many times the player has prestiged (gates progressive unlocks) */
  prestigeCount: number;
}

/**
 * Tutorial modal IDs for post-prestige introduction sequences.
 */
export const TUTORIAL_IDS = {
  TRUST_INTRO: 'trust-intro',
  BOTS_INTRO: 'bots-intro',
  SKILL_POINTS_INTRO: 'skill-points-intro',
  CRYPTO_INTRO: 'crypto-intro',
  SKILL_ABILITIES_INTRO: 'skill-abilities-intro',
  PASSIVE_SKILLS_INTRO: 'passive-skills-intro',
} as const;

/**
 * Ordered sequences of tutorial modals shown after each prestige milestone.
 * Key = prestige count at which the sequence triggers.
 */
export const PRESTIGE_TUTORIAL_SEQUENCES: Record<number, readonly string[]> = {
  1: [TUTORIAL_IDS.TRUST_INTRO, TUTORIAL_IDS.BOTS_INTRO],
  2: [TUTORIAL_IDS.SKILL_ABILITIES_INTRO],
  3: [TUTORIAL_IDS.PASSIVE_SKILLS_INTRO],
} as const;

/**
 * Ordered sequence of tutorial modals shown after first prestige.
 * @deprecated Use PRESTIGE_TUTORIAL_SEQUENCES[1] instead.
 */
export const TUTORIAL_SEQUENCE = PRESTIGE_TUTORIAL_SEQUENCES[1];

/**
 * Default tutorial save data for new games.
 */
export const DEFAULT_TUTORIAL_SAVE_DATA: TutorialSaveData = {
  hasPrestiged: false,
  seen: [],
  prestigeCount: 0,
};
