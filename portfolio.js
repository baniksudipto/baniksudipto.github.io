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

    // Ensure the download link reliably downloads the PDF. We'll fetch the PDF and create a blob download.
    const downloadLink = document.getElementById('download-resume');
    if (downloadLink) {
      downloadLink.addEventListener('click', async function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const originalText = this.textContent;
        // provide simple feedback
        try {
          this.textContent = 'Downloading…';
          const resp = await fetch(href, { method: 'GET' });
          if (resp && resp.ok) {
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Sudipta-Banik-Resume.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          } else {
            throw new Error('Fetch failed');
          }
        } catch (err) {
          // fallback 1: try a programmatic anchor with download attribute
          try {
            const a2 = document.createElement('a');
            a2.href = href;
            a2.setAttribute('download', 'Sudipta-Banik-Resume.pdf');
            document.body.appendChild(a2);
            a2.click();
            a2.remove();
          } catch (err2) {
            // final fallback: open in new tab
            window.open(href, '_blank', 'noopener');
          }
        } finally {
          this.textContent = originalText;
          setResumeOpen(false);
        }
      });
    }

    // Parallax background for hero (desktop only)
    (function(){
      const hero = document.querySelector('.hero');
      const heroBg = hero && hero.querySelector('.hero-bg');
      if(!heroBg) return;
      const enabled = window.matchMedia('(pointer:fine) and (min-width:700px)').matches;
      if(!enabled){
        heroBg.style.transform = 'translateY(0)';
        return;
      }
      let ticking = false;
      function onScroll(){
        if(ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          const offset = Math.round(-rect.top * 0.3); // parallax factor
          heroBg.style.transform = `translateY(${offset}px)`;
          ticking = false;
        });
      }
      window.addEventListener('scroll', onScroll, {passive:true});
      window.addEventListener('resize', onScroll);
      // init position
      onScroll();
    })();

  });
})();