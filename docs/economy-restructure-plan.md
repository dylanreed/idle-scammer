# Economy Restructure Plan (COMPLETED)

Based on Kongregate's "Math of Idle Games" series.

> **Status:** This plan has been fully implemented and superseded by
> the graduated cost rate system. See `docs/economy-rules.md` for
> the current economy specification.

---

## What Was Implemented

### Phase 1: Simple Exponential Cost (Done)
Replaced triangular exponentiation with simple exponential:
```
cost = baseCost × costRate^(level - 1)
```

### Phase 2: Unlock Cost = Base Reward (Done)
Set `baseReward = unlockCost` for all scams so L1 reward = unlock price.

### Phase 3: Linear Profit Growth (Done)
```
reward = baseReward × (1 + (level-1) × 0.10) × bracketBonus × trust^0.3
```

### Phase 4: Graduated Cost Rate (Done)
Replaced flat per-tier costRate with graduated per-scam rate:
- Cheap scams ($10): rate 1.07 (slowest scaling)
- Expensive scams ($10Qi): rate 1.10 (fastest scaling)
- Interpolated on log10(baseCost) scale
- Removed `costRate` from `ScamTierBase` interface

### Phase 5: Trust Diminishing Returns (Done)
Changed trust from linear multiplier to `trust^0.3`:
- Trust 1: 1.0x
- Trust 41: 3.47x (was 41x with linear)

### Phase 6: Tier Entry Gates (Done)
T2-T5 first scams require unlockCost = tier baseCost instead of being free.

---

## Files Modified
1. `src/game/economy/constants.ts` - Removed costRate from interface/data
2. `src/game/scams/calculations.ts` - Added getScamCostRate(), trust^0.3
3. `src/game/scams/tier2-5.ts` - Added unlockCost to first scams
4. All corresponding test files updated
