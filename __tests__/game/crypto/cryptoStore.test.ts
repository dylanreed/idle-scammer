// ABOUTME: Tests for the crypto Zustand store
// ABOUTME: Validates market ticking, buy/sell quotes, project investment, NFT operations, persistence

import { useCryptoStore } from '../../../src/game/crypto/cryptoStore';
import { useGameStore } from '../../../src/game/store';
import { DEFAULT_MARKET_STATE, DEFAULT_CRYPTO_SAVE_DATA } from '../../../src/game/crypto/types';
import type { CryptoSaveData, MarketState } from '../../../src/game/crypto/types';
import {
  MAX_ACTIVE_PROJECTS,
  MAX_COLLECTIONS,
  BASE_MINT_COST,
  EXCHANGE_FEE,
  BASE_FLOOR_PRICE_PER_HYPE,
  NFT_RARITY_MULTIPLIERS,
  RUG_PULL_FRACTION,
  MAX_HYPE,
} from '../../../src/game/crypto/constants';

// Reset store before each test
beforeEach(() => {
  useCryptoStore.getState().reset();
  // Set trust high enough that rug pull limit doesn't interfere with these tests
  useGameStore.getState().setResource('trust', 100);
});

describe('CryptoStore', () => {
  describe('initial state', () => {
    it('should start with default market state', () => {
      const { market } = useCryptoStore.getState();
      expect(market.exchangeRate).toBe(DEFAULT_MARKET_STATE.exchangeRate);
      expect(market.seed).toBe(DEFAULT_MARKET_STATE.seed);
      expect(market.activeEvent).toBeNull();
      expect(market.totalTicks).toBe(0);
    });

    it('should start with empty projects', () => {
      const { activeProjects, completedProjects } = useCryptoStore.getState();
      expect(activeProjects).toHaveLength(0);
      expect(completedProjects).toHaveLength(0);
    });

    it('should start with empty NFTs', () => {
      const { ownedNFTs, collections } = useCryptoStore.getState();
      expect(ownedNFTs).toHaveLength(0);
      expect(collections).toHaveLength(0);
    });
  });

  describe('tickMarket', () => {
    it('should advance the market state', () => {
      const before = useCryptoStore.getState().market;
      useCryptoStore.getState().tickMarket();
      const after = useCryptoStore.getState().market;

      expect(after.totalTicks).toBe(before.totalTicks + 1);
      expect(after.seed).not.toBe(before.seed);
    });

    it('should be deterministic after reset', () => {
      useCryptoStore.getState().tickMarket();
      const rate1 = useCryptoStore.getState().market.exchangeRate;

      useCryptoStore.getState().reset();
      useCryptoStore.getState().tickMarket();
      const rate2 = useCryptoStore.getState().market.exchangeRate;

      expect(rate1).toBe(rate2);
    });
  });

  describe('getBuyQuote / getSellQuote', () => {
    it('should return crypto amount for money buy', () => {
      const crypto = useCryptoStore.getState().getBuyQuote(1000);
      // 1000 money * (1 - 0.02) / 1000 rate = 0.98
      expect(crypto).toBeCloseTo(0.98, 5);
    });

    it('should return money amount for crypto sell', () => {
      const money = useCryptoStore.getState().getSellQuote(1);
      // 1 * 1000 * (1 - 0.02) = 980
      expect(money).toBeCloseTo(980, 5);
    });

    it('should reflect current exchange rate', () => {
      // Tick market to change rate
      for (let i = 0; i < 10; i++) {
        useCryptoStore.getState().tickMarket();
      }
      const rate = useCryptoStore.getState().getExchangeRate();
      const quote = useCryptoStore.getState().getBuyQuote(rate);
      // Should get ~0.98 crypto (spending exactly 1 crypto worth of money, minus fee)
      expect(quote).toBeCloseTo(1 - EXCHANGE_FEE, 2);
    });
  });

  describe('getExchangeRate', () => {
    it('should return current exchange rate', () => {
      expect(useCryptoStore.getState().getExchangeRate()).toBe(1000);
    });
  });

  describe('investInProject', () => {
    it('should create an active project', () => {
      const project = useCryptoStore.getState().investInProject('stable-coins', 5);
      expect(project).not.toBeNull();
      expect(project!.definitionId).toBe('stable-coins');
      expect(project!.investedAmount).toBe(5);
      expect(useCryptoStore.getState().activeProjects).toHaveLength(1);
    });

    it('should return null for invalid definition ID', () => {
      const project = useCryptoStore.getState().investInProject('nonexistent', 5);
      expect(project).toBeNull();
    });

    it('should return null for zero amount', () => {
      const project = useCryptoStore.getState().investInProject('stable-coins', 0);
      expect(project).toBeNull();
    });

    it('should return null for negative amount', () => {
      const project = useCryptoStore.getState().investInProject('stable-coins', -1);
      expect(project).toBeNull();
    });

    it('should enforce max active projects limit', () => {
      for (let i = 0; i < MAX_ACTIVE_PROJECTS; i++) {
        useCryptoStore.getState().investInProject('stable-coins', 1);
      }
      expect(useCryptoStore.getState().activeProjects).toHaveLength(MAX_ACTIVE_PROJECTS);

      const extra = useCryptoStore.getState().investInProject('stable-coins', 1);
      expect(extra).toBeNull();
      expect(useCryptoStore.getState().activeProjects).toHaveLength(MAX_ACTIVE_PROJECTS);
    });

    it('should determine rug pull at creation time (deterministic)', () => {
      const project1 = useCryptoStore.getState().investInProject('stable-coins', 5);
      useCryptoStore.getState().reset();
      const project2 = useCryptoStore.getState().investInProject('stable-coins', 5);

      expect(project1!.isRugged).toBe(project2!.isRugged);
      expect(project1!.returnMultiplier).toBe(project2!.returnMultiplier);
    });

    it('should set returnMultiplier to 0 when rugged', () => {
      // Use guaranteed-returns which has 80% rug chance
      // Run several to find a rugged one
      let found = false;
      for (let attempt = 0; attempt < 20; attempt++) {
        useCryptoStore.getState().reset();
        // Advance seed to different states
        for (let i = 0; i < attempt; i++) {
          useCryptoStore.getState().tickMarket();
        }
        const project = useCryptoStore.getState().investInProject('guaranteed-returns', 5);
        if (project && project.isRugged) {
          expect(project.returnMultiplier).toBe(0);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });
  });

  describe('isProjectMatured', () => {
    it('should return false for non-existent index', () => {
      expect(useCryptoStore.getState().isProjectMatured(0)).toBe(false);
    });

    it('should return false for recently started project', () => {
      useCryptoStore.getState().investInProject('stable-coins', 5);
      expect(useCryptoStore.getState().isProjectMatured(0)).toBe(false);
    });
  });

  describe('collectProject', () => {
    it('should return 0 for non-existent index', () => {
      expect(useCryptoStore.getState().collectProject(0)).toBe(0);
    });

    it('should move project from active to completed', () => {
      useCryptoStore.getState().investInProject('stable-coins', 5);
      expect(useCryptoStore.getState().activeProjects).toHaveLength(1);

      useCryptoStore.getState().collectProject(0);
      expect(useCryptoStore.getState().activeProjects).toHaveLength(0);
      expect(useCryptoStore.getState().completedProjects).toHaveLength(1);
    });

    it('should return payout based on invested amount and multiplier', () => {
      const project = useCryptoStore.getState().investInProject('stable-coins', 10);
      expect(project).not.toBeNull();

      const payout = useCryptoStore.getState().collectProject(0);
      if (project!.isRugged) {
        expect(payout).toBe(0);
      } else {
        expect(payout).toBeCloseTo(10 * project!.returnMultiplier, 5);
      }
    });
  });

  describe('createCollection', () => {
    it('should create a collection with initial hype of 50', () => {
      const collection = useCryptoStore.getState().createCollection('Bored Scammers');
      expect(collection).not.toBeNull();
      expect(collection!.name).toBe('Bored Scammers');
      expect(collection!.hype).toBe(50);
      expect(collection!.isRugged).toBe(false);
      expect(useCryptoStore.getState().collections).toHaveLength(1);
    });

    it('should return null for empty name', () => {
      expect(useCryptoStore.getState().createCollection('')).toBeNull();
      expect(useCryptoStore.getState().createCollection('   ')).toBeNull();
    });

    it('should enforce max collections limit', () => {
      for (let i = 0; i < MAX_COLLECTIONS; i++) {
        useCryptoStore.getState().createCollection(`Collection ${i}`);
      }
      expect(useCryptoStore.getState().collections).toHaveLength(MAX_COLLECTIONS);

      const extra = useCryptoStore.getState().createCollection('One More');
      expect(extra).toBeNull();
    });

    it('should trim whitespace from name', () => {
      const collection = useCryptoStore.getState().createCollection('  Spaced Out  ');
      expect(collection!.name).toBe('Spaced Out');
    });
  });

  describe('mintNFT', () => {
    it('should mint an NFT in an existing collection', () => {
      const collection = useCryptoStore.getState().createCollection('Test');
      const nft = useCryptoStore.getState().mintNFT(collection!.id);

      expect(nft).not.toBeNull();
      expect(nft!.collectionId).toBe(collection!.id);
      expect(nft!.mintCost).toBe(BASE_MINT_COST);
      expect(useCryptoStore.getState().ownedNFTs).toHaveLength(1);
    });

    it('should return null for non-existent collection', () => {
      expect(useCryptoStore.getState().mintNFT('fake-id')).toBeNull();
    });

    it('should return null for rugged collection', () => {
      const collection = useCryptoStore.getState().createCollection('Rug Me');
      useCryptoStore.getState().rugPullCollection(collection!.id);
      expect(useCryptoStore.getState().mintNFT(collection!.id)).toBeNull();
    });

    it('should assign a valid rarity', () => {
      const collection = useCryptoStore.getState().createCollection('Test');
      const validRarities = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

      for (let i = 0; i < 20; i++) {
        const nft = useCryptoStore.getState().mintNFT(collection!.id);
        expect(validRarities).toContain(nft!.rarity);
      }
    });
  });

  describe('sellNFT', () => {
    it('should remove the NFT and return floor price value', () => {
      const collection = useCryptoStore.getState().createCollection('Test');
      const nft = useCryptoStore.getState().mintNFT(collection!.id);

      const expectedPrice =
        collection!.hype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[nft!.rarity];
      const received = useCryptoStore.getState().sellNFT(nft!.id);

      expect(received).toBeCloseTo(expectedPrice, 5);
      expect(useCryptoStore.getState().ownedNFTs).toHaveLength(0);
    });

    it('should return 0 for non-existent NFT', () => {
      expect(useCryptoStore.getState().sellNFT('fake-id')).toBe(0);
    });
  });

  describe('rugPullCollection', () => {
    it('should mark collection as rugged', () => {
      const collection = useCryptoStore.getState().createCollection('Rug Corp');
      useCryptoStore.getState().rugPullCollection(collection!.id);

      const updated = useCryptoStore.getState().collections[0];
      expect(updated.isRugged).toBe(true);
      expect(updated.hype).toBe(0);
    });

    it('should return 70% of total collection value', () => {
      const collection = useCryptoStore.getState().createCollection('Rug Corp');
      // Mint some NFTs
      const nfts = [];
      for (let i = 0; i < 5; i++) {
        nfts.push(useCryptoStore.getState().mintNFT(collection!.id));
      }

      // Calculate expected value
      let totalValue = 0;
      for (const nft of nfts) {
        totalValue +=
          collection!.hype * BASE_FLOOR_PRICE_PER_HYPE * NFT_RARITY_MULTIPLIERS[nft!.rarity];
      }
      const expectedRug = totalValue * RUG_PULL_FRACTION;

      const received = useCryptoStore.getState().rugPullCollection(collection!.id);
      expect(received).toBeCloseTo(expectedRug, 5);
    });

    it('should remove all NFTs from the collection', () => {
      const collection = useCryptoStore.getState().createCollection('Rug Corp');
      for (let i = 0; i < 3; i++) {
        useCryptoStore.getState().mintNFT(collection!.id);
      }
      expect(useCryptoStore.getState().ownedNFTs).toHaveLength(3);

      useCryptoStore.getState().rugPullCollection(collection!.id);
      expect(useCryptoStore.getState().ownedNFTs).toHaveLength(0);
    });

    it('should return 0 for already rugged collection', () => {
      const collection = useCryptoStore.getState().createCollection('Rug Corp');
      useCryptoStore.getState().rugPullCollection(collection!.id);
      expect(useCryptoStore.getState().rugPullCollection(collection!.id)).toBe(0);
    });

    it('should return 0 for non-existent collection', () => {
      expect(useCryptoStore.getState().rugPullCollection('fake-id')).toBe(0);
    });
  });

  describe('setShillers', () => {
    it('should set shiller count on a collection', () => {
      const collection = useCryptoStore.getState().createCollection('Shill City');
      useCryptoStore.getState().setShillers(collection!.id, 5);

      expect(useCryptoStore.getState().collections[0].shillers).toBe(5);
    });

    it('should clamp negative values to 0', () => {
      const collection = useCryptoStore.getState().createCollection('Shill City');
      useCryptoStore.getState().setShillers(collection!.id, -3);

      expect(useCryptoStore.getState().collections[0].shillers).toBe(0);
    });
  });

  describe('tickCollections', () => {
    it('should decay hype over time without shillers', () => {
      const collection = useCryptoStore.getState().createCollection('Decaying');
      const initialHype = useCryptoStore.getState().collections[0].hype;

      useCryptoStore.getState().tickCollections(5000); // 5 seconds

      const newHype = useCryptoStore.getState().collections[0].hype;
      expect(newHype).toBeLessThan(initialHype);
    });

    it('should boost hype with shillers', () => {
      const collection = useCryptoStore.getState().createCollection('Shilled');
      useCryptoStore.getState().setShillers(collection!.id, 100); // lots of shillers

      const initialHype = useCryptoStore.getState().collections[0].hype;
      useCryptoStore.getState().tickCollections(1000); // 1 second

      const newHype = useCryptoStore.getState().collections[0].hype;
      // With enough shillers, hype should increase
      expect(newHype).toBeGreaterThan(initialHype);
    });

    it('should clamp hype to MAX_HYPE', () => {
      const collection = useCryptoStore.getState().createCollection('Maxed');
      useCryptoStore.getState().setShillers(collection!.id, 1000);

      // Tick many times
      for (let i = 0; i < 100; i++) {
        useCryptoStore.getState().tickCollections(1000);
      }

      expect(useCryptoStore.getState().collections[0].hype).toBeLessThanOrEqual(MAX_HYPE);
    });

    it('should not tick rugged collections', () => {
      const collection = useCryptoStore.getState().createCollection('Rugged');
      useCryptoStore.getState().rugPullCollection(collection!.id);

      useCryptoStore.getState().tickCollections(5000);
      expect(useCryptoStore.getState().collections[0].hype).toBe(0);
    });

    it('should do nothing for zero or negative deltaMs', () => {
      const collection = useCryptoStore.getState().createCollection('Static');
      const before = useCryptoStore.getState().collections[0].hype;

      useCryptoStore.getState().tickCollections(0);
      expect(useCryptoStore.getState().collections[0].hype).toBe(before);

      useCryptoStore.getState().tickCollections(-1000);
      expect(useCryptoStore.getState().collections[0].hype).toBe(before);
    });
  });

  describe('getCollectionFloorPrice', () => {
    it('should return hype-based floor price', () => {
      const collection = useCryptoStore.getState().createCollection('Floor Test');
      const expected = collection!.hype * BASE_FLOOR_PRICE_PER_HYPE;
      expect(useCryptoStore.getState().getCollectionFloorPrice(collection!.id)).toBeCloseTo(expected, 5);
    });

    it('should return 0 for non-existent collection', () => {
      expect(useCryptoStore.getState().getCollectionFloorPrice('fake-id')).toBe(0);
    });
  });

  describe('reset', () => {
    it('should restore all state to defaults', () => {
      // Dirty the state
      useCryptoStore.getState().tickMarket();
      useCryptoStore.getState().investInProject('stable-coins', 5);
      useCryptoStore.getState().createCollection('Test');

      useCryptoStore.getState().reset();

      const state = useCryptoStore.getState();
      expect(state.market.exchangeRate).toBe(DEFAULT_MARKET_STATE.exchangeRate);
      expect(state.market.seed).toBe(DEFAULT_MARKET_STATE.seed);
      expect(state.activeProjects).toHaveLength(0);
      expect(state.completedProjects).toHaveLength(0);
      expect(state.ownedNFTs).toHaveLength(0);
      expect(state.collections).toHaveLength(0);
    });
  });

  describe('hydrate / toSaveData', () => {
    it('should round-trip through save/load', () => {
      // Set up some state
      useCryptoStore.getState().tickMarket();
      useCryptoStore.getState().tickMarket();
      useCryptoStore.getState().investInProject('stable-coins', 5);
      useCryptoStore.getState().createCollection('Saved Collection');
      useCryptoStore.getState().mintNFT(useCryptoStore.getState().collections[0].id);

      const saveData = useCryptoStore.getState().toSaveData();

      // Reset and restore
      useCryptoStore.getState().reset();
      useCryptoStore.getState().hydrate(saveData);

      const restored = useCryptoStore.getState();
      expect(restored.market.totalTicks).toBe(2);
      expect(restored.activeProjects).toHaveLength(1);
      expect(restored.collections).toHaveLength(1);
      expect(restored.ownedNFTs).toHaveLength(1);
    });

    it('should hydrate from default save data', () => {
      useCryptoStore.getState().tickMarket();
      useCryptoStore.getState().hydrate(DEFAULT_CRYPTO_SAVE_DATA);

      const state = useCryptoStore.getState();
      expect(state.market.exchangeRate).toBe(1000);
      expect(state.market.totalTicks).toBe(0);
    });
  });
});
