// ABOUTME: Tests for number/time formatting utility functions
// ABOUTME: Validates compact notation, percentages, and duration formatting

import { formatNumber, formatPercent, formatDuration } from '../../src/utils/formatters';

describe('formatNumber', () => {
  describe('small numbers (under 1000)', () => {
    it('formats zero as "0"', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('formats single digit numbers', () => {
      expect(formatNumber(5)).toBe('5');
    });

    it('formats double digit numbers', () => {
      expect(formatNumber(42)).toBe('42');
    });

    it('formats triple digit numbers', () => {
      expect(formatNumber(999)).toBe('999');
    });

    it('formats decimal numbers with up to 2 decimal places', () => {
      expect(formatNumber(3.14159)).toBe('3.14');
    });

    it('formats decimal numbers without trailing zeros', () => {
      expect(formatNumber(3.10)).toBe('3.1');
    });

    it('formats whole numbers without decimal point', () => {
      expect(formatNumber(3.00)).toBe('3');
    });
  });

  describe('thousands (K)', () => {
    it('formats exactly 1000 as "1K"', () => {
      expect(formatNumber(1000)).toBe('1K');
    });

    it('formats 1500 as "1.5K"', () => {
      expect(formatNumber(1500)).toBe('1.5K');
    });

    it('formats 999990 as "999.99K"', () => {
      expect(formatNumber(999990)).toBe('999.99K');
    });

    it('formats 10500 as "10.5K"', () => {
      expect(formatNumber(10500)).toBe('10.5K');
    });

    it('formats clean thousands without decimals', () => {
      expect(formatNumber(5000)).toBe('5K');
    });
  });

  describe('millions (M)', () => {
    it('formats exactly 1 million as "1M"', () => {
      expect(formatNumber(1000000)).toBe('1M');
    });

    it('formats 1.5 million as "1.5M"', () => {
      expect(formatNumber(1500000)).toBe('1.5M');
    });

    it('formats 999 million as "999M"', () => {
      expect(formatNumber(999000000)).toBe('999M');
    });

    it('formats 2.25 million as "2.25M"', () => {
      expect(formatNumber(2250000)).toBe('2.25M');
    });
  });

  describe('billions (B)', () => {
    it('formats exactly 1 billion as "1B"', () => {
      expect(formatNumber(1000000000)).toBe('1B');
    });

    it('formats 7.5 billion as "7.5B"', () => {
      expect(formatNumber(7500000000)).toBe('7.5B');
    });

    it('formats 999 billion as "999B"', () => {
      expect(formatNumber(999000000000)).toBe('999B');
    });
  });

  describe('trillions (T)', () => {
    it('formats exactly 1 trillion as "1T"', () => {
      expect(formatNumber(1000000000000)).toBe('1T');
    });

    it('formats 42 trillion as "42T"', () => {
      expect(formatNumber(42000000000000)).toBe('42T');
    });

    it('formats 1.33 trillion as "1.33T"', () => {
      expect(formatNumber(1330000000000)).toBe('1.33T');
    });
  });

  describe('negative numbers', () => {
    it('formats negative small numbers', () => {
      expect(formatNumber(-50)).toBe('-50');
    });

    it('formats negative thousands', () => {
      expect(formatNumber(-1500)).toBe('-1.5K');
    });

    it('formats negative millions', () => {
      expect(formatNumber(-2500000)).toBe('-2.5M');
    });
  });
});

describe('formatPercent', () => {
  it('formats 0 as "0%"', () => {
    expect(formatPercent(0)).toBe('0%');
  });

  it('formats 0.5 (50%) as "50%"', () => {
    expect(formatPercent(0.5)).toBe('50%');
  });

  it('formats 1 (100%) as "100%"', () => {
    expect(formatPercent(1)).toBe('100%');
  });

  it('formats 0.123 as "12.3%"', () => {
    expect(formatPercent(0.123)).toBe('12.3%');
  });

  it('formats 0.1234 with max 2 decimal places as "12.34%"', () => {
    expect(formatPercent(0.1234)).toBe('12.34%');
  });

  it('formats values over 1 (like 1.5 for 150%)', () => {
    expect(formatPercent(1.5)).toBe('150%');
  });

  it('formats negative percentages', () => {
    expect(formatPercent(-0.25)).toBe('-25%');
  });

  it('removes trailing zeros', () => {
    expect(formatPercent(0.1)).toBe('10%');
    expect(formatPercent(0.15)).toBe('15%');
  });
});

describe('formatDuration', () => {
  describe('seconds', () => {
    it('formats 0 milliseconds as "0s"', () => {
      expect(formatDuration(0)).toBe('0s');
    });

    it('formats 1000ms as "1s"', () => {
      expect(formatDuration(1000)).toBe('1s');
    });

    it('formats 5500ms as "5s"', () => {
      expect(formatDuration(5500)).toBe('5s');
    });

    it('formats 59000ms as "59s"', () => {
      expect(formatDuration(59000)).toBe('59s');
    });
  });

  describe('minutes and seconds', () => {
    it('formats exactly 1 minute as "1m"', () => {
      expect(formatDuration(60000)).toBe('1m');
    });

    it('formats 1 minute 30 seconds as "1m 30s"', () => {
      expect(formatDuration(90000)).toBe('1m 30s');
    });

    it('formats 5 minutes as "5m"', () => {
      expect(formatDuration(300000)).toBe('5m');
    });

    it('formats 10 minutes 15 seconds as "10m 15s"', () => {
      expect(formatDuration(615000)).toBe('10m 15s');
    });
  });

  describe('hours, minutes, and seconds', () => {
    it('formats exactly 1 hour as "1h"', () => {
      expect(formatDuration(3600000)).toBe('1h');
    });

    it('formats 1 hour 30 minutes as "1h 30m"', () => {
      expect(formatDuration(5400000)).toBe('1h 30m');
    });

    it('formats 2 hours 15 minutes 30 seconds as "2h 15m 30s"', () => {
      expect(formatDuration(8130000)).toBe('2h 15m 30s');
    });

    it('formats 24 hours as "24h"', () => {
      expect(formatDuration(86400000)).toBe('24h');
    });
  });

  describe('edge cases', () => {
    it('handles sub-second values by rounding to 0s', () => {
      expect(formatDuration(500)).toBe('0s');
    });

    it('formats very large durations (100 hours)', () => {
      expect(formatDuration(360000000)).toBe('100h');
    });
  });
});
