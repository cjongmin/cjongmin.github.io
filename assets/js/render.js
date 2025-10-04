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
    var elScholar = document.getElementById('chip-scholar'); if (elScholar && links.scholar) elScholar.href = links.scholar;
    var elGithub = document.getElementById('chip-github'); if (elGithub && links.github) elGithub.href = links.github;
    var elLinkedin = document.getElementById('chip-linkedin'); if (elLinkedin && links.linkedin) elLinkedin.href = links.linkedin;

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
    
    // Mobile profile links
    var mobileLinks = document.getElementById('mobile-profile-links');
    if (mobileLinks) {
      mobileLinks.innerHTML = '';
      
      // CV link
      if (p.cv) {
        var cvLink = document.createElement('a');
        cvLink.href = basePath + '/' + p.cv;
        cvLink.target = '_blank';
        cvLink.innerHTML = '📄 CV';
        mobileLinks.appendChild(cvLink);
      }
      
      // External links
      var links = p.links || {};
      if (links.scholar) {
        var scholarLink = document.createElement('a');
        scholarLink.href = links.scholar;
        scholarLink.target = '_blank';
        scholarLink.innerHTML = '🎓 Scholar';
        mobileLinks.appendChild(scholarLink);
      }
      
      if (links.github) {
        var githubLink = document.createElement('a');
        githubLink.href = links.github;
        githubLink.target = '_blank';
        githubLink.innerHTML = '💻 GitHub';
        mobileLinks.appendChild(githubLink);
      }
      
      if (links.linkedin) {
        var linkedinLink = document.createElement('a');
        linkedinLink.href = links.linkedin;
        linkedinLink.target = '_blank';
        linkedinLink.innerHTML = '💼 LinkedIn';
        mobileLinks.appendChild(linkedinLink);
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
      
      container.appendChild(galleryItem);
    });
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
    ol.innerHTML = '';

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

  function onLoad() {
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
    
    var title = document.createElement('div');
    title.className = 'sidebar-title';
    title.textContent = 'Quick Navigation';
    panel.appendChild(title);
    
    var navList = document.createElement('ul');
    navList.className = 'sidebar-nav';
    
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
      createPostNavigation(navList);
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
      { text: 'Research Interests', href: '#interests' },
      { text: 'Statistics', href: '#stats' }
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
          var headerHeight = 50; // Account for fixed header
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
          var headerHeight = 50; // Account for fixed header
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
          var headerHeight = 50; // Account for fixed header
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
          var headerHeight = 50; // Account for fixed header
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
    var headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(function(heading, index) {
      // Add ID to heading if it doesn't have one
      if (!heading.id) {
        heading.id = 'heading-' + index;
      }
      
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + heading.id;
      a.textContent = heading.textContent;
      
      // Add smooth scroll with offset for fixed header
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector('#' + heading.id);
        if (target) {
          var headerHeight = 50; // Account for fixed header
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
  
  // Make onLoad globally available
  window.onLoad = onLoad;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLoad);
  } else {
    onLoad();
  }
})();

