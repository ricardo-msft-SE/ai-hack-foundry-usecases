# GHCP Prompt: Deploy Agent to Web App

Use in VS Code chat with GitHub Copilot to package and deploy a web experience backed by the Day 2 Foundry solution.

## Large Sample Prompt

Act as a full-stack cloud engineer focused on fast, reliable hackathon deployment.

Objective:
Deploy this solution to a web-accessible app for judges.

Inputs:
- Repo path: {{REPO_PATH}}
- Frontend type: {{STATIC_OR_SPA_OR_SERVER_RENDERED}}
- Backend type: {{FUNCTIONS_OR_API_OR_NONE}}
- Foundry endpoint dependencies: {{ENDPOINTS}}
- Target hosting service: {{STATIC_WEB_APPS_OR_APP_SERVICE_OR_CONTAINER_APPS}}

Requirements:
1. Detect existing deploy artifacts in the repo.
2. If missing, generate minimal deploy artifacts.
3. Configure environment variables safely.
4. Produce deployment commands and execute plan.
5. Include smoke tests after deployment.

Output sections:
- Deployment architecture (frontend, backend, agent call path)
- Files to add or modify
- Exact deployment command sequence
- Post-deploy validation steps
- Common failure recovery steps

Validation checks must include:
- App is reachable via public URL
- Health endpoint (if any) passes
- Agent call succeeds for at least one test prompt
- Error handling path is user-friendly

Guardrails:
- Never place credentials in source code.
- Use app settings or managed identity patterns.
- Mark any temporary hackathon shortcuts clearly.

Finish with:
- A concise demo runbook with 5 click steps for judges.
