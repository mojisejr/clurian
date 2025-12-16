/**
 * Agent Orchestrator - Main Agent Controller
 *
 * ควบคุมการทำงานของ sub-agents แบบ efficient
 * ใช้ memory-based communication + file-based backup
 */

import { agentContext, AgentTask, AgentProgress } from './agent-context'

export interface AgentDefinition {
  id: string
  type: string
  name: string
  status: 'idle' | 'busy' | 'error' | 'offline'
  lastSeen: number
  currentTask?: string
}

export interface TaskDefinition {
  id: string
  title: string
  type: string
  agentType: string
  phases: Array<{
    id: number
    name: string
    estimatedDuration: string
    dependencies?: number[]
  }>
  context: any
}

class AgentOrchestrator {
  private agents = new Map<string, AgentDefinition>()
  private taskQueue: TaskDefinition[] = []
  private runningTasks = new Map<string, TaskDefinition>()
  private heartbeatInterval?: NodeJS.Timeout

  constructor() {
    this.startHeartbeat()
  }

  // === AGENT MANAGEMENT ===

  registerAgent(agent: AgentDefinition): void {
    this.agents.set(agent.id, {
      ...agent,
      status: 'idle',
      lastSeen: Date.now()
    })

    // Register with context manager
    agentContext.registerAgent(agent.id, agent)

    console.log(`✅ Agent registered: ${agent.name} (${agent.id})`)
  }

  async assignTask(task: TaskDefinition): Promise<string> {
    // 1. Find available agent
    const agent = this.findAvailableAgent(task.agentType)
    if (!agent) {
      throw new Error(`No available agent for type: ${task.agentType}`)
    }

    // 2. Create agent task object
    const agentTask: AgentTask = {
      id: task.id,
      type: task.type,
      title: task.title,
      agentId: agent.id,
      phases: task.phases.map((p, idx) => ({
        id: p.id,
        name: p.name,
        status: idx === 0 ? 'pending' : 'pending'
      })),
      context: {
        ...task.context,
        phases: task.phases
      }
    }

    // 3. Store task in context
    await agentContext.createTask(agentTask)

    // 4. Update agent status
    agent.status = 'busy'
    agent.currentTask = task.id
    agent.lastSeen = Date.now()

    // 5. Send task to agent (memory-based)
    await this.sendTaskToAgent(agent.id, agentTask)

    console.log(`📋 Task assigned to ${agent.name}: ${task.title}`)
    return agent.id
  }

  // === TASK COMMUNICATION ===

  private async sendTaskToAgent(agentId: string, task: AgentTask): Promise<void> {
    // ในระบบจริง จะส่งผ่าน event, message queue, หรือ direct call
    // ตอนนี้ใช้วิธี update state ให้ agent อ่าน
    agentContext.updateAgentState(agentId, {
      task,
      command: 'execute'
    })
  }

  async handleTaskUpdate(
    agentId: string,
    taskId: string,
    update: Partial<AgentProgress>
  ): Promise<void> {
    // Update progress
    const progress = agentContext.getProgress(agentId) || {
      taskId,
      phase: 1,
      step: 0,
      status: '',
      progress: 0
    }

    Object.assign(progress, update)
    agentContext.updateProgress(agentId, progress)

    // Update agent last seen
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.lastSeen = Date.now()
    }

    console.log(`📊 ${agentId} progress: Phase ${progress.phase} - ${progress.status}`)

    // สร้าง checkpoint ทุก phase change
    if (update.phase && progress.phase !== update.phase) {
      await agentContext.createCheckpoint({
        timestamp: Date.now(),
        taskId,
        agentId,
        phase: progress.phase,
        step: progress.step,
        status: progress.status
      })
    }
  }

  async handleTaskComplete(
    agentId: string,
    taskId: string,
    result: AgentProgress & any
  ): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)

    // Create learning entry
    await agentContext.completeTask(taskId, {
      ...result,
      title: this.runningTasks.get(taskId)?.title || 'Unknown Task',
      agentId,
      taskId,
      duration: this.calculateDuration(taskId),
      success: result.status !== 'failed'
    })

    // Reset agent status
    agent.status = 'idle'
    agent.currentTask = undefined

    // Remove from running tasks
    this.runningTasks.delete(taskId)

    console.log(`✅ Task completed: ${taskId}`)

    // Process next task
    this.processQueue()
  }

  // === AGENT COORDINATION ===

  private findAvailableAgent(agentType: string): AgentDefinition | undefined {
    return Array.from(this.agents.values()).find(
      a => a.type === agentType && a.status === 'idle'
    )
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.checkAgentHealth()
    }, 30000) // Every 30 seconds
  }

  private async checkAgentHealth(): Promise<void> {
    const now = Date.now()
    const timeout = 60000 // 1 minute

    for (const [id, agent] of this.agents) {
      if (now - agent.lastSeen > timeout && agent.status === 'busy') {
        console.log(`⚠️ Agent timeout detected: ${id}`)

        // Try to recover from checkpoint
        const checkpoint = await agentContext.loadCheckpoint(id)
        if (checkpoint) {
          console.log(`🔄 Recovering agent ${id} from checkpoint`)
          agent.status = 'idle'
          agent.currentTask = undefined
          // TODO: Restart task with new agent
        } else {
          agent.status = 'offline'
        }
      }
    }
  }

  // === TASK QUEUE ===

  async queueTask(task: TaskDefinition): Promise<void> {
    this.taskQueue.push(task)
    await this.processQueue()
  }

  private async processQueue(): Promise<void> {
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!

      try {
        this.runningTasks.set(task.id, task)
        await this.assignTask(task)
      } catch (error: any) {
        console.error(`❌ Failed to assign task ${task.id}:`, error.message)
        // Could retry or move to dead letter queue
      }
    }
  }

  // === MONITORING ===

  getAgentStatus(): Record<string, any> {
    const status: Record<string, any> = {}

    for (const [id, agent] of this.agents) {
      const progress = agentContext.getProgress(id)
      status[id] = {
        name: agent.name,
        type: agent.type,
        status: agent.status,
        currentTask: agent.currentTask,
        progress,
        lastSeen: new Date(agent.lastSeen).toISOString()
      }
    }

    return status
  }

  async getTaskStatus(taskId: string): Promise<any> {
    const task = agentContext.getTask(taskId)
    if (!task) return null

    const progress = agentContext.getProgress(task.agentId)

    return {
      id: task.id,
      title: task.title,
      agentId: task.agentId,
      status: task.endTime ? 'completed' : progress?.status || 'unknown',
      phase: progress?.phase || 0,
      progress: progress?.progress || 0,
      startTime: task.startTime,
      endTime: task.endTime,
      duration: this.calculateDuration(taskId)
    }
  }

  // === UTILITIES ===

  private calculateDuration(taskId: string): string {
    const task = agentContext.getTask(taskId)
    if (!task) return '0s'

    const end = task.endTime || Date.now()
    const duration = Math.floor((end - (task.startTime || end)) / 1000)

    if (duration < 60) return `${duration}s`
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`
  }

  async shutdown(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    await agentContext.cleanup()
  }
}

// Export singleton
export const orchestrator = new AgentOrchestrator()

// Export types
export type { AgentDefinition, TaskDefinition }