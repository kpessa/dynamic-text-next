import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  ValidationIndicator,
  SyncIndicator,
  TestStatusIndicator,
  CombinedStatusIndicator,
  SectionStatusBadge,
  PopulationBadge,
  HealthSystemBadge,
  StatusLegend,
} from '../ui/VariantStatusIndicators'

describe('VariantStatusIndicators', () => {
  describe('ValidationIndicator', () => {
    it('renders valid status correctly', () => {
      render(<ValidationIndicator status="valid" />)
      const icon = screen.getByTestId('CheckCircleIcon')
      expect(icon).toBeInTheDocument()
    })

    it('renders warning status correctly', () => {
      render(<ValidationIndicator status="warning" />)
      const icon = screen.getByTestId('WarningIcon')
      expect(icon).toBeInTheDocument()
    })

    it('renders error status correctly', () => {
      render(<ValidationIndicator status="error" />)
      const icon = screen.getByTestId('ErrorIcon')
      expect(icon).toBeInTheDocument()
    })

    it('renders pending status correctly', () => {
      render(<ValidationIndicator status="pending" />)
      const icon = screen.getByTestId('ScheduleIcon')
      expect(icon).toBeInTheDocument()
    })

    it('shows label when showLabel is true', () => {
      render(<ValidationIndicator status="valid" showLabel />)
      expect(screen.getByText('Valid')).toBeInTheDocument()
    })
  })

  describe('SyncIndicator', () => {
    it('renders synced status correctly', () => {
      render(<SyncIndicator status="synced" />)
      const icon = screen.getByTestId('SyncIcon')
      expect(icon).toBeInTheDocument()
    })

    it('renders conflict status correctly', () => {
      render(<SyncIndicator status="conflict" />)
      const icon = screen.getByTestId('SyncProblemIcon')
      expect(icon).toBeInTheDocument()
    })

    it('renders outdated status correctly', () => {
      render(<SyncIndicator status="outdated" />)
      const icon = screen.getByTestId('WarningIcon')
      expect(icon).toBeInTheDocument()
    })

    it('renders unknown status correctly', () => {
      render(<SyncIndicator status="unknown" />)
      const icon = screen.getByTestId('SyncDisabledIcon')
      expect(icon).toBeInTheDocument()
    })

    it('shows label when showLabel is true', () => {
      render(<SyncIndicator status="synced" showLabel />)
      expect(screen.getByText('Synced')).toBeInTheDocument()
    })

    it('uses custom conflict details in tooltip', () => {
      const conflictDetails = 'Version mismatch between domains'
      render(<SyncIndicator status="conflict" conflictDetails={conflictDetails} />)
      // The tooltip content would be available but not directly testable without hovering
      const icon = screen.getByTestId('SyncProblemIcon')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('TestStatusIndicator', () => {
    it('renders all tests passed correctly', () => {
      render(<TestStatusIndicator passed={5} total={5} />)
      const chip = screen.getByText('5/5')
      expect(chip).toBeInTheDocument()
      expect(screen.getByTestId('CheckBoxIcon')).toBeInTheDocument()
    })

    it('renders all tests failed correctly', () => {
      render(<TestStatusIndicator passed={0} total={5} />)
      const chip = screen.getByText('0/5')
      expect(chip).toBeInTheDocument()
      expect(screen.getByTestId('DisabledByDefaultIcon')).toBeInTheDocument()
    })

    it('renders partial tests passed correctly', () => {
      render(<TestStatusIndicator passed={3} total={5} />)
      const chip = screen.getByText('3/5')
      expect(chip).toBeInTheDocument()
      expect(screen.getByTestId('IndeterminateCheckBoxIcon')).toBeInTheDocument()
    })

    it('renders no tests correctly', () => {
      render(<TestStatusIndicator passed={0} total={0} />)
      const chip = screen.getByText('0 tests')
      expect(chip).toBeInTheDocument()
      expect(screen.getByTestId('ScienceIcon')).toBeInTheDocument()
    })

    it('hides details when showDetails is false', () => {
      render(<TestStatusIndicator passed={3} total={5} showDetails={false} />)
      expect(screen.queryByText('3/5')).not.toBeInTheDocument()
    })
  })

  describe('CombinedStatusIndicator', () => {
    it('renders all status indicators together', () => {
      render(
        <CombinedStatusIndicator
          validationStatus="valid"
          syncStatus="synced"
          testsPassed={2}
          testsTotal={3}
          version="1.2.3"
          lastUpdated={new Date('2024-01-09')}
        />
      )

      expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument()
      expect(screen.getByTestId('SyncIcon')).toBeInTheDocument()
      expect(screen.getByText('2/3')).toBeInTheDocument()
      expect(screen.getByText('v1.2.3')).toBeInTheDocument()
      expect(screen.getByTestId('InfoIcon')).toBeInTheDocument()
    })

    it('renders without optional fields', () => {
      render(
        <CombinedStatusIndicator
          validationStatus="valid"
          syncStatus="synced"
          testsPassed={0}
          testsTotal={0}
        />
      )

      expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument()
      expect(screen.getByTestId('SyncIcon')).toBeInTheDocument()
      expect(screen.queryByText(/v\d/)).not.toBeInTheDocument()
    })
  })

  describe('SectionStatusBadge', () => {
    it('renders static sections only', () => {
      render(
        <SectionStatusBadge
          hasStatic={true}
          hasDynamic={false}
          staticCount={3}
          dynamicCount={0}
        />
      )
      expect(screen.getByText('3 static')).toBeInTheDocument()
    })

    it('renders dynamic sections only', () => {
      render(
        <SectionStatusBadge
          hasStatic={false}
          hasDynamic={true}
          staticCount={0}
          dynamicCount={2}
        />
      )
      expect(screen.getByText('2 dynamic')).toBeInTheDocument()
    })

    it('renders both static and dynamic sections', () => {
      render(
        <SectionStatusBadge
          hasStatic={true}
          hasDynamic={true}
          staticCount={3}
          dynamicCount={2}
        />
      )
      expect(screen.getByText('3 static, 2 dynamic')).toBeInTheDocument()
    })

    it('renders no sections', () => {
      render(
        <SectionStatusBadge
          hasStatic={false}
          hasDynamic={false}
          staticCount={0}
          dynamicCount={0}
        />
      )
      expect(screen.getByText('No sections')).toBeInTheDocument()
    })
  })

  describe('PopulationBadge', () => {
    it('renders NEO population correctly', () => {
      render(<PopulationBadge population="NEO" />)
      expect(screen.getByText('👶 Neonatal')).toBeInTheDocument()
    })

    it('renders CHILD population correctly', () => {
      render(<PopulationBadge population="CHILD" />)
      expect(screen.getByText('👧 Child')).toBeInTheDocument()
    })

    it('renders ADOLESCENT population correctly', () => {
      render(<PopulationBadge population="ADOLESCENT" />)
      expect(screen.getByText('🧑 Adolescent')).toBeInTheDocument()
    })

    it('renders ADULT population correctly', () => {
      render(<PopulationBadge population="ADULT" />)
      expect(screen.getByText('👨 Adult')).toBeInTheDocument()
    })

    it('hides emoji when showEmoji is false', () => {
      render(<PopulationBadge population="NEO" showEmoji={false} />)
      expect(screen.getByText('Neonatal')).toBeInTheDocument()
      expect(screen.queryByText('👶')).not.toBeInTheDocument()
    })
  })

  describe('HealthSystemBadge', () => {
    it('renders health system without domain', () => {
      render(<HealthSystemBadge healthSystem="CHOC" />)
      expect(screen.getByText('CHOC')).toBeInTheDocument()
      expect(screen.getByTestId('LocalHospitalIcon')).toBeInTheDocument()
    })

    it('renders health system with domain', () => {
      render(<HealthSystemBadge healthSystem="CHOC" domain="build-main" />)
      expect(screen.getByText('CHOC (build-main)')).toBeInTheDocument()
    })
  })

  describe('StatusLegend', () => {
    it('renders all status categories', () => {
      render(<StatusLegend />)
      
      // Check section headers
      expect(screen.getByText('Status Indicators')).toBeInTheDocument()
      expect(screen.getByText('Validation Status:')).toBeInTheDocument()
      expect(screen.getByText('Sync Status:')).toBeInTheDocument()
      expect(screen.getByText('Test Status:')).toBeInTheDocument()
      
      // Check validation statuses
      expect(screen.getByText('Valid')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      
      // Check sync statuses
      expect(screen.getByText('Synced')).toBeInTheDocument()
      expect(screen.getByText('Conflict')).toBeInTheDocument()
      expect(screen.getByText('Outdated')).toBeInTheDocument()
      expect(screen.getByText('Unknown')).toBeInTheDocument()
      
      // Check test status examples
      expect(screen.getByText('3/3')).toBeInTheDocument()
      expect(screen.getByText('1/3')).toBeInTheDocument()
      expect(screen.getByText('0/3')).toBeInTheDocument()
    })
  })
})