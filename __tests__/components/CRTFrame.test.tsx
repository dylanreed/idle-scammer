// ABOUTME: Tests for CRTFrame component - pixel art panel container
// ABOUTME: Verifies rendering, styling, accent color, and custom styles

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { CRTFrame } from '../../src/components/CRTFrame';
import { COLORS } from '../../src/components/theme';

describe('CRTFrame', () => {
  it('renders children correctly', () => {
    render(
      <CRTFrame>
        <Text>Test Content</Text>
      </CRTFrame>
    );

    expect(screen.getByText('Test Content')).toBeTruthy();
  });

  it('applies dark background color', () => {
    render(
      <CRTFrame testID="crt-frame">
        <Text>Content</Text>
      </CRTFrame>
    );

    const frame = screen.getByTestId('crt-frame');
    const style = frame.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    expect(flatStyle.backgroundColor).toBe(COLORS.backgroundSecondary);
  });

  it('has rounded corners', () => {
    render(
      <CRTFrame testID="crt-frame">
        <Text>Content</Text>
      </CRTFrame>
    );

    const frame = screen.getByTestId('crt-frame');
    const style = frame.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style)
      : style;
    expect(flatStyle.borderRadius).toBeGreaterThan(0);
  });

  it('has solid border', () => {
    render(
      <CRTFrame testID="crt-frame">
        <Text>Content</Text>
      </CRTFrame>
    );

    const frame = screen.getByTestId('crt-frame');
    const style = frame.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    expect(flatStyle.borderColor).toBe(COLORS.border);
    expect(flatStyle.borderWidth).toBe(3);
    expect(flatStyle.borderStyle).toBe('solid');
  });

  it('does not render scanlines (removed in visual refresh)', () => {
    render(
      <CRTFrame testID="crt-frame" showScanlines={true}>
        <Text>Content</Text>
      </CRTFrame>
    );

    // Scanline overlay is no longer rendered
    expect(screen.queryByTestId('crt-scanlines')).toBeNull();
  });

  it('applies accent color to top border when provided', () => {
    render(
      <CRTFrame testID="crt-frame" accentColor="#ff0000">
        <Text>Content</Text>
      </CRTFrame>
    );

    const frame = screen.getByTestId('crt-frame');
    const style = frame.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    expect(flatStyle.borderTopColor).toBe('#ff0000');
    expect(flatStyle.borderTopWidth).toBe(4);
  });

  it('applies custom style when provided', () => {
    render(
      <CRTFrame testID="crt-frame" style={{ marginTop: 100 }}>
        <Text>Content</Text>
      </CRTFrame>
    );

    const frame = screen.getByTestId('crt-frame');
    const style = frame.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    expect(flatStyle.marginTop).toBe(100);
  });
});
