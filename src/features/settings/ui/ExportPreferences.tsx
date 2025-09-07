import React from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Chip
} from '@mui/material'
import {
  FileDownload as ExportIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Code as JsonIcon,
  Description as CsvIcon,
  Info as MetadataIcon,
  Schedule as TimestampIcon,
  Compress as CompressIcon
} from '@mui/icons-material'

interface ExportPreferencesProps {
  settings: {
    defaultExportFormat: 'pdf' | 'excel' | 'csv' | 'json'
    includeMetadata: boolean
    includeTimestamp: boolean
    compressExports: boolean
  }
  onChange: (key: string, value: any) => void
}

export const ExportPreferences: React.FC<ExportPreferencesProps> = ({
  settings,
  onChange
}) => {
  const exportFormats = [
    { 
      value: 'pdf', 
      label: 'PDF Document', 
      icon: <PdfIcon fontSize="small" />,
      description: 'Best for printing and sharing'
    },
    { 
      value: 'excel', 
      label: 'Excel Spreadsheet', 
      icon: <ExcelIcon fontSize="small" />,
      description: 'Best for data analysis'
    },
    { 
      value: 'csv', 
      label: 'CSV File', 
      icon: <CsvIcon fontSize="small" />,
      description: 'Universal data format'
    },
    { 
      value: 'json', 
      label: 'JSON Format', 
      icon: <JsonIcon fontSize="small" />,
      description: 'For system integration'
    }
  ]

  const selectedFormat = exportFormats.find(f => f.value === settings.defaultExportFormat)

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Export Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure default export settings and formats
      </Typography>

      <Grid container spacing={3}>
        {/* Default Export Format */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ExportIcon fontSize="small" color="action" />
                  <Typography variant="subtitle1">Default Export Format</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Preferred format for exporting data
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {exportFormats.map((format) => (
                  <Grid item xs={12} sm={6} md={3} key={format.value}>
                    <Paper
                      variant={settings.defaultExportFormat === format.value ? 'elevation' : 'outlined'}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: settings.defaultExportFormat === format.value ? 'primary.main' : 'background.paper',
                        color: settings.defaultExportFormat === format.value ? 'primary.contrastText' : 'text.primary',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: settings.defaultExportFormat === format.value ? 'primary.dark' : 'action.hover'
                        }
                      }}
                      onClick={() => onChange('defaultExportFormat', format.value)}
                    >
                      <Stack spacing={1} alignItems="center" textAlign="center">
                        {format.icon}
                        <Typography variant="body2" fontWeight="medium">
                          {format.label}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {format.description}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {selectedFormat && (
                <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {selectedFormat.icon}
                    <Typography variant="body2">
                      Currently selected: <strong>{selectedFormat.label}</strong>
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Export Options */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Export Options
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Additional data to include in exports
            </Typography>
            
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.includeMetadata}
                    onChange={(e) => onChange('includeMetadata', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MetadataIcon fontSize="small" />
                      <Typography>Include Metadata</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Add document properties, author, and version information
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.includeTimestamp}
                    onChange={(e) => onChange('includeTimestamp', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimestampIcon fontSize="small" />
                      <Typography>Include Timestamp</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Add creation date and time to exported files
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.compressExports}
                    onChange={(e) => onChange('compressExports', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CompressIcon fontSize="small" />
                      <Typography>Compress Exports</Typography>
                      <Chip label="ZIP" size="small" variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Automatically compress large exports to reduce file size
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Paper>
        </Grid>

        {/* File Naming Convention */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              File Naming Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Example of how your exported files will be named
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
              <Typography variant="body2">
                {`ingredient_export`}
                {settings.includeTimestamp && '_2024-01-31_14-30'}
                {`.${settings.defaultExportFormat}`}
                {settings.compressExports && '.zip'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}