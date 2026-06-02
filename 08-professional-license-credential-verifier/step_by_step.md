# Professional License Credential Verifier — Step-by-Step Deployment Guide

This guide walks you through deploying the Professional License Credential Verifier agent in Azure AI Foundry. Estimated time: **30–45 minutes**.

---

## Prerequisites

- Azure AI Foundry project with **Agent Service** enabled
- A deployed **gpt-4o** model (required for document vision + reasoning)
- Upload permissions in your Foundry project
- This accelerator's files:
  - `system_prompt.txt`
  - `openapi/licensing-api.json`
  - `knowledge/licensure-requirements.md`

---

## Step 1: Create or Open a Foundry Project

1. Go to [ai.azure.com](https://ai.azure.com)
2. Sign in with your Microsoft Entra ID account
3. Click **Create project** or navigate to an existing project
4. Ensure **Agent Service** is listed under **Tools** on the project page
5. Note the project name and location (e.g., "License Verifier" in "East US")

---

## Step 2: Enable Code Interpreter (Document Processing)

> ⚠️ **Note (May 2026):** The standalone **Document Intelligence** tool no longer appears in the Foundry portal's "Select a tool" dialog. Document field extraction is now handled by **Code Interpreter** — gpt-4o uses its vision capabilities plus Python execution to read uploaded PDFs and images at runtime.

1. Inside your agent editor, click **+ Add tool**
2. In the **Select a tool** dialog, click **Code interpreter**
3. Click **Add tool**
4. Click **Save**

> 💡 With Code Interpreter enabled and gpt-4o selected, applicants can attach credential documents directly in the chat. The agent reads the document using gpt-4o's vision capabilities and extracts fields (degree type, graduation date, exam scores, license numbers) via Python code — no separate OCR resource needed.

**File limits and behavior:**
- Up to **20 files** per session, **512 MB** per file
- Files are **ephemeral** — deleted when the session ends; no persistent storage
- Supported formats: PDF, PNG, JPEG, TIFF, BMP, WEBP

> For production scenarios requiring per-field confidence scores or audit-trail extraction (e.g., IRS prebuilt W-2 model), see the Advanced Option in the [02-document-eligibility-agent guide](../02-document-eligibility-agent/step_by_step.md#advanced-option--call-azure-document-intelligence-via-custom-openapi-tool) for wiring Document Intelligence as a custom OpenAPI tool.

---

## Step 3: Create a Knowledge Index

The **Knowledge** feature lets you upload reference documents and use them with Retrieval-Augmented Generation (RAG).

1. Go to **+ New** → **Knowledge** or navigate to **Knowledge** tab
2. Click **+ New knowledge index**
3. **Name:** `Licensure Requirements` (or per-license type: `Medical Licensure`, `Legal Licensure`, etc.)
4. **Storage:** Select your Azure Storage account or create a new one
5. Click **Next**
6. Upload `knowledge/licensure-requirements.md`
   - Copy and paste content into text field, OR
   - Upload as a `.txt` or `.md` file
7. Click **Index**
   - Wait for indexing to complete (1–2 minutes)
8. Verify the knowledge index is now **Active**

**Optional: Multiple Knowledge Indexes by License Type**

If you need separation by license type (for privacy or organization), create separate indexes:
- `Medical Licensure` (MD/DO rules)
- `Legal Licensure` (JD rules)
- `Nursing Licensure` (RN/LPN rules)
- `Contractor Licensure` (trade rules)

---

## Step 4: Create an Agent

1. Go to **+ New** → **Agent** or navigate to **Agents** tab
2. Click **+ New agent**
3. **Name:** `License Credential Verifier`
4. **Model:** Select `gpt-4o` (or latest recommended model)
5. Click **Create**

---

## Step 5: Configure Agent Instructions and Tools

### 5a. Set Instructions

1. In the agent editor, go to **Instructions**
2. Clear any default text
3. Copy and paste the entire contents of `system_prompt.txt` into the **Instructions** field
4. Modify license types, state rules, or escalation thresholds as needed for your state
5. Click **Save**

### 5b. Add Knowledge Tool

1. Click **+ Add tool** → **Knowledge**
2. Select the knowledge index created in Step 3 (e.g., `Licensure Requirements`)
3. Click **Add**

### 5c. Code Interpreter — System Prompt Guidance

Code Interpreter is now enabled at the agent level (Step 2). No additional "Add Document Intelligence" step is needed. However, the system prompt must tell the agent *what to do* when a document is attached.

The included `system_prompt.txt` already contains these directives, but if you customize it, ensure it includes instructions such as:
- *"When a credential document is uploaded, use Code Interpreter to read it and extract key fields: degree type, institution, graduation date, exam scores, license numbers, and background check results."*
- *"After extraction, cross-reference the extracted credentials against the licensing rules in your knowledge base."*
- *"Clearly state your confidence in each extracted field and flag any fields that appear missing, illegible, or inconsistent."*

### 5d. Add Licensing API OpenAPI Tool

1. Open **Tools** and click **Add** → **Custom** → **OpenAPI tool**
2. If your tenant shows the older dialog, use **+ Add tool** → **Action**
3. Click **+ Import from OpenAPI**
4. Choose **Upload file** or **Paste JSON**
5. Upload or paste contents of `openapi/licensing-api.json`
6. Click **Import**
   - Foundry auto-detects endpoints: `QueryLicenseRequirements`, `ValidateCredentials`, `CheckReciprocity`, `SubmitDecision`, `GetApplicationStatus`
7. Click **Add**

> **Note:** `openapi/licensing-api.json` uses a placeholder endpoint (`licensing.exampleville.gov`). Until you connect a real backend, API calls can fail with a network/connection error.

### 5e. Add Code Interpreter (Optional)

1. Click **+ Add tool** → **Code Interpreter**
2. This enables the agent to write Python to calculate education equivalency or score transcripts
3. Click **Add**

---

## Step 6: Test the Agent

### 6a. Upload a Sample Credential Document

1. In the agent chat interface, upload a sample document (e.g., college transcript PDF, exam result screenshot)
2. Ask the agent:
   - "Extract the degree type and graduation date from this transcript"
   - "Does this applicant meet the education requirement for an MD license in [State]?"
   - "Check if this applicant is eligible under reciprocity agreements"
3. Observe the agent's response:
   - Verify gpt-4o + Code Interpreter extracted text correctly (degree type, graduation date, exam scores)
   - Confirm agent cited relevant knowledge (licensing rules)
   - Check decision matches expected outcome

### 6b. Test Multi-Document Workflow

1. Upload a transcript AND an exam result (e.g., USMLE scores for medical)
2. Ask: "Approve or escalate this medical license application"
3. Verify agent:
   - Extracted both documents
   - Cross-referenced exam scores against knowledge (e.g., "USMLE ≥ 230 required")
   - Made a decision (approve/escalate) with reasoning

### 6c. Test Edge Cases

- **Incomplete credentials:** Upload only a transcript, no exam results → agent should flag as "Escalate for incomplete file"
- **Out-of-state education:** Upload transcript from foreign university → agent should calculate equivalency or flag for review
- **Disciplinary history:** Include mention of prior complaint → agent should auto-escalate

> If API calls fail while using the placeholder endpoint, verify tool-selection behavior in the run trace/planning details. The expected demo outcome is correct operation selection and parameter extraction, even when the backend call fails.

---

## Step 7: Deploy & Configure Access Control

### 7a. Deploy the Agent

1. Click **Deploy** in the agent editor
2. Choose deployment target:
   - **Foundry UI:** Agent available for testing in Foundry (default)
   - **API endpoint:** (Optional) Generate REST API for custom integrations
3. Click **Deploy**

### 7b. Set Entra ID RBAC

1. Go to **Settings** → **Access control** → **Role-based access control (RBAC)**
2. Invite your licensing staff:
   - **Role:** `Contributor` (can upload credentials and interact with agent)
   - **Scope:** This project
3. Create a custom role (if needed) for **read-only audit access** to decision logs
4. Click **Add**

### 7c. Enable Audit Logging

1. Go to **Settings** → **Monitoring**
2. Enable **Application Insights** logging
3. Configure retention policy (e.g., "90 days" for audit compliance)
4. Click **Save**

---

## Step 8 (Optional): Scale to Multiple License Types

If you want separate agents per license type:

1. Repeat **Steps 3–7** for each license type
2. Create separate knowledge indexes:
   - `Medical Licensure` with MD/DO rules only
   - `Legal Licensure` with JD rules only
   - etc.
3. Modify system prompts to focus on each license type
4. Deploy as separate agents in the same project
5. Optionally create a **"routing agent"** that directs incoming applications to the correct license-type agent

---

## Step 9 (Optional): Build a Public-Facing Portal

Once you have the agent working in Foundry:

1. **Create a web app** (e.g., Azure App Service, Static Web App) with a document upload form
2. **Call the agent API** (from Step 7a) when the user uploads credentials
3. **Display the decision** in the portal (Approved / Escalated / Rejected)
4. **Store decisions** in your licensing database via the Licensing API

See [Microsoft Foundry documentation](https://learn.microsoft.com/en-us/azure/ai-foundry) for REST API integration examples.

---

## Testing Checklist

- [ ] Agent extracts text and key fields from sample transcript (Code Interpreter + gpt-4o vision working)
- [ ] Agent cites licensing rules from knowledge (RAG working)
- [ ] Agent correctly approves a routine credential submission
- [ ] Agent correctly escalates an incomplete or ambiguous credential
- [ ] Audit logs show all decisions with timestamps
- [ ] Entra ID RBAC restricts access to licensing staff only
- [ ] API tool calls licensing database successfully

---

## Troubleshooting

**Q: Agent is not extracting credential fields from uploaded documents**
- Verify Code Interpreter is enabled as a tool on the agent (Step 2)
- Verify the system prompt includes explicit extraction instructions (Step 5c)
- Try uploading a higher-quality file (PDF preferred over JPG)
- Check that gpt-4o is selected as the model — other models may not support vision + Code Interpreter

**Q: Knowledge index is not being used**
- Verify knowledge index status is "Active" (not "Indexing")
- Ensure knowledge was added as a tool in Step 5b
- Try rephrasing your question to match knowledge content (e.g., "What is the education requirement?" vs. "Tell me about MD rules")

**Q: API calls to licensing database are failing**
- Verify OpenAPI spec is correct (check JSON syntax in `licensing-api.json`)
- Ensure mock server URL or real backend is reachable
- Check Entra ID permissions for service principal (if using real backend)

**Q: Decisions are inconsistent across applicants**
- Review system prompt (Step 5a) for ambiguous language
- Add explicit decision rules (e.g., "If USMLE < 230, escalate")
- Test with more sample documents

---

## Next Steps

- **Week 2:** Migrate from sample data to real credential documents
- **Week 3:** Integrate with state licensing database (real backend for Step 5d)
- **Month 2:** Build public-facing portal for applicants
- **Month 3:** Implement multi-license workflows and equivalency calculator

For help, see [Azure AI Foundry documentation](https://learn.microsoft.com/en-us/azure/ai-foundry) or contact your licensing board IT team.
