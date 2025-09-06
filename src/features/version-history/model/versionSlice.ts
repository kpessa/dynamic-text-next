import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Version, 
  VersionFilterOptions, 
  ConflictSection,
  VersionComparisonResult 
} from '@/entities/version';
import { VersionStorage } from '../lib/versionStorage';
import { VersionService } from '../lib/versionService';
import { HistorySearchService, SearchResult } from '../lib/historySearch';
import { DiffEngine, DiffResult } from '../lib/diffEngine';

interface VersionState {
  currentVersion: Version | null;
  versionHistory: Version[];
  comparedVersions: {
    left: Version | null;
    right: Version | null;
  };
  diffResult: DiffResult | null;
  conflicts: ConflictSection[];
  searchResults: SearchResult[];
  loading: boolean;
  error: string | null;
  filters: VersionFilterOptions;
}

const initialState: VersionState = {
  currentVersion: null,
  versionHistory: [],
  comparedVersions: {
    left: null,
    right: null
  },
  diffResult: null,
  conflicts: [],
  searchResults: [],
  loading: false,
  error: null,
  filters: {}
};

export const fetchVersionHistory = createAsyncThunk(
  'version/fetchHistory',
  async (documentId: string) => {
    const storage = VersionStorage.getInstance();
    return await storage.getVersionHistory(documentId);
  }
);

export const loadVersion = createAsyncThunk(
  'version/load',
  async (versionId: string) => {
    const storage = VersionStorage.getInstance();
    return await storage.getVersion(versionId);
  }
);

export const saveVersion = createAsyncThunk(
  'version/save',
  async (params: {
    documentId: string;
    content: any;
    commitMessage?: string;
    author: any;
  }) => {
    const service = VersionService.getInstance();
    const version = await service.createVersion(
      params.documentId,
      params.content,
      params.author,
      params.commitMessage
    );
    
    const storage = VersionStorage.getInstance();
    await storage.saveVersion(version);
    
    return version;
  }
);

export const compareVersions = createAsyncThunk(
  'version/compare',
  async (params: { leftId: string; rightId: string }) => {
    const storage = VersionStorage.getInstance();
    const diffEngine = new DiffEngine();
    
    const left = await storage.getVersion(params.leftId);
    const right = await storage.getVersion(params.rightId);
    
    if (!left || !right) {
      throw new Error('Versions not found');
    }
    
    const leftContent = JSON.stringify(left.content);
    const rightContent = JSON.stringify(right.content);
    
    const diffResult = diffEngine.computeDiff(leftContent, rightContent);
    
    return {
      left,
      right,
      diffResult
    };
  }
);

export const searchVersions = createAsyncThunk(
  'version/search',
  async (params: { documentId: string; filters: VersionFilterOptions }) => {
    const searchService = HistorySearchService.getInstance();
    return await searchService.searchVersionHistory(
      params.documentId,
      params.filters
    );
  }
);

export const restoreVersion = createAsyncThunk(
  'version/restore',
  async (params: {
    versionId: string;
    createBackup: boolean;
    author: any;
  }) => {
    const { RestorationService } = await import('../lib/restorationService');
    const service = RestorationService.getInstance();
    
    const result = await service.restoreVersion(
      {
        targetVersionId: params.versionId,
        createBackup: params.createBackup,
        mergeStrategy: 'overwrite'
      },
      params.author
    );
    
    if (!result.success) {
      throw new Error(result.message || 'Restore failed');
    }
    
    return result.restoredVersion;
  }
);

const versionSlice = createSlice({
  name: 'version',
  initialState,
  reducers: {
    setCurrentVersion: (state, action: PayloadAction<Version | null>) => {
      state.currentVersion = action.payload;
    },
    setComparedVersions: (state, action: PayloadAction<{
      left: Version | null;
      right: Version | null;
    }>) => {
      state.comparedVersions = action.payload;
    },
    setFilters: (state, action: PayloadAction<VersionFilterOptions>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setConflicts: (state, action: PayloadAction<ConflictSection[]>) => {
      state.conflicts = action.payload;
    },
    resolveConflict: (state, action: PayloadAction<{
      sectionId: string;
      resolution: 'local' | 'remote' | 'manual';
      resolved?: string;
    }>) => {
      const conflict = state.conflicts.find(
        c => c.sectionId === action.payload.sectionId
      );
      
      if (conflict) {
        conflict.resolution = action.payload.resolution;
        conflict.resolved = action.payload.resolved;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVersionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVersionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.versionHistory = action.payload;
      })
      .addCase(fetchVersionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch version history';
      })
      
      .addCase(loadVersion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVersion.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentVersion = action.payload;
        }
      })
      .addCase(loadVersion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load version';
      })
      
      .addCase(saveVersion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveVersion.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVersion = action.payload;
        state.versionHistory = [action.payload, ...state.versionHistory];
      })
      .addCase(saveVersion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save version';
      })
      
      .addCase(compareVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(compareVersions.fulfilled, (state, action) => {
        state.loading = false;
        state.comparedVersions = {
          left: action.payload.left,
          right: action.payload.right
        };
        state.diffResult = action.payload.diffResult;
      })
      .addCase(compareVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to compare versions';
      })
      
      .addCase(searchVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchVersions.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Search failed';
      })
      
      .addCase(restoreVersion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreVersion.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentVersion = action.payload;
          state.versionHistory = [action.payload, ...state.versionHistory];
        }
      })
      .addCase(restoreVersion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Restore failed';
      });
  }
});

export const {
  setCurrentVersion,
  setComparedVersions,
  setFilters,
  clearError,
  clearSearchResults,
  setConflicts,
  resolveConflict
} = versionSlice.actions;

export const selectCurrentVersion = (state: { version: VersionState }) => 
  state.version.currentVersion;

export const selectVersionHistory = (state: { version: VersionState }) => 
  state.version.versionHistory;

export const selectComparedVersions = (state: { version: VersionState }) => 
  state.version.comparedVersions;

export const selectDiffResult = (state: { version: VersionState }) => 
  state.version.diffResult;

export const selectConflicts = (state: { version: VersionState }) => 
  state.version.conflicts;

export const selectSearchResults = (state: { version: VersionState }) => 
  state.version.searchResults;

export const selectVersionLoading = (state: { version: VersionState }) => 
  state.version.loading;

export const selectVersionError = (state: { version: VersionState }) => 
  state.version.error;

export default versionSlice.reducer;