// ABOUTME: Type definitions and constants for the tutorial/progressive disclosure system
// ABOUTME: Defines TutorialSaveData interface and tutorial ID constants

/**
 * Save data structure for tutorial state.
 * Persists across sessions via the save system.
 */
export interface TutorialSaveData {
  /** Whether the player has ever completed a prestige */
  hasPrestiged: boolean;
  /** Array of tutorial modal IDs that have been shown and dismissed */
  seen: string[];
}

/**
 * Tutorial modal IDs for the post-first-prestige introduction sequence.
 */
export const TUTORIAL_IDS = {
  TRUST_INTRO: 'trust-intro',
  BOTS_INTRO: 'bots-intro',
  SKILL_POINTS_INTRO: 'skill-points-intro',
} as const;

/**
 * Ordered sequence of tutorial modals shown after first prestige.
 */
export const TUTORIAL_SEQUENCE = [
  TUTORIAL_IDS.TRUST_INTRO,
  TUTORIAL_IDS.BOTS_INTRO,
  TUTORIAL_IDS.SKILL_POINTS_INTRO,
] as const;

/**
 * Default tutorial save data for new games.
 */
export const DEFAULT_TUTORIAL_SAVE_DATA: TutorialSaveData = {
  hasPrestiged: false,
  seen: [],
};
