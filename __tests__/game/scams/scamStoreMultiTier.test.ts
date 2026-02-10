// ABOUTME: Tests for scam store with all 5 tiers of scams
// ABOUTME: Validates that all 50 scams are initialized, locked/unlocked correctly, and can be managed

import {
  useScamStore,
  getInitialScamState,
  createScamState,
} from '../../../src/game/scams/scamStore';
import {
  ALL_SCAMS,
  BOT_FARMS,
  NIGERIAN_PRINCE_EMAILS,
} from '../../../src/game/scams/definitions';
import { TIER_2_SCAMS } from '../../../src/game/scams/tier2';
import { TIER_3_SCAMS } from '../../../src/game/scams/tier3';
import { TIER_4_SCAMS } from '../../../src/game/scams/tier4';
import { TIER_5_SCAMS } from '../../../src/game/scams/tier5';

describe('ScamStore - Multi-Tier Support', () => {
  beforeEach(() => {
    useScamStore.setState(useScamStore.getInitialState());
  });

  describe('getInitialScamState - all tiers', () => {
    it('should include all 50 scams', () => {
      const state = getInitialScamState();
      const scamIds = Object.keys(state);

      expect(scamIds).toHaveLength(50);
    });

    it('should include Bot Farms and all Tier 1 scams', () => {
      const state = getInitialScamState();

      expect(state[BOT_FARMS.id]).toBeDefined();

      ALL_SCAMS.filter((s) => s.tier === 1).forEach((scam) => {
        expect(state[scam.id]).toBeDefined();
        expect(state[scam.id].scamId).toBe(scam.id);
      });
    });

    it('should include all Tier 2 scams', () => {
      const state = getInitialScamState();

      TIER_2_SCAMS.forEach((scam) => {
        expect(state[scam.id]).toBeDefined();
        expect(state[scam.id].scamId).toBe(scam.id);
      });
    });

    it('should include all Tier 3 scams', () => {
      const state = getInitialScamState();

      TIER_3_SCAMS.forEach((scam) => {
        expect(state[scam.id]).toBeDefined();
        expect(state[scam.id].scamId).toBe(scam.id);
      });
    });

    it('should include all Tier 4 scams', () => {
      const state = getInitialScamState();

      TIER_4_SCAMS.forEach((scam) => {
        expect(state[scam.id]).toBeDefined();
        expect(state[scam.id].scamId).toBe(scam.id);
      });
    });

    it('should include all Tier 5 scams', () => {
      const state = getInitialScamState();

      TIER_5_SCAMS.forEach((scam) => {
        expect(state[scam.id]).toBeDefined();
        expect(state[scam.id].scamId).toBe(scam.id);
      });
    });
  });

  describe('initial lock state', () => {
    it('Bot Farms should start unlocked', () => {
      const state = getInitialScamState();

      expect(state[BOT_FARMS.id].isUnlocked).toBe(true);
    });

    it('Nigerian Prince Emails should start unlocked', () => {
      const state = getInitialScamState();

      expect(state[NIGERIAN_PRINCE_EMAILS.id].isUnlocked).toBe(true);
    });

    it('all other Tier 1 scams should start locked', () => {
      const state = getInitialScamState();

      const tier1Scams = ALL_SCAMS.filter((s) => s.tier === 1);

      tier1Scams.forEach((scam) => {
        // Skip Bot Farms and Nigerian Prince (both start unlocked)
        if (scam.id === BOT_FARMS.id || scam.id === NIGERIAN_PRINCE_EMAILS.id) {
          return;
        }

        expect(state[scam.id].isUnlocked).toBe(false);
      });
    });

    it('all Tier 2 scams should start locked', () => {
      const state = getInitialScamState();

      TIER_2_SCAMS.forEach((scam) => {
        expect(state[scam.id].isUnlocked).toBe(false);
      });
    });

    it('all Tier 3 scams should start locked', () => {
      const state = getInitialScamState();

      TIER_3_SCAMS.forEach((scam) => {
        expect(state[scam.id].isUnlocked).toBe(false);
      });
    });

    it('all Tier 4 scams should start locked', () => {
      const state = getInitialScamState();

      TIER_4_SCAMS.forEach((scam) => {
        expect(state[scam.id].isUnlocked).toBe(false);
      });
    });

    it('all Tier 5 scams should start locked', () => {
      const state = getInitialScamState();

      TIER_5_SCAMS.forEach((scam) => {
        expect(state[scam.id].isUnlocked).toBe(false);
      });
    });
  });

  describe('unlocking higher tier scams', () => {
    it('should be able to unlock a Tier 2 scam', () => {
      const { unlockScam } = useScamStore.getState();
      const tier2Scam = TIER_2_SCAMS[0];

      unlockScam(tier2Scam.id);

      const state = useScamStore.getState().scams[tier2Scam.id];
      expect(state.isUnlocked).toBe(true);
    });

    it('should be able to unlock a Tier 3 scam', () => {
      const { unlockScam } = useScamStore.getState();
      const tier3Scam = TIER_3_SCAMS[0];

      unlockScam(tier3Scam.id);

      const state = useScamStore.getState().scams[tier3Scam.id];
      expect(state.isUnlocked).toBe(true);
    });

    it('should be able to unlock a Tier 4 scam', () => {
      const { unlockScam } = useScamStore.getState();
      const tier4Scam = TIER_4_SCAMS[0];

      unlockScam(tier4Scam.id);

      const state = useScamStore.getState().scams[tier4Scam.id];
      expect(state.isUnlocked).toBe(true);
    });

    it('should be able to unlock a Tier 5 scam', () => {
      const { unlockScam } = useScamStore.getState();
      const tier5Scam = TIER_5_SCAMS[0];

      unlockScam(tier5Scam.id);

      const state = useScamStore.getState().scams[tier5Scam.id];
      expect(state.isUnlocked).toBe(true);
    });

    it('should be able to unlock multiple scams from different tiers', () => {
      const { unlockScam } = useScamStore.getState();

      unlockScam(TIER_2_SCAMS[0].id);
      unlockScam(TIER_3_SCAMS[0].id);
      unlockScam(TIER_4_SCAMS[0].id);
      unlockScam(TIER_5_SCAMS[0].id);

      const scams = useScamStore.getState().scams;
      expect(scams[TIER_2_SCAMS[0].id].isUnlocked).toBe(true);
      expect(scams[TIER_3_SCAMS[0].id].isUnlocked).toBe(true);
      expect(scams[TIER_4_SCAMS[0].id].isUnlocked).toBe(true);
      expect(scams[TIER_5_SCAMS[0].id].isUnlocked).toBe(true);
    });
  });

  describe('upgrading higher tier scams', () => {
    it('should be able to upgrade an unlocked Tier 2 scam', () => {
      const { unlockScam, upgradeScam } = useScamStore.getState();
      const tier2Scam = TIER_2_SCAMS[1];

      unlockScam(tier2Scam.id);
      upgradeScam(tier2Scam.id);
      upgradeScam(tier2Scam.id);

      const state = useScamStore.getState().scams[tier2Scam.id];
      expect(state.level).toBe(3);
    });

    it('should be able to upgrade an unlocked Tier 3 scam', () => {
      const { unlockScam, upgradeScam } = useScamStore.getState();
      const tier3Scam = TIER_3_SCAMS[2];

      unlockScam(tier3Scam.id);
      upgradeScam(tier3Scam.id);
      upgradeScam(tier3Scam.id);
      upgradeScam(tier3Scam.id);

      const state = useScamStore.getState().scams[tier3Scam.id];
      expect(state.level).toBe(4);
    });

    it('should be able to upgrade an unlocked Tier 4 scam', () => {
      const { unlockScam, upgradeScam } = useScamStore.getState();
      const tier4Scam = TIER_4_SCAMS[3];

      unlockScam(tier4Scam.id);
      for (let i = 0; i < 9; i++) {
        upgradeScam(tier4Scam.id);
      }

      const state = useScamStore.getState().scams[tier4Scam.id];
      expect(state.level).toBe(10);
    });

    it('should be able to upgrade an unlocked Tier 5 scam', () => {
      const { unlockScam, upgradeScam } = useScamStore.getState();
      const tier5Scam = TIER_5_SCAMS[4];

      unlockScam(tier5Scam.id);
      for (let i = 0; i < 49; i++) {
        upgradeScam(tier5Scam.id);
      }

      const state = useScamStore.getState().scams[tier5Scam.id];
      expect(state.level).toBe(50);
    });

    it('should not upgrade a locked Tier 2+ scam', () => {
      const { upgradeScam } = useScamStore.getState();
      const tier3Scam = TIER_3_SCAMS[0];

      // Try to upgrade without unlocking
      upgradeScam(tier3Scam.id);

      const state = useScamStore.getState().scams[tier3Scam.id];
      expect(state.level).toBe(1);
      expect(state.isUnlocked).toBe(false);
    });
  });

  describe('resetScams - all tiers', () => {
    it('should reset all 50 scams to initial state', () => {
      const { unlockScam, upgradeScam, resetScams } = useScamStore.getState();

      // Make progress across tiers
      upgradeScam(BOT_FARMS.id);
      upgradeScam(NIGERIAN_PRINCE_EMAILS.id);

      unlockScam(TIER_2_SCAMS[0].id);
      upgradeScam(TIER_2_SCAMS[0].id);

      unlockScam(TIER_3_SCAMS[0].id);
      upgradeScam(TIER_3_SCAMS[0].id);

      // Reset everything
      resetScams();

      const scams = useScamStore.getState().scams;

      // Verify we still have 50 scams
      expect(Object.keys(scams)).toHaveLength(50);

      // Verify reset state
      expect(scams[BOT_FARMS.id].level).toBe(1);
      expect(scams[BOT_FARMS.id].isUnlocked).toBe(true);

      expect(scams[NIGERIAN_PRINCE_EMAILS.id].level).toBe(1);
      expect(scams[NIGERIAN_PRINCE_EMAILS.id].isUnlocked).toBe(true);

      expect(scams[TIER_2_SCAMS[0].id].level).toBe(1);
      expect(scams[TIER_2_SCAMS[0].id].isUnlocked).toBe(false);

      expect(scams[TIER_3_SCAMS[0].id].level).toBe(1);
      expect(scams[TIER_3_SCAMS[0].id].isUnlocked).toBe(false);
    });

    it('should bring back all 50 scams after reset', () => {
      const { resetScams } = useScamStore.getState();

      resetScams();

      const scams = useScamStore.getState().scams;
      const allScamIds = ALL_SCAMS.map((s) => s.id);

      allScamIds.forEach((scamId) => {
        expect(scams[scamId]).toBeDefined();
      });
    });

    it('should reset all Tier 2-5 scams to locked', () => {
      const { unlockScam, resetScams } = useScamStore.getState();

      // Unlock some higher tier scams
      TIER_2_SCAMS.forEach((scam) => unlockScam(scam.id));
      TIER_3_SCAMS.forEach((scam) => unlockScam(scam.id));

      resetScams();

      const scams = useScamStore.getState().scams;

      // All T2-T5 should be locked
      [...TIER_2_SCAMS, ...TIER_3_SCAMS, ...TIER_4_SCAMS, ...TIER_5_SCAMS].forEach((scam) => {
        expect(scams[scam.id].isUnlocked).toBe(false);
      });
    });

    it('should preserve Bot Farms and Nigerian Prince as unlocked after reset', () => {
      const { resetScams } = useScamStore.getState();

      resetScams();

      const scams = useScamStore.getState().scams;
      expect(scams[BOT_FARMS.id].isUnlocked).toBe(true);
      expect(scams[NIGERIAN_PRINCE_EMAILS.id].isUnlocked).toBe(true);
    });
  });

  describe('getScamState - all tiers', () => {
    it('should retrieve state for any scam by ID', () => {
      const { getScamState } = useScamStore.getState();

      // Test one scam from each tier
      const botFarmsState = getScamState(BOT_FARMS.id);
      expect(botFarmsState).toBeDefined();
      expect(botFarmsState?.scamId).toBe(BOT_FARMS.id);

      const tier2State = getScamState(TIER_2_SCAMS[0].id);
      expect(tier2State).toBeDefined();
      expect(tier2State?.scamId).toBe(TIER_2_SCAMS[0].id);

      const tier3State = getScamState(TIER_3_SCAMS[0].id);
      expect(tier3State).toBeDefined();
      expect(tier3State?.scamId).toBe(TIER_3_SCAMS[0].id);

      const tier4State = getScamState(TIER_4_SCAMS[0].id);
      expect(tier4State).toBeDefined();
      expect(tier4State?.scamId).toBe(TIER_4_SCAMS[0].id);

      const tier5State = getScamState(TIER_5_SCAMS[0].id);
      expect(tier5State).toBeDefined();
      expect(tier5State?.scamId).toBe(TIER_5_SCAMS[0].id);
    });

    it('should return correct state for all 50 scams', () => {
      const { getScamState } = useScamStore.getState();

      ALL_SCAMS.forEach((scam) => {
        const state = getScamState(scam.id);
        expect(state).toBeDefined();
        expect(state?.scamId).toBe(scam.id);
        expect(state?.level).toBe(1);
        expect(state?.timesCompleted).toBe(0);
      });
    });
  });

  describe('incrementCompletion - all tiers', () => {
    it('should increment completions for unlocked Tier 2 scams', () => {
      const { unlockScam, incrementCompletion } = useScamStore.getState();
      const tier2Scam = TIER_2_SCAMS[0];

      unlockScam(tier2Scam.id);
      incrementCompletion(tier2Scam.id);
      incrementCompletion(tier2Scam.id);

      const state = useScamStore.getState().scams[tier2Scam.id];
      expect(state.timesCompleted).toBe(2);
    });

    it('should increment completions for unlocked Tier 3 scams', () => {
      const { unlockScam, incrementCompletion } = useScamStore.getState();
      const tier3Scam = TIER_3_SCAMS[5];

      unlockScam(tier3Scam.id);
      for (let i = 0; i < 25; i++) {
        incrementCompletion(tier3Scam.id);
      }

      const state = useScamStore.getState().scams[tier3Scam.id];
      expect(state.timesCompleted).toBe(25);
    });

    it('should not increment completions for locked higher tier scams', () => {
      const { incrementCompletion } = useScamStore.getState();
      const tier4Scam = TIER_4_SCAMS[0];

      // Try to increment without unlocking
      incrementCompletion(tier4Scam.id);

      const state = useScamStore.getState().scams[tier4Scam.id];
      expect(state.timesCompleted).toBe(0);
    });
  });
});
