import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  AITestRequest, 
  AITestResponse, 
  BatchGenerationProgress,
  GenerationHistory,
  TestCase 
} from '../types';
import AIService, { AIProvider } from '../lib/aiService';
import { TestGenerator } from '../lib/testGenerator';

interface AITestState {
  isGenerating: boolean;
  currentRequest: AITestRequest | null;
  lastResponse: AITestResponse | null;
  generationHistory: GenerationHistory[];
  batchProgress: BatchGenerationProgress | null;
  error: string | null;
  aiProvider: AIProvider;
  apiKey: string | null;
  isConfigured: boolean;
  generatedTests: Record<string, TestCase[]>;
  testQuality: Record<string, number>;
}

const initialState: AITestState = {
  isGenerating: false,
  currentRequest: null,
  lastResponse: null,
  generationHistory: [],
  batchProgress: null,
  error: null,
  aiProvider: 'openai',
  apiKey: null,
  isConfigured: false,
  generatedTests: {},
  testQuality: {}
};

// Async thunks
export const generateTests = createAsyncThunk(
  'aiTest/generate',
  async (request: AITestRequest) => {
    const aiService = AIService.getInstance();
    const testGenerator = new TestGenerator(aiService);
    
    const startTime = Date.now();
    const response = await testGenerator.generateTestCases(
      request.sectionContent,
      request.sectionType,
      request
    );
    const endTime = Date.now();
    
    return {
      request,
      response,
      duration: endTime - startTime
    };
  }
);

export const generateBatchTests = createAsyncThunk(
  'aiTest/generateBatch',
  async (
    batch: {
      sections: Array<{ id: string | number; content: string; type: 'static' | 'dynamic' }>;
      options?: Partial<AITestRequest>;
    },
    { dispatch }
  ) => {
    const aiService = AIService.getInstance();
    const testGenerator = new TestGenerator(aiService);
    const results: Record<string | number, AITestResponse | Error> = {};
    
    for (let i = 0; i < batch.sections.length; i++) {
      const section = batch.sections[i];
      
      dispatch(updateBatchProgress({
        total: batch.sections.length,
        completed: i,
        failed: Object.values(results).filter(r => r instanceof Error).length,
        currentSection: section.id.toString(),
        results
      }));
      
      try {
        const response = await testGenerator.generateTestCases(
          section.content,
          section.type,
          batch.options
        );
        results[section.id] = response;
      } catch (error) {
        results[section.id] = error as Error;
      }
    }
    
    return {
      total: batch.sections.length,
      completed: batch.sections.length,
      failed: Object.values(results).filter(r => r instanceof Error).length,
      results
    };
  }
);

const aiTestSlice = createSlice({
  name: 'aiTest',
  initialState,
  reducers: {
    configureAI: (state, action: PayloadAction<{ provider: AIProvider; apiKey: string }>) => {
      state.aiProvider = action.payload.provider;
      state.apiKey = action.payload.apiKey;
      state.isConfigured = true;
      
      // Initialize AI service
      AIService.initialize({
        provider: action.payload.provider,
        apiKey: action.payload.apiKey
      });
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    clearHistory: (state) => {
      state.generationHistory = [];
    },
    
    addToHistory: (state, action: PayloadAction<GenerationHistory>) => {
      state.generationHistory.unshift(action.payload);
      if (state.generationHistory.length > 50) {
        state.generationHistory = state.generationHistory.slice(0, 50);
      }
    },
    
    updateBatchProgress: (state, action: PayloadAction<BatchGenerationProgress>) => {
      state.batchProgress = action.payload;
    },
    
    clearBatchProgress: (state) => {
      state.batchProgress = null;
    },
    
    saveGeneratedTests: (state, action: PayloadAction<{ sectionId: string; tests: TestCase[] }>) => {
      state.generatedTests[action.payload.sectionId] = action.payload.tests;
    },
    
    updateTestQuality: (state, action: PayloadAction<{ sectionId: string; quality: number }>) => {
      state.testQuality[action.payload.sectionId] = action.payload.quality;
    },
    
    refineTest: (state, action: PayloadAction<{ sectionId: string; testId: string; updates: Partial<TestCase> }>) => {
      const tests = state.generatedTests[action.payload.sectionId];
      if (tests) {
        const testIndex = tests.findIndex(t => t.id === action.payload.testId);
        if (testIndex !== -1) {
          tests[testIndex] = { ...tests[testIndex], ...action.payload.updates };
        }
      }
    },
    
    removeTest: (state, action: PayloadAction<{ sectionId: string; testId: string }>) => {
      const tests = state.generatedTests[action.payload.sectionId];
      if (tests) {
        state.generatedTests[action.payload.sectionId] = tests.filter(t => t.id !== action.payload.testId);
      }
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Generate tests
      .addCase(generateTests.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateTests.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.lastResponse = action.payload.response;
        state.currentRequest = action.payload.request;
        
        // Add to history
        const historyEntry: GenerationHistory = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          request: action.payload.request,
          response: action.payload.response,
          steps: [], // Would be populated by workflow inspector
          duration: action.payload.duration
        };
        state.generationHistory.unshift(historyEntry);
        
        // Keep history size manageable
        if (state.generationHistory.length > 50) {
          state.generationHistory = state.generationHistory.slice(0, 50);
        }
      })
      .addCase(generateTests.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to generate tests';
      })
      
      // Batch generation
      .addCase(generateBatchTests.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
        state.batchProgress = {
          total: 0,
          completed: 0,
          failed: 0,
          results: {}
        };
      })
      .addCase(generateBatchTests.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.batchProgress = action.payload;
      })
      .addCase(generateBatchTests.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Batch generation failed';
      });
  }
});

export const {
  configureAI,
  clearError,
  clearHistory,
  addToHistory,
  updateBatchProgress,
  clearBatchProgress,
  saveGeneratedTests,
  updateTestQuality,
  refineTest,
  removeTest
} = aiTestSlice.actions;

// Selectors
export const selectIsGenerating = (state: { aiTest: AITestState }) => state.aiTest.isGenerating;
export const selectLastResponse = (state: { aiTest: AITestState }) => state.aiTest.lastResponse;
export const selectGenerationHistory = (state: { aiTest: AITestState }) => state.aiTest.generationHistory;
export const selectBatchProgress = (state: { aiTest: AITestState }) => state.aiTest.batchProgress;
export const selectError = (state: { aiTest: AITestState }) => state.aiTest.error;
export const selectIsConfigured = (state: { aiTest: AITestState }) => state.aiTest.isConfigured;
export const selectGeneratedTests = (state: { aiTest: AITestState }, sectionId: string) => 
  state.aiTest.generatedTests[sectionId] || [];
export const selectTestQuality = (state: { aiTest: AITestState }, sectionId: string) => 
  state.aiTest.testQuality[sectionId] || 0;

export default aiTestSlice.reducer;