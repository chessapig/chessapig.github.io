---
layout: project
title: TQFT structure of Gromov-Witten theory and the Seidel representation
date: 2025-03-11 6:03:47 -0500
categories: talks
tags:
  - talk
attributes:
  - seminar-talk
image: /files/tqft_notes/seidel.png
file: /files/tqft_notes/seidel.pdf
talk-venue: <a href="/teaching/TQFT-gauged">gauged TQFTs seminar </a>, Spring 2025
summary: |-
  First, I describe the TQFT structure of the topological sigma model with target a symplectic manifold. To a surface, the TQFT assigns gromov witten invariants. To a circle, it assigns quantum cohomology. To a point, it assigns the fukaya category. I describe the origin of quantum cohomology from the top down (by neck-stretching curves and using gromov-witten invariants) and bottom up (as the Hochschild cohomology of the Fukaya category). 

  <br><br>

  Next, I discuss the Seidel representation. Given a loop $\Psi_t$ of hamiltonain diffeomorphisms, Seidel constructs a unit in the quantum cohomology ring, the "seidel element" $S(\Psi_t)$. An element of quantum cohomology is acted on by $\Psi_t$through multiplication by  $S(\Psi_t)$. Seidel constructs $S(\Psi_t)$ by building a symplectic bundle over $\mathbb{P}^1$ with clutching function $\Psi_t$, then counting $J$-holomorphic sections. This is the first taste of the categorical action of Hamiltonian diffeomorphisms on the fukaya category.
pageHasContent: true
---
## Sources

### TQFT structure

Witten 1988, [Topological sigma models](https://projecteuclid.org/journals/communications-in-mathematical-physics/volume-118/issue-3/Topological-sigma-models/cmp/1104162092.full)
- This paper is why Gromov-Witten theory has witten's name. It describes how the Gromov-witten invariants arise from observables in the topological A-model. This paper also counts $J$-holomorphic sections with a wink, "this will probably have some geometric applications". The first of these applications was Seidel's paper.

I don't know a good refrence for the fully extended TQFT structure that I described. But, when trying to get quantum cohomology as $Z(S^1)$, I found these math overflow questions helpful
- [Hochschild (co)homology of Fukaya categories and (quantum) (co)homology](https://mathoverflow.net/questions/11081/hochschild-cohomology-of-fukaya-categories-and-quantum-cohomology)
- [Comparison between Hamiltonian Floer cohomology and Lagrangian Floer cohomology of the diagonal](https://mathoverflow.net/questions/43338/comparison-between-hamiltonian-floer-cohomology-and-lagrangian-floer-cohomology)

### Seidel representation
Seidel 1995,[pi_1 of symplectic automorphism groups and invertibles in quantum homology rings](https://link.springer.com/article/10.1007/s000390050037)
- Original source for Seidel's representation. My goal was to explain this paper in the context of this seminar.

Mcduff, Salamon: J-holomorphic curves and Quantum cohomology. 
- Example 8.6.1 and section 11.4, 12.5 
- Textbook refrence for Seidel's representation, and the main thing I followed