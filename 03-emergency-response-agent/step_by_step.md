# Emergency Response Agent — Azure AI Foundry Guide

This guide walks you through building a **multi-agent Emergency Response System** using Microsoft Azure AI Foundry. A Coordinator agent delegates tasks to specialist agents (Weather and Resources) to produce comprehensive emergency response plans.

**Three agents, zero orchestration code.**

---

## 🔁 What Does Foundry Replace?

| Code-First Component | Foundry-First Replacement |
|---|---|
| Python multi-agent orchestrator class | **Foundry Workflow** — visual designer wires agents declaratively |
| Semantic Kernel `AgentGroupChat` / planner | Workflow orchestration pattern (sequential or group-chat) |
| Sub-agent invocation code | Workflow nodes call agents automatically |
| Result aggregation and formatting logic | Coordinator agent node synthesizes sub-agent responses |
| Weather API Python plugin | **Custom OpenAPI tool** on WeatherSpecialist agent |
| Resource API Python plugin | **Custom OpenAPI tool** on ResourcesSpecialist agent |
| Historical incident retrieval pipeline | **Knowledge** on all agents |
| Flask API for request handling | Foundry Playground / Channels |

---

## 🛠️ Prerequisites

- An Azure Subscription
- Access to [Azure AI Foundry](https://ai.azure.com)
- A deployed GPT-4o model
- The files in this folder:
  - [`system_prompt_coordinator.txt`](./system_prompt_coordinator.txt)
  - [`system_prompt_weather.txt`](./system_prompt_weather.txt)
  - [`system_prompt_resources.txt`](./system_prompt_resources.txt)
  - [`openapi/weather-api.json`](./openapi/weather-api.json)
  - [`openapi/resources-api.json`](./openapi/resources-api.json)
  - [`knowledge/emergency-procedures.md`](./knowledge/emergency-procedures.md)

> ⚠️ **Note:** Build the three agents in order (WeatherSpecialist → ResourcesSpecialist → EmergencyCoordinator) because the Coordinator needs the other two to already exist before they can be connected.

---

## 🧱 Step 1 — Create the Project

1. Navigate to [https://ai.azure.com](https://ai.azure.com)
2. Click **+ Create project**
3. Name: `EmergencyResponse`
4. Select subscription, resource group, and hub
5. Click **Create**

---

## 🌤️ Step 2 — Create the Weather Specialist Agent

### 2a. Create the Agent

1. Go to **Build** → **Agents** → **+ New agent**
2. Fill in:
   - **Name:** `WeatherSpecialist`
   - **Model:** `gpt-4o`
3. Paste the contents of [`system_prompt_weather.txt`](./system_prompt_weather.txt) into the **Instructions** field
4. Click **Save**

### 2b. Add Knowledge

1. In the Weather Specialist agent, find the **Knowledge** section
2. Click **+ Add knowledge** → **Upload files**
3. Upload [`knowledge/emergency-procedures.md`](./knowledge/emergency-procedures.md)
4. Select or create an Azure AI Search resource
5. Complete the wizard

### 2c. Add the Weather OpenAPI Tool

1. In **Tools**, click **Add** → **Custom** → **OpenAPI tool**
2. If your tenant shows the older dialog, select **OpenAPI** from **+ Add tool**
3. Configure:
   - **Tool Name:** `WeatherAPI`
   - **Definition:** Upload `openapi/weather-api.json`
   - **Authentication:** None (Anonymous)
4. Click **Add**

> **Note:** `openapi/weather-api.json` uses a mock endpoint (`weather.exampleville.gov`). In a demo-only setup, weather tool calls can fail with a network/connection error until you replace it with a real API.

---

## 🏛️ Step 3 — Create the Resources Specialist Agent

### 3a. Create the Agent

1. Go to **Build** → **Agents** → **+ New agent**
2. Fill in:
   - **Name:** `ResourcesSpecialist`
   - **Model:** `gpt-4o`
3. Paste the contents of [`system_prompt_resources.txt`](./system_prompt_resources.txt) into **Instructions**
4. Click **Save**

### 3b. Add Knowledge

1. In the Resources Specialist agent, find **Knowledge**
2. Click **+ Add knowledge** → **Upload files**
3. Upload [`knowledge/emergency-procedures.md`](./knowledge/emergency-procedures.md)

   > You can reuse the same Azure AI Search index created in Step 2b — select it from the dropdown instead of creating a new one. This gives both agents access to the same knowledge base.

4. Complete the wizard

### 3c. Add the Resources OpenAPI Tool

1. In **Tools**, click **Add** → **Custom** → **OpenAPI tool**
2. If your tenant shows the older dialog, select **OpenAPI** from **+ Add tool**
3. Configure:
   - **Tool Name:** `ResourcesAPI`
   - **Definition:** Upload `openapi/resources-api.json`
   - **Authentication:** None (Anonymous)
4. Click **Add**

> **Note:** `openapi/resources-api.json` uses a mock endpoint (`dispatch.exampleville.gov`). In a demo-only setup, resources tool calls can fail with a network/connection error until you replace it with a real API.

---

## 🎯 Step 4 — Create the Emergency Coordinator Agent

### 4a. Create the Agent

1. Go to **Build** → **Agents** → **+ New agent**
2. Fill in:
   - **Name:** `EmergencyCoordinator`
   - **Model:** `gpt-4o`
3. Paste the contents of [`system_prompt_coordinator.txt`](./system_prompt_coordinator.txt) into **Instructions**
4. Click **Save**

### 4b. Add Knowledge

1. In the Coordinator agent, find **Knowledge**
2. Click **+ Add knowledge** → Upload [`knowledge/emergency-procedures.md`](./knowledge/emergency-procedures.md)

   > Again, reuse the same Azure AI Search index for efficiency.

3. Complete the wizard

### 4c. Wire the Agents Together with a Foundry Workflow

> ⚠️ **Note:** The old "Connected Agents" portal UI is deprecated as of 2026. The current recommended approach for multi-agent orchestration in Microsoft Foundry is **Workflows** — a no-code visual designer that coordinates agents declaratively. See the [official Foundry Workflows documentation](https://learn.microsoft.com/azure/foundry/agents/concepts/workflow).

A **Workflow** defines how agents hand off work to each other. For this scenario, the Workflow will route incoming emergency requests to the WeatherSpecialist and ResourcesSpecialist agents, then pass their outputs to the EmergencyCoordinator for synthesis.

#### Create the Workflow

1. In the left navigation of the Foundry portal, go to **Build** → **Workflows** (or click **+ New** → **Workflow**)
2. Click **+ New workflow**
3. Give the workflow a name: `EmergencyResponseWorkflow`
4. Select **Group chat** or **Sequential** as the orchestration pattern:
   - **Group chat** — the coordinator agent receives user input, decides which specialist to call, and synthesizes results. Best for this scenario.
   - **Sequential** — agents run in a fixed order (Weather → Resources → Coordinator)
5. Click **Create**

#### Add the Agents as Nodes

6. In the workflow visual designer, click **+ Add agent**
7. Select **EmergencyCoordinator** — set it as the **entry point** (receives initial user input)
8. Click **+ Add agent** again and select **WeatherSpecialist**
9. Click **+ Add agent** again and select **ResourcesSpecialist**

#### Configure Routing Instructions

10. Select the **EmergencyCoordinator** node and add routing instructions in its agent description or system prompt context:
    - `Delegate weather impact analysis to WeatherSpecialist`
    - `Delegate resource availability and deployment to ResourcesSpecialist`
    - `Synthesize both responses into a final emergency response plan`
11. Draw connections from **EmergencyCoordinator** → **WeatherSpecialist** and **EmergencyCoordinator** → **ResourcesSpecialist** in the visual canvas

#### Save and Test the Workflow

12. Click **Save**
13. Click **Run** or **Test in playground** to open a chat interface driven by the workflow
14. The workflow entry point is **EmergencyCoordinator** — all user messages go to it first

> 💡 The Workflow tracks every agent call, input, and output with built-in tracing. Use the **Trace** tab after a test run to see exactly which agent was invoked, what it received, and what it returned.
>
> 📖 For more detail, including YAML-based workflow definitions (for version control and CI/CD), see [Build a workflow in Microsoft Foundry](https://learn.microsoft.com/azure/foundry/agents/concepts/workflow).

---

## 🧪 Step 5 — Test the Multi-Agent System

Open the **Playground** in the **EmergencyCoordinator** agent.

### ✅ Test Full Emergency Response Plan

**User:**
> Generate an emergency response plan for a Category 2 hurricane making landfall in 48 hours. Expected impact: coastal flooding, 90 mph sustained winds, power outages.

**Expected behavior:**
1. **Coordinator** receives the request
2. **Coordinator → WeatherSpecialist**: delegates weather impact analysis
3. **WeatherSpecialist** calls `GetWeatherForecast` and returns wind/rain/surge data
4. **Coordinator → ResourcesSpecialist**: delegates resource deployment planning
5. **ResourcesSpecialist** calls `GetAvailableResources` and returns available personnel and equipment
6. **Coordinator** synthesizes both responses with emergency procedures from Knowledge into a full response plan with timeline, resource allocation, and evacuation zones

---

### ✅ Test Weather-Only Query

**User:**
> What are the current weather conditions and 72-hour forecast for the coastal zones?

**Expected:** Coordinator delegates to WeatherSpecialist, which calls the WeatherAPI OpenAPI tool and returns current conditions and forecast.

> If you are still using the mock endpoint, the call may fail. Use the **Trace** view to confirm the correct tool and parameters were selected.

---

### ✅ Test Resources-Only Query

**User:**
> How many emergency generators and rescue boats are currently available? Which stations have them?

**Expected:** Coordinator delegates to ResourcesSpecialist, which calls the ResourcesAPI OpenAPI tool and returns inventory and station locations.

> If you are still using the mock endpoint, the call may fail. Use the **Trace** view to confirm the correct tool and parameters were selected.

---

### ✅ Test Knowledge (Protocols)

**User:**
> What is the standard evacuation protocol for Zone A residents?

**Expected:** Any agent (Coordinator or specialists) returns the evacuation protocol from the Knowledge base with a citation.

---

## 📊 Step 6 — Evaluate the System

1. Go to **Evaluate** → **+ New evaluation**
2. Select the **EmergencyCoordinator** agent
3. Add evaluators:
   - ✅ **Groundedness** — are response plans based on the emergency procedures knowledge?
   - ✅ **Coherence** — is the final plan well-organized and actionable?
4. Run evaluation with sample emergency scenarios

---

## 🎉 You're Done!

You now have:

- ✅ A three-agent emergency response system with automatic task delegation
- ✅ Real-time weather integration via the WeatherAPI OpenAPI tool
- ✅ Live resource inventory checks via the ResourcesAPI OpenAPI tool
- ✅ Emergency protocols from the Knowledge base informing every plan
- ✅ Zero orchestration code — all wired in the Foundry portal

### Next Steps

- **Add more specialist agents**: create a TrafficSpecialist (evacuation routes) or PublicHealthSpecialist (medical resources) and connect them to the Coordinator
- **Connect to real APIs**: replace mock URLs in the OpenAPI specs with real weather and dispatch system endpoints
- **Add to Teams**: Emergency managers can query the system directly from Teams channels
- **Add real-time alerts**: use Azure Event Grid to trigger the Coordinator when a weather alert is issued
