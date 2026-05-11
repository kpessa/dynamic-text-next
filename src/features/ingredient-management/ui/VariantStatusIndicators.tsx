import React from 'react'
import {
  Chip,
  Tooltip,
  Stack,
  Typography,
  Box,
  IconButton,
} from '@mui/material'
import {
  CheckCircle,
  Warning,
  Error,
  Schedule,
  Sync,
  SyncProblem,
  SyncDisabled,
  Science,
  BugReport,
  CheckBox,
  IndeterminateCheckBox,
  DisabledByDefault,
  Info,
  LocalHospital,
} from '@mui/icons-material'
import { ValidationStatus, SyncStatus } from '../store/variantSlice'

interface ValidationIndicatorProps {
  status: ValidationStatus
  showLabel?: boolean
  size?: 'small' | 'medium'
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({ 
  status, 
  showLabel = false,
  size = 'small' 
}) => {
  const config = {
    valid: {
      icon: <CheckCircle fontSize={size} />,
      color: 'success' as const,
      label: 'Valid',
      tooltip: 'All content is valid HTML/text',
    },
    warning: {
      icon: <Warning fontSize={size} />,
      color: 'warning' as const,
      label: 'Warning',
      tooltip: 'Minor content issues (malformed HTML, suspicious content)',
    },
    error: {
      icon: <Error fontSize={size} />,
      color: 'error' as const,
      label: 'Error',
      tooltip: 'Invalid content (broken HTML, empty required content)',
    },
    pending: {
      icon: <Schedule fontSize={size} />,
      color: 'default' as const,
      label: 'Pending',
      tooltip: 'Content validation pending',
    },
  }

  const { icon, color, label, tooltip } = config[status]

  return (
    <Tooltip title={tooltip}>
      {showLabel ? (
        <Chip
          icon={icon}
          label={label}
          color={color}
          size={size}
          variant="outlined"
        />
      ) : (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
          {React.cloneElement(icon, { color })}
        </Box>
      )}
    </Tooltip>
  )
}

interface SyncIndicatorProps {
  status: SyncStatus
  showLabel?: boolean
  size?: 'small' | 'medium'
  conflictDetails?: string
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ 
  status, 
  showLabel = false,
  size = 'small',
  conflictDetails 
}) => {
  const config = {
    synced: {
      icon: <Sync fontSize={size} />,
      color: 'success' as const,
      label: 'Synced',
      tooltip: 'All domains in sync',
    },
    conflict: {
      icon: <SyncProblem fontSize={size} />,
      color: 'error' as const,
      label: 'Conflict',
      tooltip: conflictDetails || 'Sync conflicts detected across domains',
    },
    outdated: {
      icon: <Warning fontSize={size} />,
      color: 'warning' as const,
      label: 'Outdated',
      tooltip: 'Some domains have newer versions',
    },
    unknown: {
      icon: <SyncDisabled fontSize={size} />,
      color: 'default' as const,
      label: 'Unknown',
      tooltip: 'Sync status unknown',
    },
  }

  const { icon, color, label, tooltip } = config[status]

  return (
    <Tooltip title={tooltip}>
      {showLabel ? (
        <Chip
          icon={icon}
          label={label}
          color={color}
          size={size}
          variant="outlined"
        />
      ) : (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
          {React.cloneElement(icon, { color })}
        </Box>
      )}
    </Tooltip>
  )
}

interface TestStatusIndicatorProps {
  passed: number
  total: number
  showDetails?: boolean
  size?: 'small' | 'medium'
}

export const TestStatusIndicator: React.FC<TestStatusIndicatorProps> = ({ 
  passed, 
  total,
  showDetails = true,
  size = 'small' 
}) => {
  const getStatus = () => {
    if (total === 0) return 'no-tests'
    if (passed === total) return 'all-passed'
    if (passed === 0) return 'all-failed'
    return 'partial'
  }

  const status = getStatus()

  const config = {
    'all-passed': {
      icon: <CheckBox fontSize={size} />,
      color: 'success' as const,
      label: `${passed}/${total}`,
      tooltip: 'All tests passing',
    },
    'all-failed': {
      icon: <DisabledByDefault fontSize={size} />,
      color: 'error' as const,
      label: `${passed}/${total}`,
      tooltip: 'All tests failing',
    },
    'partial': {
      icon: <IndeterminateCheckBox fontSize={size} />,
      color: 'warning' as const,
      label: `${passed}/${total}`,
      tooltip: `${passed} of ${total} tests passing`,
    },
    'no-tests': {
      icon: <Science fontSize={size} />,
      color: 'default' as const,
      label: '0 tests',
      tooltip: 'No tests configured',
    },
  }

  const { icon, color, label, tooltip } = config[status]

  return (
    <Tooltip title={tooltip}>
      <Chip
        icon={icon}
        label={showDetails ? label : undefined}
        color={color}
        size={size}
        variant="outlined"
      />
    </Tooltip>
  )
}

interface CombinedStatusIndicatorProps {
  validationStatus: ValidationStatus
  syncStatus: SyncStatus
  testsPassed: number
  testsTotal: number
  version?: string
  lastUpdated?: Date
  showLabels?: boolean
}

export const CombinedStatusIndicator: React.FC<CombinedStatusIndicatorProps> = ({
  validationStatus,
  syncStatus,
  testsPassed,
  testsTotal,
  version,
  lastUpdated,
  showLabels = false,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <ValidationIndicator status={validationStatus} showLabel={showLabels} />
      <SyncIndicator status={syncStatus} showLabel={showLabels} />
      <TestStatusIndicator passed={testsPassed} total={testsTotal} />
      
      {version && (
        <Tooltip title={`Version: ${version}`}>
          <Typography variant="caption" color="text.secondary">
            v{version}
          </Typography>
        </Tooltip>
      )}
      
      {lastUpdated && (
        <Tooltip title={`Last updated: ${formatDate(lastUpdated)}`}>
          <Info fontSize="small" color="action" />
        </Tooltip>
      )}
    </Stack>
  )
}

interface SectionStatusBadgeProps {
  hasStatic: boolean
  hasDynamic: boolean
  staticCount?: number
  dynamicCount?: number
}

export const SectionStatusBadge: React.FC<SectionStatusBadgeProps> = ({
  hasStatic,
  hasDynamic,
  staticCount = 0,
  dynamicCount = 0,
}) => {
  const getLabel = () => {
    const parts = []
    if (hasStatic && staticCount > 0) parts.push(`${staticCount} static`)
    if (hasDynamic && dynamicCount > 0) parts.push(`${dynamicCount} dynamic`)
    return parts.join(', ') || 'No sections'
  }

  const getColor = () => {
    if (!hasStatic && !hasDynamic) return 'default'
    if (hasStatic && hasDynamic) return 'success'
    return 'info'
  }

  return (
    <Chip
      label={getLabel()}
      color={getColor()}
      size="small"
      variant="outlined"
    />
  )
}

interface PopulationBadgeProps {
  population: 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'
  showEmoji?: boolean
}

export const PopulationBadge: React.FC<PopulationBadgeProps> = ({ 
  population,
  showEmoji = true 
}) => {
  const config = {
    NEO: { emoji: '👶', label: 'Neonatal', color: 'info' as const },
    CHILD: { emoji: '👧', label: 'Child', color: 'primary' as const },
    ADOLESCENT: { emoji: '🧑', label: 'Adolescent', color: 'secondary' as const },
    ADULT: { emoji: '👨', label: 'Adult', color: 'default' as const },
  }

  const { emoji, label, color } = config[population]

  return (
    <Chip
      label={showEmoji ? `${emoji} ${label}` : label}
      color={color}
      size="small"
      variant="filled"
    />
  )
}

interface HealthSystemBadgeProps {
  healthSystem: string
  domain?: string
}

export const HealthSystemBadge: React.FC<HealthSystemBadgeProps> = ({ 
  healthSystem,
  domain 
}) => {
  const label = domain ? `${healthSystem} (${domain})` : healthSystem

  return (
    <Chip
      icon={<LocalHospital fontSize="small" />}
      label={label}
      size="small"
      variant="outlined"
      color="primary"
    />
  )
}

export const StatusLegend: React.FC = () => {
  return (
    <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Status Indicators
      </Typography>
      
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Validation Status:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <ValidationIndicator status="valid" showLabel />
            <ValidationIndicator status="warning" showLabel />
            <ValidationIndicator status="error" showLabel />
            <ValidationIndicator status="pending" showLabel />
          </Stack>
        </Box>
        
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Sync Status:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <SyncIndicator status="synced" showLabel />
            <SyncIndicator status="conflict" showLabel />
            <SyncIndicator status="outdated" showLabel />
            <SyncIndicator status="unknown" showLabel />
          </Stack>
        </Box>
        
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Test Status:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <TestStatusIndicator passed={3} total={3} />
            <TestStatusIndicator passed={1} total={3} />
            <TestStatusIndicator passed={0} total={3} />
            <TestStatusIndicator passed={0} total={0} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

export default {
  ValidationIndicator,
  SyncIndicator,
  TestStatusIndicator,
  CombinedStatusIndicator,
  SectionStatusBadge,
  PopulationBadge,
  HealthSystemBadge,
  StatusLegend,
}