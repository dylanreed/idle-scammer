// ABOUTME: Smoke test for main App component
// ABOUTME: Verifies basic rendering and test setup works correctly

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.root).toBeTruthy();
  });

  it('displays the initial text', () => {
    render(<App />);
    expect(
      screen.getByText(/Open up App.tsx to start working on your app!/i)
    ).toBeTruthy();
  });
});
