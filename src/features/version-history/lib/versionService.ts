import { v4 as uuidv4 } from 'uuid';
import { 
  Version, 
  VersionMetadata, 
  ChangeAuthor, 
  VersionBranch, 
  ChangeTracking 
} from '@/entities/version';
import { Section } from '@/entities/section/types';
import { Ingredient } from '@/entities/ingredient/types';

export class VersionService {
  private static instance: VersionService;
  private currentBranch: string = 'main';
  private versionCounter: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): VersionService {
    if (!VersionService.instance) {
      VersionService.instance = new VersionService();
    }
    return VersionService.instance;
  }

  async createVersion(
    documentId: string,
    content: {
      sections: Section[];
      ingredients?: Ingredient[];
      config?: any;
    },
    author: ChangeAuthor,
    commitMessage?: string,
    parentVersionId?: string
  ): Promise<Version> {
    const versionNumber = this.getNextVersionNumber(documentId);
    const metadata = await this.createMetadata(
      author,
      commitMessage,
      content
    );

    const version: Version = {
      id: uuidv4(),
      documentId,
      version: versionNumber,
      parentVersionId,
      content,
      metadata,
      baseVersionId: parentVersionId,
      checksum: await this.calculateChecksum(content)
    };

    await this.trackChanges(version, parentVersionId);
    
    return version;
  }

  async createAutoSaveVersion(
    documentId: string,
    content: {
      sections: Section[];
      ingredients?: Ingredient[];
      config?: any;
    },
    author: ChangeAuthor
  ): Promise<Version> {
    const autoSaveMessage = `Auto-save at ${new Date().toLocaleTimeString()}`;
    return this.createVersion(
      documentId,
      content,
      author,
      autoSaveMessage
    );
  }

  async captureCommitMessage(
    changes: ChangeTracking[],
    suggestions?: string[]
  ): Promise<string> {
    const defaultMessage = this.generateDefaultCommitMessage(changes);
    
    return new Promise((resolve) => {
      const userMessage = prompt(
        `Enter commit message:\n\nChanges: ${defaultMessage}\n\nSuggestions:\n${suggestions?.join('\n') || 'None'}`,
        defaultMessage
      );
      resolve(userMessage || defaultMessage);
    });
  }

  private generateDefaultCommitMessage(changes: ChangeTracking[]): string {
    const summary = {
      created: changes.filter(c => c.action === 'create').length,
      updated: changes.filter(c => c.action === 'update').length,
      deleted: changes.filter(c => c.action === 'delete').length
    };

    const parts = [];
    if (summary.created > 0) parts.push(`Added ${summary.created} items`);
    if (summary.updated > 0) parts.push(`Modified ${summary.updated} items`);
    if (summary.deleted > 0) parts.push(`Removed ${summary.deleted} items`);

    return parts.join(', ') || 'No changes';
  }

  private async trackChanges(
    version: Version,
    parentVersionId?: string
  ): Promise<void> {
    if (!parentVersionId) return;

    const parentVersion = await this.getVersion(parentVersionId);
    if (!parentVersion || !parentVersion.content || !version.content) return;

    const changes = this.detectChanges(
      parentVersion.content,
      version.content
    );

    version.diff = {
      added: changes.filter(c => c.action === 'create').length,
      removed: changes.filter(c => c.action === 'delete').length,
      modified: changes.filter(c => c.action === 'update').length
    };
  }

  private detectChanges(
    oldContent: {
      sections: Section[];
      ingredients?: Ingredient[];
      config?: any;
    },
    newContent: {
      sections: Section[];
      ingredients?: Ingredient[];
      config?: any;
    }
  ): ChangeTracking[] {
    const changes: ChangeTracking[] = [];
    const oldSectionMap = new Map(oldContent.sections.map(s => [s.id, s]));
    const newSectionMap = new Map(newContent.sections.map(s => [s.id, s]));

    for (const [id, section] of newSectionMap) {
      if (!oldSectionMap.has(id)) {
        changes.push({
          type: 'section',
          action: 'create',
          entityId: id,
          newValue: section,
          author: {} as ChangeAuthor,
          timestamp: new Date()
        });
      } else {
        const oldSection = oldSectionMap.get(id);
        if (JSON.stringify(oldSection) !== JSON.stringify(section)) {
          changes.push({
            type: 'section',
            action: 'update',
            entityId: id,
            oldValue: oldSection,
            newValue: section,
            author: {} as ChangeAuthor,
            timestamp: new Date()
          });
        }
      }
    }

    for (const [id, section] of oldSectionMap) {
      if (!newSectionMap.has(id)) {
        changes.push({
          type: 'section',
          action: 'delete',
          entityId: id,
          oldValue: section,
          author: {} as ChangeAuthor,
          timestamp: new Date()
        });
      }
    }

    if (oldContent.ingredients && newContent.ingredients) {
      const oldIngredientMap = new Map(
        oldContent.ingredients.map(i => [i.id, i])
      );
      const newIngredientMap = new Map(
        newContent.ingredients.map(i => [i.id, i])
      );

      for (const [id, ingredient] of newIngredientMap) {
        if (!oldIngredientMap.has(id)) {
          changes.push({
            type: 'ingredient',
            action: 'create',
            entityId: id,
            newValue: ingredient,
            author: {} as ChangeAuthor,
            timestamp: new Date()
          });
        } else {
          const oldIngredient = oldIngredientMap.get(id);
          if (JSON.stringify(oldIngredient) !== JSON.stringify(ingredient)) {
            changes.push({
              type: 'ingredient',
              action: 'update',
              entityId: id,
              oldValue: oldIngredient,
              newValue: ingredient,
              author: {} as ChangeAuthor,
              timestamp: new Date()
            });
          }
        }
      }

      for (const [id, ingredient] of oldIngredientMap) {
        if (!newIngredientMap.has(id)) {
          changes.push({
            type: 'ingredient',
            action: 'delete',
            entityId: id,
            oldValue: ingredient,
            author: {} as ChangeAuthor,
            timestamp: new Date()
          });
        }
      }
    }

    return changes;
  }

  private async createMetadata(
    author: ChangeAuthor,
    commitMessage: string | undefined,
    content: any
  ): Promise<VersionMetadata> {
    const contentString = JSON.stringify(content);
    const size = new Blob([contentString]).size;

    return {
      createdAt: new Date(),
      createdBy: author.name,
      commitMessage,
      changesSummary: commitMessage || 'No description',
      size,
      branch: this.currentBranch
    };
  }

  private getNextVersionNumber(documentId: string): number {
    const current = this.versionCounter.get(documentId) || 0;
    const next = current + 1;
    this.versionCounter.set(documentId, next);
    return next;
  }

  async createBranch(
    name: string,
    baseVersionId: string,
    author: ChangeAuthor
  ): Promise<VersionBranch> {
    return {
      id: uuidv4(),
      name,
      baseVersionId,
      headVersionId: baseVersionId,
      createdAt: new Date(),
      createdBy: author.name,
      isDefault: false,
      isMerged: false
    };
  }

  switchBranch(branchName: string): void {
    this.currentBranch = branchName;
  }

  getCurrentBranch(): string {
    return this.currentBranch;
  }

  async getVersion(versionId: string): Promise<Version | null> {
    return null;
  }

  private async calculateChecksum(content: any): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(content));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }

  async compareVersions(
    versionId1: string,
    versionId2: string
  ): Promise<ChangeTracking[]> {
    const version1 = await this.getVersion(versionId1);
    const version2 = await this.getVersion(versionId2);

    if (!version1?.content || !version2?.content) {
      return [];
    }

    return this.detectChanges(version1.content, version2.content);
  }

  async getVersionHistory(
    documentId: string,
    limit?: number
  ): Promise<Version[]> {
    return [];
  }

  async tagVersion(
    versionId: string,
    tag: string
  ): Promise<void> {
    const version = await this.getVersion(versionId);
    if (version) {
      version.metadata.tags = version.metadata.tags || [];
      version.metadata.tags.push(tag);
    }
  }

  async getVersionsByTag(
    documentId: string,
    tag: string
  ): Promise<Version[]> {
    const allVersions = await this.getVersionHistory(documentId);
    return allVersions.filter(v => 
      v.metadata.tags?.includes(tag)
    );
  }
}