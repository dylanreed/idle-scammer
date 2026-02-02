// ABOUTME: Tests for timer utility functions
// ABOUTME: Covers createTimer, updateTimer, getTimerProgress, isTimerComplete

import {
  createTimer,
  updateTimer,
  getTimerProgress,
  isTimerComplete,
} from '../../../src/game/engine/timer';
import type { ScamTimer } from '../../../src/game/engine/types';

describe('Timer Utilities', () => {
  describe('createTimer', () => {
    it('should create a timer with the given scam ID and duration', () => {
      const currentTime = 1000;
      const timer = createTimer('nigerian-prince', 5000, currentTime);

      expect(timer.scamId).toBe('nigerian-prince');
      expect(timer.duration).toBe(5000);
      expect(timer.startTime).toBe(1000);
      expect(timer.isComplete).toBe(false);
    });

    it('should create timer with zero duration', () => {
      const timer = createTimer('instant-scam', 0, 500);

      expect(timer.duration).toBe(0);
      expect(timer.startTime).toBe(500);
    });

    it('should create timer with large duration', () => {
      const timer = createTimer('long-con', 3600000, 0); // 1 hour

      expect(timer.duration).toBe(3600000);
    });
  });

  describe('getTimerProgress', () => {
    it('should return 0 at start time', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      const progress = getTimerProgress(timer, 1000);

      expect(progress).toBe(0);
    });

    it('should return 0.5 at halfway point', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      const progress = getTimerProgress(timer, 3500); // 2500ms elapsed of 5000ms

      expect(progress).toBe(0.5);
    });

    it('should return 1 at completion time', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      const progress = getTimerProgress(timer, 6000);

      expect(progress).toBe(1);
    });

    it('should cap progress at 1 even if time exceeds duration', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      const progress = getTimerProgress(timer, 10000); // way past completion

      expect(progress).toBe(1);
    });

    it('should return 0 if current time is before start time', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 5000,
        duration: 5000,
        isComplete: false,
      };

      const progress = getTimerProgress(timer, 3000); // before start

      expect(progress).toBe(0);
    });

    it('should handle zero duration timer', () => {
      const timer: ScamTimer = {
        scamId: 'instant',
        startTime: 1000,
        duration: 0,
        isComplete: false,
      };

      const progress = getTimerProgress(timer, 1000);

      expect(progress).toBe(1); // instant completion
    });

    it('should return progress for already complete timer', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: true,
      };

      const progress = getTimerProgress(timer, 3500);

      // Even if marked complete, progress calculation is based on time
      expect(progress).toBe(0.5);
    });
  });

  describe('isTimerComplete', () => {
    it('should return false when timer has not reached duration', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      expect(isTimerComplete(timer, 3000)).toBe(false);
    });

    it('should return true when time equals start + duration', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      expect(isTimerComplete(timer, 6000)).toBe(true);
    });

    it('should return true when time exceeds duration', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      expect(isTimerComplete(timer, 10000)).toBe(true);
    });

    it('should return true for zero duration timer at start time', () => {
      const timer: ScamTimer = {
        scamId: 'instant',
        startTime: 1000,
        duration: 0,
        isComplete: false,
      };

      expect(isTimerComplete(timer, 1000)).toBe(true);
    });

    it('should return true if timer isComplete flag is already set', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: true, // already marked complete
      };

      // Should return true even at early time because flag is set
      expect(isTimerComplete(timer, 2000)).toBe(true);
    });
  });

  describe('updateTimer', () => {
    it('should not modify incomplete timer', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      const updated = updateTimer(timer, 3000);

      expect(updated.isComplete).toBe(false);
      expect(updated.scamId).toBe('test');
    });

    it('should mark timer as complete when duration reached', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      const updated = updateTimer(timer, 6000);

      expect(updated.isComplete).toBe(true);
    });

    it('should return new object when status changes', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      const updated = updateTimer(timer, 6000);

      expect(updated).not.toBe(timer); // new object
      expect(timer.isComplete).toBe(false); // original unchanged
    });

    it('should return same object if already complete', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: true,
      };

      const updated = updateTimer(timer, 10000);

      expect(updated).toBe(timer); // same object, no change needed
    });

    it('should return same object if not yet complete', () => {
      const timer: ScamTimer = {
        scamId: 'test',
        startTime: 1000,
        duration: 5000,
        isComplete: false,
      };

      const updated = updateTimer(timer, 2000);

      expect(updated).toBe(timer); // same object, no change needed
    });

    it('should preserve all timer properties when updating', () => {
      const timer: ScamTimer = {
        scamId: 'complex-scam-id-123',
        startTime: 12345,
        duration: 9999,
        isComplete: false,
      };

      const updated = updateTimer(timer, 12345 + 9999);

      expect(updated.scamId).toBe('complex-scam-id-123');
      expect(updated.startTime).toBe(12345);
      expect(updated.duration).toBe(9999);
      expect(updated.isComplete).toBe(true);
    });
  });
});
