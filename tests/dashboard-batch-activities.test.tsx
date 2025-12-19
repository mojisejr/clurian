import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { getMixingFormulasByOrchard } from '@/app/actions/mixing-formulas'
import DashboardPage from '@/app/dashboard/page'

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: {
            id: 'user-1',
            name: 'Test User'
          }
        })
      )
    }
  }
}))

// Mock the actions
vi.mock('@/app/actions/mixing-formulas', () => ({
  getMixingFormulasByOrchard: vi.fn()
}))

// Mock useOrchard
vi.mock('@/components/providers/orchard-provider', () => ({
  useOrchard: () => ({
    currentOrchard: mockOrchard,
    currentOrchardId: mockOrchard.id,
    isLoadingOrchards: false,
    orchards: [mockOrchard],
    setCurrentOrchardId: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addLog: vi.fn().mockResolvedValue({} as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateLogs: vi.fn().mockResolvedValue({} as any),
  })
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }),
  useParams: () => ({ orchardId: 'orchard-1' }),
  useSearchParams: () => new URLSearchParams()
}))

// Mock orchard data
const mockOrchard = {
  id: 'orchard-1',
  name: 'สวนทดสอบ',
  zones: ['โซน A', 'โซน B', 'โซน C']
}

// Mock mixing formulas
const mockMixingFormulas = [
  {
    id: 'formula-1',
    name: 'สูตรยาทดสอบ 1',
    description: 'คำอธิบายสูตรยา 1'
  },
  {
    id: 'formula-2',
    name: 'สูตรยาทดสอบ 2',
    description: 'คำอธิบายสูตรยา 2'
  }
]

describe('Dashboard - Batch Activities with Mixing Formulas', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock successful mixing formulas response
    vi.mocked(getMixingFormulasByOrchard).mockResolvedValue({
      success: true,
      data: mockMixingFormulas
    })
  })

  describe('การเปิด modal สำหรับ batch log', () => {
    it('ควรโหลดสูตรยาเมื่อเปิด modal สำหรับ batch log', async () => {
      const user = userEvent.setup()

      render(<DashboardPage />)

      // Navigate to batch activities tab
      const batchTab = screen.getByRole('tab', { name: /กิจกรรมกลุ่ม/ })
      await user.click(batchTab)

      // Click add batch log button
      const addButton = screen.getByRole('button', { name: /เพิ่มบันทึกกิจกรรมกลุ่ม/ })
      await user.click(addButton)

      // Verify mixing formulas are loaded
      await waitFor(() => {
        expect(getMixingFormulasByOrchard).toHaveBeenCalledWith('orchard-1')
      })
    })

    it('ควรส่ง mixingFormulas ไปยัง AddLogForm', async () => {
      const user = userEvent.setup()

      render(<DashboardPage />)

      // Navigate to batch activities tab
      const batchTab = screen.getByRole('tab', { name: /กิจกรรมกลุ่ม/ })
      await user.click(batchTab)

      // Click add batch log button
      const addButton = screen.getByRole('button', { name: /เพิ่มบันทึกกิจกรรมกลุ่ม/ })
      await user.click(addButton)

      // Wait for formulas to load and form to render
      await waitFor(() => {
        expect(getMixingFormulasByOrchard).toHaveBeenCalledWith('orchard-1')
      })

      // Check if AddLogForm receives mixing formulas
      await waitFor(() => {
        expect(screen.getByText('เลือกสูตรยา (ถ้ามี)')).toBeInTheDocument()
      })
    })

    it('ควรแสดง loading state ขณะโหลดสูตรยา', async () => {
      // Mock slow response
      vi.mocked(getMixingFormulasByOrchard).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockMixingFormulas
        }), 100))
      )

      const user = userEvent.setup()

      render(<DashboardPage />)

      // Navigate to batch activities tab
      const batchTab = screen.getByRole('tab', { name: /กิจกรรมกลุ่ม/ })
      await user.click(batchTab)

      // Click add batch log button
      const addButton = screen.getByRole('button', { name: /เพิ่มบันทึกกิจกรรมกลุ่ม/ })
      await user.click(addButton)

      // Check for loading state
      await waitFor(() => {
        expect(screen.getByText('กำลังโหลดสูตรยา...')).toBeInTheDocument()
      })
    })

    it('ควรจัดการ error ถ้าโหลดสูตรยาล้มเหลว', async () => {
      // Mock error response
      vi.mocked(getMixingFormulasByOrchard).mockResolvedValue({
        success: false,
        error: 'ไม่สามารถดึงข้อมูลสูตรได้'
      })

      const user = userEvent.setup()

      render(<DashboardPage />)

      // Navigate to batch activities tab
      const batchTab = screen.getByRole('tab', { name: /กิจกรรมกลุ่ม/ })
      await user.click(batchTab)

      // Click add batch log button
      const addButton = screen.getByRole('button', { name: /เพิ่มบันทึกกิจกรรมกลุ่ม/ })
      await user.click(addButton)

      // Should still show form but without mixing formulas
      await waitFor(() => {
        expect(screen.queryByText('เลือกสูตรยา (ถ้ามี)')).not.toBeInTheDocument()
      })
    })

    it('ควบคุมสถานะ isAddingBatchLog ถูกต้อง', async () => {
      const user = userEvent.setup()

      render(<DashboardPage />)

      // Navigate to batch activities tab
      const batchTab = screen.getByRole('tab', { name: /กิจกรรมกลุ่ม/ })
      await user.click(batchTab)

      // Click add batch log button
      const addButton = screen.getByRole('button', { name: /เพิ่มบันทึกกิจกรรมกลุ่ม/ })
      await user.click(addButton)

      // Check initial state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /บันทึก/ })).not.toBeDisabled()
      })
    })
  })
})