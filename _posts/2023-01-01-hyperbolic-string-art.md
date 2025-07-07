---
permalink: /code/hyperbolic-string-art


layout: project 
title:  "Hyperbolic string art"
date:   2023-01-01 16:03:47 -0500
categories: code
tags: [blog, talk, code, paper, expository, fun, gallery]
attributes: [fun-talk]
image: /assets/images/hyperbolic.jpeg
file: /files/presentations/hyperbolic-string-art.pdf
talk-venue: UC Berkerly many cheerful facts, Fall 2023 
summary: I close my eyes, but all I see are strings. Stretch a line across a circle according to simple mathematical rules, and you get elegant patterns often dubbed "string art". For example, connect each angle $\theta$ to the angle $2 \theta$, and the heart-shaped cardiod emerges. This talk chronicles my fourier into *hyperbolic string art*, a recontextualization of string art imagining the circle as the boundary of the hyperbolic plane, and the straight lines as hyperbolic geodesics. The patterns arising from natural hyperbolic transforms reveal the symmetries and geometry of hyperbolic space.  With hyperbolic string art, we navigate the hyperbolic plane watching only the horizon, and visualize the moduli space of closed hyperbolic surfaces.

paper-title: Hyperbolic String Art
authors: Elliot Kienzle
paper-year: 2022
journal:
paper-file:  /files/hyperbolic_string_art.pdf
paper-abstract: Stretching straight lines across a circle according to mathematical rules produces emergent patterns known as string art. We re-contextualize string art, envisioning the circle as the circle at infinity of the hyperbolic plane. The strings stretch across the Beltrami-Klein model of the hyperbolic plane, each line a hyperbolic geodesic. We examine the string art coming from Mobius transforms, by studying the envelope of the strings, the curve tangent to every string. We describe the envelopes of a Mobius transform in terms of the underlying hyperbolic symmetry. Elliptic Mobius transforms give hyperbolic circle envelopes, parabolic transforms give horocycles, and hyperbolic transforms give hypercircles. To visualize these envelopes, we use the Poincare disc model, rendering each string as a circular arc orthogonal to the boundary. This draws all envelopes described above as Euclidean circles. We conclude with a purely aesthetic application, showing a hyperbolic string art fractal

sketch-link: /sketch/strings
pageHasContent: true
gallery-title: Hyperbolic string art
gallery-folder: /assets/gallery/hyperbolic-string/
gallery-captions:
  - image: eye
    title: Hyperbolic string art
    caption: |
      When I close my eyes, all I see are strings. I've become somewhat obsessed with the patterns made from stretching straight lines across a circle, better known as string art. Simple rules can yield beautiful patterns and reveal hidden math. 
      
      This gallery chronicles my exploration in my string art, a retelling of my [twitter thread](https://x.com/chessapigbay/status/1584141465734635520). For more mathematical details, see [my paper](/files/hyperbolic_string_art.pdf)
  - image: clock1
    title: 
    caption: |
      It all started in seventh grade math class, during our modular arithmetic unit. We drew a clock, and imagined how the hands move after waiting three hours. Addition by 3, mod 12. Connecting the starting and ending numbers with string, we get a satisfying pattern
  - image: clock2
    title: 
    caption: |
      Try this with 100 numbers (addition by 25 mod 100), and we see the strings accumulate in a smaller central circle. This manifests the underlying symmetry of modular addition: All numbers move the same amount, giving us that sweet, sweet rotational symmetry.
  - image: cardiod_build
    title: 
    caption: |
      Next, modular multiplication. Multiply by 2 mod 100, and connect the dots for a nice heart! These classic patterns are staple examples of the beauty of math, for good reason.
  - image: square
    title: 
    caption: |
      7th grade me was enamored. With a little python, I made string art for every other function I could think of, modulo $n$. $x^2$ modulo $n$ lacked the elegant envelopes of multiplication, opting for a dense jungle of jumbled lines. I failed to find any functions with the beautiful symmetries of the classics. My disappointment eventually faded into memory, buried under the sands of time. 
      
      Until a month ago. I saw a my friend Fran's [video](https://www.youtube.com/watch?v=KlHmuKqpJl0&ab_channel=GrapefruitGecko) about the classics, relating string art to circles rolling around circles (check it out!) Like a windstorm through the desert of my memories, it unearthed my long buried failure. I had unfinished business.
      
      But this time, I have a math degree! I know waaay more functions then lil baby me, I'm sure some of them look cool. I realized the "modulo n" is incidental, and only the position around the circle matters--I should look for natural maps from the circle to itself.
  - image: logo_loop
    title: 
    caption: |
      For example, modular addition is really rotation by a constant angle, while modular multiplication by two doubles the angle. I can make string art for any map by stretching strings between a point to its image. Here's a sequence of maps made from smooth noise.
  - image: cardiod_random
    title: 
    caption: |
      But really, It's not about the strings. They concentrate along "caustics" where each string crosses its neighbors. Thin enough strings, and only the caustics become visible. You can see this above, as we add more strings and make them thinner as time goes on. The hearta appears out of the chaos. Rotation produces circular caustics, while angle doubling makes the heart-shaped cardioid. 
      
      Sidenote, "caustics" are usually light reflected off a curved surface, where straight light rays act like straight strings. Reflecting off a circle doubles the angle of light, so the light concentrates in a cardioid in the bottom of your coffee cup. For more information, see my [presentation about caustics](/talk/Caustics)
  - image: pulsing
    title: 
    caption: |
      We can also get nice caustics by changing the boundary. Here the boundary is an epicycloid, traced by a circle rolling inside another circle. The map is a time-varying rotation. If the boundary were a circle, the caustic would simply be another circle. The unusual boundary gives beautiful caustics.
  - image: swoop
    title: Hyperbolic string art
    caption: |
      I think I've successfully avenged my 10 year old grudge. But my ace remains firmly up my sleeve. Seventh grade me never thought about the canvas string art paints on. What if, instead of a flat disc, it was _curved_? That's right: Hyperbolic sting art :)
      
      This marks the end of my twitter thread. From now on, I will not explain everything responsibly.
  - image: beltrami
    title: Mobius transfom string art
    caption: |
      One natural map from the circle to itself are mobius transforms. Think of the circle as the real line with infinity $\mathbb{R} \cup \infty$. A mobius transform is a map of the form $x\mapsto \frac{ax+b}{cx+d}$ for fixed real number $a,b,c,d$. This sends a real number to a (possibly infinite) real number, so extends to a map from the circle to itself. The video above shows the string art for this map, as the parameters $a,b,c,d$ vary.
      
      Notice how the causitc seems to be an ellipse. 
  - image: comparison
    title: The hyperbolic plane
    caption: |
      Now we take a leap of insight, and treat the inside of the circle as the hyperbolic plane. Symmetries of the hyperbolic plane act on the boundary circle through mobius transforms. We think of the "strings" in string art as geodesics through the hyperbolic plane, rendered in the Klein model. If instead we switch to the Poincare disc model, the geodesics become semicircles which meet the boundary circle orthogonally. There is a unique such geodesic connecting any two points on the boundary circle. This gives us a new way to render strings in string art. 
      
      We can visualize the symmetries of the hyperbolic plane in this picture geometrically. Here's a [video](https://www.youtube.com/watch?v=0z1fIsUNhO4&ab_channel=djxatlanta) showing how the mobius transformations acting on the complex plane arise from the Riemann sphere. The symmetries of the hyperbolic plane are Mobius transforms which fix the unit circle. On the unit circle, these act by the mobius transforms described above. On the interior, the preserve the stucture of the hyperbolic plane.
      
      Here is the mobius transform string art shown in both methods, with straight lines (left) and with circular arcs (right). Notice how the caustic in the Poincare model (right) is a circle?
  - image: elliptic
    title: Elliptic mobius transform
    caption: |
      Here is the string art for an "elliptic" mobius transform. These come from rotations of the hyperbolic plane.  I drew the complete circle of each string, even though they leave the bounding circle. The caustic consists of two circles, one inside and one outside the bounding circle.
  - image: hyperbolic
    title: Hyperbolic mobius transform
    caption: |
      Here is the string art for an "hyperbolic" mobius transform. These come from translations of the hyperbolic plane.  The caustic consists of two circles, which both meet the bounding circle
  - image: table
    title: Mobius transform table
    caption: |
      This table explains the string art for different classes of mobius transforms. The types of mobius transforms correspond to the number of fixed poins on the circle. The elliptic transforms arise from rotations of the hyperbolic plane, while the hyperbolic transforms arise from translations of the hyperbolic plane. The envelopes look like circles in the Poincare projection. Their corresponding shapes in the hyperbolic plane are explained in my [paper](/files/hyperbolic_string_art.pdf)
  - image: reflection
    title: Reflection
    caption: |
      String art for a reflection of the circle. This is also a type of mobius transform.
  - image: human_fractal
    title: Fractal string art
    caption: |
      Consider the map consisting of a mobius transform, composed with a circle doubling. The left image shows the string art for that map. The second image shows the map iterated twice, and so on. The resulting rightmost image is fractal string art
  - image: noir
    title: Fractal string art 2
    caption: |
      Another fractal of the same type as the last.
---

For a frielndly introduction to string art, see [my twitter thread](https://twitter.com/chessapigbay/status/1584141465734635520).  This pge contians a collection of sketches of Hyperbolic string art. For a general audience introduciton to hyperbolic geometry and hyperbolic string art, see [my paper](/files/hyperbolic_string_art.pdf). This paper was accepted to Bridges 2023, but I wasn't able to make it that year.  While reading the paper, try playing along with the sketches below.  To play with string art in more granularity, see the [full sketch](/sketch/strings). 
<script language="javascript" type="text/javascript" src="/sketch/libraries/p5.min.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/p5.gui.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/MyGUI/MyGUI.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/strings/Farey/farey.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/zoom_instanced.js"></script>


<script>
#instructions {
      background-color: red;
      color: white;
      padding: 20px;
    }

    .instruction {
      margin-bottom: 10px;
    }

    .instruction-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
</script>


# Exploring hyperbolic space

This page contains a number of sketches exploring hyperbolic space. All of them are interactive, with the following controls:


<div class="card" >
  <div class="card-body">
    <h2 class="card-title">Controls: <strong>Double click</strong> to activate</h2>
    <h6 class="card-subtitle mb-2 text-muted">Applies to all sketches on page</h6>
    <p class="card-text">
	    <ul>
		    <li> <strong>double click</strong>: Enable/disable sketch</li>
		    <li><strong> click+drag and scroll</strong>: move and zoom</li>
		    <li><strong>Shift</strong>:  move selector dot to mouse</li>
		    <li><strong>Space</strong>: Toggle between Poincare disc model and Klein model  </li>
	    </ul> 
    </p>
	</div>
</div>

## Hyperbolic string art

<div class="container" style="
    margin-top:0% ;
    margin-bottom:0% ;
	position: relative;
    ">
    <div class="sketch" id="ellipticStringArt"></div>
</div>

This shows a collection of hyperbolic geodesics (or strings), each connecting a point on the outside circle to a rigid rotation of that point. *rotation angle* controls this angle, and the *number of strings* controls the number of geodesics plotted. The white dot indicates the hyperbolic view. By holding the shift key, you can "fly around" the hyperbolic plane, seeing what the string art looks like from different perspectives. Notice that the strings concentrate around a circle. Let us see what happens with a hyperbolic Mobius transformation, coming from a translation in hyperbolic space:

<div class="container" style="
    margin-top:0% ;
    margin-bottom:0% ;
	position: relative;
    ">
    <div class="sketch" id="loxodromicStringArt"></div>
</div>

We are in a fixed view, but are changing the mobius transform controling the strings. The transform is a hyperbolic translation from the origin to the marked point. The strings now concentrate around arcs of Euclidean circles, known in hyperbolic space as *Hypercircles*. 

I  describe hyperbolic string art in more detail in an [article](\files\hyperbolic_string_art.pdf). This gives a general audience quick introduction to hyperbolic geometry, and provides hyperbolic geometric descriptions for the envelopes seen above.

## Farey tesselation

<div class="container" style="
    margin-top:0% ;
    margin-bottom:0% ;
    ">
    <div class="sketch" id="farey"></div>
</div>

This lets you fly around the Farey tesselation. To form the Farey tesselation, identify the ideal boundary of hyperbolic space with the real line. Draw a geodesic between rational numbers $p/q$ and $p'/q'$ if and only if $pq'-p'q=\pm 1$. This relates to the action of $PSL(2,\mathbb{Z})$ via fractional linear transforms. In the Poincare disc projection, these geodesics produce a tesselation of the hyperbolic plane by ideal triangles, equivariant under the Fuschian group $PSL(2,\mathbb{RR})$. 

The Farey tesselation affords surprising connections between number theory and hyperbolic geometry. For example, take a geodesic from 0 to some real number. This geodesic passes a sequence of strings in the Farey tesselation, each associated with a rational number. These numbers form a sequence of best rational approximations of our original real number. In purely hyperbolic geometry, this tesselation uniformizes a once-punctured torus (combining two triangles, you get the desired ideal quadrilateral). For more details, see for example  [this paper](https://www.mathi.uni-heidelberg.de/~lee/Mareike02.pdf). 
