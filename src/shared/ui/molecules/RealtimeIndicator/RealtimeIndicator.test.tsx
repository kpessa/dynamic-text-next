import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RealtimeIndicator } from './RealtimeIndicator';

describe('RealtimeIndicator', () => {
  it('should render synced status', () => {
    render(<RealtimeIndicator status="synced" />);
    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  it('should render syncing status', () => {
    render(<RealtimeIndicator status="syncing" />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('should render pending status with count', () => {
    render(<RealtimeIndicator status="pending" pendingCount={3} />);
    expect(screen.getByText('3 pending')).toBeInTheDocument();
  });

  it('should render offline status', () => {
    render(<RealtimeIndicator status="offline" />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should render error status with message', () => {
    const errorMessage = 'Connection failed';
    render(<RealtimeIndicator status="error" errorMessage={errorMessage} />);
    expect(screen.getByText('Sync Error')).toBeInTheDocument();
  });

  it('should not show label when showLabel is false', () => {
    render(<RealtimeIndicator status="synced" showLabel={false} />);
    expect(screen.queryByText('Synced')).not.toBeInTheDocument();
  });

  it('should handle click event', async () => {
    const handleClick = vi.fn();
    render(<RealtimeIndicator status="synced" onClick={handleClick} />);
    
    const chip = screen.getByRole('button');
    await userEvent.click(chip);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show last sync time in tooltip', () => {
    const lastSyncTime = new Date('2025-01-01T12:00:00');
    render(<RealtimeIndicator status="synced" lastSyncTime={lastSyncTime} />);
    
    const chip = screen.getByText('Synced').closest('div');
    expect(chip).toHaveAttribute('aria-label', expect.stringContaining('Last synced:'));
  });

  it('should render different sizes', () => {
    const { rerender } = render(<RealtimeIndicator status="synced" size="small" />);
    let chip = screen.getByText('Synced').closest('div');
    expect(chip).toHaveClass('MuiChip-sizeSmall');
    
    rerender(<RealtimeIndicator status="synced" size="medium" />);
    chip = screen.getByText('Synced').closest('div');
    expect(chip).toHaveClass('MuiChip-sizeMedium');
  });
});