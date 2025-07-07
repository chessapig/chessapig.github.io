---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---


  <div class="container">

  <div class="d-flex flex-wrap justify-content-between align-items-center mb-2 ml-3">
    <h1 class="mb-0">Gallery</h1>
    <div class="filter-buttons">
      <div class="btn-group" role="group">
        <button type="button" class="btn btn-primary mx-1 my-1" data-bs-toggle="button" data-filter="art">Art</button>
        <button type="button" class="btn btn-primary mx-1 my-1" data-bs-toggle="button" data-filter="craft">Crafts</button>
        <button type="button" class="btn btn-primary mx-1 my-1" data-bs-toggle="button" data-filter="talk">Slides</button>
        <button type="button" class="btn btn-primary active mx-1 my-1" data-bs-toggle="button" data-filter="all">All</button>
      </div>
    </div>
  </div>






<script src="https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js"></script>
<script src="https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js"></script>
<script>
  let msnry;
  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.querySelector('.masonry-grid');
    imagesLoaded(grid, function () {
      msnry = new Masonry(grid, {
        itemSelector: '.masonry-item',
        columnWidth: '.grid-sizer', // use the grid-sizer to get relayout to work
        percentPosition: true
      });
    });
  });
// Filtering setup
  const buttons = document.querySelectorAll('.filter-buttons .btn');
  buttons.forEach(button => {
    button.addEventListener('click', function () {
      buttons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      const filter = this.getAttribute('data-filter');
      const items = document.querySelectorAll('.masonry-item');
      items.forEach(item => {
        const tags = item.getAttribute('data-tags') || '';
        if (filter === 'all' || tags.includes(filter)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
      // Refresh Masonry layout after filtering
      var grid = document.querySelector('.masonry-grid');
      imagesLoaded(grid, function () {
        console.log("test");
        msnry.layout();
      });
    });
  });
</script>


<div class="container py-5">
  <div class="row masonry-grid" data-masonry='{"percentPosition": true }'>
  <div class="grid-sizer col-sm-6 col-md-4"></div>
    {% for gallery in site.tags.gallery %}
    <div class="col-sm-4 col-md-4 mb-4 masonry-item " data-tags="{{ gallery.tags }}">
      <div class="card bg-dark shadow p-1 ">
        <a href="{{ gallery.url | relative_url }}#gallery">
          <img src="{{ gallery.gallery-folder }}/thumbnail.jpg"
             class="card-img-top"
             alt="{{ gallery.title }}">
        </a>
        <div class="card-body text-center ">
        <a href="{{ gallery.url | relative_url }}#gallery">
          <h5 class="card-title text-capitalize">{{ gallery.gallery-title  }}</h5>
        </a>
        </div>
      </div>
    </div>
    {% endfor %}
  </div>
</div>
