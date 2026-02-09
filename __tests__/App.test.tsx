// ABOUTME: Smoke test for main App component
// ABOUTME: Verifies basic rendering and test setup works correctly

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import App from '../App';

// Mock the storage module so GameProvider doesn't try to load real saves
jest.mock('../src/game/persistence/storage', () => ({
  loadGame: jest.fn(() => Promise.resolve(null)),
  saveGame: jest.fn(() => Promise.resolve()),
  clearSave: jest.fn(() => Promise.resolve()),
  hasSaveData: jest.fn(() => Promise.resolve(false)),
}));

describe('App', () => {
  it('renders without crashing', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.root).toBeTruthy();
    });
  });

  it('displays the game screen with Nigerian Prince Emails', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Nigerian Prince Emails/i)).toBeTruthy();
    });
  });
});
