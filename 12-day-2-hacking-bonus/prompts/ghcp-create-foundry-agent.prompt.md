# GHCP Prompt: Create Foundry Agent

Use in VS Code chat with GitHub Copilot to scaffold a mission-ready Foundry agent.

## Large Sample Prompt

Act as a senior Azure AI Foundry architect and implementation pair programmer.

Goal:
Create a production-minded Foundry agent definition for this use case:
- Agency: {{AGENCY_NAME}}
- Use case: {{SELECTED_USE_CASE}}
- User persona(s): {{USER_PERSONAS}}
- Mission outcome: {{MISSION_OUTCOME}}

Deliverables required:
1. Agent blueprint
   - Agent name
   - Role description
   - Non-goals
   - Success metrics
2. System instruction draft with:
   - Scope boundaries
   - Citation requirements
   - Escalation behavior
   - Safety and compliance constraints
3. Tooling plan
   - Knowledge sources needed
   - OpenAPI actions needed
   - Any multi-agent workflow recommendation
4. First-pass conversation test suite
   - 10 realistic user prompts
   - Expected response characteristics
5. Implementation file outputs in repo
   - README section updates
   - step_by_step additions
   - placeholder prompt/system files if needed

Engineering constraints:
- Prefer Foundry-native capabilities first.
- Minimize custom code unless required for integration.
- Keep all assumptions explicit.
- Do not hardcode secrets.

Output format:
- Section A: Proposed architecture
- Section B: Draft system instructions
- Section C: Build checklist
- Section D: Suggested git changes
- Section E: Next 5 commands to run in VS Code terminal

Quality bar:
- Must be demoable in one day
- Must map directly to at least one strategic priority
- Must include at least one measurable outcome

If information is missing:
- Ask concise clarifying questions first, then proceed with sensible defaults clearly labeled.
