---
layout: project
title: Hyperbolic Flexors
date: 2024-01-03 16:03:47 -0500
categories: craft
tags:
  - craft
  - math-crafts-class
  - gallery
week: 3
image: /assets/crafts/flexors/gallery/thumbnail.jpg
summary: "*Craft:* Build flexible cardbord models of the hyperbolic, and see how they contort to fit into three dimensional space


*Math:* Examine the consequences of many hyperbolic verticies attached together. Look into the size and shape of a section of the hyperbolic plane."
pageHasContent: true
gallery-title: Hyperbolic flexors
gallery-folder: /assets/crafts/flexors/gallery
gallery-captions:
  - image: all_flexors
    title: "Hyperbolic flexors"
    caption: "Models of the hyperbolic plane made by taping together pieces of cardboard. These ones are arranged so that often, each vertex only has one bending degree of freedom. This makes them quite fun to play with. See the text for details"
  - image: flexor_4_8
    title: "The 8 square flexor"
    caption:  
  - image: flexor_6_6
    title: "The 6 hexagon flexor"
    caption:
  - image: flexor_3_7
    title: "The 7 triangle flexor"
    caption: |
      I put a few flexors together to form a small segment of the hyperbolic plane.
  - image: hanging
    title: "Many flexors, one plane"
    caption: |
      My entire class put their flexors together into one large model of the hyperbolic plane. It hangs above my desk in my office.
  - image: discrete
    title: "A discrete hyperbolic surface"
    caption: |
      Another mechagnism for forcing negative curvature. Imagine a grid of sticks, all rigid and the same length, with four sticks meeting at each joint. Constrain each joint so that the four sticks lie in the plain (I did this using the weird cardboard tubes). This forces the net of sticks to approximate a constant negative curvature surface.  
      
      This construction is called, creativly, a discrete surface with constant negative gaussian curvature. I learned about these from the paper [Discrete surfaces with constant negative gaussian curvature and the Hirota equattion](https://projecteuclid.org/journals/journal-of-differential-geometry/volume-43/issue-3/Discrete-surfaces-with-constant-negative-Gaussian-curvature-and-the-Hirota/10.4310/jdg/1214458324.full) by Alexander Bobenko and Ulrich Pinkall. This description of discrete negative curvature surfacecs is nice, because it inherets a discrete version of the integrable structure of continious constant negative curvature surfaces.
---

# summary
Last class we examined how different tilings can force nonzero curvature. Today we'll build a more robust model of a negatively curved surface using cardboard and tape. These make very nice twiddle toys, because the dihedreal angle between cardboard planes is flexible. By placing many hyperbolic vertices together, we will see how the hyperbolic plane contorts itself in three dimensional space.


# Activity

## Part 1: drawing the hyperbolic plane

From [Annie Perkins](https://arbitrarilyclose.com/2020/03/16/mathartchallenge-day-1-tons-of-triangles/): 
**Question:** On the blackboard, draw as manny connected triangles as you can, with seven edges at each vertex.  What do you notice happens? Could you keep going forever?

Here are my student's attempts. They quickly found that they ran out of room, and needed to curve or contort the lines to fit. No matter what, the couldn't keep going forever. 

<div class="text-center">
<img class="img-fluid" src="/assets/crafts/flexors/board1.jpeg" alt="a whiteboard full of attempted drawings of the hyperbolic tesselation" height="300" >
<img class="img-fluid" src="/assets/crafts/flexors/board2.jpeg" alt="another whiteboard full of attempted drawings of the hyperbolic tesselation" height="300" >
</div>

# Hyperbolic cardboard 


I saw this concept from [Daniel Piker's tweet](https://twitter.com/KangarooPhysics/status/1559961643903340545). I will reproduce his instructions here, because twitter is not very friendly for non-users. 

"Take 6 squares of stiff cardboard and tape them together along half the length of their edges. You can start with them flat and work your way round in a spiral. To make it a bit stronger, you can put tape on both sides of each hinge."
<div class="text-center">
<img src="/assets/crafts/flexors/diagram1.jpeg" alt="6 squares laying on top of one another in a spiral" height="300" >
</div>
"Once you get to the last one, to close the loop you need to arrange them in 3d so the inner opening forms a shape like a seat (if you join them in the other arrangement it will be rigid and not a mechanism). To tape this last pair, it can help to place them on the edge of a table"
<div class="text-center">
<img src="/assets/crafts/flexors/diagram2.jpeg" alt="6 squares, taped to form 3D hexagon." height="300" class="img-fluid" >
</div>

The resulting shape is a great fidget toy, because it has one degree of freedom. By bending any one pair of cardboard squares together, the entire mechanism flexes in unison. I will call this construction a "hyperbolic flexor". They can be extended in several ways.
- You can put more squares around in a spiral before closing it up
- You can use different shapes than squares.
- You can attach multiple flexors together. 

For my class, I cut out many copies of equilateral triangles and squares out of cardboard. For your convenience, here is a template I used for [triangles](/assets/crafts/flexors/triangle grid.pdf) and [squares](/assets/crafts/flexors/square grid.pdf).  Then I had people try to build different flexors. Using the rules above, you should be able to construct a flexor for every pair $(n,m)$, where $n$ is the number of sides in your shape, and $m$ is the number of shapes used to construct the flexor. I had the students analyze:
- What is the number of degrees of freedom of the mechanism?
- Is this spherical, flat, or hyperbolic?

I made sure the students made:
- 6 square flexors
- 7 triangle flexors

and then I let them try some others. Here are some examples of my own. :

| <img src="/assets/crafts/flexors/flexor_4_8.jpeg" alt=" " height="300" >|
| -- |
|A flexor with eight squares | 


|<img src="/assets/crafts/flexors/flexor_6_6.jpeg" alt="" height="300" >|
| -- |
|A flexor with six hexagons | 

|<img src="/assets/crafts/flexors/flexor_3_7.jpeg" alt="" height="300" >|
| -- |
| Four flexors together, 7 triangles each. Notice how it contorts into the familiar saddle shape of hyperbolic space.| 




### Multiple flexors together
Next we put multiple flexors together. Here are 4 six-fold square flexors, all sharing a single square. Notice how the full object still has one degrees of freedom. 

<div class="text-center mb-4">
<video class="img-fluid"
		style="max-height: 70vh; width: auto;"
		preload 
		muted 
		controls>
    <source src="/assets/crafts/flexors/flexing.mp4" type="video/mp4"/>
</video></div>

Then, I had the class put all the flexors together into one, giant flexor.  

| <img src="/assets/crafts/flexors/triangles.jpeg" alt=" " height="300" >|
| -- |
|A massive hyperbolic plane, made out of triangular flexors | 


|<img src="/assets/crafts/flexors/squares.jpeg" alt="" height="300" >|
| -- |
|A massive hyperbolic plane, made out of square flexors | 

Hypothetically, these are still one degree of freedom, so flexing any two cardboard pieces makes the whole thing move in unison. in reality, cardboard is flexible, and these objects are quite wiggly. Still, they make good office decour.

<img src="/assets/crafts/flexors/gallery/hanging.jpeg" alt="" height="300" >



