# Inter-Agency Knowledge Hub — Azure AI Foundry Guide

This guide walks you through building an **Inter-Agency Knowledge Hub** using Microsoft Azure AI Foundry. The agent provides unified search across multiple city agency knowledge bases, with access controlled by Entra ID roles.

**Multiple agencies, one agent, zero custom search code.**

---

## 🔁 What Does Foundry Replace?

| Code-First Component | Foundry-First Replacement |
|---|---|
| 5 separate `SearchClient` RAG pipelines (one per agency) | 5 separate **Knowledge** indexes in Foundry |
| Custom cross-agency result merging code | Agent searches all authorized indexes simultaneously |
| MSAL / ADAL authentication code | **Entra ID integration** — built-in to Foundry agent channels |
| Permission filter in each search query | Azure AI Search **security filter** field on the index |
| Custom citation tracking and audit log | Built-in citation tracking + Foundry conversation logs |
| Flask multi-agency API server | Azure AI Agent Service (managed) |

---

## 🛠️ Prerequisites

- An Azure Subscription
- Access to [Azure AI Foundry](https://ai.azure.com)
- A deployed GPT-4o model
- An **Azure Entra ID** tenant (your organization's Azure AD)
- The files in this folder:
  - [`system_prompt.txt`](./system_prompt.txt)
  - All files in the [`knowledge/`](./knowledge/) folder

---

## 🧱 Step 1 — Create the Project

1. Navigate to [https://ai.azure.com](https://ai.azure.com)
2. Click **+ Create project**
3. Name: `InterAgencyHub`
4. Select subscription, resource group, and hub
5. Click **Create**

---

## 🧠 Step 2 — Create the Agent

1. Go to **Build** → **Agents** → **+ New agent**
2. Fill in:
   - **Name:** `KnowledgeHubAgent`
   - **Model:** `gpt-4o`
3. Paste the contents of [`system_prompt.txt`](./system_prompt.txt) into **Instructions**
4. Click **Save**

---

## 📚 Step 3 — Create Five Knowledge Indexes (One Per Agency)

You will create five separate Knowledge connections. Each one indexes the documents for a single agency. This allows you to control access permissions at the index level.

> 💡 **Why separate indexes?** Separate indexes allow security filters to be applied per index. A staff member from the Department of Labor only gets results from the Labor index, not from Health or Social Services indexes.

### 3a. DMV Knowledge Index

1. Inside your agent, find the **Knowledge** section
2. Click **+ Add knowledge** → **Upload files**
3. Upload [`knowledge/dmv-knowledge.md`](./knowledge/dmv-knowledge.md)
4. When prompted for Azure AI Search:
   - Create a **new** Azure AI Search resource (or select an existing one)
   - **Index name:** `dmv-agency-index`
5. Complete the wizard

### 3b. Department of Labor Knowledge Index

1. Click **+ Add knowledge** again → **Upload files**
2. Upload [`knowledge/labor-knowledge.md`](./knowledge/labor-knowledge.md)
3. Use the **same** Azure AI Search resource as Step 3a
   - **Index name:** `labor-agency-index` (create a new index within the same resource)
4. Complete the wizard

### 3c. Social Services Knowledge Index

1. Click **+ Add knowledge** → **Upload files**
2. Upload [`knowledge/social-services-knowledge.md`](./knowledge/social-services-knowledge.md)
3. Same Azure AI Search resource → **Index name:** `social-services-agency-index`
4. Complete the wizard

### 3d. Public Health Knowledge Index

1. Click **+ Add knowledge** → **Upload files**
2. Upload [`knowledge/health-knowledge.md`](./knowledge/health-knowledge.md)
3. Same Azure AI Search resource → **Index name:** `health-agency-index`
4. Complete the wizard

### 3e. General Services Knowledge Index

1. Click **+ Add knowledge** → **Upload files**
2. Upload [`knowledge/general-services-knowledge.md`](./knowledge/general-services-knowledge.md)
3. Same Azure AI Search resource → **Index name:** `general-services-agency-index`
4. Complete the wizard

After completing all five, your agent Knowledge panel should show 5 connected indexes.

---

## 🔐 Step 4 — Configure Role-Based Access with Entra ID

This step restricts which knowledge indexes each user can query based on their Azure Entra ID roles.

> ⚠️ **Note:** Full RBAC security filter implementation requires configuring Azure AI Search security filters. The steps below describe the Foundry portal configuration; for production deployments, a brief configuration in Azure AI Search is also needed to enforce field-level filtering.

### 4a. Enable Entra ID Authentication on the Agent

1. In your agent settings, find the **Authentication** section (or **Channels → Security**)
2. Select **Microsoft Entra ID (Azure AD)** authentication
3. Provide your **Entra ID Tenant ID** and **Client ID** (from an app registration)
4. Click **Save**

> 💡 To create an App Registration in Entra ID:
> - Go to portal.azure.com → **Entra ID** → **App Registrations** → **+ New registration**
> - Name: `KnowledgeHubApp`
> - Supported account types: Accounts in this organizational directory only
> - Click **Register** — note the **Application (client) ID** and **Directory (tenant) ID**

### 4b. Define App Roles in Entra ID

1. In Entra ID → **App Registrations** → `KnowledgeHubApp`
2. Go to **App roles** → **Create app role**
3. Create one role per agency:

| Role Name | Value | Description |
|---|---|---|
| `DMV.Read` | `dmv.read` | Access to DMV knowledge base |
| `Labor.Read` | `labor.read` | Access to Department of Labor knowledge base |
| `SocialServices.Read` | `socialservices.read` | Access to Social Services knowledge base |
| `Health.Read` | `health.read` | Access to Public Health knowledge base |
| `GeneralServices.Read` | `generalservices.read` | Access to General Services knowledge base |
| `AllAgencies.Read` | `allagencies.read` | Cross-agency access (supervisors, OEM staff) |

### 4c. Assign Roles to Users

1. In Entra ID → **Enterprise Applications** → `KnowledgeHubApp`
2. Go to **Users and Groups** → **+ Add user/group**
3. Assign appropriate roles to your staff members or groups

### 4d. Configure System Prompt for Role-Aware Responses

The system prompt already instructs the agent to search only the agencies relevant to the user's query. For full technical enforcement of security filters on the Azure AI Search side, refer to the [Azure AI Search security filter documentation](https://learn.microsoft.com/azure/search/search-security-trimming-for-azure-search).

---

## 🧪 Step 5 — Test the Agent

Open the **Playground** inside your agent.

### ✅ Test Cross-Agency Search

**User:**
> I'm working on a case involving a resident who needs both unemployment benefits and help getting their driver's license reinstated. What are the requirements for each?

**Expected:** The agent searches both the Labor index (unemployment) and DMV index (license reinstatement) and returns relevant information from both with citations identifying which agency each piece of information came from.

---

**User:**
> What are the inter-agency protocols for sharing resident data between Social Services and Public Health?

**Expected:** The agent searches both indexes and synthesizes relevant cross-referencing policies with citations.

---

### ✅ Test Agency-Specific Search

**User:**
> What are the requirements for a commercial vehicle registration?

**Expected:** The agent returns information from the DMV index specifically, with a `[Source: dmv-knowledge.md]` citation.

---

### ✅ Test Citation Tracking

**User:**
> Can you summarize everything you told me and list all the documents you referenced?

**Expected:** The agent provides a summary with a complete list of source citations — supporting audit log compliance.

---

## 📊 Step 6 — Evaluate the Agent

1. Go to **Evaluate** → **+ New evaluation**
2. Select: `KnowledgeHubAgent`
3. Add evaluators:
   - ✅ **Groundedness** — are answers from the correct agency knowledge bases?
   - ✅ **Relevance** — are cross-agency results genuinely relevant to the query?
4. Test with cross-agency queries and verify citations match expected source indexes
5. Click **Run evaluation**

---

## 🎉 You're Done!

You now have:

- ✅ A unified search agent across 5 agency knowledge bases
- ✅ Clear agency attribution in every response (citation per agency)
- ✅ Entra ID authentication for staff access
- ✅ Role-based access control framework for per-agency permissions
- ✅ Zero custom search code

### Next Steps

- **Add real agency documents**: replace sample `.md` files with actual agency PDFs, policy documents, and procedure manuals
- **Enforce security filters**: implement Azure AI Search field-level security filtering to enforce RBAC at the index query level
- **Add audit logging**: enable Azure Monitor diagnostic logs on the AI Search resource for compliance audit trails
- **Add Teams channel**: deploy the agent to a Teams channel so staff can query the hub directly from their existing workspace
- **Expand agencies**: add new agency indexes by repeating Step 3 — each new upload creates a new searchable knowledge base
