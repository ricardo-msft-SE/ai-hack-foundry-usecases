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
| Multi-agent orchestrator loop | **Foundry Workflow** — wire agents together visually in the portal |
| Document Intelligence SDK calls | **Code Interpreter + gpt-4o vision** — process uploaded files in the sandbox |
| Compliance scoring with Code Interpreter | **Built-in Code Interpreter tool** — toggle in agent settings |
| App Service / Container Apps hosting | **Fully managed** — zero infrastructure |
| Custom evaluation scripts | **Azure AI Evaluation** — built into Foundry |

---

## The 7 Accelerators

| # | Accelerator | Purpose | Key Foundry Features |
|---|---|---|---|
| 1 | [Constituent Services Agent](./01-constituent-services-agent/) | Answer citizen questions about city services with citations | Agent + Knowledge + Action |
| 2 | [Document Eligibility Agent](./02-document-eligibility-agent/) | Process and validate uploaded eligibility documents | Agent + Code Interpreter (gpt-4o vision) + Knowledge + Action |
| 3 | [Emergency Response Agent](./03-emergency-response-agent/) | Multi-agency emergency coordination and planning | 3 Agents + Foundry Workflow + Knowledge + 2 Actions |
| 4 | [Policy Compliance Checker](./04-policy-compliance-checker/) | Review policy documents against compliance rules with scoring | Agent + Knowledge + Code Interpreter |
| 5 | [Inter-Agency Knowledge Hub](./05-inter-agency-knowledge-hub/) | Unified cross-agency document search with access control | Agent + Multiple Knowledge Indexes + Entra ID RBAC |
| 6 | [Virtual Citizen Assistant (.NET)](./06-virtual-citizen-assistant-dotnet/) | RAG-powered citizen chatbot — Foundry replaces .NET app | Agent + Knowledge + Action |
| 7 | [Virtual Citizen Assistant (Python)](./07-virtual-citizen-assistant-python/) | RAG-powered citizen chatbot with scheduling — Foundry replaces Python | Agent + Knowledge + Action |

---

## Bonus Accelerators (Document Processing Focused)

| # | Accelerator | Purpose | Key Foundry Features |
|---|---|---|---|
| 8 | [Professional License Credential Verifier](./08-professional-license-credential-verifier/) | Extract and auto-approve professional credentials for licensing boards | Agent + Code Interpreter + Knowledge + Action |
| 9 | [Unemployment Claims Processor](./09-unemployment-claims-processor/) | Rapid UI and WC claims processing with automated benefit calculation | Agent + Code Interpreter + Knowledge + Action |

### Bonus Accelerators — Why These?

The Bonus Accelerators focus on **high-impact document processing** with **automated decision-making**. These scenarios appear frequently in state government:

- **Licensing boards** receive 10,000+ applications annually; manual processing takes 2–4 weeks per application
- **UI/WC agencies** face catastrophic claim volumes during recessions; manual processing takes 3–6 weeks per claim

Both accelerators leverage **Code Interpreter + gpt-4o vision** (extract credentials, wages, medical data) + **Code Interpreter** Python execution (verify eligibility, calculate benefits) for **rapid auto-approval** (70–80% of cases within 24–48 hours).

---

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
| **Multi-agent** | Custom orchestrator code | Foundry Workflow — visual designer |
| **OCR / document parsing** | Document Intelligence SDK | Code Interpreter + gpt-4o vision |
| **Scoring / analysis** | Custom Python scripts | Built-in Code Interpreter tool |
| **Hosting** | App Service / Container Apps | Fully managed — none required |
| **Evaluation** | Custom eval scripts + pytest | Azure AI Evaluation tab |
| **Time to first demo** | Hours to days | < 30 minutes |

---

## 📎 Appendix — Using GitHub Copilot in this Hackathon

GitHub Copilot (GHCP) in VS Code is more than a code completer — during this hackathon it acts as your **Azure CLI expert, repo navigator, infrastructure deployer, and slide deck generator**. The four labs below are self-contained and can be done in any order.

> **Prerequisites for all labs**
> - [VS Code](https://code.visualstudio.com/) installed
> - A GitHub account with **GitHub Copilot** access (individual, team, or enterprise license)
> - An Azure subscription with Contributor access

---

### 🧪 Lab 1 — Connect VS Code to Azure AI Foundry

**Goal:** Authenticate VS Code to Azure and Foundry so GitHub Copilot can query and deploy your AI resources without leaving the editor.

**Estimated time: 15 minutes**

#### Step 1 — Install Required Extensions

1. Open VS Code and press `Ctrl+Shift+X` to open the Extensions panel
2. Search for and install each of the following:
   - **GitHub Copilot** (by GitHub) — AI pair programmer
   - **GitHub Copilot Chat** (by GitHub) — conversational AI panel
   - **Azure Account** (by Microsoft) — unified Azure sign-in for all Azure extensions
   - **Azure AI Foundry** (by Microsoft) — browse projects, agents, and deployments directly in VS Code
3. Reload VS Code after installing

#### Step 2 — Sign in to GitHub

1. In the bottom-left status bar, click the **Accounts** icon (person silhouette)
2. Click **Sign in with GitHub to use GitHub Copilot**
3. A browser window opens — authorize VS Code
4. Return to VS Code; the Copilot icon appears in the status bar (check mark = active)

#### Step 3 — Sign in to Azure

1. Press `Ctrl+Shift+P` → type `Azure: Sign In` → press Enter
2. A browser window opens — sign in with your Azure credentials
3. Return to VS Code; the Azure panel (`Ctrl+Shift+A`) now shows your subscriptions

> 💡 If you have multiple Azure tenants, run `Azure: Select Subscriptions` from the command palette to pick the right one.

#### Step 4 — Connect to Azure AI Foundry

1. In the Activity Bar (left side), click the **Azure AI Foundry** icon (or press `Ctrl+Shift+A` and expand the Foundry section)
2. Expand your subscription → your resource group → your Foundry project
3. You can now browse:
   - **Agents** — view and inspect agents you've built
   - **Deployments** — see which models are deployed
   - **Connections** — view linked resources (Azure AI Search, storage, etc.)

#### Step 5 — Use Copilot Chat to Query Your Foundry Resources

1. Open **Copilot Chat** (`Ctrl+Alt+I` or click the chat icon in the sidebar)
2. Try these prompts to verify everything is connected:

   ```
   @azure What AI Foundry projects do I have in my subscription?
   ```

   ```
   @azure What model deployments are available in my Foundry project?
   ```

   ```
   @azure Show me the agents in my DocumentEligibility Foundry project
   ```

> Copilot calls Azure APIs on your behalf and returns structured answers. You can then ask follow-up questions or ask it to take actions like creating a new deployment.

---

### 🧪 Lab 2 — Connect to Your GitHub Repo with VS Code and GHCP

**Goal:** Clone this hackathon repo, explore it with Copilot, make a change, and push it back — all without leaving VS Code.

**Estimated time: 20 minutes**

#### Step 1 — Install Git (if not already installed)

1. Open a VS Code terminal (`Ctrl+\``)
2. Run `git --version`
3. If not installed, download from [https://git-scm.com](https://git-scm.com) and run the installer with defaults
4. Restart VS Code after installing

#### Step 2 — Authenticate GitHub in VS Code

1. Press `Ctrl+Shift+P` → `GitHub: Sign in`
2. Authorize VS Code in the browser that opens
3. Return to VS Code — the Source Control panel (`Ctrl+Shift+G`) is now GitHub-aware

#### Step 3 — Clone the Repo

1. Press `Ctrl+Shift+P` → `Git: Clone`
2. Enter the repo URL: `https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases`
3. Choose a local folder (e.g., `C:\Hackathon\`)
4. When prompted, click **Open** to open the cloned repo in VS Code

> 💡 Alternatively: press `Ctrl+Shift+P` → `GitHub: Clone from GitHub` and search for `ai-hack-foundry-usecases` — no URL copy-paste needed.

#### Step 4 — Explore the Repo with Copilot

Open Copilot Chat and try these prompts to orient yourself:

```
@workspace What accelerators are in this repo and what does each one do?
```

```
@workspace Which accelerator would be best for a scenario involving document uploads and eligibility checking?
```

```
@workspace Explain the folder structure of the 02-document-eligibility-agent accelerator
```

Copilot reads the actual files in your workspace and gives answers grounded in the real content — not generic documentation.

#### Step 5 — Make a Change and Push

1. Open any `system_prompt.txt` in an accelerator folder
2. Ask Copilot to improve it:

   ```
   Improve this system prompt to be more specific about PII handling and add a section on how to handle ambiguous or incomplete documents
   ```

3. Accept the suggestion (click **Apply** or copy into the file)
4. Open the **Source Control** panel (`Ctrl+Shift+G`)
5. Stage the file (click **+** next to the file name)
6. Type a commit message in the text box — or ask Copilot: `Generate a commit message for this change`
7. Click the **✓ Commit** button, then **Sync Changes** to push

---

### 🧪 Lab 3 — Deploy Azure Resources Using CLIs and GitHub Copilot

**Goal:** Use GitHub Copilot to help you write and run Azure CLI (`az`) commands that provision Foundry resources — without memorizing command syntax.

**Estimated time: 25 minutes**

#### Step 1 — Install the Azure CLI

1. Open a VS Code terminal
2. Run `az version` to check if it's installed
3. If not, install it:
   - **Windows:** `winget install Microsoft.AzureCLI`
   - **macOS:** `brew install azure-cli`
4. Run `az login` and complete browser sign-in
5. Run `az account show` to confirm the right subscription is active

> If you need to switch subscriptions: `az account set --subscription "<name or ID>"`

#### Step 2 — Install the Azure Developer CLI (azd)

`azd` is a higher-level CLI that provisions full solution architectures in one command.

1. In the terminal, run `azd version` to check
2. If not installed:
   - **Windows:** `winget install Microsoft.Azd`
   - **macOS:** `brew tap azure/azd && brew install azd`
3. Run `azd auth login` to authenticate

#### Step 3 — Let Copilot Write the CLI Commands

Open Copilot Chat and ask it to generate deployment commands. Example prompts:

```
@azure Write an az CLI command to create an Azure AI Foundry project called "DocumentEligibility" in East US, using an existing resource group called "hackathon-rg"
```

```
@azure Write an az CLI command to deploy a gpt-4o model to my Foundry project with a capacity of 10K tokens per minute
```

```
@azure What az CLI command creates an Azure AI Search resource at the Basic tier in East US?
```

Copilot returns ready-to-run commands. Review them, then click **Insert into Terminal** or copy-paste.

#### Step 4 — Run a Full Foundry Project Deployment

Ask Copilot for a complete deployment sequence:

```
@azure Give me a complete sequence of az CLI commands to:
1. Create a resource group called "hackathon-rg" in East US
2. Create an Azure AI Services account
3. Create an Azure AI Foundry project linked to that account
4. Deploy a gpt-4o model
```

Run each command in the terminal. After the sequence, run:

```bash
az resource list -g hackathon-rg -o table
```

to see all provisioned resources.

#### Step 5 — Troubleshoot Errors with Copilot

If a command fails, paste the error into Copilot Chat:

```
I ran this az command: [paste command]
I got this error: [paste error]
How do I fix it?
```

Copilot explains the error and suggests a corrected command. This is especially useful for quota errors, region availability issues, and permission problems.

---

### 🧪 Lab 4 — Create an HTML Presentation for Your Demo Day

**Goal:** Use GitHub Copilot to generate a polished, browser-ready HTML slide deck for your hackathon final presentation — no PowerPoint, no design tools required.

**Estimated time: 20 minutes**

#### Step 1 — Describe Your Use Case to Copilot

Open Copilot Chat and give it your use case context. Example prompt:

```
I need an HTML presentation for a hackathon demo day. Our team built a Document Eligibility Agent using Azure AI Foundry. It accepts uploaded W-2s, pay stubs, and utility bills, extracts key fields using gpt-4o's vision capabilities, checks eligibility against program rules, and routes approved cases to staff queues — all with no custom code.

Create a self-contained single-file HTML presentation using reveal.js (CDN-hosted) with 8–10 slides:
1. Title slide — team name, use case name
2. The problem we solved (before state)
3. Our solution and approach (Foundry-first, no custom code)
4. Architecture — show a simple text diagram of the components
5. How it works — step-by-step flow of a document being processed
6. Live demo preview — a sample chat transcript
7. Key results — what we built, how fast
8. Next steps / roadmap
9. Thank you / Q&A

Use a dark professional theme with Azure blue (#0078D4) as the accent color. Make it look polished.
```

#### Step 2 — Save and Preview the Output

1. Copilot generates a complete HTML file
2. Create a new file: `File → New File → Save As → presentation.html` (save it inside your cloned repo folder)
3. Right-click the file in the Explorer panel → **Open with Live Server**
   - Install the **Live Server** extension (`ritwickdey.liveserver`) if prompted
4. Your browser opens with a live preview of the slides

> **Navigate slides:** Arrow keys or spacebar to advance. Press `F` for fullscreen. Press `S` for speaker notes view (if notes were generated).

#### Step 3 — Customize Individual Slides

Ask Copilot to refine specific slides:

```
Update slide 3 to include a two-column comparison table: Code-First (left) vs Foundry-First (right), with rows for RAG, document parsing, multi-agent, and hosting
```

```
Add a slide showing a sample chat transcript: a citizen uploads a W-2, the agent extracts the fields, compares against eligibility rules, and returns an approval with a citation
```

```
Make the title slide more impactful — add a subtitle that quantifies the value, like "70% faster case processing, zero infrastructure to manage"
```

#### Step 4 — Replace Placeholders with Your Real Results

Fill in your team's actual outcomes:

```
Replace all placeholder content in the presentation with:
- Team name: [your team name]
- Agency / program name: [your actual scenario]
- What you built: [describe your actual agent and tools]
- Time to first working demo: [actual time your team took]
- One real test result or screenshot description
```

#### Step 5 — Publish via GitHub Pages (optional)

Give your audience a live URL instead of a local file:

1. Move `presentation.html` into the `docs/` folder of this repo
2. In the VS Code terminal:

   ```bash
   git add docs/presentation.html
   git commit -m "Add demo day presentation"
   git push
   ```

3. Your slide deck is now live at:
   `https://ricardo-msft-se.github.io/ai-hack-foundry-usecases/presentation.html`

> 💡 Ask Copilot: `Write the git commands to add, commit, and push docs/presentation.html with a meaningful commit message` — it generates them for you.
