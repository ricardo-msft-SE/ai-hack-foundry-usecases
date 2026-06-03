# GHCP Prompt: Test and Evaluate

Use in VS Code chat with GitHub Copilot to produce a practical evaluation loop for the Day 2 solution.

## Large Sample Prompt

Act as a QA lead for an AI agent hackathon solution.

Goal:
Create and run a test and evaluation workflow for this solution:
- Use case: {{SELECTED_USE_CASE}}
- Target users: {{USER_PERSONAS}}
- Success criteria: {{SUCCESS_CRITERIA}}

Required outputs:
1. Test plan with categories:
   - Core happy-path scenarios
   - Edge cases
   - Safety and policy compliance cases
   - Failure and fallback behavior
2. Test dataset suggestions with synthetic examples where needed.
3. Evaluation rubric with measurable scores.
4. A regression checklist for each code/config change.
5. Recommendation list to improve response quality.

Scoring dimensions (1-5 each):
- Relevance
- Grounding/citation quality
- Action correctness
- Response safety
- User clarity
- Latency acceptability

Execution request:
- Propose commands/scripts needed to run tests.
- If test framework files are missing, generate minimal ones.
- Summarize failures with probable root causes.

Output format:
- Test matrix table
- Pass/fail summary
- Top 5 fixes ranked by impact and effort
- Final release recommendation: go/no-go for demo

Constraints:
- Keep scope to what can be validated in Day 2.
- Mark production-level gaps separately.

Finish with:
- A short script I can read to judges describing test confidence.
