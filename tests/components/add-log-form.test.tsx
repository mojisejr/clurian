import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddLogForm, type AddLogFormData } from '@/components/forms/add-log-form'

// Mock data
const mockZones = ['A', 'B', 'C']
const mockFormulas = [
  { id: '1', name: 'สูตรคุมหญ้า', description: 'สำหรับกำจัดวัชพืช' },
  { id: '2', name: 'สูตรให้ปุ๋ย', description: 'สำหรับการให้ปุ๋ย' },
  { id: '3', name: 'สูตรพ่นยาฮอร์โมน', description: 'สำหรับกำจัดแมลง' }
]

describe('AddLogForm - Mixing Formula Integration', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('Formula Selection Feature', () => {
    it('should show formula selection when pesticide action is selected', async () => {
      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
          mixingFormulas={mockFormulas}
        />
      )

      // Select pesticide action
      const actionSelect = screen.getByTestId('action-select')
      await userEvent.click(actionSelect)
      await userEvent.click(screen.getByText('พ่นยา/ฮอร์โมน'))

      // Formula selection should appear
      await waitFor(() => {
        expect(screen.getByText('เลือกสูตรผสม (ถ้ามี)')).toBeInTheDocument()
      })

      // Formula dropdown should be present
      expect(screen.getByTestId('formula-select')).toBeInTheDocument()
    })

    it('should show formula selection when fertilizer action is selected', async () => {
      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
          mixingFormulas={mockFormulas}
        />
      )

      // Select fertilizer action
      const actionSelect = screen.getByTestId('action-select')
      await userEvent.click(actionSelect)
      await userEvent.click(screen.getByText('ใส่ปุ๋ย'))

      // Formula selection should appear
      await waitFor(() => {
        expect(screen.getByText('เลือกสูตรผสม (ถ้ามี)')).toBeInTheDocument()
      })

      // Formula dropdown should be present
      expect(screen.getByTestId('formula-select')).toBeInTheDocument()
    })

    it('should not show formula selection for non-chemical actions', async () => {
      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
          mixingFormulas={mockFormulas}
        />
      )

      // Select non-chemical action
      const actionSelect = screen.getByTestId('action-select')
      await userEvent.click(actionSelect)
      await userEvent.click(screen.getByText('ตัดแต่งกิ่ง'))

      // Formula selection should NOT appear
      expect(screen.queryByText('เลือกสูตรผสม (ถ้ามี)')).not.toBeInTheDocument()
      expect(screen.queryByTestId('formula-select')).not.toBeInTheDocument()
    })

    it('should allow selecting a mixing formula', async () => {
      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
          mixingFormulas={mockFormulas}
        />
      )

      // Select pesticide action
      const actionSelect = screen.getByTestId('action-select')
      await userEvent.click(actionSelect)
      await userEvent.click(screen.getByText('พ่นยา/ฮอร์โมน'))

      // Wait for formula dropdown to appear
      await waitFor(() => {
        expect(screen.getByTestId('formula-select')).toBeInTheDocument()
      })

      // Select a formula
      const formulaSelect = screen.getByTestId('formula-select')
      await userEvent.click(formulaSelect)
      await userEvent.click(screen.getByText('สูตรคุมหญ้า'))

      // Formula details should be shown
      expect(screen.getByText('สูตรคุมหญ้า')).toBeInTheDocument()
      expect(screen.getByText('สำหรับกำจัดวัชพืช')).toBeInTheDocument()
    })

    it('should show empty state when no formulas available', () => {
      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
          mixingFormulas={[]}
        />
      )

      // Select pesticide action
      const actionSelect = screen.getByTestId('action-select')
      userEvent.click(actionSelect)
      userEvent.click(screen.getByText('พ่นยา/ฮอร์โมน'))

      // Should show empty state
      expect(screen.getByText('ไม่มีสูตรผสมที่บันทึกไว้')).toBeInTheDocument()
      expect(screen.getByText('สร้างสูตรใหม่')).toBeInTheDocument()
    })

    it('should show loading state while fetching formulas', () => {
      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
          isLoadingFormulas={true}
        />
      )

      // Select pesticide action
      const actionSelect = screen.getByTestId('action-select')
      userEvent.click(actionSelect)
      userEvent.click(screen.getByText('พ่นยา/ฮอร์โมน'))

      // Should show loading state
      expect(screen.getByText('กำลังโหลดสูตรผสม...')).toBeInTheDocument()
    })
  })

  describe('Data Attributes', () => {
    it('should have proper data-testid attributes', () => {
      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
          mixingFormulas={mockFormulas}
          dataTestId="add-log-form-test"
        />
      )

      expect(screen.getByTestId('add-log-form-test')).toBeInTheDocument()
      expect(screen.getByTestId('action-select')).toBeInTheDocument()
      expect(screen.getByTestId('target-zone-select')).toBeInTheDocument()
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
    })
  })

  describe('Form Submission with Formula', () => {
    it('should include formula ID in submission when formula is selected', async () => {
      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
          mixingFormulas={mockFormulas}
        />
      )

      // Select pesticide action
      const actionSelect = screen.getByTestId('action-select')
      await userEvent.click(actionSelect)
      await userEvent.click(screen.getByText('พ่นยา/ฮอร์โมน'))

      // Select a formula
      await waitFor(() => {
        expect(screen.getByTestId('formula-select')).toBeInTheDocument()
      })
      const formulaSelect = screen.getByTestId('formula-select')
      await userEvent.click(formulaSelect)
      await userEvent.click(screen.getByText('สูตรให้ปุ๋ย'))

      // Fill required fields
      const zoneSelect = screen.getByTestId('target-zone-select')
      await userEvent.click(zoneSelect)
      await userEvent.click(screen.getByText('โซน A'))

      // Submit form
      await userEvent.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            targetZone: 'A',
            action: 'พ่นยา/ฮอร์โมน',
            mixingFormulaId: '2'
          })
        )
      })
    })

    it('should not include formula ID when no formula is selected', async () => {
      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={() => {}}
          mixingFormulas={mockFormulas}
        />
      )

      // Select pesticide action
      const actionSelect = screen.getByTestId('action-select')
      await userEvent.click(actionSelect)
      await userEvent.click(screen.getByText('พ่นยา/ฮอร์โมน'))

      // Don't select any formula, leave as default

      // Fill required fields
      const zoneSelect = screen.getByTestId('target-zone-select')
      await userEvent.click(zoneSelect)
      await userEvent.click(screen.getByText('โซน A'))

      // Submit form
      await userEvent.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            targetZone: 'A',
            action: 'พ่นยา/ฮอร์โมน'
          })
        )
      })

      // Formula ID should be undefined
      expect(mockOnSubmit.mock.calls[0][0]).not.toHaveProperty('mixingFormulaId')
    })
  })
})