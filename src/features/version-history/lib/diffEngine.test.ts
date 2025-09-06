import { describe, it, expect, beforeEach } from 'vitest';
import { DiffEngine } from './diffEngine';

describe('DiffEngine', () => {
  let diffEngine: DiffEngine;

  beforeEach(() => {
    diffEngine = new DiffEngine();
  });

  describe('computeDiff', () => {
    it('should compute diff between two strings', () => {
      const oldContent = 'Hello World';
      const newContent = 'Hello Beautiful World';
      
      const result = diffEngine.computeDiff(oldContent, newContent);
      
      expect(result).toBeDefined();
      expect(result.stats.additions).toBeGreaterThan(0);
      expect(result.hunks).toBeDefined();
      expect(result.patches).toBeDefined();
    });

    it('should handle identical content', () => {
      const content = 'Same content';
      
      const result = diffEngine.computeDiff(content, content);
      
      expect(result.stats.additions).toBe(0);
      expect(result.stats.deletions).toBe(0);
      expect(result.stats.modifications).toBe(0);
    });

    it('should detect additions', () => {
      const oldContent = 'Line 1';
      const newContent = 'Line 1\nLine 2';
      
      const result = diffEngine.computeDiff(oldContent, newContent);
      
      expect(result.stats.additions).toBeGreaterThan(0);
    });

    it('should detect deletions', () => {
      const oldContent = 'Line 1\nLine 2';
      const newContent = 'Line 1';
      
      const result = diffEngine.computeDiff(oldContent, newContent);
      
      expect(result.stats.deletions).toBeGreaterThan(0);
    });

    it('should handle whitespace normalization', () => {
      const oldContent = 'Text  with   spaces';
      const newContent = 'Text with spaces';
      
      const result = diffEngine.computeDiff(oldContent, newContent, {
        ignoreWhitespace: true
      });
      
      expect(result.stats.modifications).toBe(0);
    });
  });

  describe('computeLineDiff', () => {
    it('should compute diff between line arrays', () => {
      const oldLines = ['line1', 'line2', 'line3'];
      const newLines = ['line1', 'line2a', 'line3', 'line4'];
      
      const changes = diffEngine.computeLineDiff(oldLines, newLines);
      
      expect(changes).toBeDefined();
      expect(changes.length).toBeGreaterThan(0);
    });
  });

  describe('computeWordDiff', () => {
    it('should compute word-level differences', () => {
      const oldText = 'The quick brown fox';
      const newText = 'The slow brown fox';
      
      const changes = diffEngine.computeWordDiff(oldText, newText);
      
      expect(changes).toBeDefined();
      expect(changes.some(c => c.removed)).toBe(true);
      expect(changes.some(c => c.added)).toBe(true);
    });
  });

  describe('applyPatch', () => {
    it('should apply patch to content', () => {
      const original = 'Original content';
      const modified = 'Modified content';
      
      const patch = diffEngine.createPatch('test', original, modified);
      const result = diffEngine.applyPatch(original, patch);
      
      expect(result).toBe(modified);
    });
  });

  describe('mergeDiffs', () => {
    it('should merge non-conflicting changes', () => {
      const base = 'Base content';
      const ours = 'Our content';
      const theirs = 'Their content';
      
      const result = diffEngine.mergeDiffs(base, ours, theirs);
      
      expect(result).toBeDefined();
      expect(result.merged).toBeDefined();
      expect(typeof result.conflicts).toBe('boolean');
    });
  });

  describe('renderSideBySide', () => {
    it('should render side-by-side diff view', () => {
      const oldContent = 'Old\nContent';
      const newContent = 'New\nContent';
      
      const diffResult = diffEngine.computeDiff(oldContent, newContent);
      const element = diffEngine.renderSideBySide(diffResult);
      
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.className).toContain('diff-side-by-side');
    });
  });

  describe('renderInline', () => {
    it('should render inline diff view', () => {
      const oldContent = 'Old content';
      const newContent = 'New content';
      
      const diffResult = diffEngine.computeDiff(oldContent, newContent);
      const element = diffEngine.renderInline(diffResult);
      
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.className).toContain('diff-inline');
    });
  });

  describe('renderUnified', () => {
    it('should render unified diff format', () => {
      const oldContent = 'Line 1\nLine 2';
      const newContent = 'Line 1\nLine 2 modified';
      
      const diffResult = diffEngine.computeDiff(oldContent, newContent);
      const unified = diffEngine.renderUnified(diffResult);
      
      expect(typeof unified).toBe('string');
      expect(unified).toContain('@@');
    });
  });
});