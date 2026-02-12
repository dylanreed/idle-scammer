// ABOUTME: Tests for the origin Zustand store
// ABOUTME: Validates selectOrigin, getOriginBonuses, hydrate, reset, and toSaveData

import { useOriginStore } from '../../../src/game/origin/originStore';
import { ORIGINS, NO_ORIGIN_BONUSES } from '../../../src/game/origin/constants';

describe('Origin store', () => {
  beforeEach(() => {
    useOriginStore.getState().reset();
  });

  describe('initial state', () => {
    it('should start with selectedOrigin as null', () => {
      expect(useOriginStore.getState().selectedOrigin).toBeNull();
    });
  });

  describe('selectOrigin', () => {
    it('should set the selected origin', () => {
      useOriginStore.getState().selectOrigin('moms-basement');
      expect(useOriginStore.getState().selectedOrigin).toBe('moms-basement');
    });

    it('should allow changing to a different origin', () => {
      useOriginStore.getState().selectOrigin('moms-basement');
      useOriginStore.getState().selectOrigin('internet-cafe');
      expect(useOriginStore.getState().selectedOrigin).toBe('internet-cafe');
    });

    it('should accept all three origin IDs', () => {
      useOriginStore.getState().selectOrigin('moms-basement');
      expect(useOriginStore.getState().selectedOrigin).toBe('moms-basement');

      useOriginStore.getState().selectOrigin('internet-cafe');
      expect(useOriginStore.getState().selectedOrigin).toBe('internet-cafe');

      useOriginStore.getState().selectOrigin('stolen-phone');
      expect(useOriginStore.getState().selectedOrigin).toBe('stolen-phone');
    });
  });

  describe('getOriginBonuses', () => {
    it('should return NO_ORIGIN_BONUSES when no origin selected', () => {
      const bonuses = useOriginStore.getState().getOriginBonuses();
      expect(bonuses).toEqual(NO_ORIGIN_BONUSES);
    });

    it('should return correct bonuses for moms-basement', () => {
      useOriginStore.getState().selectOrigin('moms-basement');
      const bonuses = useOriginStore.getState().getOriginBonuses();
      expect(bonuses).toEqual(ORIGINS['moms-basement'].bonuses);
    });

    it('should return correct bonuses for internet-cafe', () => {
      useOriginStore.getState().selectOrigin('internet-cafe');
      const bonuses = useOriginStore.getState().getOriginBonuses();
      expect(bonuses).toEqual(ORIGINS['internet-cafe'].bonuses);
    });

    it('should return correct bonuses for stolen-phone', () => {
      useOriginStore.getState().selectOrigin('stolen-phone');
      const bonuses = useOriginStore.getState().getOriginBonuses();
      expect(bonuses).toEqual(ORIGINS['stolen-phone'].bonuses);
    });
  });

  describe('hydrate', () => {
    it('should restore selectedOrigin from save data', () => {
      useOriginStore.getState().hydrate({ selectedOrigin: 'internet-cafe' });
      expect(useOriginStore.getState().selectedOrigin).toBe('internet-cafe');
    });

    it('should restore null origin from save data', () => {
      useOriginStore.getState().selectOrigin('moms-basement');
      useOriginStore.getState().hydrate({ selectedOrigin: null });
      expect(useOriginStore.getState().selectedOrigin).toBeNull();
    });

    it('should overwrite existing state', () => {
      useOriginStore.getState().selectOrigin('moms-basement');
      useOriginStore.getState().hydrate({ selectedOrigin: 'stolen-phone' });
      expect(useOriginStore.getState().selectedOrigin).toBe('stolen-phone');
    });
  });

  describe('reset', () => {
    it('should reset selectedOrigin to null', () => {
      useOriginStore.getState().selectOrigin('internet-cafe');
      useOriginStore.getState().reset();
      expect(useOriginStore.getState().selectedOrigin).toBeNull();
    });
  });

  describe('toSaveData', () => {
    it('should return current state as save data', () => {
      useOriginStore.getState().selectOrigin('stolen-phone');
      const saveData = useOriginStore.getState().toSaveData();
      expect(saveData).toEqual({ selectedOrigin: 'stolen-phone' });
    });

    it('should return null origin for fresh store', () => {
      const saveData = useOriginStore.getState().toSaveData();
      expect(saveData).toEqual({ selectedOrigin: null });
    });
  });
});
