// portfolio.js — small interactions for the portfolio page
(function(){
  'use strict';
  // Set year
  document.addEventListener('DOMContentLoaded', function(){
    const year = document.getElementById('year');
    if(year) year.textContent = new Date().getFullYear();

    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    navToggle && navToggle.addEventListener('click', function(){
      mainNav.classList.toggle('hidden');
    });

    // Smooth scrolling for in-page links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function(e){
        const targetId = this.getAttribute('href');
        if(targetId.length > 1){
          e.preventDefault();
          const t = document.querySelector(targetId);
          if(t){t.scrollIntoView({behavior:'smooth', block:'start'});} 
        }
      });
    });

    // Animate skills
    const skills = document.querySelectorAll('.skill');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const el = entry.target;
          const lvl = parseInt(el.getAttribute('data-level') || '70', 10);
          const fill = el.querySelector('.skill-fill');
          if(fill){ fill.style.width = lvl + '%'; }
          observer.unobserve(el);
        }
      });
    }, {threshold: 0.25});
    skills.forEach(s => observer.observe(s));

    // Active nav on scroll
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    window.addEventListener('scroll', function(){
      const pos = window.scrollY + 120;
      let current = sections.find(s => s.offsetTop <= pos && (s.offsetTop + s.offsetHeight) > pos);
      document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
      if(current){
        const link = document.querySelector('.main-nav a[href="#'+current.id+'"]');
        link && link.classList.add('active');
      }
    });
  });
})();