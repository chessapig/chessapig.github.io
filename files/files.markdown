---
published: false
layout: default
title: Files
permalink: /files/
show_sidebar: false
---


<div class="card-columns ">
{% for file in site.data.files %}
{% if file.type == "presentation" %}
    <div class="card" style="width: 100%">
    <h5 class="card-title"> <a href="/files/presentations/{{ file.file }}" target="_blank" >{{file.title}}</a> </h5>
      <img class="card-img-side" src="/files/presentations/thumbnails/{{ file.thumbnail }}"/>
      <div class="card-body">
        <div class="card-text">
          {{file.description}}
        </div>
      </div>
    </div>
{% endif %}
{% endfor %}
</div>