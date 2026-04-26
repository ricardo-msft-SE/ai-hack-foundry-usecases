---
title: Accelerator Advisor
permalink: /advisor/
---

{% assign survey = site.data.advisor_survey %}

<section class="hero">
  <p class="eyebrow">Interactive Advisor</p>
  <h1>Find Your Best-Fit Accelerator</h1>
  <p class="lede">Answer five questions. We will recommend the strongest match and rank all other accelerators by score.</p>
</section>

<section id="advisor-app" class="panel advisor-app" aria-live="polite" data-baseurl="{{ site.baseurl }}">
  <p>Loading survey...</p>
</section>

<script id="advisor-survey-data" type="application/json">{{ survey | jsonify }}</script>
<script src="{{ '/assets/js/advisor-survey.js' | relative_url }}" defer></script>
