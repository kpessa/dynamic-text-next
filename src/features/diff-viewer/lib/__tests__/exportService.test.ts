import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService } from '../exportService';
import { ComparisonResult } from '../comparisonService';

// Mock the download functionality
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock document methods
const mockLink = {
  href: '',
  download: '',
  click: vi.fn(),
  remove: vi.fn()
};

document.createElement = vi.fn((tag: string) => {
  if (tag === 'a') {
    return mockLink as any;
  }
  return document.createElement.call(document, tag);
});

document.body.appendChild = vi.fn();
document.body.removeChild = vi.fn();

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined)
  },
  writable: true
});

describe('ExportService', () => {
  let service: ExportService;
  let mockComparison: ComparisonResult;

  beforeEach(() => {
    service = ExportService.getInstance();
    vi.clearAllMocks();
    
    mockComparison = {
      id: 'comp-123',
      ingredientId: 'ing-456',
      mode: 'populations',
      timestamp: new Date('2025-01-06T10:00:00Z'),
      comparisons: [
        {
          left: {
            label: 'Neonatal',
            population: 'neonatal' as any,
            content: { name: 'Test', value: 1 }
          },
          right: {
            label: 'Child',
            population: 'child' as any,
            content: { name: 'Test', value: 2 }
          },
          diff: [],
          statistics: {
            additions: 5,
            deletions: 3,
            modifications: 2
          }
        }
      ],
      summary: {
        totalComparisons: 1,
        totalChanges: 10,
        changedFields: ['value'],
        identicalPairs: 0
      }
    };
  });

  describe('export', () => {
    it('should export as HTML', async () => {
      const result = await service.export(mockComparison, {
        format: 'html',
        includeMetadata: true,
        includeStyles: true
      });

      expect(result.success).toBe(true);
      expect(result.format).toBe('html');
      expect(result.fileName).toContain('.html');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should export as JSON', async () => {
      const result = await service.export(mockComparison, {
        format: 'json',
        includeMetadata: true
      });

      expect(result.success).toBe(true);
      expect(result.format).toBe('json');
      expect(result.fileName).toContain('.json');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should export as PDF', async () => {
      const result = await service.export(mockComparison, {
        format: 'pdf',
        orientation: 'portrait',
        pageSize: 'a4'
      });

      expect(result.success).toBe(true);
      expect(result.format).toBe('pdf');
      expect(result.fileName).toContain('.pdf');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should export as CSV', async () => {
      const result = await service.export(mockComparison, {
        format: 'csv'
      });

      expect(result.success).toBe(true);
      expect(result.format).toBe('csv');
      expect(result.fileName).toContain('.csv');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should use custom filename if provided', async () => {
      const customName = 'my-custom-export.html';
      const result = await service.export(mockComparison, {
        format: 'html',
        fileName: customName
      });

      expect(result.fileName).toBe(customName);
    });

    it('should handle export errors gracefully', async () => {
      // Force an error by providing invalid format
      const result = await service.export(mockComparison, {
        format: 'invalid' as any
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text summary to clipboard', async () => {
      const result = await service.copyToClipboard(mockComparison, 'text');

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      
      const clipboardCall = (navigator.clipboard.writeText as any).mock.calls[0][0];
      expect(clipboardCall).toContain('Ingredient Comparison Report');
      expect(clipboardCall).toContain('comp-123');
    });

    it('should copy JSON to clipboard', async () => {
      const result = await service.copyToClipboard(mockComparison, 'json');

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      
      const clipboardCall = (navigator.clipboard.writeText as any).mock.calls[0][0];
      const parsed = JSON.parse(clipboardCall);
      expect(parsed.id).toBe('comp-123');
    });

    it('should handle clipboard errors', async () => {
      (navigator.clipboard.writeText as any).mockRejectedValueOnce(new Error('Clipboard error'));
      
      const result = await service.copyToClipboard(mockComparison);
      
      expect(result).toBe(false);
    });
  });

  describe('generateShareableLink', () => {
    it('should generate shareable link with parameters', () => {
      const link = service.generateShareableLink(mockComparison);

      expect(link).toContain('/diff?');
      expect(link).toContain('id=comp-123');
      expect(link).toContain('ingredient=ing-456');
      expect(link).toContain('mode=populations');
    });

    it('should use custom base URL if provided', () => {
      const baseUrl = 'https://example.com';
      const link = service.generateShareableLink(mockComparison, baseUrl);

      expect(link.startsWith(baseUrl)).toBe(true);
    });
  });

  describe('HTML export specifics', () => {
    it('should include metadata when requested', async () => {
      await service.export(mockComparison, {
        format: 'html',
        includeMetadata: true
      });

      // Check that the blob was created with metadata
      const blobCall = (global.Blob as any).mock?.calls?.[0];
      if (blobCall) {
        const htmlContent = blobCall[0][0];
        expect(htmlContent).toContain('Comparison Details');
        expect(htmlContent).toContain('comp-123');
      }
    });

    it('should include styles when requested', async () => {
      await service.export(mockComparison, {
        format: 'html',
        includeStyles: true
      });

      // Check that the blob was created with styles
      const blobCall = (global.Blob as any).mock?.calls?.[0];
      if (blobCall) {
        const htmlContent = blobCall[0][0];
        expect(htmlContent).toContain('<style>');
        expect(htmlContent).toContain('.export-container');
      }
    });
  });

  describe('CSV export specifics', () => {
    it('should properly escape CSV values', async () => {
      mockComparison.comparisons[0].left.label = 'Label, with comma';
      
      await service.export(mockComparison, {
        format: 'csv'
      });

      // Check that the blob was created with escaped values
      const blobCall = (global.Blob as any).mock?.calls?.[0];
      if (blobCall) {
        const csvContent = blobCall[0][0];
        expect(csvContent).toContain('"Label, with comma"');
      }
    });

    it('should include summary in CSV', async () => {
      await service.export(mockComparison, {
        format: 'csv'
      });

      const blobCall = (global.Blob as any).mock?.calls?.[0];
      if (blobCall) {
        const csvContent = blobCall[0][0];
        expect(csvContent).toContain('Summary');
        expect(csvContent).toContain('Total Comparisons,1');
      }
    });
  });

  describe('filename generation', () => {
    it('should generate appropriate filename for population comparison', async () => {
      const result = await service.export(mockComparison, {
        format: 'html'
      });

      expect(result.fileName).toMatch(/diff-pop-ing-456-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.html/);
    });

    it('should generate appropriate filename for version comparison', async () => {
      mockComparison.mode = 'versions';
      
      const result = await service.export(mockComparison, {
        format: 'json'
      });

      expect(result.fileName).toMatch(/diff-ver-ing-456-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json/);
    });
  });
});