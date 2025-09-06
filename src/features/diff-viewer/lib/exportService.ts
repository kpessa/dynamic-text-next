import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ComparisonResult } from './comparisonService';
import { DiffEngine } from './diffEngine';

export type ExportFormat = 'html' | 'pdf' | 'json' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeStyles?: boolean;
  fileName?: string;
  embedImages?: boolean;
  pageSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  format: ExportFormat;
  size: number;
  error?: string;
}

/**
 * Service for exporting diff comparison results in various formats
 */
export class ExportService {
  private static instance: ExportService;
  private diffEngine: DiffEngine;
  
  private constructor() {
    this.diffEngine = new DiffEngine();
  }

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Export comparison result in the specified format
   */
  async export(
    comparison: ComparisonResult,
    options: ExportOptions
  ): Promise<ExportResult> {
    const fileName = options.fileName || this.generateFileName(comparison, options.format);
    
    try {
      switch (options.format) {
        case 'html':
          return await this.exportHTML(comparison, fileName, options);
        case 'pdf':
          return await this.exportPDF(comparison, fileName, options);
        case 'json':
          return await this.exportJSON(comparison, fileName, options);
        case 'csv':
          return await this.exportCSV(comparison, fileName);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      return {
        success: false,
        fileName,
        format: options.format,
        size: 0,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  /**
   * Export as HTML with embedded styles
   */
  private async exportHTML(
    comparison: ComparisonResult,
    fileName: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const html = this.generateHTMLContent(comparison, options);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    
    await this.downloadBlob(blob, fileName);
    
    return {
      success: true,
      fileName,
      format: 'html',
      size: blob.size
    };
  }

  /**
   * Generate HTML content for export
   */
  private generateHTMLContent(
    comparison: ComparisonResult,
    options: ExportOptions
  ): string {
    const styles = options.includeStyles ? this.getEmbeddedStyles() : '';
    const metadata = options.includeMetadata ? this.generateMetadataHTML(comparison) : '';
    
    const comparisonsHTML = comparison.comparisons.map(pair => {
      const leftContent = JSON.stringify(pair.left.content, null, 2);
      const rightContent = JSON.stringify(pair.right.content, null, 2);
      
      return this.diffEngine.generateDiff2Html(
        leftContent,
        rightContent,
        pair.left.label,
        pair.right.label,
        {
          viewMode: 'side-by-side',
          showIdentical: true,
          granularity: 'line',
          highlightSyntax: true
        }
      );
    }).join('<hr class="comparison-separator">');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diff Export - ${comparison.ingredientId}</title>
  ${styles}
</head>
<body>
  <div class="export-container">
    <header>
      <h1>Ingredient Comparison Report</h1>
      <div class="export-timestamp">Generated: ${new Date().toLocaleString()}</div>
    </header>
    
    ${metadata}
    
    <main class="diff-content">
      ${comparisonsHTML}
    </main>
    
    <footer>
      <div class="summary">
        <h3>Summary</h3>
        <ul>
          <li>Total Comparisons: ${comparison.summary.totalComparisons}</li>
          <li>Total Changes: ${comparison.summary.totalChanges}</li>
          <li>Identical Pairs: ${comparison.summary.identicalPairs}</li>
          <li>Changed Fields: ${comparison.summary.changedFields.join(', ')}</li>
        </ul>
      </div>
    </footer>
  </div>
</body>
</html>`;
  }

  /**
   * Get embedded CSS styles for HTML export
   */
  private getEmbeddedStyles(): string {
    return `<style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background: #f5f5f5;
      }
      
      .export-container {
        max-width: 1400px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 30px;
      }
      
      header {
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      
      h1 {
        margin: 0 0 10px 0;
        color: #333;
      }
      
      .export-timestamp {
        color: #666;
        font-size: 14px;
      }
      
      .metadata {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 15px;
        margin-bottom: 30px;
      }
      
      .metadata h3 {
        margin-top: 0;
        color: #495057;
      }
      
      .metadata-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }
      
      .metadata-item {
        display: flex;
        flex-direction: column;
      }
      
      .metadata-label {
        font-weight: 600;
        color: #6c757d;
        font-size: 12px;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      
      .metadata-value {
        color: #212529;
      }
      
      .diff-content {
        margin: 30px 0;
      }
      
      .comparison-separator {
        margin: 40px 0;
        border: none;
        border-top: 2px solid #e0e0e0;
      }
      
      /* diff2html overrides */
      .d2h-wrapper {
        font-size: 14px;
      }
      
      .d2h-file-header {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 4px 4px 0 0;
      }
      
      .d2h-diff-table {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
      }
      
      footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #e0e0e0;
      }
      
      .summary h3 {
        color: #333;
        margin-bottom: 15px;
      }
      
      .summary ul {
        list-style: none;
        padding: 0;
      }
      
      .summary li {
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .summary li:last-child {
        border-bottom: none;
      }
      
      @media print {
        body {
          background: white;
          padding: 0;
        }
        
        .export-container {
          box-shadow: none;
          padding: 0;
        }
        
        .comparison-separator {
          page-break-before: always;
        }
      }
    </style>`;
  }

  /**
   * Generate metadata HTML section
   */
  private generateMetadataHTML(comparison: ComparisonResult): string {
    const mode = comparison.mode === 'populations' ? 'Population Comparison' : 'Version Comparison';
    
    return `<div class="metadata">
      <h3>Comparison Details</h3>
      <div class="metadata-grid">
        <div class="metadata-item">
          <span class="metadata-label">Comparison ID</span>
          <span class="metadata-value">${comparison.id}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Ingredient ID</span>
          <span class="metadata-value">${comparison.ingredientId}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Mode</span>
          <span class="metadata-value">${mode}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Timestamp</span>
          <span class="metadata-value">${new Date(comparison.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </div>`;
  }

  /**
   * Export as PDF using jsPDF
   */
  private async exportPDF(
    comparison: ComparisonResult,
    fileName: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.pageSize || 'a4'
    });

    // Add title
    pdf.setFontSize(20);
    pdf.text('Ingredient Comparison Report', 20, 20);
    
    // Add metadata
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    pdf.text(`Comparison ID: ${comparison.id}`, 20, 35);
    pdf.text(`Mode: ${comparison.mode}`, 20, 40);
    
    // Add summary
    let yPosition = 50;
    pdf.setFontSize(14);
    pdf.text('Summary', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.text(`Total Comparisons: ${comparison.summary.totalComparisons}`, 25, yPosition);
    yPosition += 5;
    pdf.text(`Total Changes: ${comparison.summary.totalChanges}`, 25, yPosition);
    yPosition += 5;
    pdf.text(`Identical Pairs: ${comparison.summary.identicalPairs}`, 25, yPosition);
    
    // Add comparison details
    yPosition += 15;
    pdf.setFontSize(14);
    pdf.text('Comparison Details', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(9);
    
    comparison.comparisons.forEach((pair, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.text(`${pair.left.label} vs ${pair.right.label}`, 25, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(9);
      pdf.text(`Additions: ${pair.statistics.additions}`, 30, yPosition);
      yPosition += 5;
      pdf.text(`Deletions: ${pair.statistics.deletions}`, 30, yPosition);
      yPosition += 5;
      pdf.text(`Modifications: ${pair.statistics.modifications}`, 30, yPosition);
      yPosition += 10;
    });

    // If we need to include the actual diff content, we'd need to render HTML to canvas first
    if (options.embedImages) {
      // This would require rendering the diff HTML to a canvas and adding it as an image
      // For now, we'll just add a note
      pdf.setFontSize(10);
      pdf.text('Full diff details available in HTML export', 20, yPosition + 10);
    }

    const pdfBlob = pdf.output('blob');
    await this.downloadBlob(pdfBlob, fileName);
    
    return {
      success: true,
      fileName,
      format: 'pdf',
      size: pdfBlob.size
    };
  }

  /**
   * Export as JSON
   */
  private async exportJSON(
    comparison: ComparisonResult,
    fileName: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const jsonData = options.includeMetadata 
      ? comparison 
      : {
          comparisons: comparison.comparisons,
          summary: comparison.summary
        };
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    await this.downloadBlob(blob, fileName);
    
    return {
      success: true,
      fileName,
      format: 'json',
      size: blob.size
    };
  }

  /**
   * Export as CSV
   */
  private async exportCSV(
    comparison: ComparisonResult,
    fileName: string
  ): Promise<ExportResult> {
    const csvRows: string[] = [];
    
    // Add headers
    csvRows.push('Left Label,Right Label,Additions,Deletions,Modifications,Total Changes');
    
    // Add data rows
    comparison.comparisons.forEach(pair => {
      const row = [
        this.escapeCSV(pair.left.label),
        this.escapeCSV(pair.right.label),
        pair.statistics.additions.toString(),
        pair.statistics.deletions.toString(),
        pair.statistics.modifications.toString(),
        (pair.statistics.additions + pair.statistics.deletions + pair.statistics.modifications).toString()
      ];
      csvRows.push(row.join(','));
    });
    
    // Add summary row
    csvRows.push('');
    csvRows.push('Summary');
    csvRows.push(`Total Comparisons,${comparison.summary.totalComparisons}`);
    csvRows.push(`Total Changes,${comparison.summary.totalChanges}`);
    csvRows.push(`Identical Pairs,${comparison.summary.identicalPairs}`);
    csvRows.push(`Changed Fields,"${this.escapeCSV(comparison.summary.changedFields.join(', '))}"`);
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    
    await this.downloadBlob(blob, fileName);
    
    return {
      success: true,
      fileName,
      format: 'csv',
      size: blob.size
    };
  }

  /**
   * Escape CSV values
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Generate default file name
   */
  private generateFileName(
    comparison: ComparisonResult,
    format: ExportFormat
  ): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const mode = comparison.mode === 'populations' ? 'pop' : 'ver';
    return `diff-${mode}-${comparison.ingredientId}-${timestamp}.${format}`;
  }

  /**
   * Download blob as file
   */
  private async downloadBlob(blob: Blob, fileName: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Export to clipboard
   */
  async copyToClipboard(
    comparison: ComparisonResult,
    format: 'text' | 'json' = 'text'
  ): Promise<boolean> {
    try {
      let content: string;
      
      if (format === 'json') {
        content = JSON.stringify(comparison, null, 2);
      } else {
        content = this.generateTextSummary(comparison);
      }
      
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Generate plain text summary
   */
  private generateTextSummary(comparison: ComparisonResult): string {
    const lines: string[] = [];
    
    lines.push('=== Ingredient Comparison Report ===');
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Comparison ID: ${comparison.id}`);
    lines.push(`Ingredient ID: ${comparison.ingredientId}`);
    lines.push(`Mode: ${comparison.mode}`);
    lines.push('');
    lines.push('=== Summary ===');
    lines.push(`Total Comparisons: ${comparison.summary.totalComparisons}`);
    lines.push(`Total Changes: ${comparison.summary.totalChanges}`);
    lines.push(`Identical Pairs: ${comparison.summary.identicalPairs}`);
    lines.push(`Changed Fields: ${comparison.summary.changedFields.join(', ')}`);
    lines.push('');
    lines.push('=== Comparison Details ===');
    
    comparison.comparisons.forEach((pair, index) => {
      lines.push(`\n${index + 1}. ${pair.left.label} vs ${pair.right.label}`);
      lines.push(`   Additions: ${pair.statistics.additions}`);
      lines.push(`   Deletions: ${pair.statistics.deletions}`);
      lines.push(`   Modifications: ${pair.statistics.modifications}`);
    });
    
    return lines.join('\n');
  }

  /**
   * Generate shareable link
   */
  generateShareableLink(
    comparison: ComparisonResult,
    baseUrl?: string
  ): string {
    const url = baseUrl || window.location.origin;
    const params = new URLSearchParams({
      id: comparison.id,
      ingredient: comparison.ingredientId,
      mode: comparison.mode,
      timestamp: comparison.timestamp.toString()
    });
    
    return `${url}/diff?${params.toString()}`;
  }
}

// Export singleton instance
export const exportService = ExportService.getInstance();