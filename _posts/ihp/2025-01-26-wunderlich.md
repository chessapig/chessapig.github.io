---
layout: project
title: Wunderlich's web
date: 2026-01-26 16:03:47 -0500
categories: ihp
tags:
  - craft
  - ihp
image: /assets/ihp/wunderlich/pseudosphere.jpeg
summary: A discrete model of a surface of constant negative curvature. This manifests Hilbert's proof that there is no complete, immersed hyperbolic plane in Euclidean 3-space
pageHasContent: true
---
*Joint work with Chaim Goodman-Strauss and Henry Segerman*

Start with a grid of sticks living in three dimensional space, with four sticks hinged at each point. Then enforce these two constraints:
1.  (Equal length) The four sticks around each square of the grid are the same length
2. (Planarity) The four sticks meeting at each vertex are planar. 

Here's the one grid satisfying the constraints:
<div class="card my-4 shadow-sm" style="max-width: 600px; margin: auto;">
  <img src="/assets/ihp/wunderlich/twisty1.jpeg" alt="A black 3D printed figure, forming a grid in three dimensional space. The grid is bending all crazy" class="card-img-top" >

  <div class="card-body text-center">
    <h5 class="card-title"> Wunderlich's web</h5>
  </div>
</div>
It turns out, the constraints force the grid to approximate a surface with *Constant negative curvature*. (In the lingo, a surface of constant negative curvature is called a "pseudosphere". The standard pseudosphere is only one type of pseudosphere) This was discovered by Wunderlich in his 1950s paper (LINK PAPER HERE) (In german). The paper is inspiring combination of pure and applied math. It draws from the literature studying the shape of fishing nets in the current, and includes a diagram of a physical steel sculpture Wunderlich had made. 


Wunderlich's mechanism for enforcing negative curvature is unusual. In the 21st century, we are awash in ways to hold a hyperbolic plane. Hyperbolic crochet relies on adding extra length compared to euclidean space. Piecing together [right angled pentagons](/ihp/straws) creates the hyperbolic plane by adding extra angle. Both of these techniques enforce an intrinsic metric, and let gauss's theorem egregium deal with the embedding into 3-space. 

Wunderlich's web works extrinsically. Imagine the surface stretched along the discrete grid. Due to the planarity constraint, we can define the "tangent plane" at a vertex as the unique plane passing though all sticks adjacent to the vertex. This gives a well-defined normal vector at each vertex. Our proxy for curvature will be the torsion, the angle between the normal vectors of adjacent vertices. Imposing equal lengths forces constant torsion, so the angle between adjacent normals is the same everywhere on the grid.  This unlocks negative curvature. 

Let's do an example. The simplest way to have planar vertices and equal lengths is to make a square grid in the plane... but it isn't particularly negatively curved. 
<div class="card my-4 shadow-sm" style="max-width: 400px; margin: auto;">
  <img src="/assets/ihp/wunderlich/mockup_flat.jpeg" alt="a cardboard and wooden skewer model of 4 units of the grid. It lays flat in the plane" class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text"> A planar configuration satisfying Wunderlich's constraints. It's not very exciting. (This was a cardboard mockup I made a while ago)
    </p>
  </div>
</div>
Then you pick it up, and twist two opposite vertex planes relative to one another. This forces half the corners to pop up and the other half to pop down, like a Pringle. This is our negative curvature! Moreover, this twists the other two vertices, demonstrating the constant torsion.
<div class="card my-4 shadow-sm" style="max-width: 400px; margin: auto;">
  <img src="/assets/ihp/wunderlich/mockup_twisty_1.jpeg" alt="The same mockup as before, with two outside edges twisted." class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text"> A nonplanar configuration satisfying our constraints. 
    </p>
  </div>
</div>

The most interesting thing about this surface is that the curvature is constant in space, but not in time. The same mechanism can make a flat plane and a standard pseudosphere! In fact, this device can conform to any$^\ast$  pseudosphere.  
<div class="card my-4 shadow-sm" style="max-width: 400px; margin: auto;">
  <img src="/assets/ihp/wunderlich/pseudosphere.jpeg" alt="a 3 by 3 patch of the 3D printed surface, lying on a pseudosphere. " class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text"> A portion of Wunderlich's conforming to a standard pseudosphere.
    </p>
  </div>
</div>
In the rest of this page, I want to explain the math behind this object. In the following sections I'll explain
1. Why the mechanism forces constant torsion
2. How we constructed this device
3.  Why constant torsion approximates a pseudosphere
4. How Wunderlich's web proves Hilbert's theorem: There are no complete imbedded hyperbolic planes in $\RR^3$. 

## Constant torsion
In this section, I'll explain why any grid with equal lengths and planar verticies has constant torsion.   let's look at the atomic unit of this grid, consisting of four sticks arranged in a loop. I will call this a "tessera:. The equal length condition implies this tessera forms an equilateral quadrilateral. If the tessera lay in a plane, then it would be a parallelogram. In 3 space, we can fold this parallelogram along one diagonal, as pictured below.
<div class="card my-4 shadow-sm" style="max-width: 400px; margin: auto;">
  <img src="/assets/ihp/wunderlich/figures/equilateral.jpeg" alt="An equilateral quadrelatrial standing on its feet, with its verticies roughly arranged in a tetrahedron" class="card-img-top" >

  <div class="card-body text-center">
    <h5 class="card-title"> Equilateral quadrilateral in 3-space</h5>
  </div>
</div>

Consider the torsion of, say, the left most edge. This measures the angle between the plane spanned by the left most vertex and bottom most vertex. We will compare this to the torsion along the other four edges
<div class="card my-4 shadow-sm" style="max-width: 400px; margin: auto;">
  <img src="/assets/ihp/wunderlich/figures/torsion.jpeg" alt="An equilateral quadrelatrial standing on its feet,  with normal vectors and planes marked for two of the verticies. Their angle is measured and labeled tau." class="card-img-top" >

  <div class="card-body text-center">
    <h5 class="card-title">Torsion of an equilateral quadrilateral</h5>
  </div>
</div>

To do this, we need that each edge is the same length. Then, we can exploit symmetry! If all edges are the same, then the quadrilateral has two mirror symmetries in three dimensional space. The planes of reflection contains one of the diagonals, and is the perpendicular to the other. 
<div class="card my-4 shadow-sm" style="max-width: 400px; margin: auto;">
  <img src="/assets/ihp/wunderlich/figures/symmetries.jpeg" alt="the same quadrelateral as above, with mirror planes passing through each oppisite pair of verticies" class="card-img-top" >

  <div class="card-body text-center">
    <h5 class="card-title"> Symmetry planes of an equilateral quadrilateral</h5>
  </div>
</div>
Therefore, reflecting the planes about, we can compute the torsion along each edge of the square. If the torsion along one edge has angle $\tau$, then the other edges are either $\tau$ or $-\tau$. 

<div class="card my-4 shadow-sm" style="max-width: 500px; margin: auto;">
  <img src="/assets/ihp/wunderlich/figures/torsion_tessera.jpeg" alt="on the equilateral quadralateral, the torsion along every other edge is +tau or -tau" class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text"> The torsion angles are either $+\tau$ or $-\tau$, depending on how many reflections are needed to get to your edge from your starting edge.
    </p>
  </div>
</div>

Now imagine a whole grid of equilateral quadrilaterals with planar vertices. The planarity of the vertices implies the torsion along an edge is the same for adjacent tessera, and the equilateral condition implies the torsion is constant on each tessera. The value of $\tau$ propagates across the whole grid, implying constant torsion. 

<div class="card my-4 shadow-sm" style="max-width: 500px; margin: auto;">
  <img src="/assets/ihp/wunderlich/figures/grid_torsion.jpeg" alt="A twisted grid of two colors. one direction is green, the other red. THe greed direction is labeled -tau, while red is labeled +tau" class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text"> The torsion propegates along the grid. the "waft" has torsion $+\tau$, while the "wheft" has torsion $-\tau$. 
    </p>
  </div>
</div>

Look along one of the lines of the grid in the final model, and you can see the constant twisting. Notice how there seems to be a spiral staircase around a central axis.
<div class="card my-4 shadow-sm" style="max-width: 600px; margin: auto;">
  <img src="/assets/ihp/wunderlich/twisty2.jpeg" alt="A black 3D printed figure, forming a grid in three dimensional space. We are looking along one of the lines of the grid. The oppisite direction has lines winding around the grid in a spiral" class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text"> A spiral staircase around a line of the grid, demonstrating constant torsion. 
    </p>
  </div>
</div>

## Construction
Now is a good time to describe how we made our rendition of Wunderlich's web. Let's review our requirements, and how we might implement them
1.  Equal lengths. This is easy. We assemble our grid out of sticks, and make each stick the same length.
2. Planar vertices. The easiest way is by having each stick terminate in a flat piece with a hole, then connect the 4 sticks at a vertex with a nut and bolt. If the nut isn't too tight, this works as a hinge
To satisfy just these two conditions, we could take a piece of metal with holes in either end, with a fixed twist of angle $\tau$ between the two holes. Assemble many of these into a grid, and we will get a grid approximating a pseduosphere.  This was the technique Wunderlich described in his paper.
<div class="card my-4 shadow-sm" style="max-width: 300px; margin: auto;">
  <img src="/assets/ihp/wunderlich/figures/link.png" alt="An elongated circle, with two small circles in each end." class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text">  Fundamental unit, for fixed torsion.
    </p>
  </div>
</div>
This solution doesn't make me so happy, because it constrains $\tau$. What if the torsion $\tau$ could vary? This is tricky, as we want a twist without any bend. The solution (proposed and designed by Henry Segerman) was to put a hinge in the middle of each piece. Our edge units were 3D printed in two parts. Each half had a hole for one vertex of an edge. Then, the halfs were connected with a bolt that allowed torsional twisting.  The differing heights of each end is some cleverness to ensure that the torsional bolts were all in the same plane.

<div class="card my-4 shadow-sm" style="max-width: 600px; margin: auto;">
  <img src="/assets/ihp/wunderlich/units.jpeg" alt="three black edges of the grid. There is metal hinge in the middle" class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text">  Our fundamental unit. 
    </p>
  </div>
</div>

With the units printed, its time to clock in to the [shape factory](/ihp/shape). Several hours of fiddling with screws, and we have a big sheet of the stuff!
 
<div class="card my-4 shadow-sm" style="max-width: 600px; margin: auto;">
  <img src="/assets/ihp/wunderlich/progress.jpeg" alt="a picture of a work table. At the bottom, an in progress grid. At the top, many fundamental untis ready to use" class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text">  Wunderlich's web, mid assembly
    </p>
  </div>
</div>

These units help us visualize the torsion. First, the screws for each vertex are pointing in the normal direction. Second, the angle of the hinge along an edge is exactly the torsion along that edge. Visually inspecting the device, you can see that the torsion angles are constant throughout the sheet. It's nice to experimentally verify our math.

## Dressing a Pseudosphere
Hopefully I've convinced you that this plastic monstrosity produces things with constant torsion. But what does that have to do with pseudospheres?  Here's a picture of the normal vectors of a pseudosphere. Notice how they twist at a constant rate? It's a good sign

<div class="card my-4 shadow-sm" style="max-width: 600px; margin: auto;">
  <img src="/assets/ihp/normals/asymptotic.jpeg" alt="A close up shot of many red straws pointing out of a saddle like surface. We are looking down a tunnel, as the straws turn around us." class="card-img-top" >

  <div class="card-body text-center">
	  <h5 class="card-title">Normals to a pseudosphere</h5>
    <p class="card-text">  The normals twist as we move along the surface. I also made this device during the trimester, see my page on [normals](/ihp/normals)
    </p>
  </div>
</div>

Our approach will be to "dress" a pseudosphere, by finding a grid lying on it which satisfies Wunderlich's condition. Indeed, this corner of differential geometry originated from dressmaking. In the late 1800s, Chebyshev needed cash, so he did a lot of consultancy work. While obsessing over these non-mathematical problems, Chebyshev discovered several deep mathematical results. For example, Chebyshev polynomials were born from his work on linkage design, which were used in steam engines.

Our story starts when a dressmaking company hires Chebyshev. They wanted him to optimize their clothing patterns to use less cloth. Chebyshev interpreted that to mean, "how does cloth drape over an arbitrary surface"? Cloth is woven, so up close it looks like a tiny grid made of tiny squares. The angle between the two threads may change, but the spacing is constant. Chebyshev studied infinitesimal grids on surfaces with equal spacings, now called "Chebyshev nets". He got so excited by the differential geometry of cloth that he never finished his dressmaking.

Imagine that we didn't constrain each vertex to be planar, leaving us with a very floppy equilateral grid. We could drape a grid over any surface we'd like, positive or negative curvature. If we additionally impose that each vertex is planar, then it constrains the geometry of the chebyshev net. In particular, all adjacent vertices like in the tangent plane to that vertex. 

Making our grid finer and finer, we can think of the edges as tangent vectors, living in the tangent plane of a vertex. The planarity condition implies that the edge vectors must live in the (tangent space of) the intersection of the surface and its tangent plane. Indeed, any other direction would cause the adjacent vertex to bend away from the tangent plane, violating planarity!   The directions in the tangent space with this property are called the *asymptotic directions*, and a curve which is everywhere moving in an asymptotic direction is called an *asymptotic line*.
<div class="card my-4 shadow-sm" style="max-width: 600px; margin: auto;">
  <img src="/assets/ihp/wunderlich/figures/asymptotic.jpeg" alt="A saddle shape cut with a tangent plane" class="card-img-top" >

  <div class="card-body text-center">
    <h5 class="card-title"> Asymptotic directions</h5>
    <p class="card-text">  Intersect your surface with a tangent plane. If the surface is negatively curved, the intersection will form an X shape. the two tangent directions of the X are the asymptotic directions. 
    </p>
  </div>
</div>

Notice that asymptotic lines only exist when the surface looks like a saddle or a plane, i.e the curvature is $\leq 0$. You can experimentally find the asymptotic directions by holding a pencil to the surface. Rotating around the tangency point, the pencil will eventually collide with the surface. This direction is the asymptotic direction. Rotating the other way, you can find the other asymptotic direction. There are always 2 asymptotic directions through every point with negative curvature. 

<div class="card my-4 shadow-sm" style="max-width: 600px; margin: auto;">
  <img src="/assets/ihp/wunderlich/figures/pencil.jpeg" alt="A saddle shape with a pencil on top. It lies tangent to the surface, facing along an asymptotic line." class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text"> Find an asymptotic line with a pencil
    </p>
  </div>
</div>

All together, Wunderlich's web is a discrete approximation to a Chebyshev net (equal length constraint), such that every grid line is an asymptotic line (planar constraint).  In the infinitesimal world, the torsion is the rate of change of the normal vector as you walk along a curve. By our derivation in the first section, the torsion for this chebyshev net is constant.  But, we can compute the curvature of a surface from the torsion of an asymptotic line! 
Therefore, constant torsion implies constant negative curvature, and Wunderlich's web has constant negative curvature.

To see the curvature from the torsion, we model a surface locally as a spiral staircase. Every nonpositive curvature surface is (to second order) a quadratic surface. For a quadratic, the asymptotic lines are actually lines in $\RR^3$. The two sets of asymptotic lines make the quadratic a doubly ruled surface. Along one asymptotic line, the other lines are arranged in a "spiral staircase" rotating around the given line. The normal vectors rotate at the same rate as these lines. Spin the lines around faster, and get a larger gaussian curvature. I imagine we can make this argument precise if need be.

<div class="card my-4 shadow-sm" style="max-width: 400px; margin: auto;">
  <img src="/assets/crafts/baubles/diagram.jpg" alt="a single line passing through 3 other lines. The three lines seem to lie on a surface, while the 1 line pierces them." class="card-img-top" >

  <div class="card-body text-center">
    <p class="card-text"> the staircase model of a negatively curved surface.
    </p>
  </div>
</div>


## Hilbert's hyperbolic immersion theorem
Hilbert proved that there is no complete, twice differentiable immersion of a hyperbolic plane into $\RR^3$. Let's unpack these words
- Immersion: The hyperbolic plane may intersect itself, but it can't have any kinks. The derivative is everywhere defined
- Complete: An embedding is complete if it is defined on the entire hyperbolic plane.
- Twice differentiable: This is a hint that the proof relies on curvature, whose definition uses two derivatives. Nash proved later that you can embed a complete hyperbolic plane with only one derivative.

You can embed patches of the hyperbolic plane, see your favorite pseudosphere. Hilbert's theorem states that if you grow your hyperbolic patch, it will always develop a singularity. For example, think of the circle at the bottom of a standard pseudosphere, which is not differentiable. This won't surprise anyone whose made a model of the hyperbolic plane. If you have enough patience to continue out 4 or 5 layers, the object will invariably not want to exist. (Think hyperbolic crochet, weaving, etc) The internal stresses get too high. 

Hilberts theorem is somewhat subtle. You can embed patches of arbitrarly large area, by modifying the standard pseudospere. Yet, no individual embedding is complete. 


DISCUSS ASYMPTOTIC  LINES  AND WHAT THEY LOOK LIKE (THEY CRASH INTO THEMSEVES)
SAY HOW ASYMPTOTIC LIENS CRASHING IMPLIES ITS NOT AN EMBEDDING
ADD LINKS TO CHEBYSHEV AND WUNDERLICH PAPER