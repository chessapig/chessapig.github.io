---
layout: project
title: The mirror symme-tree
date: 2024-11-12 16:03:47 -0500
categories: art
tags:
  - gallery
  - blog
attributes: 
image: /gallery/images/symmetree/thumbnail.jpg
file: 
summary: 'The mirror symme-tree is a portrait of the field of math known as mirror symmetry. In the search for a theory of everything, physicists discovered mirror symmetry which posits that two different physical theories are dual to one another. For mathematicians, this duality builds an unexpected bridge between unrelated fields of math. The mirror symme-tree illustrates the mathematical structures and relationships from the eponymous field. '
pageHasContent: true
gallery-title: Mirror Symme-tree
gallery-folder: /gallery/images/symmetree
gallery-captions:
  - image: 1full
    title: "The Mirror Symme-tree"
    caption: "The full mirror symme-tree"
  - image: 2d
    title: "2D mirror symmetry"
    caption: 'A snapshot of $2D$ mirror symmetry, the classic type of mirror symmetry. The target is a Kahler manifold. On the A-side, we detect the symplectic structure, measured through the fukaya category. On the B-side, we detect the complex structure, measured through the derived category of coherent sheaves.'
  - image: 3d
    title: "3D mirror symmetry"
    caption: 'A snapshot of 3D mirror symmetry. Now the target is a Hyperkahler manifold. Both the A and B side have boundary conditions which are holomorphic lagrangian submanifolds. The TQFT counts 3-manifolds stretching between the boundary conditions, satisfying certian equations. On the B-side, these maps are all constant. On the A-side, the maps solve the Feurter equations.'
  - image: leafs
    title: "The trunk of the mirror symme-tree"
    caption: 'The underlying physical strucutre which mirror symmetry lives utop. This shows the cascade of boundary theories from the $4D, \mathcal{N}=4$ supersymmetric yang-mills, down from $4D$ to $3D$, $2D$, and $1D$ theories. each of these have an A and B model, counting maps into manifolds with different geometric structures. '
  - image: shadow
    title: "The dimensional reduction shadow"
    caption: "Dimensionally reducing by $S^1$, the tree has a shadow. Each branch of the tree becomes a new TQFT one dimension lower. Here, symplectic duality relates sheaves living utop the higgs and coloumb branches of the theory. The sheaves are represented by the snake critters."
---
Math lives atop a scaffolding of physics. Physicists organize the world into a hierarchy of quantum field theories, which I conceive as a great tree. Mathematical critters populate the branches, reflecting the structures and symmetries of the underlying physics. There is a mysterious duality between the wide-spreading branches,  hinting at an unexpected kinship between critters living in disparate areas of math.  Welcome to the mirror symme-tree.

| <img src="/gallery/images/symmetree/1full.jpg" alt="Large vibrant tree, full of arrows and critters. There are many signs with math words on them" width="700"> |
| -- |
| The mirror symme-tree | 


Let's take a look at the physics behind the trunk of the tree. Physics is built by quantum field theory, but the theory describing our universe is hard. Exact results are fleeting. This contributes to a strained relationship with mathematics -- if you manage to even define these things, you get [a million dollars](https://en.wikipedia.org/wiki/Yang%E2%80%93Mills_existence_and_mass_gap).  Instead, we build a new universe, a toy model to poke and prod. 

The easiest universes to understand are those with lots of symmetry. We add evil little versions of every subatomic particle, making our theory "supersymmetric". The more symmetric particles we add, the simpler the universe is. Why no go all the way, and add [16 versions of every particle](https://en.wikipedia.org/wiki/N_%3D_4_supersymmetric_Yang%E2%80%93Mills_theory). This is enormously restrictive. Always unsatiated, we simplify even more by [twisting](https://ncatlab.org/nlab/show/topologically+twisted+D%3D4+super+Yang-Mills+theory) the theory to be "topological". in our constructed universe, the particles do not move. Nothing changes as you move throughout time. Its history is locked in stone from the outset, controlled by nothing but the shape of the universe. There is no physics here. The great machine of quantum field theory toils and whirs in this facsimile of a universe, and leaves us with a single number. The partition function. 

| <img src="/assets/images/symmetree/4d.jpg" alt="Zoomed in on the top of the trunk, the sign says 4D N=4 SUSY" width="300"> |
| -- |
| The starting quantum field theory for today, $4D, \mathcal{N}=4$ supersymmetric yang mills theory| 


Even though the universe is boring, this partition function is very interesting, probing the data used to define the theory. To describe a quantum field theory, we need to choose a "field". Take the electric field, which we describe using the potential energy. The field is determined by a real-valued function on spacetime. Instead, our field can be a functions on spacetime valued in some manifold with extra structures. This gives a geometric construction of a quantum field theory. The partition function from before gives geometric information about this manifold. Mathematicians would pay a pretty penny to know this information. 

There are two ways to make a theory topological, the A and [B twists](https://www.youtube.com/watch?v=0pHYOqVKOE4&ab_channel=pigmie). Physics predicts that every B-twisted theory has a "mirror", and equivalent A-twisted theory. This "mirror symmetry" lets us compute an A-twisted partition functions using a B-twisted theory. 

| <img src="/assets/images/symmetree/4d_twist.jpg" alt="expanded version of the trunk above, including two branches which say 'A' and 'B' Twist" width="700"> |
| -- |
| The twists are two, twisted branches spreading out from the central theory. Notice the calming swoops of the B-twist, compared to the harsh scraggles of the A-twist. The B-twist is often easier to work with.| 


Consider a 2-dimensional universe. In an A-twisted theory, the fields are valued in a symplectic manifold (see [my thread on twitter](https://x.com/chessapigbay/status/1702889486567514280)), and the partition function counts J-holomorphic curves, 2-dimensional soap films stretching across our symplectic manifold. In contrast, the fields in a B-twisted theory are valued in a complex manifold, and the partition function measures its topology (hodge theory).  Can we use physics to help compute these numbers?

| <img src="/gallery/images/symmetree/2d.jpg" alt="Subslice of the tree, titled 2D mirror symmetry. Has two branches, which both exapnd from a central trunk and embed into a clump of leaves. The branches are labeled by the A and B twist, and contain sings saying, fukaya and categorey of coherent sheaves respectivly." width="700"> |
| -- |
| the 2D section of the mirror symme-tree. Notice how the "A-model" branch maps into "holomorphic curves" living in a symplectic manifold (the blob of leaves) | 


Yes we can, and it's a bombshell. Mirror symmetry says that every A-twisted theory has a mirror B-twisted theory, with the same partition function. Geometrically, every symplectic manifold has a mirror complex manifold.  We can count J-holomorphic curves (hard) by constructing the mirror, and computing its topology (easy). Mirror symmetry builds an bridge between the mathematical continents of symplectic and complex geometry, which has ushered in a booming trade industry. 

**☡ Warning ☡:** the "2D" in 2D mirror symmetry is about the dimension of the spacetime, not the auxiliary symplectic manifold. The theory is  2 dimensional because it probes the manifold of fields with a 2 dimensional curve. Similarly, 3D mirror symmetry studies special 3D sub-manifolds.

| <img src="/gallery/images/symmetree/3d.jpg" alt="Subslice of the tree, titled 3D mirror symmetry. Has two branches, which both exapnd from a central trunk and embed into a clump of leaves. The branches are labeled by the A and B twist. this time, the central blob has mushroom shapes labeled 'holomorphic lagrangians' " width="700"> |
| -- |
| the 3D section of mirror symmetry. Note that now the A-model maps into "Feuter". This describes the special 3D submanifolds of interest.  | 

In every dimension up to 4, there are analogous quantum field theories. If your 4D universe has a border, then a 4D theory induces a 3D theory known as the boundary theory. This itself has a 2D boundary, and so on to a point. The information of all these boundary theories is contained in the 4D partition function. 

| <img src="/assets/images/symmetree/trunk.jpg" alt="A dry trunk, devoid of leaves or branches. The dimension of the trunk reduces as you move down in levels. At the top is 4D, and it reduces in dimension each time you move down." width="300"> |
| -- |
| the central trunk of TQFTs. Notice how each layer is the boundary of the tree above, losing one dimension each time | 


Each dimension up has its own A and B twists, which count maps of spacetime into manifolds with ever increasing structure. 
- 1D quantum field theories map into Riemannian or complex manifolds
- 2D quantum field theories map into Kahler manifolds (both symplectic, Riemannian, and complex)
- 3D quantum field theories map into hyperKahler manifolds (which are based on the  quaternions)

| <img src="/gallery/images/symmetree/leafs.jpg" alt="Tree with branches and leaves but no critters living utop" width="400"> |
| -- |
| Utop the central trunk, there are branches at each dimension for A and B twists. Each dimension has its own target manifold, the blob of leaves in the center of the tree. As we move up the tree, the geometric structure on the target leaves gets more and more complicated. In 1 dimension, the A and B twists target different manifolds from eachother. | 

The partition function is more than just a number, for It encodes information of counting maps with boundaries. Secretly, it is governed by a mountain of algebraic structure.
- in 1D, the partition function comes from a vector space
- in 2D, it comes from a category
- in 3D, a 2-category.
- and so on

For example, remember how the 2D A-twist counts maps into a symplectic manifold? The full information counts maps with specified boundary conditions. In a symplectic manifold, the correct boundaries of a J-holomorphic curve are nice sub-manifold called Lagrangians. The category associated to this quantum field theory is called the Fukaya category, and it counts strips between two specified Lagrangians.  

| <img src="/gallery/images/symmetree/2d.jpg" alt="Subslice of the tree, titled 2D mirror symmetry. Has two branches, which both exapnd from a central trunk and embed into a clump of leaves. The branches are labeled by the A and B twist, and contain sings saying, fukaya and categorey of coherent sheaves respectivly." width="700"> |
| -- |
| 2D mirror symmetry again. The Lagrangians or coherent sheaves are rendered as mushrooms living on the tree. After all, they are boundary conditions. The A and B models are sigma models, mapping the central 2D trunk into the bulk of a symplectic manifold. The branches themselves splay out in a 2D way into the leaves, ending on the mushroom boundaries. On the B-side, the branches converge in a point. On the A-side, an inchworm stretches a 2D web between the two boundary conditions. This is the 'strings' of string theory, stretching between two Lagrangain branes. | 



We can reduce dimension in another way, wrapping one direction into a vanishingly small circle ([Dimensional reduction](https://en.wikipedia.org/wiki/Dimensional_reduction)). This shadow of the original theory is often more accessible, and gives a whole new tree with its own relationships. 

| <img src="/assets/images/symmetree/reduction.jpg" alt="As we move from the top left to the bottom right, a series of lines wraps themselves into circles, which get smaller and smaller until they collapse into points " width="400"> |
| -- |
| In dimensional reduction, one direction is wrapped into a tiny circle. When we say string theory has "tiny extra dimensions", this is what we mean.  | 


If we probe a 3D theory with little vortices (the acorns), and send them down to the shadow, it quantizes the manifolds defining the theory. Mirror symmetry manifests as an equivalence of the categories of these quantizations (See [this paper](https://arxiv.org/abs/1603.08382)).  These little snakes hail from from geometric representation theory. They represent sheaves living on the shadows of two manifolds associated to a 3D theory. These manifolds are called the Higgs and Coloumb branch. 3D mirror symmetry predicts these manifolds are dual to one another, a strange relationship called symplectic duality. All this is a 2D shadow of true 3D mirror symmetry. 

| <img src="/gallery/images/symmetree/shadow.jpg" alt="Shadow of the symme-tree. On the left, the higgs branch. On the right, the coloumb branch. These are related by deformation quantization and symplectic duality. utop the shadow lives a number of snake creatures" width="600"> |
| -- |
| The 2D shadow of 3D mirror symmetry.  | 


If we took a shadow again, then the 4D theory would become 2D. Here, mirror symmetry predicts the [geometric Langlands correspondence](https://arxiv.org/abs/hep-th/0604151), a geometric instantiation of the perhaps widest reaching research program of modern mathematics. 

| <a href="/talk/Kapustin-Witten"><img src="/assets/images/symmetree/langlands.jpeg" alt="A flowchart in a watercolor style. As a bridge between the two sides, it shows: The Geometric langlands correspondence, S duality, and the SYZ transform." width="600"> </a> |
| -- |
|A flowchart showing the physical interpretation of the geometric Langlands correspondence. This image came from my talk, [linked here](/talk/Kapustin-Witten)   | 

There are many more relationships, some drawn and most not. This microcosm shows the power of physics in math: Organizing ideas, tying together fields, suggesting conjectures using a separate intuition. Physics does shockingly good at its job.

## Geolocation

This art was commissioned by [Justin Hilburn](https://jrhilburn.github.io/) to explain his research program, and its particular perspective on the field. The picture appears on his website.

This also appeared in:
- The [Intersections exhibition](https://seattlemathmuseum.org/events/intersection-exhibition-mar-3-apr-25-25) at the Seattle Universal Math Meuseum (SUMM)
- Math Art exhibit at MathFest, August 2025
- The image for the [Geometric representation theory and 3d mirror symmetry](https://www.slmath.org/workshops/1162) conference at SLMath, Fall 2025
