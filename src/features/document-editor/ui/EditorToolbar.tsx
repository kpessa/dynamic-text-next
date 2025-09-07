import React from 'react'
import {
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  FormatListBulleted as BulletListIcon,
  FormatListNumbered as NumberedListIcon,
  FormatQuote as QuoteIcon,
  TableChart as TableIcon,
  Functions as FormulaIcon,
  Image as ImageIcon,
  FileDownload as ExportIcon,
  Visibility as PreviewIcon,
  VisibilityOff as PreviewOffIcon,
  ViewColumn as SideViewIcon,
  ViewAgenda as BottomViewIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  FormatSize as HeadingIcon
} from '@mui/icons-material'

interface EditorToolbarProps {
  onFormulaClick: () => void
  onExportClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  onPreviewToggle: () => void
  previewMode: 'side' | 'bottom' | 'hidden'
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormulaClick,
  onExportClick,
  onPreviewToggle,
  previewMode
}) => {
  const [headingMenuAnchor, setHeadingMenuAnchor] = React.useState<null | HTMLElement>(null)
  const [formats, setFormats] = React.useState<string[]>([])

  const handleFormat = (event: React.MouseEvent<HTMLElement>, newFormats: string[]) => {
    setFormats(newFormats)
  }

  const handleHeadingSelect = (level: number) => {
    console.log(`Insert heading level ${level}`)
    setHeadingMenuAnchor(null)
  }

  const handleAction = (action: string) => {
    console.log(`Toolbar action: ${action}`)
  }

  const getPreviewIcon = () => {
    switch (previewMode) {
      case 'side':
        return <SideViewIcon />
      case 'bottom':
        return <BottomViewIcon />
      case 'hidden':
        return <PreviewOffIcon />
      default:
        return <PreviewIcon />
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderBottom: 1,
        borderColor: 'divider',
        flexWrap: 'wrap',
        bgcolor: 'background.paper'
      }}
    >
      {/* Undo/Redo */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Undo">
          <IconButton size="small" onClick={() => handleAction('undo')}>
            <UndoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Redo">
          <IconButton size="small" onClick={() => handleAction('redo')}>
            <RedoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Headings */}
      <Tooltip title="Heading">
        <IconButton
          size="small"
          onClick={(e) => setHeadingMenuAnchor(e.currentTarget)}
        >
          <HeadingIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={headingMenuAnchor}
        open={Boolean(headingMenuAnchor)}
        onClose={() => setHeadingMenuAnchor(null)}
      >
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <MenuItem key={level} onClick={() => handleHeadingSelect(level)}>
            <ListItemText>Heading {level}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Divider orientation="vertical" flexItem />

      {/* Text Formatting */}
      <ToggleButtonGroup
        value={formats}
        onChange={handleFormat}
        size="small"
      >
        <ToggleButton value="bold" aria-label="bold">
          <Tooltip title="Bold">
            <BoldIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="italic" aria-label="italic">
          <Tooltip title="Italic">
            <ItalicIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="underline" aria-label="underline">
          <Tooltip title="Underline">
            <UnderlineIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="code" aria-label="code">
          <Tooltip title="Code">
            <CodeIcon fontSize="small" />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      {/* Lists */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Bullet List">
          <IconButton size="small" onClick={() => handleAction('bullet-list')}>
            <BulletListIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered List">
          <IconButton size="small" onClick={() => handleAction('numbered-list')}>
            <NumberedListIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Quote">
          <IconButton size="small" onClick={() => handleAction('quote')}>
            <QuoteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Insert Elements */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Insert Link">
          <IconButton size="small" onClick={() => handleAction('link')}>
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Insert Image">
          <IconButton size="small" onClick={() => handleAction('image')}>
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Insert Table">
          <IconButton size="small" onClick={() => handleAction('table')}>
            <TableIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Insert Formula">
          <IconButton 
            size="small" 
            onClick={onFormulaClick}
            sx={{ color: 'primary.main' }}
          >
            <FormulaIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* Right side actions */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Toggle Preview">
          <IconButton size="small" onClick={onPreviewToggle}>
            {getPreviewIcon()}
          </IconButton>
        </Tooltip>
        <Tooltip title="Export">
          <IconButton size="small" onClick={onExportClick}>
            <ExportIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}