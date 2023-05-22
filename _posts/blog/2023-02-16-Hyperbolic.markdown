---
layout: blog 
title:  "Exploring hyperbolic space"
date:   2023-2-16 16:03:47 -0500
categories: blog
excerpt: "a collection of interactive gizmos and gadgets for exploring hyperbolic spcae"
---



<script language="javascript" type="text/javascript" src="/sketch/libraries/p5.min.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/p5.gui.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/MyGUI/MyGUI.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/strings/Farey/farey.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/zoom_instanced.js"></script>


This is a collection of sketches exploring hyperbolic space. All of them are interactive, with the following controls:
- double click to enable/disable
- click, drag, and scroll to zoom
- hold *shift* to move selector dot
- press *space* to toggle between Poincare disc model and Klein model

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

This lets you fly around the Farey tesselation. To form the Farey tesselation, identify the ideal boundary of hyperbolic space with the real line. Draw a geodesic between rational numbers $$p/q$$ and $$p'/q'$$ if and only if $$pq'-p'q=\pm 1$$. This relates to the action of $$PSL(2,\mathbb{Z})$$ via fractional linear transforms. In the Poincare disc projection,  hese geodesics produce a tesselation of the hyperbolic plane by ideal triangles, equivariant under the Fuschian group $$PSL(2,\RR)$$. 

The Farey tesselation affords surprising connections between number theory and hyperbolic geometry. For example, take a geodesic from $$0$$ to some real number. This geodesic passes a sequence of strings in the Farey tesselation, each associated with a rational number. These numbers form a sequence of best rational approximations of our original real number. In purely hyperbolic geometry, this tesselation uniformizes a once-punctured torus (combining two triangles, you get the desired ideal quadrilateral). For more details, see for example  [this paper](https://www.mathi.uni-heidelberg.de/~lee/Mareike02.pdf). 

## Fuschian groups


<div class="container" style="
    margin-top:0% ;
    margin-bottom:0% ;
    ">
    <div class="sketch" id="fuschian"></div>
</div>

Work in progress :( 
