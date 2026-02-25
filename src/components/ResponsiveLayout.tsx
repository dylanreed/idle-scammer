// ABOUTME: Tab-based navigation layout for the game screen
// ABOUTME: Four tabs: SCAMS, SKILLS (conditional), TRUSTCOIN (conditional), MANAGERS

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { PixelButton } from './PixelButton';
import { SPACING } from './theme';

export interface ResponsiveLayoutProps {
  /** Content for the SCAMS tab */
  scamsContent: React.ReactNode;

  /** Content for the SKILLS tab (prestige-gated) */
  skillsContent?: React.ReactNode;

  /** Content for the MANAGERS tab (renamed from OPS CENTER) */
  opsContent: React.ReactNode;

  /** Content for the TRUSTCOIN tab (trust-gated) */
  cryptoContent?: React.ReactNode;

  /** Test ID for testing */
  testID?: string;
}

type TabKey = 'scams' | 'skills' | 'crypto' | 'ops';

/**
 * Tab-based layout for the game screen.
 * Four tabs: SCAMS, SKILLS (after prestige 2), TRUSTCOIN (after trust >= 150), MANAGERS.
 */
export function ResponsiveLayout({
  scamsContent,
  skillsContent,
  opsContent,
  cryptoContent,
  testID,
}: ResponsiveLayoutProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabKey>('scams');

  return (
    <View style={styles.container} testID={testID ?? 'responsive-layout'}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <PixelButton
          onPress={() => setActiveTab('scams')}
          variant={activeTab === 'scams' ? 'primary' : 'secondary'}
          style={styles.tabButton}
          testID="tab-scams"
        >
          {'SCAMS'}
        </PixelButton>
        {skillsContent && (
          <PixelButton
            onPress={() => setActiveTab('skills')}
            variant={activeTab === 'skills' ? 'primary' : 'secondary'}
            style={styles.tabButton}
            testID="tab-skills"
          >
            {'SKILLS'}
          </PixelButton>
        )}
        {cryptoContent && (
          <PixelButton
            onPress={() => setActiveTab('crypto')}
            variant={activeTab === 'crypto' ? 'primary' : 'secondary'}
            style={styles.tabButton}
            testID="tab-crypto"
          >
            {'TRUSTCOIN'}
          </PixelButton>
        )}
        <PixelButton
          onPress={() => setActiveTab('ops')}
          variant={activeTab === 'ops' ? 'primary' : 'secondary'}
          style={styles.tabButton}
          testID="tab-ops"
        >
          {'MANAGERS'}
        </PixelButton>
      </View>

      {/* Tab content */}
      <View style={styles.tabContent}>
        {activeTab === 'scams' && scamsContent}
        {activeTab === 'skills' && skillsContent}
        {activeTab === 'crypto' && cryptoContent}
        {activeTab === 'ops' && opsContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tabButton: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
});
