// ABOUTME: Main application entry point for Idle Scammer
// ABOUTME: Renders the GameScreen wrapped in SafeAreaProvider for safe area insets

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider } from './src/game/persistence/GameProvider';
import { GameScreen } from './src/screens/GameScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <GameScreen />
      </GameProvider>
    </SafeAreaProvider>
  );
}
