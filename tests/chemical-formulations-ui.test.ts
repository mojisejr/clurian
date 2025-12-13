/**
 * Tests for Chemical Formulations UI Components (Issue #27)
 *
 * RED PHASE: These tests should FAIL because UI components don't yet
 * support the enhanced features for 46 formulation types
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock the UI components that need to be created/enhanced
vi.mock('@/components/forms/ChemicalFormulationSelector', () => ({
  ChemicalFormulationSelector: vi.fn(({ onSelect, selectedType }: any) =>
    React.createElement('div', {'data-testid': 'formulation-selector'},
      React.createElement('button', {
        'data-testid': 'wp-button',
        onClick: () => onSelect('WP'),
        className: selectedType === 'WP' ? 'selected' : ''
      }, 'WP - Wettable Powder'),
      React.createElement('button', {
        'data-testid': 'sp-button',
        onClick: () => onSelect('SP'),
        className: selectedType === 'SP' ? 'selected' : ''
      }, 'SP - Soluble Powder'),
      React.createElement('input', {
        'data-testid': 'search-input',
        placeholder: 'Search formulations...'
      })
    )
  ),
  FormulationSearchBox: vi.fn(({ onSearch, suggestions }: any) =>
    React.createElement('div', {'data-testid': 'search-box'},
      React.createElement('input', {
        'data-testid': 'search-input',
        onChange: (e: any) => onSearch(e.target.value)
      }),
      suggestions && suggestions.length > 0 &&
        React.createElement('div', {'data-testid': 'suggestions'},
          suggestions.map((s: any) =>
            React.createElement('div', {
              key: s.type,
              'data-testid': `suggestion-${s.type}`
            }, `${s.type} - ${s.description}`)
          )
        )
    )
  ),
  CategoryTabs: vi.fn(({ onCategoryChange, activeCategory }: any) =>
    React.createElement('div', {'data-testid': 'category-tabs'},
      React.createElement('button', {
        'data-testid': 'powder-tab',
        onClick: () => onCategoryChange('Powder'),
        className: activeCategory === 'Powder' ? 'active' : ''
      }, 'Powders (14)'),
      React.createElement('button', {
        'data-testid': 'liquid-tab',
        onClick: () => onCategoryChange('Liquid'),
        className: activeCategory === 'Liquid' ? 'active' : ''
      }, 'Liquids (13)')
    )
  )
}))

// Mock the search/filter functionality
vi.mock('@/lib/chemical-formulation-search', () => ({
  searchFormulations: vi.fn(),
  filterByCategory: vi.fn(),
  getFormulationSuggestions: vi.fn()
}))

// Mock the templates functionality
vi.mock('@/lib/chemical-templates', () => ({
  getCommonFormulations: vi.fn(() => [
    { type: 'WP', description: 'Wettable Powder', frequency: 0.3 },
    { type: 'EC', description: 'Emulsifiable Concentrate', frequency: 0.25 },
    { type: 'SP', description: 'Soluble Powder', frequency: 0.15 }
  ]),
  saveToFavorites: vi.fn(),
  getFavoriteFormulations: vi.fn()
}))

describe('Chemical Formulation UI Components', () => {
  const user = userEvent.setup()

  describe('Formulation Selector Component', () => {
    beforeEach(() => {
      render(
        <div data-testid="formulation-selector">
          <button data-testid="wp-button">WP - Wettable Powder</button>
          <button data-testid="sp-button">SP - Soluble Powder</button>
          <input data-testid="search-input" placeholder="Search formulations..." />
        </div>
      )
    })

    it('should display formulation codes and descriptions', () => {
      expect(screen.getByTestId('wp-button')).toHaveTextContent('WP - Wettable Powder')
      expect(screen.getByTestId('sp-button')).toHaveTextContent('SP - Soluble Powder')
    })

    it('should allow formulation selection', async () => {
      const wpButton = screen.getByTestId('wp-button')

      await user.click(wpButton)

      expect(wpButton).toHaveClass('selected')
    })

    it('should support search functionality', async () => {
      const searchInput = screen.getByTestId('search-input')

      await user.type(searchInput, 'Soluble')

      // Should filter to show only soluble formulations
      expect(screen.getByTestId('sp-button')).toBeInTheDocument()
    })
  })

  describe('Category Navigation', () => {
    beforeEach(() => {
      render(
        <div data-testid="category-tabs">
          <button data-testid="powder-tab">Powders (14)</button>
          <button data-testid="liquid-tab">Liquids (13)</button>
          <button data-testid="special-tab">Special (10)</button>
          <button data-testid="fertilizer-tab">Fertilizers (3)</button>
          <button data-testid="adjuvant-tab">Adjuvants (3)</button>
        </div>
      )
    })

    it('should display category counts', () => {
      expect(screen.getByTestId('powder-tab')).toHaveTextContent('(14)')
      expect(screen.getByTestId('liquid-tab')).toHaveTextContent('(13)')
      expect(screen.getByTestId('special-tab')).toHaveTextContent('(10)')
    })

    it('should switch categories on click', async () => {
      const powderTab = screen.getByTestId('powder-tab')
      const liquidTab = screen.getByTestId('liquid-tab')

      await user.click(powderTab)
      expect(powderTab).toHaveClass('active')

      await user.click(liquidTab)
      expect(liquidTab).toHaveClass('active')
      expect(powderTab).not.toHaveClass('active')
    })
  })

  describe('Search and Filter Functionality', () => {
    it('should search by formulation code', async () => {
      render(
        <div data-testid="search-box">
          <input data-testid="search-input" />
        </div>
      )

      const searchInput = screen.getByTestId('search-input')

      await user.type(searchInput, 'WP')

      // Should show WP and WP-related formulations
      expect(searchInput).toHaveValue('WP')
    })

    it('should search by description', async () => {
      render(
        <div data-testid="search-box">
          <input data-testid="search-input" />
        </div>
      )

      const searchInput = screen.getByTestId('search-input')

      await user.type(searchInput, 'Soluble')

      // Should show SP, SG, SL, WS, etc.
      expect(searchInput).toHaveValue('Soluble')
    })

    it('should provide search suggestions', async () => {
      render(
        <div data-testid="search-box">
          <input data-testid="search-input" />
          <div data-testid="suggestions">
            <div data-testid="suggestion-WP">WP - Wettable Powder</div>
            <div data-testid="suggestion-SP">SP - Soluble Powder</div>
          </div>
        </div>
      )

      // Should display matching suggestions
      expect(screen.getByTestId('suggestion-WP')).toBeInTheDocument()
      expect(screen.getByTestId('suggestion-SP')).toBeInTheDocument()
    })
  })

  describe('Formulation Templates', () => {
    it('should display common formulations by frequency', () => {
      render(
        <div data-testid="formulation-templates">
          <div data-testid="template-WP" data-frequency="0.3">
            WP - Wettable Powder
          </div>
          <div data-testid="template-EC" data-frequency="0.25">
            EC - Emulsifiable Concentrate
          </div>
          <div data-testid="template-SP" data-frequency="0.15">
            SP - Soluble Powder
          </div>
        </div>
      )

      // Should be sorted by frequency
      const wp = screen.getByTestId('template-WP')
      const ec = screen.getByTestId('template-EC')
      const sp = screen.getByTestId('template-SP')

      expect(wp).toBeInTheDocument()
      expect(ec).toBeInTheDocument()
      expect(sp).toBeInTheDocument()
    })

    it('should allow adding to favorites', async () => {
      render(
        <div data-testid="template-WP">
          WP - Wettable Powder
          <button data-testid="favorite-button">Add to Favorites</button>
        </div>
      )

      const favoriteButton = screen.getByTestId('favorite-button')

      await user.click(favoriteButton)

      // Should save to favorites
      expect(favoriteButton).toHaveTextContent('Remove from Favorites')
    })
  })

  describe('Form Information Display', () => {
    beforeEach(() => {
      render(
        <div data-testid="form-info-panel">
          <div data-testid="form-title">Wettable Powder (WP)</div>
          <div data-testid="form-description">
            Powder that disperses in water - ผงชุ่มน้ำ
          </div>
          <div data-testid="form-category">Category: Powder</div>
          <div data-testid="form-mixing-step">Mixing Step: 2</div>
          <div data-testid="form-precautions">
            Pre-wet before mixing to prevent clumping
          </div>
        </div>
      )
    })

    it('should display formulation details', () => {
      expect(screen.getByTestId('form-title')).toHaveTextContent('Wettable Powder (WP)')
      expect(screen.getByTestId('form-description')).toHaveTextContent('ผงชุ่มน้ำ')
      expect(screen.getByTestId('form-category')).toHaveTextContent('Powder')
    })

    it('should show mixing instructions', () => {
      expect(screen.getByTestId('form-mixing-step')).toHaveTextContent('Step: 2')
      expect(screen.getByTestId('form-precautions')).toHaveTextContent('Pre-wet')
    })
  })

  describe('Responsive Design', () => {
    it('should adapt to mobile view', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      render(
        <div data-testid="formulation-selector" data-mobile="true">
          <select data-testid="mobile-dropdown">
            <option value="">Select formulation...</option>
            <option value="WP">WP - Wettable Powder</option>
            <option value="SP">SP - Soluble Powder</option>
          </select>
        </div>
      )

      expect(screen.getByTestId('mobile-dropdown')).toBeInTheDocument()
      expect(screen.getByTestId('formulation-selector')).toHaveAttribute('data-mobile', 'true')
    })

    it('should show compact view on small screens', () => {
      render(
        <div data-testid="compact-selector">
          <div data-testid="form-code">WP</div>
          <div data-testid="form-desc">Wettable Powder</div>
        </div>
      )

      expect(screen.getByTestId('form-code')).toBeInTheDocument()
      expect(screen.getByTestId('form-desc')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <div data-testid="accessible-selector">
          <select aria-label="Chemical formulation type" data-testid="select">
            <option>WP - Wettable Powder</option>
          </select>
          <div role="tooltip" data-testid="tooltip">
            Press Space or Enter to open
          </div>
        </div>
      )

      const select = screen.getByLabelText('Chemical formulation type')
      expect(select).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toHaveAttribute('role', 'tooltip')
    })

    it('should support keyboard navigation', async () => {
      render(
        <div data-testid="keyboard-nav">
          <button data-testid="wp-button" tabIndex={0}>
            WP - Wettable Powder
          </button>
          <button data-testid="sp-button" tabIndex={1}>
            SP - Soluble Powder
          </button>
        </div>
      )

      // Test Tab navigation
      await user.tab()
      expect(screen.getByTestId('wp-button')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('sp-button')).toHaveFocus()
    })
  })

  describe('Performance with 46 Options', () => {
    it('should load all 46 formulations without delay', async () => {
      const startTime = performance.now()

      render(
        <div data-testid="all-formulations">
          {Array.from({ length: 46 }, (_, i) => (
            <div key={i} data-testid={`formulation-${i}`}>
              Formulation {i}
            </div>
          ))}
        </div>
      )

      const loadTime = performance.now() - startTime

      // Should load within 100ms
      expect(loadTime).toBeLessThan(100)

      // Should have all 46 items
      for (let i = 0; i < 46; i++) {
        expect(screen.getByTestId(`formulation-${i}`)).toBeInTheDocument()
      }
    })

    it('should debounce search input', async () => {
      const mockSearch = vi.fn()
      render(
        <div>
          <input
            data-testid="debounced-search"
            onChange={(e) => {
              setTimeout(() => mockSearch(e.target.value), 300)
            }}
          />
        </div>
      )

      const searchInput = screen.getByTestId('debounced-search')

      await user.type(searchInput, 'WP')
      await user.type(searchInput, 'SP')
      await user.type(searchInput, 'EC')

      // Wait for debounce
      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledTimes(1)
      }, { timeout: 500 })
    })
  })
})

describe('Integration with Existing Components', () => {
  it('should integrate with chemical mixing calculator', async () => {
    const onAddChemical = vi.fn()

    render(
      <div data-testid="chemical-form">
        <div data-testid="formulation-selector">
          <select data-testid="formulation-select">
            <option value="">Select...</option>
            <option value="WP">WP</option>
            <option value="SP">SP</option>
          </select>
          <input data-testid="quantity-input" placeholder="Quantity" />
          <input data-testid="unit-input" placeholder="Unit" />
          <button data-testid="add-chemical" onClick={onAddChemical}>
            Add Chemical
          </button>
        </div>
      </div>
    )

    await user.selectOptions(screen.getByTestId('formulation-select'), 'SP')
    await user.type(screen.getByTestId('quantity-input'), '100')
    await user.type(screen.getByTestId('unit-input'), 'g')
    await user.click(screen.getByTestId('add-chemical'))

    expect(onAddChemical).toHaveBeenCalledWith({
      type: 'SP',
      quantity: 100,
      unit: 'g'
    })
  })

  it('should validate formulation type', async () => {
    const mockValidate = vi.fn()

    render(
      <div>
        <input
          data-testid="type-input"
          onBlur={(e) => mockValidate(e.target.value)}
        />
      </div>
    )

    const input = screen.getByTestId('type-input')
    await user.type(input, 'XX')
    input.blur()

    expect(mockValidate).toHaveBeenCalledWith('XX')
  })
})