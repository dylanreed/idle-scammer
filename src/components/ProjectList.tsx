// ABOUTME: List of active and available investment projects
// ABOUTME: Shows active investments with timers and buttons to invest in new projects

import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { TerminalText } from './TerminalText';
import { PixelButton } from './PixelButton';
import { COLORS, SPACING } from './theme';
import { ProjectCard } from './ProjectCard';
import type { ProjectState, ProjectDefinition } from '../game/crypto/types';
import { PROJECT_DEFINITIONS, MAX_ACTIVE_PROJECTS } from '../game/crypto/constants';

export interface ProjectListProps {
  /** Currently active projects */
  activeProjects: ProjectState[];
  /** Current crypto balance */
  crypto: number;
  /** Check if a project at index has matured */
  isProjectMatured: (index: number) => boolean;
  /** Called when player invests in a project */
  onInvest: (definitionId: string, amount: number) => void;
  /** Called when player collects a matured project */
  onCollect: (index: number) => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Displays active investment projects and available project types to invest in.
 */
export function ProjectList({
  activeProjects,
  crypto,
  isProjectMatured,
  onInvest,
  onCollect,
  testID,
}: ProjectListProps): React.ReactElement {
  const [investAmounts, setInvestAmounts] = useState<Record<string, string>>({});
  const atCap = activeProjects.length >= MAX_ACTIVE_PROJECTS;

  return (
    <View style={styles.container} testID={testID}>
      <TerminalText size="sm" color={COLORS.textPrimary}>
        {`INVESTMENTS (${activeProjects.length}/${MAX_ACTIVE_PROJECTS})`}
      </TerminalText>

      {/* Active Projects */}
      {activeProjects.map((project, index) => (
        <ProjectCard
          key={`${project.definitionId}-${project.startedAt}`}
          project={project}
          isMatured={isProjectMatured(index)}
          onCollect={() => onCollect(index)}
          testID={`project-${index}`}
        />
      ))}

      {/* Available Project Types */}
      {!atCap && (
        <View style={styles.availableSection}>
          <TerminalText size="sm" color={COLORS.textSecondary}>
            {'INVEST IN:'}
          </TerminalText>
          {PROJECT_DEFINITIONS.map((def) => {
            const amount = parseFloat(investAmounts[def.id] || '') || 0;
            const canInvest = amount > 0 && amount <= crypto && !atCap;

            return (
              <View key={def.id} style={styles.investRow}>
                <View style={styles.investInfo}>
                  <TerminalText size="sm" color={COLORS.textPrimary}>
                    {def.name}
                  </TerminalText>
                  <TerminalText size="sm" color={COLORS.textSecondary}>
                    {`${def.risk.toUpperCase()} \u2022 ${def.minReturn}x-${def.maxReturn}x \u2022 ${Math.round(def.durationMs / 1000)}s`}
                  </TerminalText>
                </View>
                <View style={styles.investAction}>
                  <TextInput
                    style={styles.input}
                    value={investAmounts[def.id] || ''}
                    onChangeText={(text) =>
                      setInvestAmounts((prev) => ({ ...prev, [def.id]: text }))
                    }
                    placeholder="amt"
                    placeholderTextColor={COLORS.terminalGreenDim}
                    keyboardType="numeric"
                    testID={`invest-input-${def.id}`}
                  />
                  <PixelButton
                    onPress={() => {
                      if (canInvest) {
                        onInvest(def.id, amount);
                        setInvestAmounts((prev) => ({ ...prev, [def.id]: '' }));
                      }
                    }}
                    disabled={!canInvest}
                    variant="primary"
                    testID={`invest-btn-${def.id}`}
                  >
                    {'GO'}
                  </PixelButton>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  availableSection: {
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  investRow: {
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  investInfo: {
    gap: 2,
  },
  investAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.accent,
    color: COLORS.terminalGreen,
    fontFamily: 'monospace',
    fontSize: 12,
    padding: SPACING.xs,
    backgroundColor: COLORS.background,
  },
});
