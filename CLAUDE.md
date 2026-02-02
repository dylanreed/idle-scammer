# IDLE SCAMMER - Project Instructions

## Team Identities

**Claude AI goes by:** `xXx_TURB0SCAM_9000_xXx` (90s hacker handle, fits the theme)

**Rodney goes by:** `baud-e-modem` (peak 90s dial-up nostalgia)

Address each other by these names. It's the law.

---

## Project Overview

Idle Scammer is a satirical idle game about building a scam empire. Think Cookie Clicker meets hacker aesthetic meets biting satire of predatory mobile games.

**Full design doc:** `docs/plans/2026-02-02-idle-scammer-design.md`

---

## Tech Stack

- **Expo** (React Native) - iOS, Android, Web from single codebase
- **TypeScript** - Type safety everywhere
- **Zustand** (planned) - State management
- **Local Storage** - Save data (AsyncStorage / localStorage)

---

## Project Structure

```
src/
├── components/     # UI components (pixel art themed)
├── screens/        # Main game screens
├── game/
│   ├── engine/     # Core idle loop, timers, offline calc
│   ├── resources/  # Money, bots, trust, crypto, etc.
│   ├── scams/      # 50 scam definitions
│   ├── employees/  # Employee types per scam
│   ├── managers/   # 50 named managers
│   ├── skills/     # Passive tree + active abilities
│   ├── prestige/   # Trust, flee/snitch logic
│   └── crypto/     # Volatile market, NFTs, projects
├── assets/         # Pixel art, sounds, cat pics
└── utils/          # Helpers, save/load
```

---

## Code Standards

- All files start with 2-line ABOUTME comment explaining purpose
- TDD: Write tests first
- NO mock modes - real data only
- Simple > clever
- Match existing code style
- Never use `--no-verify` on commits

---

## Visual Style

Pixel art hacker aesthetic:
- CRT monitor frames with scanlines
- Green terminal text (#00ff00)
- Dark backgrounds (#0a0a0a, #1a1a1a)
- ASCII-style UI elements
- Chunky retro pixel art

---

## Game Resources

| Resource | Persists? |
|----------|-----------|
| Money | No |
| Reputation | No |
| Heat | No |
| Bots | No |
| Skill Points | No |
| Crypto | No |
| **Trust** | **Yes** |

---

## Port Numbers

If we add any services, use scam-themed ports:
- Dev server: 4419 (SCAM upside down-ish)
- API (if needed): 1337 (classic)

---

## Running the Project

```bash
npm run android   # Android
npm run ios       # iOS
npm run web       # Web browser
```

---

## The Cat Pics

The game has "fake ads" that are just slideshows of Rodney's cat. These go in `src/assets/cats/` when we add them.
