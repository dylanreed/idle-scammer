// ABOUTME: Calculation functions for employee costs and bonuses
// ABOUTME: Implements exponential cost scaling and linear bonus accumulation

import type { EmployeeDefinition, EmployeeState } from './types';
import { ALL_SCAMS } from '../scams/definitions';
import { getManagerByScamId } from '../managers/definitions';
import { SNITCH_EMPLOYEE_COST_PENALTY } from '../prestige/constants';

/**
 * Exponential growth rate for employee costs.
 * 1.15 means each additional employee costs ~15% more than the previous.
 */
const EMPLOYEE_COST_GROWTH_RATE = 1.15;

/**
 * Number of seconds of cumulative income the first employee should cost.
 * At each scam's position, the employee baseCost equals ~60 seconds of the
 * player's expected income from all money-producing scams up to that point.
 */
export const TARGET_SECONDS = 60;

/**
 * Floor for employee cost — ensures even non-money scams have a non-trivial cost.
 */
export const MINIMUM_EMPLOYEE_COST = 10;

/**
 * Number of seconds of cumulative income an unlock should cost.
 * Unlock = 30s of income → a meaningful but not grindy gate.
 */
export const UNLOCK_TARGET_SECONDS = 30;

/**
 * Floor for unlock costs — ensures every paid scam has a non-trivial unlock cost.
 */
export const MINIMUM_UNLOCK_COST = 10;

/**
 * Number of seconds of cumulative income a manager should cost.
 * Manager = 2 minutes of income → a significant investment that pays off over time.
 */
export const MANAGER_TARGET_SECONDS = 120;

/**
 * Floor for manager costs — ensures even the earliest manager has a non-trivial cost.
 */
export const MINIMUM_MANAGER_COST = 50;

/** Memoized map of scamId → baseCost built from ALL_SCAMS progression order. */
let employeeCostCache: Map<string, number> | null = null;

/** Memoized map of scamId → unlockCost (undefined for free scams). */
let unlockCostCache: Map<string, number | undefined> | null = null;

/** Memoized map of scamId → managerCost. */
let managerCostCache: Map<string, number> | null = null;

/**
 * Walks ALL_SCAMS in order, accumulating the base income/sec of money-producing
 * scams and computing all three cost types in a single pass:
 * - Employee baseCost = max(MINIMUM_EMPLOYEE_COST, floor(TARGET_SECONDS × cumulative))
 * - Unlock cost = undefined for free scams, otherwise max(static, floor(UNLOCK_TARGET_SECONDS × cumulative))
 * - Manager cost = max(static, floor(MANAGER_TARGET_SECONDS × cumulative))
 */
function buildAllCostCaches(): void {
  const empCache = new Map<string, number>();
  const unlCache = new Map<string, number | undefined>();
  const mgrCache = new Map<string, number>();
  let cumulativeMoneyPerSec = 0;

  for (const scam of ALL_SCAMS) {
    if (scam.resourceType === 'money') {
      const incomePerSec = scam.baseReward / (scam.baseDuration / 1000);
      cumulativeMoneyPerSec += incomePerSec;
    }

    // Employee cost (existing logic)
    const baseCost = Math.max(
      MINIMUM_EMPLOYEE_COST,
      Math.floor(TARGET_SECONDS * cumulativeMoneyPerSec)
    );
    empCache.set(scam.id, baseCost);

    // Unlock cost: free scams stay free, otherwise max(static, dynamic_floor)
    if (scam.unlockCost === undefined) {
      unlCache.set(scam.id, undefined);
    } else {
      const dynamicFloor = Math.floor(UNLOCK_TARGET_SECONDS * cumulativeMoneyPerSec);
      unlCache.set(scam.id, Math.max(scam.unlockCost, dynamicFloor));
    }

    // Manager cost: max(static, dynamic_floor)
    const manager = getManagerByScamId(scam.id);
    const staticManagerCost = manager?.cost ?? 0;
    const dynamicManagerFloor = Math.floor(MANAGER_TARGET_SECONDS * cumulativeMoneyPerSec);
    mgrCache.set(scam.id, Math.max(MINIMUM_MANAGER_COST, staticManagerCost, dynamicManagerFloor));
  }

  employeeCostCache = empCache;
  unlockCostCache = unlCache;
  managerCostCache = mgrCache;
}

/** Ensures all cost caches are built. */
function ensureCaches(): void {
  if (!employeeCostCache || !unlockCostCache || !managerCostCache) {
    buildAllCostCaches();
  }
}

/**
 * Returns the base (first-hire) employee cost for a given scam,
 * derived from cumulative money income at that scam's progression position.
 */
export function getEmployeeBaseCost(scamId: string): number {
  ensureCaches();
  return employeeCostCache!.get(scamId) ?? MINIMUM_EMPLOYEE_COST;
}

/**
 * Returns the effective unlock cost for a scam: max(static, dynamic_floor).
 * Returns undefined for free scams (unlockCost === undefined in the definition).
 */
export function getUnlockCostForScam(scamId: string): number | undefined {
  ensureCaches();
  if (!unlockCostCache!.has(scamId)) return undefined;
  return unlockCostCache!.get(scamId);
}

/**
 * Returns the effective manager cost for a scam: max(static, dynamic_floor).
 * Falls back to MINIMUM_MANAGER_COST for scams not in ALL_SCAMS.
 */
export function getManagerCostForScam(scamId: string): number {
  ensureCaches();
  return managerCostCache!.get(scamId) ?? MINIMUM_MANAGER_COST;
}

/**
 * Returns the cost to hire the Nth employee for a scam (0-indexed count).
 * Applies the standard 1.15x exponential growth on top of the dynamic baseCost,
 * plus a 1% cost inflation per lifetime snitch.
 */
export function getEmployeeCostForScam(scamId: string, count: number, snitchCount: number = 0): number {
  const baseCost = getEmployeeBaseCost(scamId);
  const snitchMultiplier = 1 + SNITCH_EMPLOYEE_COST_PENALTY * snitchCount;
  return Math.floor(baseCost * Math.pow(EMPLOYEE_COST_GROWTH_RATE, count) * snitchMultiplier);
}

/**
 * Clears all memoized cost caches. Call after modifying scam definitions in tests.
 */
export function clearEmployeeCostCache(): void {
  employeeCostCache = null;
  unlockCostCache = null;
  managerCostCache = null;
}

/** Alias for clearEmployeeCostCache — clears all cost caches. */
export const clearCostCaches = clearEmployeeCostCache;

/**
 * Heat generated per employee per second.
 * Total heat/sec = totalEmployeeCount * EMPLOYEE_HEAT_PER_SECOND.
 * With heat decay at 0.001/sec, equilibrium heat ≈ totalEmployeeCount.
 */
export const EMPLOYEE_HEAT_PER_SECOND = 0.001;

/**
 * Returns the maximum number of employees of each type a player can hire.
 * Equals the player's trust level (floored), minimum 1.
 *
 * @param trust - Player's current trust value
 * @returns Maximum employees per type
 */
export function getMaxEmployeesPerType(trust: number): number {
  return Math.max(1, Math.floor(trust));
}

/**
 * Checks whether the player can hire another employee of a given type.
 *
 * @param trust - Player's current trust value
 * @param currentCount - How many of this employee type are already hired
 * @returns True if the player can hire one more
 */
export function canHireEmployee(trust: number, currentCount: number): boolean {
  return currentCount < getMaxEmployeesPerType(trust);
}

/**
 * Calculates the heat generated by all hired employees over a time delta.
 *
 * @param totalEmployeeCount - Total employees across all types
 * @param deltaSeconds - Time elapsed in seconds
 * @returns Heat to add
 */
export function calculateEmployeeHeat(totalEmployeeCount: number, deltaSeconds: number): number {
  return totalEmployeeCount * EMPLOYEE_HEAT_PER_SECOND * deltaSeconds;
}

/**
 * Calculates the cost to hire the next employee of a given type.
 * Uses exponential scaling (idle game convention), plus snitch penalty.
 *
 * Formula: floor(baseCost * growthRate^currentCount * snitchMultiplier)
 *
 * @param definition - The employee definition
 * @param currentCount - How many of this type are already hired
 * @param snitchCount - Lifetime snitch count (default 0)
 * @returns Cost to hire the next employee (floored to integer)
 */
export function calculateEmployeeCost(
  definition: EmployeeDefinition,
  currentCount: number,
  snitchCount: number = 0
): number {
  const { baseCost } = definition;

  // Exponential growth: baseCost * growthRate^count * snitchMultiplier
  const snitchMultiplier = 1 + SNITCH_EMPLOYEE_COST_PENALTY * snitchCount;
  const cost = baseCost * Math.pow(EMPLOYEE_COST_GROWTH_RATE, currentCount) * snitchMultiplier;

  // Floor to integer
  return Math.floor(cost);
}

/**
 * Calculates the total speed bonus from all hired employees.
 * Each employee contributes their speedBoost linearly per count.
 *
 * Formula: sum(employee.speedBoost * count) for all employees
 *
 * @param employees - Array of current employee states
 * @param definitions - Array of employee definitions (to look up boost values)
 * @returns Total speed bonus as a decimal (0.25 = 25%)
 */
export function calculateSpeedBonus(
  employees: EmployeeState[],
  definitions: EmployeeDefinition[]
): number {
  // Create a map for quick lookup of definitions by ID
  const definitionMap = new Map<string, EmployeeDefinition>();
  definitions.forEach((def) => {
    definitionMap.set(def.id, def);
  });

  // Sum up speed boosts from all employees
  let totalBonus = 0;
  employees.forEach((state) => {
    const definition = definitionMap.get(state.employeeId);
    if (definition) {
      totalBonus += definition.speedBoost * state.count;
    }
  });

  return totalBonus;
}

/**
 * Calculates the total reward bonus from all hired employees.
 * Each employee contributes their rewardBoost linearly per count.
 *
 * Formula: sum(employee.rewardBoost * count) for all employees
 *
 * @param employees - Array of current employee states
 * @param definitions - Array of employee definitions (to look up boost values)
 * @returns Total reward bonus as a decimal (0.5 = 50%)
 */
export function calculateRewardBonus(
  employees: EmployeeState[],
  definitions: EmployeeDefinition[]
): number {
  // Create a map for quick lookup of definitions by ID
  const definitionMap = new Map<string, EmployeeDefinition>();
  definitions.forEach((def) => {
    definitionMap.set(def.id, def);
  });

  // Sum up reward boosts from all employees
  let totalBonus = 0;
  employees.forEach((state) => {
    const definition = definitionMap.get(state.employeeId);
    if (definition) {
      totalBonus += definition.rewardBoost * state.count;
    }
  });

  return totalBonus;
}
