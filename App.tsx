// ABOUTME: Main application entry point for Idle Scammer
// ABOUTME: Renders the GameScreen wrapped in SafeAreaProvider for safe area insets

import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider } from './src/game/persistence/GameProvider';
import { GameScreen } from './src/screens/GameScreen';
import { COLORS } from './src/components/theme';

export default function App() {
  return (
    <View style={styles.outerShell}>
      <View style={styles.gameContainer}>
        <SafeAreaProvider>
          <GameProvider>
            <GameScreen />
          </GameProvider>
        </SafeAreaProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerShell: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  gameContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1024,
  },
});
