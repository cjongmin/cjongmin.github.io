(function(){
  function loadInfo() {
    return fetch('./assets/info.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
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
    if (cv && p.cv) cv.href = p.cv;
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
    if (railImg && photoUrl) railImg.src = photoUrl;
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

  function renderStats(info) {
    var stats = info.stats || {};
    var wrap = document.getElementById('profile-stats-global');
    if (!wrap) return;
    var data = [
      { label: 'Publications', value: Number(stats.publications || 0) },
      { label: 'Awards', value: Number(stats.awards || 0) }
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

  function renderPublications(info) {
    var listRef = info.publications || [];
    var ol = document.getElementById('pub-list');
    if (!ol) return;
    ol.innerHTML = '';

    function renderItems(items) {
      items.forEach(function (p) {
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
        ol.appendChild(li);
      });
    }

    // If entries are paths, fetch and merge
    if (listRef.length && typeof listRef[0] === 'string') {
      var fetches = listRef.map(function (path) { return fetch('./' + path).then(function (r) { return r.json(); }); });
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
    list.forEach(function (aw) {
      var li = document.createElement('li'); li.className = 'award-item';
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
      // Affiliation & owner name binding
      var p = info.profile || {};
      var aff = document.getElementById('profile-affil-global'); if (aff && p.affiliation) aff.textContent = p.affiliation;
      var nameRail = document.getElementById('profile-name-global'); if (nameRail && p.name) nameRail.textContent = p.name;
      var owner = document.getElementById('owner-name'); if (owner && p.name) owner.textContent = p.name;
      // Rail links
      var railCv = document.getElementById('rail-cv-global'); if (railCv && p.cv) railCv.href = p.cv;
      var links = (p.links || {});
      var railSch = document.getElementById('rail-scholar-global'); if (railSch && links.scholar) railSch.href = links.scholar;
      var railGh = document.getElementById('rail-github-global'); if (railGh && links.github) railGh.href = links.github;
      var railLi = document.getElementById('rail-linkedin-global'); if (railLi && links.linkedin) railLi.href = links.linkedin;
    }).catch(function (e) {
      console.error('Failed to load info.json', e);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLoad);
  } else {
    onLoad();
  }
})();


