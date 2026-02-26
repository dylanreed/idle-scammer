// ABOUTME: Tests for help content definitions
// ABOUTME: Validates all expected topics exist with valid title and body

import { HELP_CONTENT } from '../../../src/game/help/helpContent';

const EXPECTED_KEYS = [
  'resources',
  'scam-tiers',
  'scam-cards',
  'bot-network',
  'managers',
  'escape-plan',
  'skill-points',
  'skills-tech',
  'skills-social',
  'skills-finance',
  'skills-stealth',
  'abilities',
  'trustcoin-exchange',
  'crypto-buysell',
  'crypto-investments',
  'nft-marketplace',
];

describe('HELP_CONTENT', () => {
  it('should have all 16 expected topics', () => {
    expect(Object.keys(HELP_CONTENT)).toHaveLength(16);
    for (const key of EXPECTED_KEYS) {
      expect(HELP_CONTENT[key]).toBeDefined();
    }
  });

  it.each(EXPECTED_KEYS)('topic "%s" should have a non-empty title', (key) => {
    expect(HELP_CONTENT[key].title).toBeTruthy();
    expect(HELP_CONTENT[key].title.length).toBeGreaterThan(0);
  });

  it.each(EXPECTED_KEYS)('topic "%s" should have at least one body paragraph', (key) => {
    expect(HELP_CONTENT[key].body.length).toBeGreaterThan(0);
    for (const paragraph of HELP_CONTENT[key].body) {
      expect(paragraph.length).toBeGreaterThan(0);
    }
  });
});
