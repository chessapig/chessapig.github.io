---
layout: minima-default
---

# Math diary

*Welcome to my math diary*

I have a a whole summer reserved for nothing but math. No classes, no teaching, no summer schools (they didn't accept me), no mentors to meet with, no structure. To keep myself accountable, I'm going to write what math I'm doing, each day, every day. Hopefully I'll become more efficient and comfortable with writing math too. I stole the math diary idea from [@Right_Inverse](https://twitter.com/Right_Inverse/status/1652711830500831232). I'm also forever inspired by John Baez and his classic blog [this weeks finds](https://math.ucr.edu/home/baez/TWF.html), which I find myself referencing every now and again. The diary is a mix of me recording what I'm learning about each day, and me explaining some math. Of course, it is very slapdash and unedited, but perhaps the explinations would be interesting to a hypothetical someone. The entries with explinations are the ones with titles in the index below. 

Math wise, I have two projects this summer. First, I've been a complex geometer pretending to do algebraic geometry for a while now. Issue is, I've never learned how to take Spec of a ring, or any commutative algebra in general. That's like doing differential geometry without knowing calculus. 
This summer, I want to learn AG right. 

Second, and more excitingly, a potential advisor suggested a problem to guide my readings: Let $$X$$ be a manifold, and $$\mathcal{L} X = \text{map}(S^1,X)$$ be its free loop space. This is an infinite dimensional manifold, but we can still make sense of the de-rahm operator $$\text{d}$$, and its cohomology $$H^*(\mathcal{L}X)$$. If $$X$$ is a complex manifold, then $$\Omega X$$ inherits its complex structure. This begs the question,  *Is there a hodge decomposition of loop space, $$H^n(\mathcal{L}X)=\bigoplus\limits_{p+q=n} H^{p,q}(\mathcal{L} X)$$?*   

<hr class = "mine">
# Index

{% for post in site.categories.diary %}
<div class="post-preview">
 <img class="post-preview__left" src="{{ post.image }}" alt="{{ page.image_alt }}">
 <div class="post-preview__right">
   <a class="preview-title" href="{{ post.url }}">{{ post.date | date: "%b %d, %Y" }}</a>
   <span>{{ post.title}}</span>
   <div class="tag-group">
     {% for tag in post.tags %}
       <div class="tag"><span class="tag-text">{{ tag }}</span></div>
     {% endfor %}
   </div>
 </div>
</div>
{% endfor %}