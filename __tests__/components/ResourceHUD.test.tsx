// ABOUTME: Tests for ResourceHUD component - full resource display bar
// ABOUTME: Verifies rendering of all 7 resources in a compact CRT-styled container

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ResourceHUD } from '../../src/components/ResourceHUD';
import type { GameResources } from '../../src/game/types';

const mockResources: GameResources = {
  money: 1000,
  reputation: 50,
  heat: 25,
  bots: 100,
  skillPoints: 10,
  crypto: 500,
  trust: 1,
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

  describe('resource display', () => {
    it('displays all 7 resources', () => {
      render(<ResourceHUD resources={mockResources} />);

      // Check formatted values for all resources
      expect(screen.getByText('1K')).toBeTruthy();     // money
      expect(screen.getByText('50')).toBeTruthy();     // reputation
      expect(screen.getByText('25')).toBeTruthy();     // heat
      expect(screen.getByText('100')).toBeTruthy();    // bots
      expect(screen.getByText('10')).toBeTruthy();     // skillPoints
      expect(screen.getByText('500')).toBeTruthy();    // crypto
      expect(screen.getByText('1')).toBeTruthy();      // trust
    });

    it('updates when resources change', () => {
      const { rerender } = render(<ResourceHUD resources={mockResources} />);

      expect(screen.getByText('1K')).toBeTruthy();

      const updatedResources: GameResources = {
        ...mockResources,
        money: 2000000,
      };

      rerender(<ResourceHUD resources={updatedResources} />);

      expect(screen.getByText('2M')).toBeTruthy();
    });

    it('handles zero values', () => {
      const zeroResources: GameResources = {
        money: 0,
        reputation: 0,
        heat: 0,
        bots: 0,
        skillPoints: 0,
        crypto: 0,
        trust: 1, // Trust starts at 1
      };

      render(<ResourceHUD resources={zeroResources} />);

      // Should display multiple zeros
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(6); // All except trust
    });

    it('handles very large values', () => {
      const largeResources: GameResources = {
        money: 1234567890123,
        reputation: 999990000, // Adjusted to avoid rounding to 1B
        heat: 100,
        bots: 50000000,
        skillPoints: 1000,
        crypto: 10000000000,
        trust: 100,
      };

      render(<ResourceHUD resources={largeResources} />);

      expect(screen.getByText('1.23T')).toBeTruthy();  // money
      expect(screen.getByText('999.99M')).toBeTruthy(); // reputation
      expect(screen.getByText('50M')).toBeTruthy();    // bots
      expect(screen.getByText('10B')).toBeTruthy();    // crypto
    });
  });

  describe('compact mode', () => {
    it('renders in compact mode by default for mobile-friendly display', () => {
      render(<ResourceHUD resources={mockResources} testID="resource-hud" />);

      // Should render without labels in compact mode
      expect(screen.queryByText('MONEY')).toBeNull();
      expect(screen.queryByText('REP')).toBeNull();
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
