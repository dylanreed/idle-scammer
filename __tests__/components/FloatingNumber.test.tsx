// ABOUTME: Tests for FloatingNumber component - animated reward text that drifts up and fades
// ABOUTME: Verifies rendering, color application, and onComplete callback

import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import { FloatingNumber } from '../../src/components/FloatingNumber';
import { COLORS } from '../../src/components/theme';


describe('FloatingNumber', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('renders the value text', () => {
      render(
        <FloatingNumber value="+$1.5K" color={COLORS.gold} onComplete={() => {}} testID="floating" />
      );
      expect(screen.getByText('+$1.5K')).toBeTruthy();
    });

    it('renders with testID', () => {
      render(
        <FloatingNumber value="+$100" color={COLORS.gold} onComplete={() => {}} testID="floating" />
      );
      expect(screen.getByTestId('floating')).toBeTruthy();
    });
  });

  describe('color', () => {
    it('applies the provided color to the text', () => {
      render(
        <FloatingNumber value="+$500" color={COLORS.terminalGreen} onComplete={() => {}} testID="floating" />
      );
      const text = screen.getByText('+$500');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.color).toBe(COLORS.terminalGreen);
    });

    it('applies gold color for money rewards', () => {
      render(
        <FloatingNumber value="+$1K" color={COLORS.gold} onComplete={() => {}} testID="floating" />
      );
      const text = screen.getByText('+$1K');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.color).toBe(COLORS.gold);
    });
  });

  describe('onComplete callback', () => {
    it('calls onComplete after animation duration', () => {
      const onComplete = jest.fn();
      render(
        <FloatingNumber value="+$100" color={COLORS.gold} onComplete={onComplete} testID="floating" />
      );

      expect(onComplete).not.toHaveBeenCalled();

      // Advance past the animation duration (800ms)
      act(() => {
        jest.advanceTimersByTime(900);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
