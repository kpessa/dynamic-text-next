'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as ListIcon,
  FormatListNumbered as NumberedListIcon,
  FormatQuote as QuoteIcon,
  Code as CodeIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { StaticSection as StaticSectionType } from '@/entities/section/types';

interface StaticSectionProps {
  section: StaticSectionType;
  onChange: (content: string) => void;
  isActive: boolean;
}

type FormatAction = 'bold' | 'italic' | 'list' | 'numberedList' | 'quote' | 'code' | 'link';

export default function StaticSection({ section, onChange, isActive }: StaticSectionProps) {
  const [content, setContent] = useState(section.content);
  const [isMarkdown, setIsMarkdown] = useState(true);
  const [selectedFormats, setSelectedFormats] = useState<FormatAction[]>([]);

  useEffect(() => {
    setContent(section.content);
  }, [section.content]);

  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    onChange(newContent);
  }, [onChange]);

  const applyFormat = (format: FormatAction) => {
    const textarea = document.getElementById(`static-section-${section.id}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = selectedText;
    let prefix = '';
    let suffix = '';

    if (isMarkdown) {
      switch (format) {
        case 'bold':
          prefix = '**';
          suffix = '**';
          break;
        case 'italic':
          prefix = '*';
          suffix = '*';
          break;
        case 'code':
          prefix = '`';
          suffix = '`';
          break;
        case 'quote':
          prefix = '> ';
          break;
        case 'list':
          prefix = '- ';
          break;
        case 'numberedList':
          prefix = '1. ';
          break;
        case 'link':
          formattedText = `[${selectedText}](url)`;
          break;
      }
    } else {
      // HTML formatting
      switch (format) {
        case 'bold':
          prefix = '<strong>';
          suffix = '</strong>';
          break;
        case 'italic':
          prefix = '<em>';
          suffix = '</em>';
          break;
        case 'code':
          prefix = '<code>';
          suffix = '</code>';
          break;
        case 'quote':
          prefix = '<blockquote>';
          suffix = '</blockquote>';
          break;
        case 'list':
          prefix = '<ul><li>';
          suffix = '</li></ul>';
          break;
        case 'numberedList':
          prefix = '<ol><li>';
          suffix = '</li></ol>';
          break;
        case 'link':
          formattedText = `<a href="url">${selectedText}</a>`;
          break;
      }
    }

    const newContent = 
      content.substring(0, start) + 
      (format === 'link' ? formattedText : prefix + selectedText + suffix) +
      content.substring(end);
    
    setContent(newContent);
    onChange(newContent);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      if (format === 'link') {
        // Select the 'url' placeholder
        const urlStart = start + (isMarkdown ? selectedText.length + 3 : selectedText.length + 9);
        const urlEnd = urlStart + 3;
        textarea.setSelectionRange(urlStart, urlEnd);
      } else {
        const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleFormatToggle = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: FormatAction[]
  ) => {
    // This is for visual feedback only
    setSelectedFormats(newFormats);
  };

  const handleFormatClick = (format: FormatAction) => {
    applyFormat(format);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Formatting Toolbar */}
      <Paper elevation={0} sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Format:
          </Typography>
          
          <ToggleButtonGroup
            value={selectedFormats}
            onChange={handleFormatToggle}
            size="small"
          >
            <ToggleButton value="bold" onClick={() => handleFormatClick('bold')}>
              <Tooltip title="Bold (Ctrl+B)">
                <BoldIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="italic" onClick={() => handleFormatClick('italic')}>
              <Tooltip title="Italic (Ctrl+I)">
                <ItalicIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="code" onClick={() => handleFormatClick('code')}>
              <Tooltip title="Inline Code">
                <CodeIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup size="small">
            <ToggleButton value="list" onClick={() => handleFormatClick('list')}>
              <Tooltip title="Bullet List">
                <ListIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="numberedList" onClick={() => handleFormatClick('numberedList')}>
              <Tooltip title="Numbered List">
                <NumberedListIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="quote" onClick={() => handleFormatClick('quote')}>
              <Tooltip title="Quote">
                <QuoteIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="link" onClick={() => handleFormatClick('link')}>
              <Tooltip title="Link">
                <LinkIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ flexGrow: 1 }} />

          <ToggleButtonGroup
            value={isMarkdown ? 'markdown' : 'html'}
            exclusive
            onChange={(e, value) => value && setIsMarkdown(value === 'markdown')}
            size="small"
          >
            <ToggleButton value="markdown">
              <Tooltip title="Markdown Mode">
                <Typography variant="caption">MD</Typography>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="html">
              <Tooltip title="HTML Mode">
                <Typography variant="caption">HTML</Typography>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {/* Text Editor */}
      <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
        <TextField
          id={`static-section-${section.id}`}
          multiline
          fullWidth
          variant="outlined"
          value={content}
          onChange={handleContentChange}
          placeholder={isMarkdown ? 
            "Enter your text here. Use markdown formatting:\n**bold**, *italic*, `code`, [link](url), etc." :
            "Enter your HTML content here..."
          }
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: 1.6,
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isActive ? 'primary.main' : 'divider',
              },
            },
          }}
          InputProps={{
            sx: {
              minHeight: '300px',
              alignItems: 'flex-start',
            },
          }}
        />
      </Box>
    </Box>
  );
}