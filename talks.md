---
layout: default
title: Talks
list_title: Talks
---


  <div class="container">
  <h1 class="mt-4 mb-4">Presentations</h1>

  <div class="filter-buttons">
    <div class="btn-group" role="group">
      <button type="button" class="btn btn-primary active" aria-pressed="true" data-bs-toggle="button" data-filter="all">All Talks</button>
      <button type="button" class="btn btn-primary" data-bs-toggle="button" data-filter="research-talk">Research</button>
      <button type="button" class="btn btn-primary" data-bs-toggle="button" data-filter="illustration-talk">Illustration</button>
      <button type="button" class="btn btn-primary" data-bs-toggle="button" data-filter="seminar-talk">Learning Seminars</button>
      <button type="button" class="btn btn-primary" data-bs-toggle="button" data-filter="class-talk">Class Presentations</button>
      <button type="button" class="btn btn-primary" data-bs-toggle="button" data-filter="fun-talk">Fun</button>
    </div>
  </div>

<div id="pagination" class="text-center my-4"></div>

 {% for project in site.tags.talk %}
 {% include project_card.html %}
  {% endfor %}
  </div>

  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
  const allItems = Array.from(document.querySelectorAll('.project'));
  const buttons = document.querySelectorAll('.btn-group .btn');
  const paginationContainer = document.getElementById('pagination');

  const perPage = 10;
  let currentPage = 1;
  let currentFilter = 'all';
  let filteredItems = [...allItems];

  function applyFilter(filter) {
    currentFilter = filter;

    if (filter === 'all') {
      filteredItems = [...allItems];
    } else {
      filteredItems = allItems.filter(item => {
        const tags = item.getAttribute('data-tags') || '';
        return tags.includes(filter);
      });
    }

    currentPage = 1; // reset page on filter change
    render();
  }

  function render() {
    // Hide everything first
    allItems.forEach(item => item.style.display = 'none');

    // Compute slice
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const pageItems = filteredItems.slice(start, end);

    // Show current page
    pageItems.forEach(item => item.style.display = '');

    renderPagination();
  }

  function renderPagination() {
    const totalPages = Math.ceil(filteredItems.length / perPage);
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    if (currentPage > 1) {
      const prev = document.createElement('button');
      prev.textContent = 'Previous';
      prev.className = 'btn btn-sm btn-outline-primary mx-1';
      prev.onclick = () => {
        currentPage--;
        render();
      };
      paginationContainer.appendChild(prev);
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = 'btn btn-sm btn-outline-primary mx-1';

     if (i === currentPage) {  
		btn.classList.remove('btn-outline-primary');  
		btn.classList.add('btn-primary', 'active');  
	}
      btn.onclick = () => {
        currentPage = i;
        render();
      };

      paginationContainer.appendChild(btn);
    }

    // Next button
    if (currentPage < totalPages) {
      const next = document.createElement('button');
      next.textContent = 'Next';
      next.className = 'btn btn-sm btn-outline-primary mx-1';
      next.onclick = () => {
        currentPage++;
        render();
      };
      paginationContainer.appendChild(next);
    }
  }

  // Button click handling
  buttons.forEach(button => {
    button.addEventListener('click', function () {
      buttons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      const filter = this.getAttribute('data-filter');
      applyFilter(filter);
    });
  });

  // Initial render
  applyFilter('all');
});
</script>
  
