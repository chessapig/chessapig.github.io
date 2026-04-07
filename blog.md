---
layout: default
title: Blog
list_title: Blog
---

  <div class="container">
  <h1 class="mt-4 mb-4">Blog</h1>

 {% for project in site.tags.blog %}
 {% include project_card.html %}
  {% endfor %}

</div>