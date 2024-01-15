---
layout: blog
title: "Two-sphere boot camp"
date: 2023-05-13 16:03:47 -0500
categories: blog
summary: "(incomplete) Compendium of all known facts about the two-sphere"
pageHasContent: true
---
Mathematicians love examples. As a corollary of the [strong law of small numbers](https://en.wikipedia.org/wiki/Strong_law_of_small_numbers), there are not enough examples to go around! Many of the simplest example objects from different fields are in fact the same. This is certainly true in my field, geometry (broadly construed). The two-sphere $S^2$ is everyone's favorite little gem. Each facet of geometry views the two sphere in a special way, and it shines brilliant from all angles like a cut diamond. Confluences of different geometries on $S^2$ are prototypical of general theorems and philosophies. All this to say, $S^2$ is a prime specimen for geometers to examine.

In this page, I'll try to say everything I know about $S^2$. I'm talking about computations done in detail, everything on the page. Of course, this is ongoing. Even if I manage to write everything I know down (which I doubt), I'll forever learn more things about our friend $S^2$.
# $S^2$ as a manifold (coordinates)
Here we will define $S^2$ as a manifold. In particular, we will provide coordinates, ways to signify a single point on the sphere. The manifold structure is the foundation for all our later geometric structures.  
## $S^2$ as a locus of points in $\mathbb{R}^3$

>[!todo] Definition 1:
> $S^2$ is the locus of points $\left\{(x,y,z) \in \mathbb{R}^3\right\}$ such that $x^2 + y^2 + z^2 =r^2$. The parameter $r$ is called the *radius*. 

This realizes $S^2$ as the radius $r$ sphere inside of three-dimensional space, the familiar definition for day-to-day life. Definition 1 induces a manifold structure on $S^2$. Indeed, defining $f(x,y,z) = x^2 + y^2 + z^2$,  we see $S^2 = f^{-1}(r^2)$. Using essentially the implicit function theorem, the manifold structure on $\mathbb{R}^3$ induces one on $S^2$ provided that $\nabla f \neq 0$ for any point on $S^2$. We compute:
$$\nabla f = (2x,2y,2z) \neq0  \text{ whenever } x^2+y^2+z^2 \neq 0$$
Therefore, $S^2$ inherits a manifold structure from $\mathbb{R}^3$. Since $f$ is smooth, $S^2$ is a smooth manifold

We can rephrase this definition using linear algebra and drop all coordinate dependence. 
>[!todo] Definition 2:
> Let $V$ be a 3-dimensional inner product space. The two-sphere $S^2$ is the locus of norm 1 vectors:
> $$S^2=\{v \in V | \langle v,v \rangle = 1\}$$

If we choose an orthonormal basis $e_1,e_2,e_3$ of $V$, and write an arbitrary vector as $v = x e_1 + y e_2 + z e_3$, then definition two becomes definition 1.
