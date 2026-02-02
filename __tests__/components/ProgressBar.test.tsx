// ABOUTME: Tests for ProgressBar component - animated progress bar for scam timers
// ABOUTME: Verifies progress rendering, colors, percentage display, and styling

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ProgressBar } from '../../src/components/ProgressBar';
import { COLORS } from '../../src/components/theme';

describe('ProgressBar', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<ProgressBar progress={0.5} testID="progress-bar" />);
      expect(screen.getByTestId('progress-bar')).toBeTruthy();
    });

    it('renders fill element', () => {
      render(<ProgressBar progress={0.5} testID="progress-bar" />);
      expect(screen.getByTestId('progress-bar-fill')).toBeTruthy();
    });
  });

  describe('progress values', () => {
    it('renders empty state at 0 progress', () => {
      render(<ProgressBar progress={0} testID="progress-bar" />);
      const fill = screen.getByTestId('progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.width).toBe('0%');
    });

    it('renders full state at 1 progress', () => {
      render(<ProgressBar progress={1} testID="progress-bar" />);
      const fill = screen.getByTestId('progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.width).toBe('100%');
    });

    it('renders partial progress correctly', () => {
      render(<ProgressBar progress={0.5} testID="progress-bar" />);
      const fill = screen.getByTestId('progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.width).toBe('50%');
    });

    it('clamps progress below 0 to 0', () => {
      render(<ProgressBar progress={-0.5} testID="progress-bar" />);
      const fill = screen.getByTestId('progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.width).toBe('0%');
    });

    it('clamps progress above 1 to 100%', () => {
      render(<ProgressBar progress={1.5} testID="progress-bar" />);
      const fill = screen.getByTestId('progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.width).toBe('100%');
    });
  });

  describe('colors', () => {
    it('uses terminal green by default', () => {
      render(<ProgressBar progress={0.5} testID="progress-bar" />);
      const fill = screen.getByTestId('progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.backgroundColor).toBe(COLORS.terminalGreen);
    });

    it('accepts custom color', () => {
      render(
        <ProgressBar progress={0.5} color={COLORS.gold} testID="progress-bar" />
      );
      const fill = screen.getByTestId('progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.backgroundColor).toBe(COLORS.gold);
    });

    it('accepts different color variants', () => {
      render(
        <ProgressBar
          progress={0.5}
          color={COLORS.warningRed}
          testID="progress-bar"
        />
      );
      const fill = screen.getByTestId('progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.backgroundColor).toBe(COLORS.warningRed);
    });
  });

  describe('percentage display', () => {
    it('hides percentage by default', () => {
      render(<ProgressBar progress={0.5} testID="progress-bar" />);
      expect(screen.queryByTestId('progress-bar-percentage')).toBeNull();
    });

    it('shows percentage when showPercentage is true', () => {
      render(
        <ProgressBar progress={0.5} showPercentage testID="progress-bar" />
      );
      expect(screen.getByTestId('progress-bar-percentage')).toBeTruthy();
    });

    it('displays correct percentage value', () => {
      render(
        <ProgressBar progress={0.75} showPercentage testID="progress-bar" />
      );
      expect(screen.getByText('75%')).toBeTruthy();
    });

    it('rounds percentage to whole number', () => {
      render(
        <ProgressBar progress={0.333} showPercentage testID="progress-bar" />
      );
      expect(screen.getByText('33%')).toBeTruthy();
    });

    it('shows 0% for zero progress', () => {
      render(
        <ProgressBar progress={0} showPercentage testID="progress-bar" />
      );
      expect(screen.getByText('0%')).toBeTruthy();
    });

    it('shows 100% for full progress', () => {
      render(
        <ProgressBar progress={1} showPercentage testID="progress-bar" />
      );
      expect(screen.getByText('100%')).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('has dark background track', () => {
      render(<ProgressBar progress={0.5} testID="progress-bar" />);
      const track = screen.getByTestId('progress-bar');
      const style = track.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.backgroundColor).toBe(COLORS.background);
    });

    it('has border for definition', () => {
      render(<ProgressBar progress={0.5} testID="progress-bar" />);
      const track = screen.getByTestId('progress-bar');
      const style = track.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.borderWidth).toBeGreaterThan(0);
    });

    it('applies custom style when provided', () => {
      render(
        <ProgressBar
          progress={0.5}
          testID="progress-bar"
          style={{ marginTop: 20 }}
        />
      );
      const track = screen.getByTestId('progress-bar');
      const style = track.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.marginTop).toBe(20);
    });
  });
});
