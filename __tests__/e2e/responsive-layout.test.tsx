// ABOUTME: E2E test for the ResponsiveLayout component's tab-based navigation
// ABOUTME: Verifies tab switching behavior for SCAMS, SKILLS, MANAGERS, and TRUSTCOIN tabs

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

function skillsContent() {
  return <Text testID="skills-content">Skills Panel</Text>;
}

function cryptoContent() {
  return <Text testID="crypto-content">Crypto Panel</Text>;
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

  describe('Tab-based layout', () => {
    it('renders tab bar at any screen width', () => {
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

    it('switching to MANAGERS tab shows ops content', () => {
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

  describe('All four tabs', () => {
    it('cycles through all tabs correctly', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent()}
          opsContent={opsContent()}
          skillsContent={skillsContent()}
          cryptoContent={cryptoContent()}
        />
      );

      // Default: scams
      expect(screen.getByTestId('scams-content')).toBeTruthy();

      // Switch to skills
      fireEvent.press(screen.getByTestId('tab-skills'));
      expect(screen.getByTestId('skills-content')).toBeTruthy();
      expect(screen.queryByTestId('scams-content')).toBeNull();

      // Switch to crypto
      fireEvent.press(screen.getByTestId('tab-crypto'));
      expect(screen.getByTestId('crypto-content')).toBeTruthy();
      expect(screen.queryByTestId('skills-content')).toBeNull();

      // Switch to managers
      fireEvent.press(screen.getByTestId('tab-ops'));
      expect(screen.getByTestId('ops-content')).toBeTruthy();
      expect(screen.queryByTestId('crypto-content')).toBeNull();

      // Switch back to scams
      fireEvent.press(screen.getByTestId('tab-scams'));
      expect(screen.getByTestId('scams-content')).toBeTruthy();
      expect(screen.queryByTestId('ops-content')).toBeNull();
    });
  });

  describe('Narrow screens', () => {
    it('uses same tab layout on narrow screens', () => {
      mockUseWindowDimensions.mockReturnValue({
        width: 375,
        height: 667,
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
      expect(screen.getByTestId('scams-content')).toBeTruthy();
    });
  });
});
