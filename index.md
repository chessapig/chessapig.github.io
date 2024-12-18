---
layout: default
title: About
permalink: /
show_sidebar: false
---


  <style>
    .multicolumn-list {
      column-count: 3; /* Adjust the number of columns as needed */
      column-gap: 1em; /* Adjust the gap between columns as needed */
    }

    .multicolumn-list li:before {
      margin-right: 0.5em; /* Adjust the spacing between the bullet and list item as needed */
    }

  </style>

<div class="row">
  <div class="col-md-4 mb-1">
    <div class="card">
      <img class="card-img-top img-fluid"  src="/static/images/headshot.jpg"/>
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
        {% for post in site.tags.blog limit:5 %} 
          <ul class="list-group-item ">
            <a class="text-dark" href="{{ post.url }}"><h6>{{ post.title | markdownify | remove: '<p>' | remove: '</p>' }}</h6></a>
          </ul>
        {% endfor %}
      </ul>
    </div>
  </div>

  <div class="col-md-8 mb-4">
    <h1>Hello!</h1>
    <p>  I am a third year mathematics PhD student at UC Berkeley, advised by Constantin Teleman. I'm interested in physical mathematics, especially its intersections with geometry and topology. <br/>
	<h2>Math </h2>
	<p> I like geometry in whatever form it may take. Right now I'm primarily a symplectic geometer. I'm currently studying symplectic ball packing through the lens of quantum mechanics. Here are some words which I think about a lot:

<ul class="list text-sm">
    <li>Symplectic ball-packing in dimensions >4</li>
    <li>Spin c quantization</li>
    <li>Uncertainty principles</li>
    <li>Semiclassical analysis</li>
  </ul>

  and here's a smattering of topics which make me happy</p>

<ul class="list card-columns" style="column-count: 2;">
    <li>Symplectic style representation theory</li>
    <li>Topological/Supersymmetric quantum field theories</li>
    <li>Mirror symmetry (2D and 3D)</li>
    <li>Integrable systems</li>
    <li>Moduli spaces</li>
    <li>Toric geometry</li>
    <li>Symplectic style representation theory</li>
    <li>Classical differential geometry (curves and surfaces)</li>
  </ul>
	<p>My previous research applied Higgs bundles to condensed matter physics. You can read about it  <a href="/paper/hyperbolic-band-theory">here</a>. To see other things I've thought about, check out my past <a href="/talks">talks</a>. 
   <!--To see what I'm thinking about at this exact moment, you can peek inside my <a href="/writing/diary.html">math diary</a>.</p> -->
    <h2>Art </h2>
    <p> I think about math very visually (hence the geometry). I try to capture mathematical objects and the feelings they illicit using digital art, which you can check out in the <a href="/gallery">gallery</a>. I also enjoy creative coding, which often has a mathematical component. See some examples in <a href="/code">code</a>. My favorite example is my explorations of <a href="/code/hyperbolic-string-art">hyperbolic string art</a>
    
  <!-- </div>
</div> -->
