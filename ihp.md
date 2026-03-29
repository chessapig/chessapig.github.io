---
layout: default
title: Projects
list_title: Projects
---


  <div class="container">
  <h1 class="mt-4 mb-4">Semester of Illustrating Mathematics</h1>

  I spent Spring 2026 in Paris at the Institute Henri Poincare, participating in the semester [Illustration as a Mathematical Research Technique](https://www.ihp.fr/en/news-research-activities/t1-2026-illustration-mathematical-research-technique). 


 {% for project in site.tags.ihp %}
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