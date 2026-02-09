# Economy Restructure Plan

Based on Kongregate's "Math of Idle Games" series.

---

## Current Problems

1. **Triangular exponentiation** makes costs grow astronomically fast
2. **Unlock cost ≠ base reward** - first upgrade costs more than you earn
3. **Profit < Cost from L1** - upgrades never feel good
4. **Overly complex formulas** - hard to balance and reason about

---

## New Economy Design

### Principle 1: Simple Exponential Cost

**Old formula (triangular):**
```
cost = base × rate^(triangular(level) - 1)
triangular(n) = n × (n + 1) / 2
```

**New formula (simple exponential):**
```
cost = base × rate^(level - 1)
```

With `rate = 1.15` (15% increase per level):
| Level | Multiplier | Example (base=$100) |
|-------|------------|---------------------|
| 1 | 1.00x | $100 |
| 10 | 3.52x | $352 |
| 20 | 16.37x | $1,637 |
| 30 | 66.21x | $6,621 |
| 40 | 267.86x | $26,786 |

---

### Principle 2: Profit Exceeds Cost Early

**Rule:** At L1, one completion should pay for the upgrade (or close to it).

**New approach:**
- `baseReward = unlockCost` (what you pay to unlock = what you earn at L1)
- Profit grows linearly: `reward = baseReward + (level × growthRate)`
- Bracket bonuses at milestones (L10, L25, L50)

**Example with $100 unlock/base:**
| Level | Cost | Reward | Ratio | Feel |
|-------|------|--------|-------|------|
| 1 | $100 | $100 | 1.0x | Break even |
| 5 | $175 | $150 | 0.86x | Still good |
| 10 | $352 | $250 | 0.71x | Slowing down |
| 20 | $1,637 | $625 | 0.38x | Getting expensive |
| 30 | $6,621 | $1,500 | 0.23x | Crossover soon |
| 35 | $13,318 | $2,188 | 0.16x | Past crossover |

---

### Principle 3: Crossover at L30-40

**Target:** Cost exceeds profit around level 30-40.

**Tuning variables:**
- `costRate` (1.10 - 1.20) - higher = earlier crossover
- `profitGrowth` - higher = later crossover
- `bracketBonuses` - extend profitable zone

---

### Principle 4: Scam Progression (2x Rule)

Each new scam's `unlockCost` (and thus `baseReward`) = 2x previous scam's reward at crossover.

| Scam | Unlock/Base | L35 Reward | Next Scam Base |
|------|-------------|------------|----------------|
| Nigerian Prince | $10 | ~$500 | - |
| iPhone Popup | $1,000 | ~$50K | $1,000 |
| Phishing | $100K | ~$5M | $100K |
| etc. | 100x each | - | - |

---

## Implementation Plan

### Step 1: Simplify Cost Formula
Change `calculateUpgradeCost()` to use simple exponential:
```typescript
cost = baseCost × Math.pow(1.15, level - 1)
```

### Step 2: Align Unlock Cost = Base Reward
For each scam, set:
```typescript
baseReward = unlockCost ?? tierInitialCost
```

### Step 3: Linear Profit Growth
Change `calculateScamReward()` to:
```typescript
reward = baseReward + (level × baseReward × 0.1) // 10% growth per level
reward *= getBracketBonus(level)
```

### Step 4: Tune for Crossover at L35
Adjust `costRate` until crossover happens around level 35.

### Step 5: Set Scam Unlock Costs (100x progression)
| Scam | Unlock Cost |
|------|-------------|
| Nigerian Prince | FREE ($10 base) |
| iPhone Popup | $1,000 |
| Phishing | $10,000 |
| Survey | $100,000 |
| Fake Lottery | $1M |
| Fake Antivirus | $10M |
| Gift Card | $100M |
| Advance Fee | $1B |
| Fake Job | $10B |

### Step 6: Update Tier System
Simplify tier config:
```typescript
{
  tier: 1,
  baseCost: 10,        // Used for free scams
  costRate: 1.07,      // 7% per level (tuned for L38 crossover)
  profitGrowth: 0.10,  // 10% per level
}
```

**IMPLEMENTED**: costRate was tuned from 1.15 to 1.07 to achieve crossover at L38.

### Step 7: Adjust Durations
Keep current duration progression (5s → 3min) - this is fine.

### Step 8: Manager Costs
Set manager cost = 10x the scam's unlock cost:
| Scam | Unlock | Manager Cost |
|------|--------|--------------|
| Nigerian Prince | FREE | $100 |
| iPhone Popup | $1K | $10K |
| Phishing | $10K | $100K |
| etc. | | 10x unlock |

---

## Expected Gameplay Feel

1. **Unlock scam** - costs $X
2. **L1 reward** - earn $X per completion (break even in 1 run!)
3. **L1-15** - upgrades feel good, rapid progression
4. **L15-30** - slowing down, but bracket bonuses help
5. **L30-40** - crossover zone, time to consider next scam
6. **L40+** - diminishing returns, unlock next scam or prestige

---

## Files to Modify

1. `src/game/economy/constants.ts` - Simplify tier config
2. `src/game/scams/calculations.ts` - New cost/profit formulas
3. `src/game/scams/definitions.ts` - New unlock costs and base rewards
4. `src/game/managers/definitions.ts` - Adjust manager costs
5. `__tests__/*` - Update tests for new values

---

## Validation

After implementation, verify:
- [ ] L1 reward ≈ L1 upgrade cost (ratio ~1.0)
- [ ] Crossover happens at L30-40
- [ ] Each scam's L1 reward > previous scam's L35 reward
- [ ] Progression feels smooth in gameplay
