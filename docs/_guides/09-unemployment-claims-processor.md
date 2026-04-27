---
title: Unemployment Claims Processor
order: 9
tagline: Rapid UI and workers' compensation claims processing with Document Intelligence.
foundry_features:
  - Agent Service
  - Document Intelligence Tool
  - Code Interpreter
  - Knowledge
  - OpenAPI Actions
---

{% assign repo = site.github.repository_url | default: 'https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases' %}

## Scenario
A state UI-WC agency agent that extracts claim documents, calculates weekly benefits using Code Interpreter, auto-approves 60–70% of claims within 24–48 hours, detects overpayments, and routes complex cases to hearing officers.

## Foundry Build Focus
- Enable Document Intelligence to extract wages, separation letters, and medical injury reports.
- Use Code Interpreter to calculate weekly benefit amounts, disability percentages, and overpayment flags using state formulas.
- Ground eligibility decisions on uploaded UI and WC requirements.
- Route approved claims, escalations, and overpayment referrals via OpenAPI actions.

## Repo Artifacts
- [README]({{ repo }}/blob/main/09-unemployment-claims-processor/README.md)
- [Step-by-step]({{ repo }}/blob/main/09-unemployment-claims-processor/step_by_step.md)
- [System prompt]({{ repo }}/blob/main/09-unemployment-claims-processor/system_prompt.txt)
- [OpenAPI: unemployment-api.json]({{ repo }}/blob/main/09-unemployment-claims-processor/openapi/unemployment-api.json)
- [Knowledge: unemployment-requirements.md]({{ repo }}/blob/main/09-unemployment-claims-processor/knowledge/unemployment-requirements.md)

## Claim Types Supported
- **UI — Layoff / reduction in force**
- **UI — Voluntary quit** (with or without good cause)
- **UI — Discharge for misconduct**
- **UI — Partial unemployment** (reduced hours)
- **WC — Acute work-related injury**
- **WC — Occupational disease** (cumulative exposure)
- **WC — Aggravation** of pre-existing condition

## Suggested Demo Prompt
"Here is this claimant's separation letter, last 4 pay stubs, and WC injury report. Calculate their weekly benefit amount, check eligibility, and flag any overpayment risk."

## The Challenge

State UI-WC agencies face catastrophic claim volumes during recessions—20,000+ applications per week. Manual processing takes 3–6 weeks per claim, creating applicant frustration and delayed benefit distribution. During economic downturns, agencies cannot hire fast enough to keep up.

## The Solution

Use Azure AI Foundry to build an **Unemployment Claims Processor** agent that:
- Extracts wage data, separation reasons, and injury details using Document Intelligence
- Calculates benefits in real-time using Code Interpreter (UI formulas, WC disability ratings)
- Auto-approves routine claims (60–70%)
- Detects overpayments (30% improvement in detection)
- Routes complex cases to hearing officers

## Expected Outcome
- **Claims processed in 24–48 hours** vs. 3–6 weeks manual review
- **60–70% auto-approved** within 2 business days
- **Hearing officer caseload reduced 40%** (fewer marginal cases)
- **Overpayment detection improves 30%** (more systematic)
- **Applicant satisfaction increases** (faster benefit receipt)

---

## Artifacts

- **[README](../09-unemployment-claims-processor/)** — Full scenario, claim types, setup checklist
- **[Step-by-Step Guide](../09-unemployment-claims-processor/step_by_step.md)** — Deploy in Foundry in 7 steps (includes Code Interpreter)
- **[System Prompt](../09-unemployment-claims-processor/system_prompt.txt)** — Copy-paste agent instructions for UI & WC
- **[OpenAPI Spec](../09-unemployment-claims-processor/openapi/unemployment-api.json)** — State UI-WC database API
- **[Knowledge Base](../09-unemployment-claims-processor/knowledge/unemployment-requirements.md)** — UI & WC benefits rules, formulas, disqualifications

---

## Technology Stack

| Component | Purpose |
| --- | --- |
| **Document Intelligence** | Extract wages, separation letters, medical reports |
| **Code Interpreter** | Calculate weekly benefits, detect overpayments, disability ratings |
| **Knowledge (RAG)** | Query UI eligibility rules, WC regulations, state formulas |
| **Actions (OpenAPI)** | Connect to state UI-WC database, route to hearing officers |
| **Entra ID RBAC** | Staff access control, audit trails, multi-language support |

---

## Claim Types Supported

**Unemployment Insurance (UI):**
- Layoff / reduction in force
- Voluntary quit (with/without good cause)
- Discharge for misconduct
- Temporary layoff / returning to work
- Partial unemployment (reduced hours)

**Workers' Compensation (WC):**
- Acute work-related injury
- Occupational disease (cumulative exposure)
- Aggravation of pre-existing condition
- Mental health claims (if work-related)

---

## Key Features

- **Multi-language support** — Spanish, Vietnamese, Hmong, Somali (expand as needed)
- **Automatic overpayment detection** — Flags double-income weeks, unreported earnings
- **Benefit calculation engine** — Weekly rates, max duration, disability percentages
- **Hearing officer routing** — Pre-populated case summaries and evidence attachments
- **Public-facing portal** (optional) — Applicants submit claims, check status, appeal online

---

## Next Steps

1. Start with [Step-by-Step Guide](../09-unemployment-claims-processor/step_by_step.md)
2. Copy [System Prompt](../09-unemployment-claims-processor/system_prompt.txt) into Foundry agent **Instructions**
3. Upload [OpenAPI Spec](../09-unemployment-claims-processor/openapi/unemployment-api.json) as an **Action**
4. Enable **Code Interpreter** in agent tools (needed for benefit calculations)
5. Create knowledge index using [Knowledge Base](../09-unemployment-claims-processor/knowledge/unemployment-requirements.md)
6. Test with sample claims (wage records, separation letters, medical reports)
7. Deploy to your UI-WC staff; optionally build public portal

---

**Estimated Setup Time:** 45–60 minutes | **Complexity:** Intermediate (Code Interpreter setup) | **Impact:** High (rapid claims processing)
