---
layout: default
title: Projects
list_title: Projects
---

  <div class="container">
  <h1 class="mt-4 mb-4">Code Sketches</h1>
 
 {% for project in site.tags.code %}
 {% include project_card.html %}
  {% endfor %}

</div>