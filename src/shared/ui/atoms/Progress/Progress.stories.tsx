import React, { useState, useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Progress, CircularProgress, LinearProgress } from './Progress'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const meta = {
  title: 'Atoms/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Progress indicators for showing determinate or indeterminate progress. Available as circular and linear variants.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['circular', 'linear'],
      description: 'The variant of progress indicator'
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'inherit'],
      description: 'The color of the progress indicator'
    },
    determinate: {
      control: 'boolean',
      description: 'Whether the progress is determinate'
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'The value of the progress indicator (0-100)'
    },
    size: {
      control: 'number',
      description: 'Size of circular progress'
    },
    thickness: {
      control: 'number',
      description: 'Thickness of circular progress'
    },
    showLabel: {
      control: 'boolean',
      description: 'Show percentage label'
    }
  }
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'circular'
  }
}

export const CircularIndeterminate: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <CircularProgress />
      <CircularProgress color="secondary" />
      <CircularProgress color="success" />
      <CircularProgress color="error" />
      <CircularProgress color="warning" />
      <CircularProgress color="info" />
    </Stack>
  )
}

export const CircularDeterminate: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <CircularProgress determinate value={25} />
      <CircularProgress determinate value={50} color="secondary" />
      <CircularProgress determinate value={75} color="success" />
      <CircularProgress determinate value={100} color="info" />
    </Stack>
  )
}

export const CircularWithLabel: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <CircularProgress determinate value={10} showLabel />
      <CircularProgress determinate value={45} showLabel color="secondary" />
      <CircularProgress determinate value={70} showLabel color="success" />
      <CircularProgress determinate value={100} showLabel color="info" />
    </Stack>
  )
}

export const CircularCustomLabel: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <CircularProgress determinate value={60} showLabel label="3/5" />
      <CircularProgress determinate value={100} showLabel label="Done" color="success" />
      <CircularProgress determinate value={75} showLabel label="75" size={60} />
    </Stack>
  )
}

export const CircularSizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <CircularProgress size={20} />
      <CircularProgress size={30} />
      <CircularProgress size={40} />
      <CircularProgress size={50} />
      <CircularProgress size={60} />
    </Stack>
  )
}

export const CircularThickness: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <CircularProgress thickness={1} />
      <CircularProgress thickness={2} />
      <CircularProgress thickness={3.6} />
      <CircularProgress thickness={5} />
      <CircularProgress thickness={7} />
    </Stack>
  )
}

export const LinearIndeterminate: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 300 }}>
      <LinearProgress />
      <LinearProgress color="secondary" />
      <LinearProgress color="success" />
      <LinearProgress color="error" />
      <LinearProgress color="warning" />
      <LinearProgress color="info" />
    </Stack>
  )
}

export const LinearDeterminate: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 300 }}>
      <LinearProgress determinate value={25} />
      <LinearProgress determinate value={50} color="secondary" />
      <LinearProgress determinate value={75} color="success" />
      <LinearProgress determinate value={100} color="info" />
    </Stack>
  )
}

export const LinearWithLabel: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 400 }}>
      <LinearProgress determinate value={10} showLabel />
      <LinearProgress determinate value={45} showLabel color="secondary" />
      <LinearProgress determinate value={70} showLabel color="success" />
      <LinearProgress determinate value={100} showLabel color="info" />
    </Stack>
  )
}

export const LinearBuffer: Story = {
  render: () => {
    const [progress, setProgress] = useState(0)
    const [buffer, setBuffer] = useState(10)

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            return 0
          }
          const diff = Math.random() * 10
          return Math.min(oldProgress + diff, 100)
        })
        setBuffer((oldBuffer) => {
          if (oldBuffer === 100) {
            return 10
          }
          const diff = Math.random() * 10
          return Math.min(oldBuffer + diff + Math.random() * 10, 100)
        })
      }, 500)

      return () => {
        clearInterval(timer)
      }
    }, [])

    return (
      <Box sx={{ width: 300 }}>
        <LinearProgress value={progress} buffer={buffer} />
      </Box>
    )
  }
}

export const LinearHeights: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 300 }}>
      <LinearProgress height={2} />
      <LinearProgress height={4} />
      <LinearProgress height={8} />
      <LinearProgress height={12} />
      <LinearProgress height={16} />
    </Stack>
  )
}

export const AnimatedProgress: Story = {
  render: () => {
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      if (loading) {
        const timer = setInterval(() => {
          setProgress((prevProgress) => {
            if (prevProgress >= 100) {
              setLoading(false)
              return 100
            }
            return prevProgress + 10
          })
        }, 800)
        return () => clearInterval(timer)
      }
    }, [loading])

    const handleStart = () => {
      setProgress(0)
      setLoading(true)
    }

    return (
      <Box sx={{ width: 400 }}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress 
              determinate={loading || progress > 0}
              value={progress}
              showLabel
              size={80}
            />
          </Box>
          <LinearProgress 
            determinate={loading || progress > 0}
            value={progress}
            showLabel
          />
          <Button 
            variant="contained" 
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Start Loading'}
          </Button>
        </Stack>
      </Box>
    )
  }
}

export const FileUploadExample: Story = {
  render: () => {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const simulateUpload = () => {
      setUploading(true)
      setUploadProgress(0)
      
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setUploading(false)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 300)
    }

    return (
      <Box sx={{ width: 400 }}>
        <Stack spacing={2}>
          <Typography variant="h6">File Upload Progress</Typography>
          
          {uploading || uploadProgress > 0 ? (
            <>
              <LinearProgress 
                determinate 
                value={Math.min(uploadProgress, 100)}
                showLabel
                color={uploadProgress >= 100 ? 'success' : 'primary'}
              />
              <Typography variant="body2" color="text.secondary">
                {uploadProgress >= 100 ? 'Upload complete!' : 'Uploading file...'}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No upload in progress
            </Typography>
          )}
          
          <Button 
            variant="contained" 
            onClick={simulateUpload}
            disabled={uploading}
          >
            Upload File
          </Button>
        </Stack>
      </Box>
    )
  }
}

export const LoadingStates: Story = {
  render: () => (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>Loading Content</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={20} />
          <Typography variant="body2">Please wait...</Typography>
        </Stack>
      </Box>
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>Processing</Typography>
        <LinearProgress sx={{ width: 200 }} />
      </Box>
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>Download Progress</Typography>
        <Stack spacing={1}>
          <LinearProgress determinate value={67} showLabel />
          <Typography variant="caption" color="text.secondary">
            Downloading: document.pdf (6.7MB / 10MB)
          </Typography>
        </Stack>
      </Box>
    </Stack>
  )
}

export const InteractivePlayground: Story = {
  args: {
    variant: 'circular',
    color: 'primary',
    determinate: true,
    value: 50,
    showLabel: true,
    size: 40,
    thickness: 3.6
  }
}