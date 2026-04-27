# Unemployment Claims Processor — Step-by-Step Deployment Guide

This guide walks you through deploying the Unemployment Claims Processor agent in Azure AI Foundry. Estimated time: **45–60 minutes** (includes Code Interpreter setup for benefits calculation).

---

## Prerequisites

- Azure AI Foundry project with **Agent Service**, **Document Intelligence**, and **Code Interpreter** enabled
- Azure Document Intelligence resource (Standard tier minimum)
- Azure Compute resource for Code Interpreter (Small VM or container; included in Foundry Standard)
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

## Step 2: Enable Document Intelligence Tool

1. In your Foundry project, go to **Settings** → **Tools**
2. Scroll to **Document Intelligence** and verify it shows **Enabled**
   - If not enabled, click **Enable** and confirm
   - Ensure your Document Intelligence resource is linked
3. Return to the project homepage

---

## Step 3: Enable Code Interpreter

The **Code Interpreter** tool lets agents write and execute Python code to calculate benefits, detect overpayments, and process complex formulas.

1. Go to **Settings** → **Tools**
2. Scroll to **Code Interpreter** and verify it shows **Enabled**
   - If not enabled, click **Enable** and select a compute resource
   - If no compute resource exists, create one (Small VM sufficient for claims processor)
3. Verify Azure Compute resource status (should show "Running" or "Ready")
4. Return to the project homepage

---

## Step 4: Create a Knowledge Index

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

## Step 5: Create an Agent

1. Go to **+ New** → **Agent** or navigate to **Agents** tab
2. Click **+ New agent**
3. **Name:** `Unemployment Claims Processor`
4. **Model:** Select `gpt-4o` (or latest recommended model)
5. Click **Create**

---

## Step 6: Configure Agent Instructions and Tools

### 6a. Set Instructions

1. In the agent editor, go to **Instructions**
2. Clear any default text
3. Copy and paste the entire contents of `system_prompt.txt` into the **Instructions** field
4. Modify state formulas, benefit rates, or disqualification rules as needed
5. Click **Save**

### 6b. Add Knowledge Tool

1. Click **+ Add tool** → **Knowledge**
2. Select the knowledge index created in Step 4 (e.g., `Unemployment & Workers Compensation Rules`)
3. Click **Add**

### 6c. Add Document Intelligence Tool

1. Click **+ Add tool** → **Document Intelligence**
2. Configure:
   - **Auto-extract:** ON (automatically process PDFs/images)
   - **PII handling:** Choose "Mask PII" (masks SSN and medical info)
3. Click **Add**

### 6d. Add Code Interpreter Tool

1. Click **+ Add tool** → **Code Interpreter**
2. Configure:
   - **Auto-execute:** ON (agent can run Python code without approval)
   - **Timeout:** 30 seconds (sufficient for benefits calculation)
3. Click **Add**
   - This enables the agent to calculate weekly benefit rates, identify overpayments, and estimate max duration

### 6e. Add Unemployment API Action

1. Click **+ Add tool** → **Action**
2. Click **+ Import from OpenAPI**
3. Choose **Upload file** or **Paste JSON**
4. Upload or paste contents of `openapi/unemployment-api.json`
5. Click **Import**
   - Foundry auto-detects endpoints: `CalculateBenefit`, `CheckEligibility`, `SubmitClaim`, `DetectOverpayment`, `RouteToHearing`, `GetClaimStatus`
6. Click **Add**

---

## Step 7: Test the Agent

### 7a. Upload a Sample Wage Record

1. In the agent chat interface, upload a sample document (e.g., recent pay stubs, wage statement PDF)
2. Ask the agent:
   - "Extract the weekly earnings and employer information from this wage document"
   - "Calculate the weekly benefit amount for a UI claim based on these wages"
   - "Is this claimant eligible for UI benefits?"
3. Observe the agent's response:
   - Verify Document Intelligence extracted wage data correctly
   - Confirm agent cited relevant knowledge (UI eligibility rules)
   - Check benefit calculation matches state formula

### 7b. Test Multi-Document Workflow (UI Claim)

1. Upload wage records (recent 5+ weeks) AND a separation letter (e.g., RIF notice, termination letter)
2. Ask: "Process this UI claim. Extract wages, determine separation reason, calculate weekly benefit, and recommend approval or escalation"
3. Verify agent:
   - Extracted wages from all documents
   - Classified separation reason (layoff, quit, discharge)
   - Calculated weekly benefit using state formula
   - Made a decision (Approve/Escalate) with reasoning

### 7c. Test Workers' Compensation Workflow (WC Claim)

1. Upload medical report (injury description, doctor note, medical bill)
2. Ask: "Process this WC claim. Determine injury classification, calculate medical benefits, and provide status"
3. Verify agent:
   - Extracted injury details and medical costs
   - Classified injury (acute trauma, occupational disease)
   - Provided medical benefit eligibility
   - Made a routing decision (Approve/Escalate/Hearing Officer)

### 7d. Test Overpayment Detection

1. Upload wage records showing double income weeks (e.g., claimant worked AND received UI)
2. Ask: "Check for overpayments in this claim"
3. Verify agent:
   - Identified weeks where claimant earned wages AND received UI
   - Calculated overpayment amount
   - Flagged for recovery process

### 7e. Test Edge Cases

- **Missing separation letter:** Upload only wage records → agent should flag as "Escalate for missing separation documentation"
- **Ambiguous separation reason:** Upload termination letter with vague reason → agent should escalate to hearing officer
- **Out-of-state worker:** Upload W-2 from another state → agent should check reciprocal agreements or flag for interstate UI processing
- **Injured worker still earning:** Upload medical report AND wage records showing continued work → agent should calculate partial WC benefits

---

## Step 8: Deploy & Configure Access Control

### 8a. Deploy the Agent

1. Click **Deploy** in the agent editor
2. Choose deployment target:
   - **Foundry UI:** Agent available for UI-WC staff (default)
   - **API endpoint:** (Optional) Generate REST API for custom portal integration
3. Click **Deploy**

### 8b. Set Entra ID RBAC

1. Go to **Settings** → **Access control** → **Role-based access control (RBAC)**
2. Invite your UI-WC staff:
   - **Role:** `Contributor` (can upload claims and interact with agent)
   - **Scope:** This project
3. Create a custom role (if needed) for **read-only audit access** to decision logs
4. Click **Add**

### 8c. Enable Audit Logging

1. Go to **Settings** → **Monitoring**
2. Enable **Application Insights** logging
3. Configure retention policy (e.g., "90 days" for USDOL compliance)
4. Click **Save**

---

## Step 9: Multi-Language Support (Optional)

If your claimant population speaks Spanish, Vietnamese, Hmong, or other languages:

1. Create separate knowledge indexes per language (e.g., `UI Rules (Spanish)`, `UI Rules (Vietnamese)`)
   - Translate `knowledge/unemployment-requirements.md` to target language
   - Upload as separate indexes
2. In system prompt, add language detection:
   - "If document is in Spanish, use Spanish knowledge index; if Vietnamese, use Vietnamese index"
3. Deploy separate agents per language or modify one agent with language routing logic

---

## Step 10 (Optional): Build a Public-Facing Portal

Once the agent is working in Foundry:

1. **Create a web app** (Azure App Service, Static Web App) with claim submission form
2. **Call the agent API** (from Step 8a) when user uploads documents
3. **Display claim status** in real-time (Processing / Approved / Escalated / Hearing)
4. **Send notifications** (email/SMS) when decision is made
5. **Store decisions** in your UI-WC database via the Unemployment API

See [Microsoft Foundry documentation](https://learn.microsoft.com/en-us/azure/ai-foundry) for REST API integration examples.

---

## Testing Checklist

- [ ] Agent extracts wage data from sample pay stubs (Document Intelligence working)
- [ ] Agent extracts separation reason from termination letters (Document Intelligence working)
- [ ] Agent cites UI eligibility rules from knowledge (RAG working)
- [ ] Agent calculates weekly benefit using Code Interpreter (matches state formula)
- [ ] Agent correctly approves a routine UI claim
- [ ] Agent correctly escalates an incomplete or ambiguous claim
- [ ] Agent detects overpayments (identifies double-income weeks)
- [ ] Audit logs show all decisions with timestamps
- [ ] Entra ID RBAC restricts access to UI-WC staff only
- [ ] API action calls unemployment database successfully

---

## Troubleshooting

**Q: Code Interpreter is not executing Python code**
- Verify Code Interpreter is Enabled in Settings → Tools
- Check compute resource status (should show "Running")
- Verify timeout is sufficient (30 seconds minimum for complex calculations)

**Q: Benefits calculation is incorrect**
- Review system prompt (Step 6a) for state formula errors
- Check knowledge index contains correct benefit rates and disqualification rules
- Test Code Interpreter directly: ask agent to "Calculate 50% of $1,000 weekly wages"

**Q: Document Intelligence is not extracting wage data**
- Verify Document Intelligence is enabled in Settings → Tools
- Try uploading a higher-quality document (PDF preferred)
- Check PII masking is not over-redacting critical wage data

**Q: Knowledge is not being used**
- Verify knowledge index status is "Active"
- Ensure knowledge was added as a tool in Step 6b
- Try rephrasing question to match knowledge content

---

## Next Steps

- **Week 2:** Migrate from sample data to real claim documents
- **Week 3:** Integrate with state UI-WC database (real backend for Step 6e)
- **Month 2:** Build public-facing claim submission portal
- **Month 3:** Deploy multi-language support for diverse claimant populations

For help, see [Azure AI Foundry documentation](https://learn.microsoft.com/en-us/azure/ai-foundry) or contact your state UI-WC IT team.
