// ABOUTME: Tests for ResourceHUD component - full resource display bar
// ABOUTME: Verifies rendering of resources with progressive disclosure based on prestige state

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ResourceHUD } from '../../src/components/ResourceHUD';
import type { GameResources } from '../../src/game/types';

const mockResources: GameResources = {
  money: 1000,
  heat: 25,
  bots: 100,
  skillPoints: 10,
  crypto: 500,
  trust: 1,
  snitchCount: 0,
};

describe('ResourceHUD', () => {
  describe('rendering', () => {
    it('renders with testID', () => {
      render(<ResourceHUD resources={mockResources} testID="resource-hud" />);
      expect(screen.getByTestId('resource-hud')).toBeTruthy();
    });

    it('renders inside a CRTFrame', () => {
      render(<ResourceHUD resources={mockResources} testID="resource-hud" />);
      // CRTFrame adds scanlines by default
      expect(screen.getByTestId('crt-scanlines')).toBeTruthy();
    });

    it('can disable CRT scanlines', () => {
      render(<ResourceHUD resources={mockResources} showScanlines={false} testID="resource-hud" />);
      expect(screen.queryByTestId('crt-scanlines')).toBeNull();
    });
  });

  describe('pre-prestige resource display', () => {
    it('shows only money and heat before first prestige', () => {
      render(<ResourceHUD resources={mockResources} />);

      // Visible: money, heat
      expect(screen.getByText('1K')).toBeTruthy();     // money
      expect(screen.getByText('25')).toBeTruthy();     // heat
    });

    it('hides trust, bots, skill points, and crypto before first prestige', () => {
      render(<ResourceHUD resources={mockResources} hasPrestiged={false} />);

      // bots value (100) should not be visible
      expect(screen.queryByText('100')).toBeNull();
      // crypto value (500) should not be visible
      expect(screen.queryByText('500')).toBeNull();
    });

    it('handles zero values in pre-prestige mode', () => {
      const zeroResources: GameResources = {
        money: 0,
        heat: 0,
        bots: 0,
        skillPoints: 0,
        crypto: 0,
        trust: 1,
        snitchCount: 0,
      };

      render(<ResourceHUD resources={zeroResources} />);

      // Only 2 resources shown (money, heat), all zero
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(2);
    });
  });

  describe('post-prestige resource display', () => {
    it('displays money, heat, bots, skill points, and trust after prestige', () => {
      render(<ResourceHUD resources={mockResources} hasPrestiged={true} />);

      expect(screen.getByText('1K')).toBeTruthy();     // money
      expect(screen.getByText('25')).toBeTruthy();     // heat
      expect(screen.getByText('100')).toBeTruthy();    // bots
      expect(screen.getByText('10')).toBeTruthy();     // skillPoints
      expect(screen.getByText('1')).toBeTruthy();      // trust
    });

    it('hides crypto when trust is below threshold', () => {
      render(<ResourceHUD resources={mockResources} hasPrestiged={true} />);

      // crypto is 500, but trust is 1 (below threshold of 21), so not shown
      expect(screen.queryByText('500')).toBeNull();
    });

    it('shows crypto when trust meets threshold', () => {
      const highTrustResources: GameResources = {
        ...mockResources,
        trust: 21,
      };
      render(<ResourceHUD resources={highTrustResources} hasPrestiged={true} />);

      // crypto is 500 and trust >= 21, so crypto should be visible
      expect(screen.getByText('500')).toBeTruthy();
    });

    it('updates when resources change', () => {
      const { rerender } = render(<ResourceHUD resources={mockResources} hasPrestiged={true} />);

      expect(screen.getByText('1K')).toBeTruthy();

      const updatedResources: GameResources = {
        ...mockResources,
        money: 2000000,
      };

      rerender(<ResourceHUD resources={updatedResources} hasPrestiged={true} />);

      expect(screen.getByText('2M')).toBeTruthy();
    });

    it('handles zero values in post-prestige mode', () => {
      const zeroResources: GameResources = {
        money: 0,
        heat: 0,
        bots: 0,
        skillPoints: 0,
        crypto: 0,
        trust: 1,
        snitchCount: 0,
      };

      render(<ResourceHUD resources={zeroResources} hasPrestiged={true} />);

      // 5 resources shown (all except crypto), 4 are zero (trust is 1)
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(4);
    });

    it('handles very large values', () => {
      const largeResources: GameResources = {
        money: 1234567890123,
        heat: 100,
        bots: 50000000,
        skillPoints: 1000,
        crypto: 10000000000,
        trust: 100,
        snitchCount: 0,
      };

      render(<ResourceHUD resources={largeResources} hasPrestiged={true} />);

      expect(screen.getByText('1.23T')).toBeTruthy();  // money
      expect(screen.getByText('50M')).toBeTruthy();    // bots
      // crypto (10B) is visible because trust (100) meets the threshold (21)
      expect(screen.getByText('10B')).toBeTruthy();
    });
  });

  describe('compact mode', () => {
    it('renders in compact mode by default for mobile-friendly display', () => {
      render(<ResourceHUD resources={mockResources} testID="resource-hud" />);

      // Should render without labels in compact mode
      expect(screen.queryByText('MONEY')).toBeNull();
    });

    it('can show labels when compact is false', () => {
      render(<ResourceHUD resources={mockResources} compact={false} />);

      // Should show labels
      expect(screen.getByText('MONEY')).toBeTruthy();
    });
  });

  describe('layout', () => {
    it('renders resources in a scrollable row', () => {
      render(<ResourceHUD resources={mockResources} testID="resource-hud" />);

      const container = screen.getByTestId('resource-row');
      expect(container).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('accepts custom style prop', () => {
      render(
        <ResourceHUD
          resources={mockResources}
          testID="resource-hud"
          style={{ marginTop: 50 }}
        />
      );

      const hud = screen.getByTestId('resource-hud');
      // The style is flattened by CRTFrame, check it exists
      // Style is an array: [frameStyles, [customStyle]]
      const style = hud.props.style;
      const flatStyle = Array.isArray(style)
        ? style.flat(2).reduce((acc, s) => (s ? { ...acc, ...s } : acc), {})
        : style;
      expect(flatStyle.marginTop).toBe(50);
    });
  });
});
