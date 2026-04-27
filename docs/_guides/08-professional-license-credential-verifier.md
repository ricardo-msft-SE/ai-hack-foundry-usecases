---
title: Professional License Credential Verifier
order: 8
tagline: Automated credential extraction and validation for state licensing boards
---

# Professional License Credential Verifier

Extract, validate, and auto-approve professional license credentials in hours instead of weeks.

## The Challenge

State licensing boards process 10,000+ credential applications annually—transcripts, exam results, background checks. Manual review takes 2–4 weeks per application, delaying professional licensing and frustrating applicants.

## The Solution

Use Azure AI Foundry to build a **Professional License Credential Verifier** agent that:
- Extracts credentials using Document Intelligence (transcripts, exam scores, background checks)
- Validates against state licensing rules in real-time
- Auto-approves routine applications (70–80%)
- Escalates complex cases to licensing staff

## Expected Outcome
- **70–80% of applications auto-approved** within 2–4 hours
- **2–4 hours processing time** vs. 2–4 weeks manual review
- **Staff focus shifts** to exception handling and appeals

---

## Artifacts

- **[README](../08-professional-license-credential-verifier/)** — Full scenario, setup checklist, supported license types
- **[Step-by-Step Guide](../08-professional-license-credential-verifier/step_by_step.md)** — Deploy in Foundry in 6 steps
- **[System Prompt](../08-professional-license-credential-verifier/system_prompt.txt)** — Copy-paste agent instructions
- **[OpenAPI Spec](../08-professional-license-credential-verifier/openapi/licensing-api.json)** — State licensing database API
- **[Knowledge Base](../08-professional-license-credential-verifier/knowledge/licensure-requirements.md)** — License requirements reference (MD, JD, RN, Contractors)

---

## Technology Stack

| Component | Purpose |
| --- | --- |
| **Document Intelligence** | Extract credentials from transcripts, exam results, background checks |
| **Knowledge (RAG)** | Query licensing requirements database |
| **Code Interpreter** | Calculate education equivalency (optional) |
| **Actions (OpenAPI)** | Connect to state licensing system |
| **Entra ID RBAC** | Staff access control & audit trails |

---

## Supported License Types

- **Medical (MD/DO)** — USMLE/COMLEX scores, accreditation, reciprocity
- **Legal (JD)** — Bar exam, law school accreditation, character & fitness
- **Nursing (RN/LPN)** — NCLEX scores, nursing degree, multistate compact
- **Contractors** — Apprenticeship hours, journeyperson exams, state CE

---

## Next Steps

1. Start with [Step-by-Step Guide](../08-professional-license-credential-verifier/step_by_step.md)
2. Copy [System Prompt](../08-professional-license-credential-verifier/system_prompt.txt) into Foundry agent **Instructions**
3. Upload [OpenAPI Spec](../08-professional-license-credential-verifier/openapi/licensing-api.json) as an **Action**
4. Create knowledge index using [Knowledge Base](../08-professional-license-credential-verifier/knowledge/licensure-requirements.md)
5. Test with sample credential documents (transcripts, exam results)
6. Deploy to your licensing board staff

---

**Estimated Setup Time:** 30–45 minutes | **Complexity:** Intermediate | **Quick Win:** Yes (can launch in week 1)
