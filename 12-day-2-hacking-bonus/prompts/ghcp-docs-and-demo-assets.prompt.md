# GHCP Prompt: Docs and Demo Assets

Use in VS Code chat with GitHub Copilot to generate concise, judge-friendly documentation and demo materials.

## Large Sample Prompt

Act as a technical product marketer and solutions engineer.

Objective:
Package this Day 2 prototype so judges can understand business impact, technical approach, and readiness in under 5 minutes.

Inputs:
- Solution name: {{SOLUTION_NAME}}
- Agency and mission: {{AGENCY_AND_MISSION}}
- Strategic priority alignment: {{PRIORITY_ALIGNMENT}}
- Architecture summary: {{ARCH_SUMMARY}}
- Measured outcomes so far: {{OUTCOMES}}

Required deliverables:
1. Executive one-pager (problem, solution, impact, next steps)
2. Technical README updates
3. Demo script (3 minutes and 7 minutes versions)
4. Architecture diagram instructions (Mermaid-compatible)
5. Slide outline with speaker notes
6. Risks and assumptions summary

Output format:
- Section A: Judge narrative
- Section B: Technical handoff notes
- Section C: Demo script and timing
- Section D: Slide-by-slide structure
- Section E: Follow-up roadmap (30/60/90 day)

Style requirements:
- Clear, non-jargony language for impact statements.
- Quantify outcomes where possible.
- Distinguish proven results from projected benefits.

Constraints:
- Keep all assets truthful and evidence-based.
- Avoid overclaiming production readiness.

Finish with:
- A final checklist titled Demo Day Readiness with owner and status columns.
