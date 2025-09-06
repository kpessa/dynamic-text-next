import { describe, it, expect, beforeEach } from 'vitest';
import { createNumberFormatters } from './numberFormatters';

describe('Number Formatters', () => {
  let formatters: ReturnType<typeof createNumberFormatters>;

  beforeEach(() => {
    formatters = createNumberFormatters();
  });

  describe('roundTo', () => {
    it('should round to specified decimal places', () => {
      expect(formatters.roundTo(3.14159, 2)).toBe(3.14);
      expect(formatters.roundTo(3.14159, 3)).toBe(3.142);
      expect(formatters.roundTo(10.5678, 0)).toBe(11);
    });

    it('should handle negative numbers', () => {
      expect(formatters.roundTo(-3.14159, 2)).toBe(-3.14);
    });

    it('should use default of 2 decimal places', () => {
      expect(formatters.roundTo(3.14159)).toBe(3.14);
    });

    it('should handle non-finite numbers', () => {
      expect(formatters.roundTo(NaN)).toBe(0);
      expect(formatters.roundTo(Infinity)).toBe(0);
    });
  });

  describe('formatNumber', () => {
    it('should format with thousands separators', () => {
      expect(formatters.formatNumber(1234567.89)).toBe('1,234,567.89');
      expect(formatters.formatNumber(1000)).toBe('1,000.00');
    });

    it('should respect decimal places', () => {
      expect(formatters.formatNumber(1234.5678, 3)).toBe('1,234.568');
      expect(formatters.formatNumber(1000, 0)).toBe('1,000');
    });

    it('should handle negative numbers', () => {
      expect(formatters.formatNumber(-1234.56)).toBe('-1,234.56');
    });

    it('should handle non-finite numbers', () => {
      expect(formatters.formatNumber(NaN)).toBe('0');
      expect(formatters.formatNumber(Infinity)).toBe('0');
    });
  });

  describe('formatPercent', () => {
    it('should format as percentage', () => {
      expect(formatters.formatPercent(75.5)).toBe('75.5%');
      expect(formatters.formatPercent(33.333, 0)).toBe('33%');
      expect(formatters.formatPercent(100)).toBe('100.0%');
    });

    it('should handle decimal precision', () => {
      expect(formatters.formatPercent(33.3333, 2)).toBe('33.33%');
      expect(formatters.formatPercent(0.5, 1)).toBe('0.5%');
    });

    it('should handle non-finite numbers', () => {
      expect(formatters.formatPercent(NaN)).toBe('0%');
      expect(formatters.formatPercent(Infinity)).toBe('0%');
    });
  });

  describe('formatCurrency', () => {
    it('should format as USD by default', () => {
      expect(formatters.formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatters.formatCurrency(99.99)).toBe('$99.99');
    });

    it('should handle different currencies', () => {
      const euroResult = formatters.formatCurrency(99.99, 'EUR');
      expect(euroResult).toContain('99.99');
      expect(euroResult).toMatch(/€|EUR/);
    });

    it('should handle negative amounts', () => {
      const result = formatters.formatCurrency(-100);
      expect(result).toContain('100');
      expect(result).toMatch(/\$|-/);
    });

    it('should handle invalid currency codes', () => {
      const result = formatters.formatCurrency(100, 'INVALID');
      expect(result).toBe('$100.00'); // Falls back to USD
    });

    it('should handle non-finite numbers', () => {
      expect(formatters.formatCurrency(NaN)).toBe('$0.00');
      expect(formatters.formatCurrency(Infinity)).toBe('$0.00');
    });
  });
});