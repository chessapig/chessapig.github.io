---
layout: default
title: About
permalink: /about/
show_sidebar: true
---


<div class="row">
  <div class="col-md-3 mb-4">
    <div class="card">
      <img class="card-img-top" src="/static/images/noahsinger.jpeg"/>
      <div class="card-body">
        <div class="card-text">
          <i class="fas fa-user"></i> Elliot Kienzle (<a href="https://www.mypronouns.org/he-him" target="_blank">he/him</a>)<br/>
          <i class="fas fa-building"></i> Harvard University<br/>
          <i class="fas fa-envelope"></i> <em>first</em> <em>last</em> <em>(at)</em> college <em>(dot)</em> harvard <em>(dot)</em> edu<br/>
          <i class="fab fa-github"></i> <a href="https://github.com/singerng" target="_blank">@singerng</a> <br/>
          <i class="fab fa-twitter"></i> <a href="https://twitter.com/singerng_" target="_blank">@singerng_</a> <br/>
          <i class="fab fa-linkedin"></i> <a href="https://www.linkedin.com/in/singerng/" target="_blank">singerng</a>
        </div>
      </div>
    </div>

    <br/>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Recent Blog Posts</h3>
      </div>
      <ul class="list-group list-group-flush">
        {% for post in site.posts limit:5 %} 
          <ul class="list-group-item">
            <a class="text-dark" href="{{ post.url }}"><h6>{{ post.title | markdownify | remove: '<p>' | remove: '</p>' }}</h6></a>
          </ul>
        {% endfor %}
      </ul>
    </div>
  </div>

  <div class="col-md-9 mb-4">
    <h1>Noah Singer</h1>
    <p>I study computer science and math at Harvard (Pforzheimer House '22). I want to understand what problems can be solved by computational processes,
      how such problems can best be solved, and what effect solving (or being unable to solve) such problems has on society. After graduating, I plan to pursue a Ph.D. and a career in research in theoretical computer science. <a href="/index/cv.pdf">Here</a> is my CV.</p>
    <br/>

    <div class="p-3">
      <div class="row section pt-3">
        <div class="col">
          <h3>Interests</h3>

          <p>I have broad interests in theoretical computer science, including in complexity, cryptography, and algorithms. Some particular questions that interest me are: Why does interaction make computational tasks more tractable? What about non-black-box/non-oracle access to code or data? Some of my recent areas of study include communication complexity, incidence geometry, streaming algorithms, and Boolean function analysis.
        </div>
      </div>

      <div class="row section pt-3">
        <div class="col">
          <h3>Activities</h3>

          <p><strong>Teaching.</strong>
            I was a teaching assistant for the following courses:
            <ul>
              <li><em>CS 121: Introduction to Theoretical Computer Science</em> in Fall 2020 (Prof. Madhu Sudan and Adam Hesterberg)</li>
              <li><em>CS 161: Operating Systems</em> in Spring 2020 (Prof. James Mickens)</li>
              <li><em>CS 121: Introduction to Theoretical Computer Science</em> in Fall 2019 (Profs. Boaz Barak and Madhu Sudan)</li>
            </ul>
          For CS 121 in Fall 2019 and Fall 2020, I have organized guest lectures in the "CS 121.5" recitation section for advanced students.</p>

          <p><strong>Community.</strong> In Fall 2020, I am a CS <a href="https://harvardcs.info/advising/pca/">Peer Concentration Adviser</a> and <a href="https://www.harvardwics.com/mentorships">Women in CS (WiCS) mentor</a>. In Spring 2019, I worked with Harvard's <a href="http://digilit.io/">Digital Literacy Project</a>
            to teach Scratch and Processing.js to Boston-area middle school students.

          <p><strong>Work Experience.</strong>
          In Summer 2019, I worked as a software engineering intern at Airbnb in San Francisco on the Host Growth &amp; Traffic team, where I built a production data pipeline to discover and manage large quantities of Google search advertising keywords targeting Airbnb hosts.</p>
        </div>
      </div>

      <div class="row section pt-3">
        <div class="col">
          <h3>Hobbies</h3>
          
          <p><strong>Literature.</strong> I love science fiction! My favorite short story is William Gibson's <a href="http://www.lib.ru/GIBSON/frag_rose.txt">Fragments of
            a Hologram Rose</a>. Some of my favorite novels are Gibson's <em>Neuromancer</em>,
            Le Guin's <em>The Dispossessed</em>, Jemisin's <em>The Fifth Season</em> and Robinson's <em>Red Mars</em>.</p>

          <p><strong>Music.</strong> I listen mostly to electronica, alt rock, dance,
            and hip hop; my favorite artists include Daft
            Punk, Ratatat, Gorillaz, Kanye West,
            and The Strokes. I play classical piano in my free time.</p>

          <p><strong>Others.</strong> When school's not in session, I spend a lot of time catching up on television, baking, playing tennis, and watching hockey (go Caps!) and basketball.</p>
        </div>
      </div>
    </div>
  </div>
</div>
