---
layout: default
title: Math Diary
permalink: /teaching/diary
show_sidebar: true
---

# Math Diary

Welcome to my math diary. 

I have a a whole summer reserved for nothing but math. No classes, no teaching, no summer schools (they didn't accept me), no mentors to meet with, no structure. Historically, this arrangement would find my days watching youtube and consumed by grimbles. But no longer! To keep myself accountable, I'm going to write what math I'm doing, each day, every day. Hopefully I'll become more efficient and comfortable with writing math too. I stole the math diary idea from [@Right_Inverse](https://twitter.com/Right_Inverse/status/1652711830500831232). I'm also forever inspired by John Baez and his classic blog [this weeks finds](https://math.ucr.edu/home/baez/TWF.html), which I find myself referencing every now and again. 

Math wise, I have two projects this summer. First, I've been a complex geometer pretending to do algebraic geometry for a while now. Issue is, I've never learned how to take Spec of a ring, or any commutative algebra in general. That's like doing geometry without knowing calculus. I want to actually learn AG right. 

Second, and more excitingly, a potential advisor suggested a problem to guide my readings: Let $$X$$ be a manifold, and $$\mathcal{L} X = \text{map}(S^1,X)$$ be its free loop space. This is an infinite dimensional manifold, but we can still make sense of the de-rahm operator $$\text{d}$$, and its cohomology $$H^*(\mathcal{L}X)$$. If $$X$$ is a complex manifold, then $$\Omega X$$ inherits its complex structure. This begs the question,  *What is the hodge decomposition of loop space, $$H^n(\mathcal{L}X)=\bigoplus\limits_{p+q=n} H^{p,q}(\mathcal{L} X)$$?*   

# 5/1/23


## Talks 

The string math seminar is going absolutely bonkers now that classes are over. Two hours a session, two times a week, and they're flying out some big famous people to give little minicourses. This is really good for me, because people will have time to talk about the basic stuff, and I might get lost. Today was Denis Nesterov, introducing his research studying enumerative geometry (i.e curve counting) on moduli spaces of sheaves. Today, an introduction to *Quasimap theory*.

The talk fit into a couple general trends. First, the strange phenomena where all topological invariants named after witten are somehow equivalent: Seiberg-Witten invariants, Gromov-Witten invariants, Vafa-Witten invariants, and Donaldson-Thomas invariants (for the sake of variety). These fit into a huge web of complicated dualities, and many string-math talks are about connecting some of the strands. This talk goes between Donaldson-Thomas (DT) theory (which counts sheaves on a surface $$S$$ times a curve $$C$$), and Gromov-Witten (GW) theory (which counts curves on The moduli space of sheaves on $$S$$). This is notably **not** the usual equivalence between GW and DT theory.

Second, this talk manifests the vibographic principle of algebro-geometric moduli spaces: *All moduli spaces are Hilbert schemes*. I guess this shouldn't be too surprising: Hilbert schemes are moduli spaces of sub-schemes of a scheme. My favorite example is the hilbert scheme of points $$Hilb^n(M)$$: Moduli spaces of unordered collections of $$0$$-dimensional sub-schemes (i.e points) on a space $$M$$. this is similar to the symmetric product $$M^n = M \times \dots \times M / S^n$$, which is a singular when a couple points coincide.  The Hilbert scheme knows more: It remembers the *direction* that the two points collide. $$Hilb(n)$$ is the blowup of $$M^n$$ along the singular diagonal, a resolution of singularities, a *smooth* space. 

Hilbert schemes give nice smooth spaces, and a natural way to compactify things (for example, moduli spaces of unordered points which are all distinct). With clever uses of Hilbert schemes, we can construct all possible resolutions of all possible 2D singularities (see [Hilbert schemes and simple singularities](https://www.math.sci.hokudai.ac.jp/~nakamura/ADEHilb.pdf) by Ito and Nakamura). The moduli space of instatons in $$\mathbb{R}^4$$ is a Hilbert scheme of points, by the ADHM construction. Nakajima has lots of work interpreting moduli spaces as Hilbert schemes. Very cool critters.

Now about the talk. First, we relate the space of maps from a curve $$C$$ into a surface $$S$$, to a Hilbert scheme. We think of $$f:C \to S$$ using its graph, a 1 dimensional subscheme of $$C \times S$$. So, the moduli space of $$f$$ sits inside the moduli space of 1D sheaves $$Hilb_1(C\times S)$$. This gives us a natural compactification, an algebraic manifestation of bubbling. (Bubbling is how we compactify maps of curves into surfaces in the symplectic world. The curve can nodal degenerations, like a bunch of bubbles branching off your original curve)

Consider, for example, a map $$f:S^1 \to S^1$$, which we identify a with a graph $$S^1 \hookrightarrow S^1\times S^1 = T^2$$. Suppose we degenerate $$f$$ to a Dirac delta: Its constant almost everywhere, except on a tiny region, where it goes all around the image $$S^1$$. Then, the graph limits from a single $$S^1$$ wrapped around $$T^2$$ to two copies of $$S^1$$, one circling toroidially  and the other meridionally. This is nonreduced (i think), but its still contained in $$Hilb_1(T^2)$$! Alternatively, we bubble $$S^1$$ into two copies of $$S^1$$, joined at a point, and demand that one of the copies maps to the identity.  What a good little compactification :)

Next, we realize that the surface $$S$$ naturally embeds into this big scary infinite dimensional stack, the moduli space $$\mathcal{S}$$ of all possible sheaves on $$S$$. We realize this by sending each point on $$S$$ to its ideal sheaf (whatever that is). The central points that **The Hilbert scheme compactification is equivalent to the natural sheaf-theoretic one**: The moduli space of maps from the curve $$C$$ to the scary moduli space $$\mathcal{S}$$, such that $$C$$ lives in $$S \subset \mathcal{S}$$ almost everywhere. This is called the *Moduli space of quasi-maps $$Q(C,S)$$*. In general a *quasimap* is a map from a a space $$X$$ to a moduli space $$\mathcal{M}$$ with a stability condition, such that $$X$$ maps into the stable locus of $$\mathcal{M}$$ almost everywhere. 

## Learning

Like the intro says, I want to understand differential operators on the loop space $$\mathcal{L} X$$ of a complex manifold $$X$$. Today, let me list the structures that come up in this problem. In future days, I hope to get to know these objects, and understand how to connect them. First off, the loop space $$\mathcal{L}X$$ carries a few natural structures:
- From the manifold structure, we have the de-rahm operator $$\text{d}$$. 
- When $$X$$ is spin, so too is $$\mathcal{L} X$$. So, we have a natural spinor bundle $$S$$ with Dirac operator $$D$$. 
- There is a natural $$S^1$$ action on $$\mathcal{L}X$$ which rotates each loop. The fixed points are the constant loops, which realize $$X$$ as a submanifold of $$\mathcal{L}X$$. 


In analogy to the finite dimensional case, we expect that we can extract topological data on $$\mathcal{L}X$$ (and thus $$X$$) from these operators.
- The $$S^1$$-equivariant index of the Dirac operator $$D$$ on $$\mathcal{L}X$$ is called the *Witten genus* of $$X$$.  We can further refine and categorize this into *Elliptic cohomology*, a cohomology theory whose Euler characteristic is the witten genus. Note that, by the general principle of equivariant localization, the equivariant index is entirely determined by local data on the fixed point set. So, it amounts to integrating differential forms associated to bundles on $$X$$. By Chern-Weil theory, this is a topological invariant. See [Witten's original paper](https://link.springer.com/chapter/10.1007/BFb0078045)
- We have a sheaf of differential forms with De-Rahm operator on $$\mathcal{L}X$$. Pushing forward onto $$X$$, we get a new sheaf, called the *Chiral De-Rahm complex*. See [Malikov, Schechtman and Vaintrob](https://arxiv.org/pdf/math/9803041.pdf) which introduced this critter. 
- The chiral de-rahm complex is an example of vertex operator algebra. 

These ideas have one foot in string theory. Witten's motivation was to study supersymmetric string theory as quantum mechanics on loop space. The vertex operator algebras are motivated by constructions in conformal field theory. Physics wise, string theory is essentially identical to conformal field theory on the worldsheet.

Finally, there are a few fundamental examples of loop spaces where these constructions are especially important.
- Loop groups: $$\mathcal{L}G$$ is also a group. These are very fundamental objects in math. The quotient $$\mathcal{L}G/\mathcal{L}_+G$$ is called the affine grassmanian, and it controls the moduli space of $$G$$ bundles on surfaces, among other things. In integrable systems theory, the scattering transform turns a differential equation into an element of the loop group. See segal's section of [Hitchin Segal Ward](http://www.math.toronto.edu/khesin/biblio/hitchin_segal.pdf)
- Flag spaces of loop groups, called semi-infinite flag manifolds. Sheaves on this space geometrically realize representations of Kac-moody algebras, the lie algebra of $$\mathcal{L}G$$ (Think of this like Borel-Bott-Weil). I think this is an example where the Chiral de-rahm complex has a nice, geometric representation theory construction.

As you can see, there are lots of moving parts. Its time for me to figure out if the above descriptions are oversimplifications, or just incorrect. Once I build each part, I can mesh them together :)





# May 2 2023
Today was the last day of my index theory class. We learned about the Atiyah-Singer index theorem, a landmark result relating topology with analysis on manifolds. Start with a *Elliptic* differential operator $$D$$ on a manifold $$M$$. Elliptic operators are things which act like a laplacian, and they are the nicest operators you ever will see. For one, the solutions to $$Df=0$$ are automatically smooth, by a little bit of magic called elliptic regularity. In the land of PDEs, where so much time is spent juggling the specific regularity and number of allowed derivatives of a function, elliptic regularity is a cheat code. Also, the space of solutions (the kernel of $$D$$) is always a finite dimensional vector space. The cokernel, which is the target of $$D$$ modulo the image of $$D$$, is also finite dimensional.   The difference of dimensions of the kernel and cokernel is called the *Index* of $$D$$. 

For example, take the laplacian $$\Delta$$ acting on differential forms. Hodge theory tells you that every solution to the Laplace equation $$\Delta f=0$$ has to circle a hole in the manifold $$M$$, and the number of solutions counts the number of holes. More precisely, the the kernel of $$\Delta$$ is isomorphic to the cohomology $$H^*(M)$$. But notice, even though the laplacian depends on the metric of $$M$$, the dimension of its kernel does not. It is a topological quantity. The *Atiyah-Singer index theorem* states that a similar fact is true for all Elliptic operators: The index (dimension of kernel minus cokernel) is a topological invariant, and there is an explicit formula using characteristic classes. This generalize a great number of other theorems. Applied to the the exterior derivative $$\text{d}$$ on a surface, the index (an integer) equals the integral of the curvature. For higher dimensional manifolds, it says index of $$\text{d}$$ is the euler charecteristic. Applied to the Dolbeaut operator $$\overline{\partial}$$, we get the Riemann-Roch theorem. 

The goal of this class was to prove the Atiyah-Singer index theorem, with no gaps, starting from basic differential geometry. This involves a huge tower of structures: Principle bundles and their curvature, characteristic classes, spin geometry and the Dirac operator, and PDE theory of elliptic operators. And it culminated in todays 2 and a half hour lecture, proving the index theorem for Dirac operators and deriving the formula for their index, the $$\hat{A}$$ genus. 

## How to prove the index theorem

First, some background about Dirac operators. They were born from need in physics. Dirac wanted to understand how quantum mechanics worked relativistically. The quantum world is governed by the Schrodinger equation, $$i \partial_t \Psi = \Delta \Psi$$ where $$\Delta$$ is the spacial laplacian. This bothered Dirac, because in special relativity, time and space should be in equal footing. How can time be degree 1, and space degree 2? To fix this, Dirac needed a first order differential operator $$D$$ such that $$D^2 = \Delta$$. Then, the defining equation $$i\partial_t s = Ds$$ is purely degree 1, and all kosher. Unfortunately, no such $$D$$ exists... for scalar  functions. But we can make a matrix valued operator $$D$$ with $$D^2 = \Delta$$! The algebraic structure underlying these matrices are called Clifford algebras, and this realization is the birth of spin and related ideas. 

Dirac operators are somehow **the** example of degree 1 elliptic operators. They included the exterior derivative $$\text{d}$$ and dolbeaut operator $$\overline{\partial}$$ as special cases. In fact, if you understand them very well, you understand most things for higher degree too. So let's focus on the index theorem for the dirac operator $$D$$ canonically associated to a spin manifold$$M$$. The statement is roughly:

$$\text{index} D = \hat{A}(M)  = \int_M \frac{\sqrt{R}/2}{\sinh \sqrt{R}/2}$$

Where $$R$$ is a collection of terms involving the curvature of the metric on $$M$$, and the right hand side is evaluated by expanding its talyor series, and using characteristic classes of $$TM$$ to evaluate the term of degree equal to the dimension of $$M$$. This looks like *such* a weird formula: where did the sinh come from? what's going on?

Let me do my best to sketch a proof. Fundamentally, we will write down an integral and solve it in a couple different ways: One analytic (the index), and the other topological.

**Idea 1: use the trace**
Alright, first we need to express the index (which basically counts solutions to $$Ds=0$$) using an integral. For the first clever point of the proof, we use the trace! The space which dirac operators acts on $$S$$ naturally splits into $$S^+ \oplus S^-$$, and the dirac operator exchanges the two subspaces. That is, $$D = D^+ + D^-$$, where $$D^\pm : S^\pm \to S^\mp$$.  This means all nonzero eigenvalues come in pairs. Consider a new operator $$e^{tD^2}$$, which will similarly split according to $$S^\pm$$ and have pairs of nonzero eigenvalues. We take the *Supertrace:* the trace of $$e^{-tD^2}$$ on $$S^+$$, minus the trace of $$e^{-tD^2}$$ on $$S^-$$. Since eigenvalues come in pairs, all nonzero eigenvalues cancel out! We are left with the trace of $$e^{tD^2}$$ on the zero eigenspace of $$D$$. But, $$e^{-tD^2}$$ equals the identity on the zero eigenspace, and its trace measures the dimension! In conclusion, we have the *Mckean-singer formula*, For any value of $$t$$, 

$$\text{index} D = str \, e^{-tD^2}$$

The trace is a very local quantity. we can compute it with respect to the basis of $$L^2(M)$$ provided by dirac delta functions at the point $$x$$, denoted by $$\|x\rangle$$. the trace is the integral

$$str \, e^{tD^2} = \int_M \langle x |e^{-tD^2}|x\rangle \text{d} x$$

**Idea 2: use the heat kernel** 
Now let's examine $$e^{tD^2}$$. Like all good exponentials, this operator is the solution of the differential equation $$\partial_t \Psi = -D^2 \Psi$$. But, $$D^2 = \Delta$$ the laplacian! (Strictly speaking, on a manifold, $$D^2 = \Delta + R$$ is a 2nd degree operator equaling the laplacian, plus a zeroth order curvature term. )  So, the equation above is a heat equation. If $$s_0$$ is the initial configuration of the heat equation, then $$e^{-t D^2}s_0$$ is the solution after time $$t$$. 

We can express the information of $$e^{-t D^2}$$ in a *heat kernel*: Drop a dirac delta at a point $$p$$, simulate for time $$t$$ under the heat equation, then define $$k_t(p,q)$$ to be the resulting function at a point $$q$$. The supertrace above asks for $$\int_M k_t(p,p)$$: If you drop a dirac delta at a point $$p$$, how much remains at $$p$$ after time $$t$$?

We can pick any positive value of $$t$$ we'd like, so let's look at the short time limit. The heat kernel $$k_t(p,\cdot)$$ is approximately a gaussian centered about $$p$$, with some number of additional polynomial terms. Turns out, the supertrace selects out the term with degree equal to half the dimension of $$M$$, and ignores everything else. Evaluating the supertrace (and thus index) becomes evaluating the special term of the asymptotic of the heat kernel. The term in the asymptotic expansion is a differential form, which when integrated across the manifold, gives a Chern class and a topological invariant. 

At this point, we are in principle done. We can choose coordinates, plug in the asymptotic expansion to the defining property of heat kernels, and collate differential equations relating the terms. While annoying, we can hypothetically  solve every diffeq and calculate the $$\hat{A}$$ genus. But this is really ugly - how can we simplify the problem more, and see the origin of the formula for the $$\hat{A}$$-genus?

**Idea 3: Renormalize**
The last step is one philosophically familiar to physicists. We start with an operator $$D^2 = \Delta + R$$, where the curvature $$R$$ varies in a complicated way with position. We rescale our manifold, zooming way in to a point $$p$$. Then the higher order terms of the curvature all die off, and we are left with a quadratic function. In other words, the schrodinger equation with a harmonic oscillator potential.  Here, the exact solution is known. For the 1D harmonic oscsilator with potential $$\frac{-a}{16}x^2$$, It's called the *Mehler kernel:*

$$k_t = \frac{1}{t^2} \sqrt{\frac{ta}{\sinh(ta)}} \exp(-a \cosh(at)x^2)$$

We can see finally where the $$\sinh$$ term in the $$\hat{A}$$ genus above! Using this, we get the index of the deformed oeprator equals the $$\hat{A}$$ genus.

Now here's the magic: We know already that *the index is a topologically invariant quantity*. So, the answer should stay the same as you limit the size to be very large (discussed above) or very small (measuring topological quantities). In particular, the approximate harmonic oscillator potential doesn't yield an approximate solution: It yields an *Exact* one.

And that's the proof! It's a really beautiful idea, I've never seen the full proof before. Though, the details do get quite hairy in implementation.  Still, fun and helpful class :).