// ABOUTME: Width-responsive layout that shows three columns on wide screens
// ABOUTME: Switches to tab-based navigation on narrow screens (phones)

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useWindowDimensions } from './useWindowDimensions';
import { PixelButton } from './PixelButton';
import { SPACING, LAYOUT } from './theme';

export interface ResponsiveLayoutProps {
  /** Content for the left column / SCAMS tab */
  scamsContent: React.ReactNode;

  /** Content for the center column / SKILLS tab */
  skillsContent?: React.ReactNode;

  /** Content for the right column / OPS CENTER tab */
  opsContent: React.ReactNode;

  /** Content for the CRYPTO tab (trust-gated, appears after skills) */
  cryptoContent?: React.ReactNode;

  /** Test ID for testing */
  testID?: string;
}

type TabKey = 'scams' | 'skills' | 'crypto' | 'ops';

/**
 * Responsive layout that adapts to screen width.
 * Wide screens (>= 768px): Three-column layout (3/2/2 flex split).
 * Narrow screens (< 768px): Tab switching between SCAMS, SKILLS, and OPS CENTER.
 */
export function ResponsiveLayout({
  scamsContent,
  skillsContent,
  opsContent,
  cryptoContent,
  testID,
}: ResponsiveLayoutProps): React.ReactElement {
  const { width } = useWindowDimensions();
  const isWide = width >= LAYOUT.BREAKPOINT;
  const [activeTab, setActiveTab] = useState<TabKey>('scams');

  if (isWide) {
    return (
      <View style={styles.wideContainer} testID={testID ?? 'responsive-layout-wide'}>
        <View style={styles.leftColumn}>{scamsContent}</View>
        {skillsContent && (
          <View style={styles.centerColumn}>{skillsContent}</View>
        )}
        {cryptoContent && (
          <View style={styles.centerColumn}>{cryptoContent}</View>
        )}
        <View style={styles.rightColumn}>{opsContent}</View>
      </View>
    );
  }

  return (
    <View style={styles.narrowContainer} testID={testID ?? 'responsive-layout-narrow'}>
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
            {'CRYPTO'}
          </PixelButton>
        )}
        <PixelButton
          onPress={() => setActiveTab('ops')}
          variant={activeTab === 'ops' ? 'primary' : 'secondary'}
          style={styles.tabButton}
          testID="tab-ops"
        >
          {'OPS CENTER'}
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
  wideContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: LAYOUT.LEFT_COLUMN_FLEX,
  },
  centerColumn: {
    flex: LAYOUT.CENTER_COLUMN_FLEX,
  },
  rightColumn: {
    flex: LAYOUT.RIGHT_COLUMN_FLEX,
  },
  narrowContainer: {
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
