import { Section } from '@/entities/section/types';
import { Ingredient } from '@/entities/ingredient/types';

export interface VersionMetadata {
  createdAt: Date;
  createdBy: string;
  commitMessage?: string;
  changesSummary: string;
  size: number;
  branch?: string;
  tags?: string[];
}

export interface VersionDiff {
  added: number;
  removed: number;
  modified: number;
  patches?: DiffPatch[];
}

export interface DiffPatch {
  type: 'add' | 'remove' | 'modify';
  path: string;
  oldValue?: any;
  newValue?: any;
  lineNumber?: number;
}

export interface Version {
  id: string;
  documentId: string;
  version: number;
  parentVersionId?: string;
  content?: {
    sections: Section[];
    ingredients?: Ingredient[];
    config?: any;
  };
  metadata: VersionMetadata;
  diff?: VersionDiff;
  baseVersionId?: string;
  isBaseline?: boolean;
  checksum?: string;
}

export interface VersionRelationship {
  id: string;
  parentId?: string;
  childIds: string[];
  branchName?: string;
  mergedIntoId?: string;
  isMerged: boolean;
}

export interface ConflictInfo {
  id: string;
  versionIds: string[];
  sections: ConflictSection[];
  resolvedVersionId?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface ConflictSection {
  sectionId: string;
  local: string;
  remote: string;
  base: string;
  resolved?: string;
  resolution?: 'local' | 'remote' | 'manual' | 'auto';
}

export interface ChangeAuthor {
  userId: string;
  email: string;
  name: string;
  timestamp: Date;
}

export interface ChangeTracking {
  type: 'section' | 'ingredient' | 'config';
  action: 'create' | 'update' | 'delete';
  entityId: string;
  oldValue?: any;
  newValue?: any;
  author: ChangeAuthor;
  timestamp: Date;
  description?: string;
}

export interface VersionComparisonResult {
  leftVersion: Version;
  rightVersion: Version;
  changes: ChangeTracking[];
  diff: VersionDiff;
  conflicts?: ConflictSection[];
}

export interface VersionFilterOptions {
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  branch?: string;
  tags?: string[];
  searchQuery?: string;
  includeDeleted?: boolean;
}

export interface VersionRestoreOptions {
  targetVersionId: string;
  createBackup: boolean;
  mergeStrategy?: 'overwrite' | 'merge' | 'branch';
  commitMessage?: string;
}

export interface VersionStorageInfo {
  storageType: 'full' | 'diff';
  compressionType?: 'gzip' | 'brotli' | 'none';
  size: number;
  checksum: string;
}

export interface VersionBranch {
  id: string;
  name: string;
  baseVersionId: string;
  headVersionId: string;
  createdAt: Date;
  createdBy: string;
  isDefault: boolean;
  isMerged: boolean;
  mergedIntoId?: string;
}

export interface MergeRequest {
  sourceVersionId: string;
  targetVersionId: string;
  strategy: 'fast-forward' | 'three-way' | 'recursive';
  conflictResolution?: 'manual' | 'theirs' | 'ours';
  commitMessage: string;
  author: ChangeAuthor;
}

export interface MergeResult {
  success: boolean;
  mergedVersionId?: string;
  conflicts?: ConflictSection[];
  changes: ChangeTracking[];
  message?: string;
}