---
title: All Accelerator Guides
permalink: /guides/
---

{% assign ordered_guides = site.guides | sort: 'order' %}

<section class="hero">
  <p class="eyebrow">Guide Catalog</p>
  <h1>All Foundry-First Accelerator Guides</h1>
  <p class="lede">Choose a domain scenario and jump directly to operational files, including prompts, OpenAPI action specs, and grounding content.</p>
</section>

<section class="card-grid">
  {% for guide in ordered_guides %}
  <article class="card">
    <p class="meta">Accelerator {{ guide.order }}</p>
    <h3>{{ guide.title }}</h3>
    <p>{{ guide.tagline }}</p>
    <div class="card-actions">
      <a href="{{ guide.url | relative_url }}">Open Guide</a>
      <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7105kWO-NdDrl7nzF5FI39UOE4zTDFFVUkzQ0dWM1dXWTcwTDlUQTM5US4u&origin=QRCode">Sign Me Up</a>
    </div>
  </article>
  {% endfor %}
</section>
