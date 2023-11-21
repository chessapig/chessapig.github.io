---
layout: default
title: Projects
list_title: Projects
---

  <div class="container">
  <h1 class="mt-4 mb-4">Crafts</h1>
 
 {% for project in site.tags.craft %}
 {% include gallery_card.html %}
  {% endfor %}

</div>