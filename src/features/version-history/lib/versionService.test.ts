import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VersionService } from './versionService';
import { ChangeAuthor } from '@/entities/version';

describe('VersionService', () => {
  let versionService: VersionService;
  let mockAuthor: ChangeAuthor;

  beforeEach(() => {
    versionService = VersionService.getInstance();
    mockAuthor = {
      userId: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      timestamp: new Date()
    };
  });

  describe('createVersion', () => {
    it('should create a new version', async () => {
      const content = {
        sections: [
          { id: '1', title: 'Section 1', content: 'Content 1' }
        ]
      };
      
      const version = await versionService.createVersion(
        'doc-1',
        content,
        mockAuthor,
        'Test commit'
      );
      
      expect(version).toBeDefined();
      expect(version.documentId).toBe('doc-1');
      expect(version.version).toBe(1);
      expect(version.content).toEqual(content);
      expect(version.metadata.commitMessage).toBe('Test commit');
    });

    it('should increment version number', async () => {
      const content = { sections: [] };
      
      const v1 = await versionService.createVersion('doc-1', content, mockAuthor);
      const v2 = await versionService.createVersion('doc-1', content, mockAuthor);
      
      expect(v2.version).toBe(v1.version + 1);
    });

    it('should track parent version', async () => {
      const content = { sections: [] };
      
      const v1 = await versionService.createVersion('doc-1', content, mockAuthor);
      const v2 = await versionService.createVersion(
        'doc-1',
        content,
        mockAuthor,
        'Child version',
        v1.id
      );
      
      expect(v2.parentVersionId).toBe(v1.id);
      expect(v2.baseVersionId).toBe(v1.id);
    });

    it('should calculate checksum', async () => {
      const content = { sections: [{ id: '1', content: 'test' }] };
      
      const version = await versionService.createVersion(
        'doc-1',
        content,
        mockAuthor
      );
      
      expect(version.checksum).toBeDefined();
      expect(version.checksum).toHaveLength(64); // SHA-256 produces 64 hex characters
    });
  });

  describe('createAutoSaveVersion', () => {
    it('should create auto-save version with timestamp', async () => {
      const content = { sections: [] };
      
      const version = await versionService.createAutoSaveVersion(
        'doc-1',
        content,
        mockAuthor
      );
      
      expect(version.metadata.commitMessage).toContain('Auto-save at');
    });
  });

  describe('branch management', () => {
    it('should create a new branch', async () => {
      const branch = await versionService.createBranch(
        'feature-branch',
        'base-version-id',
        mockAuthor
      );
      
      expect(branch).toBeDefined();
      expect(branch.name).toBe('feature-branch');
      expect(branch.baseVersionId).toBe('base-version-id');
      expect(branch.isDefault).toBe(false);
    });

    it('should switch branches', () => {
      versionService.switchBranch('develop');
      expect(versionService.getCurrentBranch()).toBe('develop');
    });

    it('should track branch in version metadata', async () => {
      versionService.switchBranch('feature');
      
      const version = await versionService.createVersion(
        'doc-1',
        { sections: [] },
        mockAuthor
      );
      
      expect(version.metadata.branch).toBe('feature');
    });
  });

  describe('detectChanges', () => {
    it('should detect section additions', async () => {
      const oldContent = {
        sections: [{ id: '1', content: 'Section 1' }]
      };
      
      const newContent = {
        sections: [
          { id: '1', content: 'Section 1' },
          { id: '2', content: 'Section 2' }
        ]
      };
      
      const v1 = await versionService.createVersion('doc-1', oldContent, mockAuthor);
      const v2 = await versionService.createVersion(
        'doc-1',
        newContent,
        mockAuthor,
        'Added section',
        v1.id
      );
      
      expect(v2.diff?.added).toBe(1);
    });

    it('should detect section modifications', async () => {
      const oldContent = {
        sections: [{ id: '1', content: 'Original' }]
      };
      
      const newContent = {
        sections: [{ id: '1', content: 'Modified' }]
      };
      
      const v1 = await versionService.createVersion('doc-1', oldContent, mockAuthor);
      const v2 = await versionService.createVersion(
        'doc-1',
        newContent,
        mockAuthor,
        'Modified section',
        v1.id
      );
      
      expect(v2.diff?.modified).toBe(1);
    });

    it('should detect section deletions', async () => {
      const oldContent = {
        sections: [
          { id: '1', content: 'Section 1' },
          { id: '2', content: 'Section 2' }
        ]
      };
      
      const newContent = {
        sections: [{ id: '1', content: 'Section 1' }]
      };
      
      const v1 = await versionService.createVersion('doc-1', oldContent, mockAuthor);
      const v2 = await versionService.createVersion(
        'doc-1',
        newContent,
        mockAuthor,
        'Removed section',
        v1.id
      );
      
      expect(v2.diff?.removed).toBe(1);
    });

    it('should detect ingredient changes', async () => {
      const oldContent = {
        sections: [],
        ingredients: [{ id: '1', name: 'Ingredient 1', value: 100 }]
      };
      
      const newContent = {
        sections: [],
        ingredients: [
          { id: '1', name: 'Ingredient 1', value: 200 },
          { id: '2', name: 'Ingredient 2', value: 50 }
        ]
      };
      
      const v1 = await versionService.createVersion('doc-1', oldContent, mockAuthor);
      const v2 = await versionService.createVersion(
        'doc-1',
        newContent,
        mockAuthor,
        'Updated ingredients',
        v1.id
      );
      
      expect(v2.diff?.added).toBe(1); // New ingredient
      expect(v2.diff?.modified).toBe(1); // Modified ingredient
    });
  });

  describe('tagging', () => {
    it('should tag a version', async () => {
      const version = await versionService.createVersion(
        'doc-1',
        { sections: [] },
        mockAuthor
      );
      
      vi.spyOn(versionService, 'getVersion').mockResolvedValue(version);
      
      await versionService.tagVersion(version.id, 'release-1.0');
      
      expect(version.metadata.tags).toContain('release-1.0');
    });

    it('should get versions by tag', async () => {
      const v1 = await versionService.createVersion(
        'doc-1',
        { sections: [] },
        mockAuthor
      );
      v1.metadata.tags = ['important'];
      
      const v2 = await versionService.createVersion(
        'doc-1',
        { sections: [] },
        mockAuthor
      );
      
      vi.spyOn(versionService, 'getVersionHistory').mockResolvedValue([v1, v2]);
      
      const tagged = await versionService.getVersionsByTag('doc-1', 'important');
      
      expect(tagged).toHaveLength(1);
      expect(tagged[0].id).toBe(v1.id);
    });
  });

  describe('captureCommitMessage', () => {
    it('should generate default commit message', async () => {
      const changes = [
        { action: 'create' as const, type: 'section' as const, entityId: '1', newValue: {}, author: mockAuthor, timestamp: new Date() },
        { action: 'update' as const, type: 'section' as const, entityId: '2', newValue: {}, author: mockAuthor, timestamp: new Date() },
        { action: 'delete' as const, type: 'section' as const, entityId: '3', oldValue: {}, author: mockAuthor, timestamp: new Date() }
      ];
      
      global.prompt = vi.fn().mockReturnValue(null);
      
      const message = await versionService.captureCommitMessage(changes);
      
      expect(message).toContain('Added 1 items');
      expect(message).toContain('Modified 1 items');
      expect(message).toContain('Removed 1 items');
    });
  });
});