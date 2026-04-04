---
layout: project
title: Fourier transform of polygons
date: 2025-12-10 6:03:47 -0500
categories: talks
tags:
  - talk
  - code
attributes:
  - seminar-talk
image: /files/presentations/thumbnails/brion_fourier.jpeg
file: /files/presentations/brion_fourier.pdf
talk-venue: UC Berkeley student harmonic analysis, Fall 2025
summary: Fourier analysis is a powerful tool for the discrete geometry of polytopes. This interaction is born from a striking formula of Brion, an explicit expression of the Fourier transform of the indicator function of a polytope. First, we will see heuristics for the large scale structure of this Fourier transform, which forms a "starburst" (see below). Then we derive Brion's formula, which describes the Fourier transform entirely from local data of the vertices. Finally, we will use Brion's formula to derive Pick's theorem, relating the volume of a lattice polygon to a count of lattice points inside the polygon.
pageHasContent: true
---

<script language="javascript" type="text/javascript" src="/sketch/libraries/p5.min.js"></script>
  <script language="javascript" type="text/javascript" src="/sketch/fourier_polygon/main.js"></script> 
   <script language="javascript" type="text/javascript" src="/sketch/fourier_polygon/complex.js"></script> 
 <script language="javascript" type="text/javascript" src="/sketch/fourier_polygon/draggable.js"></script> 

<style type="text/css">
  .mobileShow { display: none;}

  /* Smartphone Portrait and Landscape */
  @media only screen
    and (min-device-width : 320px)
    and (max-device-width : 700px){ 
      .mobileShow {display: inline;}
  }
</style>

<div class="mobileShow">
<h2>Does not work on mobile! please play on desktop sorry</h2>
</div> 


<style>
  h1 {
    margin-top: -1rem; /* pull 1rem upward */
    margin-bottom: 0.5rem; /* adjust spacing below as needed */
  }
</style>
<div class="container mt-3">
   <!-- Canvas Row -->
    <div class="row">
      <div class="col-12 text-center">
        <div class="container" style="
              margin-top:0% ;
              margin-bottom:0% ;
              position: relative;
              ">
              <div class="sketch" id="brion"></div>
          </div>
      </div>
    </div>
  </div>



- Click and drag to move verticies. 
- Double click to add/ remove verticies ( double click on edge to add)
- Click to enable / disable verticies
- Scroll to zoom in/out
<div class="card" >
    <h4 class="card-header">
        <a aria-expanded="true"  id="heading-example" class="d-block">
            Theorem: Brion's formula
        </a>
    </h4>
<div class="card-body" markdown="1">
Let $P\subset \RR^n$ be a simple convex polyt`ope, meaning every vertex $v$ has $n$ incident $\vec{w}^v_1,\dots,\vec{w}^v_n$.   Define the matrix $M_v$ with columns the edge vectors $\vec{w}^v_k$. If $\chi_P$ is the indicator function of $P$, then its Fourier transform is given by

$$\widehat{\chi_P}(\xi) = \frac{1}{i^n} \sum_{v \text{ vertex}}  \frac{|\det(M_v)| e^{i \langle\xi, v\rangle}}{\prod \langle \vec{w}^v_k,\xi\rangle}$$

This formula applies whenever the denominator is nonzero, meaning $\xi$ is not perpendicular to any edge of $P$


</div>
</div>

The applet above computes the Fourier transform of a 2D polygon using Brion's formula. Clicking on a vertex toggles whether we include it in the sum. With all vertices enabled, we retrieve the Fourier transform of the polytope

Some remarks: 
- Brion's formula is agnostic to the choice of edge vectors $\vec{w}^v$, because the determinant in the numerator cancels out with the product in the denominator.  
- Zooming out, the Fourier transform appears as beams perpendicular to the edges of the polygon. This is what we'd expect from diffraction patterns.
- Try turning off all but one vertex. The result has bright white lines perpendicular to the edges incident to that vertex. These are singularities of the contribution to Brion's formula.
- Now turn on an adjacent vertex. Notice how there are still only two rays of singularities. One of the singularities of one vertex cancels with a singularity from an adjacent vertex, leaving a removable singularity. With every vertex included, all infinities cancel and we have only removable singularities.
- The contribution of a vertex $v$ is best understood as the Fourier transform of the tangent cone of that vertex.

For details and explanations of this phenomena, see my [notes](/files/presentations/brion_fourier.pdf).

## Sources
I learned all this from the lovely book [A friendly introduction to Fourier analysis on polytopes](https://arxiv.org/abs/2104.06407) by Sinai Robins.