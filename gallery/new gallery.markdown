---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---

Hello hi

  <h1 class="mt-4 mb-4">Presentations</h1>

 {% for project in site.tags.gallery %}
 {% include gallery_card.html %}
 {% endfor %}

