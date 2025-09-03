import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShareIcon from '@mui/icons-material/Share'

const meta = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Skeleton component for showing loading placeholders while content is being fetched.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular', 'rounded'],
      description: 'The shape variant of the skeleton'
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', false],
      description: 'The animation type'
    },
    width: {
      control: 'text',
      description: 'Width of the skeleton'
    },
    height: {
      control: 'text',
      description: 'Height of the skeleton'
    },
    rows: {
      control: 'number',
      description: 'Number of text skeleton rows to render'
    }
  }
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    width: 210,
    height: 60
  }
}

export const TextSkeleton: Story = {
  render: () => (
    <Stack spacing={1} sx={{ width: 300 }}>
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </Stack>
  )
}

export const CircularSkeleton: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="circular" width={50} height={50} />
      <Skeleton variant="circular" width={60} height={60} />
    </Stack>
  )
}

export const RectangularSkeleton: Story = {
  render: () => (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" width={210} height={60} />
      <Skeleton variant="rectangular" width={210} height={118} />
    </Stack>
  )
}

export const RoundedSkeleton: Story = {
  render: () => (
    <Stack spacing={2}>
      <Skeleton variant="rounded" width={210} height={60} />
      <Skeleton variant="rounded" width={210} height={118} />
    </Stack>
  )
}

export const AnimationTypes: Story = {
  render: () => (
    <Stack spacing={2}>
      <Box>
        <Typography variant="caption">Pulse (default)</Typography>
        <Skeleton animation="pulse" width={250} height={40} />
      </Box>
      <Box>
        <Typography variant="caption">Wave</Typography>
        <Skeleton animation="wave" width={250} height={40} />
      </Box>
      <Box>
        <Typography variant="caption">No Animation</Typography>
        <Skeleton animation={false} width={250} height={40} />
      </Box>
    </Stack>
  )
}

export const MultipleRows: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 300 }}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>3 Rows</Typography>
        <Skeleton variant="text" rows={3} />
      </Box>
      <Box>
        <Typography variant="subtitle2" gutterBottom>5 Rows with spacing</Typography>
        <Skeleton variant="text" rows={5} spacing={1.5} />
      </Box>
    </Stack>
  )
}

export const CardSkeleton: Story = {
  render: () => (
    <Card sx={{ width: 345, m: 2 }}>
      <Skeleton variant="rectangular" height={194} />
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
      </CardContent>
    </Card>
  )
}

export const ListItemSkeleton: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 360 }}>
      {[1, 2, 3].map((item) => (
        <Box key={item} sx={{ display: 'flex', alignItems: 'center' }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ ml: 2, flex: 1 }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Box>
        </Box>
      ))}
    </Stack>
  )
}

export const MediaCardSkeleton: Story = {
  render: () => (
    <Card sx={{ width: 345 }}>
      <Box sx={{ display: 'flex', p: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ ml: 2, flex: 1 }}>
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="30%" height={14} />
        </Box>
      </Box>
      <Skeleton variant="rectangular" height={194} />
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
    </Card>
  )
}

export const TableSkeleton: Story = {
  render: () => (
    <Box sx={{ width: 500 }}>
      <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
      {[1, 2, 3, 4, 5].map((row) => (
        <Box key={row} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Skeleton variant="rectangular" width="20%" height={36} />
          <Skeleton variant="rectangular" width="30%" height={36} />
          <Skeleton variant="rectangular" width="25%" height={36} />
          <Skeleton variant="rectangular" width="25%" height={36} />
        </Box>
      ))}
    </Box>
  )
}

export const FormSkeleton: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <Box>
        <Skeleton variant="text" width={60} height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={56} />
      </Box>
      <Box>
        <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={56} />
      </Box>
      <Box>
        <Skeleton variant="text" width={100} height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={120} />
      </Box>
      <Skeleton variant="rectangular" width={120} height={42} />
    </Stack>
  )
}

export const LiveExample: Story = {
  render: () => {
    const [loading, setLoading] = useState(true)
    
    return (
      <Stack spacing={2} sx={{ width: 300 }}>
        <Button 
          variant="contained" 
          onClick={() => setLoading(!loading)}
        >
          {loading ? 'Show Content' : 'Show Skeleton'}
        </Button>
        
        <Card>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ ml: 2 }}>
                  <Skeleton variant="text" width={120} />
                  <Skeleton variant="text" width={80} height={14} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar>U</Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1">John Doe</Typography>
                  <Typography variant="caption" color="text.secondary">2 hours ago</Typography>
                </Box>
              </Box>
              <Box sx={{ height: 150, bgcolor: 'primary.light', mb: 2, borderRadius: 1 }} />
              <Typography variant="body1" gutterBottom>
                Amazing sunset view!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Captured this beautiful moment at the beach yesterday evening.
              </Typography>
            </Box>
          )}
        </Card>
      </Stack>
    )
  }
}

export const ComplexLayout: Story = {
  render: () => (
    <Box sx={{ width: 800, p: 2 }}>
      <Stack direction="row" spacing={3}>
        <Box sx={{ width: 200 }}>
          <Skeleton variant="text" width={100} height={32} sx={{ mb: 2 }} />
          <Stack spacing={1}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} variant="text" width={`${80 + Math.random() * 20}%`} />
            ))}
          </Stack>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="text" rows={4} />
          
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            {[1, 2, 3].map((card) => (
              <Card key={card} sx={{ flex: 1 }}>
                <Skeleton variant="rectangular" height={100} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

export const InteractivePlayground: Story = {
  args: {
    variant: 'rectangular',
    animation: 'pulse',
    width: 210,
    height: 60
  }
}