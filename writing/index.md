---
layout: default
title: Projects
list_title: Projects
---


  <div class="container">
  <h1 class="mt-4 mb-4">Research Papers</h1>

 {% for project in site.tags.paper %}
 {% if project.tags contains "research"%}
 {% include paper_card.html %}
 {% endif %}
  {% endfor %}

<hr class="mine">
<h1 class="mt-4 mb-4">Expository Papers</h1>

 {% for project in site.tags.paper %}
 {% if project.tags contains "expository"%}
 {% include paper_card.html %}
 {% endif %}
  {% endfor %}

  </div>

<hr class="mine">
<h1 class="mt-4 mb-4">Informal writing</h1>
- I write math threads on Twitter. [Here are some old threads of mine](/writing/twitter).
- I sometimes upload things to my [blog](/blog), which are generally less polished than my twitter threads.
- I've recently started a [math diary](/writing/diary.html), where I write about things I learn about that given day. This is entirely unpolished and unedited, but is perhaps of interest to someone. 