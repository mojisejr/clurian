import { config } from 'dotenv'
import path from 'path'
import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { configure } from '@testing-library/dom'
import { resetPrismaMocks, setupAllMocks } from './mocks/prisma'

// Load environment variables from .env file
config({ path: path.resolve(__dirname, '../.env') })

// Configure Testing Library
configure({ testIdAttribute: 'data-testid' })

// Global test setup
beforeAll(() => {
  // Setup all mocks
  setupAllMocks()

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock canvas
  HTMLCanvasElement.prototype.getContext = vi.fn()
})

// Clean up after each test
afterEach(() => {
  cleanup()
  resetPrismaMocks()
})

// Global cleanup
afterAll(() => {
  // Clean up any global mocks if needed
})

// Global test utilities
;(globalThis as typeof globalThis & { testUtils: Record<string, unknown> }).testUtils = {
  // Helper to wait for next tick
  tick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Helper to create mock FormData
  createFormData: (data: Record<string, unknown>) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
    return formData
  },

  // Helper to create mock file
  createMockFile: (name: string, type: string, content: string = '') => {
    const file = new File([content], name, { type })
    Object.defineProperty(file, 'size', { value: content.length })
    return file
  },

  // Helper to mock fetch
  mockFetch: (response: Record<string, unknown>, options: { status?: number; delay?: number } = {}) => {
    const { status = 200, delay = 0 } = options

    ;(globalThis as { fetch: typeof fetch }).fetch = vi.fn(() =>
      new Promise(resolve =>
        setTimeout(() => {
          resolve({
            ok: status >= 200 && status < 300,
            status,
            json: async () => response,
            text: async () => JSON.stringify(response),
          } as Response)
        }, delay)
      )
    )
  }
}
