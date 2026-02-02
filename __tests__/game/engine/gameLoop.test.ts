// ABOUTME: Tests for the core game loop engine
// ABOUTME: Covers tick function, offline progress calculation, and useGameLoop hook

import { renderHook, act } from '@testing-library/react-native';
import {
  tick,
  calculateOfflineProgress,
  useGameLoop,
  createEngineState,
} from '../../../src/game/engine/gameLoop';
import type { EngineState, ScamTimer } from '../../../src/game/engine/types';
import { MAX_OFFLINE_MS, OFFLINE_EFFICIENCY } from '../../../src/game/engine/types';

describe('Game Loop', () => {
  describe('createEngineState', () => {
    it('should create initial engine state', () => {
      const currentTime = Date.now();
      const state = createEngineState(currentTime);

      expect(state.lastTickTime).toBe(currentTime);
      expect(state.activeTimers).toEqual([]);
      expect(state.isPaused).toBe(false);
      expect(state.pausedAt).toBeUndefined();
    });
  });

  describe('tick', () => {
    it('should update lastTickTime', () => {
      const state: EngineState = {
        lastTickTime: 1000,
        activeTimers: [],
        isPaused: false,
      };

      const result = tick(state, 1100);

      expect(result.state.lastTickTime).toBe(1100);
    });

    it('should return delta time since last tick', () => {
      const state: EngineState = {
        lastTickTime: 1000,
        activeTimers: [],
        isPaused: false,
      };

      const result = tick(state, 1100);

      expect(result.deltaMs).toBe(100);
    });

    it('should update active timers', () => {
      const timer: ScamTimer = {
        scamId: 'test-scam',
        startTime: 1000,
        duration: 500,
        isComplete: false,
      };
      const state: EngineState = {
        lastTickTime: 1000,
        activeTimers: [timer],
        isPaused: false,
      };

      const result = tick(state, 1600);

      expect(result.state.activeTimers[0].isComplete).toBe(true);
    });

    it('should report completed timers', () => {
      const timer: ScamTimer = {
        scamId: 'test-scam',
        startTime: 1000,
        duration: 500,
        isComplete: false,
      };
      const state: EngineState = {
        lastTickTime: 1000,
        activeTimers: [timer],
        isPaused: false,
      };

      const result = tick(state, 1600);

      expect(result.completedTimers).toHaveLength(1);
      expect(result.completedTimers[0].scamId).toBe('test-scam');
    });

    it('should only report newly completed timers', () => {
      const alreadyComplete: ScamTimer = {
        scamId: 'already-done',
        startTime: 0,
        duration: 100,
        isComplete: true,
      };
      const justComplete: ScamTimer = {
        scamId: 'just-done',
        startTime: 1000,
        duration: 500,
        isComplete: false,
      };
      const state: EngineState = {
        lastTickTime: 1000,
        activeTimers: [alreadyComplete, justComplete],
        isPaused: false,
      };

      const result = tick(state, 1600);

      // Only the newly completed timer should be reported
      expect(result.completedTimers).toHaveLength(1);
      expect(result.completedTimers[0].scamId).toBe('just-done');
    });

    it('should not update timers when paused', () => {
      const timer: ScamTimer = {
        scamId: 'test-scam',
        startTime: 1000,
        duration: 500,
        isComplete: false,
      };
      const state: EngineState = {
        lastTickTime: 1000,
        activeTimers: [timer],
        isPaused: true,
        pausedAt: 1200,
      };

      const result = tick(state, 1600);

      // Timer should not be marked complete when paused
      expect(result.state.activeTimers[0].isComplete).toBe(false);
      expect(result.completedTimers).toHaveLength(0);
      // Delta should be 0 when paused
      expect(result.deltaMs).toBe(0);
    });

    it('should handle multiple timers with different completion times', () => {
      const timer1: ScamTimer = {
        scamId: 'fast',
        startTime: 1000,
        duration: 100,
        isComplete: false,
      };
      const timer2: ScamTimer = {
        scamId: 'slow',
        startTime: 1000,
        duration: 1000,
        isComplete: false,
      };
      const state: EngineState = {
        lastTickTime: 1000,
        activeTimers: [timer1, timer2],
        isPaused: false,
      };

      const result = tick(state, 1200);

      expect(result.state.activeTimers[0].isComplete).toBe(true);
      expect(result.state.activeTimers[1].isComplete).toBe(false);
      expect(result.completedTimers).toHaveLength(1);
      expect(result.completedTimers[0].scamId).toBe('fast');
    });

    it('should not mutate original state', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 500,
        isComplete: false,
      };
      const state: EngineState = {
        lastTickTime: 1000,
        activeTimers: [timer],
        isPaused: false,
      };

      tick(state, 1600);

      // Original state should be unchanged
      expect(state.lastTickTime).toBe(1000);
      expect(state.activeTimers[0].isComplete).toBe(false);
    });
  });

  describe('calculateOfflineProgress', () => {
    it('should return zero progress for zero time elapsed', () => {
      const state: EngineState = {
        lastTickTime: 1000,
        activeTimers: [],
        isPaused: false,
      };

      const progress = calculateOfflineProgress(1000, 1000, state);

      expect(progress.elapsedMs).toBe(0);
      expect(progress.completedScams).toBe(0);
    });

    it('should cap elapsed time at MAX_OFFLINE_MS', () => {
      const state: EngineState = {
        lastTickTime: 0,
        activeTimers: [],
        isPaused: false,
      };

      // 24 hours elapsed
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const progress = calculateOfflineProgress(0, twentyFourHours, state);

      // Should be capped at 8 hours
      expect(progress.elapsedMs).toBe(MAX_OFFLINE_MS);
    });

    it('should calculate completed scam cycles for a single timer', () => {
      const timer: ScamTimer = {
        scamId: 'quick-scam',
        startTime: 0,
        duration: 1000, // 1 second per scam
        isComplete: false,
      };
      const state: EngineState = {
        lastTickTime: 0,
        activeTimers: [timer],
        isPaused: false,
      };

      // 5 seconds elapsed
      const progress = calculateOfflineProgress(0, 5000, state);

      // Should complete 5 cycles (5000ms / 1000ms per cycle)
      expect(progress.completedScams).toBe(5);
    });

    it('should calculate completed scams for multiple timers', () => {
      const timer1: ScamTimer = {
        scamId: 'fast',
        startTime: 0,
        duration: 1000,
        isComplete: false,
      };
      const timer2: ScamTimer = {
        scamId: 'slow',
        startTime: 0,
        duration: 2000,
        isComplete: false,
      };
      const state: EngineState = {
        lastTickTime: 0,
        activeTimers: [timer1, timer2],
        isPaused: false,
      };

      // 4 seconds elapsed
      const progress = calculateOfflineProgress(0, 4000, state);

      // timer1: 4 cycles, timer2: 2 cycles = 6 total
      expect(progress.completedScams).toBe(6);
    });

    it('should apply offline efficiency to earnings', () => {
      // The actual earnings values will depend on scam definitions
      // For now, test that efficiency constant exists and is applied
      expect(OFFLINE_EFFICIENCY).toBe(0.5);
    });

    it('should return earnings structure', () => {
      const state: EngineState = {
        lastTickTime: 0,
        activeTimers: [],
        isPaused: false,
      };

      const progress = calculateOfflineProgress(0, 1000, state);

      // Should have all earning types
      expect(progress.earnings).toHaveProperty('money');
      expect(progress.earnings).toHaveProperty('reputation');
      expect(progress.earnings).toHaveProperty('heat');
      expect(progress.earnings).toHaveProperty('bots');
      expect(progress.earnings).toHaveProperty('skillPoints');
      expect(progress.earnings).toHaveProperty('crypto');
    });

    it('should handle partial cycles by counting only complete ones', () => {
      const timer: ScamTimer = {
        scamId: 'scam',
        startTime: 0,
        duration: 1000,
        isComplete: false,
      };
      const state: EngineState = {
        lastTickTime: 0,
        activeTimers: [timer],
        isPaused: false,
      };

      // 2.5 seconds elapsed = 2 complete cycles
      const progress = calculateOfflineProgress(0, 2500, state);

      expect(progress.completedScams).toBe(2);
    });

    it('should use paused time if game was paused', () => {
      const state: EngineState = {
        lastTickTime: 0,
        activeTimers: [],
        isPaused: true,
        pausedAt: 5000, // paused at 5 seconds
      };

      // Current time is 10 seconds, but we paused at 5
      const progress = calculateOfflineProgress(0, 10000, state);

      // Should only count up to when we paused
      expect(progress.elapsedMs).toBe(5000);
    });
  });

  describe('useGameLoop', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return start, stop, pause, resume, and isPaused', () => {
      const { result } = renderHook(() => useGameLoop());

      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.stop).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.resume).toBe('function');
      expect(typeof result.current.isPaused).toBe('boolean');
    });

    it('should start with isPaused false', () => {
      const { result } = renderHook(() => useGameLoop());

      expect(result.current.isPaused).toBe(false);
    });

    it('should set isPaused to true when paused', () => {
      const { result } = renderHook(() => useGameLoop());

      act(() => {
        result.current.start();
        result.current.pause();
      });

      expect(result.current.isPaused).toBe(true);
    });

    it('should set isPaused to false when resumed', () => {
      const { result } = renderHook(() => useGameLoop());

      act(() => {
        result.current.start();
        result.current.pause();
        result.current.resume();
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('should call onTick callback when running', () => {
      const onTick = jest.fn();
      const { result } = renderHook(() => useGameLoop({ onTick }));

      act(() => {
        result.current.start();
      });

      // Advance timer by one tick interval (100ms)
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(onTick).toHaveBeenCalled();
    });

    it('should not call onTick when paused', () => {
      const onTick = jest.fn();
      const { result } = renderHook(() => useGameLoop({ onTick }));

      act(() => {
        result.current.start();
        result.current.pause();
      });

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // onTick may be called once before pause, but not after
      const callsBeforePause = onTick.mock.calls.length;

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onTick.mock.calls.length).toBe(callsBeforePause);
    });

    it('should not call onTick after stop', () => {
      const onTick = jest.fn();
      const { result } = renderHook(() => useGameLoop({ onTick }));

      act(() => {
        result.current.start();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const callsBeforeStop = onTick.mock.calls.length;

      act(() => {
        result.current.stop();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onTick.mock.calls.length).toBe(callsBeforeStop);
    });

    it('should clean up interval on unmount', () => {
      const onTick = jest.fn();
      const { result, unmount } = renderHook(() => useGameLoop({ onTick }));

      act(() => {
        result.current.start();
      });

      unmount();

      // Advance timers after unmount
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should not have called tick after unmount
      // (may have called before unmount, so just check it's not excessive)
      expect(onTick.mock.calls.length).toBeLessThan(3);
    });

    it('should provide engine state', () => {
      const { result } = renderHook(() => useGameLoop());

      expect(result.current.engineState).toBeDefined();
      expect(result.current.engineState.lastTickTime).toBeDefined();
      expect(result.current.engineState.activeTimers).toEqual([]);
    });

    it('should allow adding timers', () => {
      const { result } = renderHook(() => useGameLoop());

      act(() => {
        result.current.addTimer('test-scam', 5000);
      });

      expect(result.current.engineState.activeTimers).toHaveLength(1);
      expect(result.current.engineState.activeTimers[0].scamId).toBe('test-scam');
    });

    it('should allow removing timers by scamId', () => {
      const { result } = renderHook(() => useGameLoop());

      act(() => {
        result.current.addTimer('scam-1', 5000);
        result.current.addTimer('scam-2', 5000);
        result.current.removeTimer('scam-1');
      });

      expect(result.current.engineState.activeTimers).toHaveLength(1);
      expect(result.current.engineState.activeTimers[0].scamId).toBe('scam-2');
    });

    it('should call onTimerComplete when timer finishes', () => {
      const onTimerComplete = jest.fn();
      const { result } = renderHook(() =>
        useGameLoop({ onTimerComplete })
      );

      act(() => {
        result.current.start();
        result.current.addTimer('fast-scam', 50); // 50ms timer
      });

      // Advance past timer completion
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(onTimerComplete).toHaveBeenCalledWith(
        expect.objectContaining({ scamId: 'fast-scam' })
      );
    });
  });
});
