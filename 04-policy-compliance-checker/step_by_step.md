# Policy Compliance Checker — Azure AI Foundry Guide

This guide walks you through building a **Policy Compliance Checker** using Microsoft Azure AI Foundry. The agent reads uploaded policy documents, checks them against compliance standards, scores compliance (0–100), and provides remediation recommendations.

**No rule engine, no custom scoring code, no document parser — just Foundry.**

---

## 🔁 What Does Foundry Replace?

| Code-First Component | Foundry-First Replacement |
|---|---|
| PDF/DOCX parser (PyMuPDF, python-docx) | Built-in file attachment reading (GPT-4o reads the document natively) |
| Regex-based rule matching engine | Agent reads rules from Knowledge + applies them via reasoning |
| Custom compliance scoring algorithm | **Code Interpreter** — agent writes and runs the scoring calculation |
| Severity categorization logic | Agent applies severity definitions from Knowledge |
| Recommendation generation code | Agent generates recommendations using policy rules from Knowledge |
| Flask API + Semantic Kernel loop | Azure AI Agent Service (managed) |
| Version comparison code | Agent compares two attached documents directly |

---

## 🛠️ Prerequisites

- An Azure Subscription
- Access to [Azure AI Foundry](https://ai.azure.com)
- A deployed GPT-4o model (required for document reading)
- The files in this folder:
  - [`system_prompt.txt`](./system_prompt.txt)
  - [`knowledge/compliance-standards.md`](./knowledge/compliance-standards.md)
- A sample policy document to test with (PDF, DOCX, or Markdown)

---

## 🧱 Step 1 — Create the Project

1. Navigate to [https://ai.azure.com](https://ai.azure.com)
2. Click **+ Create project**
3. Name: `PolicyCompliance`
4. Select subscription, resource group, and hub
5. Click **Create**

---

## 🧠 Step 2 — Create the Agent

1. Go to **Build** → **Agents** → **+ New agent**
2. Fill in:
   - **Name:** `PolicyComplianceChecker`
   - **Model:** `gpt-4o`
3. Paste the contents of [`system_prompt.txt`](./system_prompt.txt) into **Instructions**
4. Click **Save**

---

## 🔢 Step 3 — Enable Code Interpreter

This step replaces the custom Python compliance scoring script.

1. Inside your agent, find the **Tools** section
2. Look for **Code Interpreter** (under "Built-in tools")
3. Click the toggle to **Enable**
4. Click **Save**

> 💡 With Code Interpreter enabled, the agent can write and execute Python code to:
> - Count violations by severity
> - Calculate a weighted compliance score (0–100)
> - Generate formatted compliance reports
> - Compare policy versions to identify changes

---

## 📚 Step 4 — Add Knowledge (Compliance Standards)

This step replaces the rule library and severity definition tables.

> 💡 **Understanding the two parts of this step:** Adding Knowledge involves two distinct configurations:
>
> - **Upload Files** — the *content source*. You select documents (PDF, DOCX, Markdown, TXT, HTML) from your local machine that contain the compliance rules and standards the agent should enforce. Foundry reads these files, splits them into searchable passages, and generates vector embeddings. This is *what* you want the agent to know.
>
> - **Azure AI Search** — the *backend infrastructure*. This is a separate Azure service that stores and indexes the vector embeddings, enabling fast semantic lookups at runtime. It is provisioned as an independent Azure resource in your subscription with its own pricing. This is *where* the agent searches. You can reuse a single Azure AI Search resource across multiple agents and knowledge sets.

1. Inside your agent, find the **Knowledge** section
2. Click **+ Add knowledge**
3. When prompted for the source type, select **Upload files**

   > This option lets you upload documents directly from your local machine. Other source types (not used here) include **Azure Blob Storage** and **SharePoint** — those connect the agent to documents that already live in cloud storage rather than uploading new files.

4. Browse and select [`knowledge/compliance-standards.md`](./knowledge/compliance-standards.md), then click **Upload**

   > For a real deployment, upload your organization's actual compliance frameworks: WCAG 2.1, NIST 800-53, HIPAA safeguards, state agency IT security standards, etc. Supported formats: PDF, DOCX, TXT, Markdown, HTML. You can upload multiple files in a single step.

5. Click **Next** to proceed to the search resource configuration

6. When prompted to configure the **Azure AI Search** resource:
   - If you already have an Azure AI Search resource in your subscription, select it from the dropdown — it can be shared across agents
   - If not, click **Create new Azure AI Search**:
     1. Enter a **resource name** (e.g., `compliance-search`)
     2. Select your **Subscription** and **Resource Group**
     3. Choose a **Pricing tier**:
        - **Free (F)** — sufficient for hackathon/pilot use; limited to 3 indexes and 50 MB storage
        - **Basic** — recommended for small production deployments
        - **Standard S1** — recommended for production with multiple compliance frameworks
     4. Select a **Region** (same region as your Foundry project recommended)
     5. Click **Create** and wait approximately 2 minutes for provisioning

   > ⚠️ **Azure AI Search is a separate, billable Azure resource.** It is not included in the Foundry/Agent Service pricing. Review its cost tier before creating in a production environment.

7. Enter an **index name** (e.g., `compliance-standards-index`) or accept the auto-generated default

8. Keep the default **vectorization settings** (automatic embedding)

9. Click **Next**, review the summary, then click **Create** to complete the wizard. Indexing typically takes 1–3 minutes.

---

## 🧪 Step 5 — Test the Agent

Open the **Playground** inside your agent.

### ✅ Test Full Compliance Review

Attach a policy document (PDF or DOCX) and ask:

**User (with attached policy document):**
> Please review this document for compliance issues and provide a full compliance report.

**Expected behavior:**
1. The agent reads the attached document
2. It checks each section against the compliance standards from Knowledge
3. It identifies violations and assigns severity (Critical, High, Medium, Low)
4. Code Interpreter runs the scoring calculation
5. The agent returns a structured report with:
   - Overall compliance score (0–100)
   - List of violations with severity and location in document
   - Specific recommendations for each violation
   - Summary table

---

### ✅ Test Specific Category Check

**User:**
> Check this document for data privacy compliance issues only.

**Expected:** The agent narrows its review to the data privacy rules from Knowledge and returns only privacy-related violations.

---

### ✅ Test Compliance Score Calculation

**User:**
> Based on the issues found, what is the compliance score and what is the priority order for fixing them?

**Expected:** Code Interpreter calculates the score and the agent provides a prioritized remediation list.

---

### ✅ Test Version Comparison

Attach two versions of a policy document and ask:

**User (with 2 attached files):**
> Compare these two versions of the policy. What compliance issues were fixed, and what new issues were introduced?

**Expected:** The agent compares both documents, lists resolved issues, and flags any new violations.

---

## 📊 Step 6 — Evaluate the Agent

1. Go to **Evaluate** → **+ New evaluation**
2. Select: `PolicyComplianceChecker`
3. Add evaluators:
   - ✅ **Groundedness** — are identified violations grounded in the compliance standards?
   - ✅ **Relevance** — are recommendations relevant to the specific violation?
4. Upload test cases: sample policy documents with known compliance issues and expected findings
5. Click **Run evaluation**

---

## 🎉 You're Done!

You now have:

- ✅ An agent that reads and reviews policy documents (any format)
- ✅ Violation detection grounded in your compliance standards
- ✅ Automatic compliance scoring via Code Interpreter
- ✅ Prioritized remediation recommendations
- ✅ No scoring algorithm to maintain, no rule engine to update

### Next Steps

- **Add more compliance frameworks** to Knowledge: upload WCAG 2.1 guidelines, ADA standards, state IT security requirements, or your organization's internal policy templates
- **Automate document ingestion**: add a SharePoint or OneDrive connection to review policy documents automatically when they're updated
- **Create a compliance dashboard**: use the Azure AI Evaluation tab to track compliance scores over time as policies are revised
- **Add an approval Action**: add an OpenAPI Action to your document management system to mark documents as "compliance reviewed" after the check
