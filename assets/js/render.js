(function(){
  function loadInfo() {
    return fetch('./assets/info.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
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
          if (!href && !click) return;
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

  function onLoad() {
    // Only fetch info if we are on a page that needs it (e.g. publications)
    // Actually, we might want to check if #pub-list exists first to save network request on index?
    // But since this is a small site, it's fine.
    var pubList = document.getElementById('pub-list');
    if (pubList) {
      loadInfo().then(function (info) {
        renderPublications(info);
      }).catch(function (e) {
        console.error('Failed to load info.json', e);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLoad);
  } else {
    onLoad();
  }
})();
