# Idle Scammer Economy Rules

## Overview

This document describes the Kongregate-style economy system for Idle Scammer.
Based on the "Math of Idle Games" series.

---

## Core Principles

### Principle 1: Simple Exponential Cost
```
cost = baseCost × 1.07^(level - 1)
```

Where:
- **baseCost** = unlockCost (or tier's baseCost if free)
- **1.07** = 7% cost increase per level

### Principle 2: Linear Profit Growth
```
profit = baseCost × (1 + (level-1) × 0.10) × bracketBonus
```

Where:
- **0.10** = 10% profit increase per level
- **bracketBonus** = milestone multiplier

### Principle 3: Unlock Cost = Base Reward
What you pay to unlock = what you earn at L1. This ensures the first
upgrade feels immediately worthwhile.

### Principle 4: Crossover at L38
Cost exceeds profit around level 38, signaling it's time to unlock
the next scam or prestige.

---

## Tier System

### Tier Configuration
Each tier has these base values:
- **baseCost** - Base cost/reward for free scams
- **costRate** - 1.07 (7% per level)
- **profitGrowth** - 0.10 (10% per level)
- **baseDuration** - Base time to complete a scam

### Tier Base Costs (100x Progression)
| Tier | baseCost |
|------|----------|
| 1 | $10 |
| 2 | $1K |
| 3 | $100K |
| 4 | $10M |
| 5 | $1B |
| 6 | $100B |
| 7 | $10T |
| 8 | $1Q |
| 9 | $100Q |
| 10 | $10Qn |

### Tier Unlock Costs
| Tier | Unlock Cost |
|------|-------------|
| 2 | $100K |
| 3 | $10M |
| 4 | $1B |
| 5 | $100B |
| 6 | $10T |
| 7+ | 100x each |

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

Formula: `bonus = baseReward × milestoneMultiplier × trust`

---

## Scam Progression Rules

### Tier 1 Scams (100x Progression)
| Scam | Unlock Cost | L1 Reward | Crossover |
|------|-------------|-----------|-----------|
| Nigerian Prince | FREE ($10) | $10 | L38 |
| iPhone Popup | $1K | $1K | L38 |
| Phishing Links | $10K | $10K | L38 |
| Survey Scams | $100K | $100K | L38 |
| Fake Lottery | $1M | $1M | L38 |
| Fake Antivirus | $10M | $10M | L38 |
| Gift Card | $100M | $100M | L38 |
| Advance Fee | $1B | $1B | L38 |
| Fake Job | $10B | $10B | L38 |

### Duration Progression
Later scams take longer (5s → 3min), incentivizing speed upgrades.

---

## Manager System

### Manager Costs (0.75 × Next Scam Unlock)
Manager cost = 75% of the next scam's unlock cost.
This creates a decision point just before you can afford the next scam.

| Manager | Scam | Cost | Formula |
|---------|------|------|---------|
| Prince Okonkwo | Nigerian Prince | $750 | 0.75 × $1K |
| Popup Pete | iPhone Popup | $7.5K | 0.75 × $10K |
| PhishMaster Phil | Phishing Links | $75K | 0.75 × $100K |
| Survey Susan | Survey Scams | $750K | 0.75 × $1M |
| Lucky Larry | Fake Lottery | $7.5M | 0.75 × $10M |
| Dread Norton | Fake Antivirus | $75M | 0.75 × $100M |
| Gwen Cardsworth | Gift Card | $750M | 0.75 × $1B |
| Felix Upfront | Advance Fee | $7.5B | 0.75 × $10B |
| Carla Careers | Fake Job | $75K | 0.75 × Tier 2 unlock |

### Manager Automation
- When hired, managers auto-start and auto-restart scams
- UI shows "AUTO (MANAGED)" or "AUTO RUNNING..."

---

## Example Progression (Nigerian Prince)

| Level | Cost | Reward | Ratio | Status |
|-------|------|--------|-------|--------|
| 1 | $10 | $10 | 1.00 | Break even |
| 10 | $18 | $29 | 1.58 | Profitable |
| 20 | $36 | $44 | 1.21 | Still good |
| 30 | $71 | $98 | 1.37 | Bracket bonus! |
| 35 | $99 | $110 | 1.11 | Slowing down |
| 38 | $121 | $118 | 0.97 | Crossover |
| 40 | $139 | $123 | 0.88 | Diminishing |
| 50 | $275 | $236 | 0.86 | Time to move on |

---

## Expected Gameplay Feel

1. **Unlock scam** - costs $X
2. **L1 reward** - earn $X per completion (break even in 1 run!)
3. **L1-15** - upgrades feel good, rapid progression
4. **L15-30** - slowing down, but bracket bonuses help
5. **L30-38** - approaching crossover, consider next scam
6. **L38+** - diminishing returns, unlock next scam or prestige
