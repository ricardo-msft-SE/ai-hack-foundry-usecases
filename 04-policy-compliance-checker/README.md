<img src="../docs/assets/icons/04-policy-compliance.svg" width="52" height="52" alt="Policy Compliance Checker" />

# 04 — Policy Compliance Checker (Foundry Edition)

> Replace a custom Python rule engine + document parser with a **zero-code** Azure AI Foundry agent using the built-in Code Interpreter tool.

## Purpose

An AI agent that reviews policy documents (PDFs, DOCX, Markdown) against a set of compliance standards, identifies violations, assigns severity levels, generates a compliance score (0–100), and provides actionable recommendations — all without a custom scoring pipeline.

## Foundry Features Used

| Feature | Replaces |
|---|---|
| **Agent Service** | Flask API + Semantic Kernel conversation loop |
| **Built-in Code Interpreter** | Custom Python scoring scripts + compliance calculation logic |
| **Knowledge** | Rule-based compliance library + regex pattern engine |
| **File attachment** | PDF/DOCX parsing pipeline |

## Files

| File | Description |
|---|---|
| [`step_by_step.md`](./step_by_step.md) | Complete click-by-click Foundry portal guide |
| [`system_prompt.txt`](./system_prompt.txt) | System instructions for the compliance checker agent |
| [`knowledge/compliance-standards.md`](./knowledge/compliance-standards.md) | Compliance rules, categories, and severity definitions |

## Source

Foundry-first recreation of the [Policy-Compliance-Checker](https://github.com/msftsean/ai-hackathon-use-cases/tree/main/Policy-Compliance-Checker) accelerator.
