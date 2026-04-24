# Emergency Response Agent — Azure AI Foundry Guide

This guide walks you through building a **multi-agent Emergency Response System** using Microsoft Azure AI Foundry. A Coordinator agent delegates tasks to specialist agents (Weather and Resources) to produce comprehensive emergency response plans.

**Three agents, zero orchestration code.**

---

## 🔁 What Does Foundry Replace?

| Code-First Component | Foundry-First Replacement |
|---|---|
| Python multi-agent orchestrator class | **Connected Agents** in Foundry (UI wiring) |
| Semantic Kernel `AgentGroupChat` / planner | Coordinator agent's system prompt + agent delegation |
| Sub-agent invocation code | Connected Agent tool (automatic) |
| Result aggregation and formatting logic | Coordinator agent combines sub-agent responses |
| Weather API Python plugin | **Action** on WeatherSpecialist agent |
| Resource API Python plugin | **Action** on ResourcesSpecialist agent |
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

### 2c. Add the Weather Action

1. In the **Tools** tab, click **+ Add tool** → select **OpenAPI**
2. Configure:
   - **Tool Name:** `WeatherAPI`
   - **Definition:** Upload `openapi/weather-api.json`
   - **Authentication:** None (Anonymous)
3. Click **Add**

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

### 3c. Add the Resources Action

1. In the **Tools** tab, click **+ Add tool** → select **OpenAPI**
2. Configure:
   - **Tool Name:** `ResourcesAPI`
   - **Definition:** Upload `openapi/resources-api.json`
   - **Authentication:** None (Anonymous)
3. Click **Add**

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

### 4c. Connect the Specialist Agents (Multi-Agent Wiring)

This is where the multi-agent pattern comes to life — without a single line of orchestration code.

1. In the Coordinator agent, find the **Tools** tab
2. Click **+ Add tool**
3. Select **Agent** (may appear as "Connected agent" or "Agent tool")
4. From the agent list, select **WeatherSpecialist**
5. Set a description: `Use this agent to get weather forecasts, current conditions, and weather impact analysis for emergency scenarios`
6. Click **Add**

Repeat for the second sub-agent:

7. Click **+ Add tool** → **Agent** → select **ResourcesSpecialist**
8. Set a description: `Use this agent to check available emergency resources, agency inventories, personnel availability, and resource deployment recommendations`
9. Click **Add**

> 💡 The Coordinator will now automatically delegate to these agents based on the task. Weather questions go to WeatherSpecialist. Resource questions go to ResourcesSpecialist. The Coordinator synthesizes both into a final plan.

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

**Expected:** Coordinator delegates to WeatherSpecialist, which calls the WeatherAPI Action and returns current conditions and forecast.

---

### ✅ Test Resources-Only Query

**User:**
> How many emergency generators and rescue boats are currently available? Which stations have them?

**Expected:** Coordinator delegates to ResourcesSpecialist, which calls the ResourcesAPI Action and returns inventory and station locations.

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
- ✅ Real-time weather integration via the WeatherAPI Action
- ✅ Live resource inventory checks via the ResourcesAPI Action
- ✅ Emergency protocols from the Knowledge base informing every plan
- ✅ Zero orchestration code — all wired in the Foundry portal

### Next Steps

- **Add more specialist agents**: create a TrafficSpecialist (evacuation routes) or PublicHealthSpecialist (medical resources) and connect them to the Coordinator
- **Connect to real APIs**: replace mock URLs in the OpenAPI specs with real weather and dispatch system endpoints
- **Add to Teams**: Emergency managers can query the system directly from Teams channels
- **Add real-time alerts**: use Azure Event Grid to trigger the Coordinator when a weather alert is issued
