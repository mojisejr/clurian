import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { AddLogForm, MixingFormula } from '@/components/forms/add-log-form'

// Mock data
const mockMixingFormulas: MixingFormula[] = [
  {
    id: 'formula-1',
    name: 'สูตรยากำจัดแมลงหวี่ 1',
    description: 'สูตรสำหรับกำจัดแมลงหวี่ในระยะเจริญเติบโต'
  },
  {
    id: 'formula-2',
    name: 'สูตรให้ปุ๋ย',
    description: 'สูตรให้ปุ๋ยช่วงออกดอก'
  }
]

const mockZones = ['โซน A', 'โซน B', 'โซน C']

describe('AddLogForm - Mixing Formula Selection', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('เมื่อเป็น batch log', () => {
    it('ควรแสดง dropdown สูตรยาเมื่อเลือก chemical action', async () => {
      const user = userEvent.setup()

      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mixingFormulas={mockMixingFormulas}
        />
      )

      // Initially should not show formula selection
      expect(screen.queryByText('เลือกสูตรผสม (ถ้ามี)')).not.toBeInTheDocument()

      // Select chemical action
      const actionSelect = screen.getByRole('combobox', { name: /กิจกรรม/ })
      await user.click(actionSelect)

      const pesticideOption = screen.getByText('พ่นยา/ฮอร์โมน')
      await user.click(pesticideOption)

      // Now should show formula selection
      expect(screen.getByText('เลือกสูตรผสม (ถ้ามี)')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /เลือกสูตรผสม/ })).toBeInTheDocument()
    })

    it('ไม่ควงแสดง dropdown สูตรยาเมื่อไม่มี mixingFormulas', () => {
      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.queryByText('เลือกสูตรยา (ถ้ามี)')).not.toBeInTheDocument()
      expect(screen.queryByRole('combobox', { name: /เลือกสูตรยา/ })).not.toBeInTheDocument()
    })

    it('ควรแสดง loading state ขณะโหลดสูตรยา', async () => {
      const user = userEvent.setup()

      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoadingFormulas={true}
        />
      )

      // Select chemical action to trigger formula section
      const actionSelect = screen.getByRole('combobox', { name: /กิจกรรม/ })
      await user.click(actionSelect)

      const pesticideOption = screen.getByText('พ่นยา/ฮอร์โมน')
      await user.click(pesticideOption)

      expect(screen.getByText('กำลังโหลดสูตรผสม...')).toBeInTheDocument()
    })

    it('ควรเลือกสูตรยาได้และส่งค่าไปยัง onSubmit', async () => {
      const user = userEvent.setup()

      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mixingFormulas={mockMixingFormulas}
        />
      )

      // Fill required fields first
      const zoneSelect = screen.getByRole('combobox', { name: /โซน/ })
      await user.click(zoneSelect)
      await user.click(screen.getByText('โซน A'))

      const actionSelect = screen.getByRole('combobox', { name: /กิจกรรม/ })
      await user.click(actionSelect)
      await user.click(screen.getByText('ใส่ปุ๋ย'))

      // Wait for formula section to appear
      await waitFor(() => {
        expect(screen.getByText('เลือกสูตรผสม (ถ้ามี)')).toBeInTheDocument()
      })

      // Select a formula
      const formulaSelect = screen.getByRole('combobox', { name: /เลือกสูตรผสม/ })
      await user.click(formulaSelect)

      const formulaOption = screen.getByText('สูตรยากำจัดแมลงหวี่ 1')
      await user.click(formulaOption)

      // Submit form
      const submitButton = screen.getByRole('button', { name: /บันทึก/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            mixingFormulaId: 'formula-1',
            targetZone: 'A',
            action: 'ใส่ปุ๋ย',
            note: '',
            followUpDate: undefined
          })
        )
      })
    })

    it('ควรแสดงชื่อสูตรยาถูกต้องใน dropdown', async () => {
      const user = userEvent.setup()

      render(
        <AddLogForm
          isBatch={true}
          zones={mockZones}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mixingFormulas={mockMixingFormulas}
        />
      )

      // Select chemical action first
      const actionSelect = screen.getByRole('combobox', { name: /กิจกรรม/ })
      await user.click(actionSelect)
      await user.click(screen.getByText('พ่นยา/ฮอร์โมน'))

      // Wait for formula section
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /เลือกสูตรผสม/ })).toBeInTheDocument()
      })

      const formulaSelect = screen.getByRole('combobox', { name: /เลือกสูตรผสม/ })
      await user.click(formulaSelect)

      expect(screen.getByText('สูตรยากำจัดแมลงหวี่ 1')).toBeInTheDocument()
      expect(screen.getByText('สูตรให้ปุ๋ย')).toBeInTheDocument()
    })
  })

  describe('เมื่อเป็น individual log', () => {
    it('ควรแสดง dropdown สูตรยาเมื่อเลือก chemical action สำหรับ individual log', async () => {
      const user = userEvent.setup()

      render(
        <AddLogForm
          isBatch={false}
          treeCode="T001"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mixingFormulas={mockMixingFormulas}
        />
      )

      // Initially should not show formula selection
      expect(screen.queryByText('เลือกสูตรผสม (ถ้ามี)')).not.toBeInTheDocument()

      // Select chemical action
      const actionSelect = screen.getByRole('combobox', { name: /กิจกรรม/ })
      await user.click(actionSelect)

      const pesticideOption = screen.getByText('พ่นยา/ฮอร์โมน')
      await user.click(pesticideOption)

      // Now should show formula selection
      expect(screen.getByText('เลือกสูตรผสม (ถ้ามี)')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /เลือกสูตรผสม/ })).toBeInTheDocument()
    })

    it('ควรเลือกสูตรยาได้สำหรับ individual log', async () => {
      const user = userEvent.setup()

      render(
        <AddLogForm
          isBatch={false}
          treeCode="T001"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mixingFormulas={mockMixingFormulas}
        />
      )

      // Select chemical action
      const actionSelect = screen.getByRole('combobox', { name: /กิจกรรม/ })
      await user.click(actionSelect)
      await user.click(screen.getByText('ใส่ปุ๋ย'))

      // Wait for formula section
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /เลือกสูตรผสม/ })).toBeInTheDocument()
      })

      // Select a formula
      const formulaSelect = screen.getByRole('combobox', { name: /เลือกสูตรผสม/ })
      await user.click(formulaSelect)

      const formulaOption = screen.getByText('สูตรยากำจัดแมลงหวี่ 1')
      await user.click(formulaOption)

      // Submit form
      const submitButton = screen.getByRole('button', { name: /บันทึก/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            mixingFormulaId: 'formula-1',
            action: 'ใส่ปุ๋ย',
            note: '',
            followUpDate: undefined
          })
        )
      })
    })
  })
})