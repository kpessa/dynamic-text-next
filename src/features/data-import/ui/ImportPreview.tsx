import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { ImportData } from '../types/schemas'

interface ImportPreviewProps {
  data: unknown
  type: string
  itemCount: number
}

export const ImportPreview: React.FC<ImportPreviewProps> = ({ data, type, itemCount }) => {
  const getTypeLabel = () => {
    switch (type) {
      case 'ingredients':
        return 'Ingredients Import'
      case 'tpn':
        return 'TPN Configuration'
      case 'reference':
        return 'Reference Import'
      default:
        return 'Data Import'
    }
  }
  
  const getItemLabel = () => {
    switch (type) {
      case 'ingredients':
        return itemCount === 1 ? 'ingredient' : 'ingredients'
      case 'tpn':
        return 'configuration'
      case 'reference':
        return 'reference'
      default:
        return itemCount === 1 ? 'item' : 'items'
    }
  }
  
  const dataObj = data as ImportData & Record<string, unknown>
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>
          {getTypeLabel()}
        </Typography>
        <Chip label={type} size="small" color="primary" />
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        {itemCount} {getItemLabel()}
      </Typography>
      
      {'name' in dataObj && dataObj.name && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Name:</strong> {dataObj.name as string}
        </Typography>
      )}
      
      {'version' in dataObj && dataObj.version && (
        <Typography variant="body2">
          <strong>Version:</strong> {dataObj.version as string}
        </Typography>
      )}
      
      {type === 'ingredients' && 'ingredients' in dataObj && Array.isArray(dataObj.ingredients) && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Sample ingredients: {dataObj.ingredients.slice(0, 3).map((i: { name?: string }) => i.name).join(', ')}
            {dataObj.ingredients.length > 3 && ` ... and ${dataObj.ingredients.length - 3} more`}
          </Typography>
        </Box>
      )}
      
      {type === 'tpn' && 'advisorType' in dataObj && dataObj.advisorType && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Advisor Type:</strong> {dataObj.advisorType as string}
        </Typography>
      )}
      
      {type === 'reference' && 'reference' in dataObj && dataObj.reference && 
       typeof dataObj.reference === 'object' && 
       'healthSystem' in (dataObj.reference as Record<string, unknown>) && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Health System:</strong> {(dataObj.reference as { healthSystem?: string }).healthSystem}
        </Typography>
      )}
    </Box>
  )
}