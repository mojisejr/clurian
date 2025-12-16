# Analysis and Discussion Mode Command

## Usage
```
/discuss [topic or question]
/analyze [topic or question]
```

## Purpose
This command is for analysis, discussion, planning, and exploration WITHOUT any code implementation. Use this when you want to:
- Discuss architecture decisions
- Analyze existing code
- Plan implementation approaches
- Review current state
- Ask questions about features
- Explore options and alternatives

## What I CAN do in /discuss mode:
✅ Read and analyze existing files
✅ Search through codebase
✅ Discuss implementation approaches
✅ Plan architecture changes
✅ Review code patterns
✅ Suggest best practices
✅ Answer questions about functionality
✅ Create todo lists for planning
✅ Use the Task tool for exploration/research
✅ Ask clarifying questions

## What I CANNOT do in /discuss mode:
❌ Write or modify ANY code
❌ Create new files
❌ Edit existing files
❌ Run implementation commands
❌ Execute build/test/lint
❌ Commit changes
❌ Create PRs

## When to use /discuss:
- Before starting implementation (planning phase)
- When unsure about approach
- When comparing multiple options
- When analyzing bugs or issues
- When reviewing current implementation
- When discussing feature requirements

## Flow:
1. Receive topic/question
2. Analyze existing codebase if relevant
3. Provide detailed analysis or discussion
4. Ask follow-up questions if needed
5. Wait for user to decide on next steps

## Important Notes:
- This is PURELY for analysis and discussion
- NO code changes will be made
- NO files will be created or modified
- The goal is to help you make informed decisions
- Use `/impl` when ready to implement

## Example Usage:
```
/discuss How should we handle tree health monitoring?
/discuss What's the best approach for batch activities?
/discuss Can you review the current authentication flow?
/discuss Should we add a notification system?
```

## Transition to Implementation:
## Response Format
When completing /discuss workflow, use response template from:
`.claude/templates/discuss-response.md`

## Transition to Implementation
When discussion is complete and you're ready to implement:
```
/impl [task description]
```

This will switch to full implementation workflow with TDD.