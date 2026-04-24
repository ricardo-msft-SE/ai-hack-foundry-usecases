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

1. Inside your agent, find the **Knowledge** section
2. Click **+ Add knowledge** → **Upload files**
3. Upload [`knowledge/compliance-standards.md`](./knowledge/compliance-standards.md)

   > For a real deployment, upload your organization's actual compliance frameworks: WCAG 2.1, NIST 800-53, HIPAA safeguards, state agency IT security standards, etc.

4. Select or create an Azure AI Search resource
5. Complete the wizard

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
