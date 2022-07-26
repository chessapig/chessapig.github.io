---
layout: default 
title:  "The shape of motion: A primer on geometric mechanics"
date:   2022-07-24 16:03:47 -0500
categories: blog
excerpt: "An introduction to symplectic geometry and classical mechanics, meant to introduce the ideas needed for the Harmonic osscilator thingy. "
---

<script language="javascript" type="text/javascript" src="/sketch/libraries/p5.min.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/p5.gui.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/quicksettings.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/MyGUI/MyGUI.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/noise/opensimplex.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/libraries/noise/noise.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/toric_engine/toric-library-instanced.js"></script>
<script language="javascript" type="text/javascript" src="/sketch/toric_engine/1D oscillator sim.js"></script>


# Introduction
A physicist sees the world through harmonic oscillators. The very first thing they study is the motion of a spring, equivalently a particle sitting in a characteristic quadratic potential. They then generalize to quantum mechanics, or to classical field theory and the wave equations, then to the free field in quantum field theory. Reality is merely a perturbed oscillator. Armed with this simple example they completely understand, physicists can tackle much harder problems. 

What then is the geometer's harmonic oscillator? It's not so cut and dry, but I'd argue its the *circle*. The group of circle rotations $U(1)$ is one of the simplest Lie groups, being 1 dimensional and thus abelian. Unlike it's cousin $$\mathbb{R}$$, $$U(1)$$ is compact and has a little bit more meat on its bones. Moving to geometry, you can "rotate" a manifold with a $$U(1)$$ action, imposing useful symmetries. Taken to its logical extreme, a "toric" manifold has a maximal possible set of independent rotations, encoded by an action by the torus group $$U(1)^n$$. These manifolds are entirely determined by their rotation structure, which is moreover entirely combinatorial. This is neatly encoded in a polytope, from which you can read off nearly every property you could care about. Toric manifolds are a geometers playground, letting them easily test their ideas. Like the oscillator, it is a simple example which we completely understand. [^1]


[^1]: At least, more completely than most anything else in geometry.

The analogous role of toric manifolds and harmonic oscillators is no accident. In the framework of symplectic geometry, a field born form classical mechanics, many circle actions come from harmonic oscillators. I want to show you toric geometry through a physicists glasses, promoting harmonic oscillators to a starring role. As we will see, they give concrete dynamical interpretations to all the big ideas 

---

# The shape of motion: A primer on geometric mechanics

The Hamiltonian formulation of classical mechanics studies motion of objects, like a ball on a spring, as a flow through some phase space. Like most physics, phase space was originally implicitly assumed to be Euclidean, but the complexities of celestial mechanics outgrew this local version. Phase space was reinterpreted as a *manifold*, endowed with a "symplectic form" which controlled the dynamics. Thus, symplectic geometry was born. Eventually, symplectic geometry separated from its physical origin to become its own field of mathematics. 

We start with the canonical example, which we will develop much, much more over time

## The harmonic oscillator and Hamiltonian mechanics

Consider a ball on a spring. This gives a restoring force proportional to its displacement, which is lots of fun to throw around. You can grab it with your mouse:

<div class="container">
    <div class="sketch" id="oscillator1DnoGraph"></div>
</div>



The force is proportional to the acceleration, meaning the motion is described by the following differential equation:

$$\ddot{x} = -x$$ 

Where all annoying constants like mass or the spring constant are set to one. The dynamics of this diffeq are easier to grasp in its equivlent system of first order of coupled differential equations:

$$\dot p = - x$$

$$\dot x = p$$

a physical state is a pair of position $$x$$ and "momentum" $$p$$, defining a point in "phase space" $$\mathcal{P} =\mathbb{R}^2$$.

<div class="container" style="margin-left:25%; margin-right:25%">
    <div class="sketch" id="oscillator1D"></div>
</div>


The equations are encoded in a vector field over phase space. Solving the system, a state evolves by rotating at a constant rate in $$\mathbb{R}^2$$. Focusing on the position, we see the particle oscillates sinusoidally with time. 

We can cast theses equations in the more suggestive form

 
\begin{gather}
	\dot p = -\frac{\partial H}{\partial x} \qquad \dot x = \frac{\partial H}{\partial p}\\
	H(x,p) = p^{2} + x^{2}
\end{gather}


==say why these come from: Rotate 90 degrees==

The evolution of position and momentum are controlled by the derivatives of a single function on phase space, which we call the Hamiltonian. 

The harmonic oscillator is characterized by the quadratic Hamiltonian. Their physical ubiquity stems from the mathematical role of quadratics, appearing as low order terms in Taylor series. But this Hamiltonian has a distinguished property that we've already seen: It generates rotation! If you start with a set of points set at different distances from zero, they will rotate at lock step, never falling out of phase. Formally, we can represent the evolution of a point of phase space $$\mathcal{P}$$ after time $$t$$ by a map $$\psi_t : \mathcal{P} \to \mathcal{P}$$. The harmonic oscillator is periodic with period $$T = 2\pi$$, meaning everything returns after time $$T$$, $$\psi_T = id$$. This periodicity, along with the identity $$\psi_t \circ \psi_s = \psi_{t+s}$$, means the evolution $$\psi_t$$ is an $$U(1)$$ action on $$\mathcal{P}$$. This is the fundamental connection between harmonic oscillators and the circle group, mentioned in the introduction. We will see many consequences of this connection below.

>### Remark
> The harmonic oscillator is uniquely characterized by this periodicity. There are many other Hamiltonians on $$\mathbb{R}^2$$ where every point is periodic, with the same period. However, these all come from composing the harmonic oscillator Hamiltonian with an area-preserving diffeomorphisms, meaning they are harmonic oscillators in a different set of coordinates. 



We can make the $$U(1)$$ action explicit by identifying phase space $$\mathbb{R}^2$$ with the complex plane $$\mathbb{C}$$, where $$x$$ is the real part and $$p$$ is the imaginary part. Realizing $$t \in U(1)$$ as a unit norm element in the complex plane, the evolution $$\psi_t$$ is multiplication by $$t$$.

These equations naturally generalize to higher dimensions. in $$n$$ dimensions, there are n position variables $$x_1, \dots, x_n$$ with associated momenta $$p_1, \dots, p_n$$, defining a point in phase space  $$\mathcal{P} = \mathbb{C}^n$$. The Hamilton equations on this phase space are 

$$
\begin{align}
\dot p_{i}&= -x_i\\
\dot{x_{i}} &= p_i
\end{align}
$$


The standard harmonic oscillator in $$n$$-dimensions is defined by a Hamiltonian 

$$H = \sum_i x_i^2 + p_i^2 $$

But we notice this essentially describes $$n$$ different, noninteracting harmonic osscilators. Leaning into this, we split $$H$$ into consitituent parts: ^0da6d9

$$H= \sum_i H_i ,\qquad H_i = x_i^2 + p_1^2$$

Each Hamiltonian $$H_i$$ rotates its own factor of $$\mathbb{C}$$ in phase space.

This procedure is ethos of Hamiltonian mechanics. Mechanics lives on phase space, whose structure converts a Hamiltonian function to a vector field, describing evolution under that Hamiltonian.

--- 

## Symplectic Mechanics

%%==Cotangent bundle of spaces, inspired by pendulum==%%

Now we turn to geometry. We want to eventually replace the phase space $$\mathbb{C}^n$$ with an arbitrary manifold $$\mathcal{P}$$, and somehow define mechanics on $$\mathcal{P}$$ that reduces to the hamiltons equations above in some coordinate chart. This is tricky with the coordinate-dependent formula [[2 A primer on geometric mechanics#^eq--Hamiltons]], so we need a coordinate invariant formulation. We achieve this using differential forms. 


This finally motivates the phase space structure of a manifold $$\mathcal{P}$$ is encoded in a 2-form $$\omega$$, called the *Symplectic form*, Such that:

- $$\omega$$ is nondegerenate, as a linear transform sending $$T^*\mathcal{P}$$ to $$T\mathcal{P}$$.
- $$\text{d}\omega = 0$$. 

The first condition ensures that there always exists a unique Hamiltonian vector field $$X_H$$ such that $$\omega(X_H,-) = \text{d}H$$. The second ensures that the sympletic form is locally modeled on the standard phase space. Closedness is necessary because the syandard symplecitc form $$\mathbb{C}^n$$ is certainly closed, but remarkeably closeness is also sufficient. This is called [[Darboux's theorem]]:



>### Theorem: (Darboux)
>Let $$(\mathcal{P},\omega)$$ be a symplectic manifold. Each point $$p\in \mathcal{P}$$, has a neighborhood $$U$$ with coordinate chart $$\phi:U\to \mathbb{C}^n$$ such that $$\omega$$ is the pullback of the standard symplectic form on $$\mathbb{C}^n$$. That is, $$U$$ has coordinates $$q_i , p_i$$ such that $$\omega = \text{d}q_1 \wedge \text{d}p_1 + \dots + \text{d}q_n \wedge \text{d}p_n$$
^thm--Darboux

This fact makes symplectic geometry feel significantly different from other sorts of geometry. Compare this with the analagous statement in Riemannian geometry: A metric can be put in the standard, euclidean form *pointwise*, but on an open neighborhood it can diverge from the standard due to its curvature. However, Darboux's theorem says the standard form holds on the whole open est. There are no local invariants of a symplectic form akin to curvature. Said another way, all symplectic forms are locally isomorphic. This gives symplectic geometry a fundamentally globally character, to the point that the names "symplectic geometry" and "symplectic topology" are used interchangably. 

>### Remark: Proof of Darboux's theorem
>You can find a proof of Darboux's theorem in any book on symplectic geometry[^2], but to not leave you high and dry, let me give you the gist. We want to show any two symplectic forms on a small open set are equivalent by constructing a symplectomorphism: A diffeomorphisms pulling back one form to the other. (In particular, this can relate the given symplectic form to the standard one). We will instead look for an explicit path of diffeomorphisms, which is infinitesimally encoded in a time-varying vector field. A little manipulation shows this vector field satisfies a differential equation, which in fact is a version of Hamilton's equations. By non-degeneracy, we know a solution to Hamilton's equations exists, and we are done! Though constructing a whole path of diffeomorphisms seems like it would be harder, it lets us exploit the infinitesimal geometry that we know how to manipulate. This bit of slight-of-hand is called *Moser's trick*.  Symplectic geometry has many similar results turning structures into a standard form, all proven with a suitably generalized Moser's trick. 

[^2]: The canonical reference is *Sympelctic Topology* by McDuff and Salamon

Note that $$\omega$$ as a matrix is skew-symmetric, since it comes from a 2-from. In particular, if $$n$$ is odd, $$\omega$$ must have an unpaired zero eigenvalue, and be degenreate. So, nondegenracy means that symplectic manifolds are always even dimsnional.

>### Example: Symplectic structure on $$S^2$$
>The two dimensional sphere can be given a symplectic structure. Construct $$S^2$$ as the set of vectors of unit length in $$\mathbb{R}^3$$. For a vector $$p$$ with unit length, the tangent space to the sphere is naturally the set of vectors normal to $$p$$. A symplectic form takes two tangent vectors $$v,w$$ and bilinearly returns a number. We define the standard symplectic form $$\omega_s$$ using the cross product of vectors in $$\mathbb{R}^3$$:
>
>$$\omega_s(v,w) = ||v \times w ||$$
>
>This defines a two form because the cross product is bilinear and antisymmetric. As a two-form on a two dimensional manifold, it is necessarily closed. It is nondegenerate because any $$v$$ has a $$w$$ such that $$v \times w \neq zero$$, for instance $$w = p\times v$$. Hence, it is indeed symplectic.

---
## Symmetries of Classical Mechanics
A symmetry of classical mechanics is a symmetry of phase space, which is a manifold with a symplectic structure. For a general manifolds, symmetries are *Diffeomorphisms*, differentiable bijective maps with differentiable inverses. These form a group where multiplication is composition of diffeomorphisms, which in particular has an infinitesimal structure. A path of diffeomorphisms can be described infinitesimally by a differentiable vector field, which points in the direction which points are pushed. Accordingly, pushing points along a fixed vector field $$X$$ defines a family of diffeomorphisms, the flow $$\phi_X^t$$ (This structure makes the group of diffeomorphisms an infinite dimensional *Lie group*).

The interesting group structure comes from the failure of commutativity, measured for diffeomorphisms $$a,b$$ by their commutator $$a \circ b \circ a^{-1} \circ b^{-1}$$. The infinitesimal structure of the group is encoded by the infinitesimal version of the commutator, called the *Lie bracket*

$$ [X,Y] := \frac{\text{d}}{\text{d}s}\frac{\text{d}}{\text{d}t} \phi_X^t \circ \phi_Y^s \circ \phi_X^{-t} \circ \phi_Y^{-s} |_{s,t=0}$$

This measures how one vector field changes along the flow of another. Taking the inverse of the RHS shows that the Lie bracket is antisymmetric, $$[X,Y] = -[Y,X]$$.The associativity of the group, encoded infinitesimally, enforces a condition on the Lie brackets called the Jacobi identity

$$[ [X,Y] , Z] + [ [Y,Z] , X] + [ [Z,X] , Y]=0$$

The structure of a manifold are encoded in the Lie bracket on the space of vector fields, making this space into what's called a *Lie algebra*.

Symmetries of a symplectic manifold are symmetries of a manifold that preserve the symplectic structure. These are diffeomorphisms $$\phi$$ such that $$\phi^*\omega = \omega$$, which are called *Symplectomorphisms*. Infinitesimally, these are vector fields $$V$$ preserving the symplectic form, $$\mathcal{L}_V \omega = 0$$. Using Cartan's magic formula $$\mathcal{L}_ V = \text{d}\iota_V + \iota_V \text{d}$$ and the fact that $$\text{d}\omega = 0$$, $$V$$ preserves $$\omega$$ when $$\iota_V\omega$$ is closed. Locally, these forms are equal to $$\text{d}H$$ for some function $$H$$, which by definition makes $$V$$ a Hamiltonian vector field. That is, infinitesimal symmetries of a symplectic manifold are locally defined by smooth functions.

We can now pull back the Lie algebra structure from vector fields to their defining Hamiltonian functions. This is called the *Poisson bracket*, denoted by $$\{H,H'\}$$. Just as the Lie bracket measures the change in one vector field under the flow of another, the Poisson bracket measures the change in one Hamiltonian under the flow of the other

$$\{H,H'\} \equiv \frac{\text{d}}{\text{d}t}\phi_{X_{H}}^t H' = X_{H}(H') = \text{d}H' (X_{H}) = \omega(X_{H},X_{H'})$$

Note that the Poisson bracket is bilinear, by the linearity of the hamiltonian vector field. The antisymmetry of $$\omega$$ means the Poisson bracket is antisymmetric, and a computation in coordinates verifies the Jacobi identity. So, the Poisson bracket makes the algebra of smooth functions on phase space into a Lie algebra. And indeed, the Poisson bracket on Hamiltonians is equivalent to the lie bracket on their vector fields:

$$[X_{H},X_{H'}] = X_{\{H,H'\}}$$


>### Remark
>We can think of the fundamental structure of classical mechanics as the algebra of smooth functions $C^\infty(M)$ with Poisson bracket ('classical observables'). This alternate point of view to symplectic geometry gives a clear philosophical correspondence with quantum mechanics. There, the fundamental structure is the algebra of operators on a Hilbert space with commutator ('quantum observables'). To 'quantize' a classical system, you associate a Hilbert space to a symplectic manifold, and construct a Lie algebra homomorphism from smooth functions with Poisson bracket to operators with commutator. In practice, this procedure can be rather difficult and is almost never possible in full generality, but that's a story for another time.


--- 

[Next: Applying these ideas to higher dimensional harmonic osscilators](/blog/2022/07/24/Toric.html)