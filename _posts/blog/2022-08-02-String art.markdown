---
layout: blog 
title:  "String art"
date:   2022-08-02 16:03:47 -0500
categories: blog
excerpt: "Notebook about my string art experements"
---


<script language="javascript" type="text/javascript" src="/sketch/libraries/p5.min.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/p5.gui.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/quicksettings.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/MyGUI/MyGUI.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/zoom.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/strings/strings_instanced.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/strings/strings_library.js"></script>

# A cause for caustics

I've always been fascinated by caustics. The shimmering light at the bottom of a pool, the heart at the bottom of my coffee mug, rainbows in the sky, they're all beautiful.
![[pool.png]]
![[CoffeCup.png]]You see them in much more than just ligh t, anytime you project some sheet to a lower dimensional space. This could be light from phase space to position space, or the folds on translucent cloth pressed against a window, or the [largest structures in the universe](https://telescoper.wordpress.com/2014/06/30/the-zeldovich-lens/). Mathematically, its the bijillionth example of an [ADE classification](https://link.springer.com/book/10.1007/978-94-011-3330-2) (Nice to see you again, old buddy).  I could talk about caustics for hours, but that's  another day's tale.![[cardiordMine.png]]

Caustics came back into my life not through any of these lofty pursuits, but in some arts and crafts from my middle school years. String art! Wind strings around a circle of pegs, connecting each peg to its friend twice as far along the circle, and the strings cross in a nice heart shape (just like the coffee mug). I recently saw a great  [video](https://www.youtube.com/watch?v=KlHmuKqpJl0&ab_channel=GrapefruitGecko) by a friend of mine (go check her out!), talking about why this shape comes about, and all the other mathy patterns who appear in string arithmetic. But I've never seen string art for fancier things--What if instead of multiplying the angle by two, you square it? what if you take its sin? What about any arbitrary map from the circle to itself? Could caustics be a lens to visualize and understand the properties of these maps? The rabbit hole sat wide open, and like Alice, I fell in headfirst. 

This page is my open notebook for my string art explorations. If you want to play along at home, these were all made [here](https://chessapig.github.io/sketch/strings/)

# The classics

# The classics

Let's start with the classic: Multiplication by an integer. Here's an embedded version to play around with. Double click to enable it, and you'll be able to zoom and pan around. 


<div class="container" style="position: relative;">

<div class="sketch" id="string" style="position: relative;">div</div>

</div>

This shows the caustics of the map

$$ x \to m x + c \text{ mod } 1$$

where $m \in \mathbb{N}$ is the multiplier, and $c$ is some external shift. The values of these numbers is shown next to the sliders.  For $m=2$ we get the lovely cardioid. For general $m$, we get the $m-1$-lobed version of the cardioid. In general, these are the shapes traced by a radius $1$ circle rolling around a radius $m$ circle. To see why, see [the cool video](https://www.youtube.com/watch?v=KlHmuKqpJl0&ab_channel=GrapefruitGecko) i mentioned. This also talks about the patterns who show up when $m$ is similar to the number of lines (above, theres 1000 lines, so we don't have to worry).

We can also change the $+c$ shift. For $m>1$ it does what you might expect, and simply rotate the resulting caustics. for $m=1$, you get a circle in the center whose size depends on the phase. At $c=.5$, the circle collapses into a single bright point at the middle.

# Messing with the border


The classic stuff is neat, but it's been done a billion times before. What if we change up the border? We can sit the circle into the plane with any sort of map $S^1 \to \mathbb{R}^2$, and connect the images of $x$ and $f(x)$ with straight lines. For example, we can try

<div class="container" style="position: relative;">
    <div class="sketch" id="string2"></div>
</div>
test


# A quest for fractals

The classic string art cardioid is sometimes a representative for beauty in mathematics. Not only do you get a nice heart, but the same shape appears in the Mandelbrot set! The Mandelbrot set deals with the dynamics of the complex function $f_c(z)= z^2 + c$.  A complex number $c$ is in the Mandelbrot set if repeated iterations of $f_c$ sends zero off to infinity. In other words, the following sequence diverges:

$$f_c(0), \, f_c(f_c(0)), \, f_c(f_c(f_c(0))), \dots$$


