(function(){
  
  function loadProfileInfo() {
    return fetch('./assets/info.json', { cache: 'no-store' }).then(function (r) { 
      if (!r.ok) {
        throw new Error('HTTP ' + r.status + ': ' + r.statusText);
      }
      return r.json(); 
    }).then(function (info) {
      // Set profile photo
      var profilePhoto = document.getElementById('profile-photo-global');
      if (profilePhoto && info.profile && info.profile.photo) {
        profilePhoto.src = './' + info.profile.photo;
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
      }
    }).catch(function (e) {
      console.error('Failed to load profile info:', e);
    });
  }

  function parseMarkdownFrontmatter(content) {
    console.log('Parsing frontmatter from content:', content.substring(0, 200) + '...');
    
    if (!content.startsWith('---')) {
      console.log('No frontmatter found, returning empty object');
      return {}, content;
    }
    
    var parts = content.split('---');
    if (parts.length < 3) {
      console.log('Invalid frontmatter format, returning empty object');
      return {}, content;
    }
    
    var frontmatterText = parts[1].trim();
    var markdownContent = parts.slice(2).join('---').trim();
    
    console.log('Frontmatter text:', frontmatterText);
    
    var frontmatter = {};
    var lines = frontmatterText.split('\n');
    
    lines.forEach(function(line) {
      line = line.trim();
      if (line && line.includes(':')) {
        var colonIndex = line.indexOf(':');
        var key = line.substring(0, colonIndex).trim();
        var value = line.substring(colonIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            frontmatter[key] = JSON.parse(value);
          } catch (e) {
            // Fallback: simple parsing
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
    
    console.log('Parsed frontmatter:', frontmatter);
    return { frontmatter: frontmatter, content: markdownContent };
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

  function extractHeadings(html) {
    var headings = [];
    var headingRegex = /<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    var match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      var level = parseInt(match[1].substring(1));
      var text = match[2].replace(/<[^>]*>/g, '').trim();
      var id = 'heading-' + headings.length;
      
      headings.push({
        level: level,
        text: text,
        id: id
      });
    }
    
    return headings;
  }

  function addHeadingIds(html) {
    var headingRegex = /<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    var index = 0;
    
    return html.replace(headingRegex, function(match, tag, content) {
      var id = 'heading-' + index;
      index++;
      return '<' + tag + ' id="' + id + '">' + content + '</' + tag + '>';
    });
  }

  function createPostNavigation(headings) {
    console.log('createPostNavigation called with headings:', headings);
    var navList = document.getElementById('post-navigation');
    console.log('navList element:', navList);
    if (!navList) {
      console.error('post-navigation element not found');
      return;
    }
    
    navList.innerHTML = '';
    
    if (headings.length === 0) {
      console.log('No headings found, navigation will be empty');
      return;
    }
    
    headings.forEach(function(heading) {
      console.log('Creating navigation item for:', heading.text, 'level:', heading.level);
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + heading.id;
      a.textContent = heading.text;
      a.className = 'nav-level-' + heading.level;
      
      li.appendChild(a);
      navList.appendChild(li);
      
      // Add click handler for smooth scrolling
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById(heading.id);
        if (target) {
          var headerHeight = 0; // Match other pages offset
          var targetPosition = target.offsetTop - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
    
    console.log('Navigation created with', headings.length, 'items');
  }

  function initQuickNavigation() {
    console.log('initQuickNavigation called');
    var toggle = document.getElementById('post-nav-toggle');
    var panel = document.getElementById('nav-panel');
    
    console.log('Toggle element:', toggle);
    console.log('Panel element:', panel);
    
    if (toggle && panel) {
      console.log('Adding click event listener to toggle');
      toggle.addEventListener('click', function() {
        console.log('Toggle clicked, current panel classes:', panel.className);
        console.log('Panel computed style before toggle:', {
          right: window.getComputedStyle(panel).right,
          display: window.getComputedStyle(panel).display,
          visibility: window.getComputedStyle(panel).visibility,
          opacity: window.getComputedStyle(panel).opacity,
          zIndex: window.getComputedStyle(panel).zIndex
        });
        
        panel.classList.toggle('active');
        
        console.log('After toggle, panel classes:', panel.className);
        console.log('Panel computed style after toggle:', {
          right: window.getComputedStyle(panel).right,
          display: window.getComputedStyle(panel).display,
          visibility: window.getComputedStyle(panel).visibility,
          opacity: window.getComputedStyle(panel).opacity,
          zIndex: window.getComputedStyle(panel).zIndex
        });
        
        // Force a repaint
        panel.style.transform = 'translateZ(0)';
        
        // Additional verification
        setTimeout(function() {
          var rect = panel.getBoundingClientRect();
          console.log('Panel bounding rect:', {
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            visible: rect.width > 0 && rect.height > 0
          });
          
          // Check if panel is in viewport
          var isInViewport = rect.right > 0 && rect.left < window.innerWidth && 
                           rect.bottom > 0 && rect.top < window.innerHeight;
          console.log('Panel is in viewport:', isInViewport);
        }, 100);
      });
      
      // Close panel when clicking outside
      document.addEventListener('click', function(e) {
        if (!panel.contains(e.target) && !toggle.contains(e.target)) {
          panel.classList.remove('active');
        }
      });
    } else {
      console.error('Toggle or panel element not found');
    }
  }

  function loadMarkdownPost(filename) {
    var url = './posts/' + filename;
    return fetch(url, { cache: 'no-store' }).then(function (r) { 
      if (!r.ok) {
        throw new Error('HTTP ' + r.status + ': ' + r.statusText);
      }
      return r.text(); 
    });
  }

  function onLoad() {
    // Load profile info
    loadProfileInfo();
    
    // Initialize quick navigation
    initQuickNavigation();
    
    // Get filename from URL parameters
    var urlParams = new URLSearchParams(window.location.search);
    var filename = urlParams.get('file');
    
    if (!filename) {
      document.getElementById('post-loading').innerHTML = '<p>No post specified.</p>';
      return;
    }
    
    // Load markdown post
    loadMarkdownPost(filename)
      .then(function(content) {
        console.log('Markdown content loaded, length:', content.length);
        var result = parseMarkdownFrontmatter(content);
        var frontmatter = result.frontmatter || {};
        var markdownContent = result.content || content;
        
        console.log('Frontmatter after parsing:', frontmatter);
        console.log('Markdown content length:', markdownContent.length);
        
        // Convert markdown to HTML
        var html = markdownToHtml(markdownContent);
        console.log('Converted HTML:', html);
        
        // Add IDs to headings
        html = addHeadingIds(html);
        console.log('HTML with IDs:', html);
        
        // Extract headings for navigation
        var headings = extractHeadings(html);
        console.log('Extracted headings:', headings);
        
        // Create post content
        var postContent = document.getElementById('blog-post-content');
        if (!postContent) {
          console.error('blog-post-content element not found');
          return;
        }
        postContent.innerHTML = '';
        
        // Add title with fallback
        var title = frontmatter.title || filename.replace('.md', '').replace('.html', '') || 'Untitled Post';
        console.log('Using title:', title);
        var h1 = document.createElement('h1');
        h1.textContent = title;
        postContent.appendChild(h1);
        
        // Add meta information
        var meta = document.createElement('div');
        meta.className = 'post-meta';
        meta.style.marginBottom = '32px';
        
        var metaText = '';
        if (frontmatter.date) {
          metaText += frontmatter.date;
        }
        if (frontmatter.tags && frontmatter.tags.length > 0) {
          metaText += ' • ' + frontmatter.tags.join(', ');
        }
        
        meta.textContent = metaText;
        postContent.appendChild(meta);
        
        // Add content
        var contentDiv = document.createElement('div');
        contentDiv.innerHTML = html;
        postContent.appendChild(contentDiv);
        
        // Update page title
        document.title = title + ' • Jongmin Choi';
        
        // Create navigation
        console.log('Creating navigation with headings:', headings);
        createPostNavigation(headings);
        
        // Show navigation toggle if there are headings
        var toggle = document.getElementById('post-nav-toggle');
        if (headings.length > 0 && toggle) {
          toggle.style.display = 'block';
          console.log('Navigation toggle shown');
        } else {
          console.log('No headings found or toggle not found');
        }
      })
      .catch(function(error) {
        console.error('Failed to load post:', error);
        var loadingEl = document.getElementById('post-loading');
        if (loadingEl) {
          loadingEl.innerHTML = '<p>Failed to load post: ' + error.message + '</p>';
        } else {
          // Create error message in main content if loading element not found
          var postContent = document.getElementById('blog-post-content');
          if (postContent) {
            postContent.innerHTML = '<p style="color: red; text-align: center; padding: 40px;">Failed to load post: ' + error.message + '</p>';
          } else {
            console.error('Neither post-loading nor blog-post-content element found');
          }
        }
      });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLoad);
  } else {
    onLoad();
  }
})();
