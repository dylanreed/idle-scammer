// ABOUTME: TypeScript types for employee definitions and state tracking
// ABOUTME: Defines EmployeeDefinition and EmployeeState interfaces for the hire system

/**
 * Static definition of an employee type.
 * Employees boost specific scams by reducing duration and/or increasing rewards.
 */
export interface EmployeeDefinition {
  /** Unique identifier (kebab-case, e.g., 'bot-wrangler') */
  id: string;

  /** Display name (e.g., 'Bot Wrangler') */
  name: string;

  /** ID of the scam this employee works on */
  scamId: string;

  /** Base cost to hire the first employee of this type */
  baseCost: number;

  /** Percentage reduction in scam duration per employee (0.05 = 5%) */
  speedBoost: number;

  /** Percentage increase in scam reward per employee (0.1 = 10%) */
  rewardBoost: number;
}

/**
 * Runtime state for a specific employee type.
 * Tracks how many of each employee type the player has hired.
 */
export interface EmployeeState {
  /** ID of the employee definition this state tracks */
  employeeId: string;

  /** How many of this employee type have been hired */
  count: number;
}
