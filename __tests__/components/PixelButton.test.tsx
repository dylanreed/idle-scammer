// ABOUTME: Tests for PixelButton component - retro styled pressable button
// ABOUTME: Verifies variants, press states, disabled states, and styling

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PixelButton } from '../../src/components/PixelButton';
import { COLORS } from '../../src/components/theme';

describe('PixelButton', () => {
  it('renders children text correctly', () => {
    render(
      <PixelButton onPress={() => {}}>
        Click Me
      </PixelButton>
    );

    expect(screen.getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    render(
      <PixelButton onPress={onPressMock} testID="pixel-button">
        Press Me
      </PixelButton>
    );

    fireEvent.press(screen.getByTestId('pixel-button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    render(
      <PixelButton onPress={onPressMock} disabled testID="pixel-button">
        Disabled Button
      </PixelButton>
    );

    fireEvent.press(screen.getByTestId('pixel-button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  describe('variants', () => {
    it('renders primary variant with terminal green', () => {
      render(
        <PixelButton onPress={() => {}} variant="primary" testID="pixel-button">
          Primary
        </PixelButton>
      );

      const button = screen.getByTestId('pixel-button');
      const style = button.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.borderColor).toBe(COLORS.terminalGreen);
    });

    it('renders danger variant with warning red', () => {
      render(
        <PixelButton onPress={() => {}} variant="danger" testID="pixel-button">
          Danger
        </PixelButton>
      );

      const button = screen.getByTestId('pixel-button');
      const style = button.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.borderColor).toBe(COLORS.warningRed);
    });

    it('renders gold variant with gold color', () => {
      render(
        <PixelButton onPress={() => {}} variant="gold" testID="pixel-button">
          Gold
        </PixelButton>
      );

      const button = screen.getByTestId('pixel-button');
      const style = button.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.borderColor).toBe(COLORS.gold);
    });

    it('defaults to primary variant', () => {
      render(
        <PixelButton onPress={() => {}} testID="pixel-button">
          Default
        </PixelButton>
      );

      const button = screen.getByTestId('pixel-button');
      const style = button.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.borderColor).toBe(COLORS.terminalGreen);
    });
  });

  describe('disabled state', () => {
    it('applies dimmed styling when disabled', () => {
      render(
        <PixelButton onPress={() => {}} disabled testID="pixel-button">
          Disabled
        </PixelButton>
      );

      const button = screen.getByTestId('pixel-button');
      const style = button.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.opacity).toBeLessThan(1);
    });
  });

  describe('styling', () => {
    it('has chunky border for pixel look', () => {
      render(
        <PixelButton onPress={() => {}} testID="pixel-button">
          Chunky
        </PixelButton>
      );

      const button = screen.getByTestId('pixel-button');
      const style = button.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.borderWidth).toBeGreaterThanOrEqual(2);
    });

    it('has dark background', () => {
      render(
        <PixelButton onPress={() => {}} testID="pixel-button">
          Dark BG
        </PixelButton>
      );

      const button = screen.getByTestId('pixel-button');
      const style = button.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.backgroundColor).toBe(COLORS.backgroundSecondary);
    });

    it('applies custom style when provided', () => {
      render(
        <PixelButton
          onPress={() => {}}
          testID="pixel-button"
          style={{ marginTop: 50 }}
        >
          Custom Style
        </PixelButton>
      );

      const button = screen.getByTestId('pixel-button');
      const style = button.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.marginTop).toBe(50);
    });
  });
});
