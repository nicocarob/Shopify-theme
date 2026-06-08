(function () {
  const root = document.getElementById('bm-mundial');
  if (!root) return;

  const searchInput = document.getElementById('bm-search');
  const searchHint = document.getElementById('bm-search-hint');
  const banner = document.getElementById('bm-selected-banner');
  const bannerFlag = document.getElementById('bm-selected-flag');
  const bannerName = document.getElementById('bm-selected-name');
  const flagBtns = root.querySelectorAll('.bm-flag-btn');
  const continents = root.querySelectorAll('.bm-continent');
  const REDIRECT_DELAY = 750;

  let redirectTimer = null;

  function norm(value) {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function buildSearchUrl(name) {
    return '/search?q=' + encodeURIComponent(name) + '&type=product';
  }

  function setActive(btn) {
    flagBtns.forEach(function (el) {
      el.classList.remove('is-active');
    });
    if (btn) btn.classList.add('is-active');
  }

  function showBanner(name, flag) {
    bannerFlag.textContent = flag || '⚽';
    bannerName.textContent = name;
    banner.hidden = false;
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function redirectToSearch(name) {
    if (redirectTimer) clearTimeout(redirectTimer);
    redirectTimer = setTimeout(function () {
      window.location.href = buildSearchUrl(name);
    }, REDIRECT_DELAY);
  }

  function selectCountry(btn) {
    const name = btn.dataset.name;
    const flag = btn.dataset.flag;
    setActive(btn);
    showBanner(name, flag);
    redirectToSearch(name);
  }

  function filterFlags(query) {
    const q = norm(query);
    let visibleCount = 0;

    flagBtns.forEach(function (btn) {
      const item = btn.closest('.bm-flag-item');
      const name = norm(btn.dataset.name || '');
      const match = !q || name.includes(q);
      item.hidden = !match;
      if (match) visibleCount += 1;
    });

    continents.forEach(function (continent) {
      const visibleInContinent = continent.querySelectorAll('.bm-flag-item:not([hidden])').length;
      continent.hidden = q.length > 0 && visibleInContinent === 0;
    });

    if (searchHint) {
      searchHint.hidden = !q || visibleCount > 0;
    }
  }

  function handleSearchSubmit() {
    const query = searchInput.value.trim();
    if (!query) return;

    const visibleBtns = Array.from(flagBtns).filter(function (btn) {
      return !btn.closest('.bm-flag-item').hidden;
    });

    if (visibleBtns.length === 1) {
      selectCountry(visibleBtns[0]);
      return;
    }

    const exact = Array.from(flagBtns).find(function (btn) {
      return norm(btn.dataset.name) === norm(query);
    });

    if (exact) {
      selectCountry(exact);
      return;
    }

    setActive(null);
    showBanner(query, '⚽');
    redirectToSearch(query);
  }

  flagBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectCountry(btn);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      filterFlags(searchInput.value);
    });

    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearchSubmit();
      }
    });
  }
})();
