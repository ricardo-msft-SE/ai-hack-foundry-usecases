# Unemployment Claims Processor — Step-by-Step Deployment Guide

This guide walks you through deploying the Unemployment Claims Processor agent in Azure AI Foundry. Estimated time: **45–60 minutes** (includes Code Interpreter setup for benefits calculation).

---

## Prerequisites

- Azure AI Foundry project with **Agent Service** enabled
- A deployed **gpt-4o** model (required for document vision + Code Interpreter)
- Upload permissions in your Foundry project
- This accelerator's files:
  - `system_prompt.txt`
  - `openapi/unemployment-api.json`
  - `knowledge/unemployment-requirements.md`

---

## Step 1: Create or Open a Foundry Project

1. Go to [ai.azure.com](https://ai.azure.com)
2. Sign in with your Microsoft Entra ID account
3. Click **Create project** or navigate to an existing project
4. Ensure **Agent Service** is listed under **Tools** on the project page
5. Note the project name and location (e.g., "Unemployment Processor" in "East US")

---

## Step 2: Enable Code Interpreter (Document Processing)

> ⚠️ **Note (May 2026):** The standalone **Document Intelligence** tool no longer appears in the Foundry portal's "Select a tool" dialog. Document field extraction is now handled by **Code Interpreter** — gpt-4o uses its vision capabilities plus Python execution to read uploaded wage documents, pay stubs, and PDFs at runtime.

This same Code Interpreter tool also handles benefits calculation (Step 6d), so enabling it once covers both use cases.

1. Inside your agent editor, click **+ Add tool**
2. In the **Select a tool** dialog, click **Code interpreter**
3. Click **Add tool**
4. Click **Save**

> 💡 With Code Interpreter enabled and gpt-4o selected, claimants or staff can attach wage documents directly in the chat. The agent reads the document using gpt-4o's vision capabilities and extracts fields (employer name, wages by week, separation reason) via Python code — no separate OCR resource needed.

**File limits and behavior:**
- Up to **20 files** per session, **512 MB** per file
- Files are **ephemeral** — deleted when the session ends
- Supported formats: PDF, PNG, JPEG, TIFF, BMP, WEBP

> For production scenarios requiring per-field confidence scores or structured extracts (e.g., W-2 prebuilt model), see the Advanced Option in the [02-document-eligibility-agent guide](../02-document-eligibility-agent/step_by_step.md#advanced-option--call-azure-document-intelligence-via-custom-openapi-tool) for wiring Document Intelligence as a custom OpenAPI tool.

---

## Step 3: Create a Knowledge Index

1. Go to **+ New** → **Knowledge** or navigate to **Knowledge** tab
2. Click **+ New knowledge index**
3. **Name:** `Unemployment & Workers Compensation Rules` (or split by type: `UI Rules`, `WC Rules`)
4. **Storage:** Select your Azure Storage account or create a new one
5. Click **Next**
6. Upload `knowledge/unemployment-requirements.md`
   - Copy and paste content into text field, OR
   - Upload as a `.txt` or `.md` file
7. Click **Index**
   - Wait for indexing to complete (1–2 minutes)
8. Verify the knowledge index is **Active**

---

## Step 4: Create an Agent

1. Go to **+ New** → **Agent** or navigate to **Agents** tab
2. Click **+ New agent**
3. **Name:** `Unemployment Claims Processor`
4. **Model:** Select `gpt-4o` (or latest recommended model)
5. Click **Create**

---

## Step 5: Configure Agent Instructions and Tools

### 5a. Set Instructions

1. In the agent editor, go to **Instructions**
2. Clear any default text
3. Copy and paste the entire contents of `system_prompt.txt` into the **Instructions** field
4. Modify state formulas, benefit rates, or disqualification rules as needed
5. Click **Save**

### 5b. Add Knowledge Tool

1. Click **+ Add tool** → **Knowledge**
2. Select the knowledge index created in Step 3 (e.g., `Unemployment & Workers Compensation Rules`)
3. Click **Add**

### 5c. Code Interpreter — System Prompt Guidance

Code Interpreter is now enabled at the agent level (Step 2). It handles both **document field extraction** (wage amounts, separation reason) and **benefits calculation** (weekly rate formula, max duration). No additional "Add Document Intelligence" step is needed.

The included `system_prompt.txt` already contains the required directives, but if you customize it, ensure it includes instructions such as:
- *"When a wage document, pay stub, or separation letter is uploaded, use Code Interpreter to extract key fields: employer name, weekly wages by pay period, separation reason, and effective date."*
- *"After extracting wages, calculate the claimant's Weekly Benefit Amount (WBA) using the state formula in your instructions."*
- *"Clearly state your confidence in each extracted field and flag any that appear missing, illegible, or inconsistent."*
- *"Use Code Interpreter for all numerical calculations — weekly benefit rates, overpayment detection, and max duration."*

### 5d. Code Interpreter — Additional Configuration

| Limit | Value |
|---|---|
| Max files per session | 20 files |
| Max file size | 512 MB each |
| Session duration | Ephemeral (files deleted at session end) |
| Pre-installed libraries | pandas, Pillow, PyPDF2, pdfminer, openpyxl, matplotlib |

> ⚠️ Code Interpreter does **not** persist files between sessions. For audit trails, add instructions to output structured JSON or a claims summary that staff can copy before closing the session.

### 5e. Add Unemployment API OpenAPI Tool

1. Open **Tools** and click **Add** → **Custom** → **OpenAPI tool**
2. If your tenant shows the older dialog, use **+ Add tool** → **Action**
3. Click **+ Import from OpenAPI**
4. Choose **Upload file** or **Paste JSON**
5. Upload or paste contents of `openapi/unemployment-api.json`
6. Click **Import**
   - Foundry auto-detects endpoints: `CalculateBenefit`, `CheckEligibility`, `SubmitClaim`, `DetectOverpayment`, `RouteToHearing`, `GetClaimStatus`
7. Click **Add**

> **Note:** `openapi/unemployment-api.json` uses a placeholder endpoint (`unemployment.exampleville.gov`). Until you connect a real backend, API calls can fail with a network/connection error.

---

## Step 6: Test the Agent

### 6a. Upload a Sample Wage Record

1. In the agent chat interface, upload a sample document (e.g., recent pay stubs, wage statement PDF)
2. Ask the agent:
   - "Extract the weekly earnings and employer information from this wage document"
   - "Calculate the weekly benefit amount for a UI claim based on these wages"
   - "Is this claimant eligible for UI benefits?"
3. Observe the agent's response:
   - Verify gpt-4o + Code Interpreter extracted wage data correctly (employer, weekly wages, pay dates)
   - Confirm agent cited relevant knowledge (UI eligibility rules)
   - Check benefit calculation matches state formula

### 6b. Test Multi-Document Workflow (UI Claim)

1. Upload wage records (recent 5+ weeks) AND a separation letter (e.g., RIF notice, termination letter)
2. Ask: "Process this UI claim. Extract wages, determine separation reason, calculate weekly benefit, and recommend approval or escalation"
3. Verify agent:
   - Extracted wages from all documents
   - Classified separation reason (layoff, quit, discharge)
   - Calculated weekly benefit using state formula
   - Made a decision (Approve/Escalate) with reasoning

### 6c. Test Workers' Compensation Workflow (WC Claim)

1. Upload medical report (injury description, doctor note, medical bill)
2. Ask: "Process this WC claim. Determine injury classification, calculate medical benefits, and provide status"
3. Verify agent:
   - Extracted injury details and medical costs
   - Classified injury (acute trauma, occupational disease)
   - Provided medical benefit eligibility
   - Made a routing decision (Approve/Escalate/Hearing Officer)

### 6d. Test Overpayment Detection

1. Upload wage records showing double income weeks (e.g., claimant worked AND received UI)
2. Ask: "Check for overpayments in this claim"
3. Verify agent:
   - Identified weeks where claimant earned wages AND received UI
   - Calculated overpayment amount
   - Flagged for recovery process

### 6e. Test Edge Cases

- **Missing separation letter:** Upload only wage records → agent should flag as "Escalate for missing separation documentation"
- **Ambiguous separation reason:** Upload termination letter with vague reason → agent should escalate to hearing officer
- **Out-of-state worker:** Upload W-2 from another state → agent should check reciprocal agreements or flag for interstate UI processing
- **Injured worker still earning:** Upload medical report AND wage records showing continued work → agent should calculate partial WC benefits

> If API calls fail while using the placeholder endpoint, use run trace/planning details to confirm the correct OpenAPI operation and arguments were selected.

---

## Step 7: Deploy & Configure Access Control

### 7a. Deploy the Agent

1. Click **Deploy** in the agent editor
2. Choose deployment target:
   - **Foundry UI:** Agent available for UI-WC staff (default)
   - **API endpoint:** (Optional) Generate REST API for custom portal integration
3. Click **Deploy**

### 7b. Set Entra ID RBAC

1. Go to **Settings** → **Access control** → **Role-based access control (RBAC)**
2. Invite your UI-WC staff:
   - **Role:** `Contributor` (can upload claims and interact with agent)
   - **Scope:** This project
3. Create a custom role (if needed) for **read-only audit access** to decision logs
4. Click **Add**

### 7c. Enable Audit Logging

1. Go to **Settings** → **Monitoring**
2. Enable **Application Insights** logging
3. Configure retention policy (e.g., "90 days" for USDOL compliance)
4. Click **Save**

---

## Step 8: Multi-Language Support (Optional)

If your claimant population speaks Spanish, Vietnamese, Hmong, or other languages:

1. Create separate knowledge indexes per language (e.g., `UI Rules (Spanish)`, `UI Rules (Vietnamese)`)
   - Translate `knowledge/unemployment-requirements.md` to target language
   - Upload as separate indexes
2. In system prompt, add language detection:
   - "If document is in Spanish, use Spanish knowledge index; if Vietnamese, use Vietnamese index"
3. Deploy separate agents per language or modify one agent with language routing logic

---

## Step 9 (Optional): Build a Public-Facing Portal

Once the agent is working in Foundry:

1. **Create a web app** (Azure App Service, Static Web App) with claim submission form
2. **Call the agent API** (from Step 8a) when user uploads documents
3. **Display claim status** in real-time (Processing / Approved / Escalated / Hearing)
4. **Send notifications** (email/SMS) when decision is made
5. **Store decisions** in your UI-WC database via the Unemployment API

See [Microsoft Foundry documentation](https://learn.microsoft.com/en-us/azure/ai-foundry) for REST API integration examples.

---

## Testing Checklist

- [ ] Agent extracts wage data from sample pay stubs (Code Interpreter + gpt-4o vision working)
- [ ] Agent extracts separation reason from termination letters (Code Interpreter + gpt-4o vision working)
- [ ] Agent cites UI eligibility rules from knowledge (RAG working)
- [ ] Agent calculates weekly benefit using Code Interpreter (matches state formula)
- [ ] Agent correctly approves a routine UI claim
- [ ] Agent correctly escalates an incomplete or ambiguous claim
- [ ] Agent detects overpayments (identifies double-income weeks)
- [ ] Audit logs show all decisions with timestamps
- [ ] Entra ID RBAC restricts access to UI-WC staff only
- [ ] API tool calls unemployment database successfully

---

## Troubleshooting

**Q: Code Interpreter is not executing Python code or extracting document fields**
- Verify Code Interpreter is enabled as a tool on the agent (Step 2)
- Verify the system prompt includes explicit extraction instructions (Step 5c)
- Try uploading a higher-quality document (PDF preferred over JPG)
- Check that gpt-4o is selected as the model — other models may not support vision + Code Interpreter

**Q: Knowledge is not being used**
- Verify knowledge index status is "Active"
- Ensure knowledge was added as a tool in Step 5b
- Try rephrasing question to match knowledge content

**Q: API calls are failing**
- Confirm whether `openapi/unemployment-api.json` still points to the placeholder endpoint (`unemployment.exampleville.gov`)
- Replace with your real UI-WC backend URL for end-to-end success
- Use run trace/planning details to verify operation/parameter selection even when backend calls fail

---

## Next Steps

- **Week 2:** Migrate from sample data to real claim documents
- **Week 3:** Integrate with state UI-WC database (real backend for Step 5e)
- **Month 2:** Build public-facing claim submission portal
- **Month 3:** Deploy multi-language support for diverse claimant populations

For help, see [Azure AI Foundry documentation](https://learn.microsoft.com/en-us/azure/ai-foundry) or contact your state UI-WC IT team.
