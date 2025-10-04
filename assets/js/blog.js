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
      // Create an anchor tag to make the whole card clickable
      var cardLink = document.createElement('a');
      cardLink.className = 'post-card';
      cardLink.href = './posts/' + (p.slug || '') + '.html';

      var cover = document.createElement('img');
      cover.className = 'post-cover';
      cover.alt = p.title || 'cover';
      cover.src = p.cover || '';
      
      var body = document.createElement('div');
      body.className = 'post-body';
      
      // The title is no longer a link itself, but part of the card link
      var h = document.createElement('div');
      h.className = 'post-title';
      h.textContent = p.title || '';
      
      var meta = document.createElement('div');
      meta.className = 'post-meta';
      meta.textContent = (p.date || '') + (p.tags && p.tags.length ? ' • ' + p.tags.join(', ') : '');
      
      body.appendChild(h);
      body.appendChild(meta);
      
      if (mode === 'list') {
        cardLink.appendChild(body);
      } else {
        cardLink.appendChild(cover);
        cardLink.appendChild(body);
      }
      root.appendChild(cardLink);
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


