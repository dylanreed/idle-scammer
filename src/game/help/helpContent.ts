// ABOUTME: Centralized help text for all context-sensitive "?" icons in the game
// ABOUTME: Each topic has a title and body array matching TutorialModal's props shape

/**
 * Shape of a help topic: matches TutorialModal's title + body props.
 */
export interface HelpTopic {
  title: string;
  body: string[];
}

/**
 * All help topics keyed by their topic identifier.
 * These are displayed in TutorialModal when the player taps a "?" icon.
 */
export const HELP_CONTENT: Record<string, HelpTopic> = {
  // ─── ResourceHUD ──────────────────────────────────────────────────
  'resources': {
    title: 'RESOURCES \u2014 Your Criminal Balance Sheet',
    body: [
      '\ud83d\udcb0 MONEY \u2014 Earned from running scams. Spent on unlocks, upgrades, managers, and employees. Resets on prestige.',
      '\ud83d\udd25 HEAT \u2014 Attention from the feds. Builds from scams and employees, decays over time. Hit max heat and you\'re forced to flee.',
      '\ud83e\udd16 BOTS \u2014 Digital minions generated from scam completions. Assign to scams for speed/profit boosts, or leave idle to reduce heat.',
      '\u2b50 TRUST \u2014 Your criminal reputation. The ONLY resource that survives prestige. Unlocks tiers, boosts rewards, and grants starting SP.',
      '\ud83c\udf93 SKILL POINTS \u2014 Per-run currency for passive skills and abilities. Amount based on your Trust level. Resets on prestige.',
      '\ud83d\udcb1 $TRUST \u2014 Cryptocurrency on the volatile TrustCoin Exchange. Buy, sell, invest, or mint NFTs.',
    ],
  },

  // ─── ScamListPanel ────────────────────────────────────────────────
  'scam-tiers': {
    title: 'SCAM TIERS \u2014 Climbing the Ladder',
    body: [
      'Scams are organized into 5 tiers of increasing audacity and profit.',
      'Tier 1: Small Time \u2014 Available from the start. Low risk, low reward.',
      'Tier 2-5: Unlock by buying ALL scams in the previous tier AND reaching the required Trust level.',
      'Higher tiers have longer timers but dramatically better payouts.',
    ],
  },

  'scam-cards': {
    title: 'SCAM OPERATIONS \u2014 How It Works',
    body: [
      'Each scam has a timer. Tap to start it, collect when done. Managers auto-run scams for you.',
      'UPGRADE (arrow icon) \u2014 Spend money to increase the scam\'s level. Higher level = bigger payout.',
      'MAX BUY \u2014 Buy as many upgrade levels as you can afford at once.',
      'EMPLOYEES \u2014 Hire employees for speed and reward bonuses on that scam. Costs scale per hire.',
      'Every 25 levels triggers a MILESTONE BONUS \u2014 a cash payout. Every 100 levels grants an ASCENSION (permanent multiplier).',
    ],
  },

  // ─── OpsPanel ─────────────────────────────────────────────────────
  'bot-network': {
    title: 'BOT NETWORK \u2014 Your Digital Army',
    body: [
      'Bots are generated fractionally each time you complete a scam. Higher tier scams produce more bots.',
      'ASSIGN bots to specific scams for speed and profit bonuses.',
      'UNASSIGNED bots passively reduce your heat generation.',
      'You can reassign bots at any time \u2014 try different strategies for speed vs. heat management.',
    ],
  },

  'managers': {
    title: 'MANAGERS \u2014 Set It and Forget It',
    body: [
      'Each scam has one unique manager you can hire.',
      'Hired managers AUTO-RUN their scam \u2014 it restarts immediately after completing.',
      'Manager costs scale with tier. They\'re expensive but essential for idle progress.',
      'Managers persist through the current run but reset on prestige.',
    ],
  },

  'escape-plan': {
    title: 'ESCAPE PLAN \u2014 Cash Out or Rat Out',
    body: [
      'When you\'re ready (or when heat forces you), trigger prestige by fleeing the country.',
      'CLEAN ESCAPE \u2014 Earn Trust based on your money earned. Safe, steady progress.',
      'SNITCH \u2014 Earn bonus Trust but increase your snitch count, raising future employee costs.',
      'All resources except Trust reset. Your Trust unlocks new tiers, starting SP, and reward multipliers.',
    ],
  },

  // ─── SkillsPanel ──────────────────────────────────────────────────
  'skill-points': {
    title: 'SKILL POINTS \u2014 Per-Run Currency',
    body: [
      'Each prestige run starts you with Skill Points based on your Trust level.',
      'SP are spent on passive skills and active abilities. Choose wisely \u2014 they reset on prestige.',
      'More Trust = more starting SP = more powerful builds each run.',
    ],
  },

  'skills-tech': {
    title: 'TECH \u2014 Bot & Speed Skills',
    body: [
      'Tech skills enhance your digital infrastructure.',
      'Overclock \u2014 Reduces all scam timer durations.',
      'Botnet Amplifier \u2014 Makes each assigned bot more effective.',
      'Each skill has multiple ranks. Higher ranks cost more SP but give bigger bonuses.',
    ],
  },

  'skills-social': {
    title: 'SOCIAL \u2014 Employee & Reward Skills',
    body: [
      'Social skills boost your human network.',
      'Silver Tongue \u2014 Increases all scam reward payouts.',
      'Recruitment Drive \u2014 Reduces employee hiring costs.',
      'Deep Fake (ability) \u2014 Temporarily doubles employee bonuses when activated.',
    ],
  },

  'skills-finance': {
    title: 'FINANCE \u2014 Money & Upgrade Skills',
    body: [
      'Finance skills make your money work harder.',
      'Creative Accounting \u2014 Flat money bonus multiplier on all scams.',
      'Bulk Discount \u2014 Reduces upgrade costs.',
      'Compound Interest \u2014 Passive income per second, scaled by Trust.',
    ],
  },

  'skills-stealth': {
    title: 'STEALTH \u2014 Heat Management Skills',
    body: [
      'Stealth skills keep you under the radar.',
      'Burner Phone \u2014 Reduces heat gain from scams.',
      'Dirty Cops \u2014 Increases the rate heat decays over time.',
      'Ghost Protocol \u2014 Raises your maximum heat threshold before forced prestige.',
    ],
  },

  'abilities': {
    title: 'ABILITIES \u2014 Active Powers',
    body: [
      'Active abilities are powerful one-shot or timed effects you trigger during a run.',
      'UNLOCK with SP, then ACTIVATE for an immediate or sustained effect. Each activation costs escalating SP.',
      'DDoS Burst \u2014 Instantly completes all running scam timers.',
      'Zero Day \u2014 3x speed on all scams for a limited time.',
      'VPN Tunnel \u2014 Zero heat gain for a limited time.',
      'Burner Phone \u2014 Instantly removes 30% of current heat.',
    ],
  },

  // ─── CryptoPanel ──────────────────────────────────────────────────
  'trustcoin-exchange': {
    title: 'TRUSTCOIN EXCHANGE \u2014 Volatile Markets',
    body: [
      'The $TRUST exchange rate shifts every 2 seconds. Watch the trend arrows.',
      'Market events (Bull Run, Crash, Whale Dump, etc.) can drastically swing the rate.',
      'Buy low, sell high \u2014 or invest in projects for leveraged returns.',
    ],
  },

  'crypto-buysell': {
    title: 'BUY/SELL \u2014 Exchange Currency',
    body: [
      'Convert money to $TRUST (buy) or $TRUST to money (sell).',
      'A 2% exchange fee applies to all trades.',
      'The rate is volatile \u2014 timing your trades can make or lose a fortune.',
    ],
  },

  'crypto-investments': {
    title: 'INVESTMENTS \u2014 Risky Business',
    body: [
      'Invest $TRUST in projects that mature over time for a payout.',
      'Low risk: Stable returns, long maturation. High risk: Huge returns OR rug pull.',
      'A "rug pull" means you lose your entire investment. The chance is shown per project.',
      'You can have up to 5 active investments at a time.',
    ],
  },

  'nft-marketplace': {
    title: 'NFT MARKETPLACE \u2014 Hype & Hustle',
    body: [
      'Create collections, mint NFTs, and manipulate the hype.',
      'HYPE decays over time. Assign SHILLERS to boost it. Higher hype = higher floor prices.',
      'NFTs have rarities (Common to Mythic) that multiply their value.',
      'SELL individual NFTs at floor price, or RUG PULL an entire collection for 70% of total value.',
      'Rug pull destroys the collection and all its NFTs. The button shows estimated value \u2014 no NFTs or zero hype means nothing to drain.',
    ],
  },
};

/**
 * All valid help topic keys for type checking.
 */
export type HelpTopicKey = keyof typeof HELP_CONTENT;
