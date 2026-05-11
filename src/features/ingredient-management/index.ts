// UI Components
export {
  IngredientList,
  IngredientEditor,
  IngredientSearch,
  IngredientFilterPanel,
  IngredientBulkActions
} from './ui'

// New Variant Management Components
export { IngredientVariantManager } from './ui/IngredientVariantManager'
export * from './ui/VariantStatusIndicators'

// Section Editor Feature (for FSD composition)
export { IngredientSectionEditorFeature } from './ui/IngredientSectionEditorFeature'

// Redux Store
export * from './store/variantSlice'

// Services
export {
  enhancedIngredientService,
  referenceRangeService,
  importExportService,
  bulkOperationsService,
  EnhancedIngredientService,
  ReferenceRangeService,
  ImportExportService,
  BulkOperationsService
} from './lib'

// New Variant Service
export { variantService, VariantService } from './lib/variantService'