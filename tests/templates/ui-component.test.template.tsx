/**
 * Test Template for UI Components
 * Copy this file to create new test files for React components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ComponentName from '@/components/path/to/Component'

// Mock dependencies
vi.mock('@/lib/path/to/dependency', () => ({
  functionName: vi.fn()
}))

vi.mock('@/app/actions/path/to/action', () => ({
  actionName: vi.fn()
}))

describe('FEATURE_NAME: ComponentName', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('SCENARIO_NAME', () => {
    it('should EXPECTED_BEHAVIOR', async () => {
      // Arrange: Setup props and mocks
      const props = {
        // Component props here
      }

      // Mock function returns
      vi.mocked(actionName).mockResolvedValue({
        success: true,
        data: {}
      })

      // Act: Render component
      render(<ComponentName {...props} />)

      // Assert: Verify initial render
      expect(screen.getByTestId('component-element')).toBeInTheDocument()

      // Act: User interaction
      await user.click(screen.getByRole('button', { name: 'Action Button' }))

      // Assert: Verify interaction result
      await waitFor(() => {
        expect(actionName).toHaveBeenCalled()
      })
    })
  })
})

/**
 * Example Test Cases for UI Components:
 *
 * 1. Initial Render
 *    - Component renders with props
 *    - Default states are correct
 *    - Loading states
 *    - Error states
 *
 * 2. User Interactions
 *    - Button clicks
 *    - Form submissions
 *    - Input changes
 *    - Dropdown selections
 *
 * 3. State Changes
 *    - Local state updates
 *    - Prop changes trigger re-renders
 *    - Async state updates
 *
 * 4. API Integration
 *    - Server actions called correctly
 *    - Loading indicators shown
 *    - Success/error messages displayed
 *
 * 5. Accessibility
 *    - ARIA labels
 *    - Keyboard navigation
 *    - Screen reader support
 *
 * 6. Responsive Design
 *    - Mobile vs desktop layouts
 *    - Different screen sizes
 */

/**
 * Testing Patterns for React Components:
 *
 * 1. Use test IDs for reliable element selection
 * 2. Test user workflows, not just implementation details
 * 3. Mock external dependencies (APIs, router, etc.)
 * 4. Use waitFor for async operations
 * 5. Test both happy path and error states
 */

/**
 * Common Test Patterns:
 *
 * Basic Render Test:
 ```typescript
it('should render component with props', () => {
  const props = { title: 'Test Title', items: [] }
  render(<ComponentName {...props} />)

  expect(screen.getByText('Test Title')).toBeInTheDocument()
  expect(screen.getByTestId('items-list')).toBeInTheDocument()
})
```

 * User Interaction Test:
 ```typescript
it('should handle button click', async () => {
  const handleClick = vi.fn()
  render(<ComponentName onClick={handleClick} />)

  await user.click(screen.getByRole('button', { name: 'Click Me' }))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

 * Form Submission Test:
 ```typescript
it('should submit form with correct data', async () => {
  const mockSubmit = vi.fn().mockResolvedValue({ success: true })

  render(<ComponentName onSubmit={mockSubmit} />)

  await user.type(screen.getByLabelText('Name'), 'Test Name')
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({ name: 'Test Name' })
  })
})
```

 * Async State Test:
 ```typescript
it('should show loading state during async operation', async () => {
  const mockAction = vi.fn().mockImplementation(
    () => new Promise(resolve => setTimeout(resolve, 100))
  )

  render(<ComponentName onAction={mockAction} />)

  // Initial state
  expect(screen.getByRole('button')).not.toBeDisabled()

  // Click to trigger async
  await user.click(screen.getByRole('button'))

  // Loading state
  expect(screen.getByRole('button')).toBeDisabled()
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // Complete state
  await waitFor(() => {
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})
```

 * Error State Test:
 ```typescript
it('should display error message when action fails', async () => {
  const mockAction = vi.fn().mockResolvedValue({
    success: false,
    error: 'Something went wrong'
  })

  render(<ComponentName onAction={mockAction} />)

  await user.click(screen.getByRole('button', { name: 'Trigger Error' }))

  await waitFor(() => {
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByTestId('error-message')).toHaveClass('error')
  })
})
```

 * Modal/Dialog Test:
 ```typescript
it('should open and close modal correctly', async () => {
  render(<ComponentName />)

  // Modal initially closed
  expect(screen.queryByTestId('modal')).not.toBeInTheDocument()

  // Open modal
  await user.click(screen.getByRole('button', { name: 'Open Modal' }))

  // Modal open
  expect(screen.getByTestId('modal')).toBeInTheDocument()
  expect(screen.getByText('Modal Title')).toBeInTheDocument()

  // Close modal
  await user.click(screen.getByRole('button', { name: 'Close' }))

  // Modal closed
  expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
})
```

 * List Rendering Test:
 ```typescript
it('should render list of items correctly', () => {
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ]

  render(<ComponentName items={items} />)

  items.forEach(item => {
    expect(screen.getByText(item.name)).toBeInTheDocument()
    expect(screen.getByTestId(`item-${item.id}`)).toBeInTheDocument()
  })
})
```
*/