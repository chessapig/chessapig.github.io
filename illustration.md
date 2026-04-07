---
layout: default
title: Illustration
list_title: Illustration
---
<h1 class="text-center">Mathematical Illustration</h1>


<div class="container my-5">  
<div class="row justify-content-center">  
  
<!-- Card 1 -->  
<div class="col-12 col-md-4 d-flex">  
	<div class="card my-4 shadow-sm w-100">  
		<a href="/gallery?filter=art">  
		<img src="/assets/images/hitchin.jpeg"  
		alt="Picture of hitchin fibration"  
		class="card-img-top">  
		</a>  
		<div class="card-body text-center">  
		<h5 class="card-title">  
		<a href="/gallery?filter=art" class="card-title">  
		Drawing
		</a>  
		</h5>  
		</div>  
	</div>  
</div>  
  
<!-- Card 2 -->  
<div class="col-12 col-md-4 d-flex">  
	<div class="card my-4 shadow-sm w-100">  
		<a href="/gallery?filter=craft">  
		<img src="/assets/ihp/shapes/gallery/factory.jpeg"  
		alt="Many small crafts"  
		class="card-img-top">  
		</a>  
		<div class="card-body text-center">  
		<h5 class="card-title">  
		<a href="/gallery?filter=craft" class="card-title">  
		Crafts
		</a>  
		</h5>  
		</div>  
	</div>  
</div>  
  
<!-- Card 3 -->  
<div class="col-12 col-md-4 d-flex">  
	<div class="card my-4 shadow-sm w-100">  
		<a href="/code">  
		<img src="/assets/images/hyperbolic_landscape.jpeg"  
		alt="Hyperbolic string art"  
		class="card-img-top">  
		</a>  
		<div class="card-body text-center">  
		<h5 class="card-title">  
		<a href="/code" class="card-title">  
		Code
		</a>  
		</h5>  
		</div>  
	</div>  
</div>  
  
</div>  
</div>


I like to illustrate mathematics, in any medium that calls for. I'm involved in the [Illustrating mathematics community](https://illustratingmath.org/people). In the Spring of 2026, I attended the trimester program on  [Illustration as a Mathematical Research Technique](https://www.ihp.fr/en/news-research-activities/t1-2026-illustration-mathematical-research-technique) at the Institute Henri Poincare. I met many wonderful people, and made lots of mathematical illustrations!

<div class="card my-4 shadow-sm" style="max-width: 400px; margin: auto;">
  <a href="/ihp">  
		<img src="/assets/ihp/ihp.jpeg"  
		alt="selfie in a lecture hall full of people"  
		class="card-img-top">  
		</a>  

  <div class="card-body text-center">
	  <h5 class="card-title">  
		<a href="/ihp" class="card-title">  
			Trimester at the IHP
		</a>  
		</h5>  
  </div>
</div>
# Illustrated papers
I illustrate all of [my papers](/writing/). I occasionally take commissions to illustrate other people's papers. Here's some papers I've illustrated:

 {% for project in site.posts %}
 {% if project.attributes contains "illustrated-paper"%}
 {% include paper_card.html %}
 {% endif %}
  {% endfor %}