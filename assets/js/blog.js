console.log('Blog.js script started');

(function(){
  console.log('Blog.js loaded');
  
  function loadPosts() {
    console.log('Loading posts from ./posts/index.json');
    return fetch('./posts/index.json', { cache: 'no-store' }).then(function (r) { 
      console.log('Fetch response:', r.status);
      if (!r.ok) {
        throw new Error('HTTP ' + r.status + ': ' + r.statusText);
      }
      return r.json(); 
    });
  }

  function renderPosts(posts, mode) {
    var root = document.getElementById('blog-list');
    if (!root) {
      console.error('Blog list container not found');
      return;
    }
    console.log('Rendering posts:', posts.length, 'Mode:', mode);
    root.className = mode === 'list' ? 'post-list' : 'post-grid';
    root.innerHTML = '';
    
    if (posts.length === 0) {
      root.innerHTML = '<p style="text-align: center; color: var(--muted);">No blog posts found.</p>';
      return;
    }
    
    posts.forEach(function (p, index) {
      console.log('Rendering post:', p.title);
      // Create an anchor tag to make the whole card clickable
      var cardLink = document.createElement('a');
      cardLink.className = 'post-card';
      cardLink.href = './posts/' + (p.slug || '') + '.html';
      cardLink.id = 'post-' + index;
      // Force visibility
      cardLink.style.opacity = '1';
      cardLink.style.transform = 'none';
      cardLink.style.display = 'block';

      var cover = document.createElement('img');
      cover.className = 'post-cover';
      cover.alt = p.title || 'cover';
      cover.src = p.cover || '';
      // Force image visibility
      cover.style.display = 'block';
      cover.style.opacity = '1';
      cover.style.visibility = 'visible';
      // Add error handling for image loading
      cover.onerror = function() {
        console.warn('Failed to load cover image:', p.cover);
        // Show placeholder instead of hiding
        this.style.display = 'block';
        this.style.backgroundColor = 'var(--surface)';
        this.style.border = '1px solid var(--border)';
        this.alt = 'Image not available';
      };
      
      var body = document.createElement('div');
      body.className = 'post-body';
      // Force body visibility
      body.style.display = 'block';
      body.style.opacity = '1';
      body.style.visibility = 'visible';
      
      // The title is no longer a link itself, but part of the card link
      var h = document.createElement('div');
      h.className = 'post-title';
      h.textContent = p.title || '';
      // Force title visibility
      h.style.display = 'block';
      h.style.opacity = '1';
      h.style.visibility = 'visible';
      h.style.color = 'var(--text)';
      
      var meta = document.createElement('div');
      meta.className = 'post-meta';
      
      // Create date element
      if (p.date) {
        var dateEl = document.createElement('span');
        dateEl.className = 'meta-item meta-date';
        dateEl.textContent = p.date;
        meta.appendChild(dateEl);
      }
      
      // Create tags elements
      if (p.tags && p.tags.length) {
        p.tags.forEach(function(tag) {
          var tagEl = document.createElement('span');
          tagEl.className = 'meta-item meta-tag';
          tagEl.textContent = '#' + tag;
          meta.appendChild(tagEl);
        });
      }
      
      // Force meta visibility
      meta.style.display = 'flex';
      meta.style.flexWrap = 'wrap';
      meta.style.gap = '8px';
      meta.style.opacity = '1';
      meta.style.visibility = 'visible';
      
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
    
    console.log('Posts rendered successfully');
    
    // Update navigation after posts are rendered
    setTimeout(function() {
      if (typeof initUnifiedNavigation === 'function') {
        initUnifiedNavigation();
      }
    }, 100);
  }

  function onLoad() {
    console.log('Blog onLoad function called');
    var posts = [];
    var mode = localStorage.getItem('blog_view') || 'grid';
    var q = '';
    var selectedCategory = '';

    function apply() {
      console.log('Apply function called with', posts.length, 'posts');
      var filtered = posts.filter(function (p) {
        // Filter by search query
        if (q) {
          var hay = (p.title + ' ' + (p.tags||[]).join(' ') + ' ' + (p.summary||'')).toLowerCase();
          if (hay.indexOf(q.toLowerCase()) === -1) return false;
        }
        // Filter by category
        if (selectedCategory && p.category !== selectedCategory) return false;
        return true;
      });
      renderPosts(filtered, mode);
    }
    
    function renderCategories() {
      var categoriesContainer = document.getElementById('blog-categories');
      if (!categoriesContainer) return;
      
      // Group posts by category
      var categoryCounts = {};
      posts.forEach(function(p) {
        var category = p.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Create "All" category
      var allCategory = document.createElement('a');
      allCategory.className = 'blog-category' + (selectedCategory === '' ? ' active' : '');
      allCategory.href = '#';
      allCategory.innerHTML = 'All <span class="blog-category-count">' + posts.length + '</span>';
      allCategory.addEventListener('click', function(e) {
        e.preventDefault();
        selectedCategory = '';
        document.querySelectorAll('.blog-category').forEach(function(cat) {
          cat.classList.remove('active');
        });
        allCategory.classList.add('active');
        apply();
      });
      categoriesContainer.appendChild(allCategory);
      
      // Create category buttons
      Object.keys(categoryCounts).sort().forEach(function(category) {
        var categoryEl = document.createElement('a');
        categoryEl.className = 'blog-category' + (selectedCategory === category ? ' active' : '');
        categoryEl.href = '#';
        categoryEl.innerHTML = category + ' <span class="blog-category-count">' + categoryCounts[category] + '</span>';
        categoryEl.addEventListener('click', function(e) {
          e.preventDefault();
          selectedCategory = category;
          document.querySelectorAll('.blog-category').forEach(function(cat) {
            cat.classList.remove('active');
          });
          categoryEl.classList.add('active');
          apply();
        });
        categoriesContainer.appendChild(categoryEl);
      });
    }

    loadPosts().then(function (data) {
      console.log('Posts loaded successfully:', data);
      posts = data.posts || [];
      console.log('Posts array:', posts);
      renderCategories();
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

  console.log('Document ready state:', document.readyState);
  console.log('Blog list element exists:', !!document.getElementById('blog-list'));
  
  if (document.readyState === 'loading') {
    console.log('Adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', onLoad);
  } else {
    console.log('Document already loaded, calling onLoad immediately');
    onLoad();
  }
})();

console.log('Blog.js script finished');


