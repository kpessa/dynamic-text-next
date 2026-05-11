/**
 * Ingredient Section Editor Feature
 * Self-contained feature for editing ingredient sections
 * This feature component handles its own logic and can be composed by widgets
 */

import React from 'react'
import { SectionEditor } from './SectionEditor'
import type { Ingredient } from '@/entities/ingredient/types'

interface IngredientSectionEditorFeatureProps {
  ingredient: Ingredient
  onSave?: (sections: any[]) => void
  onCancel?: () => void
}

export const IngredientSectionEditorFeature: React.FC<IngredientSectionEditorFeatureProps> = ({
  ingredient,
  onSave,
  onCancel
}) => {
  // Feature-specific logic stays here
  // The widget just composes this feature
  return (
    <SectionEditor
      ingredient={ingredient}
      onSave={onSave}
      onCancel={onCancel}
    />
  )
}

export default IngredientSectionEditorFeature