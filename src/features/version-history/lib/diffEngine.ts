import * as Diff from 'diff';
import DiffMatchPatch from 'diff-match-patch';
import DOMPurify from 'dompurify';
import { DiffPatch, VersionDiff } from '@/entities/version';

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'add' | 'remove' | 'normal';
  content: string;
  lineNumber?: number;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffResult {
  hunks: DiffHunk[];
  stats: DiffStats;
  patches: DiffPatch[];
}

export interface DiffStats {
  additions: number;
  deletions: number;
  modifications: number;
  filesChanged: number;
}

export interface DiffViewOptions {
  context?: number;
  ignoreWhitespace?: boolean;
  showLineNumbers?: boolean;
  syntaxHighlight?: boolean;
}

export class DiffEngine {
  private dmp: DiffMatchPatch;
  private defaultContext = 3;

  constructor() {
    this.dmp = new DiffMatchPatch();
    this.dmp.Diff_Timeout = 2.0;
    this.dmp.Diff_EditCost = 4;
  }

  computeDiff(
    oldContent: string,
    newContent: string,
    options?: DiffViewOptions
  ): DiffResult {
    const context = options?.context || this.defaultContext;
    const ignoreWhitespace = options?.ignoreWhitespace || false;

    const processedOld = ignoreWhitespace ? this.normalizeWhitespace(oldContent) : oldContent;
    const processedNew = ignoreWhitespace ? this.normalizeWhitespace(newContent) : newContent;

    const patch = Diff.createPatch(
      'content',
      processedOld,
      processedNew,
      'old',
      'new',
      { context }
    );

    const hunks = this.parseHunks(patch);
    const stats = this.calculateStats(hunks);
    const patches = this.generatePatches(processedOld, processedNew);

    return { hunks, stats, patches };
  }

  computeLineDiff(
    oldLines: string[],
    newLines: string[]
  ): Diff.Change[] {
    return Diff.diffArrays(oldLines, newLines);
  }

  computeWordDiff(
    oldText: string,
    newText: string
  ): Diff.Change[] {
    return Diff.diffWords(oldText, newText);
  }

  computeCharDiff(
    oldText: string,
    newText: string
  ): Diff.Change[] {
    return Diff.diffChars(oldText, newText);
  }

  renderSideBySide(diff: DiffResult, options?: DiffViewOptions): HTMLElement {
    const container = document.createElement('div');
    container.className = 'diff-side-by-side';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = '1fr 1fr';
    container.style.gap = '8px';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.5';

    const leftPanel = document.createElement('div');
    leftPanel.className = 'diff-panel diff-panel-old';
    leftPanel.style.overflow = 'auto';
    leftPanel.style.backgroundColor = '#f8f9fa';
    leftPanel.style.padding = '12px';
    leftPanel.style.borderRadius = '4px';

    const rightPanel = document.createElement('div');
    rightPanel.className = 'diff-panel diff-panel-new';
    rightPanel.style.overflow = 'auto';
    rightPanel.style.backgroundColor = '#f8f9fa';
    rightPanel.style.padding = '12px';
    rightPanel.style.borderRadius = '4px';

    diff.hunks.forEach(hunk => {
      const leftLines: string[] = [];
      const rightLines: string[] = [];

      hunk.lines.forEach(line => {
        if (line.type === 'remove') {
          leftLines.push(this.renderLine(line, 'remove', options));
          rightLines.push('');
        } else if (line.type === 'add') {
          leftLines.push('');
          rightLines.push(this.renderLine(line, 'add', options));
        } else {
          const normalLine = this.renderLine(line, 'normal', options);
          leftLines.push(normalLine);
          rightLines.push(normalLine);
        }
      });

      leftLines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.innerHTML = DOMPurify.sanitize(line);
        lineDiv.style.minHeight = '20px';
        leftPanel.appendChild(lineDiv);
      });

      rightLines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.innerHTML = DOMPurify.sanitize(line);
        lineDiv.style.minHeight = '20px';
        rightPanel.appendChild(lineDiv);
      });
    });

    container.appendChild(leftPanel);
    container.appendChild(rightPanel);

    return container;
  }

  renderInline(diff: DiffResult, options?: DiffViewOptions): HTMLElement {
    const container = document.createElement('div');
    container.className = 'diff-inline';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.5';
    container.style.backgroundColor = '#f8f9fa';
    container.style.padding = '12px';
    container.style.borderRadius = '4px';

    diff.hunks.forEach(hunk => {
      const hunkHeader = document.createElement('div');
      hunkHeader.className = 'diff-hunk-header';
      hunkHeader.textContent = `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`;
      hunkHeader.style.color = '#0366d6';
      hunkHeader.style.backgroundColor = '#f1f8ff';
      hunkHeader.style.padding = '4px 8px';
      hunkHeader.style.margin = '8px 0';
      hunkHeader.style.borderRadius = '3px';
      container.appendChild(hunkHeader);

      hunk.lines.forEach(line => {
        const lineElement = document.createElement('div');
        lineElement.className = `diff-line diff-line-${line.type}`;
        lineElement.innerHTML = DOMPurify.sanitize(
          this.renderLine(line, line.type, options)
        );
        
        if (line.type === 'add') {
          lineElement.style.backgroundColor = '#e6ffed';
          lineElement.style.color = '#24292e';
        } else if (line.type === 'remove') {
          lineElement.style.backgroundColor = '#ffeef0';
          lineElement.style.color = '#24292e';
        }
        
        lineElement.style.padding = '2px 8px';
        container.appendChild(lineElement);
      });
    });

    return container;
  }

  renderUnified(diff: DiffResult): string {
    let output = '';
    
    diff.hunks.forEach(hunk => {
      output += `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@\n`;
      
      hunk.lines.forEach(line => {
        let prefix = ' ';
        if (line.type === 'add') prefix = '+';
        else if (line.type === 'remove') prefix = '-';
        
        output += `${prefix}${line.content}\n`;
      });
    });
    
    return output;
  }

  private renderLine(
    line: DiffLine,
    type: 'add' | 'remove' | 'normal',
    options?: DiffViewOptions
  ): string {
    let prefix = '';
    let content = line.content;

    if (type === 'add') {
      prefix = '+ ';
    } else if (type === 'remove') {
      prefix = '- ';
    } else {
      prefix = '  ';
    }

    if (options?.showLineNumbers && line.lineNumber) {
      prefix = `${String(line.lineNumber).padStart(4, ' ')} ${prefix}`;
    }

    return `<span class="diff-prefix">${prefix}</span><span class="diff-content">${this.escapeHtml(content)}</span>`;
  }

  private parseHunks(patch: string): DiffHunk[] {
    const hunks: DiffHunk[] = [];
    const lines = patch.split('\n');
    let currentHunk: DiffHunk | null = null;
    let oldLine = 0;
    let newLine = 0;

    for (const line of lines) {
      const hunkMatch = line.match(/^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
      
      if (hunkMatch) {
        currentHunk = {
          oldStart: parseInt(hunkMatch[1]),
          oldLines: parseInt(hunkMatch[2]),
          newStart: parseInt(hunkMatch[3]),
          newLines: parseInt(hunkMatch[4]),
          lines: []
        };
        oldLine = currentHunk.oldStart;
        newLine = currentHunk.newStart;
        hunks.push(currentHunk);
      } else if (currentHunk && line.length > 0) {
        const type = line[0] === '+' ? 'add' : line[0] === '-' ? 'remove' : 'normal';
        const content = line.substring(1);
        
        const diffLine: DiffLine = {
          type,
          content,
          oldLineNumber: type !== 'add' ? oldLine : undefined,
          newLineNumber: type !== 'remove' ? newLine : undefined
        };
        
        currentHunk.lines.push(diffLine);
        
        if (type !== 'add') oldLine++;
        if (type !== 'remove') newLine++;
      }
    }

    return hunks;
  }

  private calculateStats(hunks: DiffHunk[]): DiffStats {
    let additions = 0;
    let deletions = 0;
    let modifications = 0;

    hunks.forEach(hunk => {
      hunk.lines.forEach(line => {
        if (line.type === 'add') additions++;
        else if (line.type === 'remove') deletions++;
      });
    });

    modifications = Math.min(additions, deletions);

    return {
      additions: additions - modifications,
      deletions: deletions - modifications,
      modifications,
      filesChanged: hunks.length > 0 ? 1 : 0
    };
  }

  private generatePatches(oldContent: string, newContent: string): DiffPatch[] {
    const diffs = this.dmp.diff_main(oldContent, newContent);
    this.dmp.diff_cleanupSemantic(diffs);
    
    const patches: DiffPatch[] = [];
    let position = 0;

    diffs.forEach(([operation, text]) => {
      if (operation === -1) {
        patches.push({
          type: 'remove',
          path: `char:${position}`,
          oldValue: text,
          lineNumber: this.getLineNumber(oldContent, position)
        });
      } else if (operation === 1) {
        patches.push({
          type: 'add',
          path: `char:${position}`,
          newValue: text,
          lineNumber: this.getLineNumber(newContent, position)
        });
        position += text.length;
      } else {
        position += text.length;
      }
    });

    return patches;
  }

  private getLineNumber(content: string, position: number): number {
    const lines = content.substring(0, position).split('\n');
    return lines.length;
  }

  private normalizeWhitespace(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/[ ]+$/gm, '');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  applyPatch(content: string, patch: string): string {
    const result = Diff.applyPatch(content, patch);
    if (result === false) {
      throw new Error('Failed to apply patch');
    }
    return result;
  }

  createPatch(
    fileName: string,
    oldContent: string,
    newContent: string,
    oldHeader?: string,
    newHeader?: string
  ): string {
    return Diff.createPatch(
      fileName,
      oldContent,
      newContent,
      oldHeader || '',
      newHeader || ''
    );
  }

  mergeDiffs(
    base: string,
    ours: string,
    theirs: string
  ): { merged: string; conflicts: boolean } {
    const ourDiffs = this.dmp.diff_main(base, ours);
    const theirDiffs = this.dmp.diff_main(base, theirs);
    
    try {
      const merged = this.dmp.patch_apply(
        this.dmp.patch_make(base, ourDiffs),
        theirs
      )[0];
      
      return { merged, conflicts: false };
    } catch (error) {
      return { merged: base, conflicts: true };
    }
  }
}