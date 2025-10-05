(function(){
  
  function loadProfileInfo() {
    console.log('Loading profile info for blog page');
    return fetch('./assets/info.json', { cache: 'no-store' }).then(function (r) { 
      if (!r.ok) {
        throw new Error('HTTP ' + r.status + ': ' + r.statusText);
      }
      return r.json(); 
    }).then(function (info) {
      console.log('Profile info loaded:', info);
      
      // Set profile photo
      var profilePhoto = document.getElementById('profile-photo-global');
      if (profilePhoto && info.profile && info.profile.photo) {
        profilePhoto.src = './' + info.profile.photo;
        console.log('Profile photo set:', profilePhoto.src);
      }
      
      // Set profile name
      var profileName = document.getElementById('profile-name-global');
      if (profileName && info.profile && info.profile.name) {
        profileName.textContent = info.profile.name;
      }
      
      // Set profile affiliation
      var profileAffil = document.getElementById('profile-affil-global');
      if (profileAffil && info.profile && info.profile.affiliation) {
        profileAffil.textContent = info.profile.affiliation;
      }
      
      // Set profile links
      if (info.profile && info.profile.links) {
        var cvLink = document.getElementById('rail-cv-global');
        if (cvLink && info.profile.links.cv) {
          cvLink.href = info.profile.links.cv;
        }
        
        var scholarLink = document.getElementById('rail-scholar-global');
        if (scholarLink && info.profile.links.scholar) {
          scholarLink.href = info.profile.links.scholar;
        }
        
        var githubLink = document.getElementById('rail-github-global');
        if (githubLink && info.profile.links.github) {
          githubLink.href = info.profile.links.github;
        }
        
        var linkedinLink = document.getElementById('rail-linkedin-global');
        if (linkedinLink && info.profile.links.linkedin) {
          linkedinLink.href = info.profile.links.linkedin;
        }
      }
      
      // Set profile stats
      var profileStats = document.getElementById('profile-stats-global');
      if (profileStats && info.stats) {
        profileStats.innerHTML = '';
        var stats = info.stats || {};
        var data = [
          { label: 'Publications', value: Number(stats.publications || 0) },
          { label: 'Citations', value: Number(stats.citations || 0) }
        ];
        data.forEach(function (d) {
          var row = document.createElement('div'); 
          row.className = 'profile-stat-row';
          var label = document.createElement('span'); 
          label.className = 'profile-stat-label'; 
          label.textContent = d.label;
          var val = document.createElement('span'); 
          val.className = 'profile-stat-value'; 
          val.textContent = String(d.value);
          row.appendChild(label); 
          row.appendChild(val);
          profileStats.appendChild(row);
        });
        console.log('Profile stats loaded:', data);
      } else {
        console.log('Profile stats element not found or no stats data');
      }
    }).catch(function (e) {
      console.error('Failed to load profile info:', e);
    });
  }

  function loadPosts() {
    console.log('Loading posts from ./posts/index.json');
    var url = './posts/index.json';
    console.log('Fetch URL:', url);
    return fetch(url, { cache: 'no-store' }).then(function (r) { 
      console.log('Fetch response status:', r.status);
      console.log('Fetch response URL:', r.url);
      if (!r.ok) {
        throw new Error('HTTP ' + r.status + ': ' + r.statusText);
      }
      return r.json(); 
    }).then(function(data) {
      console.log('Raw data received:', data);
      return data;
    });
  }

  function loadMarkdownPost(filename) {
    console.log('Loading markdown post:', filename);
    var url = './posts/' + filename;
    console.log('Markdown URL:', url);
    return fetch(url, { cache: 'no-store' }).then(function (r) { 
      if (!r.ok) {
        throw new Error('HTTP ' + r.status + ': ' + r.statusText);
      }
      return r.text(); 
    });
  }

  function parseMarkdownFrontmatter(content) {
    if (!content.startsWith('---')) {
      return {}, content;
    }
    
    var parts = content.split('---', 2);
    if (parts.length < 3) {
      return {}, content;
    }
    
    var frontmatterText = parts[1].trim();
    var markdownContent = parts[2].trim();
    
    var frontmatter = {};
    frontmatterText.split('\n').forEach(function(line) {
      if (line.includes(':')) {
        var key = line.split(':')[0].trim();
        var value = line.split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '');
        
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            frontmatter[key] = JSON.parse(value);
          } catch (e) {
            var tagsStr = value.slice(1, -1);
            frontmatter[key] = tagsStr.split(',').map(function(tag) {
              return tag.trim().replace(/^["']|["']$/g, '');
            });
          }
        } else {
          frontmatter[key] = value;
        }
      }
    });
    
    return frontmatter, markdownContent;
  }

  function markdownToHtml(markdown) {
    var html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<pre><code class="language-$1">$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>');
    
    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>\s*)+/g, function(match) {
      if (match.includes('<li>')) {
        return '<ul>' + match + '</ul>';
      }
      return match;
    });
    
    // Paragraphs
    var paragraphs = html.split('\n\n');
    var htmlParagraphs = [];
    paragraphs.forEach(function(p) {
      p = p.trim();
      if (p && !p.startsWith('<')) {
        p = '<p>' + p + '</p>';
      }
      htmlParagraphs.push(p);
    });
    html = htmlParagraphs.join('\n\n');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>\n');
    
    return html;
  }

  function renderPosts(posts, mode) {
    console.log('renderPosts called with', posts.length, 'posts, mode:', mode);
    var root = document.getElementById('blog-list');
    if (!root) {
      console.error('blog-list element not found');
      return;
    }
    console.log('blog-list element found:', root);
    root.className = mode === 'list' ? 'post-list' : 'post-grid';
    root.innerHTML = '';
    
    if (posts.length === 0) {
      console.log('No posts to render');
      root.innerHTML = '<p style="text-align: center; color: var(--muted);">No blog posts found.</p>';
      return;
    }
    
    console.log('Starting to render posts...');
    
    posts.forEach(function (p, index) {
      console.log('Rendering post', index, ':', p.title);
      // Create an anchor tag to make the whole card clickable
      var cardLink = document.createElement('a');
      cardLink.className = 'post-card';
      // Generate correct path for markdown post link
      var postPath = (p.filename || p.slug || '');
      // Use markdown post viewer
      cardLink.href = 'blog-post.html?file=' + encodeURIComponent(postPath);
      cardLink.id = 'post-' + index;
      
      // Force visibility
      cardLink.style.opacity = '1';
      cardLink.style.transform = 'none';
      cardLink.style.display = 'block';

      var cover = document.createElement('img');
      cover.className = 'post-cover';
      cover.alt = p.title || 'cover';
      cover.src = p.cover || './assets/images/blog-default.svg';
      // Force image visibility
      cover.style.display = 'block';
      cover.style.opacity = '1';
      cover.style.visibility = 'visible';
      // Add error handling for image loading
      cover.onerror = function() {
        // Show placeholder instead of hiding
        this.style.display = 'block';
        this.style.backgroundColor = 'var(--surface)';
        this.style.border = '1px solid var(--border)';
        this.style.width = '100%';
        this.style.height = '200px';
        this.style.objectFit = 'cover';
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
      console.log('Added post card to DOM:', p.title);
    });
    
    console.log('Posts rendered successfully, total cards in DOM:', root.children.length);
    
    // Update navigation after posts are rendered
    setTimeout(function() {
      if (typeof initUnifiedNavigation === 'function') {
        initUnifiedNavigation();
      }
      // Also initialize blog-specific navigation
      initBlogNavigation();
    }, 100);
  }

  function initBlogNavigation() {
    var toggle = document.getElementById('blog-nav-toggle');
    var panel = document.getElementById('blog-nav-panel');
    
    if (toggle && panel) {
      toggle.addEventListener('click', function() {
        panel.classList.toggle('active');
      });
      
      // Close panel when clicking outside
      document.addEventListener('click', function(e) {
        if (!panel.contains(e.target) && !toggle.contains(e.target)) {
          panel.classList.remove('active');
        }
      });
    }
  }

  function createBlogNavigation(posts) {
    var navList = document.getElementById('blog-navigation');
    if (!navList) return;
    
    navList.innerHTML = '';
    
    // Add "All Posts" link
    var allLi = document.createElement('li');
    var allLink = document.createElement('a');
    allLink.href = '#';
    allLink.textContent = 'All Posts (' + posts.length + ')';
    allLink.className = 'nav-level-1';
    allLi.appendChild(allLink);
    navList.appendChild(allLi);
    
    // Add individual post links
    posts.forEach(function(post, index) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = 'blog-post.html?file=' + encodeURIComponent(post.filename);
      a.textContent = post.title;
      a.className = 'nav-level-2';
      
      li.appendChild(a);
      navList.appendChild(li);
    });
  }

  function onLoad() {
    console.log('Blog onLoad function called');
    console.log('Blog list element exists:', !!document.getElementById('blog-list'));
    
    // Load profile information for blog page
    loadProfileInfo();
    
    var posts = [];
    var mode = localStorage.getItem('blog_view') || 'grid';
    var q = '';
    var selectedCategory = '';

    function apply() {
      console.log('Apply function called with', posts.length, 'posts');
      console.log('Search query:', q);
      console.log('Selected category:', selectedCategory);
      var filtered = posts.filter(function (p) {
        console.log('Filtering post:', p.title, 'category:', p.category);
        console.log('Post tags:', p.tags);
        console.log('Post summary:', p.summary);
        // Filter by search query
        if (q) {
          var hay = (p.title + ' ' + (p.tags||[]).join(' ') + ' ' + (p.summary||'')).toLowerCase();
          console.log('Search haystack:', hay);
          console.log('Search query:', q.toLowerCase());
          if (hay.indexOf(q.toLowerCase()) === -1) {
            console.log('Post filtered out by search:', p.title);
            return false;
          }
        }
        // Filter by category
        if (selectedCategory && p.category !== selectedCategory) {
          console.log('Post filtered out by category:', p.title, 'expected:', selectedCategory, 'actual:', p.category);
          return false;
        }
        console.log('Post passed filter:', p.title);
        return true;
      });
      console.log('Filtered posts:', filtered.length);
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
      console.log('Data type:', typeof data, 'Is array:', Array.isArray(data));
      posts = Array.isArray(data) ? data : (data.posts || []);
      console.log('Posts array:', posts);
      console.log('Posts length:', posts.length);
      
      if (posts.length === 0) {
        console.error('No posts found in data');
        var root = document.getElementById('blog-list');
        if (root) {
          root.innerHTML = '<p style="text-align: center; color: var(--muted);">No blog posts found. Please check posts/index.json</p>';
        }
        return;
      }
      
      // Test: Force render all posts without filtering
      console.log('Testing: Rendering all posts without filtering');
      renderPosts(posts, mode);
      
      // Create blog navigation
      createBlogNavigation(posts);
      
      renderCategories();
      apply();
    }).catch(function (e) {
      console.error('Failed to load blog posts:', e);
      console.error('Error details:', e.message);
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
  console.log('Current page:', window.location.pathname);
  
  // Only initialize blog functionality on blog page
  if (window.location.pathname.includes('blog.html')) {
    if (document.readyState === 'loading') {
      console.log('Adding DOMContentLoaded listener for blog page');
      document.addEventListener('DOMContentLoaded', onLoad);
    } else {
      console.log('Document already loaded, calling blog onLoad immediately');
      onLoad();
    }
  } else {
    console.log('Not on blog page, skipping blog initialization');
  }
})();

console.log('Blog.js script finished');


