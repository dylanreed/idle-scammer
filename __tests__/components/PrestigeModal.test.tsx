// ABOUTME: Unit tests for PrestigeModal component
// ABOUTME: Covers choice phase, result phase, and callback behavior for both prestige paths

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { PrestigeModal } from '../../src/components/PrestigeModal';
import type { PrestigeModalProps } from '../../src/components/PrestigeModal';
import type { GameResources } from '../../src/game/types';
import type { PrestigeResult } from '../../src/game/prestige/types';

const mockResources: GameResources = {
  money: 50000,
  reputation: 100,
  heat: 100,
  bots: 25,
  skillPoints: 5,
  crypto: 3.5,
  trust: 11,
};

const cleanEscapeResult: PrestigeResult = {
  choice: 'clean-escape',
  previousTrust: 11,
  newTrust: 21,
  bonuses: undefined,
};

const snitchResult: PrestigeResult = {
  choice: 'snitch',
  previousTrust: 11,
  newTrust: 6,
  bonuses: [
    { type: 'money', amount: 5000 },
    { type: 'bots', amount: 2 },
    { type: 'reputation', amount: 10 },
    { type: 'crypto', amount: 0.35 },
    { type: 'skill-points', amount: 0 },
  ],
};

function createDefaultProps(overrides: Partial<PrestigeModalProps> = {}): PrestigeModalProps {
  return {
    visible: true,
    phase: 'choice',
    resources: mockResources,
    result: undefined,
    onChoose: jest.fn(),
    onContinue: jest.fn(),
    ...overrides,
  };
}

describe('PrestigeModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('visibility', () => {
    it('should return null when visible is false', () => {
      const { toJSON } = render(<PrestigeModal {...createDefaultProps({ visible: false })} />);
      expect(toJSON()).toBeNull();
    });

    it('should render content when visible is true', () => {
      render(<PrestigeModal {...createDefaultProps()} />);
      // Advance timers past the typing animation (50ms per char * text length)
      act(() => { jest.advanceTimersByTime(5000); });
      expect(screen.getByText('HEAT CRITICAL')).toBeTruthy();
    });
  });

  describe('choice phase', () => {
    it('should render HEAT CRITICAL header', () => {
      render(<PrestigeModal {...createDefaultProps()} />);
      act(() => { jest.advanceTimersByTime(5000); });
      expect(screen.getByText('HEAT CRITICAL')).toBeTruthy();
    });

    it('should render the feds warning subtext', () => {
      render(<PrestigeModal {...createDefaultProps()} />);
      expect(screen.getByText('The feds are closing in. Choose your exit strategy.')).toBeTruthy();
    });

    it('should render Clean Escape button', () => {
      render(<PrestigeModal {...createDefaultProps()} />);
      expect(screen.getByText('CLEAN ESCAPE')).toBeTruthy();
    });

    it('should render Snitch button', () => {
      render(<PrestigeModal {...createDefaultProps()} />);
      expect(screen.getByText('SNITCH')).toBeTruthy();
    });

    it('should render clean escape subtext', () => {
      render(<PrestigeModal {...createDefaultProps()} />);
      expect(screen.getByText('+10 Trust / Lose Everything')).toBeTruthy();
    });

    it('should render snitch subtext', () => {
      render(<PrestigeModal {...createDefaultProps()} />);
      expect(screen.getByText('-5 Trust / Keep 10% Resources')).toBeTruthy();
    });

    it('should display current resource summary', () => {
      render(<PrestigeModal {...createDefaultProps()} />);
      // Should show current money, bots, reputation, crypto, trust
      expect(screen.getByTestId('prestige-resource-summary')).toBeTruthy();
    });

    it('should fire onChoose with clean-escape when Clean Escape is pressed', () => {
      const onChoose = jest.fn();
      render(<PrestigeModal {...createDefaultProps({ onChoose })} />);
      fireEvent.press(screen.getByTestId('prestige-clean-escape-btn'));
      expect(onChoose).toHaveBeenCalledWith('clean-escape');
      expect(onChoose).toHaveBeenCalledTimes(1);
    });

    it('should fire onChoose with snitch when Snitch is pressed', () => {
      const onChoose = jest.fn();
      render(<PrestigeModal {...createDefaultProps({ onChoose })} />);
      fireEvent.press(screen.getByTestId('prestige-snitch-btn'));
      expect(onChoose).toHaveBeenCalledWith('snitch');
      expect(onChoose).toHaveBeenCalledTimes(1);
    });
  });

  describe('result phase - clean escape', () => {
    it('should show success header for clean escape', () => {
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: cleanEscapeResult,
          })}
        />
      );
      act(() => { jest.advanceTimersByTime(5000); });
      expect(screen.getByText('YOU GOT AWAY CLEAN')).toBeTruthy();
    });

    it('should show trust change for clean escape', () => {
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: cleanEscapeResult,
          })}
        />
      );
      expect(screen.getByText(/Trust: 11 → 21/)).toBeTruthy();
    });

    it('should show all resources reset message', () => {
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: cleanEscapeResult,
          })}
        />
      );
      expect(screen.getByText('ALL RESOURCES RESET')).toBeTruthy();
    });

    it('should show starting skill points', () => {
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: cleanEscapeResult,
          })}
        />
      );
      // Trust 21 -> (21-1)*1 = 20 starting SP
      expect(screen.getByText(/Starting Skill Points: 20/)).toBeTruthy();
    });

    it('should render CONTINUE button', () => {
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: cleanEscapeResult,
          })}
        />
      );
      expect(screen.getByText('CONTINUE')).toBeTruthy();
    });

    it('should fire onContinue when CONTINUE is pressed', () => {
      const onContinue = jest.fn();
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: cleanEscapeResult,
            onContinue,
          })}
        />
      );
      fireEvent.press(screen.getByTestId('prestige-continue-btn'));
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('result phase - snitch', () => {
    it('should show snitch header', () => {
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: snitchResult,
          })}
        />
      );
      act(() => { jest.advanceTimersByTime(5000); });
      expect(screen.getByText('YOU RATTED THEM OUT')).toBeTruthy();
    });

    it('should show trust change for snitch', () => {
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: snitchResult,
          })}
        />
      );
      expect(screen.getByText(/Trust: 11 → 6/)).toBeTruthy();
    });

    it('should show bonuses kept from snitching', () => {
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: snitchResult,
          })}
        />
      );
      expect(screen.getByTestId('prestige-bonuses')).toBeTruthy();
    });

    it('should display individual bonus amounts', () => {
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: snitchResult,
          })}
        />
      );
      // Should show the kept resources
      expect(screen.getByText(/5K/)).toBeTruthy(); // 5000 money
    });

    it('should render CONTINUE button for snitch result', () => {
      render(
        <PrestigeModal
          {...createDefaultProps({
            phase: 'result',
            result: snitchResult,
          })}
        />
      );
      expect(screen.getByText('CONTINUE')).toBeTruthy();
    });
  });
});
