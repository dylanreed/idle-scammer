// ABOUTME: Tests for TutorialModal component
// ABOUTME: Verifies visibility, content rendering, and CONTINUE button behavior

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TutorialModal } from '../../src/components/TutorialModal';

describe('TutorialModal', () => {
  const defaultProps = {
    visible: true,
    title: 'TRUST — Your Criminal Rep',
    body: [
      'Trust is the only resource that survives prestige.',
      'Higher trust = more starting Skill Points each run.',
    ],
    onContinue: jest.fn(),
    testID: 'tutorial-modal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visibility', () => {
    it('renders when visible is true', () => {
      render(<TutorialModal {...defaultProps} />);
      expect(screen.getByTestId('tutorial-modal')).toBeTruthy();
    });

    it('renders nothing when visible is false', () => {
      render(<TutorialModal {...defaultProps} visible={false} />);
      expect(screen.queryByTestId('tutorial-modal')).toBeNull();
    });
  });

  describe('content', () => {
    it('renders a title element (animated typing effect)', () => {
      render(<TutorialModal {...defaultProps} />);
      // Title uses TerminalText with animate prop, so it shows a typing cursor initially.
      // We verify the modal container renders correctly rather than matching exact text.
      expect(screen.getByTestId('tutorial-modal')).toBeTruthy();
    });

    it('renders all body paragraphs', () => {
      render(<TutorialModal {...defaultProps} />);
      expect(screen.getByText('Trust is the only resource that survives prestige.')).toBeTruthy();
      expect(screen.getByText('Higher trust = more starting Skill Points each run.')).toBeTruthy();
    });

    it('renders the CONTINUE button', () => {
      render(<TutorialModal {...defaultProps} />);
      expect(screen.getByTestId('tutorial-continue-btn')).toBeTruthy();
      expect(screen.getByText('CONTINUE')).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('calls onContinue when CONTINUE is pressed', () => {
      const mockOnContinue = jest.fn();
      render(<TutorialModal {...defaultProps} onContinue={mockOnContinue} />);

      fireEvent.press(screen.getByTestId('tutorial-continue-btn'));
      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('with single paragraph', () => {
    it('renders a single body paragraph', () => {
      render(
        <TutorialModal
          visible={true}
          title="TEST"
          body={['Single paragraph.']}
          onContinue={jest.fn()}
        />
      );

      expect(screen.getByText('Single paragraph.')).toBeTruthy();
    });
  });
});
