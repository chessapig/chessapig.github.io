---
layout: default
title: About
permalink: /visualization/
show_sidebar: true
---

<style>

# Code Sketches

Click the titles to go to each of the sketches


## <a href="/sketch/strings">String art</a>

<img src="/sketch/strings/Examples/wrongTan.png" width="1000"/>

Put a bunch of nails labeled 1 thru N in a circle, and stretch strings between each peg $i$ and its double $2i$. the density of strings is highest wherever the strings cross, which happens on a cardoid curve. Use really tiny strings, and we can see the pure cardiod, like in the left picture below. These high-density curves are called caustics. This sketch explores how the caustics look with different maps, or deformed boundaries like the picture in the right.


<img src="/sketch/strings/Examples/cardiod.png" height="500"/>
<img src="/sketch/strings/Examples/deformed_cardoid.png"   height="500"/>

More mathematically, every map from the circle to itself gives a piece of string art. What do the caustics in that art tell us about the dynamics of the map? For example, the left picture below shows the caustics of a (doubled) mobius transform, while the right shows a family of perlin noise maps.

<img src="/sketch/strings/Examples/mobius.png"   height="400"/>
<img src="/sketch/strings/Examples/logo_loop.gif" height="400"/>

## <a href="/sketch/diffeos">Dynamics of random maps</a>
An illustration of dynamics of a random map from the plane to itself. It plots the trajectories of a few random points, showing where and how they accumulate. The map is periodically modulating perlin noise. As the map changes, you can see all sorts of bifurcations and dynamic effects. Here are some more [examples](https://twitter.com/chessapigbay/status/1448164156713078785), and a little more [context](https://twitter.com/chessapigbay/status/1448151992426172416)

![](/sketch/diffeos/Examples/fluer_de_lis.gif)


## <a href="/sketch/Hoops">Hoops</a>
Just some fun blobs. I suggest looking thru the presets. 

<img src="/sketch/Hoops/Examples/sunquake.gif" alt="Gif of blobs" width="600"/>


## <a href="/sketch/toric_engine"> Toric geometry and harmonic oscillators </a>

I explained the mathematical context pretty extensivly [in this post](/blog/2022/07/24/Toric.html), which also holds several other sketches. For the cliff notes, try my [thread on twitter](https://twitter.com/chessapigbay/status/1522857228419620864). Some outputs:

<img src="/sketch/strings/Examples/sphere.gif" height="400"/>
<img src="/sketch/strings/Examples/sombrero.gif" height="400"/>


<img src="/sketch/strings/Examples/canoli.png" height="400"/>
<img src="/sketch/strings/Examples/fleur.png" height="400"/>


##  <a href="/sketch/tori">KAM Tori</a>
---


<img src="/sketch/tori/Examples/tori_loop.gif" width="600"/>


A failed attempt to find some KAM tori. When a system has lots of conserved quantities, its dynamics becomes very regular. The level sets of the conserved quantities are tori, and everything circles around the tori at a constant rate. Perturbing the system breaks these symmetries, so we lose our pretty tori. KAM theorem tells us how: A torus with a rational ratio of frequencies collapses into several smaller tori with regular dynamics, interspersed with areas of hyperbolic dynamics. This process repeats and repeats, forming a fractal of tori surrounded by chaos. The picture below shows a cross-section of some KAM tori, taken from Abraham-Marsden Foundation of Mechanics:

<img src="/sketch/tori/Examples/KAM_diagram.png" alt="drawing" width="200"/>

Incidentally, the tori with sufficiently irrational frequency ratios remain, separating the chaotic regions. 

This sketch is my attempt to see the invariant torus decomposition in the flesh. I start with the simplest integrable system, rotation by a radius-dependent angle, and perturb it. Unfortunately, I couldn't see much recognizable in the orbits of this system. But, at some point I goofed up and forgot to update the rotation angle for each point, so every point was running under its own dynamical system. This made some pretty mesmerizing dances when perturbed, as each particle spirals in or blossoms out.

  <div class="col-md-9 mb-4">
    <h1>Hello!</h1>
    <p> TODO <br/>
    <a href="https://chessapig.github.io/sketch/diffeos">ooh look at the pretty diffeomorphisms</a>
    <br>
    <a href="https://chessapig.github.io/sketch/Hoops">ooh look at the pretty lines</a>
    <br>
    <a href="https://chessapig.github.io/sketch/tori">ooh look at the pretty tori</a>
    aaaaaa
    <!-- <h1>Hello, I'm Elliot!</h1>
    <p>You'll probably get a pretty good sense of my interests from the content on this site, but just in case: I like math and physics. In fact, Right now I'm studying math and physics, and hopefully someday I'll know enough to study mathematical physics. My fav is differential geometry, which studies local propreties of curvey spaces, like a many-dimensional potato. I like how visual it is. Geometry is like the interpeter of the mathematical pantheon, all the other fields look to it for intuition. Not to mention, physics is a subfield of geometry ;). So many things, in physics or elsewise, have really beutiful geometric interpetations. I honestly believe anything in life is better with manifolds.
      <br/>  <br/>
    But I like other stuff too! I really enjoy earth/space sciences, so Astronomy, Geology, Atmospheric science, and espically Oceanography. For related reasons, I love marine bio, and all the friendly invertebrate it brings. Land mammals are overrated.
      <br/>  <br/>
    Recently (few months ago) I picked up art, thanks to an ipad and procreate, and have had lots of fun with that since.I posted some of my finished drawings at the <a href="/gallery">gallery</a>. I've also always been facinated by generative art, but I'm always turned away by my own biases against programming. But a couple weeks ago, I crossed the avivation barrier and have since managed to finish some things! You can check it out at the <a href="/gallery">gallery</a>, and there'll likely be more of that to come. Exciting times.  
    </p>
    <br/> -->
  <!-- </div>
</div> -->
