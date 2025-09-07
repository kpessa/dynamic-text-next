import React, { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Collapse,
  Chip,
  Tooltip
} from '@mui/material'
import {
  Article as SectionIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Search as SearchIcon,
  Add as AddIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material'

interface Section {
  id: string
  title: string
  line: number
  subsections?: Section[]
}

interface SectionSidebarProps {
  open: boolean
  sections: Section[]
  onSectionClick: (sectionId: string) => void
  onToggle: () => void
}

export const SectionSidebar: React.FC<SectionSidebarProps> = ({
  open,
  sections,
  onSectionClick,
  onToggle
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleSectionClick = (section: Section) => {
    setSelectedSection(section.id)
    onSectionClick(section.id)
  }

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderSection = (section: Section, depth: number = 0) => {
    const hasSubsections = section.subsections && section.subsections.length > 0
    const isExpanded = expandedSections.includes(section.id)
    const isSelected = selectedSection === section.id

    return (
      <React.Fragment key={section.id}>
        <ListItem
          disablePadding
          sx={{
            pl: depth * 2,
            bgcolor: isSelected ? 'action.selected' : 'transparent'
          }}
        >
          <ListItemButton onClick={() => handleSectionClick(section)}>
            {depth === 0 && (
              <ListItemIcon sx={{ minWidth: 32 }}>
                <SectionIcon fontSize="small" />
              </ListItemIcon>
            )}
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" noWrap>
                    {section.title}
                  </Typography>
                  <Chip
                    label={`L${section.line}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.7rem' }}
                  />
                </Box>
              }
            />
            {hasSubsections && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSection(section.id)
                }}
              >
                {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
              </IconButton>
            )}
          </ListItemButton>
        </ListItem>
        {hasSubsections && (
          <Collapse in={isExpanded}>
            <List disablePadding>
              {section.subsections!.map(subsection =>
                renderSection(subsection, depth + 1)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    )
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? 240 : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100% - 64px)'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontSize: '1rem' }}>
            Document Outline
          </Typography>
          <IconButton size="small" onClick={onToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Search */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Sections List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List>
            {filteredSections.length > 0 ? (
              filteredSections.map(section => renderSection(section))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" align="center">
                      No sections found
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </Box>

        <Divider />

        {/* Footer Actions */}
        <Box sx={{ p: 2 }}>
          <Tooltip title="Add Section">
            <IconButton
              size="small"
              sx={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Add Section</Typography>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  )
}

// Floating toggle button when sidebar is closed
export const SectionSidebarToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'fixed',
        left: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      <ChevronRightIcon />
    </IconButton>
  )
}