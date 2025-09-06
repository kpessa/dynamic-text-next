import React from 'react';
import { Chip, CircularProgress, Tooltip } from '@mui/material';
import { 
  Sync as SyncIcon,
  SyncDisabled as SyncDisabledIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

export interface RealtimeIndicatorProps {
  status: 'synced' | 'syncing' | 'offline' | 'error' | 'pending';
  pendingCount?: number;
  errorMessage?: string;
  lastSyncTime?: Date;
  className?: string;
  size?: 'small' | 'medium';
  showLabel?: boolean;
  onClick?: () => void;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({
  status,
  pendingCount = 0,
  errorMessage,
  lastSyncTime,
  className,
  size = 'small',
  showLabel = true,
  onClick
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: <CloudDoneIcon fontSize={size} />,
          label: 'Synced',
          color: 'success' as const,
          tooltip: lastSyncTime 
            ? `Last synced: ${lastSyncTime.toLocaleTimeString()}`
            : 'All changes synced'
        };
        
      case 'syncing':
        return {
          icon: <CircularProgress size={size === 'small' ? 16 : 20} thickness={4} />,
          label: 'Syncing...',
          color: 'primary' as const,
          tooltip: 'Synchronizing changes with server'
        };
        
      case 'pending':
        return {
          icon: <SyncIcon fontSize={size} />,
          label: pendingCount > 0 ? `${pendingCount} pending` : 'Pending',
          color: 'warning' as const,
          tooltip: `${pendingCount} changes waiting to sync`
        };
        
      case 'offline':
        return {
          icon: <CloudOffIcon fontSize={size} />,
          label: 'Offline',
          color: 'default' as const,
          tooltip: 'Working offline - changes will sync when connected'
        };
        
      case 'error':
        return {
          icon: <WarningIcon fontSize={size} />,
          label: 'Sync Error',
          color: 'error' as const,
          tooltip: errorMessage || 'Failed to sync changes'
        };
        
      default:
        return {
          icon: <SyncDisabledIcon fontSize={size} />,
          label: 'Unknown',
          color: 'default' as const,
          tooltip: 'Sync status unknown'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tooltip title={config.tooltip} arrow>
      <Chip
        icon={config.icon}
        label={showLabel ? config.label : undefined}
        color={config.color}
        size={size}
        className={className}
        onClick={onClick}
        variant={status === 'synced' ? 'filled' : 'outlined'}
        sx={{
          '& .MuiChip-icon': {
            marginLeft: showLabel ? undefined : 0
          },
          minWidth: showLabel ? undefined : 32,
          paddingLeft: showLabel ? undefined : 0.5,
          paddingRight: showLabel ? undefined : 0.5
        }}
      />
    </Tooltip>
  );
};