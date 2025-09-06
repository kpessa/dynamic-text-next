import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CustomFunction, FunctionDocumentation } from '../types';
import { CustomFunctionService } from '../lib/customFunctionService';

interface FunctionUsageStats {
  functionName: string;
  count: number;
  lastUsed: Date;
}

interface FunctionError {
  functionName: string;
  error: string;
  timestamp: Date;
}

interface KPTState {
  customFunctions: CustomFunction[];
  publicFunctions: CustomFunction[];
  documentation: Record<string, FunctionDocumentation>;
  usageStats: Record<string, FunctionUsageStats>;
  errors: FunctionError[];
  isLoading: boolean;
  error: string | null;
  functionsLoaded: boolean;
}

const initialState: KPTState = {
  customFunctions: [],
  publicFunctions: [],
  documentation: {},
  usageStats: {},
  errors: [],
  isLoading: false,
  error: null,
  functionsLoaded: false
};

const service = CustomFunctionService.getInstance();

// Async thunks
export const loadCustomFunctions = createAsyncThunk(
  'kpt/loadCustomFunctions',
  async () => {
    const functions = await service.getAllFunctions();
    await service.loadAllFunctions();
    return functions;
  }
);

export const loadPublicFunctions = createAsyncThunk(
  'kpt/loadPublicFunctions',
  async () => {
    return await service.getPublicFunctions();
  }
);

export const createCustomFunction = createAsyncThunk(
  'kpt/createCustomFunction',
  async (func: Omit<CustomFunction, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await service.createFunction(func);
  }
);

export const updateCustomFunction = createAsyncThunk(
  'kpt/updateCustomFunction',
  async ({ id, updates }: { id: string; updates: Partial<CustomFunction> }) => {
    return await service.updateFunction(id, updates);
  }
);

export const deleteCustomFunction = createAsyncThunk(
  'kpt/deleteCustomFunction',
  async (id: string) => {
    await service.deleteFunction(id);
    return id;
  }
);

export const loadFunctionsByCategory = createAsyncThunk(
  'kpt/loadFunctionsByCategory',
  async (category: string) => {
    return await service.getFunctionsByCategory(category);
  }
);

const kptSlice = createSlice({
  name: 'kpt',
  initialState,
  reducers: {
    trackFunctionUsage: (state, action: PayloadAction<string>) => {
      const functionName = action.payload;
      const existing = state.usageStats[functionName];
      
      if (existing) {
        existing.count++;
        existing.lastUsed = new Date();
      } else {
        state.usageStats[functionName] = {
          functionName,
          count: 1,
          lastUsed: new Date()
        };
      }
    },

    recordFunctionError: (
      state,
      action: PayloadAction<{ functionName: string; error: string }>
    ) => {
      state.errors.push({
        functionName: action.payload.functionName,
        error: action.payload.error,
        timestamp: new Date()
      });

      // Keep only last 100 errors
      if (state.errors.length > 100) {
        state.errors = state.errors.slice(-100);
      }
    },

    clearErrors: (state) => {
      state.errors = [];
    },

    addDocumentation: (
      state,
      action: PayloadAction<FunctionDocumentation>
    ) => {
      state.documentation[action.payload.name] = action.payload;
    },

    setFunctionsLoaded: (state, action: PayloadAction<boolean>) => {
      state.functionsLoaded = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Load custom functions
    builder
      .addCase(loadCustomFunctions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCustomFunctions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customFunctions = action.payload;
        state.functionsLoaded = true;
      })
      .addCase(loadCustomFunctions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load custom functions';
      });

    // Load public functions
    builder
      .addCase(loadPublicFunctions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadPublicFunctions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publicFunctions = action.payload;
      })
      .addCase(loadPublicFunctions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load public functions';
      });

    // Create custom function
    builder
      .addCase(createCustomFunction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomFunction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customFunctions.push(action.payload);
      })
      .addCase(createCustomFunction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create custom function';
      });

    // Update custom function
    builder
      .addCase(updateCustomFunction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomFunction.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.customFunctions.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.customFunctions[index] = action.payload;
        }
      })
      .addCase(updateCustomFunction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update custom function';
      });

    // Delete custom function
    builder
      .addCase(deleteCustomFunction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomFunction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customFunctions = state.customFunctions.filter(f => f.id !== action.payload);
      })
      .addCase(deleteCustomFunction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete custom function';
      });

    // Load functions by category
    builder
      .addCase(loadFunctionsByCategory.fulfilled, (state, action) => {
        // Merge with existing functions, avoiding duplicates
        const existingIds = new Set(state.customFunctions.map(f => f.id));
        const newFunctions = action.payload.filter(f => !existingIds.has(f.id));
        state.customFunctions = [...state.customFunctions, ...newFunctions];
      });
  }
});

export const {
  trackFunctionUsage,
  recordFunctionError,
  clearErrors,
  addDocumentation,
  setFunctionsLoaded
} = kptSlice.actions;

// Selectors
export const selectCustomFunctions = (state: { kpt: KPTState }) => state.kpt.customFunctions;
export const selectPublicFunctions = (state: { kpt: KPTState }) => state.kpt.publicFunctions;
export const selectFunctionDocumentation = (state: { kpt: KPTState }, name: string) => 
  state.kpt.documentation[name];
export const selectUsageStats = (state: { kpt: KPTState }) => state.kpt.usageStats;
export const selectTopUsedFunctions = (state: { kpt: KPTState }, limit: number = 10) => {
  const stats = Object.values(state.kpt.usageStats);
  return stats
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};
export const selectRecentErrors = (state: { kpt: KPTState }, limit: number = 10) => 
  state.kpt.errors.slice(-limit);
export const selectIsLoading = (state: { kpt: KPTState }) => state.kpt.isLoading;
export const selectError = (state: { kpt: KPTState }) => state.kpt.error;
export const selectFunctionsLoaded = (state: { kpt: KPTState }) => state.kpt.functionsLoaded;

export const selectFunctionsByCategory = (state: { kpt: KPTState }, category: string) =>
  state.kpt.customFunctions.filter(f => f.category === category);

export default kptSlice.reducer;