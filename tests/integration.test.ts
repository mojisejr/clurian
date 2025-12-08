import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../lib/prisma'

describe('Database Integration Tests', () => {
  const testUserEmail = `test-integration-${Date.now()}@example.com`
  let userId: string

  beforeAll(async () => {
    // Ensure connection
    await prisma.$connect()
  })

  afterAll(async () => {
    // Cleanup
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    }
    await prisma.$disconnect()
  })

  it('should connect to the database', async () => {
    const result = await prisma.$queryRaw`SELECT 1`
    expect(result).toBeTruthy()
  })

  it('should create a new user', async () => {
    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'Integration Test User',
      },
    })
    expect(user).toBeDefined()
    expect(user.email).toBe(testUserEmail)
    userId = user.id
  })

  it('should fetch the created user', async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    expect(user).toBeDefined()
    expect(user?.name).toBe('Integration Test User')
  })

  it('should update the user', async () => {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: 'Updated Test User' },
    })
    expect(updatedUser.name).toBe('Updated Test User')
  })

  it('should delete the user', async () => {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    })
    expect(deletedUser.id).toBe(userId)

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    expect(user).toBeNull()
    userId = '' // Prevent cleanup from trying to delete again
  })
})
