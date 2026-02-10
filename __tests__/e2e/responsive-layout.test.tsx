// ABOUTME: E2E test for the ResponsiveLayout component's responsive behavior
// ABOUTME: Verifies two-column layout on wide screens and tab switching on narrow screens

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ResponsiveLayout } from '../../src/components/ResponsiveLayout';

const mockUseWindowDimensions = jest.fn(() => ({
  width: 1024,
  height: 768,
  scale: 1,
  fontScale: 1,
}));

jest.mock('../../src/components/useWindowDimensions', () => ({
  useWindowDimensions: () => mockUseWindowDimensions(),
}));

/** Helper to create simple test content nodes */
function scamsContent() {
  return <Text testID="scams-content">Scams Panel</Text>;
}

function opsContent() {
  return <Text testID="ops-content">Ops Panel</Text>;
}

describe('ResponsiveLayout E2E', () => {
  beforeEach(() => {
    mockUseWindowDimensions.mockReturnValue({
      width: 1024,
      height: 768,
      scale: 1,
      fontScale: 1,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Wide layout (1024px)', () => {
    it('renders both panels side-by-side in wide mode', () => {
      mockUseWindowDimensions.mockReturnValue({
        width: 1024,
        height: 768,
        scale: 1,
        fontScale: 1,
      });

      render(
        <ResponsiveLayout
          scamsContent={scamsContent()}
          opsContent={opsContent()}
        />
      );

      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.getByTestId('ops-content')).toBeTruthy();

      // No tab buttons in wide mode
      expect(screen.queryByTestId('tab-scams')).toBeNull();
      expect(screen.queryByTestId('tab-ops')).toBeNull();
    });

    it('uses the 768px breakpoint exactly', () => {
      // At exactly 768px, should still be wide layout
      mockUseWindowDimensions.mockReturnValue({
        width: 768,
        height: 768,
        scale: 1,
        fontScale: 1,
      });

      const { unmount } = render(
        <ResponsiveLayout
          scamsContent={scamsContent()}
          opsContent={opsContent()}
        />
      );

      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.getByTestId('ops-content')).toBeTruthy();
      expect(screen.queryByTestId('tab-scams')).toBeNull();
      expect(screen.queryByTestId('tab-ops')).toBeNull();

      unmount();

      // At 767px, should switch to narrow/tab layout
      mockUseWindowDimensions.mockReturnValue({
        width: 767,
        height: 768,
        scale: 1,
        fontScale: 1,
      });

      render(
        <ResponsiveLayout
          scamsContent={scamsContent()}
          opsContent={opsContent()}
        />
      );

      expect(screen.getByTestId('tab-scams')).toBeTruthy();
      expect(screen.getByTestId('tab-ops')).toBeTruthy();
    });
  });

  describe('Narrow layout (375px)', () => {
    beforeEach(() => {
      mockUseWindowDimensions.mockReturnValue({
        width: 375,
        height: 667,
        scale: 1,
        fontScale: 1,
      });
    });

    it('shows tab bar in narrow mode', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent()}
          opsContent={opsContent()}
        />
      );

      expect(screen.getByTestId('tab-scams')).toBeTruthy();
      expect(screen.getByTestId('tab-ops')).toBeTruthy();
    });

    it('default tab shows scams content', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent()}
          opsContent={opsContent()}
        />
      );

      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.queryByTestId('ops-content')).toBeNull();
    });

    it('switching to OPS CENTER tab shows ops content', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent()}
          opsContent={opsContent()}
        />
      );

      fireEvent.press(screen.getByTestId('tab-ops'));

      expect(screen.getByTestId('ops-content')).toBeTruthy();
      expect(screen.queryByTestId('scams-content')).toBeNull();
    });

    it('switching back to SCAMS tab restores scams content', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent()}
          opsContent={opsContent()}
        />
      );

      // Switch to ops
      fireEvent.press(screen.getByTestId('tab-ops'));
      expect(screen.getByTestId('ops-content')).toBeTruthy();

      // Switch back to scams
      fireEvent.press(screen.getByTestId('tab-scams'));
      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.queryByTestId('ops-content')).toBeNull();
    });
  });

  describe('Layout transition', () => {
    it('wide to narrow preserves default SCAMS tab', () => {
      // Start wide
      mockUseWindowDimensions.mockReturnValue({
        width: 1024,
        height: 768,
        scale: 1,
        fontScale: 1,
      });

      const { rerender } = render(
        <ResponsiveLayout
          scamsContent={scamsContent()}
          opsContent={opsContent()}
        />
      );

      // Both panels visible in wide mode
      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.getByTestId('ops-content')).toBeTruthy();

      // Switch to narrow
      mockUseWindowDimensions.mockReturnValue({
        width: 375,
        height: 667,
        scale: 1,
        fontScale: 1,
      });

      rerender(
        <ResponsiveLayout
          scamsContent={scamsContent()}
          opsContent={opsContent()}
        />
      );

      // Should default to SCAMS tab
      expect(screen.getByTestId('tab-scams')).toBeTruthy();
      expect(screen.getByTestId('tab-ops')).toBeTruthy();
      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.queryByTestId('ops-content')).toBeNull();
    });
  });
});
