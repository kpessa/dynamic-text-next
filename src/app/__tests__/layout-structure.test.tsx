import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Next.js App Router Layout Structure', () => {
  const appPath = path.join(process.cwd(), 'src/app')

  it('has root layout with providers', () => {
    const rootLayoutPath = path.join(appPath, 'layout.tsx')
    expect(fs.existsSync(rootLayoutPath)).toBe(true)
    
    const content = fs.readFileSync(rootLayoutPath, 'utf-8')
    expect(content).toContain('ReduxProvider')
    expect(content).toContain('ThemeProvider')
    expect(content).toContain('CssBaseline')
  })

  it('has dashboard group layout', () => {
    const dashboardLayoutPath = path.join(appPath, '(dashboard)/layout.tsx')
    expect(fs.existsSync(dashboardLayoutPath)).toBe(true)
    
    const content = fs.readFileSync(dashboardLayoutPath, 'utf-8')
    expect(content).toContain('HeaderWidget')
    expect(content).toContain('SidebarWidget')
  })

  it('has auth group layout', () => {
    const authLayoutPath = path.join(appPath, '(auth)/layout.tsx')
    expect(fs.existsSync(authLayoutPath)).toBe(true)
    
    const content = fs.readFileSync(authLayoutPath, 'utf-8')
    expect(content).toContain('AuthLayout')
  })

  it('has proper metadata configuration', () => {
    const rootLayoutPath = path.join(appPath, 'layout.tsx')
    const content = fs.readFileSync(rootLayoutPath, 'utf-8')
    
    expect(content).toContain('metadata')
    expect(content).toContain('title')
    expect(content).toContain('description')
    expect(content).toContain('keywords')
  })

  it('implements layout nesting properly', () => {
    // Check that dashboard layout doesn't duplicate providers
    const dashboardLayoutPath = path.join(appPath, '(dashboard)/layout.tsx')
    const dashboardContent = fs.readFileSync(dashboardLayoutPath, 'utf-8')
    
    // Dashboard layout should NOT have ReduxProvider (it's in root)
    expect(dashboardContent).not.toContain('ReduxProvider')
    expect(dashboardContent).not.toContain('ThemeProvider')
    
    // But should have layout-specific components
    expect(dashboardContent).toContain('HeaderWidget')
    expect(dashboardContent).toContain('SidebarWidget')
  })
})