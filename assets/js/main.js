document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Active nav link highlight
  var anchors = document.querySelectorAll('.site-nav a[data-nav]');
  var path = window.location.pathname;
  var current = path.split('/').pop() || 'index.html';
  anchors.forEach(function (a) {
    var file = (a.getAttribute('href') || '').split('/').pop();
    if (file === current) a.classList.add('active');
  });

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Copy email button (en)
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email') || '';
      if (!email) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          copyBtn.textContent = 'Copied';
          setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1200);
        });
      } else {
        var temp = document.createElement('input');
        temp.value = email; document.body.appendChild(temp); temp.select();
        document.execCommand('copy'); document.body.removeChild(temp);
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1200);
      }
    });
  }

  // External links are now handled via assets/info.json in render.js

  // Theme toggle (persisted)
  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');
  var stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') {
    root.setAttribute('data-theme', stored);
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // Entry animation
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('reveal-visible'); });
  }
});

 