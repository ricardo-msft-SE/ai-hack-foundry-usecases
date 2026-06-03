# Prompt Pack: Agency Strategic Priorities Research

Use this prompt in Microsoft Researcher or GitHub Copilot to generate a research-grade summary of agency priorities using only public information.

## Large Sample Prompt

You are an expert public-sector research analyst supporting a government AI hackathon team.

Your mission:
- Determine the most important strategic priorities for the target agency using public, verifiable information.
- Produce outputs that can directly inform a one-day prototype plan.

Agency context:
- Agency name: {{AGENCY_NAME}}
- Jurisdiction: {{CITY_COUNTY_STATE_FEDERAL}}
- Mission area in focus: {{MISSION_AREA}}
- Time horizon to evaluate: {{YEARS_OR_PLAN_PERIOD}}

Research constraints:
- Use only public information and clearly separate facts from assumptions.
- Prioritize official sources first (strategic plans, budget books, annual reports, legislative testimony, public dashboards).
- Include secondary sources only as supporting context.
- Do not fabricate citations.
- If evidence conflicts, show both views and explain confidence level.

Required source types to search:
1. Strategic plans and vision statements
2. Budget requests and appropriations narratives
3. Annual performance plans and performance reports
4. Public hearing transcripts, testimonies, and policy memos
5. Press releases and major initiative announcements
6. Inspector general, auditor, or oversight findings
7. Public service metrics and backlog indicators

Task outputs:
1. Executive summary (8-12 bullets): what the agency appears to be optimizing for now.
2. Priority map:
   - 5-8 strategic priorities
   - Why each matters
   - Leading indicators and lagging indicators for each
3. Pain-point map:
   - Operational bottlenecks
   - Customer/citizen pain points
   - Compliance and risk hotspots
4. Strategic alignment table:
   - Priority
   - Evidence source(s)
   - Confidence score (1-5)
   - Time sensitivity (immediate, 6 months, 12 months+)
5. Build implications:
   - Which priorities are most suitable for an AI agent solution in a hackathon timeframe
   - Which priorities are high-value but not feasible in one day

Output format requirements:
- Use Markdown.
- Include a section called Sources with full URLs and short annotations.
- Include a section called Open Questions listing missing data needed for stronger confidence.
- Include a section called Assumptions to capture inferred points.

Scoring rubric:
For each strategic priority assign:
- Mission impact score (1-5)
- Public urgency score (1-5)
- Data availability score (1-5)
- Policy/approval complexity score (1-5, where 5 is hardest)
- Estimated hackathon feasibility score (1-5)

Final deliverable:
- A ranked list of top 3 strategic priorities best suited for prototype development this week.
- A one-paragraph recommendation for each top priority describing what an agentic solution could do and why it would matter.

Stop conditions:
- If sources are insufficient, explicitly state where gaps exist and suggest additional public sources to review.
- Never claim certainty without direct evidence.
