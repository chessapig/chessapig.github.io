---
layout: default
title: Quantum dice
slug: dice
date: 2026-04-26 16:03:47 -0500
categories: code
tags:
  - code
image: /assets/images/quantum_dice.jpeg
pageHasContent: true
summary: Fair dice from quantum mechanics
---
  <script language="javascript" type="text/javascript" src="/sketch/libraries/p5.min.js"></script>
 <!--  -->
	<script src="/sketch/libraries/myHelpers/graphicsWindow.js"></script>
	<script src="/sketch/libraries/myHelpers/complex.js"></script>
	<script src="/sketch/libraries/myHelpers/selector.js"></script>
	<script src="/sketch/libraries/myHelpers/polynomial.js"></script>
	<script src="/sketch/wherl/quantum_dice.js"></script>

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

<div class="mobileShow">
<h2>Does not work on mobile! please play on desktop sorry</h2>
</div>

<style>
  #dice-canvas
  {
    

    border: 3px solid rgb(230,207,179);
    padding: 0px;
    border-radius: 0px;

    margin: 0 auto;  /* centers horizontally */
      display: block;  /* important if it's not already block */
  }
</style>
<h1 class="text-center">Quantum Dice</h1>

<div class="container mt-3 mb-3">
   <!-- Canvas Row -->
    <div class="row mb-3">
      <div class="col-12 text-center">
        <div class="container" style="
          margin-top:0% ;
          margin-bottom:0% ;
          position: relative;
          ">
          <div class="sketch" id="dice-canvas"></div>
      </div>
      </div>
    </div>

  <div class="row mb-3 justify-content-center">
		<!-- LEFT CARD -->
		<div class="col-md-5 mb-2">
			<div class="card shadow-sm">
				<div class="card-body">
					<h5 class="card-title">Basins of attractions</h5>

					<!-- Flow time  Slider -->
					<label for="timeSlider" class="form-label">Flow time: <span id="timeLabel">0.5</span></label>
					<input type="range" class="form-range" id="timeSlider" min="0" max="1" step="0.001" defaultUIState>

					<!-- Do marble Checkbox -->
					<div class="form-check form-switch">
						<input class="form-check-input" type="checkbox" id="doMarbleBox" checked="true">
						<label class="form-check-label" for="doMarbleBox">Marble sphere?</label>
					</div>
				</div>
			</div>
		</div>

		<!-- RIGHT CARD -->
		<div class="col-md-5 mb-2">
			<div class="card shadow-sm">
				<div class="card-body">
					<h5 class="card-title">Dice</h5>

					<!-- Roundness Slider -->
					<label for="roundnessSlider" class="form-label">Roundness: <span
							id="roundnessLabel">0.5</span></label>
					<input type="range" class="form-range" id="roundnessSlider" min="0" max="1" step="0.01"
						defaultUIState>

					<!-- Polar Checkbox -->
					<div class="form-check form-switch">
						<input class="form-check-input" type="checkbox" id="doPolarBox" checked="true">
						<label class="form-check-label" for="doPolarBox">Draw dice</label>
					</div>

				</div>
			</div>
		</div>

	</div>

  </div>

The left hand side lets you control a collection of points $p_i \in S^2$, and their weights $w_i$. The colors show the basin of attraction of the gradient flow of the function $f: S^2\to \mathbb{R}$:

$$f(x) = \prod |x-p_i|^{w_i}$$

Remarkably, the basin of attraction of $p_i$ has area proportional to $w_i$. This provides a Voronoi-type decomposition of the sphere, with prescribed areas of each cell. For a related decomposition of the plane, with mathematical details, see my page on the [Biran decomposition](/talk/Biran).

 The right hand side shows a convex body with support function $f(x)+c$, where $c$ is a constant controlled by the slider "roundness". For large enough roundness, $f(x)+c$ is a convex function, and the associated convex body is smooth. This is a dice, with faces defined by the Voronoi decomposition on the left side. The stable positions of this dice are $p_i$, and the probability of rolling $p_i$ is $w_i$. In particular, if all the weights are the same, we produce fair dice with prescribed stable positions.

<h2 class="text-center">Input controls</h2>


Each dot on the left side controls a face of a dice

- Click and drag / scroll to rotate and zoom sphere and dice.
- Hold Shift to pan
- Click and drag dot to move it on sphere
- Double click to add/ remove dots
- Scroll over dot to change its weight, and the size of the associated cell. (This really messes with my solvers at the moment)

Basins of attraction control:
- **Flow time**: increasing flow time gives more accurate basins of attraction. At large flow times, things become unstable. Make flow time as large as possible while still seeing the basins. When flow time is zero, we see a spherical weighted voronoi diagram
- **Marble sphere?**: When enabled, uses the numerical preclusions of my gradient flow algorithm to color the regions. Similar to newton fractals. 


Dice control:
- **Roundness**: Interpolates the function $f(x)$ to a constant, making the dice closer to a sphere. When large enough, the dice becomes smooth and it will be fair. When too small, the dice develops edges, and is not guarenteed to be fair. 
- **Draw dice?**: Switches from showing the polar plot of $f(x)$ to the associated dice. 
