---
layout: default
title: Code
list_title: Code
---

  <div class="container">
  <h1 class="mt-4 mb-4">Code</h1>
  a collection of interactive programs, many of which illustrate some math.
  <hr class="mine">
 
 {% for project in site.tags.code %}
 {% include project_card.html %}
  {% endfor %}

</div>