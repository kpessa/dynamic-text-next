// Public API for AI Test Generation feature

// Services
export { default as AIService } from './lib/aiService';
export { TestGenerator } from './lib/testGenerator';
export { VariableAnalyzer } from './lib/variableAnalyzer';
export { BatchProcessor } from './lib/batchProcessor';
export { TestRefinementService } from './lib/testRefinement';
export { ContextEnhancementService } from './lib/contextService';

// Redux
export { 
  default as aiTestReducer,
  generateTests,
  generateBatchTests,
  configureAI,
  clearError,
  clearHistory,
  saveGeneratedTests,
  updateTestQuality,
  refineTest,
  removeTest,
  selectIsGenerating,
  selectLastResponse,
  selectGenerationHistory,
  selectBatchProgress,
  selectError,
  selectIsConfigured,
  selectGeneratedTests,
  selectTestQuality
} from './model/aiTestSlice';

// UI Components
export { TestGeneratorModal } from './ui/TestGeneratorModal';
export { TestGeneratorButton } from './ui/TestGeneratorButton';
export { AIWorkflowInspector } from './ui/AIWorkflowInspector';

// Types
export type {
  AITestRequest,
  AITestResponse,
  TestCase,
  TestQualityMetrics,
  PopulationType,
  TPNAdvisorType,
  IngredientData,
  GenerationStep,
  GenerationHistory,
  BatchGenerationRequest,
  BatchGenerationProgress
} from './types';

export type { AIProvider } from './lib/aiService';
export type { VariableInfo, AnalysisResult } from './lib/variableAnalyzer';