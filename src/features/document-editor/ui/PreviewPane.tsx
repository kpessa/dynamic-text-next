import React, { useMemo } from 'react'
import { Box, Paper, Typography, Divider, useTheme } from '@mui/material'

interface PreviewPaneProps {
  content: string
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ content }) => {
  const theme = useTheme()

  // Simple markdown to HTML converter for preview
  const processedContent = useMemo(() => {
    let html = content

    // Process dynamic variables ({{variable}})
    html = html.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return `<span style="background-color: ${theme.palette.primary.main}20; color: ${theme.palette.primary.main}; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${variable}</span>`
    })

    // Process headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // Process bold and italic
    html = html.replace(/\*\*\*(.*)\*\*\*/gim, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>')

    // Process inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background-color: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 3px;">$1</code>')

    // Process code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre style="background-color: rgba(0,0,0,0.05); padding: 12px; border-radius: 4px; overflow-x: auto;"><code>${code.trim()}</code></pre>`
    })

    // Process lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>')
    html = html.replace(/^\- (.+)$/gim, '<li>$1</li>')
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>')
    
    // Wrap consecutive list items in ul/ol tags
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      return `<ul style="margin: 8px 0; padding-left: 24px;">${match}</ul>`
    })

    // Process links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: ' + theme.palette.primary.main + ';">$1</a>')

    // Process line breaks
    html = html.replace(/\n\n/g, '</p><p>')
    html = '<p>' + html + '</p>'

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '')
    html = html.replace(/<p>(<h[1-6]>)/g, '$1')
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    html = html.replace(/<p>(<pre)/g, '$1')
    html = html.replace(/(<\/pre>)<\/p>/g, '$1')
    html = html.replace(/<p>(<ul)/g, '$1')
    html = html.replace(/(<\/ul>)<\/p>/g, '$1')

    return html
  }, [content, theme.palette.primary.main])

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Preview Header */}
        <Box sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            PREVIEW
          </Typography>
        </Box>

        {/* Rendered Content */}
        <Box
          dangerouslySetInnerHTML={{ __html: processedContent }}
          sx={{
            '& h1': {
              fontSize: '2rem',
              fontWeight: 600,
              mt: 3,
              mb: 2,
              color: 'text.primary'
            },
            '& h2': {
              fontSize: '1.5rem',
              fontWeight: 600,
              mt: 2.5,
              mb: 1.5,
              color: 'text.primary'
            },
            '& h3': {
              fontSize: '1.25rem',
              fontWeight: 600,
              mt: 2,
              mb: 1,
              color: 'text.primary'
            },
            '& p': {
              fontSize: '1rem',
              lineHeight: 1.6,
              mb: 1.5,
              color: 'text.primary'
            },
            '& ul, & ol': {
              mb: 1.5
            },
            '& li': {
              fontSize: '1rem',
              lineHeight: 1.6,
              mb: 0.5,
              color: 'text.primary'
            },
            '& code': {
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.9em'
            },
            '& pre': {
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.9rem',
              mb: 1.5
            },
            '& blockquote': {
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              pl: 2,
              ml: 0,
              my: 2,
              color: 'text.secondary'
            },
            '& hr': {
              border: 'none',
              borderTop: `1px solid ${theme.palette.divider}`,
              my: 3
            },
            '& a': {
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              mb: 2
            },
            '& th, & td': {
              border: `1px solid ${theme.palette.divider}`,
              p: 1,
              textAlign: 'left'
            },
            '& th': {
              bgcolor: 'action.hover',
              fontWeight: 600
            }
          }}
        />

        {/* Empty State */}
        {!content && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 400,
              color: 'text.secondary'
            }}
          >
            <Typography variant="body2">
              Start typing to see the preview...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}