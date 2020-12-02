---
layout: page
title: About
permalink: /about/
show_sidebar: true
---


<p>
When \(a \ne 0\), there are two solutions to \(ax^2 + bx + c = 0\) and they are
\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]
</p>

{% if page.show_sidebar %}
  <div class="sidebar">
    sidebar content
  </div>
{% endif %}

{{ site.time | date_to_rfc822 }}

{{ page.permalink | absolute_url }}

Hi This is my website

{{"hi ALL" | downcase}}
