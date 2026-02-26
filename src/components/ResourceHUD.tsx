// ABOUTME: Full resource heads-up display component showing all player resources
// ABOUTME: Uses CRTFrame container with compact mobile-friendly layout

import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { CRTFrame } from './CRTFrame';
import { ResourceIcon } from './ResourceIcon';
import { HelpIcon } from './HelpIcon';
import { SPACING } from './theme';
import type { GameResources, ResourceKey } from '../game/types';

/**
 * Order of resources in the HUD display.
 * Arranged for quick scanning: primary currency first, prestige resource last.
 */
const RESOURCE_ORDER: ResourceKey[] = [
  'money',
  'heat',
  'bots',
  'skillPoints',
  'crypto',
  'trust',
];

/**
 * Resources visible before the player's first prestige.
 * Trust, Bots, Skill Points, and Crypto are hidden to reduce overwhelm.
 */
const PRE_PRESTIGE_RESOURCES: Set<ResourceKey> = new Set([
  'money',
  'heat',
]);

/**
 * Resources hidden until their systems are implemented.
 */
const ALWAYS_HIDDEN_RESOURCES: Set<ResourceKey> = new Set([]);

/**
 * Props for the ResourceHUD component
 */
/** Minimum trust level required to see the crypto resource (Tier 3 access) */
const CRYPTO_TRUST_THRESHOLD = 150;

export interface ResourceHUDProps {
  /** Current game resources to display */
  resources: GameResources;

  /** Maximum heat threshold (100 + Ghost Protocol bonus). Shown as "heat/max" when provided. */
  heatMax?: number;

  /** How many times the player has prestiged (gates which resources are shown) */
  prestigeCount?: number;

  /** Whether to show in compact mode without labels (default: true) */
  compact?: boolean;

  /** Money income per second to display on the money resource icon */
  moneyPerSecond?: number;

  /** Whether to show CRT scanline effect (default: true) */
  showScanlines?: boolean;

  /** Called when player taps a help "?" icon */
  onHelpPress?: (topicKey: string) => void;

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
  heatMax,
  prestigeCount = 0,
  moneyPerSecond,
  compact = true,
  showScanlines = true,
  onHelpPress,
  style,
  testID,
}: ResourceHUDProps): React.ReactElement {
  const visibleResources = RESOURCE_ORDER.filter((key) => {
    if (ALWAYS_HIDDEN_RESOURCES.has(key)) return false;
    // Pre-prestige: only money + heat
    if (prestigeCount < 1 && !PRE_PRESTIGE_RESOURCES.has(key)) return false;
    // Bots + trust: prestige 1+
    if ((key === 'bots' || key === 'trust') && prestigeCount < 1) return false;
    // Skill points: prestige 2+
    if (key === 'skillPoints' && prestigeCount < 2) return false;
    // Crypto: trust threshold (Tier 3 access)
    if (key === 'crypto' && resources.trust < CRYPTO_TRUST_THRESHOLD) return false;
    return true;
  });

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
        {visibleResources.map((resourceKey) => (
          <ResourceIcon
            key={resourceKey}
            resourceKey={resourceKey}
            value={resources[resourceKey]}
            maxValue={resourceKey === 'heat' ? heatMax : undefined}
            perSecond={resourceKey === 'money' ? moneyPerSecond : undefined}
            showLabel={!compact}
            style={styles.resourceItem}
          />
        ))}
        {onHelpPress && (
          <HelpIcon topicKey="resources" onPress={onHelpPress} />
        )}
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
