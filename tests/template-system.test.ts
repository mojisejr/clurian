import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'

describe('Response Templates System', () => {
  const templatesDir = path.join(process.cwd(), '.claude', 'templates')
  const requiredTemplates = [
    'impl-response.md',
    'discuss-response.md',
    'error-response.md',
    'qa-checklist.md'
  ]

  describe('Template Directory Structure', () => {
    it('should create .claude/templates directory', async () => {
      // This test should FAIL initially (RED phase)
      const stats = await fs.stat(templatesDir)
      expect(stats.isDirectory()).toBe(true)
    })

    it('should create all required template files', async () => {
      // This test should FAIL initially (RED phase)
      for (const template of requiredTemplates) {
        const templatePath = path.join(templatesDir, template)
        const stats = await fs.stat(templatePath)
        expect(stats.isFile()).toBe(true)
      }
    })
  })

  describe('Template Content Validation', () => {
    it('impl-response.md should contain required sections', async () => {
      // This test should FAIL initially (RED phase)
      const templatePath = path.join(templatesDir, 'impl-response.md')
      const content = await fs.readFile(templatePath, 'utf-8')

      expect(content).toContain('## 🚀 Implementation:')
      expect(content).toContain('### Phase 0:')
      expect(content).toContain('### Phase 1:')
      expect(content).toContain('### Phase 2:')
      expect(content).toContain('### Phase 3:')
      expect(content).toContain('### Phase 4:')
      expect(content).toContain('### 📦 Summary')
    })

    it('discuss-response.md should contain required sections', async () => {
      // This test should FAIL initially (RED phase)
      const templatePath = path.join(templatesDir, 'discuss-response.md')
      const content = await fs.readFile(templatePath, 'utf-8')

      expect(content).toContain('## 📋 Analysis & Discussion')
      expect(content).toContain('### 🔍 Current State')
      expect(content).toContain('### 💡 Recommendations')
      expect(content).toContain('### 🎯 Next Steps')
    })

    it('error-response.md should contain required sections', async () => {
      // This test should FAIL initially (RED phase)
      const templatePath = path.join(templatesDir, 'error-response.md')
      const content = await fs.readFile(templatePath, 'utf-8')

      expect(content).toContain('## ❌ Error Report')
      expect(content).toContain('### Error Type:')
      expect(content).toContain('### 🔧 Solution Applied')
      expect(content).toContain('### ✅ Verification')
    })

    it('qa-checklist.md should contain validation checklist', async () => {
      // This test should FAIL initially (RED phase)
      const templatePath = path.join(templatesDir, 'qa-checklist.md')
      const content = await fs.readFile(templatePath, 'utf-8')

      expect(content).toContain('## ✅ QA Checklist')
      expect(content).toContain('- [ ] Build passes')
      expect(content).toContain('- [ ] Lint passes')
      expect(content).toContain('- [ ] Tests pass')
      expect(content).toContain('- [ ] TypeScript passes')
    })
  })

  describe('Template Variables', () => {
    it('impl-response.md should contain variable placeholders', async () => {
      // This test should FAIL initially (RED phase)
      const templatePath = path.join(templatesDir, 'impl-response.md')
      const content = await fs.readFile(templatePath, 'utf-8')

      expect(content).toContain('{{TASK_TITLE}}')
      expect(content).toContain('{{FILE_COUNT}}')
      expect(content).toContain('{{TEST_COUNT}}')
      expect(content).toContain('{{BRANCH_NAME}}')
    })
  })

  describe('Integration with Commands', () => {
    it('impl.md should reference templates directory', async () => {
      // This test should FAIL initially (RED phase)
      const implCommandPath = path.join(process.cwd(), '.claude', 'commands', 'impl.md')
      const content = await fs.readFile(implCommandPath, 'utf-8')

      expect(content).toContain('.claude/templates/')
      expect(content).toContain('Response Format')
    })

    it('discuss.md should reference templates directory', async () => {
      // This test should FAIL initially (RED phase)
      const discussCommandPath = path.join(process.cwd(), '.claude', 'commands', 'discuss.md')
      const content = await fs.readFile(discussCommandPath, 'utf-8')

      expect(content).toContain('.claude/templates/')
      expect(content).toContain('Response Format')
    })
  })
})