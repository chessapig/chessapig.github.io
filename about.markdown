---
layout: default
title: About
permalink: /about/
show_sidebar: false
---


<div class="row">
  <div class="col-md-4 mb-1">
    <div class="card">
      <img class="card-img-top" src="/static/images/headshot.jpg"/>
      <div class="card-body">
        <div class="card-text">
          <i class="fas fa-user"></i> ekienzle[at]berkeley[dot]edu <br/>
          <i class="fab fa-twitter"></i><a href="https://twitter.com/chessapigbay" target="_blank">@chessapigbay</a> <br/>
        </div>
      </div>
    </div>
    <br/>
    <div class="card">
      <div class="card-header">
        <h3> <a href="/blog" title="Link">Recent blog posts</a></h3>
      </div>
      <ul class="list-group list-group-flush">
        {% for post in site.categories.blog limit:5 %} 
          <ul class="list-group-item">
            <a class="text-dark" href="{{ post.url }}"><h6>{{ post.title | markdownify | remove: '<p>' | remove: '</p>' }}</h6></a>
          </ul>
        {% endfor %}
      </ul>
    </div>
  </div>

  <div class="col-md-8 mb-4">
    <h1>Hello!</h1>
    <p>  I am a first year mathematics PhD student at UC Berkeley. I'm interested in mathematical physics, espically its intersections with geometry and topology (Read more <a href="/research">here</a>).  I got undergraduate degrees in math and physics from the University of Maryland (UMD)<br/>
    <h2>Art </h2>
    <p>I was drawn to geometry because my approach to math is very visual. I try to capture my images of mathematical objects using digital art, which you can check out in the <a href="/gallery">gallery</a>. I also like to play with code sometimes, making code sketches which often have a mathematical component.  I talk about a few of them in <a href="/visualization">visualization</a>.
    <!-- <h1>Other activities</h1>
    <h2>MoMath </h2>
    In the summer of 2022, I worked at the national meusuem of a
    <h1>Hello, I'm Elliot!</h1>
    <p>You'll probably get a pretty good sense of my interests from the content on this site, but just in case: I like math and physics. In fact, Right now I'm studying math and physics, and hopefully someday I'll know enough to study mathematical physics. My fav is differential geometry, which studies local propreties of curvey spaces, like a many-dimensional potato. I like how visual it is. Geometry is like the interpeter of the mathematical pantheon, all the other fields look to it for intuition. Not to mention, physics is a subfield of geometry ;). So many things, in physics or elsewise, have really beutiful geometric interpetations. I honestly believe anything in life is better with manifolds.
      <br/>  <br/>
    But I like other stuff too! I really enjoy earth/space sciences, so Astronomy, Geology, Atmospheric science, and espically Oceanography. For related reasons, I love marine bio, and all the friendly invertebrate it brings. Land mammals are overrated.
      <br/>  <br/>
    Recently (few months ago) I picked up art, thanks to an ipad and procreate, and have had lots of fun with that since.I posted some of my finished drawings at the <a href="/gallery">gallery</a>. I've also always been facinated by generative art, but I'm always turned away by my own biases against programming. But a couple weeks ago, I crossed the avivation barrier and have since managed to finish some things! You can check it out at the <a href="/gallery">gallery</a>, and there'll likely be more of that to come. Exciting times.  
    </p>
    <br/> -->
  <!-- </div>
</div> -->
