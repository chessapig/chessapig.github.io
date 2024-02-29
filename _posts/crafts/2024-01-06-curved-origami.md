---
layout: project
title: Can you make a paper sphere? 
date: 2024-01-06 16:03:47 -0500
categories: craft
tags:
  - craft
  - math-crafts-class
week: 6
image: /assets/crafts/curved origami/venus.jpeg
summary: "*Craft:* Create origami with curved creases, and see what sorts of forms we can make. Can we fold a sphere? How close can we get?


*Math:* Introduce gaussian curvature. The curved origami produces developable surfaces, which are surfaces with zero gaussian curvature. Examine the possible forms of these developable surfaces."
pageHasContent: true
---

The attached picture is a model of the Vesica Piscis. See [klara mundilova's page](https://klaramundilova.com/projects/vesica-piscis/) for the mathematics of folding the vesica piscis. 

**Page under construction, need to link images and files**

Can you make a paper sphere?
# Summary
Last time we learned about gaussian curvature, using an origami model of a hyperboloid. Today, we will examine surfaces of gaussian curvature zero. Even with this strict requirement, if we put together multiple such surfaces, we can make beautiful geometric shapes. We will make the origami model of the Vesica piscis, and construct sphericons and hexasphericons. 

![[everyone.jpeg]]

### Materials and setup
 Each student will need:
 - A collection of curved origami templates. I gave each students the following: 
	- 1 [[venus piscus template.jpg]], printed on construction paper.
	- 1 [sphericon template](sphericon 1.gif), printed on cardstock. 
	- Some scrap printer paper
- A box cutter 
- access to tape and yarn (or any form of String)
Have extra of each template for the whole class, in case people mess up. For a class of 12, I printed 18 of each template. I also included a few printed templates of other types of curved origami (see the gallary below), to give to people who need something to do.






# Activity

>[!tip] Use in art 
>Developable surfaces are used widely in the architecture of Frank Gehry. Here is a picture of the Walt Disney concert hall in LA 
>![[ghery.jpeg]]
>All the curved walls are developable surfaces, made out of sheet metal. From a practical standpoint, developable surfaces are easy to construct, because they can be made fabricated flat and only curved later. Artistically, Ghery was fascinated by the idea of evoking motion in architecture. Developable surface are surfaces of motion, made from sweeping a line thru space.  To read more, see [Developable Surfaces: Their History and Application](https://link.springer.com/article/10.1007/s00004-011-0087-z) by Snežana Lawrence. 
## Part 0:  The theorem Egregium

**Question:** Can you make a paper sphere? Can you do it without crumpling or layering the paper on top of itself?

*Give them 15 minutes to try this. *


**Question:**  
1. wrap a piece of paper into a small tube. Draw the directions of principal curvatures on the tube. What are their curvatures? What is the gaussian curvature?
2. What happens when you bend the tube? does the bend change the gaussian curvature? Is the rolled up paper easier or harder to bend than flat paper?
3. Can you ever bend a sheet of paper, without folding or creasing, and get a point of nonzero gaussian curvature? 

> **Answer:** 
> 1. One of the principal directions is a line  along the length of the tube, while the other is a circular cross-section of the tube. The circle has positive curvature, while the line has zero curvature. The Gaussian curvature, the product of the two, is zero. ![[gaussian.jpeg]]
> 2. The tube does not want to bend (it's much harder than an ordinary sheet of paper). When it does bend, it does so by crumpling. It folds along a line, which is straight in 3 dimensional space, so the cylinder still has zero gaussian curvature. Only the corners of the crease can possibly have gaussian curvature, but curvature is not defined there. 
> 3. No matter what else you do, you can't achieve nonzero gaussian curvature. This is due to the *theorem egregium*, see below.



>[!tip] Gauss's Theorem egregium
> Paper is fine with bending, but it doesn't like to stretch. This forces any bent sheet of paper to have gaussian curvature zero. That is, it is impossible to make any point on a sheet of paper have nonzero gaussian curvature, without folding or tearing. Let's imagine trying to make a saddle point. First you would bend the paper into a $U$ shape, making the top half of the saddle. To make the other half of the saddle, you need to bend the direction perindicular to the first direction downwards. But, this forces the top part of the $U$ to be longer than the bottom part.  Since the paper dosen't want to stretch, it doesn't let you bend transversely to the $U$. This forces the gaussian curvature to be zero. 
> 
> This phemonena gives an extra rigidity to bent things. This is why cardboard is corrogated: Shaped like a long series of $u$ s and $n$s, it is very hard to bend against the grain. More personally, have you ever tried to eat a slice of pizza without the tip drooping down? I always bend the crust, forcing the tip to stick out. If the tip could droop down, it would need to tear the pizza apart. 
> 
> This is a Gauss's theorem egregium. Whenever a surface lives in $\RR^3$, imagine how it looks to an ant crawling along it. There would be an way for the ant to measure angles and lengths along the surface. We call this the *induced metric*. The different ways to contort a sheet of paper to fit in 3Dspace are called immersions, and they are the surfaces where the induced metric equals the measurement of lengths and angles on the flat sheet of paper. To the ant, they all look the same. 
> 
> Gauss's Theorem Egregium (the remarkable theorem, in latin) says that any two surfaces in $\RR^3$ with the same induced metric must have the same gaussian curvature. In other words, gaussian curvature doesn't change as you bend the paper. If you could make hyperbolic paper, every way you'd sit it in 3D space would have the same gaussian curvature. It's an entirely intrinsic thing. The definition of gaussian curvature looks very dependent on how the surface sits in space. But, remarkably, it isn't. Hence, Gauss's "remarkable theorem".

## Part 1:  Developable surfaces 
### Instructions: Venus piscus
 1. First print out the [[venus piscus template.jpg]]. I used construction paper, because it's easy to crease. For something studier, printer paper or (ideally) cardstock work wonders.
 2. cut out the outside. It should look something like this (without the lines)
![[piscus flat.jpeg]]
3. Score along the inside lines using a box cutter. It is very important that you don't go all the way through the paper. For construction paper and printer paper, you can just drag the box cutter along, applying no force except that of gravity. Try to have no sharp turns in your cut.
4. Bend along the two inside scores, both valley folds. Holding the two horn-looking parts together with your Fingers, you should get something like below. ![[piscus folded.jpeg]]
5. Lay it flat. Cut a small slit in the tip and bottom, there the two halfs of the venn diagram meet togeher.
6.  On the back, tape a piece of string to the inside, like below. ![[string.jpeg]]
7. Wrapping the string around the inner lens shape, pulling it tight through the slits, it can hold the horns together at any distance you want. Set the distance such that the two clamshells just meet together, then tie the string sting. It will look like the folded picture above. 

**Question:**  
1. What happens when you fold the Viscus Piscus? Can you describe what shapes it forms?
2. How do the shapes change when you  pull the two horns closer and farther apart?

**Answer:** 
1. The inside part becomes like a part of a cylinder: If you look at the inside part in profile, it is a single curve extruded along a direction in space. The outer "clamshell" parts look like sections of a cone. 
2. As you pull the horns closer together, the fold angle at the creases increases. The cylinder and the cones become more curved, and the outside border folds inwards towards itself. Pull the horns close enough together, and the two outer border components will meet continuously. 


**Question:** 
1. For a point on the Vesica piscis, draw the two principal curvature directions, and say the gaussian curvature. Choose one point on the inner lens, and one point on one of the clamshells.
2. Find the tangent plane for that point (For example, by holding up a flat sheet of paper, or by placing it on the table). Where does the tangent plane intersect the surface? How does this intersection relate to the directions of principal curvature you've found above?

**Answer:** 
1. Just like the cylinder above, one of the principal directions is flat and the other is positively/negatively curved. Either way, the gaussian curvature is zero. This is true for both the lens and the clamshell.
2. The tangent plane to these points itersects the surface along an entire line. This is unexpected: Usually, a tangent plane at a point only (locally) intersects the surface at just that point. This line is exactly in the direction of principal curvature with curvature 0.

**Question:** 
1. In the above question, you should have found that the tangent plane intersects with the Vesica piscis in a line. We call these the "ruling lines" of curved origami. Try to draw a few more of these lines. It doesn't matter if you're not exact, just try get a sense of how they look. 
2.  How are the ruling lines arranged on the inner lens? If you continued them forever in space, would they ever hit eachother? What about on the clamshell parts? How does this change when vesica pisces is more and less folded?

**Answer:** 
1. It will look like this:  ![[piscus folded 1.jpeg]]
2. The lines in the inner part are all parralel. The lines in the outer part all seem to converge at a single point.  This persists even when the vesica pisces is unfolded, but the point of convergence for each half of the clam move together.


**Question (optional)** Unfold the Vesica piscis flat. What do your drawn ruling lines look like? How do they bend when they cross a crease?

**Answer:** It will look like this: ![[piscus flat.jpeg]] The ruling lines "reflect" across a crease, meaning the incoming angle and outgoing angle are the same  (see top left). This condition ensures that the fold angle along the crease is constant, see the paper [More on paperfolding](http://geofhagopian.net/MAA/fuchs_MoreOnPaperFolding.pdf) by Fuchs and Tabachnikov (This paper is funny to me, because its by two symplectic geometers/mathematical physicists, which is what I am. Different background than all the other origami papers I've seen.) In general it is possible to have the rulings cross creases with different angles, but not so with the Vesica piscis. 
### Lesson: Types of developable surfaces.
We have seen that curved crease origami produces a patchwork of surfaces with gaussian curvature zero, which we call developable surfaces. To understand developable surfaces, we look at the directions of zero curvature at each point. These connect together into straight lines in 3 dimensional space. So, the surface is traced out by a collection of lines in 3 dimensional space. We call these *Ruled surfaces*. Not all ruled surfaces are developable (we'll see this later!), but all developable surfaces are ruled.

There are 3 types of developable surfaces, determined by what happens if you extend the ruling lines from the origami out into space. The possibilities are:

1. All ruling lines are parallel. This is called a *Cylinder*. This means the surface is extruded from a 1D curve in 2 dimensions (For our definition, we don't need the base to be a circle. Polyhedral prisms are, technically, cylinders too)
2. All ruling lines meet at a point. we call this a *cone*. For example, the top and bottom clamshells of the vesica pisces are parts of cones. To visualize this, I taped skewers to the outside  ring of the flat vesica, all meeting at the center. These are our ruling lines. ![[rulings.jpeg]]
   After folding, this is what happens:![[rulings folded.jpeg]]The rulings really do all meet at the same point! The two halfs meet at different points, so belong to different cones.
3. The last type are called *Tangent developables*. These ruling lines are all tangent to a curve in 3 dimensional space.  We get this type of developable surface whenever two of the ruling lines are skew. Tangent developables can be hard to realize in curved origami. Here is an example: I cut out a spiral shape from a piece of paper:![[tangent flat.jpeg]]The marked lines will be the ruling lines. These are all tangent to the inside spiral. This is pretty boring example of a tangent developable, since it is well and truly flat. If you pick it up and try to straighten out the inside spiral, then the ruling will still be tangent to the new curve, but you get a pretty helix. ![[tangent.jpeg]]


## Part 2: Rolling developable surfaces
On a developable surface, every tangent plane intersects the surface along a line. Practically speaking, if you place a developable surface on the table, then it will lie along that line. It also will never balance, always able to roll to the next ruling line. By cutting up paper, we can make some objects which roll in a truely weird way. These are called *sphericons*.

Print out the sphericon template (from [here](https://etc.usf.edu/clipart/43500/43502/sphericon-tp_43502.htm)) on cardstock (This one wants to be sturdy). Then,  cut it out, fold it up, and tape up the edges. 
![[sphericon 1.gif]]

**Question:** 
1. push the sphericon gently along the table, so it can roll without sliding. What path does it take?
2. Take an uncut copy of the sphericon template and lay it on the table. Align the sphericon with the template so that the rolling path exactly lines up with the template. Why is this possible??

**Answer:** 
1. It will roll in a wobbly lines
2. To line it up, the best way is to find a seam between 2 corners of the sphericon. Align this with one of the seams on the template, and push it along. They should match up. This works because the shape of the sphericon is exactly the rolled up template.   the path traced by a rolling sphericon is the unrolled sphericon, which is the template.

**Question:** 
1. What is the gaussian curvature of the sphericons? what are the principle directions? What are the ruling lines?  Draw these on the sphericon and the template. Which type of developable surface is it?
2. How would you make a sphericon from 2 cones?

**Answer:** 
1. As usual, the gaussian curvature is zero. The principle direction of zero curvature (the ruling lines) are rays emminating from one of the 4 corners. These correspond to radial lines on the templace. Since they meet at a point in space, Each part is a cone developable surface.
2. Take two cones, and place them end to end. Then, slice vertically. This will give a square cross-section. Rotate by 90 degrees, and reattach. This will give the sphericon. Alternatively, we can cut the cones into half cones, then assemble them according to the associated type of the ruling lines. See this picture, from [here](https://link.springer.com/chapter/10.1007/978-3-642-22571-0_4)![[sphericon decomp.png]]


**Question:** This sphericon looks quite a lot like a paper sphere. But, spheres have positive curvature, and sphericon zero curvature everywhere. How is this possible? Where is the curvature hiding?

**Answer:** This is a tricky question. It's hiding in 2 places. First, the tips of the cones have some ammount of angle curvature, but not enough to account for all $4 \pi$ necessary angle defect. The rest lies in 

Next, we can use the same design principles for a different shape. Start with a hexagon. Form its surface of revolution, thru an axis connecting two verticies. Cut this in half, revealing a hexagonal cross-section. Reattach the two halfs with a 60 degree twist. The resulting shape is the *hexasphericon*. Here's a model I found online that emphasizes the two halfs:
![[hexaspheracon product.jpeg]]
as expected, this is a developable surface. It also rolls in a weird path like the normal sphericon. We can repoduce it out of paper if we know the path. Here's [the template](hexasphericon.gif). Two of these end-to-end give the full path. Wrapping it up into a ball, we get a paper model: ![[hexasphericon.jpeg]]
After all our work, we have succeeded in making something very close to a paper sphere.
# Gallery:
Here are some other curved origami designs I found. If you want to explore more, these are a good place to start.

**Apricot flower:**  I recommend starting with this one. Its a very good combination of pretty and not too hard to fold (especially if you use large paper). Design and [Template](sphere.pdf) from [3D Origami art](https://mitani.cs.tsukuba.ac.jp/book/3d_origami_art/index.html) by Jun Mitani. 
![[bud 1.jpeg]]
![[bud 2.jpeg]]

**Egg:** This one is also pretty forgiving. Design and [Template](bud.jpg) by Jeannine Mosely. 
![[egg.jpeg]]

**Rotating star:**  Design from [Curved-Folding Origami Design] by Jun Mitani. [Template](star.pdf) from [Origami simulator](https://origamisimulator.org/)
![[star.jpeg]]

**Hoffman tower:** Design due to David Huffman. For details on his techniques in curve folding, and more examples of his designs, see [Reconstructing David Huffman’s Legacy in Curved-Crease Folding](https://erikdemaine.org/papers/Huffman_Origami5/paper.pdf), by Demaine, Demaine, and Koschitz.  [Template](huffmann tower.png) from [Origami simulator](https://origamisimulator.org/). 
![[tower.jpeg]]

**Paper sphere, 16 folds:** This one needs glue to hold together. It does not work with just tape. I'd recommend starting with the 8-fold version instead. This one is interesting, because you can change the profile of the curved crease in the design to get any suface of revolution. In 3D origami art, Jun Mitani also shows off a pear shape and a waterwheel (which I would call a hyperboloid). Design and [Template](sphere.pdf) from [3D Origami art](https://mitani.cs.tsukuba.ac.jp/book/3d_origami_art/index.html) by Jun Mitani. 
![[ball.jpeg]]

**Vortex:** a tessellation of 4-fold buds (like the apricot bud above). This is real hard to fold. Design and [Template](vortex.png) from [3D Origami art](https://mitani.cs.tsukuba.ac.jp/book/3d_origami_art/index.html) by Jun Mitani. 
![[vortex.jpeg]]
