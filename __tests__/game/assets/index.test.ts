// ABOUTME: Tests for asset mapping module
// ABOUTME: Validates all scams and managers have corresponding icons/portraits

import {
  SCAM_ICONS,
  MANAGER_PORTRAITS,
  getScamIcon,
  getManagerPortrait,
} from '../../../src/game/assets';
import { TIER_1_SCAMS } from '../../../src/game/scams/definitions';
import { TIER_1_MANAGERS } from '../../../src/game/managers/definitions';

describe('Asset Mapping', () => {
  describe('SCAM_ICONS', () => {
    it('should have an icon for every Tier 1 scam', () => {
      TIER_1_SCAMS.forEach((scam) => {
        expect(SCAM_ICONS[scam.id]).toBeDefined();
      });
    });

    it('should have exactly 9 scam icons (Tier 1)', () => {
      const iconCount = Object.keys(SCAM_ICONS).length;
      expect(iconCount).toBe(9);
    });

    it('should have valid image sources (not undefined)', () => {
      Object.entries(SCAM_ICONS).forEach(([scamId, icon]) => {
        expect(icon).toBeDefined();
        expect(icon).not.toBeNull();
      });
    });
  });

  describe('MANAGER_PORTRAITS', () => {
    it('should have a portrait for every Tier 1 manager', () => {
      TIER_1_MANAGERS.forEach((manager) => {
        expect(MANAGER_PORTRAITS[manager.id]).toBeDefined();
      });
    });

    it('should have exactly 9 manager portraits', () => {
      const portraitCount = Object.keys(MANAGER_PORTRAITS).length;
      expect(portraitCount).toBe(9);
    });

    it('should have valid image sources (not undefined)', () => {
      Object.entries(MANAGER_PORTRAITS).forEach(([managerId, portrait]) => {
        expect(portrait).toBeDefined();
        expect(portrait).not.toBeNull();
      });
    });
  });

  describe('getScamIcon', () => {
    it('should return icon for existing scam', () => {
      const icon = getScamIcon('nigerian-prince-emails');
      expect(icon).toBeDefined();
    });

    it('should return undefined for non-existent scam', () => {
      const icon = getScamIcon('non-existent-scam');
      expect(icon).toBeUndefined();
    });

    it('should return icon for all Tier 1 scams', () => {
      TIER_1_SCAMS.forEach((scam) => {
        const icon = getScamIcon(scam.id);
        expect(icon).toBeDefined();
      });
    });
  });

  describe('getManagerPortrait', () => {
    it('should return portrait for existing manager', () => {
      const portrait = getManagerPortrait('prince-okonkwo');
      expect(portrait).toBeDefined();
    });

    it('should return undefined for non-existent manager', () => {
      const portrait = getManagerPortrait('non-existent-manager');
      expect(portrait).toBeUndefined();
    });

    it('should return portrait for all Tier 1 managers', () => {
      TIER_1_MANAGERS.forEach((manager) => {
        const portrait = getManagerPortrait(manager.id);
        expect(portrait).toBeDefined();
      });
    });
  });

  describe('Asset coverage', () => {
    it('should have matching coverage between scams and icons', () => {
      const scamIds = TIER_1_SCAMS.map((s) => s.id);
      const iconIds = Object.keys(SCAM_ICONS);

      // Every scam should have an icon
      scamIds.forEach((scamId) => {
        expect(iconIds).toContain(scamId);
      });

      // Every icon should map to a real scam
      iconIds.forEach((iconId) => {
        expect(scamIds).toContain(iconId);
      });
    });

    it('should have matching coverage between managers and portraits', () => {
      const managerIds = TIER_1_MANAGERS.map((m) => m.id);
      const portraitIds = Object.keys(MANAGER_PORTRAITS);

      // Every manager should have a portrait
      managerIds.forEach((managerId) => {
        expect(portraitIds).toContain(managerId);
      });

      // Every portrait should map to a real manager
      portraitIds.forEach((portraitId) => {
        expect(managerIds).toContain(portraitId);
      });
    });
  });
});
