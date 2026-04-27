# Unemployment Claims Processor

## Scenario

State unemployment insurance (UI) and workers' compensation (WC) agencies receive catastrophic claim volumes during economic downturns—20,000+ applications per week during recessions. Each claim requires manual document review: wage records, separation letters, medical bills, injury reports. Current manual processing takes **3–6 weeks** per claim, creating applicant frustration and delayed benefit distribution.

**Challenge:** Scalability and speed. During recessions, agencies cannot hire fast enough to match claim volume. Staff manually extract earnings data, separation reason, injury classification, and medical costs; calculate benefits using complex formulas; detect overpayments; and route contested claims to hearing officers.

**Solution:** Use Azure AI Foundry to build an **Unemployment Claims Processor** agent that:
1. **Extracts data** from wage records, separation letters, and medical documents using Document Intelligence
2. **Classifies separation reason** (layoff, quit, discharge, illness) and injury type (injury, occupational disease, mental health)
3. **Calculates benefits** using state formulas and Code Interpreter (weekly benefit rate, maximum duration, overpayment recovery)
4. **Detects overpayments** (e.g., double-income weeks, employer restitution) and flags for recovery
5. **Routes decisions** to state database and hearing officer workflow
6. **Supports multi-language** (Spanish, Vietnamese, Hmong, etc.) for diverse claimant populations

**Expected Outcome:**
- Claims processed in **24–48 hours** (vs. 3–6 weeks)
- 60–70% of claims auto-approved within 2 business days
- Hearing officer caseload reduced by 40% (fewer marginal cases)
- Overpayment detection improves by 30% (more systematic identification)
- Applicant satisfaction improves (faster benefit receipt; real-time status updates)

## Foundry Approach

This accelerator uses **Azure AI Foundry** with these capabilities:

| Feature | Purpose |
| --- | --- |
| **Document Intelligence Tool** | Extract wage data, separation reason, injury details, medical info from documents |
| **Knowledge** | Benefit formulas, disqualification rules, federal/state UI-WC regulations |
| **Code Interpreter** | Calculate weekly benefit rate, identify overpayments, estimate max duration |
| **Actions (OpenAPI)** | Connect to state UI-WC database for querying rules, storing decisions, routing to hearing officers |
| **Entra ID RBAC** | Benefits staff access the agent; applicants see status via public portal only |

## Setup Checklist

- [ ] Create or navigate to an Azure AI Foundry project in [ai.azure.com](https://ai.azure.com)
- [ ] Enable **Document Intelligence** tool in agent settings
- [ ] Create knowledge indexes using `knowledge/unemployment-requirements.md`
- [ ] Upload `openapi/unemployment-api.json` as an **Action**
- [ ] Add **Code Interpreter** tool for benefits calculation
- [ ] Copy `system_prompt.txt` into agent **Instructions**
- [ ] Test with sample claim documents (wage records, separation letters, medical bills)
- [ ] Assign **Claims Processor** role via Entra ID for UI-WC staff; enable audit logging
- [ ] (Optional) Build public-facing portal for applicants to submit claims and check status

## Files in This Accelerator

| File | Purpose |
| --- | --- |
| [step_by_step.md](./step_by_step.md) | Step-by-step guide to deploying this accelerator in Foundry (7 steps + optional portal) |
| [system_prompt.txt](./system_prompt.txt) | Copy-paste agent instructions; modify state formulas and rules as needed |
| [openapi/unemployment-api.json](./openapi/unemployment-api.json) | RESTful API spec for querying benefits rules, submitting decisions, routing to hearing officers |
| [knowledge/unemployment-requirements.md](./knowledge/unemployment-requirements.md) | State UI & WC benefits formulas, disqualification rules, federal/state regulations |

## Claim Types Supported

- **Unemployment Insurance (UI):**
  - Layoff / reduction in force (RIF)
  - Voluntary quit (with or without good cause)
  - Discharge for misconduct
  - Temporary layoff / returning to work
  - Partial unemployment (reduced hours)

- **Workers' Compensation (WC):**
  - Work-related injury (acute traumatic)
  - Occupational disease (cumulative: repetitive strain, noise-induced hearing loss, asbestos exposure)
  - Aggravation of pre-existing condition (work-related worsening)
  - Mental health claim (only if work-related in most states)

## Extensions & Scaling

**Immediate (Week 1–2):**
- Deploy **multi-language support** for claim forms and status notifications (Spanish, Vietnamese, Hmong, Somali, etc.)
- Add **RTI (Request for Reconsideration)** workflow for applicants to appeal initial decision

**Short-term (Month 2–3):**
- Build **public-facing portal** where applicants upload claims, receive status updates, re-appeal online
- Implement **hearing officer case management** system with pre-populated decision summaries and evidence attachments
- Add **overpayment recovery** workflow (payment plan calculation, employer restitution routing)

**Long-term (Month 4–6):**
- Integrate with **SIDES (State Information Data Exchange System)** for employer wage verification
- Build **cross-state reciprocal agreements** for multi-state workers (e.g., interstate UI claims)
- Create **disaster relief workflows** (federal emergency UI extensions, FEMA matching benefits)

## Governance & Data Security

This accelerator processes sensitive personal information (SSN, wages, injury details, medical records). Use these controls:

1. **Document Intelligence:** PII redaction (e.g., mask SSN in extracted text; comply with HIPAA for medical records)
2. **Knowledge access:** Restrict to UI-WC staff via Entra ID; no applicant direct access
3. **Audit logging:** Enable Application Insights to track all decisions, overpayment flags, hearing officer routes
4. **Data retention:** Delete documents 90 days post-decision per USDOL data retention guidelines
5. **Encryption:** Encrypt wage data and medical records in transit (TLS 1.3) and at rest (AES-256)

## Compliance Notes

- **Federal regulations:** 20 CFR Part 609 (Interstate Benefit Payment Pool), 29 CFR Part 815 (UI reporting)
- **State regulations:** Vary by state; consult state UI & WC boards for specific rules
- **Privacy:** Comply with HIPAA (medical info), FCRA (background checks), state privacy laws
- **Accessibility:** Public-facing portal must meet WCAG 2.1 AA standards

## Source

Original concept: State UI-WC modernization case study. Adapted for Foundry-first approach with emphasis on rapid claim processing during economic downturns.
