# Professional License Credential Verifier — Step-by-Step Deployment Guide

This guide walks you through deploying the Professional License Credential Verifier agent in Azure AI Foundry. Estimated time: **30–45 minutes**.

---

## Prerequisites

- Azure AI Foundry project with **Agent Service** and **Document Intelligence** enabled
- Azure Document Intelligence resource (Standard tier minimum; use the free tier for pilot testing)
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

## Step 2: Enable Document Intelligence Tool

The **Document Intelligence** tool is a built-in Foundry capability that extracts text, tables, and key-value pairs from document images and PDFs.

1. In your Foundry project, go to **Settings** → **Tools**
2. Scroll to **Document Intelligence** and verify it shows **Enabled**
   - If not enabled, click **Enable** and confirm
   - Ensure your Document Intelligence resource is linked (should auto-populate)
3. Return to the project homepage

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

### 5c. Add Document Intelligence Tool

1. Click **+ Add tool** → **Document Intelligence**
2. Configure:
   - **Auto-extract:** ON (automatically process uploaded images/PDFs)
   - **PII handling:** Choose "Mask PII" if your state requires SSN masking
3. Click **Add**

### 5d. Add Licensing API Action

1. Click **+ Add tool** → **Action**
2. Click **+ Import from OpenAPI**
3. Choose **Upload file** or **Paste JSON**
4. Upload or paste contents of `openapi/licensing-api.json`
5. Click **Import**
   - Foundry auto-detects endpoints: `QueryLicenseRequirements`, `ValidateCredentials`, `CheckReciprocity`, `SubmitDecision`, `GetApplicationStatus`
6. Click **Add**

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
   - Verify Document Intelligence extracted text correctly
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

- [ ] Agent extracts text from sample transcript (Document Intelligence working)
- [ ] Agent cites licensing rules from knowledge (RAG working)
- [ ] Agent correctly approves a routine credential submission
- [ ] Agent correctly escalates an incomplete or ambiguous credential
- [ ] Audit logs show all decisions with timestamps
- [ ] Entra ID RBAC restricts access to licensing staff only
- [ ] API action calls licensing database successfully

---

## Troubleshooting

**Q: Document Intelligence is not extracting text correctly**
- Verify Document Intelligence resource is linked in Settings → Tools
- Try uploading a higher-quality image (PDF preferred over JPG)
- Check PII masking is not over-redacting needed text

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
