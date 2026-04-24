# City of Exampleville — Policy Compliance Standards

This document defines the compliance requirements that all city government policy documents must meet before approval. These standards apply to all departments and are reviewed annually.

---

## Compliance Domains & Scoring Weights

| Domain | Weight in Score | Description |
|---|---|---|
| **Data Privacy** | 25% | Protection of personally identifiable information (PII) |
| **Accessibility** | 20% | Equitable access for all residents including people with disabilities |
| **Security** | 20% | Information security and system access controls |
| **Documentation Quality** | 20% | Completeness, clarity, and maintainability of policy documents |
| **Responsible AI** | 15% | Ethical AI use, transparency, and human oversight |

---

## Severity Definitions

| Severity | Description | Examples |
|---|---|---|
| **Critical** | Directly violates law, regulation, or creates immediate harm risk. Must be resolved before approval. | Missing PII handling procedures, no data retention policy |
| **High** | Significant risk or non-compliance with stated standards. Must be resolved within 30 days. | Unclear access control procedures, no audit logging requirement |
| **Medium** | Notable gap that increases risk but does not create immediate harm. Resolve within 90 days. | Incomplete contact information, unclear escalation path |
| **Low** | Minor issue — best practice not followed, documentation gap, or style issue. Resolve within 180 days. | Missing revision date, informal language, inconsistent formatting |

---

## Domain 1: Data Privacy

### Rule DP-01 — PII Definition Required
**Severity if violated: Critical**
Every policy that collects, stores, processes, or shares resident data must include an explicit definition of what data is considered PII in the context of that policy.

**Required elements:**
- List of data fields classified as PII
- Whether indirect identifiers (zip code, birth year) are included

---

### Rule DP-02 — Data Retention Policy Required
**Severity if violated: Critical**
All policies involving resident data must specify:
- How long data is retained
- Who is authorized to access retained data
- Process for data deletion or archiving at end of retention period

---

### Rule DP-03 — Data Sharing Disclosure
**Severity if violated: High**
If the policy permits sharing resident data with other agencies, contractors, or vendors, the policy must:
- Identify who data will be shared with
- State the legal basis for sharing
- Require data sharing agreements (DSAs) with all recipients

---

### Rule DP-04 — Breach Notification Procedure
**Severity if violated: High**
Policies that involve storage of PII must include a data breach response procedure:
- Timeline for internal notification (must be within 24 hours of discovery)
- Timeline for resident notification (must comply with state law — within 10 business days)
- Designated breach response owner

---

### Rule DP-05 — Minimum Data Collection
**Severity if violated: Medium**
Policies should document that only the minimum necessary data is collected for the stated purpose. The policy should justify the need for each data field collected.

---

## Domain 2: Accessibility

### Rule AC-01 — Plain Language Requirement
**Severity if violated: High**
All resident-facing policies and communications referenced in the policy must be written at a 6th–8th grade reading level. Technical policies for staff may be at a higher reading level but must include a plain-language summary.

---

### Rule AC-02 — Multi-Language Access
**Severity if violated: High**
Policies governing resident-facing services must address language access:
- Translation into the city's five designated languages (English, Spanish, French, Portuguese, Mandarin)
- Process for residents who speak other languages (interpreter services)

---

### Rule AC-03 — Digital Accessibility
**Severity if violated: Medium**
Any digital tools or web resources referenced in the policy must comply with WCAG 2.1 Level AA:
- Alternative text for images
- Keyboard-navigable interfaces
- Sufficient color contrast ratios
- Screen reader compatibility

---

### Rule AC-04 — Physical Accessibility
**Severity if violated: Medium**
Physical service locations referenced in the policy must comply with ADA Title II requirements. The policy should confirm that all referenced locations are ADA-accessible or provide accessible alternatives.

---

## Domain 3: Security

### Rule SEC-01 — Access Control Policy Required
**Severity if violated: Critical**
Any policy involving access to city systems, databases, or sensitive documents must specify:
- Role-based access control (RBAC) structure
- Least-privilege principle statement
- Process for granting and revoking access

---

### Rule SEC-02 — Audit Logging Required
**Severity if violated: High**
Policies involving access to PII or sensitive city data must require audit logging:
- Who accessed the data
- When (timestamp)
- What action was performed
- Retention period for logs (minimum 7 years for most city records)

---

### Rule SEC-03 — Authentication Requirements
**Severity if violated: High**
Systems containing PII or sensitive data must require:
- Multi-factor authentication (MFA) for all staff access
- Password policy compliance (minimum 12 characters, no reuse of last 10)
- Session timeout (maximum 30 minutes of inactivity)

---

### Rule SEC-04 — Encryption Requirements
**Severity if violated: High**
Policies must specify:
- Encryption at rest for all stored PII (AES-256 minimum)
- Encryption in transit for all data transmission (TLS 1.2+ minimum)
- Key management responsibility

---

### Rule SEC-05 — Third-Party Security Assessment
**Severity if violated: Medium**
Before onboarding vendors or contractors who will access city systems, the policy must require a security assessment (SOC 2 Type II or equivalent) within the past 12 months.

---

## Domain 4: Documentation Quality

### Rule DQ-01 — Version Control Required
**Severity if violated: Medium**
All policy documents must include:
- Document version number (e.g., v1.2.0)
- Effective date
- Review date (maximum 2 years between reviews)
- Change log or revision history

---

### Rule DQ-02 — Ownership and Accountability
**Severity if violated: Medium**
Every policy must identify:
- Policy owner (person, not just department)
- Approving authority
- Contact information for questions

---

### Rule DQ-03 — Scope Statement Required
**Severity if violated: Medium**
Policies must include a clear scope statement defining:
- Which departments or employees the policy applies to
- What systems, data, or activities are covered
- Any explicit exclusions

---

### Rule DQ-04 — Definitions Section
**Severity if violated: Low**
Policies that use technical terms, acronyms, or legal terms must include a definitions section. Acronyms must be spelled out on first use.

---

### Rule DQ-05 — Enforcement and Consequences
**Severity if violated: Low**
Policies should state the consequences of non-compliance, including the escalation path for violations.

---

## Domain 5: Responsible AI

### Rule AI-01 — AI Disclosure Required
**Severity if violated: Critical**
Any policy that authorizes or governs the use of AI in decision-making that affects residents must include:
- Explicit disclosure that AI is used and how
- Statement that AI assistance is disclosed to affected residents

---

### Rule AI-02 — Human-in-the-Loop for High-Stakes Decisions
**Severity if violated: Critical**
AI must not be used as the sole decision-maker for high-stakes resident outcomes (benefits determination, eligibility, enforcement actions). The policy must require human review before final decisions.

---

### Rule AI-03 — Bias and Fairness Assessment
**Severity if violated: High**
AI systems used in resident-facing services must undergo regular bias testing across demographic groups. The policy must specify:
- Frequency of bias assessments (minimum annually)
- Designated responsible party
- Process for addressing identified bias

---

### Rule AI-04 — AI Audit Trail
**Severity if violated: High**
All AI-assisted decisions affecting residents must be logged with:
- The input provided to the AI
- The AI's output / recommendation
- The final decision made by staff
- Retention for minimum 7 years

---

### Rule AI-05 — AI Model Transparency
**Severity if violated: Medium**
The policy should identify or reference the AI model(s) or vendor(s) used, including version or contract information, to ensure accountability and enable future audits.

---

## Compliance Score Thresholds

| Score Range | Status | Action Required |
|---|---|---|
| 90–100 | **Fully Compliant** | Approve as submitted |
| 80–89 | **Substantially Compliant** | Approve with minor conditions noted |
| 60–79 | **Needs Improvement** | Revise and resubmit; Medium+ findings must be resolved |
| Below 60 | **Non-Compliant** | Reject; do not implement until Critical and High findings resolved |
