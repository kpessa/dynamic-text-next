import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Chip } from './Chip'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FaceIcon from '@mui/icons-material/Face'
import DoneIcon from '@mui/icons-material/Done'
import TagIcon from '@mui/icons-material/LocalOffer'
import StarIcon from '@mui/icons-material/Star'

const meta = {
  title: 'Atoms/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Chip component for displaying small pieces of information, tags, or interactive elements.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
      description: 'The variant of the chip'
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'],
      description: 'The color of the chip'
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'The size of the chip'
    },
    clickable: {
      control: 'boolean',
      description: 'If true, the chip will appear clickable'
    },
    deletable: {
      control: 'boolean',
      description: 'If true, the chip will display a delete icon'
    }
  }
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Default Chip'
  }
}

export const BasicChips: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip label="Basic" />
      <Chip label="Primary" color="primary" />
      <Chip label="Secondary" color="secondary" />
      <Chip label="Success" color="success" />
      <Chip label="Error" color="error" />
      <Chip label="Warning" color="warning" />
      <Chip label="Info" color="info" />
    </Stack>
  )
}

export const OutlinedChips: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip label="Outlined" variant="outlined" />
      <Chip label="Primary" variant="outlined" color="primary" />
      <Chip label="Secondary" variant="outlined" color="secondary" />
      <Chip label="Success" variant="outlined" color="success" />
      <Chip label="Error" variant="outlined" color="error" />
      <Chip label="Warning" variant="outlined" color="warning" />
      <Chip label="Info" variant="outlined" color="info" />
    </Stack>
  )
}

export const ClickableChips: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip label="Clickable" clickable onClick={() => console.log('Clicked!')} />
      <Chip label="Primary" color="primary" clickable onClick={() => console.log('Primary clicked')} />
      <Chip label="Outlined" variant="outlined" clickable onClick={() => console.log('Outlined clicked')} />
    </Stack>
  )
}

export const DeletableChips: Story = {
  render: () => {
    const [chips, setChips] = useState(['Chip 1', 'Chip 2', 'Chip 3', 'Chip 4'])
    
    const handleDelete = (chipToDelete: string) => {
      setChips((chips) => chips.filter((chip) => chip !== chipToDelete))
    }
    
    if (chips.length === 0) {
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            All chips deleted!
          </Typography>
          <Chip 
            label="Reset" 
            color="primary" 
            clickable
            onClick={() => setChips(['Chip 1', 'Chip 2', 'Chip 3', 'Chip 4'])}
          />
        </Box>
      )
    }
    
    return (
      <Stack direction="row" spacing={1}>
        {chips.map((chip) => (
          <Chip
            key={chip}
            label={chip}
            onDelete={() => handleDelete(chip)}
          />
        ))}
      </Stack>
    )
  }
}

export const ChipsWithIcons: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip icon={<FaceIcon />} label="With Icon" />
      <Chip icon={<TagIcon />} label="Tag" color="primary" />
      <Chip icon={<StarIcon />} label="Featured" color="secondary" variant="outlined" />
      <Chip 
        icon={<DoneIcon />} 
        label="Done" 
        color="success"
        onDelete={() => console.log('Deleted')}
      />
    </Stack>
  )
}

export const ChipsWithAvatars: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip
        avatar={<Avatar>M</Avatar>}
        label="Avatar"
      />
      <Chip
        avatar={<Avatar alt="User" src="/api/placeholder/32/32" />}
        label="John Doe"
        onDelete={() => console.log('Deleted')}
      />
      <Chip
        avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>F</Avatar>}
        label="Folder"
        color="primary"
        variant="outlined"
      />
    </Stack>
  )
}

export const CustomDeleteIcons: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip
        label="Custom Delete"
        onDelete={() => console.log('Deleted')}
        deleteIcon={<DoneIcon />}
      />
      <Chip
        label="Star Delete"
        onDelete={() => console.log('Deleted')}
        deleteIcon={<StarIcon />}
        color="primary"
      />
    </Stack>
  )
}

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label="Small" size="small" />
        <Chip label="Small Primary" size="small" color="primary" />
        <Chip label="Small Deletable" size="small" onDelete={() => {}} />
        <Chip avatar={<Avatar>S</Avatar>} label="Small Avatar" size="small" />
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label="Medium" size="medium" />
        <Chip label="Medium Primary" size="medium" color="primary" />
        <Chip label="Medium Deletable" size="medium" onDelete={() => {}} />
        <Chip avatar={<Avatar>M</Avatar>} label="Medium Avatar" size="medium" />
      </Stack>
    </Stack>
  )
}

export const ClickableAndDeletable: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip
        label="Both Actions"
        clickable
        onClick={() => console.log('Clicked')}
        onDelete={() => console.log('Deleted')}
      />
      <Chip
        label="Primary Both"
        color="primary"
        clickable
        onClick={() => console.log('Clicked')}
        onDelete={() => console.log('Deleted')}
      />
      <Chip
        avatar={<Avatar>A</Avatar>}
        label="Avatar Both"
        variant="outlined"
        clickable
        onClick={() => console.log('Clicked')}
        onDelete={() => console.log('Deleted')}
      />
    </Stack>
  )
}

export const DisabledChips: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Chip label="Disabled" disabled />
      <Chip label="Disabled Outlined" variant="outlined" disabled />
      <Chip label="Disabled Clickable" clickable disabled />
      <Chip label="Disabled Deletable" onDelete={() => {}} disabled />
    </Stack>
  )
}

export const TagsExample: Story = {
  render: () => {
    const [selectedTags, setSelectedTags] = useState<string[]>(['React', 'TypeScript'])
    const availableTags = ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Node.js', 'GraphQL', 'REST']
    
    const handleTagClick = (tag: string) => {
      setSelectedTags((prev) =>
        prev.includes(tag)
          ? prev.filter((t) => t !== tag)
          : [...prev, tag]
      )
    }
    
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Click to select tags:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {availableTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              clickable
              color={selectedTags.includes(tag) ? 'primary' : 'default'}
              variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
              onClick={() => handleTagClick(tag)}
              icon={selectedTags.includes(tag) ? <DoneIcon /> : undefined}
            />
          ))}
        </Stack>
        {selectedTags.length > 0 && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            Selected: {selectedTags.join(', ')}
          </Typography>
        )}
      </Box>
    )
  }
}

export const StatusChips: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <Chip label="Active" color="success" size="small" />
        <Chip label="Pending" color="warning" size="small" />
        <Chip label="Inactive" color="default" size="small" />
        <Chip label="Error" color="error" size="small" />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Chip icon={<DoneIcon />} label="Completed" color="success" />
        <Chip label="In Progress" color="info" />
        <Chip label="Cancelled" color="error" variant="outlined" />
      </Stack>
    </Stack>
  )
}

export const InteractivePlayground: Story = {
  args: {
    label: 'Playground Chip',
    color: 'primary',
    variant: 'filled',
    clickable: true,
    deletable: false
  }
}