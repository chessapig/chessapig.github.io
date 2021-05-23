---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---

<div class="container">

<div class="blank"></div>
<section id="screenA" class=screen>
    <div id="galleryCarouselA" class="carousel slide" data-interval="20000" data-ride="carousel">
        {% assign i = 0 %}
        <div class="carousel-inner">
            {% for art in site.data.art %}
                {% if art.category=="traditional"%}
                    {% assign doBlur = "" %}
                    {% if i==0 %} {%- assign isActive = " active" -%}
                    {% else %} {%- assign isActive = "" -%}
                    {% endif %}
                        <div class= '{{"carousel-item" | append: isActive }} borderr' width="100" height="100">
                            {% if art.type=="gif"%} {%- assign doBlur = "hide" -%}
                            {% endif %}
                            <img src='{{art.thumbnail}}' class='{{"d-block rounded gallery blur "| append: doBlur }}' alt='{{art.title}}' >
                            <img src='{{art.thumbnail}}' class="d-block rounded gallery" alt='{{art.title}}' >
                            <div class="carousel-caption mb-0">
                                <a href='{{art.file}}'>
                                <h3>{{art.title}}</h3>
                                </a>
                                <p>{{art.description}}</p>
                            </div>
                        </div>
                    {% assign i =  i | plus: 1  %}
                {% endif %}
            {% endfor %}
        </div>
        <ol class="carousel-indicators mb-0">
            {% for j in (1..i) %}
                {% if j==1 %} {%- assign isActive = "active" -%}
                {% else %} {%- assign isActive = "" -%}
                {% endif %}
                <li data-target="#galleryCarousel" data-slide-to="{{j-1}}" class="{{isActive}}"></li>
            {% endfor %}
        </ol>
        <a class="carousel-control-prev" href="#galleryCarouselA" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#galleryCarouselA" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
        </a>
    </div>
</section>


 {% assign n = 1 %}
 {% for art in site.data.art %}
    {% if art.type=="folder"%}
        <section id='{{"screen" | append: n }}' class=screen>
            <div id='{{"galleryCarousel" | append: n }}' class="carousel slide" data-interval="20000" data-ride="carousel">
                <div class="carousel-inner">  
                    {% for i in (1..art.number) %}
                        {% if i==1 %} {%- assign isActive = " active" -%}
                        {% else %} {%- assign isActive = "" -%}
                        {% endif %}          
                            <div class= '{{"carousel-item" | append: isActive }} borderr' width="100" height="100">
                                {% assign filepath = 'images/' | append: art.filename | append:"/" | append:art.filename | append:i | append:".jpg"%}
                                <img src='{{filepath}}' class='d-block rounded gallery blur' alt='{{art.title}}' >
                                <img src='{{filepath}}' class="d-block rounded gallery" alt='{{art.title}}' >
                                <div class="carousel-caption mb-0">
                                    <a href='{{art.file}}'>
                                    <h3>{{art.title}}</h3>
                                    </a>
                                    <p>{{art.description}}</p>
                                </div>
                            </div>     
                    {% endfor %}
                </div>
                <ol class="carousel-indicators mb-0">
                    {% for i in (1..art.number) %}
                        {% if i==0 %} {%- assign isActive = " active" -%}
                        {% else %} {%- assign isActive = "" -%}
                        {% endif %}
                        <li data-target='{{"#galleryCarousel" | append: n }}' data-slide-to="{{i-1}}" class="{{isActive}}"></li>
                    {% endfor %}
                </ol>
                <a class="carousel-control-prev" href='{{"#galleryCarousel" | append: n }}' role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                </a>
                <a class="carousel-control-next" href='{{"#galleryCarousel" | append: n }}' role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                </a>
            </div>
        </section>
    {% endif %}  
    {% assign n =  n | plus: 1  %}
{% endfor %}



<div class="blank"></div>

</div>  <!-- end container -->




<!-- <img src='/gallery/thumbnails/ollie.jpg'>
<img src='/gallery/thumbnails/ollie.jpg'>
<img src='/gallery/thumbnails/ollie.jpg'> -->
<style>
.blur {
    position:absolute;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    filter: blur(3vw);
    z-index: -1;
}
.hide {
    visibility: hidden;
}
.gallery {
    width: auto;
    height: auto;
    margin: auto;
    margin-top: 5vh;
    margin-bottom: 5vh;
    max-height: 80vh;
    max-width: 80vw;
    z-index: -2;
}
.borderr{
    border: 0.1px solid transparent !important;
}
.screen{
    height: 100vh;
    scroll-snap-align: center;
}
.container {
    position:absolute;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    top:0;
    height: 110vh;
    width: 100vw;
    overflow: scroll;
    scroll-snap-type: y mandatory;
     z-index: 1;
}
.blank{
    height: 30vh;
}
.center{
    margin: 0;
    position: reletive;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
html, body {
  height: 100vh;
  width:100vw;
  overflow: hidden;
}


</style>



