// ABOUTME: Tests for OriginSelectModal component
// ABOUTME: Validates origin card rendering, selection interaction, and onSelect callback

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OriginSelectModal } from '../../src/components/OriginSelectModal';
import { ORIGINS } from '../../src/game/origin/constants';

jest.mock('../../src/utils/haptics', () => ({
  triggerHaptic: jest.fn(),
}));

describe('OriginSelectModal', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not visible', () => {
    render(
      <OriginSelectModal visible={false} onSelect={mockOnSelect} testID="origin-modal" />
    );
    expect(screen.queryByTestId('origin-modal')).toBeNull();
  });

  it('renders when visible', () => {
    render(
      <OriginSelectModal visible={true} onSelect={mockOnSelect} testID="origin-modal" />
    );
    expect(screen.getByTestId('origin-modal')).toBeTruthy();
  });

  it('renders all 3 origin cards', () => {
    render(
      <OriginSelectModal visible={true} onSelect={mockOnSelect} />
    );

    // Check each origin name is displayed
    expect(screen.getByText(ORIGINS['moms-basement'].name)).toBeTruthy();
    expect(screen.getByText(ORIGINS['internet-cafe'].name)).toBeTruthy();
    expect(screen.getByText(ORIGINS['stolen-phone'].name)).toBeTruthy();
  });

  it('renders origin descriptions', () => {
    render(
      <OriginSelectModal visible={true} onSelect={mockOnSelect} />
    );

    expect(screen.getByText(ORIGINS['moms-basement'].bonusDescription)).toBeTruthy();
    expect(screen.getByText(ORIGINS['internet-cafe'].bonusDescription)).toBeTruthy();
    expect(screen.getByText(ORIGINS['stolen-phone'].bonusDescription)).toBeTruthy();
  });

  it('calls onSelect with correct origin ID when card is pressed', () => {
    render(
      <OriginSelectModal visible={true} onSelect={mockOnSelect} />
    );

    fireEvent.press(screen.getByTestId('origin-card-moms-basement'));
    fireEvent.press(screen.getByTestId('origin-choose-btn'));
    expect(mockOnSelect).toHaveBeenCalledWith('moms-basement');
  });

  it('calls onSelect with internet-cafe when that card is chosen', () => {
    render(
      <OriginSelectModal visible={true} onSelect={mockOnSelect} />
    );

    fireEvent.press(screen.getByTestId('origin-card-internet-cafe'));
    fireEvent.press(screen.getByTestId('origin-choose-btn'));
    expect(mockOnSelect).toHaveBeenCalledWith('internet-cafe');
  });

  it('calls onSelect with stolen-phone when that card is chosen', () => {
    render(
      <OriginSelectModal visible={true} onSelect={mockOnSelect} />
    );

    fireEvent.press(screen.getByTestId('origin-card-stolen-phone'));
    fireEvent.press(screen.getByTestId('origin-choose-btn'));
    expect(mockOnSelect).toHaveBeenCalledWith('stolen-phone');
  });

  it('has a disabled CHOOSE button until a card is selected', () => {
    render(
      <OriginSelectModal visible={true} onSelect={mockOnSelect} />
    );

    const chooseBtn = screen.getByTestId('origin-choose-btn');
    expect(chooseBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it('enables CHOOSE button after selecting a card', () => {
    render(
      <OriginSelectModal visible={true} onSelect={mockOnSelect} />
    );

    fireEvent.press(screen.getByTestId('origin-card-stolen-phone'));
    const chooseBtn = screen.getByTestId('origin-choose-btn');
    expect(chooseBtn.props.accessibilityState?.disabled).toBe(false);
  });
});
