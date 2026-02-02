// ABOUTME: Full resource heads-up display component showing all player resources
// ABOUTME: Uses CRTFrame container with compact mobile-friendly layout

import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { CRTFrame } from './CRTFrame';
import { ResourceIcon } from './ResourceIcon';
import { SPACING } from './theme';
import type { GameResources, ResourceKey } from '../game/types';

/**
 * Order of resources in the HUD display.
 * Arranged for quick scanning: primary currency first, prestige resource last.
 */
const RESOURCE_ORDER: ResourceKey[] = [
  'money',
  'reputation',
  'heat',
  'bots',
  'skillPoints',
  'crypto',
  'trust',
];

/**
 * Props for the ResourceHUD component
 */
export interface ResourceHUDProps {
  /** Current game resources to display */
  resources: GameResources;

  /** Whether to show in compact mode without labels (default: true) */
  compact?: boolean;

  /** Whether to show CRT scanline effect (default: true) */
  showScanlines?: boolean;

  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Full resource display HUD component.
 * Shows all 7 game resources in a horizontally scrollable row within a CRT frame.
 * Designed to be always visible at the top of the game screen.
 */
export function ResourceHUD({
  resources,
  compact = true,
  showScanlines = true,
  style,
  testID,
}: ResourceHUDProps): React.ReactElement {
  return (
    <CRTFrame
      testID={testID}
      showScanlines={showScanlines}
      style={[styles.frame, style]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        testID="resource-row"
      >
        {RESOURCE_ORDER.map((resourceKey) => (
          <ResourceIcon
            key={resourceKey}
            resourceKey={resourceKey}
            value={resources[resourceKey]}
            showLabel={!compact}
            style={styles.resourceItem}
          />
        ))}
      </ScrollView>
    </CRTFrame>
  );
}

const styles = StyleSheet.create({
  frame: {
    padding: SPACING.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  resourceItem: {
    marginHorizontal: SPACING.xs,
  },
});
