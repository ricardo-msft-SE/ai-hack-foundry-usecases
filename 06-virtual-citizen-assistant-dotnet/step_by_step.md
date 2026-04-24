# Virtual Citizen Assistant (.NET) — Azure AI Foundry Guide

Replace your .NET 9 + ASP.NET Core + Semantic Kernel citizen assistant with a zero-code Foundry agent.

---

## 🔁 What Does Foundry Replace?

| Code Component | Foundry Equivalent | Benefit |
|---|---|---|
| `Program.cs` + ASP.NET Core startup | Foundry project + agent | No hosting or config files |
| `CitizenAssistantController.cs` | Agent conversation endpoint | No controller code |
| `KernelBuilder` + `AddAzureOpenAIChatCompletion` | Model selection in agent UI | No SDK configuration |
| `AzureAISearchVectorStore` + `SearchClient` | Knowledge upload | No search index management |
| `DocumentRetrievalPlugin.cs` | Knowledge auto-RAG | No plugin code |
| `PermitStatusPlugin.cs` | OpenAPI Action upload | No function bindings |
| `appsettings.json` (connection strings, keys) | Foundry managed credentials | No secrets management |
| Azure App Service | Foundry hosted endpoint | No infrastructure |
| Application Insights telemetry | Built-in Foundry tracing | No telemetry code |

---

## 🛠️ Prerequisites

- Azure subscription with Azure AI Foundry access ([ai.azure.com](https://ai.azure.com))
- Resource Group with an Azure AI Foundry Hub resource (or permission to create one)
- No .NET SDK, no Visual Studio, no App Service required

---

## 🧱 Step 1 — Create a Foundry Project

1. Navigate to [ai.azure.com](https://ai.azure.com) and sign in
2. Click **+ New project**
3. Name the project: `citizen-assistant-dotnet`
4. Select or create a Hub (choose a region near you: East US or West Europe recommended)
5. Click **Create project** and wait for provisioning (~2 minutes)

---

## 🧠 Step 2 — Create the Agent

1. In the left menu, click **Agents**
2. Click **+ New agent**
3. Set the agent name: `Citizen Assistant`
4. Select a model: **gpt-4o** (recommended) or gpt-4o-mini for lower cost
5. In the **Instructions** field, paste the full contents of [`system_prompt.txt`](./system_prompt.txt)
6. Click **Save**

---

## 📚 Step 3 — Add Knowledge

Upload the knowledge file so the agent can answer questions about city services:

1. In the agent editor, click **+ Add** under the **Knowledge** section
2. Select **Upload files**
3. Upload [`knowledge/city-services.md`](./knowledge/city-services.md)
4. Set the index name: `city-services-dotnet-index`
5. Click **Create and save**

> **What this replaces:** The original code used `AzureAISearchVectorStore`, chunked documents manually, and called `SearchClient.SearchAsync()`. Foundry handles all of this — chunking, embedding, indexing, retrieval, and citation injection — with no code.

---

## 🔧 Step 4 — Add Permit Status Action

Upload the OpenAPI spec to enable live permit lookups:

1. In the agent editor, click **+ Add** under the **Actions** section
2. Select **Upload OpenAPI file**
3. Upload [`openapi/permit-api.json`](./openapi/permit-api.json)
4. Review the imported operations: `GetPermitStatus`, `ListPermitTypes`
5. Click **Save**

> **What this replaces:** `PermitStatusPlugin.cs` used `[KernelFunction]` attributes and manual HTTP calls. The OpenAPI spec defines the same contract — Foundry calls the API automatically when the user asks about a permit.

> **Note:** The `server.url` in the OpenAPI spec points to `https://permits.exampleville.gov/api/v1`. Replace this with your real permits API URL before going to production.

---

## 🧪 Step 5 — Test the Agent

Test common resident scenarios in the Playground:

**Service information questions (tests Knowledge):**
- "How do I apply for a business license?"
- "What documents do I need to renew my building permit?"
- "What are the hours for the DMV office?"
- "How do I schedule a building inspection?"

**Permit status lookups (tests Action):**
- "What is the status of permit P-2024-001892?"
- "What types of permits does the city issue?"
- "My contractor applied for a permit last week — how do I check if it was approved?"

**Multi-turn conversation (tests context retention):**
- "I need to open a restaurant."
- "What permits do I need?"
- "How long does the food service permit take to process?"

**Expected behaviors:**
- Knowledge answers include citations (`[Source: city-services.md — section name]`)
- Permit status responses include the permit number, current status, and estimated completion
- The agent maintains context across the conversation (remembers "restaurant" from the first message)

---

## 📊 Step 6 — Evaluate Agent Quality

Run a structured evaluation to measure answer quality:

1. In the agent, click the **Evaluation** tab
2. Click **+ New evaluation**
3. Select evaluation type: **Agent evaluation**
4. Create a test dataset with 10–15 question/answer pairs:

   | Input | Expected Output (Ground Truth) |
   |---|---|
   | How do I apply for a food service permit? | (correct answer from city-services.md) |
   | What is the status of permit P-2024-001892? | (status from API) |
   | What documents do I need for SNAP? | Should say: "I can help with permit questions..." |

5. Run the evaluation
6. Review metrics: **Groundedness** (is the answer based on knowledge?), **Relevance** (does it answer the question?), **Coherence** (is it well-written?)

> **Target scores:** Groundedness ≥ 4.0/5, Relevance ≥ 4.0/5. If scores are low, refine the system prompt or add more content to the knowledge file.

---

## 🎉 Done! Next Steps

Your .NET citizen assistant is now running as a Foundry agent — no App Service, no CI/CD pipeline, no secrets rotation.

**Extend this agent:**
- **Add to Teams:** Connect the agent to Microsoft Teams so residents and staff can use it in chat
- **Add more permits:** Extend `permit-api.json` with additional endpoints (fee calculation, document checklist)
- **Add more knowledge:** Upload additional `.md` files (zoning rules, fee schedules, contact directories)
- **Multi-language:** Add `"Always respond in the same language the user writes in"` to the system prompt
- **Connect to 05 (Inter-Agency Hub):** When this agent can't answer, hand off to the cross-agency knowledge hub agent using Connected Agents
