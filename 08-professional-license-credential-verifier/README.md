# Professional License Credential Verifier

## Scenario

State licensing boards receive 10,000+ professional credential applications annually—transcripts from colleges, exam results, background checks, continuing education records. Manual verification of credentials against state licensing requirements typically takes 2–4 weeks per application. This bottleneck delays career transitions and causes applicant frustration.

**Challenge:** Scalability. Staff manually review each document, extract key data (GPA, exam scores, dates), cross-reference state rules (education requirements, reciprocity agreements, disciplinary disqualifications), and approve or route for further review.

**Solution:** Use Azure AI Foundry to build a **Professional License Credential Verifier** agent that:
1. **Extracts credentials** from uploaded transcripts, exam results, and background checks using Document Intelligence
2. **Validates credentials** against state-specific licensing rules (education, exams, reciprocity, disqualifying factors)
3. **Auto-approves routine applications** or flags complex cases for human review
4. **Routes decisions** to the licensing database

**Expected Outcome:**
- Routine applications processed in **2–4 hours** (vs. 2–4 weeks)
- 70–80% of applications auto-approved with high confidence
- Staff focus shifts to exception handling and appeals
- Faster licensing for new professionals; reduced staff workload

## Foundry Approach

This accelerator uses **Azure AI Foundry** with these capabilities:

| Feature | Purpose |
| --- | --- |
| **Document Intelligence Tool** | Extract text, tables, and structured data from PDF/image uploads (transcripts, exam results) |
| **Knowledge** | License requirements database (education, exams, reciprocity, disqualifications) |
| **Code Interpreter** | Calculate equivalency (out-of-state education vs. state standards) |
| **Custom OpenAPI tools** | Connect to state licensing database for querying rules and storing decisions |
| **Entra ID RBAC** | Staff with licensing authority access the agent; others see audit trail only |

## Setup Checklist

- [ ] Create or navigate to an Azure AI Foundry project in [ai.azure.com](https://ai.azure.com)
- [ ] Enable **Document Intelligence** tool in agent settings
- [ ] Create knowledge indexes using `knowledge/licensure-requirements.md` (or split by license type: medical, legal, nursing, contractor)
- [ ] Upload `openapi/licensing-api.json` as a **custom OpenAPI tool**
- [ ] Copy `system_prompt.txt` into agent **Instructions**
- [ ] Test with sample credential documents and verify decisions match expected approvals
- [ ] Assign **Licensure Authority** role via Entra ID for staff; enable audit logging

## Files in This Accelerator

| File | Purpose |
| --- | --- |
| [step_by_step.md](./step_by_step.md) | Step-by-step guide to deploying this accelerator in Foundry (6 steps + optional scaling) |
| [system_prompt.txt](./system_prompt.txt) | Copy-paste agent instructions; modify license types and state rules as needed |
| [openapi/licensing-api.json](./openapi/licensing-api.json) | RESTful API spec for querying license requirements and submitting decisions |
| [knowledge/licensure-requirements.md](./knowledge/licensure-requirements.md) | State licensing rules and requirements database |

## Supported License Types

- **Medical (MD/DO):** Education verification, board exam scores, state-specific reciprocity agreements
- **Legal (JD):** Law school accreditation, bar exam scores, character & fitness review status
- **Nursing (RN/LPN):** Nursing degree accreditation, NCLEX scores, multi-state licensure agreements
- **Contractors (HVAC, Electrical, Plumbing):** Apprenticeship hours, journeyperson exams, state continuing education requirements

## Extensions & Scaling

**Immediate (Week 1–2):**
- Add **image OCR** for handwritten documents (background checks, attestation forms)
- Integrate **multi-language support** for diverse applicant populations (Spanish, Vietnamese, etc.)

**Short-term (Month 2–3):**
- Build a **multi-license workflow** to handle cross-license applications (e.g., MD applying for prescriber license)
- Add **credential equivalency calculator** using Code Interpreter to score international education

**Long-term (Month 4–6):**
- Deploy **public-facing portal** where applicants upload credentials directly; receive real-time approval status
- Implement **hearing officer routing** for contested decisions with full audit trail
- Create **inter-agency shared credential database** (reciprocity lookup across multiple states)

## Governance & RBAC

This accelerator processes sensitive professional information (SSN, exam scores, disciplinary history). Use these controls:

1. **Document Intelligence:** Configure PII redaction rules (e.g., mask SSN in extracted text)
2. **Knowledge access:** Restrict knowledge access to licensing staff via Entra ID groups
3. **Audit logging:** Enable Application Insights to track all approvals and escalations
4. **Data retention:** Set document storage retention policy (e.g., delete after 30 days post-decision)

## Source

Original concept: State licensing board modernization case study. Adapted for Foundry-first approach.
