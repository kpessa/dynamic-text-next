import { describe, it, expect, beforeEach } from 'vitest';
import { DiffEngine } from '../diffEngine';

describe('DiffEngine', () => {
  let diffEngine: DiffEngine;

  beforeEach(() => {
    diffEngine = new DiffEngine();
  });

  describe('compare', () => {
    it('should detect no changes for identical content', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const results = diffEngine.compare(text, text);
      
      expect(results.every(r => r.type === 'unchanged')).toBe(true);
      expect(results).toHaveLength(3);
    });

    it('should detect added lines', () => {
      const left = 'Line 1\nLine 2';
      const right = 'Line 1\nLine 2\nLine 3';
      const results = diffEngine.compare(left, right);
      
      const added = results.filter(r => r.type === 'added');
      // The library might return empty line addition too, so check content
      const line3Added = added.find(a => a.content === 'Line 3');
      expect(line3Added).toBeDefined();
      expect(line3Added?.content).toBe('Line 3');
    });

    it('should detect removed lines', () => {
      const left = 'Line 1\nLine 2\nLine 3';
      const right = 'Line 1\nLine 3';
      const results = diffEngine.compare(left, right);
      
      const removed = results.filter(r => r.type === 'removed');
      expect(removed).toHaveLength(1);
      expect(removed[0].content).toBe('Line 2');
    });

    it('should handle word-level diff', () => {
      const left = 'The quick brown fox';
      const right = 'The slow brown fox';
      const results = diffEngine.compare(left, right, { granularity: 'word' });
      
      const changes = results.filter(r => r.type !== 'unchanged');
      expect(changes.length).toBeGreaterThan(0);
    });

    it('should handle character-level diff', () => {
      const left = 'test';
      const right = 'best';
      const results = diffEngine.compare(left, right, { granularity: 'char' });
      
      const changes = results.filter(r => r.type !== 'unchanged');
      expect(changes.length).toBeGreaterThan(0);
    });

    it('should filter unchanged lines when showIdentical is false', () => {
      const left = 'Line 1\nLine 2\nLine 3';
      const right = 'Line 1\nModified\nLine 3';
      const results = diffEngine.compare(left, right, { showIdentical: false });
      
      const unchanged = results.filter(r => r.type === 'unchanged');
      expect(unchanged).toHaveLength(0);
    });

    it('should include unchanged lines when showIdentical is true', () => {
      const left = 'Line 1\nLine 2\nLine 3';
      const right = 'Line 1\nModified\nLine 3';
      const results = diffEngine.compare(left, right, { showIdentical: true });
      
      const unchanged = results.filter(r => r.type === 'unchanged');
      expect(unchanged.length).toBeGreaterThan(0);
    });
  });

  describe('generateUnifiedDiff', () => {
    it('should generate a unified diff patch', () => {
      const left = 'Line 1\nLine 2\nLine 3';
      const right = 'Line 1\nModified Line\nLine 3';
      
      const patch = diffEngine.generateUnifiedDiff(left, right);
      
      expect(patch).toContain('@@');
      expect(patch).toContain('-Line 2');
      expect(patch).toContain('+Modified Line');
    });

    it('should include custom labels', () => {
      const left = 'content';
      const right = 'modified';
      
      const patch = diffEngine.generateUnifiedDiff(left, right, 'Before', 'After');
      
      expect(patch).toContain('Before');
      expect(patch).toContain('After');
    });
  });

  describe('generateDiff2Html', () => {
    it('should generate HTML output', () => {
      const left = 'Line 1\nLine 2';
      const right = 'Line 1\nModified';
      
      const html = diffEngine.generateDiff2Html(left, right);
      
      expect(html).toContain('<div');
      expect(html).toContain('d2h');
    });

    it('should respect view mode option', () => {
      const left = 'content';
      const right = 'modified';
      
      const sideBySide = diffEngine.generateDiff2Html(left, right, 'L', 'R', { 
        viewMode: 'side-by-side' 
      });
      const unified = diffEngine.generateDiff2Html(left, right, 'L', 'R', { 
        viewMode: 'unified' 
      });
      
      expect(sideBySide).not.toBe(unified);
    });
  });

  describe('tokenize', () => {
    it('should tokenize by words', () => {
      const text = 'The quick brown fox';
      const tokens = diffEngine.tokenize(text, 'word');
      
      expect(tokens).toContain('quick');
      expect(tokens).toContain(' ');
    });

    it('should tokenize by characters', () => {
      const text = 'test';
      const tokens = diffEngine.tokenize(text, 'char');
      
      expect(tokens).toEqual(['t', 'e', 's', 't']);
    });

    it('should tokenize by lines', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const tokens = diffEngine.tokenize(text, 'line');
      
      expect(tokens).toEqual(['Line 1', 'Line 2', 'Line 3']);
    });
  });

  describe('calculateStatistics', () => {
    it('should calculate diff statistics', () => {
      const results = [
        { type: 'added' as const, lineNumber: 1, content: 'new' },
        { type: 'removed' as const, lineNumber: 2, content: 'old' },
        { type: 'modified' as const, lineNumber: 3, content: 'changed' },
        { type: 'unchanged' as const, lineNumber: 4, content: 'same' }
      ];
      
      const stats = diffEngine.calculateStatistics(results);
      
      expect(stats.additions).toBe(1);
      expect(stats.deletions).toBe(1);
      expect(stats.modifications).toBe(1);
      expect(stats.total).toBe(3);
    });
  });

  describe('caching', () => {
    it('should cache diff results', () => {
      const left = 'Line 1\nLine 2';
      const right = 'Line 1\nLine 3';
      
      // First call - should compute
      const results1 = diffEngine.compare(left, right);
      
      // Second call - should use cache
      const results2 = diffEngine.compare(left, right);
      
      expect(results1).toEqual(results2);
      expect(diffEngine.getCacheSize()).toBe(1);
    });

    it('should respect different options in cache', () => {
      const left = 'text';
      const right = 'next';
      
      diffEngine.compare(left, right, { granularity: 'word' });
      diffEngine.compare(left, right, { granularity: 'char' });
      
      expect(diffEngine.getCacheSize()).toBe(2);
    });

    it('should clear cache', () => {
      const left = 'text';
      const right = 'next';
      
      diffEngine.compare(left, right);
      expect(diffEngine.getCacheSize()).toBe(1);
      
      diffEngine.clearCache();
      expect(diffEngine.getCacheSize()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const results = diffEngine.compare('', '');
      expect(results).toHaveLength(0);
    });

    it('should handle one empty string', () => {
      const results1 = diffEngine.compare('content', '');
      const results2 = diffEngine.compare('', 'content');
      
      // When one string is empty, we should see appropriate changes
      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
      
      // At least one change should be detected
      const hasChanges1 = results1.some(r => r.type === 'removed' || r.type === 'added');
      const hasChanges2 = results2.some(r => r.type === 'removed' || r.type === 'added');
      expect(hasChanges1 || hasChanges2).toBe(true);
    });

    it('should handle very large content', () => {
      const large = Array(10000).fill('Line').join('\n');
      const modified = large + '\nExtra';
      
      const results = diffEngine.compare(large, modified);
      expect(results).toBeDefined();
    });

    it('should handle special characters', () => {
      const left = 'Line with "quotes" and \'apostrophes\'';
      const right = 'Line with `backticks` and \'apostrophes\'';
      
      const results = diffEngine.compare(left, right);
      expect(results).toBeDefined();
    });
  });
});