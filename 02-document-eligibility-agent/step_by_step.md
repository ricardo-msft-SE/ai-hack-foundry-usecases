# Document Eligibility Agent — Azure AI Foundry Guide

This guide walks you through building a **Document Eligibility Agent** using Microsoft Azure AI Foundry. The agent accepts document uploads (W-2s, pay stubs, utility bills, government IDs), extracts key fields using Azure Document Intelligence, checks eligibility against program rules, and routes cases to staff.

**No OCR code, no SDK, no custom pipeline — just Foundry.**

---

## 🔁 What Does Foundry Replace?

| Code-First Component | Foundry-First Replacement |
|---|---|
| Azure Document Intelligence SDK (`DocumentAnalysisClient`) | Built-in **Document Intelligence tool** (toggle in agent settings) |
| Custom OCR field extraction pipeline | Document Intelligence tool extracts fields automatically |
| PII detection and masking code | Document Intelligence tool handles PII identification |
| Confidence scoring logic | Built-in confidence scores from Document Intelligence |
| Flask API for document uploads | Foundry file attachment in conversation |
| Case routing Python plugin | **Action** — upload an OpenAPI spec |
| Eligibility rules engine | **Knowledge** — upload the program requirements doc |

---

## 🛠️ Prerequisites

- An Azure Subscription
- Access to [Azure AI Foundry](https://ai.azure.com)
- A deployed GPT-4o model (required for document processing)
- The files in this folder:
  - [`system_prompt.txt`](./system_prompt.txt)
  - [`openapi/case-routing-api.json`](./openapi/case-routing-api.json)
  - [`knowledge/eligibility-requirements.md`](./knowledge/eligibility-requirements.md)
- (Optional) A sample W-2, pay stub, or utility bill PDF for testing

---

## 🧱 Step 1 — Create the Project

1. Navigate to [https://ai.azure.com](https://ai.azure.com)
2. Click **+ Create project**
3. Fill in:
   - **Project name:** `DocumentEligibility`
   - **Hub:** Select or create a hub
   - **Subscription & Resource Group:** Select yours
4. Click **Create**

> 💡 If you already have a project, skip to Step 2.

---

## 🧠 Step 2 — Create the Agent

1. In the left navigation, go to **Build** → **Agents**
2. Click **+ New agent**
3. Fill in:
   - **Name:** `DocumentEligibilityAgent`
   - **Model:** Select `gpt-4o` (required — it handles document vision and reasoning)
4. In the **Instructions** field, paste the full contents of [`system_prompt.txt`](./system_prompt.txt)
5. Click **Save**

---

## 📄 Step 3 — Enable the Document Intelligence Tool

This step replaces the entire custom OCR pipeline from the code-first version — Azure Document Intelligence SDK, field extraction code, confidence scoring, PII detection — with a single toggle.

1. Inside your agent, find the **Tools** section
2. Look for **Document Intelligence** (may be listed under "Built-in tools" or "Azure tools")
3. Click the toggle to **Enable**
4. If prompted, select or create an **Azure AI Services** resource (Document Intelligence is included)
5. Click **Save**

> 💡 Once enabled, users can attach documents (PDF, JPEG, PNG, TIFF) directly in the chat. The agent will extract fields, detect document type, and assess confidence automatically.

**What Document Intelligence extracts automatically:**

| Document Type | Extracted Fields |
|---|---|
| W-2 Form | Employer name, employee name, wages, federal tax withheld, tax year |
| Pay Stub | Employer, pay period, gross pay, net pay, YTD earnings |
| Utility Bill | Provider name, service address, billing period, amount due |
| Government ID | Name, date of birth, expiration date, ID number |
| Bank Statement | Institution name, account type, balance, statement period |
| Lease Agreement | Landlord name, tenant name, property address, monthly rent |

---

## 📚 Step 4 — Add Knowledge (Eligibility Rules)

This step replaces the custom RAG pipeline, document retrieval code, and eligibility rules engine from the code-first version.

> 💡 **Understanding the two parts of this step:** Adding Knowledge involves two distinct configurations:
>
> - **Upload Files** — the *content source*. You select documents (PDF, DOCX, Markdown, TXT, HTML) from your local machine that contain the information the agent should know about. Foundry reads these files, automatically splits them into searchable passages, and generates vector embeddings. This is *what* you want the agent to know.
>
> - **Azure AI Search** — the *backend infrastructure*. This is a separate Azure service that stores and indexes the vector embeddings produced from your uploaded files, so the agent can perform fast semantic lookups at runtime. It is provisioned as an independent Azure resource in your subscription with its own pricing. This is *where* the agent searches. You can reuse an existing Azure AI Search resource across multiple agents and knowledge sets to save cost.

1. Inside your agent, find the **Knowledge** section (right panel or dedicated tab)
2. Click **+ Add knowledge**
3. When prompted for the source type, select **Upload files**

   > This option lets you upload documents directly from your local machine. Other source types (not used here) include **Azure Blob Storage** and **SharePoint** — those connect the agent to documents that already live in cloud storage rather than uploading new files.

4. Browse and select [`knowledge/eligibility-requirements.md`](./knowledge/eligibility-requirements.md), then click **Upload**

   > For a real deployment, upload all program eligibility guides, income limit tables, and required document checklists. Supported formats: PDF, DOCX, PPTX, TXT, Markdown, HTML. You can upload multiple files in a single step.

5. Click **Next** to proceed to the search resource configuration

6. When prompted to configure the **Azure AI Search** resource:
   - If you already have an Azure AI Search resource in your subscription, select it from the dropdown — you can reuse a single resource across multiple agents
   - If not, click **Create new Azure AI Search**:
     1. Enter a **resource name** (e.g., `eligibility-search`)
     2. Select your **Subscription** and **Resource Group**
     3. Choose a **Pricing tier**:
        - **Free (F)** — sufficient for hackathon/pilot use; limited to 3 indexes and 50 MB storage
        - **Basic** — recommended for small production deployments
        - **Standard S1** — recommended for production with multiple document sets
     4. Select a **Region** (choose the same region as your Foundry project for best latency)
     5. Click **Create** and wait approximately 2 minutes for provisioning

   > ⚠️ **Azure AI Search is a separate, billable Azure resource.** It is not included in the Foundry/Agent Service pricing. Monitor its usage in the Azure Portal under your resource group.

7. Enter an **index name** (e.g., `eligibility-index`) or accept the auto-generated default

8. Keep the default **vectorization settings** (automatic embedding with your project's embedding model)

9. Click **Next**, review the summary, then click **Create** to complete the wizard. Indexing typically takes 1–3 minutes.

Foundry automatically:
- Chunks the documents into searchable passages (~512 tokens each)
- Generates vector embeddings for semantic similarity search
- Builds and populates the Azure AI Search index
- Wires citation tracking into every retrieval response — no code needed

The agent will now check extracted document data against the eligibility rules from your Knowledge base.

---

## 🔧 Step 5 — Add Case Routing Action

This step replaces the Python case routing plugin that assigned processed cases to staff queues.

### 5a. Review the OpenAPI Spec

Open [`openapi/case-routing-api.json`](./openapi/case-routing-api.json) to see the two operations:
- **`RouteCase`** — submit a processed case to the staff routing system
- **`GetCaseStatus`** — check the status of a previously routed case

> Replace `api.exampleville.gov` in the `servers.url` field with your real case management system URL.

### 5b. Upload the Action in Foundry

1. Inside your agent, find the **Tools** tab
2. Click **+ Add tool** → select **OpenAPI**
3. Configure:
   - **Tool Name:** `CaseRoutingAPI`
   - **Definition:** Click **Upload file** → select `openapi/case-routing-api.json`
   - **Authentication:** Select **None (Anonymous)** for testing; use API Key or OAuth for production
4. Click **Add**

---

## 🧪 Step 6 — Test the Agent

Open the **Playground** inside your agent.

### ✅ Test Document Intelligence (OCR + Field Extraction)

Attach a sample W-2 PDF or image to the chat and ask:

**User (with attached W-2):**
> Please review this document and extract the relevant information.

**Expected:** The agent identifies the document as a W-2, extracts employer name, employee name, wages, and tax year, and reports a confidence score.

---

**User:**
> Is the income on this document within the eligibility limits for food assistance?

**Expected:** The agent compares extracted wages against the income limits from the Knowledge base and returns an eligibility determination with a citation.

---

### ✅ Test Eligibility Check (Knowledge)

**User (no attachment):**
> What documents does someone need to apply for utility assistance?

**Expected:** The agent lists the required documents from the eligibility requirements knowledge base with a citation.

---

### ✅ Test Case Routing (Action)

**User:**
> Route this case to the food assistance queue. Applicant is Maria Garcia, case ID CA-2024-001.

**Expected:** The agent calls `RouteCase` with the provided details and confirms the routing.

> 💡 With the mock API URL, the call will fail — but the Planning log will confirm the correct tool and parameters were selected.

---

## 📊 Step 7 — Evaluate the Agent

1. Go to **Evaluate** → **+ New evaluation**
2. Select your agent: `DocumentEligibilityAgent`
3. Add evaluators:
   - ✅ **Groundedness** — are eligibility determinations based on the rules document?
   - ✅ **Relevance** — are extracted fields relevant to the program being applied for?
4. Upload test cases with sample document descriptions and expected eligibility outcomes
5. Click **Run evaluation**

---

## 🎉 You're Done!

You now have:

- ✅ An agent that reads and extracts fields from uploaded documents (zero OCR code)
- ✅ Eligibility checking against program rules (zero rules engine code)
- ✅ Automated case routing to staff queues (zero plugin code)
- ✅ No infrastructure to manage, no SDK to maintain

### Next Steps

- **Upload real program documents** to Knowledge: income limit tables, document checklists, state regulation PDFs
- **Connect to your case management system**: replace the mock URL in `case-routing-api.json`
- **Add more document types**: Document Intelligence supports 40+ prebuilt document types out of the box
- **Add PII masking**: instruct the agent in the system prompt to redact sensitive fields from responses
- **Email intake**: connect an email Action (Microsoft Graph API) to let applicants email documents directly
