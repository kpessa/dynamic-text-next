import React, { useRef, useEffect } from 'react'
import { Box, Paper, Typography, useTheme } from '@mui/material'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  theme?: 'light' | 'dark'
  readOnly?: boolean
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'markdown',
  theme = 'light',
  readOnly = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const muiTheme = useTheme()

  // Update line numbers
  useEffect(() => {
    if (lineNumbersRef.current) {
      const lines = value.split('\n').length
      const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n')
      lineNumbersRef.current.textContent = lineNumbers
    }
  }, [value])

  // Sync scroll between line numbers and editor
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  // Handle tab key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = textareaRef.current?.selectionStart || 0
      const end = textareaRef.current?.selectionEnd || 0
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      
      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2
          textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  const editorTheme = theme === 'dark' || muiTheme.palette.mode === 'dark' ? {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    lineNumberColor: '#858585',
    borderColor: '#464647'
  } : {
    backgroundColor: '#ffffff',
    color: '#383a42',
    lineNumberColor: '#999999',
    borderColor: '#e1e4e8'
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        bgcolor: editorTheme.backgroundColor,
        border: 1,
        borderColor: editorTheme.borderColor,
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      {/* Line Numbers */}
      <Box
        ref={lineNumbersRef}
        sx={{
          width: 50,
          p: 1,
          pr: 0.5,
          textAlign: 'right',
          fontSize: '14px',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          color: editorTheme.lineNumberColor,
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRight: 1,
          borderColor: editorTheme.borderColor,
          overflow: 'hidden',
          userSelect: 'none',
          lineHeight: '21px'
        }}
      />

      {/* Editor */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          style={{
            width: '100%',
            height: '100%',
            padding: '8px',
            fontSize: '14px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            lineHeight: '21px',
            color: editorTheme.color,
            backgroundColor: editorTheme.backgroundColor,
            border: 'none',
            outline: 'none',
            resize: 'none',
            tabSize: 2
          }}
          placeholder="Start typing your document..."
        />
        
        {/* Language indicator */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            px: 1,
            py: 0.5,
            bgcolor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: 1,
            color: editorTheme.lineNumberColor,
            userSelect: 'none'
          }}
        >
          {language}
        </Typography>
      </Box>
    </Paper>
  )
}