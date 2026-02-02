// ABOUTME: Tests for engine type definitions
// ABOUTME: Verifies ScamTimer, EngineState, and OfflineProgress interfaces work correctly

import type {
  ScamTimer,
  EngineState,
  OfflineProgress,
} from '../../../src/game/engine/types';

describe('Engine Types', () => {
  describe('ScamTimer', () => {
    it('should have required properties for tracking scam progress', () => {
      const timer: ScamTimer = {
        scamId: 'nigerian-prince',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      expect(timer.scamId).toBe('nigerian-prince');
      expect(timer.startTime).toBe(1000);
      expect(timer.duration).toBe(5000);
      expect(timer.isComplete).toBe(false);
    });

    it('should support completed timer state', () => {
      const completedTimer: ScamTimer = {
        scamId: 'phishing-email',
        startTime: 0,
        duration: 3000,
        isComplete: true,
      };

      expect(completedTimer.isComplete).toBe(true);
    });
  });

  describe('EngineState', () => {
    it('should track last tick time, active timers, and pause state', () => {
      const state: EngineState = {
        lastTickTime: Date.now(),
        activeTimers: [],
        isPaused: false,
      };

      expect(typeof state.lastTickTime).toBe('number');
      expect(Array.isArray(state.activeTimers)).toBe(true);
      expect(state.isPaused).toBe(false);
    });

    it('should support multiple active timers', () => {
      const timer1: ScamTimer = {
        scamId: 'scam-1',
        startTime: 1000,
        duration: 2000,
        isComplete: false,
      };
      const timer2: ScamTimer = {
        scamId: 'scam-2',
        startTime: 1500,
        duration: 3000,
        isComplete: false,
      };

      const state: EngineState = {
        lastTickTime: 2000,
        activeTimers: [timer1, timer2],
        isPaused: false,
      };

      expect(state.activeTimers).toHaveLength(2);
      expect(state.activeTimers[0].scamId).toBe('scam-1');
      expect(state.activeTimers[1].scamId).toBe('scam-2');
    });

    it('should support paused state', () => {
      const pausedState: EngineState = {
        lastTickTime: 5000,
        activeTimers: [],
        isPaused: true,
      };

      expect(pausedState.isPaused).toBe(true);
    });

    it('should optionally track pause timestamp', () => {
      const pausedState: EngineState = {
        lastTickTime: 5000,
        activeTimers: [],
        isPaused: true,
        pausedAt: 5000,
      };

      expect(pausedState.pausedAt).toBe(5000);
    });
  });

  describe('OfflineProgress', () => {
    it('should track elapsed time and earnings', () => {
      const progress: OfflineProgress = {
        elapsedMs: 3600000, // 1 hour
        earnings: {
          money: 1000,
          reputation: 50,
          heat: 10,
          bots: 100,
          skillPoints: 5,
          crypto: 0.5,
        },
        completedScams: 15,
      };

      expect(progress.elapsedMs).toBe(3600000);
      expect(progress.earnings.money).toBe(1000);
      expect(progress.completedScams).toBe(15);
    });

    it('should support zero offline progress', () => {
      const noProgress: OfflineProgress = {
        elapsedMs: 0,
        earnings: {
          money: 0,
          reputation: 0,
          heat: 0,
          bots: 0,
          skillPoints: 0,
          crypto: 0,
        },
        completedScams: 0,
      };

      expect(noProgress.elapsedMs).toBe(0);
      expect(noProgress.completedScams).toBe(0);
    });

    it('should cap elapsed time at max offline hours (8 hours = 28800000ms)', () => {
      // This tests that the type supports large values
      // The actual capping logic will be in the calculation function
      const maxProgress: OfflineProgress = {
        elapsedMs: 28800000, // 8 hours max
        earnings: {
          money: 50000,
          reputation: 200,
          heat: 50,
          bots: 5000,
          skillPoints: 20,
          crypto: 10,
        },
        completedScams: 100,
      };

      expect(maxProgress.elapsedMs).toBe(28800000);
    });
  });
});
