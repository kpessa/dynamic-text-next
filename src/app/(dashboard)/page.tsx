'use client'

import React, { useEffect } from 'react'
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Paper,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  Science as ScienceIcon,
  CompareArrows as CompareIcon,
  Description as DocumentIcon,
  ImportExport as ImportIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Folder as FolderIcon
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  fetchDashboardData,
  refreshDashboard,
  selectDashboardUser,
  selectRecentCalculations,
  selectRecentIngredients,
  selectDashboardStatistics,
  selectDashboardLoading,
} from '@/features/dashboard'
import { StatCard } from '@/shared/ui/molecules/StatCard'
import { QuickActionGrid, type QuickAction } from '@/shared/ui/molecules/QuickActionGrid'
import { RecentCalculations, RecentIngredients } from '@/pages/home'
import { EmptyState } from '@/shared/ui/organisms/EmptyState/EmptyState'


export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  // Redux selectors
  const user = useAppSelector(selectDashboardUser)
  const recentCalculations = useAppSelector(selectRecentCalculations)
  const recentIngredients = useAppSelector(selectRecentIngredients)
  const statistics = useAppSelector(selectDashboardStatistics)
  const isLoading = useAppSelector(selectDashboardLoading)

  // Fetch dashboard data on mount
  useEffect(() => {
    dispatch(fetchDashboardData())
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(refreshDashboard())
  }

  const handleCalculationClick = (calc: { id: string }) => {
    router.push(`/tpn/history/${calc.id}`)
  }

  const handleIngredientClick = (ing: { id: string; name: string; category: string; lastModified: Date | string; isShared: boolean }) => {
    router.push(`/ingredients/manage?id=${ing.id}`)
  }

  // Define quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'new-calculation',
      label: 'New Calculation',
      icon: <CalculateIcon />,
      path: '/tpn/calculator',
      variant: 'contained',
    },
    {
      id: 'import-ingredients',
      label: 'Import Ingredients',
      icon: <ImportIcon />,
      path: '/ingredients/import',
      variant: 'outlined',
    },
    {
      id: 'view-history',
      label: 'View All Calculations',
      icon: <HistoryIcon />,
      path: '/tpn/history',
      variant: 'outlined',
    },
    {
      id: 'manage-ingredients',
      label: 'Manage Ingredients',
      icon: <FolderIcon />,
      path: '/ingredients/manage',
      variant: 'outlined',
    },
    {
      id: 'create-document',
      label: 'Create Document',
      icon: <DocumentIcon />,
      path: '/editor/new',
      variant: 'outlined',
    },
    {
      id: 'compare-populations',
      label: 'Compare Populations',
      icon: <CompareIcon />,
      path: '/tpn/compare',
      variant: 'outlined',
    },
  ]

  // Check if user is new (no data)
  const isNewUser = !isLoading && recentCalculations.length === 0 && recentIngredients.length === 0

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" gutterBottom>
            {isLoading ? (
              <Skeleton width={250} />
            ) : (
              `Welcome back${user?.name ? `, ${user.name}` : ''}!`
            )}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isNewUser 
              ? "Let's get you started with your first TPN calculation"
              : "Here's an overview of your TPN management system"}
          </Typography>
        </Box>
        <Tooltip title="Refresh dashboard">
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Calculations"
            value={statistics.totalCalculations}
            icon={<CalculateIcon color="primary" />}
            trend={statistics.monthlyGrowth.calculations > 0 ? {
              value: `+${statistics.monthlyGrowth.calculations}% this month`,
              direction: 'up'
            } : undefined}
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Ingredients"
            value={statistics.totalIngredients}
            icon={<ScienceIcon color="primary" />}
            trend={statistics.monthlyGrowth.ingredients > 0 ? {
              value: `+${statistics.monthlyGrowth.ingredients} new`,
              direction: 'up'
            } : undefined}
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Weekly Activity"
            value={statistics.weeklyActivity}
            icon={<HistoryIcon color="primary" />}
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Documents"
            value="15"
            icon={<DocumentIcon color="primary" />}
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box mt={2}>
          <QuickActionGrid 
            actions={quickActions}
            columns={{ xs: 12, sm: 6, md: 4, lg: 2 }}
            spacing={2}
          />
        </Box>
      </Paper>

      {/* Recent Activity */}
      {isNewUser ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EmptyState
            title="Welcome to TPN Management System!"
            description="You haven't created any calculations or ingredients yet. Let's get you started with your first TPN calculation."
            action={{
              label: "Create Your First Calculation",
              onClick: () => router.push('/tpn/calculator')
            }}
            secondaryAction={{
              label: "Import Ingredients",
              onClick: () => router.push('/ingredients/import')
            }}
          />
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Recent Calculations
              </Typography>
              {isLoading ? (
                <Box>
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} />
                </Box>
              ) : recentCalculations.length > 0 ? (
                <RecentCalculations
                  calculations={recentCalculations}
                  onClick={handleCalculationClick}
                  maxItems={5}
                />
              ) : (
                <EmptyState
                  title="No calculations yet"
                  description="Start by creating your first TPN calculation"
                  action={{
                    label: "Create Calculation",
                    onClick: () => router.push('/tpn/calculator')
                  }}
                />
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Recent Ingredients
              </Typography>
              {isLoading ? (
                <Box>
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} />
                </Box>
              ) : recentIngredients.length > 0 ? (
                <RecentIngredients
                  ingredients={recentIngredients}
                  onClick={handleIngredientClick}
                  maxItems={10}
                />
              ) : (
                <EmptyState
                  title="No ingredients yet"
                  description="Import or create ingredients to get started"
                  action={{
                    label: "Manage Ingredients",
                    onClick: () => router.push('/ingredients/manage')
                  }}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}