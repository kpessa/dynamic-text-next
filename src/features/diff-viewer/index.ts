// UI Components
export { DiffViewer } from './ui/DiffViewer';
export { DiffControls } from './ui/DiffControls';
export { DiffViewerModal } from './ui/DiffViewerModal';
export { LinkingPanel } from './ui/LinkingPanel';

// Services
export { DiffEngine } from './lib/diffEngine';
export { ComparisonService } from './lib/comparisonService';
export { ContentProcessor } from './lib/contentProcessor';
export { ExportService } from './lib/exportService';
export { LinkingService } from './lib/linkingService';

// Redux
export {
  // Actions
  setIngredient,
  setViewMode,
  setShowIdentical,
  setGranularity,
  setComparisonMode,
  setSelectedPopulations,
  togglePopulation,
  setSelectedVersions,
  clearComparison,
  addToHistory,
  clearHistory,
  setExportInProgress,
  clearError,
  // Async thunks
  comparePopulations,
  compareVersions,
  performComparison,
  // Selectors
  selectCurrentComparison,
  selectCurrentIngredient,
  selectViewOptions,
  selectComparisonMode,
  selectSelectedPopulations,
  selectSelectedVersions,
  selectComparisonHistory,
  selectLoadingState,
  selectExportState
} from './model/diffSlice';

// Types
export type {
  DiffResult,
  DiffOptions,
  DiffStatistics,
  DiffChange
} from './lib/diffEngine';

export type {
  ComparisonResult,
  ComparisonPair,
  ComparisonRequest,
  PopulationType
} from './lib/comparisonService';

export type { DiffViewerState } from './model/diffSlice';

export type {
  LinkingResult,
  LinkingConflict,
  LinkingStatus,
  LinkingHistory,
  BulkLinkingOptions
} from './lib/linkingService';