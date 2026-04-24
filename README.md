# 🏛️ AI Hackathon Accelerators — Foundry First Edition

A recreation of 7 government AI accelerators built with **Microsoft Azure AI Foundry** — no custom backends, no Python or .NET orchestration code required. Each accelerator is a complete step-by-step guide you can follow in the Azure AI Foundry portal in under 30 minutes.

> **Origin:** These guides are Foundry-first recreations of the [AI Hackathon Use Cases](https://github.com/msftsean/ai-hackathon-use-cases) by [@msftsean](https://github.com/msftsean). The Foundry-first approach was pioneered in the [Virtual Citizen Assistant (Foundry Edition)](https://github.com/ricardo-msft-SE/aihack-FoundryFirst).

---

## Why Foundry First?

Traditional "code-first" implementations (Semantic Kernel, LangChain, custom Flask/ASP.NET APIs) require:

- Managing infrastructure, hosting, and deployments
- Writing and maintaining RAG pipeline code
- Building and deploying plugin/tool code as functions
- Orchestrating multi-agent workflows in code

The **Foundry-first approach** replaces all of that with native portal features:

| What You'd Write in Code | Foundry-First Replacement |
|---|---|
| Custom RAG pipeline + `SearchClient` code | **Knowledge** — upload docs, Foundry indexes automatically |
| `@kernel_function` plugin classes | **Actions** — upload an OpenAPI JSON, no code |
| Multi-agent orchestrator loop | **Connected Agents** — wire agents together in the portal |
| Document Intelligence SDK calls | **Built-in Document Intelligence tool** — toggle in agent settings |
| Compliance scoring with Code Interpreter | **Built-in Code Interpreter tool** — toggle in agent settings |
| App Service / Container Apps hosting | **Fully managed** — zero infrastructure |
| Custom evaluation scripts | **Azure AI Evaluation** — built into Foundry |

---

## The 7 Accelerators

| # | Accelerator | Purpose | Key Foundry Features |
|---|---|---|---|
| 1 | [Constituent Services Agent](./01-constituent-services-agent/) | Answer citizen questions about city services with citations | Agent + Knowledge + Action |
| 2 | [Document Eligibility Agent](./02-document-eligibility-agent/) | Process and validate uploaded eligibility documents | Agent + Document Intelligence tool + Knowledge + Action |
| 3 | [Emergency Response Agent](./03-emergency-response-agent/) | Multi-agency emergency coordination and planning | 3 Connected Agents + Knowledge + 2 Actions |
| 4 | [Policy Compliance Checker](./04-policy-compliance-checker/) | Review policy documents against compliance rules with scoring | Agent + Knowledge + Code Interpreter |
| 5 | [Inter-Agency Knowledge Hub](./05-inter-agency-knowledge-hub/) | Unified cross-agency document search with access control | Agent + Multiple Knowledge Indexes + Entra ID RBAC |
| 6 | [Virtual Citizen Assistant (.NET)](./06-virtual-citizen-assistant-dotnet/) | RAG-powered citizen chatbot — Foundry replaces .NET app | Agent + Knowledge + Action |
| 7 | [Virtual Citizen Assistant (Python)](./07-virtual-citizen-assistant-python/) | RAG-powered citizen chatbot with scheduling — Foundry replaces Python | Agent + Knowledge + Action |

---

## Prerequisites (All Accelerators)

- An Azure Subscription
- Access to [Azure AI Foundry](https://ai.azure.com)
- An Azure OpenAI model deployment (**GPT-4o** recommended)
- (Created automatically during setup) Azure AI Search resource

> 💡 All accelerators work with a **free trial** Azure subscription. No enterprise agreement required.

---

## How to Use This Repo

1. Pick an accelerator from the table above
2. Open the accelerator folder
3. Read the `README.md` for a quick overview
4. Follow the `step_by_step.md` — click-by-click Foundry portal instructions
5. Use the provided `system_prompt.txt`, `openapi/*.json`, and `knowledge/*.md` files as you go

**No code to write. No deployments to configure. Just Foundry.**

---

## Visual Documentation Site (Jekyll + GitHub Pages)

This repo now includes a visually-rich Jekyll site under `docs/` with:

- A polished landing page with accelerator cards
- One documentation page per accelerator
- Direct links to each accelerator's `README.md`, `step_by_step.md`, `system_prompt.txt`, OpenAPI specs, and knowledge files

### Enable GitHub Pages

1. Go to **Settings** in this GitHub repository
2. Open **Pages**
3. Under **Build and deployment**, set:
    - **Source:** Deploy from a branch
    - **Branch:** `main`
    - **Folder:** `/docs`
4. Save

GitHub will publish the site automatically after a short build.

### Local Preview (optional)

From the repo root:

```bash
cd docs
bundle exec jekyll serve
```

Then open `http://localhost:4000`.

---

## Folder Structure

Each accelerator folder contains:

```
XX-accelerator-name/
├── README.md                  # Overview, purpose, Foundry features used
├── step_by_step.md            # Click-by-click Foundry portal guide
├── system_prompt.txt          # Copy-paste ready system instructions for the agent
├── openapi/                   # OpenAPI specs to upload as Actions
│   └── *.json
└── knowledge/                 # Sample documents to upload as Knowledge
    └── *.md
```

---

## Approach Comparison

| Component | Code-First (Original) | Foundry First (This Repo) |
|---|---|---|
| **Conversation loop** | Python/C# + Semantic Kernel | Azure AI Agent Service — managed |
| **RAG retrieval** | `SearchClient` + vector embedding code | Knowledge — upload docs, done |
| **External API calls** | Python plugin classes | Actions — upload OpenAPI JSON, done |
| **Multi-agent** | Custom orchestrator code | Connected Agents — UI wiring |
| **OCR / document parsing** | Document Intelligence SDK | Built-in Document Intelligence tool |
| **Scoring / analysis** | Custom Python scripts | Built-in Code Interpreter tool |
| **Hosting** | App Service / Container Apps | Fully managed — none required |
| **Evaluation** | Custom eval scripts + pytest | Azure AI Evaluation tab |
| **Time to first demo** | Hours to days | < 30 minutes |
