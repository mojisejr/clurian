import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SlidableTabs } from '@/components/ui/slidable-tabs'

// Mock the tabs module
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({
    children,
    isActive,
    onClick,
    badge
  }: {
    children: React.ReactNode
    isActive: boolean
    onClick: () => void
    badge?: string | number
  }) => (
    <button
      onClick={onClick}
      data-active={isActive}
      role="tab"
      data-testid="tab-trigger"
    >
      {children}
      {badge && <span data-testid="badge">{badge}</span>}
    </button>
  ),
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock the Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="badge" className={className}>{children}</span>
  )
}))

describe('SlidableTabs', () => {
  const defaultProps = {
    tabs: [
      { id: 'trees', label: 'ต้นไม้', badge: undefined },
      { id: 'batch', label: 'งานทั้งแปลง', badge: 5 },
      { id: 'scheduled', label: 'งานที่ต้องทำ', badge: 12 },
      { id: 'mixing', label: 'ผสมสารเคมี', badge: undefined }
    ],
    activeTab: 'trees',
    onTabChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all tabs correctly', () => {
    render(<SlidableTabs {...defaultProps} />)

    expect(screen.getByText('ต้นไม้')).toBeDefined()
    expect(screen.getByText('งานทั้งแปลง')).toBeDefined()
    expect(screen.getByText('งานที่ต้องทำ')).toBeDefined()
    expect(screen.getByText('ผสมสารเคมี')).toBeDefined()
  })

  it('should display badges on tabs with counts', () => {
    render(<SlidableTabs {...defaultProps} />)

    const badges = screen.getAllByTestId('badge')
    expect(badges.length).toBeGreaterThan(0)
    expect(screen.getByText('5')).toBeDefined()
  })

  it('should handle tab changes correctly', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()

    render(<SlidableTabs {...defaultProps} onTabChange={onTabChange} />)

    await user.click(screen.getByText('ผสมสารเคมี'))

    expect(onTabChange).toHaveBeenCalledWith('mixing')
  })

  it('should show active tab correctly', () => {
    render(<SlidableTabs {...defaultProps} activeTab="batch" />)

    const batchTab = screen.getByText('งานทั้งแปลง')
    expect(batchTab.getAttribute('data-active')).toBe('true')
  })

  it('should provide horizontal scrolling container', () => {
    render(<SlidableTabs {...defaultProps} />)

    const container = screen.getByRole('tablist')
    expect(container).toBeDefined()
  })

  it('should handle accessibility attributes correctly', () => {
    render(<SlidableTabs {...defaultProps} />)

    const container = screen.getByRole('tablist')
    expect(container.getAttribute('role')).toBe('tablist')

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThan(0)
  })

  it('should handle empty tabs array gracefully', () => {
    const { container } = render(<SlidableTabs tabs={[]} activeTab="" onTabChange={vi.fn()} />)

    expect(container.firstChild).toBeNull()
  })

  it('should handle dynamic tab count changes', () => {
    const { rerender } = render(<SlidableTabs {...defaultProps} />)

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(4)

    const newProps = {
      ...defaultProps,
      tabs: [...defaultProps.tabs, { id: 'new', label: 'แท็บใหม่', badge: 1 }]
    }

    rerender(<SlidableTabs {...newProps} />)

    expect(screen.getByText('แท็บใหม่')).toBeDefined()
  })
})