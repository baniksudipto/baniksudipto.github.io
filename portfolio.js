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

    // Resume menu toggle (header + hero buttons)
    const resumeMenu = document.querySelector('.resume-menu');
    const resumeButtons = Array.from(document.querySelectorAll('.resume-cta'));
    function setResumeOpen(open){
      if(!resumeMenu) return;
      resumeMenu.classList.toggle('hidden', !open);
      resumeButtons.forEach(b => b.setAttribute('aria-expanded', open ? 'true' : 'false'));
      if(open){
        // focus first menu item
        const first = resumeMenu.querySelector('a');
        first && first.focus();
      }
    }
    resumeButtons.forEach(btn => {
      btn.addEventListener('click', function(e){
        e.preventDefault();
        // If header button clicked, scroll to hero first
        const hero = document.querySelector('.hero');
        if(hero && !document.body.contains(resumeMenu)){
          // nothing
        }
        setResumeOpen(!resumeMenu.classList.contains('hidden'));
      });
    });

    // Close on click outside
    document.addEventListener('click', function(e){
      if(!resumeMenu || resumeMenu.classList.contains('hidden')) return;
      if(!e.target.closest('.resume-menu') && !e.target.closest('.resume-cta')){
        setResumeOpen(false);
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') setResumeOpen(false);
    });

    // Close menu after selecting an item
    resumeMenu && resumeMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setResumeOpen(false)));

    // Ensure the download link reliably opens the PDF (some browsers ignore download attribute when in same-origin popups).
    const downloadLink = document.getElementById('download-resume');
    if(downloadLink){
      downloadLink.addEventListener('click', function(e){
        e.preventDefault();
        // Open in new tab to force browser to show or download the PDF
        window.open(this.href, '_blank', 'noopener');
        setResumeOpen(false);
      });
    }

  });
})();