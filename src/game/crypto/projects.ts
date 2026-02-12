// ABOUTME: Investment project helper functions for rug pull checks and return calculations
// ABOUTME: Standalone pure functions used by the crypto store for project mechanics

import type { ProjectDefinition, ProjectState } from './types';
import { PROJECT_DEFINITIONS } from './constants';
import { nextSeed, seedToRandom } from './market';

/**
 * Determines if a project is rug-pulled based on PRNG seed and definition.
 * Called at investment time — result is baked into ProjectState.
 *
 * @param definition - The project definition with rug chance
 * @param seed - Current PRNG seed
 * @returns [isRugged, nextSeed] tuple
 */
export function checkRugPull(definition: ProjectDefinition, seed: number): [boolean, number] {
  const s = nextSeed(seed);
  const roll = seedToRandom(s);
  return [roll < definition.rugChance, s];
}

/**
 * Calculates the return multiplier for a project based on PRNG seed.
 * If the project is rugged, always returns 0.
 *
 * @param definition - The project definition with min/max return
 * @param isRugged - Whether the project was rug-pulled
 * @param seed - Current PRNG seed
 * @returns [returnMultiplier, nextSeed] tuple
 */
export function calculateReturn(
  definition: ProjectDefinition,
  isRugged: boolean,
  seed: number
): [number, number] {
  const s = nextSeed(seed);
  if (isRugged) return [0, s];

  const roll = seedToRandom(s);
  const multiplier = definition.minReturn + roll * (definition.maxReturn - definition.minReturn);
  return [multiplier, s];
}

/**
 * Checks if a project has matured based on its start time and definition duration.
 *
 * @param project - The active project state
 * @param now - Current timestamp in ms (defaults to Date.now())
 * @returns true if the project has reached its maturation time
 */
export function isProjectMatured(project: ProjectState, now: number = Date.now()): boolean {
  const definition = PROJECT_DEFINITIONS.find((p) => p.id === project.definitionId);
  if (!definition) return false;
  return now >= project.startedAt + definition.durationMs;
}

/**
 * Calculates the crypto payout for a completed project.
 *
 * @param project - The project state
 * @returns Crypto payout (0 if rugged, investedAmount * returnMultiplier otherwise)
 */
export function calculatePayout(project: ProjectState): number {
  if (project.isRugged) return 0;
  return project.investedAmount * project.returnMultiplier;
}

/**
 * Looks up a project definition by ID.
 *
 * @param definitionId - Project definition ID
 * @returns The definition, or undefined if not found
 */
export function getProjectDefinition(definitionId: string): ProjectDefinition | undefined {
  return PROJECT_DEFINITIONS.find((p) => p.id === definitionId);
}
