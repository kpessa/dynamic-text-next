import { describe, it, expect, beforeEach } from 'vitest';
import { createTPNFormatters } from './tpnFormatters';

describe('TPN Formatters', () => {
  let formatters: ReturnType<typeof createTPNFormatters>;

  beforeEach(() => {
    formatters = createTPNFormatters();
  });

  describe('formatWeight', () => {
    it('should format weight in kg', () => {
      expect(formatters.formatWeight(75)).toBe('75 kg');
      expect(formatters.formatWeight(1.5)).toBe('1.5 kg');
    });

    it('should convert to grams when less than 1 kg', () => {
      expect(formatters.formatWeight(0.5)).toBe('500 g');
      expect(formatters.formatWeight(0.025)).toBe('25 g');
    });

    it('should convert grams to kg when appropriate', () => {
      expect(formatters.formatWeight(1500, 'g')).toBe('1.5 kg');
      expect(formatters.formatWeight(2000, 'g')).toBe('2 kg');
    });

    it('should handle non-finite numbers', () => {
      expect(formatters.formatWeight(NaN)).toBe('0 kg');
      expect(formatters.formatWeight(Infinity)).toBe('0 kg');
    });
  });

  describe('formatVolume', () => {
    it('should format volume in mL', () => {
      expect(formatters.formatVolume(500)).toBe('500 mL');
      expect(formatters.formatVolume(250.5)).toBe('251 mL');
    });

    it('should convert to L when >= 1000 mL', () => {
      expect(formatters.formatVolume(1500)).toBe('1.5 L');
      expect(formatters.formatVolume(2000)).toBe('2 L');
    });

    it('should convert L to mL when < 1 L', () => {
      expect(formatters.formatVolume(0.5, 'L')).toBe('500 mL');
      expect(formatters.formatVolume(0.25, 'L')).toBe('250 mL');
    });

    it('should handle non-finite numbers', () => {
      expect(formatters.formatVolume(NaN)).toBe('0 mL');
      expect(formatters.formatVolume(Infinity)).toBe('0 mL');
    });
  });

  describe('formatDose', () => {
    it('should format dose in mg', () => {
      expect(formatters.formatDose(250)).toBe('250 mg');
      expect(formatters.formatDose(10.5)).toBe('10.5 mg');
    });

    it('should convert to mcg when < 1 mg', () => {
      expect(formatters.formatDose(0.5)).toBe('500 mcg');
      expect(formatters.formatDose(0.025)).toBe('25 mcg');
    });

    it('should convert to g when >= 1000 mg', () => {
      expect(formatters.formatDose(5000)).toBe('5 g');
      expect(formatters.formatDose(1500)).toBe('1.5 g');
    });

    it('should handle unit conversions', () => {
      expect(formatters.formatDose(0.5, 'g')).toBe('500 mg');
      expect(formatters.formatDose(1500, 'mcg')).toBe('1.5 mg');
    });

    it('should handle non-finite numbers', () => {
      expect(formatters.formatDose(NaN)).toBe('0 mg');
      expect(formatters.formatDose(Infinity)).toBe('0 mg');
    });
  });

  describe('formatConcentration', () => {
    it('should format concentration in mg/mL', () => {
      expect(formatters.formatConcentration(10)).toBe('10 mg/mL');
      expect(formatters.formatConcentration(2.5)).toBe('2.5 mg/mL');
    });

    it('should convert to mcg/mL when < 1', () => {
      expect(formatters.formatConcentration(0.5)).toBe('500 mcg/mL');
      expect(formatters.formatConcentration(0.025)).toBe('25 mcg/mL');
    });

    it('should convert to g/mL when >= 1000', () => {
      expect(formatters.formatConcentration(5000)).toBe('5 g/mL');
      expect(formatters.formatConcentration(1500)).toBe('1.5 g/mL');
    });

    it('should handle non-finite numbers', () => {
      expect(formatters.formatConcentration(NaN)).toBe('0 mg/mL');
      expect(formatters.formatConcentration(Infinity)).toBe('0 mg/mL');
    });
  });

  describe('formatInfusionRate', () => {
    it('should format infusion rate', () => {
      expect(formatters.formatInfusionRate(125)).toBe('125 mL/hr');
      expect(formatters.formatInfusionRate(8.5)).toBe('8.5 mL/hr');
    });

    it('should use appropriate precision', () => {
      expect(formatters.formatInfusionRate(5.5)).toBe('5.5 mL/hr');
      expect(formatters.formatInfusionRate(125.5)).toBe('126 mL/hr');
    });

    it('should handle custom units', () => {
      expect(formatters.formatInfusionRate(0.5, 'mg/hr')).toBe('0.5 mg/hr');
      expect(formatters.formatInfusionRate(10, 'mcg/min')).toBe('10 mcg/min');
    });

    it('should handle non-finite numbers', () => {
      expect(formatters.formatInfusionRate(NaN)).toBe('0 mL/hr');
      expect(formatters.formatInfusionRate(Infinity)).toBe('0 mL/hr');
    });
  });

  describe('formatOsmolarity', () => {
    it('should format osmolarity', () => {
      expect(formatters.formatOsmolarity(300)).toBe('300 mOsm/L');
      expect(formatters.formatOsmolarity(1250.5)).toBe('1251 mOsm/L');
    });

    it('should round to whole numbers', () => {
      expect(formatters.formatOsmolarity(299.7)).toBe('300 mOsm/L');
      expect(formatters.formatOsmolarity(1250.3)).toBe('1250 mOsm/L');
    });

    it('should handle non-finite numbers', () => {
      expect(formatters.formatOsmolarity(NaN)).toBe('0 mOsm/L');
      expect(formatters.formatOsmolarity(Infinity)).toBe('0 mOsm/L');
    });
  });
});