import React from 'react'
import {
  Skeleton,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Stack,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material'

// Dashboard Page Skeleton
export const DashboardSkeleton: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="text" width={350} height={20} sx={{ mt: 1 }} />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="80%" height={16} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
            <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

// TPN Calculator Skeleton
export const TPNCalculatorSkeleton: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={item} variant="rectangular" height={56} />
              ))}
            </Stack>
            <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: 3 }} />
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {[1, 2, 3].map((item) => (
                <Box key={item}>
                  <Skeleton variant="text" width="30%" height={20} />
                  <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

// Ingredient List Skeleton
export const IngredientListSkeleton: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Search Bar */}
      <Skeleton variant="rectangular" height={56} sx={{ mb: 3 }} />

      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rectangular" width={100} height={36} />
        ))}
      </Stack>

      {/* Table/List */}
      {isMobile ? (
        // Mobile Card View
        <Stack spacing={2}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Card key={item}>
              <CardContent>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="50%" height={16} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="90%" height={16} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        // Desktop Table View
        <Paper>
          {/* Table Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2}>
              {[150, 200, 100, 150, 100].map((width, index) => (
                <Skeleton key={index} variant="text" width={width} height={20} />
              ))}
            </Stack>
          </Box>
          {/* Table Rows */}
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <Box key={row} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction="row" spacing={2}>
                {[150, 200, 100, 150, 100].map((width, index) => (
                  <Skeleton key={index} variant="text" width={width} height={20} />
                ))}
              </Stack>
            </Box>
          ))}
        </Paper>
      )}
    </Container>
  )
}

// Document Editor Skeleton
export const DocumentEditorSkeleton: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ width: 240, borderRight: 1, borderColor: 'divider', p: 2 }}>
        <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
        <Stack spacing={1}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} variant="text" height={24} />
          ))}
        </Stack>
      </Box>

      {/* Editor */}
      <Box sx={{ flex: 1, p: 3 }}>
        {/* Toolbar */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Skeleton key={item} variant="rectangular" width={36} height={36} />
          ))}
        </Stack>

        {/* Content */}
        <Paper sx={{ p: 3, height: 'calc(100% - 60px)' }}>
          <Stack spacing={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <Skeleton 
                key={item} 
                variant="text" 
                width={`${Math.random() * 40 + 60}%`} 
                height={20} 
              />
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}

// Settings Page Skeleton
export const SettingsSkeleton: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Skeleton variant="text" width={250} height={40} sx={{ mb: 3 }} />
      
      {/* Tabs */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} variant="rectangular" width={100} height={48} />
        ))}
      </Stack>

      {/* Content */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Box>
                <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Skeleton variant="rectangular" height={56} />
                  <Skeleton variant="rectangular" height={56} />
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  )
}

// Comparison Page Skeleton
export const ComparisonSkeleton: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="rectangular" width={150} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width={150} height={40} />
          <Box sx={{ flexGrow: 1 }} />
          <Skeleton variant="rectangular" width={100} height={40} />
        </Stack>
      </Paper>

      {/* Diff View */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Skeleton key={item} variant="text" height={20} />
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Skeleton key={item} variant="text" height={20} />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

// Generic Card Skeleton
export const CardSkeleton: React.FC<{ height?: number }> = ({ height = 200 }) => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
        <Skeleton variant="rectangular" height={height} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  )
}

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <Stack direction="row" spacing={2} sx={{ p: 2 }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} variant="text" sx={{ flex: 1 }} height={20} />
      ))}
    </Stack>
  )
}