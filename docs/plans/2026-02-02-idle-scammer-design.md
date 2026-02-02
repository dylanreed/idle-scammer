# Idle Scammer - Game Design Document

## Overview

**Idle Scammer** is a satirical idle game where players build a scam empire from humble beginnings to international fraud syndicate. The game satirizes both internet scam culture AND predatory mobile game monetization (via fake ads that are just cat pictures).

**Platforms:** iOS, Android, Web (single codebase via Expo)

**Visual Style:** Pixel art hacker aesthetic - CRT monitors with scanlines, green terminal text, ASCII-style UI elements, dark web vibes rendered in chunky retro pixel art.

---

## Origin System

Players choose their starting backstory, which provides flavor text and a small starting bonus:

| Origin | Bonus | Flavor |
|--------|-------|--------|
| Mom's Basement | Typing speed | Classic hacker origin, stealing neighbor's WiFi |
| Internet Cafe | Anonymity | Paying by the hour, public cover |
| Stolen Phone | Mobility/Hustle | Ultra humble beginnings |
| TBD | TBD | Additional origins to be designed |

---

## Resource Economy

Seven interconnected resources drive the game:

| Resource | Purpose | Persistence |
|----------|---------|-------------|
| **Money** | Buy upgrades, employees, managers | Resets on prestige |
| **Reputation** | Unlock new scam types and tiers | Resets on prestige |
| **Heat** | Police attention, triggers prestige at max | Resets on prestige |
| **Bots** | Core resource from Bot Farms, spent to upgrade scams and enable offline | Resets on prestige |
| **Skill Points** | Unlock passive tree nodes and active abilities | Resets on prestige |
| **Crypto** | Volatile currency, gambling/investment mechanic | Resets on prestige |
| **Trust** | Prestige currency, passive multiplier, spendable for bonuses | **Persists across prestiges** |

### Trust Mechanics

Trust is the key prestige currency with multiple uses:
- **Passive multiplier** to all earnings (compounds over runs)
- **Spendable mid-run** ("rat out competition" = lose trust, gain income boost)
- **Snitching at prestige** = keep more stuff but permanent trust penalty
- **Purchase Base AI** (permanent upgrade)
- **Buy temporary boosts** (per-run enhancements)

---

## Scam Progression

### Structure: 5 Tiers × 10 Scams = 50 Total Scams

Unlock tiers by building reputation. Each scam has:
- Its own **specialized employees** (boost that scam)
- Its own **named manager** (automates employees)
- A **bot threshold** (spend bots to upgrade, eventually enable offline)

### Tier 1 - Small Time
1. **Bot Farms** (FIRST SCAM - generates bots, the foundational resource)
2. Nigerian Prince Emails
3. Fake Lottery Winnings
4. "You've Won an iPhone" Popups
5. Phishing Links
6. Survey Scams
7. Fake Antivirus Popups
8. Gift Card Scams
9. Advance Fee Fraud
10. Fake Job Postings

### Tier 2 - Getting Serious
1. Tech Support Scams
2. Romance Catfishing
3. Fake Charity Drives
4. Rental Scams
5. Ticket Scalping Bots
6. Fake Review Farms
7. Click Fraud
8. Influencer Impersonation
9. Dropshipping Fraud
10. Warranty Scams

### Tier 3 - Big Leagues
1. Crypto Rug Pulls
2. Fake Investment Schemes
3. Corporate Phishing (Spear Phishing)
4. Business Email Compromise
5. NFT Pump & Dumps
6. Fake ICOs
7. SIM Swapping
8. Account Takeover Services
9. Credential Stuffing
10. Ransomware-as-a-Service

### Tier 4 - Organized Crime
1. Ponzi Schemes
2. Money Laundering Networks
3. Identity Theft Rings
4. Credit Card Fraud Networks
5. Fake Escrow Services
6. Invoice Fraud
7. Insurance Fraud
8. Tax Refund Fraud
9. Medicare/Healthcare Fraud
10. Shell Company Networks

### Tier 5 - Mastermind
1. Government Contract Fraud
2. International Wire Fraud
3. Shadow Banking
4. Election Manipulation Services
5. Corporate Espionage
6. Stock Manipulation
7. Real Estate Fraud Empires
8. Pharmaceutical Counterfeiting
9. Art Forgery & Laundering
10. Central Bank Heists

Higher tiers require more bots to upgrade and higher thresholds for offline capability.

---

## Idle Mechanics & Automation

### Progression Per Scam

**Stage 1 - Manual:**
- Scams run on timers (click to start, wait, collect)
- Active gameplay, checking in frequently
- Building up bot reserves from Bot Farms

**Stage 2 - Employees:**
- Hire specialized employees per scam
- Employees boost scam output and reduce timers
- Still need to collect manually or check in

**Stage 3 - Managers:**
- Hire named managers (one per scam, 50 total)
- Managers automate employee output
- Money rolls in passively

**Stage 4 - Offline:**
- Spend enough bots to unlock offline capability
- Higher tier scams need more bots for offline

### Offline Progression Rules

- **Reduced rate:** ~50% of active earnings
- **Capped:** Max 8 hours of accumulated earnings
- **Bot-gated:** Must have enough bots assigned to scam
- **Tier scaling:** Higher tier scams need more bots for offline capability

### Managers

- 50 named managers (one per scam)
- Each has a unique name and pixel art portrait
- Must rehire each prestige (part of rebuild loop)
- Managers automate their scam's employees

---

## Prestige System

### Heat Triggers Prestige

- Running scams generates heat (police attention)
- Higher tier scams generate more heat
- At max heat, forced to "flee the country"

### The Prestige Choice

| Option | Benefit | Cost |
|--------|---------|------|
| **Clean Escape** | Trust score intact, full earning potential next run | Lose most progress |
| **Snitch** | Keep more currency/upgrades | Permanent trust penalty, slower future runs |

### What Persists Across Prestige

- Trust score (unless damaged by snitching)
- Base AI (if purchased)
- Origin choice

### What Resets

- Money, reputation, heat, bots, skill points, crypto
- All employees and managers (must rehire)
- Scam levels and upgrades
- Temporary AI boosts

---

## Skills & AI System

### Passive Skill Tree

Spend skill points on permanent (within-run) upgrades:

- **Tech Skills:** Bot efficiency, hacking speed, automation bonuses
- **Social Skills:** Persuasion, romance scam bonuses, employee loyalty
- **Finance Skills:** Crypto gains, money laundering efficiency, investment returns
- **Stealth Skills:** Heat reduction, detection evasion, police bribery

### Active Abilities

Cooldown-based powers triggered manually:

- "Charm Offensive" - 2x romance scam income for 5 min
- "DDoS Burst" - Instant bot farm payout
- "Burner Phone" - Reduce heat by X%
- "Market Manipulation" - Force crypto price spike
- "Deep Fake" - Boost all social scams temporarily
- "Zero Day" - Instant completion of one scam timer

Skills reset on prestige (part of rebuild loop).

### AI System

**Base AI (Permanent):**
- Major trust investment (one-time purchase)
- Persists across all prestiges
- Provides global speed boost to all scams
- Still need managers for actual automation

**Temp AI Boosts (Per-Run):**
- Spend trust for temporary enhancements
- Examples: 2x bot production, reduced heat gain, faster timers
- Only lasts current run

---

## Crypto, NFTs & Gambling

### Volatile Currency

- Crypto is a secondary currency alongside money
- Exchange rate fluctuates constantly (random walks, occasional spikes/crashes)
- Convert money ↔ crypto anytime
- Timing the market = risk/reward minigame

### Investment Projects

Invest crypto into sketchy "projects" with random outcomes:

| Project Type | Risk | Potential Outcome |
|--------------|------|-------------------|
| "Stable" Coins | Low | 1.1x - 1.5x return |
| New Altcoins | Medium | 0.5x - 3x return |
| Meme Coins | High | 0x - 10x return |
| "Guaranteed" Returns | Extreme | 0x - 20x (almost always rugs) |

Projects take time to "mature" (like scam timers). Some rug pull instantly.

### NFT System

- **Mint NFTs:** Create worthless pixel art JPEGs (costs crypto)
- **Pump & Dump:** Hype your NFTs to inflate price, sell before crash
- **NFT Collections:** Build "rare" collections with fake scarcity
- **Rug Pulls:** Launch a collection, drain liquidity, disappear
- **Buy the Dip:** Occasionally find undervalued NFTs (rare legitimate gains)

**NFT Mechanics:**
- NFTs have fluctuating "floor prices" tied to hype
- Hype decays over time (must keep shilling)
- Can assign employees to shill your collections
- Risk of getting rugged yourself if you buy others' NFTs
- Procedurally generated pixel art with silly trait combinations

Crypto and NFTs reset on prestige.

---

## Monetization (Satire)

### Fake Ads (Cat Pictures)

The game presents itself like every predatory mobile game:
- "Watch an ad for 2x income!" → 30 seconds of cat slideshow
- "Free daily reward - watch ad!" → More cat pictures
- Unskippable "ad" breaks that are just cats with fake loading bars
- No actual ads, no money changes hands

### Fake Premium Currency

- "Buy 1000 ScamCoins for $4.99!" → Shows cat pics, nothing purchased
- Fake "BEST VALUE" and "LIMITED TIME" banners
- Fake "Purchase successful!" confirmations
- Unlock bonus cat pics the more you "buy"

### Fake Gacha/Loot Boxes

- "Premium Scammer Crate" → Opens to reveal cat pics
- Fake "LEGENDARY" and "EPIC" rarity tiers for cat photos

### Real Tip Jar (Optional, Later)

- Completely separate, clearly labeled as actual support
- No gameplay benefits
- "Buy me a coffee" style, not predatory
- Maybe unlocks a "Supporter" badge or special cat

---

## Technical Architecture

### Stack

- **Expo** (React Native) for iOS, Android, Web from single codebase
- **TypeScript** throughout
- **Local storage** for save data (AsyncStorage / localStorage)
- **No backend required** initially (fully offline-capable)

### Project Structure

```
idle-scammer/
├── src/
│   ├── components/     # UI components (pixel art themed)
│   ├── screens/        # Main game screens
│   ├── game/
│   │   ├── engine/     # Core idle loop, timers, offline calc
│   │   ├── resources/  # Money, bots, trust, crypto, etc.
│   │   ├── scams/      # 50 scam definitions
│   │   ├── employees/  # Employee types per scam
│   │   ├── managers/   # 50 named managers
│   │   ├── skills/     # Passive tree + active abilities
│   │   ├── prestige/   # Trust, flee/snitch logic
│   │   └── crypto/     # Volatile market, NFTs, projects
│   ├── assets/         # Pixel art, sounds, cat pics
│   └── utils/          # Helpers, save/load
├── app.json            # Expo config
└── package.json
```

### Key Technical Considerations

- Idle calculations when app resumes (offline earnings)
- Efficient state management (Zustand recommended)
- Pixel art scaling/rendering on different screen sizes
- Procedural NFT generation
- Save game persistence and migration

---

## Next Steps

1. Initialize Expo project with TypeScript
2. Set up basic game state management
3. Implement core idle loop engine
4. Build Bot Farms as first playable scam
5. Create pixel art UI components
6. Add resource display and management
7. Implement save/load system
8. Build out remaining Tier 1 scams
9. Add employee and manager systems
10. Implement prestige mechanics
