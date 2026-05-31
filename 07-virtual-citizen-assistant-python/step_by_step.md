# Virtual Citizen Assistant (Python) — Azure AI Foundry Guide

Replace your Python + Semantic Kernel + Flask citizen assistant — including the appointment scheduling plugin — with a zero-code Foundry agent.

---

## 🔁 What Does Foundry Replace?

| Code Component | Foundry Equivalent | Benefit |
|---|---|---|
| `app.py` + Flask routes | Foundry agent endpoint | No web framework |
| `kernel = Kernel()` setup | Built-in agent engine | No SDK install |
| `kernel.add_plugin(DocumentRetrievalPlugin)` | Knowledge upload | No plugin code |
| `kernel.add_plugin(SchedulingPlugin)` | OpenAPI Action upload | No function code |
| `AzureAISearchVectorStore` configuration | Knowledge auto-RAG | No vector store setup |
| `@kernel_function` decorators | OpenAPI `operationId` | No Python code |
| `requirements.txt` + `pip install` | Nothing | No dependencies |
| `gunicorn app:app` + App Service | Foundry managed endpoint | No server |
| `.env` file with secrets | Foundry managed credentials | No secrets management |

---

## 🛠️ Prerequisites

- Azure subscription with Azure AI Foundry access ([ai.azure.com](https://ai.azure.com))
- Resource Group with an Azure AI Foundry Hub (or permission to create one)
- No Python, no pip, no Flask, no App Service required

---

## 🧱 Step 1 — Create a Foundry Project

1. Navigate to [ai.azure.com](https://ai.azure.com) and sign in
2. Click **+ New project**
3. Name the project: `citizen-assistant-python`
4. Select or create a Hub (East US or West Europe recommended)
5. Click **Create project**

---

## 🧠 Step 2 — Create the Agent

1. In the left menu, click **Agents**
2. Click **+ New agent**
3. Set the agent name: `Citizen Assistant with Scheduling`
4. Select a model: **gpt-4o** (recommended) or gpt-4o-mini
5. In the **Instructions** field, paste the full contents of [`system_prompt.txt`](./system_prompt.txt)
6. Click **Save**

---

## 📚 Step 3 — Add Knowledge

1. In the agent editor, click **+ Add** under the **Knowledge** section
2. Select **Upload files**
3. Upload [`knowledge/city-services.md`](./knowledge/city-services.md)
4. Set the index name: `city-services-python-index`
5. Click **Create and save**

> **What this replaces:** `document_retrieval_plugin.py` used `@kernel_function` to query Azure AI Search with `SearchClient.search()`. Foundry handles chunking, embedding, indexing, and retrieval — no code needed.

---

## 🔧 Step 4 — Add Scheduling Action

Upload the OpenAPI spec to enable appointment availability checks and booking:

1. In the agent editor, click **+ Add** under the **Actions** section
2. Select **Upload OpenAPI file**
3. Upload [`openapi/scheduling-api.json`](./openapi/scheduling-api.json)
4. Review the imported operations:
   - `CheckAvailability` — check open appointment slots by service and date
   - `BookAppointment` — book a specific appointment slot
   - `CancelAppointment` — cancel an existing appointment
5. Click **Save**

> **What this replaces:** `scheduling_plugin.py` contained three `@kernel_function`-decorated methods for availability, booking, and cancellation. Each was a separate HTTP call wrapped in Python. The OpenAPI spec defines the same interface — Foundry calls the API automatically.

> **Note:** The `server.url` points to `https://appointments.exampleville.gov/api/v1`. Replace with your real appointments API before production.

---

## 🧪 Step 5 — Test the Agent

**Information questions (tests Knowledge):**
- "What services require an appointment?"
- "What do I need to bring to a benefits counseling appointment?"
- "Can I walk in for a building inspection, or do I need to schedule?"

**Scheduling flow (tests Action — multi-turn):**
- "I need to schedule a building inspection"
- "Next Thursday works for me"
- "Book the 10 AM slot" ← agent calls `BookAppointment`, returns confirmation number

**Availability check:**
- "Is there availability for a DMV appointment this week?"
- "What's the earliest I can get a SNAP application appointment?"

**Cancellation:**
- "I need to cancel appointment APT-2024-889234"

**Expected behaviors:**
- Knowledge answers cite source (`[Source: city-services.md — section name]`)
- Scheduling multi-turn works: agent asks for service, date, time, then confirms before booking
- Booking response includes confirmation number, date/time, location, and what to bring
- Agent asks for confirmation before canceling an appointment

---

## 📊 Step 6 — Evaluate Agent Quality

1. In the agent, click the **Evaluation** tab
2. Click **+ New evaluation**
3. Select **Agent evaluation**
4. Create a test dataset with at least 15 rows covering:
   - Pure knowledge questions (test Groundedness)
   - Scheduling-related questions (test Task Completion)
   - Edge cases: "What if I miss my appointment?", "Can I reschedule?"

5. Run the evaluation and review metrics:
   - **Groundedness** ≥ 4.0/5 (answers based on uploaded knowledge)
   - **Relevance** ≥ 4.0/5 (answers the actual question asked)
   - **Task Completion** ≥ 80% (scheduling flows reach a confirmed booking)

6. For lower-scoring items, review the agent trace to see which step failed:
   - Wrong tool chosen → refine system prompt
   - Incomplete API response → extend knowledge file
   - Multi-turn confusion → add explicit multi-turn instructions to system prompt

---

## 🎉 Done! Next Steps

Your Python + Semantic Kernel citizen assistant is now a Foundry agent — complete with scheduling — and you wrote zero lines of code.

**Extend this agent:**
- **Add reschedule support:** Add a `RescheduleAppointment` endpoint to the OpenAPI spec
- **Add reminder notifications:** Connect to an email/SMS Action via OpenAPI
- **Add more schedulable services:** Update `city-services.md` with new services and appointment requirements
- **Connect with 01 or 06:** Route permit questions to a specialized permit agent while keeping scheduling here — wire them together using a **Foundry Workflow** (see accelerator 03 for the Workflow pattern)
- **Deploy to Teams or web:** Publish this agent as a Teams app or embed via the Foundry-provided iframe snippet
