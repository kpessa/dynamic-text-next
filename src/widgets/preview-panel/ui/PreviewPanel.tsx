/**
 * Preview Panel Widget
 * Real-time preview of document output
 */

import React, { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Tooltip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useAppSelector } from '@/app/hooks'
import { selectSections } from '@/features/editor/model/editorSlice'
import { SecureCodeExecutor } from '@/shared/lib/code-executor'

interface PreviewPanelProps {
  onToggle?: () => void
}

interface SectionOutput {
  id: number
  name: string
  content: string
  error?: string
  isLoading?: boolean
  isHtml?: boolean
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ onToggle }) => {
  const sections = useAppSelector(selectSections)
  const [outputs, setOutputs] = useState<SectionOutput[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const executor = useMemo(() => new SecureCodeExecutor(), [])

  React.useEffect(() => {
    processAllSections()
  }, [sections])

  const processAllSections = async () => {
    setIsProcessing(true)
    const newOutputs: SectionOutput[] = []
    
    // Mock TPN context for demo
    const context = {
      values: {
        weight: 70,
        height: 175,
        age: 35,
        glucose: 100,
        protein: 50
      },
      advisorType: 'ADULT' as const
    }

    for (const section of sections) {
      const output: SectionOutput = {
        id: section.id,
        name: section.name,
        content: '',
        isLoading: true
      }

      try {
        if (section.type === 'dynamic') {
          // Execute dynamic code
          const result = await executor.execute(section.content, context)
          if (result.error) {
            output.error = result.error
            output.content = ''
          } else {
            output.content = String(result.value || '')
            // Check if dynamic code returned HTML
            output.isHtml = /<[^>]+>/.test(output.content)
          }
        } else {
          // Process static text with placeholders
          let processedContent = section.content
          // Replace placeholders like {{variable}}
          Object.entries(context.values).forEach(([key, value]) => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
            processedContent = processedContent.replace(regex, String(value))
          })
          output.content = processedContent
          // Static sections are treated as HTML to allow formatting
          output.isHtml = true
        }
      } catch (error) {
        output.error = error instanceof Error ? error.message : 'Unknown error'
        output.content = ''
      } finally {
        output.isLoading = false
      }

      newOutputs.push(output)
    }

    setOutputs(newOutputs)
    setIsProcessing(false)
  }

  const handleRefresh = () => {
    processAllSections()
  }

  const handleCopyAll = () => {
    const fullOutput = outputs
      .map(o => `${o.name}:\n${o.content || o.error || ''}`)
      .join('\n\n')
    
    navigator.clipboard.writeText(fullOutput).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  const getCombinedOutput = () => {
    return outputs
      .filter(o => o.content && !o.error)
      .map(o => o.content)
      .join('\n')
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Preview
        </Typography>
        <Tooltip title="Refresh preview">
          <IconButton onClick={handleRefresh} size="small" disabled={isProcessing}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={copySuccess ? 'Copied!' : 'Copy all'}>
          <IconButton onClick={handleCopyAll} size="small">
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
        {onToggle && (
          <IconButton onClick={onToggle} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Preview Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isProcessing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!isProcessing && sections.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary">
              No sections to preview. Add sections in the editor to see output here.
            </Typography>
          </Paper>
        )}

        {!isProcessing && sections.length > 0 && (
          <>
            {/* Combined Output */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Combined Output
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  '& p': { margin: '0.5em 0' },
                  '& ul, & ol': { paddingLeft: '1.5em' },
                  '& h1, & h2, & h3, & h4, & h5, & h6': { margin: '0.5em 0' }
                }}
                dangerouslySetInnerHTML={{ 
                  __html: getCombinedOutput() || '<p style="color: #666;">No output generated</p>' 
                }}
              />
            </Paper>

            {/* Individual Section Outputs */}
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Section Outputs
            </Typography>
            {outputs.map((output) => (
              <Paper
                key={output.id}
                sx={{
                  p: 2,
                  mb: 1,
                  bgcolor: output.error ? 'error.light' : 'background.paper',
                  opacity: output.error ? 0.9 : 1
                }}
                variant="outlined"
              >
                <Typography variant="subtitle2" gutterBottom>
                  {output.name}
                </Typography>
                {output.isLoading && <CircularProgress size={20} />}
                {output.error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {output.error}
                  </Alert>
                )}
                {output.content && (
                  output.isHtml ? (
                    <Box
                      sx={{
                        mt: 1,
                        '& p': { margin: '0.5em 0' },
                        '& ul, & ol': { paddingLeft: '1.5em' },
                        '& h1, & h2, & h3, & h4, & h5, & h6': { margin: '0.5em 0' }
                      }}
                      dangerouslySetInnerHTML={{ __html: output.content }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'monospace',
                        mt: 1
                      }}
                    >
                      {output.content}
                    </Typography>
                  )
                )}
              </Paper>
            ))}
          </>
        )}
      </Box>
    </Box>
  )
}