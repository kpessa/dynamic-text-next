/**
 * Home Page
 * Landing page composing widgets and features
 */

import React from 'react'
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material'
import { HeaderWidget } from '@/widgets/header'
import { useRouter } from 'next/navigation'
import AddIcon from '@mui/icons-material/Add'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'

export const HomePage: React.FC = () => {
  const router = useRouter()

  const handleNewDocument = () => {
    router.push('/editor/new')
  }

  const handleOpenDocument = () => {
    router.push('/editor')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderWidget title="Dynamic Text Editor" />
      
      <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ my: 8 }}>
            <Typography variant="h2" component="h1" gutterBottom align="center">
              Welcome to Dynamic Text Editor
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
              Create and manage dynamic content with TPN advisor functions
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={handleNewDocument}
              >
                <AddIcon sx={{ fontSize: 64, mb: 2, color: 'primary.main' }} />
                <Typography variant="h4" gutterBottom>
                  New Document
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                  Start creating a new dynamic text document with sections and test cases
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  sx={{ mt: 3 }}
                >
                  Create New
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={handleOpenDocument}
              >
                <FolderOpenIcon sx={{ fontSize: 64, mb: 2, color: 'secondary.main' }} />
                <Typography variant="h4" gutterBottom>
                  Open Existing
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                  Continue working on your saved documents or browse recent files
                </Typography>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<FolderOpenIcon />}
                  sx={{ mt: 3 }}
                >
                  Browse Files
                </Button>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Key Features
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  ✨ Dynamic JavaScript execution
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  🧪 Test case management
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  💉 TPN advisor functions
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  🔄 Real-time preview
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}