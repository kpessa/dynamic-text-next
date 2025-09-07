import React from 'react'
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Divider,
  Chip,
  Alert
} from '@mui/material'
import {
  Notifications as NotificationIcon,
  Email as EmailIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Update as UpdateIcon,
  Calculate as CalculateIcon,
  FileDownload as DownloadIcon,
  NotificationsActive as ActiveIcon,
  NotificationsOff as OffIcon
} from '@mui/icons-material'

interface NotificationSettingsProps {
  settings: {
    enableNotifications: boolean
    emailNotifications: boolean
    calculationComplete: boolean
    exportComplete: boolean
    errorAlerts: boolean
    updateAvailable: boolean
  }
  onChange: (key: string, value: any) => void
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notification Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Control when and how you receive notifications
      </Typography>

      <Grid container spacing={3}>
        {/* Master Toggle */}
        <Grid item xs={12}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3,
              bgcolor: settings.enableNotifications ? 'background.paper' : 'action.disabledBackground'
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableNotifications}
                  onChange={(e) => onChange('enableNotifications', e.target.checked)}
                  size="medium"
                />
              }
              label={
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {settings.enableNotifications ? (
                      <ActiveIcon color="primary" />
                    ) : (
                      <OffIcon color="disabled" />
                    )}
                    <Typography variant="subtitle1">
                      {settings.enableNotifications ? 'Notifications Enabled' : 'Notifications Disabled'}
                    </Typography>
                    <Chip 
                      label={settings.enableNotifications ? 'ON' : 'OFF'} 
                      size="small" 
                      color={settings.enableNotifications ? 'success' : 'default'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Master control for all notifications
                  </Typography>
                </Box>
              }
            />
          </Paper>
        </Grid>

        {/* Notification Channels */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, opacity: settings.enableNotifications ? 1 : 0.5 }}>
            <Typography variant="subtitle1" gutterBottom>
              Notification Channels
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Stack spacing={2}>
              <FormControlLabel
                disabled={!settings.enableNotifications}
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => onChange('emailNotifications', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" />
                      <Typography>Email Notifications</Typography>
                      <Chip label="Coming Soon" size="small" variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Receive important updates via email
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Notification Types */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, opacity: settings.enableNotifications ? 1 : 0.5 }}>
            <Typography variant="subtitle1" gutterBottom>
              Notification Types
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which events trigger notifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  disabled={!settings.enableNotifications}
                  control={
                    <Switch
                      checked={settings.calculationComplete}
                      onChange={(e) => onChange('calculationComplete', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalculateIcon fontSize="small" color="success" />
                        <Typography>Calculation Complete</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        When calculations finish processing
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  disabled={!settings.enableNotifications}
                  control={
                    <Switch
                      checked={settings.exportComplete}
                      onChange={(e) => onChange('exportComplete', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DownloadIcon fontSize="small" color="success" />
                        <Typography>Export Complete</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        When file exports are ready
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  disabled={!settings.enableNotifications}
                  control={
                    <Switch
                      checked={settings.errorAlerts}
                      onChange={(e) => onChange('errorAlerts', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorIcon fontSize="small" color="error" />
                        <Typography>Error Alerts</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        When errors or issues occur
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  disabled={!settings.enableNotifications}
                  control={
                    <Switch
                      checked={settings.updateAvailable}
                      onChange={(e) => onChange('updateAvailable', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <UpdateIcon fontSize="small" color="info" />
                        <Typography>Updates Available</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        When new features or updates are available
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Notification Preview */}
        {settings.enableNotifications && (
          <Grid item xs={12}>
            <Alert severity="info" icon={<NotificationIcon />}>
              <Typography variant="subtitle2" gutterBottom>
                Notification Preview
              </Typography>
              <Typography variant="body2">
                This is how notifications will appear. You have enabled {
                  [
                    settings.calculationComplete && 'calculation complete',
                    settings.exportComplete && 'export complete',
                    settings.errorAlerts && 'error alerts',
                    settings.updateAvailable && 'update notifications'
                  ].filter(Boolean).join(', ')
                } notifications.
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}