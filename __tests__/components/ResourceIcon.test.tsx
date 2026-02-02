// ABOUTME: Tests for ResourceIcon component - individual resource display
// ABOUTME: Verifies rendering, formatting, and color-coding per resource type

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ResourceIcon } from '../../src/components/ResourceIcon';
import { COLORS } from '../../src/components/theme';

describe('ResourceIcon', () => {
  describe('rendering', () => {
    it('renders with resourceKey and value', () => {
      render(<ResourceIcon resourceKey="money" value={1000} testID="resource-icon" />);
      expect(screen.getByTestId('resource-icon')).toBeTruthy();
    });

    it('displays formatted value', () => {
      render(<ResourceIcon resourceKey="money" value={1000} />);
      expect(screen.getByText('1K')).toBeTruthy();
    });

    it('displays resource label when showLabel is true', () => {
      render(<ResourceIcon resourceKey="money" value={1000} showLabel />);
      expect(screen.getByText('MONEY')).toBeTruthy();
    });

    it('hides resource label when showLabel is false', () => {
      render(<ResourceIcon resourceKey="money" value={1000} showLabel={false} />);
      expect(screen.queryByText('MONEY')).toBeNull();
    });

    it('hides resource label by default', () => {
      render(<ResourceIcon resourceKey="money" value={1000} />);
      expect(screen.queryByText('MONEY')).toBeNull();
    });
  });

  describe('formatting', () => {
    it('formats small numbers without suffix', () => {
      render(<ResourceIcon resourceKey="money" value={500} />);
      expect(screen.getByText('500')).toBeTruthy();
    });

    it('formats thousands with K suffix', () => {
      render(<ResourceIcon resourceKey="bots" value={2500} />);
      expect(screen.getByText('2.5K')).toBeTruthy();
    });

    it('formats millions with M suffix', () => {
      render(<ResourceIcon resourceKey="crypto" value={5000000} />);
      expect(screen.getByText('5M')).toBeTruthy();
    });

    it('formats zero correctly', () => {
      render(<ResourceIcon resourceKey="heat" value={0} />);
      expect(screen.getByText('0')).toBeTruthy();
    });

    it('formats decimal trust values', () => {
      render(<ResourceIcon resourceKey="trust" value={1.5} />);
      expect(screen.getByText('1.5')).toBeTruthy();
    });
  });

  describe('color coding', () => {
    it('uses gold color for money', () => {
      render(<ResourceIcon resourceKey="money" value={100} testID="resource-icon" />);
      const valueText = screen.getByText('100');
      // Check the color is applied to the text style
      expect(valueText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: COLORS.gold }),
        ])
      );
    });

    it('uses hotPink color for reputation', () => {
      render(<ResourceIcon resourceKey="reputation" value={100} testID="resource-icon" />);
      const valueText = screen.getByText('100');
      expect(valueText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: COLORS.hotPink }),
        ])
      );
    });

    it('uses warningRed color for heat', () => {
      render(<ResourceIcon resourceKey="heat" value={100} testID="resource-icon" />);
      const valueText = screen.getByText('100');
      expect(valueText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: COLORS.warningRed }),
        ])
      );
    });

    it('uses terminalGreen color for bots', () => {
      render(<ResourceIcon resourceKey="bots" value={100} testID="resource-icon" />);
      const valueText = screen.getByText('100');
      expect(valueText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: COLORS.terminalGreen }),
        ])
      );
    });

    it('uses trustBlue color for skillPoints', () => {
      render(<ResourceIcon resourceKey="skillPoints" value={100} testID="resource-icon" />);
      const valueText = screen.getByText('100');
      expect(valueText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: COLORS.trustBlue }),
        ])
      );
    });

    it('uses hotPink color for crypto', () => {
      render(<ResourceIcon resourceKey="crypto" value={100} testID="resource-icon" />);
      const valueText = screen.getByText('100');
      expect(valueText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: COLORS.hotPink }),
        ])
      );
    });

    it('uses trustBlue color for trust', () => {
      render(<ResourceIcon resourceKey="trust" value={100} testID="resource-icon" />);
      const valueText = screen.getByText('100');
      expect(valueText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: COLORS.trustBlue }),
        ])
      );
    });
  });

  describe('icon placeholder', () => {
    it('renders icon container', () => {
      render(<ResourceIcon resourceKey="money" value={100} testID="resource-icon" />);
      const icon = screen.getByTestId('resource-icon-placeholder');
      expect(icon).toBeTruthy();
    });
  });

  describe('all resource types', () => {
    const resourceKeys = ['money', 'reputation', 'heat', 'bots', 'skillPoints', 'crypto', 'trust'] as const;

    resourceKeys.forEach((key) => {
      it(`renders ${key} resource`, () => {
        render(<ResourceIcon resourceKey={key} value={100} testID={`resource-${key}`} />);
        expect(screen.getByTestId(`resource-${key}`)).toBeTruthy();
      });
    });
  });
});
