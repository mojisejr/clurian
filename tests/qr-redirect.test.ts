import { describe, it, expect } from 'vitest'

describe('QR Code Redirect Flow', () => {
  it('should generate correct QR URL with encoded redirect', () => {
    const baseUrl = 'https://clurian.vercel.app'
    const treeId = 'test-tree-123'
    const treeDetailUrl = `${baseUrl}/dashboard?treeId=${treeId}`
    const loginUrl = `${baseUrl}/login?redirect=${encodeURIComponent(treeDetailUrl)}`
    
    expect(loginUrl).toBe('https://clurian.vercel.app/login?redirect=https%3A%2F%2Fclurian.vercel.app%2Fdashboard%3FtreeId%3Dtest-tree-123')
  })

  it('should decode redirect parameter correctly', () => {
    const encodedRedirect = 'https%3A%2F%2Fclurian.vercel.app%2Fdashboard%3FtreeId%3Dtest-tree-123'
    const decoded = decodeURIComponent(encodedRedirect)
    
    expect(decoded).toBe('https://clurian.vercel.app/dashboard?treeId=test-tree-123')
  })

  it('should extract treeId from decoded URL', () => {
    const redirectUrl = 'https://clurian.vercel.app/dashboard?treeId=test-tree-123'
    const url = new URL(redirectUrl)
    const treeId = url.searchParams.get('treeId')
    
    expect(treeId).toBe('test-tree-123')
  })

  it('should handle relative redirect URLs', () => {
    const relativeRedirect = '/dashboard?treeId=test-tree-123'
    const url = new URL(relativeRedirect, 'https://clurian.vercel.app')
    const treeId = url.searchParams.get('treeId')
    
    expect(treeId).toBe('test-tree-123')
  })
})
