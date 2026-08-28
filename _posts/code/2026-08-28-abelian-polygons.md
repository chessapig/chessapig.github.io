---
layout: default
title: Abelian polygon spaces
date: 2026-08-27 16:03:47 -0500
categories:
tags:
  - code
image: /assets/polygons/abelian/thumbnail.png
pageHasContent: true
summary: A collection of applets exploring the polygon and abelian polygon moduli spaces
---


<script language="javascript" type="text/javascript" src="/sketch/libraries/p5.min.js"></script>
<script src="sketch/libraries/myHelpers/graphicsWindow.js"></script>
<script src="sketch/libraries/myHelpers/complex.js"></script>
<script src="sketch/libraries/myHelpers/selector.js"></script>
<script src="sketch/polygon_moduli/moduli.js"></script>

  <!-- KaTeX CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">

<!-- KaTeX JS -->
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>

  
<style type="text/css">
  .mobileShow { display: none;}

  /* Smartphone Portrait and Landscape */
  @media only screen
    and (min-device-width : 320px)
    and (max-device-width : 700px){ 
      .mobileShow {display: inline;}
  }
</style>



<style>
  #canvas
  {
    width: 70vw;
	height: calc(70vw/2);

	border: 3px solid rgb(230,207,179);
	padding: 0px;
	border-radius: 0px;

	margin: 0 auto;  /* centers horizontally */
  	display: block;  /* important if it's not already block */
  }
    }

</style>

<h1 class="text-center">Moduli spaces of polygons</h1>
<p class="text-center">Click, drag, and scroll dots on sphere to control polygon </p>

<div class="mobileShow">
<h2>Does not work on mobile! please play on desktop sorry</h2>
</div>
<div class="container mt-3 mb-3">
    <!-- Canvas Row -->
    <div class="row mb-3">
        <div class="col-12 text-center">
            <div class="sketch" id="canvas"></div>
        </div>
    </div>
    <div class="row mb-3 justify-content-center">
	    <!-- LEFT CARD -->
	    <div class="col-md-7 mb-2">
	        <div class="card shadow-sm">
	            <div class="card-body">
	
	                
			        
	                
	                <!-- Do abelian Checkbox -->
	                <div class="form-check form-switch mb-3">
	                    <input class="form-check-input" type="checkbox" id="doAbelianBox">
	                    <label class="form-check-label bf" for="doAbelianBox">Abelian Polygon space?</label>
	                </div>
	                
	                <!-- Height Slider (Wrapped for easy hiding/showing) -->
	                <div id="levelSliderContainer" style="display: none;">
	                    <label for="levelSlider" class="form-label">
	                        Height of abelian polygon space: <span id="levelSliderValue">0.5</span>
	                    </label>
	                    <input type="range" class="form-range" id="levelSlider" min="0" max="2" step="0.001" value="0.5">
	                </div>
	                
		            <!-- Constraint Slider -->
	                <label for="gradientSlider" class="form-label">
	                    Strength of polygon constraint: <span id="gradientSliderValue">1</span>
	                </label>
	                <input type="range" class="form-range" id="gradientSlider" min="0" max="1" step="0.001" value="1">
	
	            </div>
	        </div>
	    </div>
	</div>
</div>

This applet shows the isomorphism between a polygon in $\mathbb{R}^3$ and a weighted collection of points on $\mathbb{CP}^1$. Thinking of $\mathbb{CP}^1$ as the unit sphere $S^2 \subset \mathbb{R}^3$, each point defines the direction vector of an edge of the polygon, and the weight defines the length of that edge. From the collection of edge vectors, we construct a chain.  A *Closed polygon* is a chain ending at the origin, while an *Abelian polygon* is a chain ending on a specified plane. 

We are interested in the moduli space of polygons with specified edge lengths up to their natural symmetry. The *Polygon moduli space* is the space of closed polygons with specified edge lengths modulo the $SO(3)$ rotation action. The *Abelian polygon moduli space* is the space of abelian polygons ending at the plane $z = \alpha$, modulo the $S^1$ action rotating around the $z$ axis.  (They are called abelian polygons because this symmetry is abelian.) As the applet shows, the space of chains with specified lengths $\alpha_i$ is a product of spheres $\prod S^2$ with radii $\alpha_i$. To produce the desired moduli space, we apply a constraint then divide by the group action. The constraint is achieved by specifying the value of the moment map of the group action. The resulting moduli spaces are symplectic reductions
- The polygon moduli space is $\prod S^2 //\_0\,  SO(3) = \mu_{SO(3)}^{-1}(0)/SO(3)$
- The Abelian polygon moduli space is $\prod S^2 //\_\alpha\,  S^1 = \mu_{S^1}^{-1}(0)/S^1$

To apply the moment map constraint $\mu=0$ in the applet, I apply the reverse gradient flow by $\nabla \vert\mu\vert^2$. The "constraint strength" slider controls the step size of gradient descent.

Created as part of WISCON 2026

<h2 class="text-center">Input controls</h2>
Each dot on the left sphere controls a edge of the polygon on the right
- Double click to add/ remove dots
- Scroll over dot to change the length of the associated edge
  

- Click and drag to rotate sphere and polygon.
- Scroll on right to zoom in and out of polygon. 
- Hold shift and drag on right to pan polygon. 

# More Polygons
<div class="col-12 col-md-8 mx-auto d-flex">  
	<div class="card my-4 shadow-sm w-100">  
		<a href="/sketch/polygon_moduli/dh">  
			<img src="/assets/polygons/abelian/dh.png"  
			alt="graph of compactly supported lump"  
			class="card-img-top">  
		</a>  
		<div class="card-body text-center">  
			<h5 class="card-title">  
				<a href="/sketch/polygon_moduli/dh" class="text-decoration-none">  
					Duistermaat-Heckman measure
				</a>  
			</h5>  
			Program computing the volume measure of the abelian polygon space as a function of height of the plane. The sliders at the bottom control the lengths of the edges of the chain. The green ticks indicate the critical values of the diagonal $S^1$ moment map.
		</div>  
	</div>  
</div>  

<div class="col-12 col-md-6 mx-auto d-flex">  
	<div class="card my-4 shadow-sm w-100">  
		<a href="talk/polygons">  
			<img src="/assets/polygons/polygon.jpg"  
			alt="collection of poygons on the table"  
			class="card-img-top">  
		</a>  
		<div class="card-body text-center">  
			<h5 class="card-title">  
				<a href="/talk/polygons" class="text-decoration-none">  
					Polygon blog post
				</a>  
			</h5>  
			A slightly more detailed explanation of some math behind polygon moduli spaces, from a few years ago.
		</div>  
	</div>  
</div>








