---
layout: minima-default
---

# Math diary

*Welcome to my math diary*

This is a place for me to record the math I'm thinking about, and to practice explaining it. I stole the math diary idea from [@Right_Inverse](https://twitter.com/Right_Inverse/status/1652711830500831232). I'm also forever inspired by John Baez and his classic blog [this weeks finds](https://math.ucr.edu/home/baez/TWF.html), which I find myself referencing every now and again. it is very slapdash and unedited, but perhaps the explanations would be interesting to a hypothetical someone. The entries with explanations are the ones with titles in the index below. 


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