---
title: Foundry-First Accelerator Documentation
---

{% assign ordered_guides = site.guides | sort: 'order' %}

<section class="hero">
  <p class="eyebrow">AI Hack Foundry Use Cases</p>
  <h1>Visually-Rich Documentation for 7 Foundry-First Accelerators</h1>
  <p class="lede">This site turns the repository into a guided experience: each accelerator has a quick path from concept to execution, with direct links to prompts, OpenAPI action specs, and knowledge packs.</p>
</section>

<section class="metric-grid">
  <div class="metric">
    <strong>7</strong>
    Accelerator tracks
  </div>
  <div class="metric">
    <strong>42+</strong>
    Files mapped into docs
  </div>
  <div class="metric">
    <strong>100%</strong>
    Azure AI Foundry-first delivery
  </div>
  <div class="metric">
    <strong>0</strong>
    Mandatory app-hosting code for core demos
  </div>
</section>

<section class="panel">
  <h2>Use This Site</h2>
  <div class="quick-links">
    <a href="#accelerators">Browse all accelerators</a>
    <a href="https://github.com/ricardo-msft-SE/ai-hack-foundry-usecases/blob/main/README.md" target="_blank" rel="noreferrer">Open root README in repo</a>
    <a href="https://ai.azure.com" target="_blank" rel="noreferrer">Launch Azure AI Foundry</a>
  </div>
</section>

<section id="accelerators" class="panel">
  <h2>Accelerators</h2>
  <div class="card-grid">
    {% for guide in ordered_guides %}
    <article class="card">
      <p class="meta">Accelerator {{ guide.order }}</p>
      <h3>{{ guide.title }}</h3>
      <p>{{ guide.tagline }}</p>
      <a href="{{ guide.url | relative_url }}">Open Guide</a>
    </article>
    {% endfor %}
  </div>
</section>

<section class="panel">
  <h2>Documentation Pattern</h2>
  <table>
    <thead>
      <tr>
        <th>Layer</th>
        <th>Artifact</th>
        <th>Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Overview</td>
        <td><code>README.md</code></td>
        <td>Scope, scenario, and feature mapping</td>
      </tr>
      <tr>
        <td>Execution</td>
        <td><code>step_by_step.md</code></td>
        <td>Operational sequence inside Foundry</td>
      </tr>
      <tr>
        <td>Behavior</td>
        <td><code>system_prompt.txt</code></td>
        <td>Agent role, guardrails, and response policy</td>
      </tr>
      <tr>
        <td>Tools</td>
        <td><code>openapi/*.json</code></td>
        <td>Action contracts to call external systems</td>
      </tr>
      <tr>
        <td>Knowledge</td>
        <td><code>knowledge/*.md</code></td>
        <td>Grounding corpus for citations and retrieval</td>
      </tr>
    </tbody>
  </table>
</section>
