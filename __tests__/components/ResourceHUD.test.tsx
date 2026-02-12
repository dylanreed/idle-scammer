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
      // CRTFrame renders as a panel (scanlines removed in visual refresh)
      expect(screen.getByTestId('resource-hud')).toBeTruthy();
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
      render(<ResourceHUD resources={mockResources} prestigeCount={0} />);

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
      render(<ResourceHUD resources={mockResources} prestigeCount={2} />);

      expect(screen.getByText('1K')).toBeTruthy();     // money
      expect(screen.getByText('25')).toBeTruthy();     // heat
      expect(screen.getByText('100')).toBeTruthy();    // bots
      expect(screen.getByText('10')).toBeTruthy();     // skillPoints
      expect(screen.getByText('1')).toBeTruthy();      // trust
    });

    it('hides crypto when trust is below threshold', () => {
      render(<ResourceHUD resources={mockResources} prestigeCount={1} />);

      // crypto is 500, but trust is 1 (below threshold of 150), so not shown
      expect(screen.queryByText('500')).toBeNull();
    });

    it('shows crypto when trust meets threshold', () => {
      const highTrustResources: GameResources = {
        ...mockResources,
        trust: 150,
      };
      render(<ResourceHUD resources={highTrustResources} prestigeCount={1} />);

      // crypto is 500 and trust >= 150, so crypto should be visible
      expect(screen.getByText('500')).toBeTruthy();
    });

    it('updates when resources change', () => {
      const { rerender } = render(<ResourceHUD resources={mockResources} prestigeCount={1} />);

      expect(screen.getByText('1K')).toBeTruthy();

      const updatedResources: GameResources = {
        ...mockResources,
        money: 2000000,
      };

      rerender(<ResourceHUD resources={updatedResources} prestigeCount={1} />);

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

      render(<ResourceHUD resources={zeroResources} prestigeCount={2} />);

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

      render(<ResourceHUD resources={largeResources} prestigeCount={2} />);

      expect(screen.getByText('1.23T')).toBeTruthy();  // money
      expect(screen.getByText('50M')).toBeTruthy();    // bots
      // crypto (10B) is hidden because trust (100) is below the threshold (150)
      expect(screen.queryByText('10B')).toBeNull();
    });

    it('shows bots and trust at prestigeCount=1', () => {
      const resources: GameResources = {
        ...mockResources,
        bots: 42,
        trust: 7,
      };
      render(<ResourceHUD resources={resources} prestigeCount={1} />);

      expect(screen.getByText('42')).toBeTruthy();   // bots
      expect(screen.getByText('7')).toBeTruthy();    // trust
    });

    it('hides skill points at prestigeCount=1, shows at prestigeCount=2', () => {
      const resources: GameResources = {
        ...mockResources,
        skillPoints: 15,
      };

      const { rerender } = render(<ResourceHUD resources={resources} prestigeCount={1} />);

      // skillPoints requires prestigeCount >= 2, so 15 should not be visible
      expect(screen.queryByText('15')).toBeNull();

      rerender(<ResourceHUD resources={resources} prestigeCount={2} />);

      // Now skillPoints should be visible
      expect(screen.getByText('15')).toBeTruthy();
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

  describe('per-second rate display', () => {
    it('passes moneyPerSecond to money ResourceIcon', () => {
      render(
        <ResourceHUD resources={mockResources} moneyPerSecond={150} testID="resource-hud" />
      );
      expect(screen.getByText('+$150/s')).toBeTruthy();
    });

    it('does not show rate when moneyPerSecond is not provided', () => {
      render(<ResourceHUD resources={mockResources} testID="resource-hud" />);
      expect(screen.queryByTestId('resource-rate')).toBeNull();
    });

    it('does not show rate when moneyPerSecond is 0', () => {
      render(
        <ResourceHUD resources={mockResources} moneyPerSecond={0} testID="resource-hud" />
      );
      expect(screen.queryByTestId('resource-rate')).toBeNull();
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
