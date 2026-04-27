---
title: Unemployment Claims Processor
order: 09
tagline: Rapid UI and workers' compensation claims processing with Document Intelligence
---

# Unemployment Claims Processor

Process unemployment insurance (UI) and workers' compensation (WC) claims in 24–48 hours instead of 3–6 weeks.

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
