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
    if (h1 && p.name) h1.textContent = p.name;
    var subtitle = document.querySelector('.subtitle');
    if (subtitle && p.title) subtitle.textContent = p.title;
    var bio = document.getElementById('bio');
    if (bio && p.bio) bio.textContent = p.bio;

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
    var wrap = document.getElementById('news');
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

  function renderMobileProfile(info) {
    var p = info.profile || {};
    
    // Mobile profile photo
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
      { label: 'H-Index', value: Number(stats.h_index || 0) },
      { label: 'Research Years', value: Number(stats.research_years || 0) },
      { label: 'Collaborations', value: Number(stats.collaborations || 0) }
    ];
    wrap.innerHTML = '';
    data.forEach(function (d) {
      var row = document.createElement('div'); row.className = 'profile-stat-row';
      var label = document.createElement('span'); label.className = 'profile-stat-label'; label.textContent = d.label;
      var val = document.createElement('span'); val.className = 'profile-stat-value'; val.textContent = String(d.value);
      row.appendChild(label); row.appendChild(val);
      wrap.appendChild(row);
    });
    
    // Add skills section
    if (stats.languages && stats.languages.length > 0) {
      var skillsSection = document.createElement('div');
      skillsSection.className = 'profile-skills';
      var skillsTitle = document.createElement('div');
      skillsTitle.className = 'profile-skills-title';
      skillsTitle.textContent = 'Technical Skills';
      skillsSection.appendChild(skillsTitle);
      
      var skillsList = document.createElement('div');
      skillsList.className = 'profile-skills-list';
      stats.languages.forEach(function(skill) {
        var skillTag = document.createElement('span');
        skillTag.className = 'profile-skill-tag';
        skillTag.textContent = skill;
        skillsList.appendChild(skillTag);
      });
      skillsSection.appendChild(skillsList);
      wrap.appendChild(skillsSection);
    }
    
    // Add conferences section
    if (stats.conferences && stats.conferences.length > 0) {
      var confSection = document.createElement('div');
      confSection.className = 'profile-conferences';
      var confTitle = document.createElement('div');
      confTitle.className = 'profile-conferences-title';
      confTitle.textContent = 'Conferences';
      confSection.appendChild(confTitle);
      
      var confList = document.createElement('div');
      confList.className = 'profile-conferences-list';
      stats.conferences.forEach(function(conf) {
        var confTag = document.createElement('span');
        confTag.className = 'profile-conf-tag';
        confTag.textContent = conf;
        confList.appendChild(confTag);
      });
      confSection.appendChild(confList);
      wrap.appendChild(confSection);
    }
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
          var t = document.createElement('span'); t.className = 'pub-title'; t.textContent = p.title || '';
          var a = document.createElement('span'); a.className = 'pub-authors'; a.textContent = p.authors || '';
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
          addBtn('Code', p.code, 'chip-plain');
          li.appendChild(t); li.appendChild(a); li.appendChild(v); li.appendChild(links);
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
      renderNews(info);
      renderStats(info);
      renderPublications(info);
      renderAwards(info);
      
      // Update sidebar after publications are rendered
      setTimeout(function() {
        initUnifiedNavigation();
      }, 100);
      // Affiliation & owner name binding
      var p = info.profile || {};
      var aff = document.getElementById('profile-affil-global'); if (aff && p.affiliation) aff.textContent = p.affiliation;
      var nameRail = document.getElementById('profile-name-global'); if (nameRail && p.name) nameRail.textContent = p.name;
      var owner = document.getElementById('owner-name'); if (owner && p.name) owner.textContent = p.name;
      
      // Mobile profile section
      renderMobileProfile(info);
      // Rail links
      var railCv = document.getElementById('rail-cv-global'); if (railCv && p.cv) railCv.href = basePath + '/' + p.cv;
      var links = (p.links || {});
      var railSch = document.getElementById('rail-scholar-global'); if (railSch && links.scholar) railSch.href = links.scholar;
      var railGh = document.getElementById('rail-github-global'); if (railGh && links.github) railGh.href = links.github;
      var railLi = document.getElementById('rail-linkedin-global'); if (railLi && links.linkedin) railLi.href = links.linkedin;
    }).catch(function (e) {
      console.error('Failed to load info.json', e);
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
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLoad);
  } else {
    onLoad();
  }
})();

