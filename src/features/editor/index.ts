/**
 * Editor Feature Public API
 */

export {
  editorSlice,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  setActiveSection,
  addIngredient,
  removeIngredient,
  setIngredients,
  addIngredientToEditor,
  setTestResults,
  setPreviewContent,
  setDirty,
  resetEditor,
  loadDocument,
  selectSections,
  selectActiveSectionId,
  selectActiveSection,
  selectIngredients,
  selectTestResults,
  selectIsDirty,
  selectPreviewContent
} from './model/editorSlice'

export type { default as editorReducer } from './model/editorSlice'