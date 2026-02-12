// ABOUTME: Tests for the haptics utility wrapper
// ABOUTME: Validates triggerHaptic calls expo-haptics with correct style and handles missing module

import { triggerHaptic } from '../../src/utils/haptics';
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
}));

describe('triggerHaptic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call impactAsync with Light for light level', () => {
    triggerHaptic('light');
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('should call impactAsync with Medium for medium level', () => {
    triggerHaptic('medium');
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it('should call impactAsync with Heavy for heavy level', () => {
    triggerHaptic('heavy');
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
  });

  it('should not throw when expo-haptics throws synchronously', () => {
    (Haptics.impactAsync as jest.Mock).mockImplementationOnce(() => {
      throw new Error('not available');
    });
    expect(() => triggerHaptic('light')).not.toThrow();
  });
});
