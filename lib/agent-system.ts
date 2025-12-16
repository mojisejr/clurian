/**
 * Agent System - Complete Context Management
 *
 * Export all agent-related functionality from one place
 */

// Core context management
export { agentContext } from './agent-context.js'
export type {
  AgentTask,
  AgentProgress,
  Checkpoint,
  LearningEntry
} from './agent-context.js'

// Orchestrator for agent coordination
export { orchestrator } from './agent-orchestrator.js'
export type {
  AgentDefinition,
  TaskDefinition
} from './agent-orchestrator.js'

// Main agent controller
export { mainAgent } from './main-agent.js'
export type {
  WorkflowInput
} from './main-agent.js'

// Convenience exports
export const agents = {
  // Create new workflow
  async execute(input: WorkflowInput) {
    return await mainAgent.executeWorkflow(input)
  },

  // Check status
  getStatus(workflowId?: string) {
    return {
      workflows: mainAgent.getWorkflowStatus(workflowId),
      agents: mainAgent.getAgentStatus()
    }
  },

  // Shutdown system
  async shutdown() {
    await mainAgent.shutdown()
    await agentContext.cleanup()
  }
}

// Type re-export
export type { WorkflowInput } from './main-agent'