---
layout: project
title: Hyperbolic origami
date: 2024-01-06 16:03:47 -0500
categories: craft
tags:
  - craft
  - math-crafts-class
week: 6
image: /assets/crafts/hyperbolic origami/hypar.jpeg
summary: "*Craft:* Create origami models of hyperbolic space.


*Math:* examine how to approximate negative curvature using zero-curvature paper. Understand negative curvature as an excess of space, and as a deficet of angles."
pageHasContent: true
---
# Summary

Last class we examined shapes constructed out of creased and curved paper. Mathematically, we described these as *developable surfaces*, surfaces with gaussian curvature zero. Today, we (ahem) bend these rules, and make paper models which manifest nonzero gaussian curvature. We start with a simple origami model of a hyperbolic paraboloid, affectionately called a "hypar" by origamists. The same principle applied simple, circular creases creates a beautiful sculpture.

# worksheet


<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-8" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            History of curved origami
        </a>
    </h4>
    <div id="collapse-8" class="collapse show" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
Though origami is an old art, it is rare to have written sources of origami patterns from long ago. Most sources are not much older than the 1980s, when a modern origami renaissance was spurred by mathematical design principles. People just didn't right down very much. The two models above are the exception which proves the rule. Both the hypar and the curved sculpture have sources dating back to a paper study class taught at Bauhaus in 1927-1928. 

Bauhaus was a german (physical) art school that inspired a (metaphorical) school of design.  its followers prized simple geometric shapes and held an artistic reverence for function. The origami sculptures show Bauhaus principles quite well. The professor Josef Albers lead class with an incredible speech, here retold by one of the students:

> I remember vividly the first day of the [Preliminary Course]. Josef Albers entered the room, carrying with him a bunch of newspapers. … [and] then addressed us … “Ladies and gentlemen, we are poor, not rich. We can't afford to waste materials or time. … All art starts with a material, and therefore we have first to investigate what our material can do. So, at the beginning we will experiment without aiming at making a product. At the moment we prefer cleverness to beauty. … Our studies should lead to constructive thinking. … I want you now to take the newspapers … and try to make something out of them that is more than you have now. I want you to respect the material and use it in a way that makes sense — preserve its inherent characteristics. If you can do without tools like knives and scissors, and without glue, [all] the better.”

<div class="text-center">
<img src="/assets/crafts/hyperbolic origami/albers_bauhaus_small.jpeg" alt="newspaper clipping of curved origami model from Bauhaus, 1920ss" width="300" >
</div>

I started class with this quote.  For more on the history of curved origami, see [Erik and Martin Demaine's webpage](https://erikdemaine.org/curved/history/)
</div>
</div>
</div>
<br>


## Part 1: The hyperbolic paraboloid
Fold the hyperbolic paraboloid in the handout. (courtesy of Thomas Hull's book *Project Origami*) 

[Link to Handout](/assets/crafts/hyperbolic origami/hypar handout.pdf)


**Question:** squint your eyes, think about the surface approximated by the corrugated, folded paper. What is the gaussian curvature at the center? What about at another point?

<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-1" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Answer
        </a>
    </h4>
    <div id="collapse-1" class="collapse hide" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
The surface looks an awful lot like a hyperbolic paraboloid, the graph $z= x^2 + y^2$. This is the shape of a saddle or a Pringle. In particular,  the principal directions of the center point follow the diagonals of the paper. One diagonal has positive curvature, the other has negative curvature. So, the gaussian curvature is negative. Around any other point, the gaussian curvature is also negative. 

<div class="text-center">
<img src="/assets/crafts/hyperbolic origami/hypar vertical.png" alt="paper model of octahedron" height="300" >
</div>
<div class="text-center">
<img src="/assets/crafts/hyperbolic origami/hypar horizontal.png" alt="paper model of octahedron" height="300" >
</div>

</div></div></div><br>



**Question:** This shape is close to something called a hyperbolic paraboloid.  This is named after two shapes: the *parabola* and the *hyperbola* (shown below). Can you find two hidden parabolas inside the origami you just made? Can you find a hyperbola?

<div class="text-center">
<img src="/assets/crafts/hyperbolic origami/hyperbola vs parabola.png" alt="paper model of octahedron" height="300" >
</div>


<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-1" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Answer
        </a>
    </h4>
    <div id="collapse-1" class="collapse hide" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
 *Pedagogical note:* Some people may get stuck here. Once everyone has constructed the hyperbolas, bring the class together and discuss.
 
The hyperbolic paraboloid is the three dimensional graph of $z=x^2 - y^2$. We can see the hidden parabolas by taking the slices $y=0$ and $x=0$, giving the graphs $z=x^2$  and $z=-y^2$. This corresponds to looking at the origami in the diagonal direction. Along one diagonal, we see an upward pointing parabola. Along another direction, we see a downwards pointing parabola. 

To see the hyperbola, imagine an island shaped like the hyperbolic paraboloid. The shore of the island, the graph of $z=constant$, draws out a hyperbola. As the water level rises, the shore curves more and more tightly, until it overcomes the saddle point at the center of the hyperbolic paraboloid. Then, the one island splits into two. The shore of these two islands is still a hyperbola, just oriented a different direction. We see infinitely many hyperbolas. 
</div></div></div><br>



**Question: a** Last class, we saw that a sheet of paper, no matter how it is bent or folded, always has zero gaussian curvature. Yet, we have made something with nonzero gaussian curvature. How is this possible? What changed? (This is a subtle question. Talk about it a few minutes before moving on.)

<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-1" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Answer
        </a>
    </h4>
    <div id="collapse-1" class="collapse hide" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
When we made the zero curvature statement, we assumed that the paper did not rip or tear, expand or contract or distort. To get a curved surface, we need to break this somehow, and the paper has to distort. We will try to pinpoint where in the next question.
</div>
</div>
</div>
<br>

**Question: b**  Fold the hypar to its most extreme position, bringing its tips together. Are the paper faces flat? Are there any parts of the hypar where the paper looks particularly bent out of shape? What about in less extreme positions?

<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-2" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Answer
        </a>
    </h4>
    <div id="collapse-2" class="collapse hide" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
*Pedagogical note:* Bring the class together for this, it can be confusing.

 It its most extreme, we see that no face is flat! Each twists from pointing along one axis at the top, to another axis at the bottom. The most extreme distortion is in the very center, at the corners of the flat triangles.  For the tips farther apart, the same distortions are there, but they are less prominant. These distortions, compounded together, cause the curvature
</div>
</div>
</div>
<br>


We see now that something is up with the hypar. In fact, the hypar is fundamentally *hyperbolic*. The curvature arises because the paper has too much perimeter for its radius, forcing it to pop out of the plane. Let's see this is detail, first by understanding the perimeter of squares on the euclidean plane.

**Question 3a:**  Using a ruler, measure the perimeter and radius of your hypar. If you're comfortable with geometry, consider a square on the plane, centered on the origin, with distance to the origin $r$. Write a formula relating the perimeter of the square in terms of $r$. 

<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-3" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Answer
        </a>
    </h4>
    <div id="collapse-3" class="collapse hide" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
 The square has side length $2 r$, so its perimeter is $8r$.
</div>
</div>
</div>
<br>

**Question 3b:** Now we corrugate the paper, by folding it into the hypar pattern. What happens to the distance from the edge to the origin? What happens to its length? Using a ruler, what is the new perimeter and radius? Can you use this to explain curvature?

<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-4" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Answer
        </a>
    </h4>
    <div id="collapse-4" class="collapse hide" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
 As we corrugate, the edges are pulled closer to the center, but the lengths stay the same.  Thus, the perimeter is preserved. The perimeter, as a function of the new radius, is greater than $8r$. In other words, there is more length shoved into the same area. This is a smoking gun for negative curvature.  (recall previous week's activities). Indeed, for the same perimeter square to fit itself closer to the center, it needs to pop out of the plane. 
</div>
</div>
</div>
<br>

**Question 4:** Have one member of the table cut out the central square of the hypar. Compare the holey hypar with the filled ones. What happens when you squeeze two opposite ends together for both holey and filled hypar? 


<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-5" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Answer
        </a>
    </h4>
    <div id="collapse-5" class="collapse hide" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
For the filled hypar, as one end is squeezed, the other squeezes two. It works almost like a little gripper. For the holey hypar, squeezing one end does nothing to the other end. Cutting out the hole increased the freedom, making the two ends independent. 

</div>
</div>
</div>
<br>


<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-6" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Remark: Hyperbolic paraboloids and curvature
        </a>
    </h4>
    <div id="collapse-6" class="collapse show" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">

I've only told you about two parabolas, which are the most extreme parabolas: They are the directions of principle curvature. In fact, there are infinitely many other parabolas. Restrict to a two dimensional plane twisted by an angle theta (paramertized by  $\cos(\theta) x  + \sin(\theta) y = 0$). The graph of $z=x^2 - y^2$, restricted to this plane, the graph looks like a one dimensional graph $z= k(\theta) x^2$, for some constant $k$ depending on the angle $\theta$. In fact, $k$ is exactly the curvature of the curve at the origin. If one does out the algebra, she would find that $k(\theta) = \cos(2 \theta)$. This is a sinusoid, so its value at any angle is entirely determined by its largest and smallest values.  Let's see some examples:

- When $\theta=0$, $k=1$ so the parabola points straight upwards. 
- When $\theta = \pi/2$, $k=-1$ and the parabola points downwards.
- When $\theta= \pi/4$ or $\theta = 3\pi/4$, $k=0$. This corresponds to a flat line, which happens along the diagonal lines of the origami square. 

Now suppose we examine the curvature of a point on an arbitrary surface, one with negative curvature. We can study this using our trusty hypar. By squishing and moving the corners of the paper, we can make the hypar approximate the surface near that point. This will change how tightly the two main parabolas are curved. Then, the curvature of the surface sliced by a plane is entirely captured by the curvature of the hypar. For example, the two main parabolas of the hypar control the *principle curvatures* of the surface. In particular, as the angle of the plane varies, the curvature of the slice also varies sinusoidally. Using properties of sinusoids, We've discovered:
- The curvature at any angle is entirely determined by the two principle curvatures.
 -  The two principle curvatures must occur at 90 degrees relative to one another.

This explains why principle curvatures are so principle, and why gaussian curvature captures essentially everything we need about a surface. Secretly, we've just applied a central idea of calculus: Every function and shape is well approximated by polynomials, in this case a second order functions. After all, our hyperbolic paraboloid only used $x^2$ and $y^2$. Following the themes of calculus, the particular coefficients in our best approximating polynomials tell us how fast our function is changing -- in this case, it measures the principle curvature. 
</div>
</div>
</div>
<br>

**Wrap up activity:** Any people who don't want to keep their hypars should bring them to the front. There, we can put them together using tape to build a large amalgamated sculpture. See [here](https://erikdemaine.org/hypar/) for examples, choose whichever you have enough hypars for. Anyone who finishes the whole project early can help assemble the sculpture

## Part 2: Curved origami
The heart of last construction was the alternating concentric squares, each with mountian/valley folds. We can make a visually pleasing version using concentric circles instead, though this requires some creative creasing. In contrast to the hypar above, we will call this origami shape the *hycircle*


<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-7" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Instructions for the Hycircle
        </a>
    </h4>
    <div id="collapse-7" class="collapse show" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
 Get the following materials:
  - A box cutter / craft knife
- A piece of cardstock
- A spare piece of cardboard to cut on
- A thumbtack
- A piece of string
- A pencil
- (optional) A ruler of some kind.

### instructions
1. Setup the paper on the cardboard, held with the thumbtack in the center of the paper. Tie one end of the string to the thumbtack. 
 2. By tying the pencil some length along the string, we can draw circles on the cardstock. Produce several equally spaced, concentric circles. You can choose any parameters you like, but I'd recommend the following:
	 - Make the largest circle as large as possible -- larger is more ambitious
	 - Use a 1 cm change of radius between each circle -- Smaller spacing is more ambitious
	 - Make the smallest circle ~ 1/2 the radius of the larger one. This is not so important, and can always be increased later.
3. Cut out the pattern using the largest circle.
4.  Flip over the paper and repeat the markings ==can I get away without this?==
5. On every other ring, score **lightly** with the box knife. do not go all the way though. This will force the paper to curve where you cut.
6. Flip the paper over again, and score on the rings not already scored on the other side
7. Cut out the innermost ring
8. Make all the creases, going around and pinching to encourage the paper to fold along the circles in the direction dictated by the scoring. 
</div>
</div>
</div>
<br>



**Question 5:**   Measure the difference in radii between the inner and outermost circle of the flattened hycircle. Then, corrugate the hycircle, and measure the new difference in radii. How does the radius change? How does the perimeter change? Using what you know from the square case, how does this induce curvature?

<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-8" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Answer
        </a>
    </h4>
    <div id="collapse-8" class="collapse hide" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
The radius decreases, while the perimeter stays the same. That extra perimeter has to come from somewhere. So, the hycircle must pop out of the plane. This, like the hypar above, manifests negative curvature 

</div>
</div>
</div>
<br>

**Question 6:**   What configurations can you move the hycircle into? Try turning it "inside out". Compare this to the feeling of hyperbolic folding cardboard from the earlier week.




<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-9" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Answer
        </a>
    </h4>
    <div id="collapse-9" class="collapse hide" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
The hycircle is surprisingly flexible. You can twist the bottom part, and the top part will contort like a cute little worm. This is very similar to controling the hyperbolic cardboard from [[Hyperbolic cardboard]], where twisting one part forces everything else to conform. This fits into a general theme: negative curvature is more flexible than positive curvature.

If you made the hycircle big enough, and the inner circle a big enough portion of the larger radius, you should be able to turn it partially inside out. This doesn't do anything mathematical, it just looks really cool.

</div>
</div>
</div>
<br>

**Wrap up:** Fit today's activity into these themes of the class:
- Negative curvature makes things *Bigger than expected*
- Negative curvature makes things *Flexible*


<div class="card" >
    <h4 class="card-header">
        <a data-toggle="collapse" href="#collapse-10" aria-expanded="true" aria-controls="collapse-example" id="heading-example" class="d-block">
            <i class="fa fa-chevron-down pull-right"></i>
            Answer
        </a>
    </h4>
    <div id="collapse-10" class="collapse hide" aria-labelledby="heading-example">
        <div class="card-body" markdown="1">
both hypar and hycircle are curved because, once corrugated, their radius decreases while their perimeter stays the same. In other words, negative curvature is a result of perimeter being bigger than expected.

Likewise, question 6 discusses how the hycircle is flexible, like we'd expect from negatively curved objets. 
</div>
</div>
</div>
<br>


# sources
[Curved Crease Folding a Review on Art, Design and Mathematics](https://fab.cba.mit.edu/classes/865.18/discrete/folding/CurvedCrease.pdf) by Erik D. DEMAINE, Martin L. DEMAINE, Duks KOSCHITZ, and Tomohiro TACHI
- compendium of original sources of curved origami, and its applications to math and design. 

[More on Paperfolding](https://www.jstor.org/stable/2589583?seq=1) By Dmitry Fuchs and Serge Tabachnikov
- Differential geometric description of paper along curved folds

[(Non)existence of Pleated Folds: How Paper Folds Between Creases](https://arxiv.org/abs/0906.4747), by Erik D. Demaine, Martin L. Demaine, Vi Hart, Gregory N. Price, Tomohiro Tachi
- Proves the hypar is impossible with straight edge creases and no bending. Discusses how elasticity forms the hypar crease pattern into a hyperbolic paraboloid. 

[instructions for curved origami](https://blog.doublehelix.csiro.au/curved-origami-sculpture/ )
