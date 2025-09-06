export { VersionHistory } from './ui/VersionHistory';
export { DiffViewer } from './ui/DiffViewer';
export { CommitMessageDialog } from './ui/CommitMessageDialog';
export { ConflictResolver } from './ui/ConflictResolver';

export { VersionService } from './lib/versionService';
export { VersionStorage } from './lib/versionStorage';
export { DiffEngine } from './lib/diffEngine';
export { RestorationService } from './lib/restorationService';
export { HistorySearchService } from './lib/historySearch';
export { ConflictResolutionService } from './lib/conflictResolution';

export {
  fetchVersionHistory,
  loadVersion,
  saveVersion,
  compareVersions,
  searchVersions,
  restoreVersion,
  selectCurrentVersion,
  selectVersionHistory,
  selectComparedVersions,
  selectDiffResult,
  selectConflicts,
  selectSearchResults,
  selectVersionLoading,
  selectVersionError
} from './model/versionSlice';

export type {
  DiffResult,
  DiffHunk,
  DiffLine,
  DiffStats,
  DiffViewOptions
} from './lib/diffEngine';

export type {
  SearchResult,
  SearchMatch
} from './lib/historySearch';

export type {
  RestoreResult,
  RollbackOptions
} from './lib/restorationService';

export type {
  ConflictDetectionResult
} from './lib/conflictResolution';

export type {
  ChangesSummary
} from './ui/CommitMessageDialog';