import { describe, it, expect, beforeEach } from 'vitest';
import { createUtilityFunctions } from './utilityFunctions';

describe('Utility Functions', () => {
  let utilities: ReturnType<typeof createUtilityFunctions>;

  beforeEach(() => {
    utilities = createUtilityFunctions();
  });

  describe('capitalize', () => {
    it('should capitalize first letter and lowercase rest', () => {
      expect(utilities.capitalize('hello')).toBe('Hello');
      expect(utilities.capitalize('WORLD')).toBe('World');
      expect(utilities.capitalize('hELLo WOrLD')).toBe('Hello world');
    });

    it('should handle single character strings', () => {
      expect(utilities.capitalize('a')).toBe('A');
      expect(utilities.capitalize('Z')).toBe('Z');
    });

    it('should handle empty string', () => {
      expect(utilities.capitalize('')).toBe('');
    });

    it('should handle non-string inputs', () => {
      expect(utilities.capitalize(null as any)).toBe('');
      expect(utilities.capitalize(undefined as any)).toBe('');
      expect(utilities.capitalize(123 as any)).toBe('');
    });

    it('should handle strings starting with non-letters', () => {
      expect(utilities.capitalize('123abc')).toBe('123abc');
      expect(utilities.capitalize(' hello')).toBe(' hello');
    });
  });

  describe('pluralize', () => {
    it('should return singular for count of 1', () => {
      expect(utilities.pluralize(1, 'item')).toBe('1 item');
      expect(utilities.pluralize(1, 'child', 'children')).toBe('1 child');
    });

    it('should return plural for count other than 1', () => {
      expect(utilities.pluralize(0, 'item')).toBe('0 items');
      expect(utilities.pluralize(2, 'item')).toBe('2 items');
      expect(utilities.pluralize(100, 'item')).toBe('100 items');
    });

    it('should use custom plural form when provided', () => {
      expect(utilities.pluralize(3, 'child', 'children')).toBe('3 children');
      expect(utilities.pluralize(2, 'person', 'people')).toBe('2 people');
      expect(utilities.pluralize(5, 'mouse', 'mice')).toBe('5 mice');
    });

    it('should handle negative counts', () => {
      expect(utilities.pluralize(-1, 'item')).toBe('-1 items');
      expect(utilities.pluralize(-5, 'item')).toBe('-5 items');
    });

    it('should auto-generate plural by adding s', () => {
      expect(utilities.pluralize(2, 'car')).toBe('2 cars');
      expect(utilities.pluralize(3, 'house')).toBe('3 houses');
    });

    it('should handle non-finite counts', () => {
      expect(utilities.pluralize(NaN, 'item')).toBe('0 items');
      expect(utilities.pluralize(Infinity, 'item')).toBe('0 items');
    });

    it('should handle decimal counts', () => {
      expect(utilities.pluralize(1.5, 'item')).toBe('1.5 items');
      expect(utilities.pluralize(0.5, 'item')).toBe('0.5 items');
    });
  });

  describe('abbreviate', () => {
    it('should truncate long text and add ellipsis', () => {
      expect(utilities.abbreviate('This is a long text', 10)).toBe('This is...');
      expect(utilities.abbreviate('Hello World', 8)).toBe('Hello...');
    });

    it('should return text as-is if shorter than max length', () => {
      expect(utilities.abbreviate('Short', 10)).toBe('Short');
      expect(utilities.abbreviate('Hi', 5)).toBe('Hi');
    });

    it('should handle exact length match', () => {
      expect(utilities.abbreviate('Exact', 5)).toBe('Exact');
    });

    it('should handle very small max lengths', () => {
      expect(utilities.abbreviate('Hello', 3)).toBe('Hel');
      expect(utilities.abbreviate('Hello', 2)).toBe('He');
      expect(utilities.abbreviate('Hello', 1)).toBe('H');
    });

    it('should handle empty string', () => {
      expect(utilities.abbreviate('', 10)).toBe('');
    });

    it('should handle non-string inputs', () => {
      expect(utilities.abbreviate(null as any, 10)).toBe('');
      expect(utilities.abbreviate(undefined as any, 10)).toBe('');
      expect(utilities.abbreviate(123 as any, 10)).toBe('');
    });

    it('should handle invalid max lengths', () => {
      expect(utilities.abbreviate('Hello', 0)).toBe('Hello');
      expect(utilities.abbreviate('Hello', -5)).toBe('Hello');
      expect(utilities.abbreviate('Hello', NaN)).toBe('Hello');
    });

    it('should handle edge case of maxLength = 4', () => {
      expect(utilities.abbreviate('Hello World', 4)).toBe('H...');
    });

    it('should preserve spaces in abbreviated text', () => {
      expect(utilities.abbreviate('Hello World Test', 12)).toBe('Hello Wor...');
    });
  });
});