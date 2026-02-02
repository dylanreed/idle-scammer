// ABOUTME: Tests for CRTFrame component - CRT monitor styled container
// ABOUTME: Verifies rendering, styling, and scanline overlay functionality

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
    // Check that borderRadius is applied (could be flattened array)
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style)
      : style;
    expect(flatStyle.borderRadius).toBeGreaterThan(0);
  });

  it('has green border for CRT effect', () => {
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
    expect(flatStyle.borderColor).toBe(COLORS.terminalGreenDim);
    expect(flatStyle.borderWidth).toBeGreaterThan(0);
  });

  it('shows scanlines when showScanlines is true', () => {
    render(
      <CRTFrame testID="crt-frame" showScanlines={true}>
        <Text>Content</Text>
      </CRTFrame>
    );

    // Scanline overlay should be rendered
    const scanlines = screen.getByTestId('crt-scanlines');
    expect(scanlines).toBeTruthy();
  });

  it('hides scanlines when showScanlines is false', () => {
    render(
      <CRTFrame testID="crt-frame" showScanlines={false}>
        <Text>Content</Text>
      </CRTFrame>
    );

    // Scanline overlay should not be rendered
    expect(screen.queryByTestId('crt-scanlines')).toBeNull();
  });

  it('shows scanlines by default', () => {
    render(
      <CRTFrame testID="crt-frame">
        <Text>Content</Text>
      </CRTFrame>
    );

    // Scanlines should be visible by default
    const scanlines = screen.getByTestId('crt-scanlines');
    expect(scanlines).toBeTruthy();
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
      ? Object.assign({}, ...style)
      : style;
    expect(flatStyle.marginTop).toBe(100);
  });
});
