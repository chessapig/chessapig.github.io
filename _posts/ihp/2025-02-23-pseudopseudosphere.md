---
layout: project
title: A pseudopseudosphere
date: 2026-02-16 16:03:47 -0500
categories: ihp
tags:
  - craft
  - ihp
image: /assets/ihp/shapes/gallery/pseudosphere.jpeg
summary: A paper construction of a pseudosphere, with a tilt.
pageHasContent: true
---

First build many cones of the same radius but different cone angles.  These are all rolled up from circles of the same radius.

<div class="card my-4 shadow-sm" style="max-width: 600px; margin: auto;">
  <img src="/assets/ihp/pseudosphere/unstacked.jpeg" alt="A bunch of paper cones of different slope" class="card-img-top" >

  <div class="card-body text-center">
	   <h5 class="card-title"> Protopesudosphere </h5>
    <p class="card-text"> All my cones, ready to be stacked.
    </p>
  </div>
</div>

Then, stack them in order of angle

<div class="card my-4 shadow-sm" style="max-width: 400px; margin: auto;">
  <img src="/assets/ihp/pseudosphere/straight.jpeg" alt="A pseudosphere assembled out of paper" class="card-img-top" >

  <div class="card-body text-center">
	  <h5 class="card-title"> Pseudosphere </h5>
    <p class="card-text"> All my cones, having been stacked
    </p>
  </div>
</div>
The result is a quick and large pseudosphere. This one took about 45 minutes, and is larger than one you can make on a standard 3D printer.

 This works because In the limit of many cones, the cross section is a tractrix. The resulting shape is the surface of revolution of a tractrix, which so happens to have constant negative curvature! I learned about this from Fran Herr, who says it goes back to Thurston (like all good things). This method parralelizes well, because you don't have to plan out the cones ahead of time.  It just works.

I was lazy in my pseudosphere construction, and skipped sturdily taping all the cones together. Instead, I snipped off holes in the top, and stacked them on a rod.  Now we can play with it!
<div class="card my-4 shadow-sm" style="max-width: 400px; margin: auto;">
	<div centering>
	<video class="w-100" preload muted controls>
	    <source src="/assets/ihp/pseudosphere/stick.mp4" type="video/mp4"/>
	</video></div>

  <div class="card-body text-center">
	  <p class="card-text"> Driving my pseudopseudosphere
    </p>
  </div>
</div>

I call it my stick shift. The tilted version is not a pseudosphere -- you can see there is more curvature on one side and less on the other. This is a pseudopseudosphere. I wonder if there's a constant negative curvature surface with the same asymptotics as the pseudopseudosphere. I want a circular boundary on one end, and a cusp asymptotically approaching a tilted line on the other.

For more on coaxing paper to be hyperbolic, see [the hyerpbolic pinata](/ihp/straws)