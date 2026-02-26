// ABOUTME: Tests for the trust-based rug pull limit mechanic
// ABOUTME: Validates that rug pulls are gated by floor(trust * 0.01)

import { useCryptoStore } from '../../../src/game/crypto/cryptoStore';
import { useGameStore } from '../../../src/game/store';
import { RUG_PULL_TRUST_FRACTION } from '../../../src/game/crypto/constants';

/**
 * Helper: create a collection with NFTs so it's eligible for rug pulling.
 * Returns the collection ID.
 */
function createRuggableCollection(name: string): string {
  const col = useCryptoStore.getState().createCollection(name);
  if (!col) throw new Error(`Failed to create collection "${name}"`);
  // Mint an NFT so there's something to rug
  useCryptoStore.getState().mintNFT(col.id);
  return col.id;
}

beforeEach(() => {
  useCryptoStore.getState().reset();
  // Reset trust to default (1) for isolation between tests
  useGameStore.getState().setResource('trust', 1);
});

describe('Rug pull trust limit', () => {
  describe('rugPullCollection guard', () => {
    it('should block rug pull when at limit (ruggedCount >= max)', () => {
      // trust=50 → max = floor(50 * 0.01) = 0 → ALL rugs blocked
      useGameStore.getState().setResource('trust', 50);
      const colId = createRuggableCollection('BlockedRug');

      const result = useCryptoStore.getState().rugPullCollection(colId);
      expect(result).toBe(0);

      // Collection should NOT be rugged
      const col = useCryptoStore.getState().collections.find((c) => c.id === colId);
      expect(col?.isRugged).toBe(false);
    });

    it('should allow rug pull when under limit', () => {
      // trust=100 → max = floor(100 * 0.01) = 1 → can rug 1
      useGameStore.getState().setResource('trust', 100);
      const colId = createRuggableCollection('AllowedRug');

      const result = useCryptoStore.getState().rugPullCollection(colId);
      expect(result).toBeGreaterThan(0);

      const col = useCryptoStore.getState().collections.find((c) => c.id === colId);
      expect(col?.isRugged).toBe(true);
    });

    it('should block second rug when limit is 1', () => {
      // trust=100 → max=1. First rug succeeds, second is blocked.
      useGameStore.getState().setResource('trust', 100);
      const col1 = createRuggableCollection('First');
      const col2 = createRuggableCollection('Second');

      const rug1 = useCryptoStore.getState().rugPullCollection(col1);
      expect(rug1).toBeGreaterThan(0);

      const rug2 = useCryptoStore.getState().rugPullCollection(col2);
      expect(rug2).toBe(0);

      // Second collection should remain un-rugged
      const secondCol = useCryptoStore.getState().collections.find((c) => c.id === col2);
      expect(secondCol?.isRugged).toBe(false);
    });

    it('should scale limit with trust (trust=250 → max 2, trust=100 → max 1, trust=50 → max 0)', () => {
      // trust=250 → floor(250*0.01) = 2
      expect(Math.floor(250 * RUG_PULL_TRUST_FRACTION)).toBe(2);
      // trust=100 → floor(100*0.01) = 1
      expect(Math.floor(100 * RUG_PULL_TRUST_FRACTION)).toBe(1);
      // trust=50 → floor(50*0.01) = 0
      expect(Math.floor(50 * RUG_PULL_TRUST_FRACTION)).toBe(0);

      // Functional test: trust=250 allows 2 rugs
      useGameStore.getState().setResource('trust', 250);
      const a = createRuggableCollection('A');
      const b = createRuggableCollection('B');
      const c = createRuggableCollection('C');

      expect(useCryptoStore.getState().rugPullCollection(a)).toBeGreaterThan(0);
      expect(useCryptoStore.getState().rugPullCollection(b)).toBeGreaterThan(0);
      expect(useCryptoStore.getState().rugPullCollection(c)).toBe(0); // blocked at limit
    });

    it('should block all rugs when trust is 0', () => {
      useGameStore.getState().setResource('trust', 0);
      const colId = createRuggableCollection('ZeroTrust');

      const result = useCryptoStore.getState().rugPullCollection(colId);
      expect(result).toBe(0);

      const col = useCryptoStore.getState().collections.find((c) => c.id === colId);
      expect(col?.isRugged).toBe(false);
    });
  });

  describe('getRugPullLimit', () => {
    it('should return correct current and max', () => {
      useGameStore.getState().setResource('trust', 200);
      // max = floor(200 * 0.01) = 2, current = 0
      const limit = useCryptoStore.getState().getRugPullLimit();
      expect(limit).toEqual({ current: 0, max: 2 });
    });

    it('should update current after a rug pull', () => {
      useGameStore.getState().setResource('trust', 300);
      const colId = createRuggableCollection('TrackRug');

      useCryptoStore.getState().rugPullCollection(colId);

      const limit = useCryptoStore.getState().getRugPullLimit();
      expect(limit.current).toBe(1);
      expect(limit.max).toBe(3); // floor(300*0.01)
    });

    it('should return max 0 when trust is 0', () => {
      useGameStore.getState().setResource('trust', 0);
      const limit = useCryptoStore.getState().getRugPullLimit();
      expect(limit).toEqual({ current: 0, max: 0 });
    });

    it('should count only rugged collections in current', () => {
      useGameStore.getState().setResource('trust', 500);
      createRuggableCollection('Unrugged1');
      createRuggableCollection('Unrugged2');
      const rugMe = createRuggableCollection('RugMe');

      useCryptoStore.getState().rugPullCollection(rugMe);

      const limit = useCryptoStore.getState().getRugPullLimit();
      expect(limit.current).toBe(1);
      expect(limit.max).toBe(5); // floor(500*0.01)
    });
  });
});
