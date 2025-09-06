import { describe, it, expect, beforeEach } from 'vitest';
import { createRangeCheckers } from './rangeCheckers';
import { RangeConfig } from '../types';

describe('Range Checkers', () => {
  let checkers: ReturnType<typeof createRangeCheckers>;

  beforeEach(() => {
    checkers = createRangeCheckers();
  });

  describe('checkRange', () => {
    it('should return normal when value is within normal range', () => {
      expect(checkers.checkRange(5, [2, 8])).toBe('normal');
      expect(checkers.checkRange(2, [2, 8])).toBe('normal'); // Min edge
      expect(checkers.checkRange(8, [2, 8])).toBe('normal'); // Max edge
    });

    it('should return abnormal when value is outside normal range', () => {
      expect(checkers.checkRange(1, [2, 8])).toBe('abnormal');
      expect(checkers.checkRange(10, [2, 8])).toBe('abnormal');
    });

    it('should return critical when value is outside critical range', () => {
      expect(checkers.checkRange(15, [2, 8], [0, 12])).toBe('critical');
      expect(checkers.checkRange(-1, [2, 8], [0, 12])).toBe('critical');
    });

    it('should prioritize critical over abnormal', () => {
      // Value is outside both normal and critical
      expect(checkers.checkRange(15, [2, 8], [0, 12])).toBe('critical');
    });

    it('should return normal when no ranges provided', () => {
      expect(checkers.checkRange(5)).toBe('normal');
    });

    it('should handle non-finite values', () => {
      expect(checkers.checkRange(NaN, [2, 8])).toBe('invalid');
      expect(checkers.checkRange(Infinity, [2, 8])).toBe('abnormal');
      expect(checkers.checkRange(-Infinity, [2, 8])).toBe('abnormal');
    });
  });

  describe('isNormal', () => {
    it('should return true when value is within range', () => {
      expect(checkers.isNormal(5, 2, 8)).toBe(true);
      expect(checkers.isNormal(2, 2, 8)).toBe(true); // Min edge
      expect(checkers.isNormal(8, 2, 8)).toBe(true); // Max edge
    });

    it('should return false when value is outside range', () => {
      expect(checkers.isNormal(1, 2, 8)).toBe(false);
      expect(checkers.isNormal(10, 2, 8)).toBe(false);
    });

    it('should handle negative ranges', () => {
      expect(checkers.isNormal(-5, -10, -1)).toBe(true);
      expect(checkers.isNormal(0, -10, -1)).toBe(false);
    });

    it('should handle non-finite values', () => {
      expect(checkers.isNormal(NaN, 2, 8)).toBe(false);
      expect(checkers.isNormal(5, NaN, 8)).toBe(false);
      expect(checkers.isNormal(5, 2, NaN)).toBe(false);
    });
  });

  describe('isCritical', () => {
    it('should return true when value is outside critical thresholds', () => {
      expect(checkers.isCritical(1, 2, 10)).toBe(true); // Below min
      expect(checkers.isCritical(15, 2, 10)).toBe(true); // Above max
    });

    it('should return false when value is within critical thresholds', () => {
      expect(checkers.isCritical(5, 2, 10)).toBe(false);
      expect(checkers.isCritical(2, 2, 10)).toBe(false); // Min edge
      expect(checkers.isCritical(10, 2, 10)).toBe(false); // Max edge
    });

    it('should handle negative thresholds', () => {
      expect(checkers.isCritical(-15, -10, -2)).toBe(true);
      expect(checkers.isCritical(-5, -10, -2)).toBe(false);
    });

    it('should handle non-finite values', () => {
      expect(checkers.isCritical(NaN, 2, 10)).toBe(false);
      expect(checkers.isCritical(5, NaN, 10)).toBe(false);
      expect(checkers.isCritical(5, 2, NaN)).toBe(false);
    });
  });

  describe('getRangeStatus', () => {
    it('should return correct status for each range', () => {
      const ranges: RangeConfig = {
        criticalLow: 2,
        low: 4,
        high: 8,
        criticalHigh: 10
      };

      expect(checkers.getRangeStatus(1, ranges)).toBe('critical-low');
      expect(checkers.getRangeStatus(3, ranges)).toBe('low');
      expect(checkers.getRangeStatus(6, ranges)).toBe('normal');
      expect(checkers.getRangeStatus(9, ranges)).toBe('high');
      expect(checkers.getRangeStatus(11, ranges)).toBe('critical-high');
    });

    it('should handle partial ranges', () => {
      const ranges: RangeConfig = {
        low: 4,
        high: 8
      };

      expect(checkers.getRangeStatus(3, ranges)).toBe('low');
      expect(checkers.getRangeStatus(6, ranges)).toBe('normal');
      expect(checkers.getRangeStatus(9, ranges)).toBe('high');
    });

    it('should handle only critical ranges', () => {
      const ranges: RangeConfig = {
        criticalLow: 2,
        criticalHigh: 10
      };

      expect(checkers.getRangeStatus(1, ranges)).toBe('critical-low');
      expect(checkers.getRangeStatus(5, ranges)).toBe('normal');
      expect(checkers.getRangeStatus(11, ranges)).toBe('critical-high');
    });

    it('should return normal for empty ranges', () => {
      expect(checkers.getRangeStatus(5, {})).toBe('normal');
    });

    it('should handle edge values', () => {
      const ranges: RangeConfig = {
        criticalLow: 2,
        low: 4,
        high: 8,
        criticalHigh: 10
      };

      expect(checkers.getRangeStatus(2, ranges)).toBe('low'); // At criticalLow boundary
      expect(checkers.getRangeStatus(4, ranges)).toBe('normal'); // At low boundary
      expect(checkers.getRangeStatus(8, ranges)).toBe('normal'); // At high boundary
      expect(checkers.getRangeStatus(10, ranges)).toBe('high'); // At criticalHigh boundary
    });

    it('should handle non-finite values', () => {
      const ranges: RangeConfig = {
        low: 4,
        high: 8
      };

      expect(checkers.getRangeStatus(NaN, ranges)).toBe('normal');
      expect(checkers.getRangeStatus(Infinity, ranges)).toBe('high');
      expect(checkers.getRangeStatus(-Infinity, ranges)).toBe('low');
    });
  });
});