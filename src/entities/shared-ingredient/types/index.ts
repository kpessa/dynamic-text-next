import { 
  Ingredient, 
  IngredientType, 
  ReferenceRange,
  PopulationType 
} from '@/entities/ingredient/types';

export type PermissionLevel = 'view' | 'edit' | 'admin';
export type SharingScope = 'private' | 'organization' | 'public';

export interface SharedIngredientMetadata {
  createdBy: string;
  createdAt: Date;
  modifiedBy: string;
  modifiedAt: Date;
  version: number;
  isPublic: boolean;
  organizationId?: string;
  departmentId?: string;
  tags?: string[];
}

export interface UsageStatistics {
  referenceCount: number;
  lastUsed: Date;
  references: Array<{
    id: string;
    name: string;
    type: string;
    userId?: string;
    timestamp?: Date;
  }>;
  viewCount?: number;
  copyCount?: number;
}

export interface IngredientCustomization {
  referenceId: string;
  userId: string;
  overrides: Partial<Ingredient>;
  reason?: string;
  appliedAt: Date;
  approvedBy?: string;
}

export interface IngredientPermissions {
  view: string[];    // User IDs or role names who can view
  edit: string[];    // User IDs or role names who can edit
  admin: string[];   // User IDs or role names who can admin
  inherit: boolean;  // Inherit from organization
  scope: SharingScope;
  allowCustomization: boolean;
  requireApproval: boolean;
}

export interface SharedIngredient extends Ingredient {
  masterId: string;
  isActive: boolean;
  metadata: SharedIngredientMetadata;
  usage: UsageStatistics;
  permissions: IngredientPermissions;
  customizations?: IngredientCustomization[];
  parentId?: string; // For forked ingredients
  children?: string[]; // IDs of forked versions
  contentHash?: string; // For deduplication
}

export interface MasterIngredient {
  id: string;
  name: string;
  keyname: string;
  type: IngredientType;
  category: string;
  unit: string;
  referenceRanges: ReferenceRange[];
  isDeprecated?: boolean;
  replacementId?: string;
  lockedFields?: string[]; // Fields that can't be customized
}

export interface DuplicateGroup {
  master: SharedIngredient;
  duplicates: SharedIngredient[];
  similarity: number; // 0-1 score
  suggestion?: MergeSuggestion;
}

export interface MergeSuggestion {
  targetId: string;
  sourceIds: string[];
  mergedData: Partial<SharedIngredient>;
  conflictingFields: string[];
  autoResolvable: boolean;
}

export interface SyncOperation {
  id: string;
  ingredientId: string;
  type: 'create' | 'update' | 'delete';
  changes: Partial<SharedIngredient>;
  timestamp: number;
  retries: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  error?: string;
}

export interface SyncConflict {
  ingredientId: string;
  localVersion: SharedIngredient;
  serverVersion: SharedIngredient;
  detectedAt: Date;
  resolution?: 'local' | 'server' | 'merge';
  resolvedData?: SharedIngredient;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface MigrationPlan {
  id: string;
  name: string;
  description?: string;
  sourceIngredients: string[];
  targetRepository: string;
  options: MigrationOptions;
  preview?: MigrationPreview;
  status: 'draft' | 'ready' | 'in-progress' | 'completed' | 'failed';
  createdBy: string;
  createdAt: Date;
  executedAt?: Date;
  completedAt?: Date;
}

export interface MigrationOptions {
  deduplication: boolean;
  preserveCustomizations: boolean;
  updateReferences: boolean;
  mergeStrategy: 'replace' | 'merge' | 'skip';
  permissionTemplate?: IngredientPermissions;
  dryRun: boolean;
}

export interface MigrationPreview {
  totalIngredients: number;
  duplicatesFound: number;
  conflictsDetected: number;
  referencesToUpdate: number;
  estimatedTime: number;
  changes: Array<{
    ingredientId: string;
    action: 'create' | 'update' | 'merge' | 'skip';
    reason: string;
  }>;
}

export interface MigrationResult {
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  merged: number;
  skipped: number;
  failed: number;
  errors?: Array<{
    ingredientId: string;
    error: string;
  }>;
  rollbackAvailable: boolean;
  rollbackId?: string;
}

export interface AuditLogEntry {
  id: string;
  ingredientId: string;
  action: 'create' | 'update' | 'delete' | 'share' | 'unshare' | 'customize' | 'merge';
  userId: string;
  timestamp: Date;
  changes?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SharedIngredientFilter {
  searchTerm?: string;
  types?: IngredientType[];
  categories?: string[];
  populations?: PopulationType[];
  organizationId?: string;
  isPublic?: boolean;
  hasCustomizations?: boolean;
  modifiedAfter?: Date;
  modifiedBy?: string;
  minReferenceCount?: number;
  tags?: string[];
  scope?: SharingScope;
}

export interface SharedIngredientStats {
  totalShared: number;
  totalCustomizations: number;
  totalReferences: number;
  mostUsed: Array<{
    ingredientId: string;
    name: string;
    count: number;
  }>;
  recentlyModified: Array<{
    ingredientId: string;
    name: string;
    modifiedAt: Date;
    modifiedBy: string;
  }>;
  duplicateGroups: number;
  orphanedIngredients: number;
}

export interface IngredientRelationship {
  parentId: string;
  childId: string;
  type: 'fork' | 'variant' | 'replacement';
  createdAt: Date;
  createdBy: string;
  reason?: string;
}