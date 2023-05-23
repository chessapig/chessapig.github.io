---
layout: default
title: Projects
list_title: Projects
---


  <div class="container">
    <h1 class="mt-4 mb-4">My Academic Webpage</h1>
  
 {% for project in site.tags.talk %}
      <div class="project">
        <div class="project-details">
        {%- assign date_format = site.minima.date_format | default: "%b %Y" -%}
        <span class="post-meta">{{ project.date | date: date_format }}</span>
          <h1><a class="post-link" href="{{ project.url | relative_url }}">
            {{ project.title | escape }}
          </a></h1>
          <div class="tags">
            {% for tag in project.tags %}
              <span class="tag">{{ tag }}</span>
            {% endfor %}
          </div>
          <p><h5>Abstract:</h5> {{ project.summary | markdownify }}</p>
          <p>
            <ul>
            {% for talk in project.talk-venue %}
              <li>{{ talk }}</li>
            {% endfor %}
            </ul>
        </p>

        </div>
        {%- if project.image -%}
        <div class="project-image">
          <img src="{{ project.image }}" alt="{{ project.title }}" class="img-fluid" >
        </div>
        {%- endif -%}
      </div>
    {% endfor %}
  </div>