// ABOUTME: Tests for ResponsiveLayout component - width-responsive two-column/tab layout
// ABOUTME: Verifies wide mode (two columns), narrow mode (tabs), and transition behavior

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';

const mockUseWindowDimensions = jest.fn(() => ({
  width: 1024,
  height: 768,
  scale: 1,
  fontScale: 1,
}));

jest.mock('../../src/components/useWindowDimensions', () => ({
  useWindowDimensions: () => mockUseWindowDimensions(),
}));

import { ResponsiveLayout } from '../../src/components/ResponsiveLayout';

const scamsContent = (
  <View testID="scams-content">
    <Text>Scams</Text>
  </View>
);
const opsContent = (
  <View testID="ops-content">
    <Text>Ops</Text>
  </View>
);

describe('ResponsiveLayout', () => {
  beforeEach(() => {
    mockUseWindowDimensions.mockReturnValue({
      width: 1024,
      height: 768,
      scale: 1,
      fontScale: 1,
    });
  });

  describe('wide mode (width >= 768)', () => {
    it('renders both scamsContent and opsContent simultaneously', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.getByTestId('ops-content')).toBeTruthy();
    });

    it('does NOT render tab buttons', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.queryByTestId('tab-scams')).toBeNull();
      expect(screen.queryByTestId('tab-ops')).toBeNull();
    });

    it('layout uses flexDirection row', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      const container = screen.getByTestId('responsive-layout-wide');
      const style = container.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.flexDirection).toBe('row');
    });

    it('has testID responsive-layout-wide', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('responsive-layout-wide')).toBeTruthy();
    });

    it('uses exact breakpoint width of 768 as wide', () => {
      mockUseWindowDimensions.mockReturnValue({
        width: 768,
        height: 1024,
        scale: 1,
        fontScale: 1,
      });

      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('responsive-layout-wide')).toBeTruthy();
    });
  });

  describe('narrow mode (width < 768)', () => {
    beforeEach(() => {
      mockUseWindowDimensions.mockReturnValue({
        width: 375,
        height: 667,
        scale: 1,
        fontScale: 1,
      });
    });

    it('shows tab bar with SCAMS and OPS CENTER buttons', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('tab-scams')).toBeTruthy();
      expect(screen.getByTestId('tab-ops')).toBeTruthy();
    });

    it('default tab is SCAMS - shows scamsContent, hides opsContent', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.queryByTestId('ops-content')).toBeNull();
    });

    it('pressing OPS CENTER tab shows opsContent, hides scamsContent', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      fireEvent.press(screen.getByTestId('tab-ops'));

      expect(screen.getByTestId('ops-content')).toBeTruthy();
      expect(screen.queryByTestId('scams-content')).toBeNull();
    });

    it('pressing SCAMS tab switches back to scamsContent', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      // Switch to ops first
      fireEvent.press(screen.getByTestId('tab-ops'));
      expect(screen.getByTestId('ops-content')).toBeTruthy();

      // Switch back to scams
      fireEvent.press(screen.getByTestId('tab-scams'));
      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.queryByTestId('ops-content')).toBeNull();
    });

    it('has testID responsive-layout-narrow', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('responsive-layout-narrow')).toBeTruthy();
    });
  });

  describe('transition behavior', () => {
    it('when transitioning from wide to narrow, defaults to SCAMS tab', () => {
      // Start wide
      mockUseWindowDimensions.mockReturnValue({
        width: 1024,
        height: 768,
        scale: 1,
        fontScale: 1,
      });

      const { rerender } = render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('responsive-layout-wide')).toBeTruthy();

      // Transition to narrow
      mockUseWindowDimensions.mockReturnValue({
        width: 375,
        height: 667,
        scale: 1,
        fontScale: 1,
      });

      rerender(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('responsive-layout-narrow')).toBeTruthy();
      // Should default to SCAMS tab
      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.queryByTestId('ops-content')).toBeNull();
    });
  });
});
