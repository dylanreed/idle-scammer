// ABOUTME: Tests for ResponsiveLayout component - tab-based navigation for all screen sizes
// ABOUTME: Verifies tab switching between SCAMS, SKILLS, MANAGERS, and TRUSTCOIN tabs

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
const skillsContent = (
  <View testID="skills-content">
    <Text>Skills</Text>
  </View>
);
const cryptoContent = (
  <View testID="crypto-content">
    <Text>Crypto</Text>
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

  describe('tab-based layout', () => {
    it('renders tab bar with SCAMS and MANAGERS tabs', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('tab-scams')).toBeTruthy();
      expect(screen.getByTestId('tab-ops')).toBeTruthy();
    });

    it('uses tabs even on wide screens', () => {
      mockUseWindowDimensions.mockReturnValue({
        width: 1024,
        height: 768,
        scale: 1,
        fontScale: 1,
      });

      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      // Tab buttons should always be present
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

    it('pressing MANAGERS tab shows opsContent, hides scamsContent', () => {
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

    it('has testID responsive-layout', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('responsive-layout')).toBeTruthy();
    });
  });

  describe('conditional tabs', () => {
    it('shows SKILLS tab when skillsContent is provided', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
          skillsContent={skillsContent}
        />
      );

      expect(screen.getByTestId('tab-skills')).toBeTruthy();
    });

    it('hides SKILLS tab when skillsContent is not provided', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.queryByTestId('tab-skills')).toBeNull();
    });

    it('shows TRUSTCOIN tab when cryptoContent is provided', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
          cryptoContent={cryptoContent}
        />
      );

      expect(screen.getByTestId('tab-crypto')).toBeTruthy();
    });

    it('hides TRUSTCOIN tab when cryptoContent is not provided', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.queryByTestId('tab-crypto')).toBeNull();
    });

    it('switching to SKILLS tab shows skills content', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
          skillsContent={skillsContent}
        />
      );

      fireEvent.press(screen.getByTestId('tab-skills'));

      expect(screen.getByTestId('skills-content')).toBeTruthy();
      expect(screen.queryByTestId('scams-content')).toBeNull();
    });

    it('switching to TRUSTCOIN tab shows crypto content', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
          cryptoContent={cryptoContent}
        />
      );

      fireEvent.press(screen.getByTestId('tab-crypto'));

      expect(screen.getByTestId('crypto-content')).toBeTruthy();
      expect(screen.queryByTestId('scams-content')).toBeNull();
    });

    it('renders all four tabs when all content is provided', () => {
      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
          skillsContent={skillsContent}
          cryptoContent={cryptoContent}
        />
      );

      expect(screen.getByTestId('tab-scams')).toBeTruthy();
      expect(screen.getByTestId('tab-skills')).toBeTruthy();
      expect(screen.getByTestId('tab-crypto')).toBeTruthy();
      expect(screen.getByTestId('tab-ops')).toBeTruthy();
    });
  });

  describe('narrow screens', () => {
    it('uses tabs on narrow screens too', () => {
      mockUseWindowDimensions.mockReturnValue({
        width: 375,
        height: 667,
        scale: 1,
        fontScale: 1,
      });

      render(
        <ResponsiveLayout
          scamsContent={scamsContent}
          opsContent={opsContent}
        />
      );

      expect(screen.getByTestId('tab-scams')).toBeTruthy();
      expect(screen.getByTestId('tab-ops')).toBeTruthy();
      expect(screen.getByTestId('responsive-layout')).toBeTruthy();
    });
  });
});
