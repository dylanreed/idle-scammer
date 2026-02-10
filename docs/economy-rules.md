# Idle Scammer Economy Rules

## Overview

This document describes the Kongregate-style economy system for Idle Scammer.
Based on the "Math of Idle Games" series.

---

## Core Principles

### Principle 1: Graduated Exponential Cost
```
cost = baseCost × costRate^(level - 1)
```

Where:
- **baseCost** = unlockCost (or tier's baseCost for Tier 1 free scams)
- **costRate** = graduated per-scam from 1.07 to 1.10 based on log10(baseCost)
  - Cheap scams ($10): rate 1.07 (7% per level)
  - Expensive scams ($10Qi): rate 1.10 (10% per level)
  - Formula: `rate = 1.07 + 0.03 × (log10(baseCost) - 1) / 18`

### Principle 2: Linear Profit Growth
```
profit = baseCost × (1 + (level-1) × 0.10) × bracketBonus × trust^0.3
```

Where:
- **0.10** = 10% profit increase per level
- **bracketBonus** = ongoing multiplier from profit brackets
- **trust^0.3** = diminishing returns trust multiplier

### Principle 3: Unlock Cost = Base Reward
What you pay to unlock = what you earn at L1. This ensures the first
upgrade feels immediately worthwhile. All scams (including T2-T5 first
scams) have an unlockCost. Only the T1 Bot Farms and Nigerian Prince
are free.

### Principle 4: Crossover Varies by Scam
Cost exceeds single-cycle profit at different levels depending on
the scam's cost rate. Cheap scams (rate 1.07) cross over later than
expensive scams (rate 1.10). This signals it's time to unlock
the next scam or prestige.

---

## Tier System

### Tier Configuration
Each tier has these base values:
- **baseCost** - Base cost/reward for free scams
- **profitGrowth** - 0.10 (10% per level)
- **baseDuration** - Base time to complete a scam

Cost rate is NOT per-tier; it's graduated per-scam based on
the scam's baseCost. See `getScamCostRate()` in `scams/calculations.ts`.

### Tier Base Costs (100x Progression)
| Tier | baseCost | Trust Required |
|------|----------|----------------|
| 1 | $10 | 1 (default) |
| 2 | $1K | 11 (1 prestige) |
| 3 | $100K | 21 (2 prestiges) |
| 4 | $10M | 31 (3 prestiges) |
| 5 | $1B | 41 (4 prestiges) |

### Scam Counts Per Tier
- **Tier 1:** 9 money scams + Bot Farms (10 total)
- **Tiers 2-5:** 10 money scams each
- **Total:** 50 scams (49 money + 1 bot-generating)

### First Scam Per Tier
| Tier | First Scam | unlockCost |
|------|------------|------------|
| 1 | Nigerian Prince | FREE |
| 2 | Tech Support Scams | $1K |
| 3 | Crypto Rug Pulls | $100K |
| 4 | Ponzi Schemes | $10M |
| 5 | Gov Contract Fraud | $1B |

Each tier's first scam costs the tier baseCost to unlock (acts as a gate).

---

## Bracket Bonuses (Ongoing Multipliers)

### Profit Brackets
These apply to ALL rewards while in the bracket:
| Level Range | Multiplier |
|-------------|------------|
| 1-9 | 1.0x |
| 10-24 | 1.5x |
| 25-49 | 2.5x |
| 50-74 | 4.0x |
| 75-99 | 6.0x |
| 100+ | 10.0x |

### Speed Brackets
| Level Range | Multiplier |
|-------------|------------|
| 1-9 | 1.0x |
| 10-24 | 1.5x |
| 25-49 | 2.0x |
| 50-74 | 3.0x |
| 75-99 | 5.0x |
| 100+ | 10.0x |

---

## Milestone Bonuses (One-Time Cash Payouts)

When upgrading TO these levels, player receives a bonus cash payout:
| Level | Bonus Multiplier | Example (Nigerian Prince) |
|-------|------------------|---------------------------|
| 10 | 2x base | +$20 |
| 25 | 5x base | +$50 |
| 50 | 10x base | +$100 |
| 75 | 15x base | +$150 |
| 100 | 25x base | +$250 |

Formula: `bonus = baseReward × milestoneMultiplier × trust^0.3`

---

## Scam Progression Rules

### Tier 1 Scams (100x Progression)
| Scam | Unlock Cost | L1 Reward | Cost Rate |
|------|-------------|-----------|-----------|
| Nigerian Prince | FREE ($10) | $10 | 1.070 |
| iPhone Popup | $1K | $1K | 1.075 |
| Phishing Links | $10K | $10K | 1.080 |
| Survey Scams | $100K | $100K | 1.082 |
| Fake Lottery | $1M | $1M | 1.085 |
| Fake Antivirus | $10M | $10M | 1.087 |
| Gift Card | $100M | $100M | 1.090 |
| Advance Fee | $1B | $1B | 1.092 |
| Fake Job | $10B | $10B | 1.095 |

### Duration Progression
Later scams take longer (5s → 3min), incentivizing speed upgrades.

---

## Trust Multiplier

Trust uses diminishing returns to prevent runaway scaling:
```
trustMultiplier = trust^0.3
```

| Trust | Multiplier | Notes |
|-------|------------|-------|
| 1 | 1.00x | Starting value |
| 11 | 2.04x | After 1st prestige |
| 21 | 2.66x | After 2nd prestige |
| 31 | 3.11x | After 3rd prestige |
| 41 | 3.47x | After 4th prestige (all tiers) |

---

## Manager System

### Manager Costs (0.75 × Next Scam Unlock)
Manager cost = 75% of the next scam's unlock cost.
This creates a decision point just before you can afford the next scam.

### Manager Automation
- When hired, managers auto-start and auto-restart scams
- UI shows "AUTO (MANAGED)" or "AUTO RUNNING..."

---

## Expected Gameplay Feel

1. **Unlock scam** - costs $X
2. **L1 reward** - earn $X per completion (break even in 1 run!)
3. **L1-15** - upgrades feel good, rapid progression
4. **L15-30** - slowing down, but bracket bonuses help
5. **L30+** - approaching crossover, consider next scam
6. **Crossover** - diminishing returns, unlock next scam or prestige
7. **Cheap scams stay profitable longer** (1.07 rate), expensive scams cross over sooner (1.10 rate)
