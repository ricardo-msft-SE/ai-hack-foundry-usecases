# 02 — Document Eligibility Agent (Foundry Edition)

> Replace a custom Python Document Intelligence SDK + Semantic Kernel workflow with a **zero-code** Azure AI Foundry agent — using gpt-4o vision + Code Interpreter to process uploaded documents.

## Purpose

An AI agent that accepts uploaded documents (W-2s, pay stubs, utility bills, IDs), extracts key fields using gpt-4o's vision capabilities via Code Interpreter, validates eligibility criteria against program rules, and routes completed cases to the right staff member.

## Foundry Features Used

| Feature | Replaces |
|---|---|
| **Agent Service** | Flask API + Semantic Kernel conversation loop |
| **Code Interpreter (gpt-4o vision)** | Azure Document Intelligence SDK code + OCR pipeline |
| **Knowledge** | Custom eligibility rules engine + policy documents |
| **Custom OpenAPI tools** | Python case routing plugin + staff assignment logic |

## Files

| File | Description |
|---|---|
| [`step_by_step.md`](./step_by_step.md) | Complete click-by-click Foundry portal guide |
| [`system_prompt.txt`](./system_prompt.txt) | System instructions for the document eligibility agent |
| [`openapi/case-routing-api.json`](./openapi/case-routing-api.json) | OpenAPI spec to upload as a custom OpenAPI tool for case routing |
| [`knowledge/eligibility-requirements.md`](./knowledge/eligibility-requirements.md) | Eligibility rules and program requirements document |

## Source

Foundry-first recreation of the [Document-Eligibility-Agent](https://github.com/msftsean/ai-hackathon-use-cases/tree/main/Document-Eligibility-Agent) accelerator.
