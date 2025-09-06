// UI Components
export {
  SharedIngredientManager,
  DuplicateReportModal,
  ConflictResolutionDialog,
  MigrationWizard
} from './ui';

// Redux
export {
  fetchSharedIngredients,
  detectDuplicates,
  updateReferenceCount,
  syncIngredient,
  migrateIngredients,
  setSelectedIngredient,
  addConflict,
  resolveConflict,
  setFilters,
  clearError,
  updateLocalIngredient,
  selectSharedIngredients,
  selectSelectedIngredient,
  selectDuplicateGroups,
  selectConflicts,
  selectSyncStatus,
  selectMigrationStatus
} from './model/sharedIngredientSlice';

// Services
export { DeduplicationService } from './lib/deduplicationService';
export { ReferenceCountingService } from './lib/referenceCountingService';
export { SyncService } from './lib/syncService';
export { PermissionService } from './lib/permissionService';
export { MigrationService } from './lib/migrationService';
export { ConflictResolver } from './lib/conflictResolver';