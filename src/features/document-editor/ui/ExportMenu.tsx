import React from 'react'
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box
} from '@mui/material'
import {
  PictureAsPdf as PdfIcon,
  Description as WordIcon,
  Code as MarkdownIcon,
  Html as HtmlIcon,
  TextSnippet as PlainTextIcon,
  Print as PrintIcon
} from '@mui/icons-material'

interface ExportMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onExport: (format: string) => void
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onExport
}) => {
  const handleExport = (format: string) => {
    onExport(format)
    onClose()
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Export Document
        </Typography>
      </Box>
      
      <Divider />
      
      <MenuItem onClick={() => handleExport('pdf')}>
        <ListItemIcon>
          <PdfIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText 
          primary="PDF" 
          secondary="Portable Document Format"
        />
      </MenuItem>
      
      <MenuItem onClick={() => handleExport('docx')}>
        <ListItemIcon>
          <WordIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText 
          primary="Word Document" 
          secondary=".docx format"
        />
      </MenuItem>
      
      <MenuItem onClick={() => handleExport('markdown')}>
        <ListItemIcon>
          <MarkdownIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText 
          primary="Markdown" 
          secondary=".md format"
        />
      </MenuItem>
      
      <MenuItem onClick={() => handleExport('html')}>
        <ListItemIcon>
          <HtmlIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText 
          primary="HTML" 
          secondary="Web page format"
        />
      </MenuItem>
      
      <MenuItem onClick={() => handleExport('txt')}>
        <ListItemIcon>
          <PlainTextIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText 
          primary="Plain Text" 
          secondary=".txt format"
        />
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={() => handleExport('print')}>
        <ListItemIcon>
          <PrintIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Print" />
      </MenuItem>
    </Menu>
  )
}