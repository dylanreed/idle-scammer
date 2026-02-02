// ABOUTME: Jest setup file for Idle Scammer game testing
// ABOUTME: Configures matchers from @testing-library/react-native

import '@testing-library/react-native/build/matchers/extend-expect';

// Polyfills for React Native environment in jsdom
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));
global.clearImmediate = global.clearImmediate || ((id) => clearTimeout(id));

// Mock expo-status-bar to avoid React Native StatusBar issues in tests
jest.mock('expo-status-bar', () => ({
  StatusBar: () => 'StatusBar',
}));
