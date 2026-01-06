(function(){
  function loadPosts() {
    return fetch('./posts/index.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
  }

  function renderPosts(posts, mode) {
    var root = document.getElementById('blog-list');
    if (!root) return;
    root.className = mode === 'list' ? 'post-list reveal' : 'post-grid reveal';
    root.innerHTML = '';
    posts.forEach(function (p) {
      var card = document.createElement('article'); card.className = 'post-card';
      var cover = document.createElement('img'); cover.className = 'post-cover'; cover.alt = p.title || 'cover'; cover.src = p.cover || '';
      var body = document.createElement('div'); body.className = 'post-body';
      var h = document.createElement('a'); h.className = 'post-title'; h.textContent = p.title || ''; h.href = './posts/' + (p.slug || '') + '.html';
      var meta = document.createElement('div'); meta.className = 'post-meta'; meta.textContent = (p.date || '') + (p.tags && p.tags.length ? ' • ' + p.tags.join(', ') : '');
      body.appendChild(h); body.appendChild(meta);
      if (mode === 'list') {
        card.appendChild(body);
      } else {
        card.appendChild(cover); card.appendChild(body);
      }
      root.appendChild(card);
    });
  }

  function onLoad() {
    var posts = [];
    var mode = localStorage.getItem('blog_view') || 'grid';
    var q = '';

    function apply() {
      var filtered = posts.filter(function (p) {
        if (!q) return true;
        var hay = (p.title + ' ' + (p.tags||[]).join(' ') + ' ' + (p.summary||'')).toLowerCase();
        return hay.indexOf(q.toLowerCase()) !== -1;
      });
      renderPosts(filtered, mode);
    }

    loadPosts().then(function (data) {
      posts = data.posts || [];
      apply();
    }).catch(function (e) {
      console.error('Failed to load blog posts:', e);
      // Fallback: show error message
      var root = document.getElementById('blog-list');
      if (root) {
        root.innerHTML = '<p style="text-align: center; color: var(--muted);">Failed to load blog posts. Please check the posts/index.json file.</p>';
      }
    });

    var search = document.getElementById('search');
    if (search) search.addEventListener('input', function () { q = search.value || ''; apply(); });
    var vg = document.getElementById('view-grid'); if (vg) vg.addEventListener('click', function () { mode = 'grid'; localStorage.setItem('blog_view', mode); apply(); });
    var vl = document.getElementById('view-list'); if (vl) vl.addEventListener('click', function () { mode = 'list'; localStorage.setItem('blog_view', mode); apply(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onLoad); else onLoad();
})();


