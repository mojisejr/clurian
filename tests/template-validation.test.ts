import { describe, it, expect } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'

describe('Template Validation', () => {
  const templatesDir = path.join(process.cwd(), '.claude', 'templates')

  describe('Markdown Structure Validation', () => {
    it('should validate heading levels are consistent', async () => {
      // This test should FAIL initially (RED phase)
      const implTemplatePath = path.join(templatesDir, 'impl-response.md')
      const content = await fs.readFile(implTemplatePath, 'utf-8')

      const lines = content.split('\n')
      const headings = lines.filter(line => line.startsWith('#'))

      // Should have proper heading hierarchy
      expect(headings.some(h => h.startsWith('## '))).toBe(true)
      expect(headings.some(h => h.startsWith('### '))).toBe(true)

      // Should not skip heading levels
      const hasH1 = headings.some(h => h.startsWith('# '))
      const hasH2 = headings.some(h => h.startsWith('## '))
      const hasH3 = headings.some(h => h.startsWith('### '))

      if (hasH3) {
        expect(hasH2).toBe(true) // H3 should not exist without H2
      }
      if (hasH2) {
        expect(hasH1).toBe(true) // H2 should not exist without H1
      }
    })

    it('should validate template variable syntax', async () => {
      // This test should FAIL initially (RED phase)
      const implTemplatePath = path.join(templatesDir, 'impl-response.md')
      const content = await fs.readFile(implTemplatePath, 'utf-8')

      // Should use consistent variable syntax {{VARIABLE_NAME}}
      const variableMatches = content.match(/\{\{[^}]+\}\}/g) || []

      expect(variableMatches.length).toBeGreaterThan(0)

      // All variables should follow the pattern
      variableMatches.forEach(variable => {
        expect(variable).toMatch(/^\{\{[A-Z_][A-Z0-9_]*\}\}$/)
      })
    })

    it('should validate checklist formatting', async () => {
      // This test should FAIL initially (RED phase)
      const qaTemplatePath = path.join(templatesDir, 'qa-checklist.md')
      const content = await fs.readFile(qaTemplatePath, 'utf-8')

      // Should have properly formatted checkboxes
      const checkboxMatches = content.match(/- \[[ x]\]/g) || []

      expect(checkboxMatches.length).toBeGreaterThan(0)

      // All checkboxes should be unchecked in templates
      checkboxMatches.forEach(checkbox => {
        expect(checkbox).toBe('- [ ]')
      })
    })
  })

  describe('Content Completeness Validation', () => {
    it('should validate impl template contains all required sections', async () => {
      // This test should FAIL initially (RED phase)
      const implTemplatePath = path.join(templatesDir, 'impl-response.md')
      const content = await fs.readFile(implTemplatePath, 'utf-8')

      const requiredSections = [
        '## 🚀 Implementation:',
        '### Phase 0: Analysis',
        '### Phase 1: Testing',
        '### Phase 2: Implementation',
        '### Phase 3: Refactoring',
        '### Phase 4: QA',
        '### 📦 Summary'
      ]

      requiredSections.forEach(section => {
        expect(content).toContain(section)
      })
    })

    it('should validate discuss template contains analysis elements', async () => {
      // This test should FAIL initially (RED phase)
      const discussTemplatePath = path.join(templatesDir, 'discuss-response.md')
      const content = await fs.readFile(discussTemplatePath, 'utf-8')

      const requiredElements = [
        '## 📋 Analysis & Discussion',
        '### 🔍 Current State',
        '### 💡 Recommendations',
        '### 🎯 Next Steps',
        '### 📊 Considerations'
      ]

      requiredElements.forEach(element => {
        expect(content).toContain(element)
      })
    })

    it('should validate error template contains reporting elements', async () => {
      // This test should FAIL initially (RED phase)
      const errorTemplatePath = path.join(templatesDir, 'error-response.md')
      const content = await fs.readFile(errorTemplatePath, 'utf-8')

      const requiredElements = [
        '## ❌ Error Report',
        '### Error Type:',
        '### 🔧 Solution Applied',
        '### ✅ Verification',
        '### 📍 File Location',
        '### 🚨 Severity'
      ]

      requiredElements.forEach(element => {
        expect(content).toContain(element)
      })
    })
  })

  describe('Thai Language Support Validation', () => {
    it('should support Thai language placeholders', async () => {
      // This test should FAIL initially (RED phase)
      const implTemplatePath = path.join(templatesDir, 'impl-response.md')
      const content = await fs.readFile(implTemplatePath, 'utf-8')

      // Should have Thai language support indicator
      expect(content).toMatch(/ภาษาไทย|Thai|ภาษา/)
    })

    it('should have proper Unicode encoding support', async () => {
      // This test should FAIL initially (RED phase)
      const implTemplatePath = path.join(templatesDir, 'impl-response.md')
      const content = await fs.readFile(implTemplatePath, 'utf-8')

      // Should handle Unicode characters properly
      expect(content).toContain('🚀') // Emoji should be preserved
      expect(content.length).toBeGreaterThan(0)
    })
  })

  describe('Integration Validation', () => {
    it('should validate .claude directory structure integrity', async () => {
      // This test should FAIL initially (RED phase)
      const claudeDir = path.join(process.cwd(), '.claude')
      const commandsDir = path.join(claudeDir, 'commands')
      const templatesDir = path.join(claudeDir, 'templates')

      // Both directories should exist
      const claudeExists = await fs.access(claudeDir).then(() => true).catch(() => false)
      const commandsExists = await fs.access(commandsDir).then(() => true).catch(() => false)
      const templatesExists = await fs.access(templatesDir).then(() => true).catch(() => false)

      expect(claudeExists).toBe(true)
      expect(commandsExists).toBe(true)
      expect(templatesExists).toBe(true)
    })

    it('should validate template files are not in gitignore accidentally', async () => {
      // This test should FAIL initially (RED phase)
      const gitignorePath = path.join(process.cwd(), '.gitignore')
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8')

      // Templates should not be ignored (they should be committed)
      expect(gitignoreContent).not.toContain('.claude/templates/')
    })
  })
})