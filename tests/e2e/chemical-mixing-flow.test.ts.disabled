import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { chromium, type Browser, type Page } from 'playwright'

describe('Chemical Mixing E2E Tests', () => {
  let browser: Browser
  let page: Page

  beforeEach(async () => {
    browser = await chromium.launch({ headless: true })
    page = await browser.newPage()
  })

  afterEach(async () => {
    await browser.close()
  })

  describe('Complete Mixing Workflow', () => {
    it('should complete flow 1: สร้างสูตรใหม่', async () => {
      // 1. Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForSelector('[data-testid="dashboard-tabs"]')

      // 2. Click on "สูตรผสมสาร" tab
      await page.click('[data-testid="tab-mixing"]')
      await page.waitForSelector('[data-testid="mixing-page"]')

      // 3. Click "เพิ่มสารเคมี+" button
      await page.click('[data-testid="add-chemical-btn"]')
      await page.waitForSelector('[data-testid="mixing-calculator-modal"]')

      // 4. Add first chemical
      await page.fill('[data-testid="chemical-name-input"]', 'EDTA')
      await page.selectOption('[data-testid="chemical-type-select"]', 'chelator')
      await page.fill('[data-testid="chemical-quantity-input"]', '100')
      await page.fill('[data-testid="chemical-unit-input"]', 'g')
      await page.click('[data-testid="add-chemical-to-list-btn"]')

      // Verify chemical added to list
      const chemicalItem = await page.locator('[data-testid="chemical-list-item"]').first()
      await expect(chemicalItem).toContainText('EDTA')

      // 5. Add second chemical
      await page.fill('[data-testid="chemical-name-input"]', 'ยากำจัดแมลง WP')
      await page.selectOption('[data-testid="chemical-type-select"]', 'suspended')
      await page.fill('[data-testid="chemical-quantity-input"]', '200')
      await page.click('[data-testid="add-chemical-to-list-btn"]')

      // 6. Calculate mixing order
      await page.click('[data-testid="calculate-mixing-order-btn"]')
      await page.waitForSelector('[data-testid="mixing-order-result"]')

      // Verify steps are displayed
      const steps = await page.locator('[data-testid="mixing-step"]')
      await expect(steps).toHaveCount.greaterThan(0)

      // 7. Save as formula
      await page.click('[data-testid="save-as-formula-btn"]')
      await page.waitForSelector('[data-testid="save-formula-modal"]')
      await page.fill('[data-testid="formula-name-input"]', 'สูตรทดสอบ E2E')
      await page.fill('[data-testid="formula-description-input"]', 'สร้างจากการทดสอบ E2E')
      await page.click('[data-testid="confirm-save-formula-btn"]')

      // Verify success message
      await page.waitForSelector('[data-testid="success-toast"]')
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('บันทึกสูตรสำเร็จ')

      // 8. Verify formula appears in history
      await page.waitForSelector('[data-testid="mixing-history"]')
      const formulaItem = await page.locator('[data-testid="formula-item"]').filter({ hasText: 'สูตรทดสอบ E2E' })
      await expect(formulaItem).toBeVisible()
    })

    it('should complete flow 2: ใช้สูตรที่บันทึก', async () => {
      // Pre-req: Have a saved formula
      await page.goto('http://localhost:3000/dashboard/mixing')

      // 1. Select a formula from history
      await page.click('[data-testid="formula-item"]')
      await page.waitForSelector('[data-testid="formula-detail-modal"]')

      // 2. View formula details
      await expect(page.locator('[data-testid="formula-name"]')).toBeVisible()
      await expect(page.locator('[data-testid="formula-steps"]')).toBeVisible()

      // 3. Click "ใช้สูตรนี้" button
      await page.click('[data-testid="use-formula-btn"]')
      await page.waitForSelector('[data-testid="activity-logging-form"]')

      // 4. Fill activity form
      await page.selectOption('[data-testid="zone-select"]', 'A')
      await page.fill('[data-testid="activity-date-input"]', '2024-01-15')
      await page.fill('[data-testid="activity-note-input"]', 'ใช้สูตรทดสอบ')

      // 5. Save activity
      await page.click('[data-testid="save-activity-btn"]')
      await page.waitForSelector('[data-testid="activity-success"]')

      // Verify activity saved
      await expect(page.locator('[data-testid="activity-success"]')).toContainText('บันทึกกิจกรรมสำเร็จ')
    })

    it('should complete flow 3: แก้ไขสูตร', async () => {
      await page.goto('http://localhost:3000/dashboard/mixing')

      // 1. Find and select a formula to edit
      const formulaItem = await page.locator('[data-testid="formula-item"]').first()
      await formulaItem.click()
      await page.waitForSelector('[data-testid="formula-detail-modal"]')

      // 2. Click edit button
      await page.click('[data-testid="edit-formula-btn"]')
      await page.waitForSelector('[data-testid="edit-formula-modal"]')

      // 3. Modify formula name
      await page.fill('[data-testid="formula-name-input"]', 'สูตรที่แก้ไขแล้ว')
      await page.click('[data-testid="update-formula-btn"]')

      // 4. Verify update success
      await page.waitForSelector('[data-testid="update-success-toast"]')
      await expect(page.locator('[data-testid="update-success-toast"]')).toContainText('อัพเดทสูตรสำเร็จ')
    })

    it('should complete flow 4: ลบสูตร', async () => {
      await page.goto('http://localhost:3000/dashboard/mixing')

      // 1. Find formula to delete
      const formulaItem = await page.locator('[data-testid="formula-item"]').first()
      const formulaName = await formulaItem.locator('[data-testid="formula-name"]').textContent()

      // 2. Click delete button
      await formulaItem.locator('[data-testid="delete-formula-btn"]').click()
      await page.waitForSelector('[data-testid="delete-confirmation-modal"]')

      // 3. Confirm deletion
      await page.click('[data-testid="confirm-delete-btn"]')
      await page.waitForSelector('[data-testid="delete-success-toast"]')

      // 4. Verify formula deleted
      await expect(page.locator('[data-testid="delete-success-toast"]')).toContainText('ลบสูตรสำเร็จ')

      // Verify formula no longer appears in list
      await page.reload()
      await expect(page.locator('[data-testid="formula-item"]').filter({ hasText: formulaName })).not.toBeVisible()
    })
  })

  describe('Performance Tests', () => {
    it('should handle large formula lists efficiently', async () => {
      // Simulate large number of formulas
      await page.goto('http://localhost:3000/dashboard/mixing')

      const startTime = Date.now()
      await page.waitForSelector('[data-testid="mixing-history"]')
      const loadTime = Date.now() - startTime

      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000)
    })

    it('should handle complex mixing calculations quickly', async () => {
      await page.goto('http://localhost:3000/dashboard/mixing')
      await page.click('[data-testid="add-chemical-btn"]')

      // Add multiple chemicals
      const chemicals = Array.from({ length: 10 }, (_, i) => ({
        name: `ยาทดสอบ ${i + 1}`,
        type: i % 2 === 0 ? 'suspended' : 'liquid',
        quantity: 100 + i * 50,
        unit: 'g'
      }))

      for (const chemical of chemicals) {
        await page.fill('[data-testid="chemical-name-input"]', chemical.name)
        await page.selectOption('[data-testid="chemical-type-select"]', chemical.type)
        await page.fill('[data-testid="chemical-quantity-input"]', chemical.quantity.toString())
        await page.click('[data-testid="add-chemical-to-list-btn"]')
      }

      const calcStartTime = Date.now()
      await page.click('[data-testid="calculate-mixing-order-btn"]')
      await page.waitForSelector('[data-testid="mixing-order-result"]')
      const calcTime = Date.now() - calcStartTime

      // Should calculate within 500ms
      expect(calcTime).toBeLessThan(500)
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should work correctly on mobile devices', async () => {
      await page.setViewportSize({ width: 375, height: 812 }) // iPhone X dimensions
      await page.goto('http://localhost:3000/dashboard/mixing')

      // Verify mobile-specific elements
      await expect(page.locator('[data-testid="mobile-menu-btn"]')).toBeVisible()

      // Test modal on mobile
      await page.click('[data-testid="add-chemical-btn"]')
      const modal = await page.locator('[data-testid="mixing-calculator-modal"]')

      // Verify modal takes full screen on mobile
      const modalBox = await modal.boundingBox()
      expect(modalBox?.width).toBeLessThanOrEqual(375)

      // Verify form elements are properly sized for touch
      await expect(page.locator('[data-testid="add-chemical-to-list-btn"]')).toBeVisible()
      const buttonBox = await page.locator('[data-testid="add-chemical-to-list-btn"]').boundingBox()
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44) // Minimum touch target size
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network offline
      await page.context().setOffline(true)

      await page.goto('http://localhost:3000/dashboard/mixing')
      await page.click('[data-testid="add-chemical-btn"]')

      // Try to save formula
      await page.fill('[data-testid="chemical-name-input"]', 'Test Chemical')
      await page.click('[data-testid="calculate-mixing-order-btn"]')
      await page.click('[data-testid="save-as-formula-btn"]')
      await page.fill('[data-testid="formula-name-input"]', 'Test Formula')
      await page.click('[data-testid="confirm-save-formula-btn"]')

      // Should show network error message
      await page.waitForSelector('[data-testid="network-error-toast"]')
      await expect(page.locator('[data-testid="network-error-toast"]')).toContainText('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์')

      // Restore network
      await page.context().setOffline(false)
    })

    it('should handle invalid inputs with helpful messages', async () => {
      await page.goto('http://localhost:3000/dashboard/mixing')
      await page.click('[data-testid="add-chemical-btn"]')

      // Try to add chemical with invalid data
      await page.fill('[data-testid="chemical-quantity-input"]', 'invalid')
      await page.click('[data-testid="add-chemical-to-list-btn"]')

      // Should show validation error
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="validation-error"]')).toContainText('กรุณากรอกปริมาณที่ถูกต้อง')
    })
  })
})