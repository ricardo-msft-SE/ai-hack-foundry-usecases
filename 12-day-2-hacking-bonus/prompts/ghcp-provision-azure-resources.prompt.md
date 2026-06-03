# GHCP Prompt: Provision Azure Resources

Use in VS Code chat with GitHub Copilot to generate and execute provisioning steps for the selected accelerator solution.

## Large Sample Prompt

Act as an Azure platform engineer helping me provision only the resources needed for this Day 2 prototype.

Context:
- Subscription: {{SUBSCRIPTION_ID_OR_NAME}}
- Target region: {{AZURE_REGION}}
- Environment name: {{ENV_NAME}}
- Use case: {{SELECTED_USE_CASE}}
- Preferred provisioning style: {{AZCLI_OR_AZD_OR_BICEP}}

Requirements:
1. Produce a minimal resource plan first (cost-aware).
2. Include rationale for each resource.
3. Include naming conventions and tags.
4. Include RBAC assignments with least privilege.
5. Include identity/auth approach for app-to-app calls.
6. Include post-provision validation commands.

Expected resources (adjust based on use case):
- Azure AI Foundry project/workspace dependencies
- Model deployment references
- Azure AI Search if retrieval is needed
- Storage account if artifacts/logs are needed
- Web hosting target if deployment is in scope

Output format:
- Step 1: Resource plan table (service, purpose, SKU, cost notes)
- Step 2: Executable commands grouped by phase
- Step 3: Verification checklist
- Step 4: Rollback/cleanup commands

Command quality rules:
- Commands must be copy-paste ready.
- Use placeholders where tenant-specific values are required.
- Include comments for dangerous or billable actions.
- Avoid destructive actions unless explicitly requested.

Compliance/safety:
- Apply secure defaults where possible.
- Prefer managed identity over secrets.
- Explicitly call out anything non-production in this hackathon setup.

Finish by asking:
- "Do you want me to execute these commands now or save them as scripts in the repo?"
