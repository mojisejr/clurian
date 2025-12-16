/**
 * Main Agent - Orchestrates sub-agents for TDD implementation
 *
 * Usage:
 * const mainAgent = new MainAgent()
 * await mainAgent.executeWorkflow({
 *   title: "Tree Sorting Optimization",
 *   type: "tdd-implementation",
 *   issueNumber: 45
 * })
 */

import { orchestrator, TaskDefinition } from './agent-orchestrator'
import { agentContext } from './agent-context'

export interface WorkflowInput {
  title: string
  type: 'tdd-implementation' | 'bug-fix' | 'feature'
  issueNumber?: number
  requirements?: string[]
  files?: string[]
  priority?: 'low' | 'medium' | 'high'
}

interface WorkflowPhase {
  id: number
  name: string
  agentType: string
  estimatedDuration: string
  description: string
  deliverables: string[]
}

export class MainAgent {
  private workflows = new Map<string, WorkflowInput>()
  private activeWorkflows = new Set<string>()

  constructor() {
    this.registerDefaultAgents()
  }

  private registerDefaultAgents(): void {
    // Register available sub-agents
    orchestrator.registerAgent({
      id: 'tdd-implementer-001',
      type: 'tdd-implementer',
      name: 'TDD Autonomous Implementer',
      status: 'idle',
      lastSeen: Date.now()
    })

    orchestrator.registerAgent({
      id: 'auto-reviewer-001',
      type: 'auto-reviewer',
      name: 'Auto Code Reviewer',
      status: 'idle',
      lastSeen: Date.now()
    })

    orchestrator.registerAgent({
      id: 'github-reporter-001',
      type: 'github-reporter',
      name: 'GitHub Reporter',
      status: 'idle',
      lastSeen: Date.now()
    })
  }

  async executeWorkflow(input: WorkflowInput): Promise<string> {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    this.workflows.set(workflowId, input)
    this.activeWorkflows.add(workflowId)

    console.log(`🚀 Starting workflow: ${input.title}`)
    console.log(`   Type: ${input.type}`)
    console.log(`   Issue: #${input.issueNumber || 'N/A'}`)

    try {
      switch (input.type) {
        case 'tdd-implementation':
          return await this.executeTDDWorkflow(workflowId, input)
        case 'bug-fix':
          return await this.executeBugFixWorkflow(workflowId, input)
        case 'feature':
          return await this.executeFeatureWorkflow(workflowId, input)
        default:
          throw new Error(`Unknown workflow type: ${input.type}`)
      }
    } catch (error: any) {
      console.error(`❌ Workflow failed: ${error.message}`)
      this.activeWorkflows.delete(workflowId)
      throw error
    }
  }

  private async executeTDDWorkflow(
    workflowId: string,
    input: WorkflowInput
  ): Promise<string> {
    const phases: WorkflowPhase[] = [
      {
        id: 1,
        name: 'Write Tests',
        agentType: 'tdd-implementer',
        estimatedDuration: '15m',
        description: 'เขียน unit tests และ integration tests',
        deliverables: ['tests/domain.test.ts', 'tests/integration.test.ts']
      },
      {
        id: 2,
        name: 'Implement Feature',
        agentType: 'tdd-implementer',
        estimatedDuration: '25m',
        description: 'Implement core functionality',
        deliverables: ['lib/services/', 'app/api/']
      },
      {
        id: 3,
        name: 'Refactor Code',
        agentType: 'tdd-implementer',
        estimatedDuration: '10m',
        description: 'Optimize and clean up code',
        deliverables: ['Code optimization', 'Performance improvements']
      },
      {
        id: 4,
        name: 'Code Review',
        agentType: 'auto-reviewer',
        estimatedDuration: '10m',
        description: 'Review code for issues and best practices',
        deliverables: ['Code review report', 'Fixes applied']
      },
      {
        id: 5,
        name: 'Quality Assurance',
        agentType: 'tdd-implementer',
        estimatedDuration: '5m',
        description: 'Run build, lint, tests',
        deliverables: ['100% QA pass']
      }
    ]

    return await this.executePhases(workflowId, input, phases)
  }

  private async executeBugFixWorkflow(
    workflowId: string,
    input: WorkflowInput
  ): Promise<string> {
    const phases: WorkflowPhase[] = [
      {
        id: 1,
        name: 'Investigate Bug',
        agentType: 'tdd-implementer',
        estimatedDuration: '10m',
        description: 'Analyze and reproduce the bug',
        deliverables: ['Bug reproduction steps', 'Root cause analysis']
      },
      {
        id: 2,
        name: 'Write Failing Test',
        agentType: 'tdd-implementer',
        estimatedDuration: '10m',
        description: 'Write test that reproduces the bug',
        deliverables: ['Failing test case']
      },
      {
        id: 3,
        name: 'Fix Bug',
        agentType: 'tdd-implementer',
        estimatedDuration: '15m',
        description: 'Implement fix for the bug',
        deliverables: ['Bug fix implemented']
      },
      {
        id: 4,
        name: 'Verify Fix',
        agentType: 'auto-reviewer',
        estimatedDuration: '5m',
        description: 'Ensure fix works and doesn\'t break anything',
        deliverables: ['Verification complete']
      }
    ]

    return await this.executePhases(workflowId, input, phases)
  }

  private async executeFeatureWorkflow(
    workflowId: string,
    input: WorkflowInput
  ): Promise<string> {
    // Similar to TDD but may have different phases
    return await this.executeTDDWorkflow(workflowId, input)
  }

  private async executePhases(
    workflowId: string,
    input: WorkflowInput,
    phases: WorkflowPhase[]
  ): Promise<string> {
    const results: string[] = []

    for (const phase of phases) {
      console.log(`\n📋 Phase ${phase.id}: ${phase.name}`)
      console.log(`   Agent: ${phase.agentType}`)
      console.log(`   Duration: ${phase.estimatedDuration}`)

      // Create task for this phase
      const taskId = `${workflowId}-phase-${phase.id}`
      const task: TaskDefinition = {
        id: taskId,
        title: `${input.title} - Phase ${phase.id}: ${phase.name}`,
        type: input.type,
        agentType: phase.agentType,
        phases: [{
          id: phase.id,
          name: phase.name,
          estimatedDuration: phase.estimatedDuration
        }],
        context: {
          workflowId,
          issueNumber: input.issueNumber,
          requirements: input.requirements || [],
          files: input.files || [],
          phase,
          previousResults: results,
          fullWorkflow: input
        }
      }

      // Assign task to agent
      try {
        const agentId = await orchestrator.assignTask(task)

        // Wait for completion (polling or callback)
        await this.waitForTaskCompletion(agentId, taskId)

        // Collect results
        const taskResult = await this.getTaskResults(taskId)
        results.push(`Phase ${phase.id} completed: ${taskResult.summary}`)

        console.log(`   ✅ Phase ${phase.id} completed`)
      } catch (error: any) {
        console.error(`   ❌ Phase ${phase.id} failed: ${error.message}`)
        throw error
      }
    }

    // Generate final report
    const reportId = await this.generateReport(workflowId, input, results)

    this.activeWorkflows.delete(workflowId)
    console.log(`\n✨ Workflow completed: ${reportId}`)

    return reportId
  }

  private async waitForTaskCompletion(
    agentId: string,
    taskId: string,
    timeout: number = 3600000 // 1 hour
  ): Promise<void> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const status = await orchestrator.getTaskStatus(taskId)

      if (status?.status === 'completed') {
        return
      }

      if (status?.status === 'failed') {
        throw new Error(`Task ${taskId} failed`)
      }

      // Check progress every 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000))

      // Log progress
      if (status?.progress) {
        console.log(`   Progress: ${status.progress}% - ${status.status}`)
      }
    }

    throw new Error(`Task ${taskId} timed out`)
  }

  private async getTaskResults(taskId: string): Promise<any> {
    // This would read from the context store
    const task = agentContext.getTask(taskId)
    return {
      summary: task ? `Completed in ${this.calculateDuration(task)}` : 'Unknown',
      task
    }
  }

  private async generateReport(
    workflowId: string,
    input: WorkflowInput,
    results: string[]
  ): Promise<string> {
    const reportId = `report-${Date.now()}`

    // Use github-reporter agent
    await orchestrator.assignTask({
      id: reportId,
      title: `Generate Report: ${input.title}`,
      type: 'report',
      agentType: 'github-reporter',
      phases: [{
        id: 1,
        name: 'Create Report',
        estimatedDuration: '5m'
      }],
      context: {
        workflowId,
        workflowInput: input,
        results,
        timestamp: new Date().toISOString()
      }
    })

    return reportId
  }

  private calculateDuration(task: any): string {
    if (!task.startTime) return 'Unknown'

    const end = task.endTime || Date.now()
    const duration = Math.floor((end - task.startTime) / 1000)

    if (duration < 60) return `${duration}s`
    if (duration < 3600) return `${Math.floor(duration / 60)}m`
    return `${Math.floor(duration / 3600)}h`
  }

  // Monitoring methods
  getWorkflowStatus(workflowId?: string): any {
    if (workflowId) {
      return this.workflows.get(workflowId)
    }

    return {
      total: this.workflows.size,
      active: this.activeWorkflows.size,
      workflows: Array.from(this.workflows.entries()).map(([id, wf]) => ({
        id,
        ...wf,
        active: this.activeWorkflows.has(id)
      }))
    }
  }

  getAgentStatus(): any {
    return orchestrator.getAgentStatus()
  }

  async shutdown(): Promise<void> {
    await orchestrator.shutdown()
  }
}

// Export singleton instance
export const mainAgent = new MainAgent()

// Export for direct use
// WorkflowInput is already exported above