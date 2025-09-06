import { 
  ConflictInfo, 
  ConflictSection, 
  Version, 
  MergeRequest,
  MergeResult,
  ChangeAuthor 
} from '@/entities/version';
import { DiffEngine } from './diffEngine';
import { VersionService } from './versionService';
import { v4 as uuidv4 } from 'uuid';

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: ConflictSection[];
  autoMergeable: string[];
  requiresManualResolution: string[];
}

export class ConflictResolutionService {
  private static instance: ConflictResolutionService;
  private diffEngine: DiffEngine;
  private versionService: VersionService;

  private constructor() {
    this.diffEngine = new DiffEngine();
    this.versionService = VersionService.getInstance();
  }

  static getInstance(): ConflictResolutionService {
    if (!ConflictResolutionService.instance) {
      ConflictResolutionService.instance = new ConflictResolutionService();
    }
    return ConflictResolutionService.instance;
  }

  async detectConcurrentModifications(
    version1: Version,
    version2: Version,
    baseVersion?: Version
  ): Promise<ConflictDetectionResult> {
    if (!version1.content || !version2.content) {
      throw new Error('Versions must have content for conflict detection');
    }

    const base = baseVersion?.content || { sections: [], ingredients: [] };
    const conflicts: ConflictSection[] = [];
    const autoMergeable: string[] = [];
    const requiresManualResolution: string[] = [];

    const baseSections = new Map(base.sections?.map(s => [s.id, s]) || []);
    const v1Sections = new Map(version1.content.sections.map(s => [s.id, s]));
    const v2Sections = new Map(version2.content.sections.map(s => [s.id, s]));

    const allSectionIds = new Set([
      ...baseSections.keys(),
      ...v1Sections.keys(),
      ...v2Sections.keys()
    ]);

    for (const sectionId of allSectionIds) {
      const baseSection = baseSections.get(sectionId);
      const v1Section = v1Sections.get(sectionId);
      const v2Section = v2Sections.get(sectionId);

      if (this.hasConflict(baseSection, v1Section, v2Section)) {
        const conflict: ConflictSection = {
          sectionId,
          base: JSON.stringify(baseSection || ''),
          local: JSON.stringify(v1Section || ''),
          remote: JSON.stringify(v2Section || ''),
        };
        conflicts.push(conflict);
        requiresManualResolution.push(sectionId);
      } else if (this.canAutoMerge(baseSection, v1Section, v2Section)) {
        autoMergeable.push(sectionId);
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      autoMergeable,
      requiresManualResolution
    };
  }

  private hasConflict(base: any, v1: any, v2: any): boolean {
    if (!v1 || !v2) return false;
    
    const v1Changed = JSON.stringify(base) !== JSON.stringify(v1);
    const v2Changed = JSON.stringify(base) !== JSON.stringify(v2);
    const v1v2Different = JSON.stringify(v1) !== JSON.stringify(v2);
    
    return v1Changed && v2Changed && v1v2Different;
  }

  private canAutoMerge(base: any, v1: any, v2: any): boolean {
    if (!base) {
      return !v1 || !v2;
    }
    
    const v1Changed = JSON.stringify(base) !== JSON.stringify(v1);
    const v2Changed = JSON.stringify(base) !== JSON.stringify(v2);
    
    return (v1Changed && !v2Changed) || (!v1Changed && v2Changed);
  }

  async performThreeWayMerge(
    baseVersion: Version,
    ourVersion: Version,
    theirVersion: Version
  ): Promise<MergeResult> {
    if (!baseVersion.content || !ourVersion.content || !theirVersion.content) {
      return {
        success: false,
        message: 'All versions must have content for three-way merge',
        changes: []
      };
    }

    const detection = await this.detectConcurrentModifications(
      ourVersion,
      theirVersion,
      baseVersion
    );

    if (!detection.hasConflicts) {
      const mergedContent = await this.autoMerge(
        baseVersion.content,
        ourVersion.content,
        theirVersion.content
      );

      const mergedVersion = await this.versionService.createVersion(
        ourVersion.documentId,
        mergedContent,
        { userId: 'system', email: 'system', name: 'System', timestamp: new Date() },
        'Auto-merged changes'
      );

      return {
        success: true,
        mergedVersionId: mergedVersion.id,
        changes: []
      };
    }

    return {
      success: false,
      conflicts: detection.conflicts,
      changes: [],
      message: `Found ${detection.conflicts.length} conflicts requiring manual resolution`
    };
  }

  private async autoMerge(base: any, ours: any, theirs: any): Promise<any> {
    const merged = {
      sections: [],
      ingredients: [],
      config: {}
    };

    const baseSections = new Map(base.sections?.map((s: any) => [s.id, s]) || []);
    const ourSections = new Map(ours.sections?.map((s: any) => [s.id, s]) || []);
    const theirSections = new Map(theirs.sections?.map((s: any) => [s.id, s]) || []);

    const allSectionIds = new Set([
      ...baseSections.keys(),
      ...ourSections.keys(),
      ...theirSections.keys()
    ]);

    for (const sectionId of allSectionIds) {
      const baseSection = baseSections.get(sectionId);
      const ourSection = ourSections.get(sectionId);
      const theirSection = theirSections.get(sectionId);

      if (ourSection && theirSection) {
        const ourChanged = JSON.stringify(baseSection) !== JSON.stringify(ourSection);
        const theirChanged = JSON.stringify(baseSection) !== JSON.stringify(theirSection);

        if (ourChanged && !theirChanged) {
          merged.sections.push(ourSection);
        } else if (!ourChanged && theirChanged) {
          merged.sections.push(theirSection);
        } else if (!ourChanged && !theirChanged) {
          merged.sections.push(ourSection);
        } else {
          merged.sections.push(ourSection);
        }
      } else if (ourSection) {
        merged.sections.push(ourSection);
      } else if (theirSection) {
        merged.sections.push(theirSection);
      }
    }

    merged.ingredients = [...(ours.ingredients || []), ...(theirs.ingredients || [])]
      .filter((ing, index, self) => 
        index === self.findIndex(i => i.id === ing.id)
      );

    merged.config = { ...base.config, ...ours.config, ...theirs.config };

    return merged;
  }

  async resolveConflicts(
    conflictInfo: ConflictInfo,
    resolutions: Map<string, ConflictSection>
  ): Promise<Version> {
    const resolvedContent = {
      sections: [] as any[],
      ingredients: [] as any[],
      config: {}
    };

    for (const [sectionId, resolution] of resolutions) {
      if (resolution.resolved) {
        const resolvedSection = JSON.parse(resolution.resolved);
        resolvedContent.sections.push(resolvedSection);
      }
    }

    const resolvedVersion = await this.versionService.createVersion(
      'document-id',
      resolvedContent,
      { 
        userId: conflictInfo.resolvedBy || 'unknown',
        email: 'resolved@example.com',
        name: conflictInfo.resolvedBy || 'Unknown',
        timestamp: new Date()
      },
      'Manually resolved conflicts'
    );

    conflictInfo.resolvedVersionId = resolvedVersion.id;
    conflictInfo.resolvedAt = new Date();

    return resolvedVersion;
  }

  createConflictMarkers(
    local: string,
    remote: string,
    base?: string
  ): string {
    let marked = '<<<<<<< LOCAL\n';
    marked += local + '\n';
    
    if (base) {
      marked += '||||||| BASE\n';
      marked += base + '\n';
    }
    
    marked += '=======\n';
    marked += remote + '\n';
    marked += '>>>>>>> REMOTE\n';
    
    return marked;
  }

  parseConflictMarkers(content: string): ConflictSection[] {
    const conflicts: ConflictSection[] = [];
    const lines = content.split('\n');
    let currentConflict: Partial<ConflictSection> | null = null;
    let currentSection: 'local' | 'base' | 'remote' | null = null;
    let buffer: string[] = [];

    for (const line of lines) {
      if (line.startsWith('<<<<<<< ')) {
        currentConflict = { sectionId: uuidv4() };
        currentSection = 'local';
        buffer = [];
      } else if (line.startsWith('||||||| ')) {
        if (currentConflict) {
          currentConflict.local = buffer.join('\n');
          currentSection = 'base';
          buffer = [];
        }
      } else if (line.startsWith('=======')) {
        if (currentConflict) {
          if (currentSection === 'base') {
            currentConflict.base = buffer.join('\n');
          } else {
            currentConflict.local = buffer.join('\n');
          }
          currentSection = 'remote';
          buffer = [];
        }
      } else if (line.startsWith('>>>>>>> ')) {
        if (currentConflict) {
          currentConflict.remote = buffer.join('\n');
          conflicts.push(currentConflict as ConflictSection);
          currentConflict = null;
          currentSection = null;
          buffer = [];
        }
      } else if (currentSection) {
        buffer.push(line);
      }
    }

    return conflicts;
  }

  async autoResolveNonConflicting(
    ourVersion: Version,
    theirVersion: Version
  ): Promise<MergeResult> {
    const detection = await this.detectConcurrentModifications(
      ourVersion,
      theirVersion
    );

    if (detection.autoMergeable.length === 0) {
      return {
        success: false,
        message: 'No auto-mergeable changes found',
        changes: []
      };
    }

    const mergedContent = {
      sections: [] as any[],
      ingredients: [] as any[],
      config: {}
    };

    const ourSections = new Map(ourVersion.content?.sections.map(s => [s.id, s]) || []);
    const theirSections = new Map(theirVersion.content?.sections.map(s => [s.id, s]) || []);

    for (const sectionId of detection.autoMergeable) {
      const ourSection = ourSections.get(sectionId);
      const theirSection = theirSections.get(sectionId);
      
      if (ourSection || theirSection) {
        mergedContent.sections.push(ourSection || theirSection);
      }
    }

    const mergedVersion = await this.versionService.createVersion(
      ourVersion.documentId,
      mergedContent,
      { userId: 'system', email: 'system', name: 'System', timestamp: new Date() },
      `Auto-merged ${detection.autoMergeable.length} non-conflicting changes`
    );

    return {
      success: true,
      mergedVersionId: mergedVersion.id,
      changes: [],
      message: `Successfully auto-merged ${detection.autoMergeable.length} changes`
    };
  }

  async applyMergeRequest(request: MergeRequest): Promise<MergeResult> {
    switch (request.strategy) {
      case 'fast-forward':
        return this.fastForwardMerge(request);
      case 'three-way':
        return this.threeWayMerge(request);
      case 'recursive':
        return this.recursiveMerge(request);
      default:
        return {
          success: false,
          message: `Unknown merge strategy: ${request.strategy}`,
          changes: []
        };
    }
  }

  private async fastForwardMerge(request: MergeRequest): Promise<MergeResult> {
    const sourceVersion = await this.versionService.getVersion(request.sourceVersionId);
    const targetVersion = await this.versionService.getVersion(request.targetVersionId);

    if (!sourceVersion || !targetVersion) {
      return {
        success: false,
        message: 'Source or target version not found',
        changes: []
      };
    }

    const mergedVersion = await this.versionService.createVersion(
      targetVersion.documentId,
      sourceVersion.content!,
      request.author,
      request.commitMessage
    );

    return {
      success: true,
      mergedVersionId: mergedVersion.id,
      changes: []
    };
  }

  private async threeWayMerge(request: MergeRequest): Promise<MergeResult> {
    return {
      success: false,
      message: 'Three-way merge not yet implemented',
      changes: []
    };
  }

  private async recursiveMerge(request: MergeRequest): Promise<MergeResult> {
    return {
      success: false,
      message: 'Recursive merge not yet implemented',
      changes: []
    };
  }
}