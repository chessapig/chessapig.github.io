---
layout: project
title: Geometric quantization of coadjoint orbits
date: 2023-11-15 16:03:47 -0500
categories: talk
tags:
  - talk
  - craft
attributes:
  - seminar-talk
image: /assets/images/coadjoint.jpeg
file: /files/presentations/geometric-quantization-coadjoint.pdf
talk-venue: UC Berkeley Orbit method Learning seminar, fall 2023
summary: I explain the process of geometric quantization, which constructs a vector space from a symplectic manifold. Applied to a coadjoint orbit of a compact group, this gives the associated irreducible representation promised by the orbit method. This provides another perspective on the Borel-Weil theorem. Along the way, I explain coadjoint orbits combinatorially in terms of a torus action and its moment map, and phrase quantization using this description.
pageHasContent: true
gallery-folder: /gallery/images/cobordism/
---
I wrote about the contents of this talk a while ago in my math diary. For the combinatorial description of coadjoint orbits using symplectic geometry, see [entry 15](/diary/15). For a description of Borel-Weil theory in terms of quantization, see [entry 10](/diary/10). 

During this talk, everyone made a model of the coadjoint orbit of $SO(3)$, seen in the picture above. This case is especially simple and visualizable. I started writing about it in my diary, in my entry on the [weyl group](\diary\19)


The coadjoint orbit is generically the two sphere, with the usual $SO(3)$ action by rotation. To represent this combinatorially, we choose a maximal torus. This is defined by a choice of line thru the origin in $\mathbb{R}^3$, where the torus consists of rotations preserving the line. This is represented by the stick along the axis of the ballon. (To do this, first overinflate the ballon, then put in the stick, then deflate the ballon while positioning the stick in place). Place equally spaced marks along the stick. These represent the weights of the representation associated to the coadjoint orbit. Their pre-image under the hamiltonian consists of slices of the sphere at the height of the marked points. These are exactly the classical states which satisfy the born-sommerfeld condition. Thus, we see from this picture the real quantization of the coadjoint orbtis of $SO(3)$, and their relation to weights of representations. 


This talk was meant to lead towards the recent number theory applications of the quantatative, microlocal approach to the orbit method. See  [Nelson and Venkatesh](https://arxiv.org/abs/1805.07750). Here are the sources for my talk: 
- [Geometric quantization and Representation theory](https://math.berkeley.edu/~fengt/249C_2017.pdf), lectures by Akshay Venkatesh. Gives an exposition of geometric quantization explicitly geared towards the Kirillov character formula. It gives a proof via Duestermaat-Heckman formula, and explains the microlocal viewpoint. 
- [Lectures on the Orbit method](https://bookstore.ams.org/gsm-64/), by Kirillov. The definitive source on the orbit method. 