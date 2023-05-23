---
layout: default
title: Projects
list_title: Projects
---


  <div class="container">
  <h1 class="mt-4 mb-4">Presentations</h1>

  <div class="filter-buttons">
    <div class="btn-group" role="group">
      <button type="button" class="btn btn-primary active" aria-pressed="true" data-bs-toggle="button" data-filter="all">All Talks</button>
      <button type="button" class="btn btn-primary" data-bs-toggle="button" data-filter="research-talk">Research Talks</button>
      <button type="button" class="btn btn-primary" data-bs-toggle="button" data-filter="seminar-talk">Learning Seminars</button>
      <button type="button" class="btn btn-primary" data-bs-toggle="button" data-filter="class-talk">Class Presentations</button>
      <button type="button" class="btn btn-primary" data-bs-toggle="button" data-filter="fun-talk">Fun</button>
    </div>
  </div>

 {% for project in site.tags.talk %}
 {% include project_card.html %}
  {% endfor %}
  </div>

  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
  <script>
    $(document).ready(function() {
      $('.btn-group .btn').click(function() {
        $('.btn-group .btn').removeClass('active');
        $(this).addClass('active');
        var filter = $(this).data('filter');
        console.log( $('.talk'));
        if (filter === 'all') {
          $('.project').show();
        } else {
          $('.project').hide();
          $('.project[data-tags*="' + filter + '"]').show();
        }
      });
    });
  </script>