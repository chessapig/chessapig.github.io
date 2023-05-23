---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---

  <div class="container">
  <h1 class="mt-4 mb-4">Blog</h1>

 {% for project in site.tags.blog %}
 {% include project_card.html %}
  {% endfor %}

</div>