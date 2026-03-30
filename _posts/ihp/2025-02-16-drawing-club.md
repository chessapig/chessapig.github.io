---
layout: project
title: Drawing club
date: 2026-01-26 16:03:47 -0500
categories: 
tags:
  - drawing
  - gallery
  - ihp
image: /assets/drawing-club/seifert/exquisite_topology.jpeg
file: /assets/drawing-club/all_worksheets.pdf
summary: I ran a mathematical drawing class over the trimester. Click to see the activities for each week. I've linked a compilation of all the worksheets from the trimester.
pageHasContent: true
gallery-title: Drawing club
gallery-folder: /assets/drawing-club/gallery/
gallery-captions:
  - image: exquisite
    title: An Exquisite Topological Corpse
    caption: Each person draws a square, first drawing the lines, then filling with a soapy film. Togehter, they build an exquisitly topological surface. This piece was displayed at the Maison Poincare art show following the trimester at IHP. For more information, see the week on [Seifert surfaces](/drawing-club/seifert)
  - image: spheres
    title: Spheres
    caption: How do you draw a sphere? Where is its equator? where is its pole? From the week on [spheres](/drawing-club/spheres). <br> Photo credit Edmund Harris
  - image: tori
    title: Tori
    caption: How do you draw a torus? What does it's hole look like? There are many ways to draw the same topological object. From the week on [worms](/drawing-club/worms). <br> Photo credit Edmund Harris
  - image: worm
    title: Worms
    caption: An examination on the mathematics and philosophy of drawing worms. I guess. See the week on [worms](/drawing-club/worms)
  - image: composition
    title: Swapped aspects
    caption: By Samuel Lelièvre. On the left, a square, cut up and rearranged to suggest a circle. On the right, a circle rearranged to suggest a square. This came from the week on [composition](/drawing-club/composition)
---

Each class, we started with a gesture drawing session. Sabetta ran around the room making silly poses, and we had 30 seconds to draw them. It loosened up our hands, and forced us to draw what we see instead of what we imagine. This might have been the best part of drawing club. 

<div class="card my-4 shadow-sm" style="max-width: 600px; margin: auto;">
  <img src="/assets/drawing-club/gesture.jpeg" alt="many quickly drawn figures, in various poses, filling the page" class="card-img-top" >

  <div class="card-body text-center">
    <h5 class="card-title"> Gesture drawings</h5>
	<p class="card-text"> By Rebecca Field  (photo credit Edmund Harris) </p>
  </div>
</div>


{% for w in (1..12) %}  
  
{% for project in site.tags.drawing-club %}  
{% if project.week == w %}  
{% include project_card.html %}  
{% endif %}  
{% endfor %}  
  
{% endfor %}


