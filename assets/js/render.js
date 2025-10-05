(function(){
  // Determine base path depending on whether the page is a blog post or not
  var isPostPage = window.location.pathname.includes('/posts/');
  var basePath = isPostPage ? '..' : '.';

  function loadInfo() {
    return fetch(basePath + '/assets/info.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
  }

  function setProfileCommon(info) {
    var p = info.profile || {};
    // Brand/name
    var brand = document.querySelector('.brand');
    if (brand && p.name) brand.textContent = p.name;
    // Brand avatar
    var brandAvatar = document.getElementById('brand-avatar');
    if (brandAvatar) {
      var src = (p && p.photo) ? (basePath + '/' + p.photo) : (basePath + '/assets/images/profile.jpg');
      brandAvatar.setAttribute('src', src);
      brandAvatar.setAttribute('alt', p && p.name ? p.name : 'Profile');
      // Ensure visible after load
      brandAvatar.style.display = 'block';
    }

    // Title/subtitle on index
    var h1 = document.querySelector('.hero-text h1');
    if (h1) h1.textContent = 'Introduction'; // Keep as Introduction instead of name
    var subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.style.display = 'none'; // Hide subtitle
    var bio = document.getElementById('bio');
    if (bio && p.bio) bio.textContent = p.bio;
    
    // Render intro buttons
    renderIntroButtons(info);

    // Email links
    var emailLink = document.getElementById('email-link');
    if (emailLink && p.email) emailLink.textContent = p.email, emailLink.href = 'mailto:' + p.email;
    var copyBtn = document.getElementById('copy-email');
    if (copyBtn && p.email) copyBtn.setAttribute('data-email', p.email);

    // CV & external links
    var cv = document.getElementById('chip-cv');
    if (cv && p.cv) cv.href = basePath + '/' + p.cv;
    var links = p.links || {};
    var elScholar = document.getElementById('chip-scholar'); if (elScholar && links.scholar) { elScholar.href = links.scholar; }
    var elGithub = document.getElementById('chip-github'); if (elGithub && links.github) { elGithub.href = links.github; }
    var elLinkedin = document.getElementById('chip-linkedin'); if (elLinkedin && links.linkedin) { elLinkedin.href = links.linkedin; }

    // Rail links (icon + label)
    var railCv = document.getElementById('rail-cv-global');
    if (railCv && p.cv) {
      railCv.href = basePath + '/' + p.cv;
      railCv.innerHTML = '<img class="icon" alt="CV" src="' + (basePath + '/assets/icons/cv_icon.svg') + '"><span class="label">CV</span>';
    }
    var railScholar = document.getElementById('rail-scholar-global');
    if (railScholar && links.scholar) {
      railScholar.href = links.scholar;
      railScholar.innerHTML = '<img class="icon" alt="Google Scholar" src="' + (basePath + '/assets/icons/scholar_icon.svg') + '"><span class="label">Scholar</span>';
    }
    var railGithub = document.getElementById('rail-github-global');
    if (railGithub && links.github) {
      railGithub.href = links.github;
      railGithub.innerHTML = '<img class="icon" alt="GitHub" src="' + (basePath + '/assets/icons/github_icon.svg') + '"><span class="label">GitHub</span>';
    }
    var railLinkedin = document.getElementById('rail-linkedin-global');
    if (railLinkedin && links.linkedin) {
      railLinkedin.href = links.linkedin;
      railLinkedin.innerHTML = '<img class="icon" alt="LinkedIn" src="' + (basePath + '/assets/icons/linkedin_icon.svg') + '"><span class="label">LinkedIn</span>';
    }

    // Interests
    var interestList = document.querySelector('.pill-list');
    if (interestList && Array.isArray(p.interests)) {
      interestList.innerHTML = '';
      p.interests.forEach(function (it) {
        var li = document.createElement('li');
        li.textContent = it;
        interestList.appendChild(li);
      });
    }
  }

  function renderPhoto(info) {
    var p = info.profile || {};
    var photoUrl = p.photo;
    var railImg = document.getElementById('profile-photo-global');
    if (railImg && photoUrl) railImg.src = basePath + '/' + photoUrl;
  }

  function renderNews(info) {
    var list = info.news || [];
    var wrap = document.getElementById('news-list');
    if (!wrap) return;
    var ul = document.createElement('ul');
    ul.className = 'news-list';
    list.forEach(function (n) {
      var li = document.createElement('li');
      var date = document.createElement('span'); date.className = 'news-date'; date.textContent = n.date || '';
      var text = document.createElement('span'); text.className = 'news-text'; text.textContent = n.text || '';
      li.appendChild(date); li.appendChild(text); ul.appendChild(li);
    });
    wrap.innerHTML = '';
    wrap.appendChild(ul);
  }

  function renderIntroButtons(info) {
    var container = document.getElementById('intro-buttons');
    if (!container) return;
    
    var p = info.profile || {};
    var interests = p.interests || [];
    var stats = info.stats || {};
    var languages = stats.languages || [];
    
    container.innerHTML = '';
    
    // Research Interests button
    if (interests.length > 0) {
      var interestsBtn = document.createElement('div');
      interestsBtn.className = 'intro-button';
      interestsBtn.innerHTML = '<span class="intro-icon">🔬</span><span class="intro-label">Research Interests</span>';
      interestsBtn.addEventListener('click', function() {
        // Show interests in a modal or expand
        alert('Research Interests:\n• ' + interests.join('\n• '));
      });
      container.appendChild(interestsBtn);
    }
    
    // Technical Skills button
    if (languages.length > 0) {
      var skillsBtn = document.createElement('div');
      skillsBtn.className = 'intro-button';
      skillsBtn.innerHTML = '<span class="intro-icon">💻</span><span class="intro-label">Technical Skills</span>';
      skillsBtn.addEventListener('click', function() {
        // Show skills in a modal or expand
        alert('Technical Skills:\n• ' + languages.join('\n• '));
      });
      container.appendChild(skillsBtn);
    }
  }
  
  function renderMobileProfile(info) {
    var p = info.profile || {};
    var mobilePhoto = document.getElementById('mobile-profile-photo');
    if (mobilePhoto && p.photo) {
      mobilePhoto.src = basePath + '/' + p.photo;
    }
    
    // Mobile profile name
    var mobileName = document.getElementById('mobile-profile-name');
    if (mobileName && p.name) {
      mobileName.textContent = p.name;
    }
    
    // Mobile profile affiliation
    var mobileAffil = document.getElementById('mobile-profile-affil');
    if (mobileAffil && p.affiliation) {
      mobileAffil.textContent = p.affiliation;
    }
    
    // Mobile profile links (icon-only)
    var mobileLinks = document.getElementById('mobile-profile-links');
    if (mobileLinks) {
      mobileLinks.innerHTML = '';

      function createIconLink(href, iconPath, alt) {
        var a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        var img = document.createElement('img');
        img.src = basePath + '/assets/icons/' + iconPath;
        img.alt = alt;
        img.className = 'icon';
        a.appendChild(img);
        return a;
      }

      if (p.cv) {
        mobileLinks.appendChild(createIconLink(basePath + '/' + p.cv, 'cv_icon.svg', 'CV'));
      }

      var links = p.links || {};
      if (links.scholar) {
        mobileLinks.appendChild(createIconLink(links.scholar, 'scholar_icon.svg', 'Google Scholar'));
      }
      if (links.github) {
        mobileLinks.appendChild(createIconLink(links.github, 'github_icon.svg', 'GitHub'));
      }
      if (links.linkedin) {
        mobileLinks.appendChild(createIconLink(links.linkedin, 'linkedin_icon.svg', 'LinkedIn'));
      }
    }
  }

  function renderStats(info) {
    var stats = info.stats || {};
    var wrap = document.getElementById('profile-stats-global');
    if (!wrap) return;
    var data = [
      { label: 'Publications', value: Number(stats.publications || 0) },
      { label: 'Awards', value: Number(stats.awards || 0) },
      { label: 'Citations', value: Number(stats.citations || 0) },
      { label: 'Research Years', value: Number(stats.research_years || 0) }
    ];
    wrap.innerHTML = '';
    data.forEach(function (d) {
      var row = document.createElement('div'); row.className = 'profile-stat-row';
      var label = document.createElement('span'); label.className = 'profile-stat-label'; label.textContent = d.label;
      var val = document.createElement('span'); val.className = 'profile-stat-value'; val.textContent = String(d.value);
      row.appendChild(label); row.appendChild(val);
      wrap.appendChild(row);
    });
  }

  function renderStatistics(info) {
    // Publications by year chart only
    renderPublicationsChart(info);
    
    // Render gallery
    renderGallery(info);
  }

  function renderPublicationsChart(info) {
    var container = document.getElementById('publications-chart');
    if (!container) return;
    
    // Group publications by year
    var publicationsByYear = {};
    var listRef = info.publications || [];
    
    // Mock data for demonstration - in real implementation, you'd fetch actual data
    publicationsByYear = {
      '2024': 1,
      '2025': 2
    };
    
    var years = Object.keys(publicationsByYear).sort();
    var maxCount = Math.max(...Object.values(publicationsByYear));
    
    var chartHtml = '<div class="chart-axes">';
    chartHtml += '<div class="y-axis"></div>';
    chartHtml += '<div class="x-axis"></div>';
    
    // Add Y-axis ticks
    for (var i = 0; i <= maxCount; i++) {
      var yPos = (i / maxCount) * 100;
      chartHtml += '<div class="y-tick" style="top: ' + (100 - yPos) + '%">' + i + '</div>';
    }
    
    chartHtml += '</div>';
    chartHtml += '<div class="bar-chart">';
    
    years.forEach(function(year) {
      var count = publicationsByYear[year];
      // Calculate height as percentage of chart height, ensuring minimum height for visibility
      var height = Math.max((count / maxCount) * 100, 10); // Minimum 10% height
      chartHtml += '<div class="bar-item">';
      chartHtml += '<div class="bar" style="height: ' + height + '%">';
      chartHtml += '<span class="bar-value">' + count + '</span>';
      chartHtml += '</div>';
      chartHtml += '<div class="bar-label">' + year + '</div>';
      chartHtml += '</div>';
    });
    chartHtml += '</div>';
    
    container.innerHTML = chartHtml;
  }
  
  function renderGallery(info) {
    var container = document.getElementById('gallery-container');
    if (!container) return;
    
    var gallery = info.gallery || [];
    if (gallery.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 40px;">Gallery images will be added soon.</p>';
      return;
    }
    
    container.innerHTML = '';
    
    gallery.forEach(function(item, index) {
      var galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';
      
      if (item.type === 'folder') {
        // Handle folder type
        var folderIcon = document.createElement('div');
        folderIcon.className = 'gallery-folder-icon';
        folderIcon.innerHTML = '📁';
        
        var overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        
        var title = document.createElement('h4');
        title.className = 'gallery-title';
        title.textContent = item.title || 'Folder';
        
        var itemCount = document.createElement('p');
        itemCount.className = 'gallery-item-count';
        itemCount.textContent = (item.items || []).length + ' items';
        
        overlay.appendChild(title);
        overlay.appendChild(itemCount);
        
        galleryItem.appendChild(folderIcon);
        galleryItem.appendChild(overlay);
        
        // Add click handler for folder
        galleryItem.addEventListener('click', function() {
          showFolderLightbox(item, index);
        });
      } else {
        // Handle single image/video
        var img = document.createElement('img');
        img.src = basePath + '/' + item.src;
        img.alt = item.alt;
        img.loading = 'lazy';
        
        var overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        
        var title = document.createElement('h4');
        title.className = 'gallery-title';
        title.textContent = item.title;
        
        var description = document.createElement('p');
        description.className = 'gallery-description';
        description.textContent = item.description;
        
        overlay.appendChild(title);
        overlay.appendChild(description);
        
        galleryItem.appendChild(img);
        galleryItem.appendChild(overlay);
        
        // Add click handler for lightbox effect
        galleryItem.addEventListener('click', function() {
          showLightbox(item, index, gallery);
        });
      }
      
      container.appendChild(galleryItem);
    });
  }
  
  function showFolderLightbox(folder, folderIndex) {
    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '';
    
    var lightboxContent = document.createElement('div');
    lightboxContent.className = 'lightbox-content folder-lightbox';
    
    var header = document.createElement('div');
    header.className = 'lightbox-header';
    
    var title = document.createElement('h3');
    title.textContent = folder.title || 'Folder';
    header.appendChild(title);
    
    var closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', function() {
      document.body.removeChild(lightbox);
    });
    header.appendChild(closeBtn);
    
    lightboxContent.appendChild(header);
    
    var slider = document.createElement('div');
    slider.className = 'lightbox-slider';
    
    var prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-nav lightbox-prev';
    prevBtn.innerHTML = '‹';
    prevBtn.addEventListener('click', function() {
      navigateFolder(-1);
    });
    
    var nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-nav lightbox-next';
    nextBtn.innerHTML = '›';
    nextBtn.addEventListener('click', function() {
      navigateFolder(1);
    });
    
    var mediaContainer = document.createElement('div');
    mediaContainer.className = 'lightbox-media-container';
    
    var currentIndex = 0;
    var items = folder.items || [];
    
    function showCurrentItem() {
      mediaContainer.innerHTML = '';
      
      if (items.length === 0) {
        mediaContainer.innerHTML = '<p>No items in this folder.</p>';
        return;
      }
      
      var currentItem = items[currentIndex];
      var media;
      
      if (currentItem.type === 'video') {
        media = document.createElement('video');
        media.src = basePath + '/' + currentItem.src;
        media.controls = true;
        media.autoplay = false;
      } else {
        media = document.createElement('img');
        media.src = basePath + '/' + currentItem.src;
        media.alt = currentItem.alt || '';
      }
      
      media.className = 'lightbox-media';
      mediaContainer.appendChild(media);
      
      // Update navigation buttons
      prevBtn.style.display = items.length > 1 ? 'block' : 'none';
      nextBtn.style.display = items.length > 1 ? 'block' : 'none';
      
      // Update counter
      var counter = document.querySelector('.lightbox-counter');
      if (counter) {
        counter.textContent = (currentIndex + 1) + ' / ' + items.length;
      }
    }
    
    function navigateFolder(direction) {
      currentIndex += direction;
      if (currentIndex < 0) currentIndex = items.length - 1;
      if (currentIndex >= items.length) currentIndex = 0;
      showCurrentItem();
    }
    
    var counter = document.createElement('div');
    counter.className = 'lightbox-counter';
    
    slider.appendChild(prevBtn);
    slider.appendChild(mediaContainer);
    slider.appendChild(nextBtn);
    slider.appendChild(counter);
    
    lightboxContent.appendChild(slider);
    lightbox.appendChild(lightboxContent);
    
    // Add keyboard navigation
    lightbox.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') navigateFolder(-1);
      if (e.key === 'ArrowRight') navigateFolder(1);
      if (e.key === 'Escape') document.body.removeChild(lightbox);
    });
    
    // Close on background click
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        document.body.removeChild(lightbox);
      }
    });
    
    document.body.appendChild(lightbox);
    lightbox.focus();
    
    showCurrentItem();
  }
  
  function showLightbox(item, currentIndex, allItems) {
    // Simple lightbox implementation
    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close">&times;</button>
        <img src="${basePath}/${item.src}" alt="${item.alt}">
        <div class="lightbox-info">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Close handlers
    lightbox.querySelector('.lightbox-close').addEventListener('click', function() {
      document.body.removeChild(lightbox);
    });
    
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        document.body.removeChild(lightbox);
      }
    });
  }

  function renderPublications(info) {
    var listRef = info.publications || [];
    var ol = document.getElementById('pub-list');
    if (!ol) return;
    
    // Clear all existing content completely
    ol.innerHTML = '';
    
    // Also clear any existing year headers that might be outside the ol
    var existingHeaders = document.querySelectorAll('.year-header');
    existingHeaders.forEach(function(header) {
      header.remove();
    });

    function renderItems(items) {
      // Group publications by year
      var groupedByYear = {};
      items.forEach(function (p) {
        var year = extractYear(p.venue || '');
        if (!groupedByYear[year]) {
          groupedByYear[year] = [];
        }
        groupedByYear[year].push(p);
      });
      
      // Sort years in descending order (newest first)
      var years = Object.keys(groupedByYear).sort(function(a, b) { return parseInt(b) - parseInt(a); });
      
      years.forEach(function(year) {
        // Create year header
        var yearHeader = document.createElement('div');
        yearHeader.className = 'year-header';
        yearHeader.id = 'year-' + year;
        yearHeader.innerHTML = '<h2 class="year-title">' + year + '</h2>';
        ol.appendChild(yearHeader);
        
        // Create publications list for this year
        var yearList = document.createElement('ol');
        yearList.className = 'pub-list-year';
        
        groupedByYear[year].forEach(function (p) {
          var li = document.createElement('li');
          var t = document.createElement('span'); t.className = 'pub-title'; 
          
          // Bold the author's name in the title
          var titleText = p.title || '';
          var authorsText = p.authors || '';
          if (authorsText.includes('Jongmin Choi')) {
            // Split authors by comma and bold only Jongmin Choi
            var authors = authorsText.split(', ');
            var formattedAuthors = authors.map(function(author) {
              return author.trim() === 'Jongmin Choi' ? 
                '<strong style="color: #000000;">Jongmin Choi</strong>' : 
                '<span style="color: #666666; font-weight: normal;">' + author.trim() + '</span>';
            }).join(', ');
            t.innerHTML = titleText + '<br><span class="pub-authors">' + formattedAuthors + '</span>';
          } else {
            t.textContent = titleText;
          }
          
          var v = document.createElement('span'); v.className = 'pub-venue'; v.textContent = p.venue || '';
          var links = document.createElement('span'); links.className = 'pub-links';

          function addBtn(label, href, variant, click) {
            var el = document.createElement('a'); el.className = 'chip ' + (variant || ''); el.textContent = label;
            if (href) { el.href = href; el.target = '_blank'; el.rel = 'noopener'; }
            if (click) { el.href = '#'; el.addEventListener('click', function (ev) { ev.preventDefault(); click(); }); }
            links.appendChild(el);
          }

          addBtn('PDF', p.pdf, 'chip-primary');
          addBtn('BibTeX', null, 'chip-secondary', function () { openBibtexModal(p.title || 'BibTeX', p.bibtex || ''); });
          addBtn('Scholar', p.scholar, 'chip-scholar');
          addBtn('Code', p.code, 'chip-plain');
          
          // Add citation count
          if (p.citations && p.citations > 0) {
            var citationEl = document.createElement('span');
            citationEl.className = 'pub-citations';
            citationEl.textContent = p.citations + ' citations';
            links.appendChild(citationEl);
          }
          li.appendChild(t); li.appendChild(v); li.appendChild(links);
          yearList.appendChild(li);
        });
        
        ol.appendChild(yearList);
      });
    }
    
    function extractYear(venue) {
      // Extract year from venue string (e.g., "In ICLR, 2025" -> "2025")
      var yearMatch = venue.match(/\b(20\d{2})\b/);
      return yearMatch ? yearMatch[1] : 'Unknown';
    }

    // If entries are paths, fetch and merge
    if (listRef.length && typeof listRef[0] === 'string') {
      var fetches = listRef.map(function (path) { return fetch(basePath + '/' + path).then(function (r) { return r.json(); }); });
      Promise.all(fetches).then(function (items) { renderItems(items); }).catch(function (e) { console.error('Failed to load publications', e); });
    } else {
      renderItems(listRef);
    }
  }

  function openBibtexModal(title, bibtex) {
    var overlay = document.getElementById('modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div'); overlay.id = 'modal-overlay'; overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><div class="modal-title"></div><button class="modal-close" aria-label="Close">Close</button></div><div class="modal-body"><pre class="code-block"></pre></div></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
      overlay.querySelector('.modal-close').addEventListener('click', function () { overlay.classList.remove('open'); });
    }
    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('pre').textContent = bibtex || '';
    overlay.classList.add('open');
  }

  function renderAwards(info) {
    var list = info.awards || [];
    var ul = document.getElementById('award-list');
    if (!ul) return;
    ul.innerHTML = '';
    list.forEach(function (aw, index) {
      var li = document.createElement('li'); 
      li.className = 'award-item';
      li.id = 'award-' + index;
      var year = document.createElement('span'); year.className = 'award-year'; year.textContent = aw.year || '';
      var name = document.createElement('span'); name.className = 'award-name'; name.textContent = aw.name || '';
      var by = document.createElement('span'); by.className = 'award-by'; by.textContent = aw.by || '';
      li.appendChild(year); li.appendChild(name); li.appendChild(by); ul.appendChild(li);
    });
  }

  var isLoaded = false; // Prevent duplicate loading
  
  function onLoad() {
    if (isLoaded) return; // Prevent duplicate calls
    isLoaded = true;
    
    loadInfo().then(function (info) {
      setProfileCommon(info);
      renderPhoto(info);
      renderMobileProfile(info);
      renderNews(info);
      renderStats(info);
      renderPublications(info);
      renderAwards(info);
      renderStatistics(info);
      
      // Update sidebar after publications are rendered
      setTimeout(function() {
        initUnifiedNavigation();
      }, 100);
      // Affiliation & owner name binding
      var p = info.profile || {};
      var aff = document.getElementById('profile-affil-global'); if (aff && p.affiliation) aff.textContent = p.affiliation;
      var nameRail = document.getElementById('profile-name-global'); if (nameRail && p.name) nameRail.textContent = p.name;
      var owner = document.getElementById('owner-name'); if (owner && p.name) owner.textContent = p.name;
    }).catch(function(error) {
      console.error('Error loading info:', error);
    });
  }

  function initUnifiedNavigation() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remove existing navigation if any
    var existingNav = document.getElementById('unified-navigation');
    if (existingNav) {
      existingNav.remove();
    }
    
    var nav = document.createElement('div');
    nav.id = 'unified-navigation';
    nav.className = 'unified-navigation';
    
    var toggle = document.createElement('button');
    toggle.className = 'post-nav-toggle';
    toggle.innerHTML = '☰';
    toggle.setAttribute('aria-label', 'Toggle navigation');
    
    var panel = document.createElement('div');
    panel.className = 'nav-panel';
    
    var headerRow = document.createElement('div');
    headerRow.className = 'sidebar-title';
    headerRow.style.display = 'flex';
    headerRow.style.alignItems = 'center';
    headerRow.style.justifyContent = 'space-between';
    var headerTitle = document.createElement('span');
    headerTitle.textContent = 'Quick Navigation';
    headerRow.appendChild(headerTitle);
    var backBtn = document.createElement('button');
    backBtn.setAttribute('aria-label', 'Back');
    backBtn.innerHTML = '↩';
    backBtn.style.cssText = 'border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:20px;padding:6px 10px;cursor:pointer;font-size:14px;line-height:1;';
    headerRow.appendChild(backBtn);
    panel.appendChild(headerRow);
    
    var navList = document.createElement('ul');
    navList.className = 'sidebar-nav';
    
    // Helper to render blog list into panel (used by post pages back button)
    var navMode = 'headers'; // headers | posts | categories

    function keepPanelOpen(e) {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      panel.classList.add('open');
      toggle.innerHTML = '✕';
    }

    function attachScrollSpy(navListEl) {
      var pageAll = Array.prototype.slice.call(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      var pageHeadings = pageAll.filter(function(h, idx){ return !(h.tagName === 'H1' && idx === 0); });
      if (pageHeadings.length === 0) return;
      var links = Array.prototype.slice.call(navListEl.querySelectorAll('a'));
      function stripNumbering(text) { return String(text).replace(/^\d+(?:\.\d+)*\s+/, '').trim(); }
      function getCurrentLabel() {
        var headerHeight = 100;
        var scrollYWithOffset = window.scrollY + headerHeight + 1;
        var cur = null;
        pageHeadings.forEach(function(h){ if (h.offsetTop <= scrollYWithOffset) cur = h; });
        return cur ? stripNumbering(cur.textContent) : null;
      }
      function update() {
        var current = getCurrentLabel();
        links.forEach(function(a){
          var label = stripNumbering(a.textContent);
          if (current && label === current) a.classList.add('active'); else a.classList.remove('active');
        });
      }
      window.addEventListener('scroll', update, { passive: true });
      update();
    }

    function renderBlogListInPanel() {
      navList.innerHTML = '';
      fetch(basePath + '/posts/index.json', { cache: 'no-store' })
        .then(function(r){ return r.json(); })
        .then(function(data){
          var list = Array.isArray(data) ? data : (data.posts || []);
          list.sort(function(a,b){ return new Date(b.date || '') - new Date(a.date || ''); });
          list.forEach(function(p){
            var li = document.createElement('li');
            var a = document.createElement('a');
            var postUrl = (basePath + '/posts/' + (p.filename || (p.slug + '.html')));
            a.href = postUrl;
            a.textContent = p.title || (p.filename || 'Post');
            // Clicking a post shows that post's headings inside panel
            a.addEventListener('click', function(e){
              e.preventDefault();
              keepPanelOpen(e);
              renderHeadingsForPost(postUrl);
            });
            li.appendChild(a);
            navList.appendChild(li);
          });
          navMode = 'posts';
        }).catch(function(){
          var li = document.createElement('li'); li.textContent = 'Failed to load posts.'; navList.appendChild(li);
        });
      keepPanelOpen();
    }

    function renderCategoriesListInPanel() {
      navList.innerHTML = '';
      fetch(basePath + '/posts/index.json', { cache: 'no-store' })
        .then(function(r){ return r.json(); })
        .then(function(data){
          var list = Array.isArray(data) ? data : (data.posts || []);
          var grouped = {};
          list.forEach(function(p){
            var cat = p.category || 'Uncategorized';
            (grouped[cat] = grouped[cat] || []).push(p);
          });
          Object.keys(grouped).sort().forEach(function(cat){
            var li = document.createElement('li');
            var strong = document.createElement('div');
            strong.textContent = cat;
            strong.style.fontWeight = '700';
            strong.style.margin = '8px 0 4px';
            li.appendChild(strong);
            var ul = document.createElement('ul'); ul.style.listStyle='none'; ul.style.padding='0';
            grouped[cat].forEach(function(p){
              var pli = document.createElement('li');
              var a = document.createElement('a');
              var postUrl = (basePath + '/posts/' + (p.filename || (p.slug + '.html')));
              a.href = postUrl;
              a.textContent = '• ' + (p.title || p.filename);
              a.addEventListener('click', function(e){ e.preventDefault(); keepPanelOpen(e); renderHeadingsForPost(postUrl); });
              pli.appendChild(a); ul.appendChild(pli);
            });
            li.appendChild(ul); navList.appendChild(li);
          });
          navMode = 'categories';
        }).catch(function(){ var li = document.createElement('li'); li.textContent = 'Failed to load categories.'; navList.appendChild(li); });
      keepPanelOpen();
    }

    function renderHeadingsForPost(postUrl) {
      navList.innerHTML = '';
      fetch(postUrl, { cache: 'no-store' }).then(function(r){ return r.text(); }).then(function(html){
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var all = Array.prototype.slice.call(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        // Skip first H1 (post title)
        var headings = all.filter(function(h, idx){ return !(h.tagName === 'H1' && idx === 0); });

        // Insert a nice clickable post title header in the panel
        var panelTitle = document.createElement('div');
        panelTitle.className = 'sidebar-post-title';
        var titleText = (doc.querySelector('.post-title') ? doc.querySelector('.post-title').textContent : (doc.title || 'Post')).trim();
        panelTitle.textContent = titleText;
        panelTitle.addEventListener('click', function(ev){ keepPanelOpen(ev); window.location.href = postUrl; });
        navList.appendChild(panelTitle);

        if (headings.length === 0) {
          var li = document.createElement('li'); li.textContent = 'No headings'; navList.appendChild(li); navMode = 'headers'; return;
        }
        // Counters for numbering
        var counters = [0,0,0,0,0,0];
        headings.forEach(function(h, idx){
          var li = document.createElement('li');
          var a = document.createElement('a');
          var level = parseInt(h.tagName.substring(1), 10);
          counters[level-1] += 1; for (var i=level;i<6;i++){ counters[i]=0; }
          var parts=[]; for (var j=0;j<level;j++){ if(counters[j]>0) parts.push(String(counters[j])); }
          var numbering = parts.join('.') + ' ';
          a.textContent = numbering + (h.textContent || 'Section');
          a.addEventListener('click', function(e){
            e.preventDefault();
            keepPanelOpen(e);
            // Try to scroll if already on that page; else save marker and navigate
            var current = window.location.pathname.replace(/\/+/g,'/');
            var target = document.createElement('a'); target.href = postUrl; var targetPath = target.pathname;
            var headingText = (h.textContent || '').trim();
            if (current === targetPath) {
              // find heading by text and scroll
              var pageHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
              var found=null; Array.prototype.forEach.call(pageHeadings, function(ph, k){ if (ph.textContent.trim() === headingText) { found = ph; } });
              if (found) {
                var headerHeight = 100;
                var pos = found.offsetTop - headerHeight;
                window.scrollTo({ top: pos, behavior: 'smooth' });
              }
            } else {
              try { localStorage.setItem('navScrollHeading', headingText); } catch(e) {}
              window.location.href = postUrl;
            }
          });
          li.appendChild(a); navList.appendChild(li);
        });
        navMode = 'headers';
        var samePageAnchor = document.createElement('a'); samePageAnchor.href = postUrl; if (samePageAnchor.pathname === window.location.pathname) {
          attachScrollSpy(navList);
        }
        keepPanelOpen();
      }).catch(function(){ var li = document.createElement('li'); li.textContent = 'Failed to load headings.'; navList.appendChild(li); });
    }

    // Page-specific navigation content
    if (currentPage === 'index.html' || currentPage === '') {
      createAboutNavigation(navList);
    } else if (currentPage === 'publications.html') {
      createPublicationsNavigation(navList);
    } else if (currentPage === 'awards.html') {
      createAwardsNavigation(navList);
    } else if (currentPage === 'blog.html') {
      createBlogNavigation(navList);
    } else if (currentPage.includes('.html') && window.location.pathname.includes('/posts/')) {
      backBtn.addEventListener('click', function(){
        if (navMode === 'headers') {
          renderBlogListInPanel();
        } else if (navMode === 'posts') {
          renderCategoriesListInPanel();
        } else {
          renderBlogListInPanel();
        }
        keepPanelOpen();
      });
      // Add post title above local headings for direct visits
      var currentTitle = (document.querySelector('.post-title') ? document.querySelector('.post-title').textContent : document.title || 'Post').trim();
      if (currentTitle) {
        var panelTitleNow = document.createElement('div');
        panelTitleNow.className = 'sidebar-post-title';
        panelTitleNow.textContent = currentTitle;
        panelTitleNow.addEventListener('click', function(ev){ keepPanelOpen(ev); /* noop on same page */ });
        navList.appendChild(panelTitleNow);
      }
      createPostNavigation(navList);
      // Ensure scroll spy is attached for current page's headings
      attachScrollSpy(navList);
    }
    
    panel.appendChild(navList);
    nav.appendChild(toggle);
    nav.appendChild(panel);
    
    // Toggle functionality
    toggle.addEventListener('click', function() {
      panel.classList.toggle('open');
      toggle.innerHTML = panel.classList.contains('open') ? '✕' : '☰';
    });
    
    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && panel.classList.contains('open')) {
        panel.classList.remove('open');
        toggle.innerHTML = '☰';
      }
    });
    
    document.body.appendChild(nav);
  }
  
  function createAboutNavigation(navList) {
    var sections = [
      { text: 'Introduction', href: '#hero' },
      { text: 'Recent News', href: '#news' },
      { text: 'Statistics', href: '#statistics' },
      { text: 'Gallery', href: '#gallery' }
    ];
    
    sections.forEach(function(section) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = section.href;
      a.textContent = section.text;
      
      // Add smooth scroll with offset for fixed header
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(section.href);
        if (target) {
          var headerHeight = 100; // Increased offset for better visibility
          var targetPosition = target.offsetTop - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
      
      li.appendChild(a);
      navList.appendChild(li);
    });
  }
  
  function createPublicationsNavigation(navList) {
    // Get years from publications
    var yearHeaders = document.querySelectorAll('.year-title');
    yearHeaders.forEach(function(header) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#year-' + header.textContent;
      a.textContent = header.textContent;
      
      // Add smooth scroll with offset for fixed header
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector('#year-' + header.textContent);
        if (target) {
          var headerHeight = 100; // Increased offset for better visibility
          var targetPosition = target.offsetTop - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
      
      li.appendChild(a);
      navList.appendChild(li);
    });
  }
  
  function createAwardsNavigation(navList) {
    var awards = document.querySelectorAll('.award-item');
    awards.forEach(function(award, index) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#award-' + index;
      var year = award.querySelector('.award-year').textContent;
      var name = award.querySelector('.award-name').textContent;
      a.textContent = year + ' - ' + name;
      
      // Add smooth scroll with offset for fixed header
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector('#award-' + index);
        if (target) {
          var headerHeight = 100; // Increased offset for better visibility
          var targetPosition = target.offsetTop - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
      
      li.appendChild(a);
      navList.appendChild(li);
    });
  }
  
  function createBlogNavigation(navList) {
    var posts = document.querySelectorAll('.post-card');
    posts.forEach(function(post, index) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#post-' + index;
      var title = post.querySelector('.post-title').textContent;
      a.textContent = title.length > 30 ? title.substring(0, 30) + '...' : title;
      
      // Add smooth scroll with offset for fixed header
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector('#post-' + index);
        if (target) {
          var headerHeight = 100; // Increased offset for better visibility
          var targetPosition = target.offsetTop - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
      
      li.appendChild(a);
      navList.appendChild(li);
    });
  }
  
  function createPostNavigation(navList) {
    // Exclude the main post title by skipping the first H1 if it exists near the top
    var all = Array.prototype.slice.call(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    var headings = all.filter(function(h, idx){
      if (h.tagName === 'H1' && idx === 0) return false; // skip first H1
      return true;
    });
    // Maintain hierarchical counters for levels 1..6
    var counters = [0, 0, 0, 0, 0, 0];
    headings.forEach(function(heading, index) {
      // Add ID to heading if it doesn't have one
      if (!heading.id) {
        heading.id = 'heading-' + index;
      }
      
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + heading.id;
      var level = parseInt(heading.tagName.substring(1), 10);
      // Update counters
      counters[level - 1] += 1;
      for (var i = level; i < 6; i++) { counters[i] = 0; }
      // Build numbering like 1, 1.1, 1.1.1
      var numberParts = [];
      for (var j = 0; j < level; j++) {
        if (counters[j] > 0) numberParts.push(String(counters[j]));
      }
      var numbering = numberParts.join('.') + ' ';
      a.textContent = numbering + heading.textContent;
      // nest level class for styling
      a.classList.add('nav-level-' + level);
      
      // Add smooth scroll with offset for fixed header
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector('#' + heading.id);
        if (target) {
          var headerHeight = 100; // Increased offset for better visibility
          var targetPosition = target.offsetTop - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
      
      li.appendChild(a);
      navList.appendChild(li);
    });
  }
  
  // Make onLoad globally available for non-blog pages.
  // On blog.html, run a lightweight header init so brand/avatar are set without rendering other sections.
  if (!window.location.pathname.includes('blog.html')) {
    window.onLoad = onLoad;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onLoad);
    } else {
      onLoad();
    }
  } else {
    // Blog page: ensure brand & avatar load
    var headerInit = function() {
      loadInfo().then(function(info){ setProfileCommon(info); renderPhoto(info); });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', headerInit);
    } else {
      headerInit();
    }
  }
})();

