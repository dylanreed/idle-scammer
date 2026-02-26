// ABOUTME: Tests for HelpIcon component - small "?" button that triggers help modals
// ABOUTME: Verifies rendering, press behavior, testID, and accent styling

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { HelpIcon } from '../../src/components/HelpIcon';
import { COLORS } from '../../src/components/theme';

describe('HelpIcon', () => {
  it('renders a "?" character', () => {
    render(<HelpIcon topicKey="resources" onPress={() => {}} />);
    expect(screen.getByText('?')).toBeTruthy();
  });

  it('calls onPress with the topic key when pressed', () => {
    const onPressMock = jest.fn();
    render(<HelpIcon topicKey="bot-network" onPress={onPressMock} />);

    fireEvent.press(screen.getByTestId('help-icon-bot-network'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
    expect(onPressMock).toHaveBeenCalledWith('bot-network');
  });

  it('uses testID based on topic key', () => {
    render(<HelpIcon topicKey="managers" onPress={() => {}} />);
    expect(screen.getByTestId('help-icon-managers')).toBeTruthy();
  });

  it('has accent-colored styling', () => {
    render(<HelpIcon topicKey="resources" onPress={() => {}} />);

    const button = screen.getByTestId('help-icon-resources');
    const style = button.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    expect(flatStyle.borderColor).toBe(COLORS.accent);
  });

  it('renders inline (does not break layout)', () => {
    render(<HelpIcon topicKey="resources" onPress={() => {}} />);

    const button = screen.getByTestId('help-icon-resources');
    const style = button.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style;
    // Should be compact
    expect(flatStyle.width).toBeLessThanOrEqual(24);
    expect(flatStyle.height).toBeLessThanOrEqual(24);
  });
});
