---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---



test index  
<div id="galleryCarousel" class="carousel slide" data-interval="20000" data-ride="carousel">
    {% assign size =  {{site.data.art | size | minus: 1}} %}
    <ol class="carousel-indicators">
        {% for i in (0..size) %}
            {% if i==0 %} {%- assign isActive = "active" -%}
            {% else %} {%- assign isActive = "" -%}
            {% endif %}
            <li data-target="#galleryCarousel" data-slide-to="{{i}}" class="{{isActive}}"></li>
        {% endfor %}
    </ol>
    <div class="carousel-inner">
        {% assign i = 0 %}
        {% for art in site.data.art %}
            {% if i==0 %} {%- assign isActive = " active" -%}
            {% else %} {%- assign isActive = "" -%}
            {% endif %}
                <div class= '{{"carousel-item" | append: isActive }}'>
                    <img src='{{art.thumbnail}}' class='d-block h-10' alt='{{art.title}}'>
                    <div class="carousel-caption">
                        <h3>{{art.title}}</h3>
                        <p>{{art.description}}</p>
                    </div>




                </div>
            {% assign i = {{ i | plus: 1 }} %}
        {% endfor %}
    </div>
    <a class="carousel-control-prev" href="#galleryCarousel" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">Previous</span>
    </a>
    <a class="carousel-control-next" href="#galleryCarousel" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">Next</span>
    </a>
</div>