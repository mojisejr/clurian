import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'

/**
 * Agent Context Management System
 *
 * ใช้จัดการ memory สำหรับ agent system
 * - Runtime: Memory-based (เร็ว)
 * - Backup: .tmp-context (recovery)
 * - Long-term: .clurian-context (Thai, readable)
 */

export interface AgentTask {
  id: string
  type: string
  title: string
  agentId: string
  phases: Array<{
    id: number
    name: string
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
  }>
  context: {
    issueNumber?: number
    requirements: string[]
    files: string[]
  }
  startTime?: number
  endTime?: number
}

export interface AgentProgress {
  taskId: string
  phase: number
  step: number
  status: string
  progress: number // 0-100
}

export interface Checkpoint {
  timestamp: number
  taskId: string
  agentId: string
  phase: number
  step: number
  status: string
  agentState?: any
}

export interface LearningEntry {
  title: string
  agentId: string
  taskId: string
  issueNumber?: number
  duration: string
  success: boolean
  learnings: string[]
  problems: string[]
  solutions: string[]
  files: string[]
  metrics?: Record<string, any>
}

class AgentContextManager {
  private tmpContextPath = '.tmp-context'
  private longTermPath = '.clurian-context'
  private agentStates = new Map<string, any>() // Runtime memory
  private tasks = new Map<string, AgentTask>() // Active tasks
  private progress = new Map<string, AgentProgress>() // Progress tracking

  constructor() {
    this.ensureDirectories()
  }

  // === TASK MANAGEMENT ===

  async createTask(task: AgentTask): Promise<void> {
    task.startTime = Date.now()
    this.tasks.set(task.id, task)

    // สร้าง checkpoint สำหรับ recovery
    await this.createCheckpoint({
      timestamp: Date.now(),
      taskId: task.id,
      agentId: task.agentId,
      phase: 0,
      step: 0,
      status: 'created'
    })
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId)
  }

  async completeTask(taskId: string, result: AgentProgress & LearningEntry): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error(`Task ${taskId} not found`)

    task.endTime = Date.now()

    // สร้าง long-term knowledge (Thai format)
    await this.createLearningEntry(result)

    // Cleanup
    await this.cleanupTask(taskId)
  }

  // === PROGRESS TRACKING ===

  updateProgress(agentId: string, progress: AgentProgress): void {
    this.progress.set(agentId, progress)

    // Main agent สามารถอ่านได้ทันที
    const agentState = this.agentStates.get(agentId)
    if (agentState) {
      agentState.progress = progress
    }
  }

  getProgress(agentId: string): AgentProgress | undefined {
    return this.progress.get(agentId)
  }

  // === CHECKPOINT MANAGEMENT (tmp-context) ===

  async createCheckpoint(checkpoint: Checkpoint): Promise<void> {
    const filename = `checkpoint-${checkpoint.agentId}.json`
    const filepath = `${this.tmpContextPath}/${filename}`

    await fsPromises.writeFile(filepath, JSON.stringify(checkpoint, null, 2))
  }

  async loadCheckpoint(agentId: string): Promise<Checkpoint | null> {
    const filename = `checkpoint-${agentId}.json`
    const filepath = `${this.tmpContextPath}/${filename}`

    try {
      const content = await fsPromises.readFile(filepath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  // === LONG-TERM KNOWLEDGE (clurian-context) ===

  async createLearningEntry(entry: LearningEntry): Promise<void> {
    const date = new Date().toISOString().split('T')[0]
    const time = new Date().toLocaleTimeString('th-TH')

    const content = `# ${entry.title}

## 📋 ข้อมูลการทำงาน
- **วันที่**: ${date} ${time}
- **Agent**: ${entry.agentId}
- **Task ID**: ${entry.taskId}
- **Issue**: #${entry.issueNumber || 'N/A'}
- **ระยะเวลา**: ${entry.duration}
- **สถานะ**: ${entry.success ? '✅ สำเร็จ' : '❌ ล้มเหลว'}

## ✅ สิ่งที่ทำไป

${entry.learnings.map((learning, idx) => `${idx + 1}. ${learning}`).join('\n')}

## 💡 สิ่งที่ได้เรียนรู้

${entry.learnings.filter(l => l.includes('เรียนรู้') || l.includes('พบว่า')).map(l => `- ${l}`).join('\n')}

## ⚠️ ปัญหาที่เจอ

${entry.problems.map(p => `- ${p}`).join('\n')}

${entry.solutions.length > 0 ? `
## 🔧 วิธีแก้ปัญหา

${entry.solutions.map(s => `- ${s}`).join('\n')}
` : ''}

## 📁 ไฟล์ที่เกี่ยวข้อง

${entry.files.map(f => `- \`${f}\``).join('\n')}

${entry.metrics ? `
## 📊 Metrics

${Object.entries(entry.metrics).map(([k, v]) => `- **${k}**: ${v}`).join('\n')}
` : ''}

## 🔗 ข้อมูลที่เกี่ยวข้อง

ต้องการเพิ่ม links:
- [[Database Performance]]
- [[Agent Coordination]]
- [[TDD Workflow]]

---

tags: #agent/${entry.agentId} #completed #${date} ${entry.success ? '#success' : '#failed'}
`

    // เขียนลง folder 01-รวมงานที่ทำ
    const filename = `${date} ${entry.title.replace(/[/\\?%*:|"<>]/g, '-')}.md`
    const filepath = `${this.longTermPath}/01-รวมงานที่ทำ/${filename}`
    await fsPromises.writeFile(filepath, content)

    // ถ้ามี learnings พิเศษ เก็บไว้ใน 02-สิ่งที่เรียนรู้
    if (entry.learnings.some(l => l.includes('เรียนรู้'))) {
      const learningFilename = `${date} Learning from ${entry.title}.md`
      const learningPath = `${this.longTermPath}/02-สิ่งที่เรียนรู้/${learningFilename}`
      await fsPromises.writeFile(learningPath, content)
    }
  }

  // === AGENT STATE MANAGEMENT ===

  registerAgent(agentId: string, state: any): void {
    this.agentStates.set(agentId, {
      ...state,
      registeredAt: Date.now(),
      lastSeen: Date.now()
    })
  }

  updateAgentState(agentId: string, updates: any): void {
    const current = this.agentStates.get(agentId)
    if (current) {
      this.agentStates.set(agentId, {
        ...current,
        ...updates,
        lastSeen: Date.now()
      })
    }
  }

  getAgentState(agentId: string): any {
    return this.agentStates.get(agentId)
  }

  getActiveAgents(): string[] {
    return Array.from(this.agentStates.keys())
  }

  // === CLEANUP ===

  async cleanupTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) return

    // Remove from active memory
    this.tasks.delete(taskId)
    this.progress.delete(task.agentId)

    // Delete checkpoint
    try {
      await fsPromises.unlink(`${this.tmpContextPath}/checkpoint-${task.agentId}.json`)
    } catch {
      // Ignore if file doesn't exist
    }
  }

  async cleanup(): Promise<void> {
    // Clean up old checkpoints (older than 1 hour)
    const files = await fsPromises.readdir(this.tmpContextPath)
    for (const file of files) {
      if (file.startsWith('checkpoint-')) {
        const filepath = `${this.tmpContextPath}/${file}`
        const stats = await fsPromises.stat(filepath)
        if (Date.now() - stats.mtime.getTime() > 60 * 60 * 1000) {
          await fsPromises.unlink(filepath)
        }
      }
    }
  }

  // === UTILITIES ===

  private ensureDirectories(): void {
    const dirs = [
      this.tmpContextPath,
      `${this.longTermPath}/01-รวมงานที่ทำ`,
      `${this.longTermPath}/02-สิ่งที่เรียนรู้`,
      `${this.longTermPath}/03-ปัญหาที่พบ`,
      `${this.longTermPath}/04-Agent-Profiles`
    ]

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  // For debugging and monitoring
  async getContextStats(): Promise<any> {
    return {
      activeTasks: this.tasks.size,
      agentStates: this.agentStates.size,
      tmpFiles: (await fsPromises.readdir(this.tmpContextPath)).length,
      longTermFiles: (await fsPromises.readdir(`${this.longTermPath}/01-รวมงานที่ทำ`)).length
    }
  }
}

// Singleton instance
export const agentContext = new AgentContextManager()

// Export for use in agents
// Types are already exported above