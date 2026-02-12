// ABOUTME: Tests for crypto system type definitions
// ABOUTME: Validates MarketState, ProjectDefinition, ProjectState, NFTItem, NFTCollection, CryptoSaveData

import type {
  MarketState,
  MarketEvent,
  MarketEventType,
  ProjectDefinition,
  ProjectState,
  NFTRarity,
  NFTItem,
  NFTCollection,
  CryptoSaveData,
} from '../../../src/game/crypto/types';
import { DEFAULT_MARKET_STATE, DEFAULT_CRYPTO_SAVE_DATA } from '../../../src/game/crypto/types';

describe('Crypto types', () => {
  describe('MarketState', () => {
    it('should have all required fields', () => {
      const state: MarketState = {
        exchangeRate: 1000,
        seed: 42,
        activeEvent: null,
        eventTicksRemaining: 0,
        totalTicks: 0,
      };

      expect(state.exchangeRate).toBe(1000);
      expect(state.seed).toBe(42);
      expect(state.activeEvent).toBeNull();
      expect(state.eventTicksRemaining).toBe(0);
      expect(state.totalTicks).toBe(0);
    });

    it('should support an active market event', () => {
      const event: MarketEvent = {
        type: 'bull-run',
        driftModifier: 5,
        volatilityModifier: 1.5,
      };
      const state: MarketState = {
        exchangeRate: 1200,
        seed: 123,
        activeEvent: event,
        eventTicksRemaining: 10,
        totalTicks: 50,
      };

      expect(state.activeEvent).not.toBeNull();
      expect(state.activeEvent!.type).toBe('bull-run');
      expect(state.eventTicksRemaining).toBe(10);
    });
  });

  describe('MarketEvent', () => {
    it('should have type, driftModifier, and volatilityModifier', () => {
      const event: MarketEvent = {
        type: 'crash',
        driftModifier: -8,
        volatilityModifier: 3,
      };

      expect(event.type).toBe('crash');
      expect(event.driftModifier).toBe(-8);
      expect(event.volatilityModifier).toBe(3);
    });
  });

  describe('MarketEventType', () => {
    it('should accept all valid event types', () => {
      const types: MarketEventType[] = [
        'bull-run',
        'crash',
        'whale-dump',
        'elon-tweet',
        'regulation-scare',
      ];
      expect(types).toHaveLength(5);
    });
  });

  describe('ProjectDefinition', () => {
    it('should have all required fields', () => {
      const project: ProjectDefinition = {
        id: 'stable-coins',
        name: '"Stable" Coins',
        risk: 'low',
        minReturn: 1.1,
        maxReturn: 1.5,
        rugChance: 0.02,
        durationMs: 60000,
        description: 'Totally safe.',
      };

      expect(project.id).toBe('stable-coins');
      expect(project.risk).toBe('low');
      expect(project.minReturn).toBeLessThan(project.maxReturn);
      expect(project.rugChance).toBeGreaterThanOrEqual(0);
      expect(project.rugChance).toBeLessThanOrEqual(1);
    });
  });

  describe('ProjectState', () => {
    it('should have all required fields', () => {
      const state: ProjectState = {
        definitionId: 'meme-coins',
        investedAmount: 5.5,
        startedAt: Date.now(),
        isRugged: false,
        returnMultiplier: 2.3,
      };

      expect(state.definitionId).toBe('meme-coins');
      expect(state.investedAmount).toBe(5.5);
      expect(state.isRugged).toBe(false);
      expect(state.returnMultiplier).toBe(2.3);
    });

    it('should represent a rugged project', () => {
      const state: ProjectState = {
        definitionId: 'guaranteed-returns',
        investedAmount: 10,
        startedAt: Date.now(),
        isRugged: true,
        returnMultiplier: 0,
      };

      expect(state.isRugged).toBe(true);
      expect(state.returnMultiplier).toBe(0);
    });
  });

  describe('NFTRarity', () => {
    it('should accept all 5 rarity tiers', () => {
      const rarities: NFTRarity[] = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];
      expect(rarities).toHaveLength(5);
    });
  });

  describe('NFTItem', () => {
    it('should have all required fields', () => {
      const nft: NFTItem = {
        id: 'nft-001',
        collectionId: 'col-001',
        rarity: 'rare',
        mintCost: 0.1,
        mintedAt: Date.now(),
      };

      expect(nft.id).toBe('nft-001');
      expect(nft.collectionId).toBe('col-001');
      expect(nft.rarity).toBe('rare');
      expect(nft.mintCost).toBe(0.1);
    });
  });

  describe('NFTCollection', () => {
    it('should have all required fields', () => {
      const collection: NFTCollection = {
        id: 'col-001',
        name: 'Bored Scammers',
        hype: 50,
        shillers: 2,
        isRugged: false,
        rugPullValue: 0,
        createdAt: Date.now(),
      };

      expect(collection.id).toBe('col-001');
      expect(collection.name).toBe('Bored Scammers');
      expect(collection.hype).toBe(50);
      expect(collection.shillers).toBe(2);
      expect(collection.isRugged).toBe(false);
    });

    it('should represent a rugged collection', () => {
      const collection: NFTCollection = {
        id: 'col-002',
        name: 'Rug Corp',
        hype: 0,
        shillers: 0,
        isRugged: true,
        rugPullValue: 15.5,
        createdAt: Date.now(),
      };

      expect(collection.isRugged).toBe(true);
      expect(collection.rugPullValue).toBe(15.5);
    });
  });

  describe('CryptoSaveData', () => {
    it('should have all required fields', () => {
      const saveData: CryptoSaveData = {
        market: DEFAULT_MARKET_STATE,
        activeProjects: [],
        completedProjects: [],
        ownedNFTs: [],
        collections: [],
      };

      expect(saveData.market.exchangeRate).toBe(1000);
      expect(saveData.activeProjects).toHaveLength(0);
      expect(saveData.completedProjects).toHaveLength(0);
      expect(saveData.ownedNFTs).toHaveLength(0);
      expect(saveData.collections).toHaveLength(0);
    });
  });

  describe('DEFAULT_MARKET_STATE', () => {
    it('should start at base exchange rate of 1000', () => {
      expect(DEFAULT_MARKET_STATE.exchangeRate).toBe(1000);
    });

    it('should have seed 42', () => {
      expect(DEFAULT_MARKET_STATE.seed).toBe(42);
    });

    it('should have no active event', () => {
      expect(DEFAULT_MARKET_STATE.activeEvent).toBeNull();
      expect(DEFAULT_MARKET_STATE.eventTicksRemaining).toBe(0);
    });

    it('should start at 0 total ticks', () => {
      expect(DEFAULT_MARKET_STATE.totalTicks).toBe(0);
    });
  });

  describe('DEFAULT_CRYPTO_SAVE_DATA', () => {
    it('should have default market state', () => {
      expect(DEFAULT_CRYPTO_SAVE_DATA.market.exchangeRate).toBe(1000);
    });

    it('should have empty arrays for all collections', () => {
      expect(DEFAULT_CRYPTO_SAVE_DATA.activeProjects).toHaveLength(0);
      expect(DEFAULT_CRYPTO_SAVE_DATA.completedProjects).toHaveLength(0);
      expect(DEFAULT_CRYPTO_SAVE_DATA.ownedNFTs).toHaveLength(0);
      expect(DEFAULT_CRYPTO_SAVE_DATA.collections).toHaveLength(0);
    });
  });
});
