# Constituent Services Agent — Azure AI Foundry Guide

This guide walks you through building a **Constituent Services Agent** using Microsoft Azure AI Foundry. The agent answers citizen questions about city services — permits, benefits, schedules, and more — with citations from official documents.

**No custom backend code or hosting is required.**

---

## 🔁 What Does Foundry Replace?

| Code-First Component | Foundry-First Replacement |
|---|---|
| Flask web API server | Azure AI Agent Service (fully managed) |
| Semantic Kernel conversation loop | Agent Service manages conversation state automatically |
| Custom RAG pipeline code | Native **Knowledge** (auto-chunks, embeds, indexes) |
| `SearchClient` + Azure AI Search SDK | Azure AI Search created and managed automatically |
| `@kernel_function` Python plugin classes | **Actions** — upload an OpenAPI spec, no code |
| Custom citation tracking logic | Built-in citation tracking in every Knowledge response |
| Multi-language prompt wrapping | System prompt language instruction |

---

## 🛠️ Prerequisites

- An Azure Subscription
- Access to [Azure AI Foundry](https://ai.azure.com)
- A deployed GPT-4o or GPT-4-turbo model
- The files in this folder:
  - [`system_prompt.txt`](./system_prompt.txt)
  - [`openapi/city-services-api.json`](./openapi/city-services-api.json)
  - [`knowledge/city-services-overview.md`](./knowledge/city-services-overview.md)

---

## 🧱 Step 1 — Create the Project

1. Navigate to [https://ai.azure.com](https://ai.azure.com)
2. Click **+ Create project**
3. Fill in:
   - **Project name:** `ConstituentServices`
   - **Hub:** Select an existing hub or create a new one
   - **Subscription & Resource Group:** Select yours
4. Click **Create**

> 💡 If you already have an Azure AI Foundry project, skip to Step 2.

---

## 🧠 Step 2 — Create the Agent

1. In the left navigation, go to **Build** → **Agents**
2. Click **+ New agent**
3. Fill in:
   - **Name:** `CityServicesBot`
   - **Model:** Select `gpt-4o` (recommended) or `gpt-4-turbo`
4. In the **Instructions** field, paste the full contents of [`system_prompt.txt`](./system_prompt.txt)
5. Click **Save**

> 💡 The system prompt tells the agent its persona, what topics to cover, how to handle uncertainty, and which language to use.

---

## 📚 Step 3 — Add Knowledge (No-Code RAG)

This step replaces the custom RAG pipeline, `SearchClient` code, and document retrieval plugin from the code-first version.

1. Inside your agent page, find the **Knowledge** section (right panel or dedicated tab)
2. Click **+ Add knowledge**
3. Select **Upload files**
4. Upload [`knowledge/city-services-overview.md`](./knowledge/city-services-overview.md)

   > For a real deployment, upload your city's official PDFs, policy documents, and service guides here. The agent will answer from all of them.

5. When prompted for an Azure AI Search resource:
   - Select an existing resource, or click **Create new** and follow the wizard
   - Keep default vectorization settings (automatic embedding)
6. Click **Next** and complete the wizard

Foundry automatically:
- Chunks the documents into searchable passages
- Generates vector embeddings
- Builds the Azure AI Search index
- Wires citation tracking into every response — no code needed

---

## 🔧 Step 4 — Add an Action (No-Code API Integration)

This step replaces the `@kernel_function` Python plugin classes and any custom API client code.

### 4a. Review the OpenAPI Spec

Open [`openapi/city-services-api.json`](./openapi/city-services-api.json) and note the two operations:
- **`GetServiceInfo`** — retrieve details about a named city service
- **`GetFAQ`** — retrieve FAQs for a given topic

> To connect to a real city API, replace the `servers.url` value in the JSON with your real API base URL.

### 4b. Upload the Action in Foundry

1. Inside your agent, find the **Tools** tab or **Actions** panel
2. Click **+ Add tool**
3. Select **OpenAPI** (may appear as "Custom" or "External API")
4. Configure:
   - **Tool Name:** `CityServicesAPI`
   - **Definition:** Click **Upload file** → select `openapi/city-services-api.json`
   - **Authentication:** Select **None (Anonymous)**
5. Click **Add**

Your agent can now call the city services API during conversations.

---

## 🧪 Step 5 — Test the Agent in the Playground

Click **Try in playground** (or open the **Chat** tab inside your agent).

### ✅ Test Knowledge (Document Q&A with Citations)

**User:**
> What documents do I need to apply for a business license?

**Expected:** The agent responds with requirements from the uploaded document and includes a citation like `[Source: city-services-overview.md]`.

---

**User:**
> Is there financial assistance available for residents who lost their job?

**Expected:** The agent describes the unemployment/benefit program from the knowledge base with a citation.

---

**User:**
> When is recycling collected?

**Expected:** The agent returns the recycling schedule from the knowledge document.

---

### ✅ Test Actions (Live API Calls)

**User:**
> Tell me more about the food assistance program.

**Expected:** The agent calls `GetServiceInfo` with `serviceName = "food-assistance"` and returns the API response.

> 💡 Since `city-services-api.json` uses a mock URL (`api.exampleville.gov`), the API call will fail with a network error — but the **Planning log** in the Playground will confirm that the agent correctly:
> - Identified the right tool (`CityServicesAPI`)
> - Extracted the right parameter (`serviceName = "food-assistance"`)
> - Formatted the request correctly

---

### ✅ Test Multi-Language

**User (Spanish):**
> ¿Cómo solicito una licencia de negocios?

**Expected:** The agent responds in Spanish using information from the knowledge base.

---

## 📊 Step 6 — Evaluate the Agent

1. In the left navigation, go to **Evaluate** → **+ New evaluation**
2. Select your agent: `CityServicesBot`
3. Add evaluators:
   - ✅ **Groundedness** — are answers backed by the knowledge base?
   - ✅ **Relevance** — are answers on-topic for the user's question?
   - ✅ **Coherence** — are answers well-structured and readable?
4. Upload a test dataset or enter sample Q&A pairs manually
5. Click **Run evaluation** and review results in the **Metrics** tab

> 💡 Use the sample questions from the Playground tests above as your evaluation dataset.

---

## 🎉 You're Done!

You now have:

- ✅ A fully functional Azure AI Foundry agent answering citizen questions
- ✅ Document-backed responses with automatic citations
- ✅ API connectivity for live service lookups
- ✅ No infrastructure to manage, no code to maintain

### Next Steps

- **Add more documents** to Knowledge: upload your full city services catalog (PDFs, DOCx, Markdown)
- **Connect to a real API**: replace the mock URL in `city-services-api.json` with your real city services endpoint
- **Add to Teams**: go to the **Channels** tab in your agent and connect to Microsoft Teams for instant deployment
- **Enable multi-language**: the system prompt already handles this — test it with Spanish, French, or other languages
- **Escalation routing**: add a second Action pointing to a ticketing system API (e.g., ServiceNow) for cases the agent can't resolve
