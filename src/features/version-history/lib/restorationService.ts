import { Version, VersionRestoreOptions, ChangeAuthor } from '@/entities/version';
import { VersionStorage } from './versionStorage';
import { VersionService } from './versionService';
import { v4 as uuidv4 } from 'uuid';

export interface RestoreResult {
  success: boolean;
  restoredVersion?: Version;
  backupVersion?: Version;
  message?: string;
  error?: Error;
}

export interface RollbackOptions {
  targetVersionId: string;
  preserveHistory: boolean;
  author: ChangeAuthor;
}

export class RestorationService {
  private static instance: RestorationService;
  private versionStorage: VersionStorage;
  private versionService: VersionService;

  private constructor() {
    this.versionStorage = VersionStorage.getInstance();
    this.versionService = VersionService.getInstance();
  }

  static getInstance(): RestorationService {
    if (!RestorationService.instance) {
      RestorationService.instance = new RestorationService();
    }
    return RestorationService.instance;
  }

  async restoreVersion(
    options: VersionRestoreOptions,
    author: ChangeAuthor
  ): Promise<RestoreResult> {
    try {
      const targetVersion = await this.versionStorage.getVersion(
        options.targetVersionId
      );

      if (!targetVersion) {
        return {
          success: false,
          message: `Version ${options.targetVersionId} not found`
        };
      }

      const confirmRestore = await this.confirmRestore(targetVersion);
      if (!confirmRestore) {
        return {
          success: false,
          message: 'Restore cancelled by user'
        };
      }

      let backupVersion: Version | undefined;
      if (options.createBackup) {
        const currentContent = await this.getCurrentContent(targetVersion.documentId);
        if (currentContent) {
          backupVersion = await this.createBackup(
            targetVersion.documentId,
            currentContent,
            author
          );
        }
      }

      const restoredVersion = await this.performRestore(
        targetVersion,
        options,
        author
      );

      await this.handleDependentDataUpdates(restoredVersion);

      return {
        success: true,
        restoredVersion,
        backupVersion,
        message: `Successfully restored to version ${targetVersion.version}`
      };
    } catch (error) {
      console.error('Restore failed:', error);
      return {
        success: false,
        error: error as Error,
        message: `Restore failed: ${(error as Error).message}`
      };
    }
  }

  private async confirmRestore(version: Version): Promise<boolean> {
    const message = `Are you sure you want to restore to version ${version.version}?\n` +
      `Created: ${version.metadata.createdAt.toLocaleString()}\n` +
      `By: ${version.metadata.createdBy}\n` +
      `Message: ${version.metadata.commitMessage || 'No message'}`;

    return new Promise((resolve) => {
      const confirmed = confirm(message);
      resolve(confirmed);
    });
  }

  private async performRestore(
    targetVersion: Version,
    options: VersionRestoreOptions,
    author: ChangeAuthor
  ): Promise<Version> {
    if (!targetVersion.content) {
      throw new Error('Target version has no content');
    }

    const commitMessage = options.commitMessage || 
      `Restored to version ${targetVersion.version}`;

    let restoredVersion: Version;

    switch (options.mergeStrategy) {
      case 'overwrite':
        restoredVersion = await this.versionService.createVersion(
          targetVersion.documentId,
          targetVersion.content,
          author,
          commitMessage
        );
        break;

      case 'merge':
        const currentContent = await this.getCurrentContent(targetVersion.documentId);
        const mergedContent = await this.mergeContents(
          currentContent,
          targetVersion.content
        );
        restoredVersion = await this.versionService.createVersion(
          targetVersion.documentId,
          mergedContent,
          author,
          commitMessage
        );
        break;

      case 'branch':
        const branchName = `restore-v${targetVersion.version}-${Date.now()}`;
        const branch = await this.versionService.createBranch(
          branchName,
          targetVersion.id,
          author
        );
        this.versionService.switchBranch(branchName);
        restoredVersion = await this.versionService.createVersion(
          targetVersion.documentId,
          targetVersion.content,
          author,
          commitMessage
        );
        break;

      default:
        restoredVersion = await this.versionService.createVersion(
          targetVersion.documentId,
          targetVersion.content,
          author,
          commitMessage
        );
    }

    await this.versionStorage.saveVersion(restoredVersion);
    return restoredVersion;
  }

  async checkoutVersion(versionId: string): Promise<Version | null> {
    const version = await this.versionStorage.getVersion(versionId);
    
    if (!version) {
      console.error(`Version ${versionId} not found`);
      return null;
    }

    if (!version.content) {
      version.content = await this.versionStorage.reconstructVersion(versionId);
    }

    return version;
  }

  async rollback(options: RollbackOptions): Promise<RestoreResult> {
    try {
      const targetVersion = await this.versionStorage.getVersion(
        options.targetVersionId
      );

      if (!targetVersion) {
        return {
          success: false,
          message: `Version ${options.targetVersionId} not found`
        };
      }

      if (!options.preserveHistory) {
        console.warn('Rolling back without preserving history');
      }

      const rollbackVersion = await this.versionService.createVersion(
        targetVersion.documentId,
        targetVersion.content!,
        options.author,
        `Rollback to version ${targetVersion.version}`
      );

      await this.versionStorage.saveVersion(rollbackVersion);

      return {
        success: true,
        restoredVersion: rollbackVersion,
        message: `Successfully rolled back to version ${targetVersion.version}`
      };
    } catch (error) {
      console.error('Rollback failed:', error);
      return {
        success: false,
        error: error as Error,
        message: `Rollback failed: ${(error as Error).message}`
      };
    }
  }

  private async createBackup(
    documentId: string,
    content: any,
    author: ChangeAuthor
  ): Promise<Version> {
    const backupVersion = await this.versionService.createVersion(
      documentId,
      content,
      author,
      `Backup before restore at ${new Date().toISOString()}`
    );

    backupVersion.metadata.tags = ['backup'];
    await this.versionStorage.saveVersion(backupVersion);
    
    return backupVersion;
  }

  private async handleDependentDataUpdates(version: Version): Promise<void> {
    console.log('Updating dependent data for restored version:', version.id);
    
    if (version.content?.ingredients) {
      console.log('Updating ingredient references...');
    }

    if (version.content?.config) {
      console.log('Updating configuration...');
    }
  }

  async recoverFromCorruption(
    documentId: string,
    author: ChangeAuthor
  ): Promise<RestoreResult> {
    try {
      const versions = await this.versionStorage.getVersionHistory(documentId);
      
      for (const version of versions) {
        const isValid = await this.versionStorage.validateVersionIntegrity(version.id);
        
        if (isValid) {
          console.log(`Found valid version: ${version.id} (v${version.version})`);
          
          return await this.restoreVersion(
            {
              targetVersionId: version.id,
              createBackup: false,
              mergeStrategy: 'overwrite',
              commitMessage: `Recovered from corruption using version ${version.version}`
            },
            author
          );
        }
      }

      const archivedVersion = await this.recoverFromArchive(documentId);
      if (archivedVersion) {
        return {
          success: true,
          restoredVersion: archivedVersion,
          message: 'Recovered from archive'
        };
      }

      return {
        success: false,
        message: 'No valid versions found for recovery'
      };
    } catch (error) {
      console.error('Recovery failed:', error);
      return {
        success: false,
        error: error as Error,
        message: `Recovery failed: ${(error as Error).message}`
      };
    }
  }

  private async recoverFromArchive(documentId: string): Promise<Version | null> {
    console.log('Attempting to recover from archive...');
    return null;
  }

  private async getCurrentContent(documentId: string): Promise<any> {
    const history = await this.versionStorage.getVersionHistory(documentId, 1);
    
    if (history.length === 0) {
      return null;
    }

    const currentVersion = history[0];
    if (!currentVersion.content) {
      currentVersion.content = await this.versionStorage.reconstructVersion(
        currentVersion.id
      );
    }

    return currentVersion.content;
  }

  private async mergeContents(current: any, target: any): Promise<any> {
    const merged = {
      sections: [...(target?.sections || [])],
      ingredients: [...(current?.ingredients || []), ...(target?.ingredients || [])],
      config: { ...current?.config, ...target?.config }
    };

    const uniqueIngredients = new Map();
    merged.ingredients.forEach(ing => uniqueIngredients.set(ing.id, ing));
    merged.ingredients = Array.from(uniqueIngredients.values());

    return merged;
  }

  async compareWithCurrent(
    versionId: string,
    documentId: string
  ): Promise<{
    differences: any[];
    canRestore: boolean;
  }> {
    const targetVersion = await this.versionStorage.getVersion(versionId);
    const currentContent = await this.getCurrentContent(documentId);

    if (!targetVersion || !currentContent) {
      return { differences: [], canRestore: false };
    }

    const differences = this.versionService.compareVersions(
      targetVersion.id,
      'current'
    );

    return {
      differences: await differences,
      canRestore: true
    };
  }

  async createRestorePoint(
    documentId: string,
    author: ChangeAuthor,
    description?: string
  ): Promise<Version> {
    const content = await this.getCurrentContent(documentId);
    
    const restorePoint = await this.versionService.createVersion(
      documentId,
      content,
      author,
      description || `Restore point created at ${new Date().toISOString()}`
    );

    restorePoint.metadata.tags = ['restore-point'];
    restorePoint.isBaseline = true;
    
    await this.versionStorage.saveVersion(restorePoint);
    
    return restorePoint;
  }
}