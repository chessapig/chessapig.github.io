---
tags: [diary]
date: AAA May 1 2023
title: Quasimaps and loop spaces
---

Welcome to my math diary. 

I have a a whole summer reserved for nothing but math. No classes, no teaching, no summer schools (they didn't accept me), no mentors to meet with, no structure. Historically, this arrangement would find my days watching youtube and feeling crumby. But no longer! To keep myself accountable, I'm going to write what math I'm doing, each day, every day. Hopefully I'll become more efficient and comfortable with writing math too. I stole the math diary idea from [@Right_Inverse](https://twitter.com/Right_Inverse/status/1652711830500831232). I'm also forever inspired by John Baez and his classic blog [this weeks finds](https://math.ucr.edu/home/baez/TWF.html), which I find myself referencing every now and again. 

Math wise, I have two projects this summer. First, I've been a complex geometer pretending to do algebraic geometry for a while now. Issue is, I've never learned how to take Spec of a ring, or any commutative algebra in general. That's like doing geometry without knowing calculus. I want to actually learn AG right. 

Second, and more excitingly, a potential advisor suggested a problem to guide my readings: Let $X$ be a manifold, and $\mathcal{L} X = \text{map}(S^1,X)$ be its free loop space. This is an infinite dimensional manifold, but we can still make sense of the de-rahm operator $\de$, and its cohomology $H^*(\mathcal{L}X)$. If $X$ is a complex manifold, then $\Omega X$ inherits its complex structure. This begs the question,  *What is the hodge decomposition of loop space, $H^n(\mathcal{L}X)=\bigoplus\limits_{p+q=n} H^{p,q}(\mathcal{L} X)$?*   

# 5/1/23


## Talks 

The string math seminar is going absolutely bonkers now that classes are over. Two hours a session, two times a week, and they're flying out some big famous people to give little minicourses. This is really good for me, because people will have time to talk about the basic stuff, and I might get lost. Today was Denis Nesterov, introducing his research studying enumerative geometry (i.e curve counting) on moduli spaces of sheaves. Today, an introduction to *Quasimap theory*.

The talk fit into a couple general trends. First, the strange phenomena where all topological invariants named after witten are somehow equivalent: Seiberg-Witten invariants, Gromov-Witten invariants, Vafa-Witten invariants, and Donaldson-Thomas invariants (for the sake of variety). These fit into a huge web of complicated dualities, and many string-math talks are about connecting some of the strands. This talk goes between Donaldson-Thomas (DT) theory (which counts sheaves on a surface $S$ times a curve $C$), and Gromov-Witten (GW) theory (which counts curves on The moduli space of sheaves on $S$). This is notably **not** the usual equivalence between GW and DT theory.

Second, this talk manifests the vibographic principle of algebro-geometric moduli spaces: *All moduli spaces are Hilbert schemes*. I guess this shouldn't be too surprising: Hilbert schemes are moduli spaces of sub-schemes of a scheme. My favorite example is the hilbert scheme of points $Hilb^n(M)$: Moduli spaces of unordered collections of $0$-dimensional sub-schemes (i.e points) on a space $M$. this is similar to the symmetric product $M^n = M \times \dots \times M / S^n$, which is a singular when a couple points coincide.  The Hilbert scheme knows more: It remembers the *direction* that the two points collide. $Hilb(n)$ is the blowup of $M^n$ along the singular diagonal, a resolution of singularities, a *smooth* space. 

Hilbert schemes give nice smooth spaces, and a natural way to compactify things (for example, moduli spaces of unordered points which are all distinct). With clever uses of Hilbert schemes, we can construct all possible resolutions of all possible 2D singularities (see [Hilbert schemes and simple singularities](https://www.math.sci.hokudai.ac.jp/~nakamura/ADEHilb.pdf) by Ito and Nakamura). The moduli space of instatons in $\mathbb{R}^4$ is a Hilbert scheme of points, by the ADHM construction. Nakajima has lots of work interpreting moduli spaces as Hilbert schemes. Very cool critters.

Now about the talk. First, we relate the space of maps from a curve $C$ into a surface $S$, to a Hilbert scheme. We think of $f:C \to S$ using its graph, a 1 dimensional subscheme of $C \times S$. So, the moduli space of $f$ sits inside the moduli space of 1D sheaves $Hilb_1(C\times S)$. This gives us a natural compactification, an algebraic manifestation of bubbling. (Bubbling is how we compactify maps of curves into surfaces in the symplectic world. The curve can nodal degenerations, like a bunch of bubbles branching off your original curve)

Consider, for example, a map $f:S^1 \to S^1$, which we identify a with a graph $S^1 \hookrightarrow S^1\times S^1 = T^2$. Suppose we degenerate $f$ to a Dirac delta: Its constant almost everywhere, except on a tiny region, where it goes all around the image $S^1$. Then, the graph limits from a single $S^1$ wrapped around $T^2$ to two copies of $S^1$, one circling toroidially  and the other meridionally. This is nonreduced (i think), but its still contained in $Hilb_1(T^2)$! Alternatively, we bubble $S^1$ into two copies of $S^1$, joined at a point, and demand that one of the copies maps to the identity.  What a good little compactification :)

Next, we realize that the surface $S$ naturally embeds into this big scary infinite dimensional stack, the moduli space $\mathcal{S}$ of all possible sheaves on $S$. We realize this by sending each point on $S$ to its ideal sheaf (whatever that is). The central points that **The Hilbert scheme compactification is equivalent to the natural sheaf-theoretic one**: The moduli space of maps from the curve $C$ to the scary moduli space $\mathcal{S}$, such that $C$ lives in $S \subset \mathcal{S}$ almost everywhere. This is called the *Moduli space of quasi-maps $Q(C,S)$*. In general a *quasimap* is a map from a a space $X$ to a moduli space $\mathcal{M}$ with a stability condition, such that $X$ maps into the stable locus of $\mathcal{M}$ almost everywhere. 

## Learning

Like the intro says, I want to understand differential operators on the loop space $\mathcal{L} X$ of a complex manifold $X$. Today, let me list the structures that come up in this problem. In future days, I hope to get to know these objects, and understand how to connect them. First off, the loop space $\mathcal{L}X$ carries a few natural structures:
- From the manifold structure, we have the de-rahm operator $\mathrm{d}$. 
- When $X$ is spin, so too is $\mathcal{L} X$. So, we have a natural spinor bundle $S$ with Dirac operator $D$. 
- There is a natural $S^1$ action on $\mathcal{L}X$ which rotates each loop. The fixed points are the constant loops, which realize $X$ as a submanifold of $\mathcal{L}X$. 


In analogy to the finite dimensional case, we expect that we can extract topological data on $\mathcal{L}X$ (and thus $X$) from these operators.
- The $S^1$-equivariant index of the Dirac operator $D$ on $\mathcal{L}X$ is called the *Witten genus* of $X$.  We can further refine and categorize this into *Elliptic cohomology*, a cohomology theory whose Euler characteristic is the witten genus. Note that, by the general principle of equivariant localization, the equivariant index is entirely determined by local data on the fixed point set. So, it amounts to integrating differential forms associated to bundles on $X$. By Chern-Weil theory, this is a topological invariant. See [Witten's original paper](https://link.springer.com/chapter/10.1007/BFb0078045)
- We have a sheaf of differential forms with De-Rahm operator on $\mathcal{L}X$. Pushing forward onto $X$, we get a new sheaf, called the *Chiral De-Rahm complex*. See [Malikov, Schechtman and Vaintrob](https://arxiv.org/pdf/math/9803041.pdf) which introduced this critter. 
- The chiral de-rahm complex is an example of vertex operator algebra. 

These ideas have one foot in string theory. Witten's motivation was to study supersymmetric string theory as quantum mechanics on loop space. The vertex operator algebras are motivated by constructions in conformal field theory. Physics wise, string theory is essentially identical to conformal field theory on the worldsheet.

Finally, there are a few fundamental examples of loop spaces where these constructions are especially important.
- Loop groups: $\mathcal{L}G$ is also a group. These are very fundamental objects in math. The quotient $\mathcal{L}G/\mathcal{L}_+G$ is called the affine grassmanian, and it controls the moduli space of $G$ bundles on surfaces, among other things. In integrable systems theory, the scattering transform turns a differential equation into an element of the loop group. See segal's section of [Hitchin Segal Ward](http://www.math.toronto.edu/khesin/biblio/hitchin_segal.pdf)
- Flag spaces of loop groups, called semi-infinite flag manifolds. Sheaves on this space geometrically realize representations of Kac-moody algebras, the lie algebra of $\mathcal{L}G$ (Think of this like Borel-Bott-Weil). I think this is an example where the Chiral de-rahm complex has a nice, geometric representation theory construction.

As you can see, there are lots of moving parts. Its time for me to start building up each part, and meshing them together :)f