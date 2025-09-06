import * as diff from 'diff';
import { createPatch } from 'diff';
import { html, Diff2HtmlConfig, parse } from 'diff2html';

export type DiffGranularity = 'word' | 'char' | 'line';
export type DiffViewMode = 'side-by-side' | 'unified';

export interface DiffOptions {
  viewMode: DiffViewMode;
  showIdentical: boolean;
  granularity: DiffGranularity;
  renderHTML: boolean;
  highlightSyntax: boolean;
  context?: number;
  ignoreWhitespace?: boolean;
}

export interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  lineNumber: number;
  content: string;
  oldContent?: string;
  newContent?: string;
  metadata?: {
    population?: string;
    version?: number;
    field?: string;
  };
}

export interface DiffChange {
  value: string;
  added?: boolean;
  removed?: boolean;
  count?: number;
}

export interface DiffStatistics {
  additions: number;
  deletions: number;
  modifications: number;
  total: number;
}

export interface DiffCacheEntry {
  key: string;
  result: DiffResult[];
  statistics: DiffStatistics;
  timestamp: number;
}

export class DiffEngine {
  private cache: Map<string, DiffCacheEntry> = new Map();
  private readonly cacheTimeout = 30 * 60 * 1000; // 30 minutes
  private readonly defaultOptions: DiffOptions = {
    viewMode: 'side-by-side',
    showIdentical: true,  // Changed to true to show all lines by default
    granularity: 'line',
    renderHTML: false,
    highlightSyntax: true,
    context: 3,
    ignoreWhitespace: false
  };

  constructor(private options: Partial<DiffOptions> = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  compare(left: string, right: string, options?: Partial<DiffOptions>): DiffResult[] {
    const mergedOptions = { ...this.options, ...options };
    const cacheKey = this.generateCacheKey(left, right, mergedOptions);
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached.result;
    }

    let result: DiffResult[];
    
    switch (mergedOptions.granularity) {
      case 'word':
        result = this.wordDiff(left, right, mergedOptions);
        break;
      case 'char':
        result = this.charDiff(left, right, mergedOptions);
        break;
      case 'line':
      default:
        result = this.lineDiff(left, right, mergedOptions);
        break;
    }

    // Filter out unchanged lines if requested
    if (!mergedOptions.showIdentical) {
      result = result.filter(r => r.type !== 'unchanged');
    }

    // Cache the result
    const statistics = this.calculateStatistics(result);
    this.addToCache(cacheKey, result, statistics);

    return result;
  }

  private lineDiff(left: string, right: string, options: DiffOptions): DiffResult[] {
    const changes = diff.diffLines(left, right, { 
      ignoreWhitespace: options.ignoreWhitespace 
    });
    
    return this.processChanges(changes);
  }

  private wordDiff(left: string, right: string, options: DiffOptions): DiffResult[] {
    const changes = diff.diffWords(left, right, { 
      ignoreWhitespace: options.ignoreWhitespace 
    });
    
    return this.processChanges(changes);
  }

  private charDiff(left: string, right: string, options: DiffOptions): DiffResult[] {
    const changes = diff.diffChars(left, right);
    
    return this.processChanges(changes);
  }

  private processChanges(changes: DiffChange[]): DiffResult[] {
    const results: DiffResult[] = [];
    let lineNumber = 1;

    for (const change of changes) {
      // Handle empty values
      if (!change.value) continue;
      
      // Handle line endings properly - don't filter empty strings from split
      const lines = change.value.split('\n');
      // Remove last empty element if the string ended with \n
      if (lines[lines.length - 1] === '') {
        lines.pop();
      }
      
      // Handle case where there are no lines (empty string input)
      if (lines.length === 0 && change.value) {
        lines.push(change.value);
      }
      
      for (const line of lines) {
        if (change.added) {
          results.push({
            type: 'added',
            lineNumber,
            content: line,
            newContent: line
          });
        } else if (change.removed) {
          results.push({
            type: 'removed',
            lineNumber,
            content: line,
            oldContent: line
          });
        } else {
          results.push({
            type: 'unchanged',
            lineNumber,
            content: line
          });
        }
        lineNumber++;
      }
    }

    return results;
  }

  generateUnifiedDiff(
    left: string,
    right: string,
    leftLabel: string = 'Original',
    rightLabel: string = 'Modified',
    options?: Partial<DiffOptions>
  ): string {
    const mergedOptions = { ...this.options, ...options };
    
    return createPatch(
      `${leftLabel} → ${rightLabel}`,
      left,
      right,
      leftLabel,
      rightLabel,
      { context: mergedOptions.context }
    );
  }

  generateDiff2Html(
    left: string,
    right: string,
    leftLabel: string = 'Original',
    rightLabel: string = 'Modified',
    options?: Partial<DiffOptions>
  ): string {
    const mergedOptions = { ...this.options, ...options };
    const unifiedDiff = this.generateUnifiedDiff(left, right, leftLabel, rightLabel, mergedOptions);
    
    const diff2htmlConfig: Diff2HtmlConfig = {
      outputFormat: mergedOptions.viewMode === 'side-by-side' ? 'side-by-side' : 'line-by-line',
      drawFileList: false,
      matching: 'words',
      renderNothingWhenEmpty: false,
      highlightCode: mergedOptions.highlightSyntax
    };

    const diffJson = parse(unifiedDiff);
    return html(diffJson, diff2htmlConfig);
  }

  tokenize(text: string, granularity: DiffGranularity): string[] {
    switch (granularity) {
      case 'word':
        // Split on word boundaries while preserving whitespace
        return text.match(/\S+|\s+/g) || [];
      case 'char':
        return text.split('');
      case 'line':
      default:
        return text.split('\n');
    }
  }

  calculateStatistics(results: DiffResult[]): DiffStatistics {
    const stats = results.reduce(
      (acc, result) => {
        switch (result.type) {
          case 'added':
            acc.additions++;
            break;
          case 'removed':
            acc.deletions++;
            break;
          case 'modified':
            acc.modifications++;
            break;
        }
        return acc;
      },
      { additions: 0, deletions: 0, modifications: 0, total: 0 }
    );

    stats.total = stats.additions + stats.deletions + stats.modifications;
    return stats;
  }

  // Myers algorithm implementation for educational purposes
  private myersAlgorithm(leftTokens: string[], rightTokens: string[]): DiffResult[] {
    const n = leftTokens.length;
    const m = rightTokens.length;
    const max = n + m;
    const v: { [key: number]: number } = { 1: 0 };
    const trace: any[] = [];

    for (let d = 0; d <= max; d++) {
      const snapshot: { [key: number]: number } = { ...v };
      trace.push(snapshot);

      for (let k = -d; k <= d; k += 2) {
        let x: number;
        if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
          x = v[k + 1];
        } else {
          x = v[k - 1] + 1;
        }

        let y = x - k;
        while (x < n && y < m && leftTokens[x] === rightTokens[y]) {
          x++;
          y++;
        }

        v[k] = x;
        if (x >= n && y >= m) {
          // Found the shortest edit script
          return this.buildDiffFromTrace(trace, leftTokens, rightTokens);
        }
      }
    }

    return [];
  }

  private buildDiffFromTrace(trace: any[], leftTokens: string[], rightTokens: string[]): DiffResult[] {
    // Simplified implementation - would need full backtracking in production
    const results: DiffResult[] = [];
    let lineNumber = 1;

    // This is a placeholder - actual implementation would backtrack through trace
    for (let i = 0; i < Math.max(leftTokens.length, rightTokens.length); i++) {
      if (i < leftTokens.length && i < rightTokens.length) {
        if (leftTokens[i] === rightTokens[i]) {
          results.push({
            type: 'unchanged',
            lineNumber: lineNumber++,
            content: leftTokens[i]
          });
        } else {
          results.push({
            type: 'modified',
            lineNumber: lineNumber++,
            content: `${leftTokens[i]} → ${rightTokens[i]}`,
            oldContent: leftTokens[i],
            newContent: rightTokens[i]
          });
        }
      } else if (i < leftTokens.length) {
        results.push({
          type: 'removed',
          lineNumber: lineNumber++,
          content: leftTokens[i],
          oldContent: leftTokens[i]
        });
      } else {
        results.push({
          type: 'added',
          lineNumber: lineNumber++,
          content: rightTokens[i],
          newContent: rightTokens[i]
        });
      }
    }

    return results;
  }

  // Cache management
  private generateCacheKey(left: string, right: string, options: DiffOptions): string {
    const contentHash = this.simpleHash(left + right);
    const optionsHash = this.simpleHash(JSON.stringify(options));
    return `${contentHash}-${optionsHash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  private getFromCache(key: string): DiffCacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  private addToCache(key: string, result: DiffResult[], statistics: DiffStatistics): void {
    // Limit cache size to prevent memory issues
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      key,
      result,
      statistics,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}