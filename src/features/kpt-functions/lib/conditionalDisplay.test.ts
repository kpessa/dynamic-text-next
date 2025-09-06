import { describe, it, expect, beforeEach } from 'vitest';
import { createConditionalDisplay } from './conditionalDisplay';

describe('Conditional Display', () => {
  let conditionals: ReturnType<typeof createConditionalDisplay>;

  beforeEach(() => {
    conditionals = createConditionalDisplay();
  });

  describe('showIf', () => {
    it('should show content when condition is true', () => {
      expect(conditionals.showIf(true, 'Visible')).toBe('Visible');
    });

    it('should hide content when condition is false', () => {
      expect(conditionals.showIf(false, 'Hidden')).toBe('');
    });
  });

  describe('hideIf', () => {
    it('should hide content when condition is true', () => {
      expect(conditionals.hideIf(true, 'Hidden')).toBe('');
    });

    it('should show content when condition is false', () => {
      expect(conditionals.hideIf(false, 'Visible')).toBe('Visible');
    });
  });

  describe('whenAbove', () => {
    it('should show content when value is above threshold', () => {
      expect(conditionals.whenAbove(10, 5, 'High')).toBe('High');
    });

    it('should hide content when value is not above threshold', () => {
      expect(conditionals.whenAbove(3, 5, 'High')).toBe('');
      expect(conditionals.whenAbove(5, 5, 'High')).toBe(''); // Equal is not above
    });

    it('should handle negative numbers', () => {
      expect(conditionals.whenAbove(-3, -5, 'Higher')).toBe('Higher');
      expect(conditionals.whenAbove(-5, -3, 'Higher')).toBe('');
    });

    it('should handle non-finite numbers', () => {
      expect(conditionals.whenAbove(NaN, 5, 'High')).toBe('');
      expect(conditionals.whenAbove(5, NaN, 'High')).toBe('');
      expect(conditionals.whenAbove(Infinity, 5, 'High')).toBe('High');
    });
  });

  describe('whenBelow', () => {
    it('should show content when value is below threshold', () => {
      expect(conditionals.whenBelow(3, 5, 'Low')).toBe('Low');
    });

    it('should hide content when value is not below threshold', () => {
      expect(conditionals.whenBelow(10, 5, 'Low')).toBe('');
      expect(conditionals.whenBelow(5, 5, 'Low')).toBe(''); // Equal is not below
    });

    it('should handle negative numbers', () => {
      expect(conditionals.whenBelow(-5, -3, 'Lower')).toBe('Lower');
      expect(conditionals.whenBelow(-3, -5, 'Lower')).toBe('');
    });

    it('should handle non-finite numbers', () => {
      expect(conditionals.whenBelow(NaN, 5, 'Low')).toBe('');
      expect(conditionals.whenBelow(5, NaN, 'Low')).toBe('');
      expect(conditionals.whenBelow(-Infinity, 5, 'Low')).toBe('Low');
    });
  });

  describe('whenInRange', () => {
    it('should show content when value is within range', () => {
      expect(conditionals.whenInRange(5, 1, 10, 'Normal')).toBe('Normal');
      expect(conditionals.whenInRange(1, 1, 10, 'Normal')).toBe('Normal'); // Inclusive min
      expect(conditionals.whenInRange(10, 1, 10, 'Normal')).toBe('Normal'); // Inclusive max
    });

    it('should hide content when value is outside range', () => {
      expect(conditionals.whenInRange(0, 1, 10, 'Normal')).toBe('');
      expect(conditionals.whenInRange(11, 1, 10, 'Normal')).toBe('');
    });

    it('should handle negative ranges', () => {
      expect(conditionals.whenInRange(-5, -10, -1, 'InRange')).toBe('InRange');
      expect(conditionals.whenInRange(0, -10, -1, 'InRange')).toBe('');
    });

    it('should handle non-finite numbers', () => {
      expect(conditionals.whenInRange(NaN, 1, 10, 'Normal')).toBe('');
      expect(conditionals.whenInRange(5, NaN, 10, 'Normal')).toBe('');
      expect(conditionals.whenInRange(5, 1, NaN, 'Normal')).toBe('');
    });

    it('should handle edge cases', () => {
      expect(conditionals.whenInRange(5, 10, 1, 'Normal')).toBe(''); // Invalid range (min > max)
      expect(conditionals.whenInRange(5, 5, 5, 'Normal')).toBe('Normal'); // Single point range
    });
  });
});