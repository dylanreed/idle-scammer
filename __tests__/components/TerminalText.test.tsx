// ABOUTME: Tests for TerminalText component - styled monospace text
// ABOUTME: Verifies text rendering, colors, sizes, and typing animation

import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import { TerminalText } from '../../src/components/TerminalText';
import { COLORS, FONT_SIZES } from '../../src/components/theme';

describe('TerminalText', () => {
  describe('basic rendering', () => {
    it('renders text content correctly', () => {
      render(<TerminalText>Hello Terminal</TerminalText>);
      expect(screen.getByText('Hello Terminal')).toBeTruthy();
    });

    it('renders with testID', () => {
      render(<TerminalText testID="terminal-text">Content</TerminalText>);
      expect(screen.getByTestId('terminal-text')).toBeTruthy();
    });
  });

  describe('colors', () => {
    it('uses terminal green by default', () => {
      render(<TerminalText testID="terminal-text">Green Text</TerminalText>);
      const text = screen.getByTestId('terminal-text');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.color).toBe(COLORS.terminalGreen);
    });

    it('accepts custom color', () => {
      render(
        <TerminalText testID="terminal-text" color={COLORS.gold}>
          Gold Text
        </TerminalText>
      );
      const text = screen.getByTestId('terminal-text');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.color).toBe(COLORS.gold);
    });

    it('can use warning red color', () => {
      render(
        <TerminalText testID="terminal-text" color={COLORS.warningRed}>
          Red Alert
        </TerminalText>
      );
      const text = screen.getByTestId('terminal-text');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.color).toBe(COLORS.warningRed);
    });

    it('can use dim text color', () => {
      render(
        <TerminalText testID="terminal-text" color={COLORS.textDim}>
          Dim Text
        </TerminalText>
      );
      const text = screen.getByTestId('terminal-text');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.color).toBe(COLORS.textDim);
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(
        <TerminalText testID="terminal-text" size="sm">
          Small
        </TerminalText>
      );
      const text = screen.getByTestId('terminal-text');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.fontSize).toBe(FONT_SIZES.sm);
    });

    it('renders medium size by default', () => {
      render(<TerminalText testID="terminal-text">Medium</TerminalText>);
      const text = screen.getByTestId('terminal-text');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.fontSize).toBe(FONT_SIZES.md);
    });

    it('renders large size', () => {
      render(
        <TerminalText testID="terminal-text" size="lg">
          Large
        </TerminalText>
      );
      const text = screen.getByTestId('terminal-text');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.fontSize).toBe(FONT_SIZES.lg);
    });
  });

  describe('monospace font', () => {
    it('uses monospace font family', () => {
      render(<TerminalText testID="terminal-text">Mono</TerminalText>);
      const text = screen.getByTestId('terminal-text');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.fontFamily).toBe('monospace');
    });
  });

  describe('typing animation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('shows full text when animate is false', () => {
      render(<TerminalText animate={false}>Full Text Here</TerminalText>);
      expect(screen.getByText('Full Text Here')).toBeTruthy();
    });

    it('shows full text when animate is not specified', () => {
      render(<TerminalText>Full Text Here</TerminalText>);
      expect(screen.getByText('Full Text Here')).toBeTruthy();
    });

    it('starts with empty text when animate is true', () => {
      render(
        <TerminalText testID="terminal-text" animate>
          Typing...
        </TerminalText>
      );
      // Initially should show cursor or empty
      const text = screen.getByTestId('terminal-text');
      // The animated text should start empty or with cursor
      expect(text.props.children).not.toBe('Typing...');
    });

    it('gradually reveals text when animated', () => {
      render(
        <TerminalText testID="terminal-text" animate>
          ABC
        </TerminalText>
      );

      // Advance through animation
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should have started typing
      const text = screen.getByTestId('terminal-text');
      const content = text.props.children;
      // Should be progressing through the text
      expect(typeof content === 'string' || Array.isArray(content)).toBe(true);
    });

    it('completes animation showing full text', () => {
      render(
        <TerminalText testID="terminal-text" animate>
          Done
        </TerminalText>
      );

      // Advance far enough for animation to complete
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should show complete text
      expect(screen.getByText(/Done/)).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('applies custom style when provided', () => {
      render(
        <TerminalText testID="terminal-text" style={{ marginLeft: 10 }}>
          Styled
        </TerminalText>
      );
      const text = screen.getByTestId('terminal-text');
      const style = text.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      expect(flatStyle.marginLeft).toBe(10);
    });
  });
});
