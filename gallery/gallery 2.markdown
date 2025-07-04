---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---

<script src="https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js"></script>
<script src="https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.querySelector('.masonry-grid');
    imagesLoaded(grid, function () {
      new Masonry(grid, {
        itemSelector: '.masonry-item',
        percentPosition: true
      });
    });
  });
</script>


<div class="container py-5">
  <div class="row masonry-grid" data-masonry='{"percentPosition": true }'>
    {% for gallery in site.tags.gallery %}
    <div class="col-sm-6 col-md-4 mb-4 masonry-item ">
      <div class="card">
        <a href="{{ gallery.url | relative_url }}#gallery">
          <img src="{{ gallery.gallery-folder }}/thumbnail.jpg"
             class="card-img-top"
             alt="{{ gallery.title }}">
        </a>
        <div class="card-body text-center">
        <a href="{{ gallery.url | relative_url }}#gallery">
          <h5 class="card-title text-capitalize">{{ gallery.gallery-title  }}</h5>
        </a>
        </div>
      </div>
    </div>
    {% endfor %}
  </div>
</div>
