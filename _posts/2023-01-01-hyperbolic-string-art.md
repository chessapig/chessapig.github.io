---
permalink: /code/hyperbolic-string-art


layout: project 
title:  "Hyperbolic string art"
date:   2023-01-01 16:03:47 -0500
categories: code
tags: [blog, talk, code, paper, expository, fun]
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
