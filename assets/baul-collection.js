(function () {
  const FILTERS = [
    { id: 'retro', label: 'Retro' },
    { id: 'ninos', label: 'Niños' },
    { id: 'mujer', label: 'Mujer' },
    { id: 'adultos', label: 'Adultos' },
    { id: 'player', label: 'Player Version' },
    { id: 'manga-larga', label: 'Manga Larga' },
    { id: 'cortavientos', label: 'Cortavientos' },
  ];

  const grid = document.querySelector('[data-collection-infinite]');
  const sentinel = document.getElementById('bc-infinite-sentinel');
  const status = document.getElementById('bc-infinite-status');
  const filtersRoot = document.getElementById('bc-filters');
  const filtersPills = document.getElementById('bc-filters-pills');
  const filtersClear = document.getElementById('bc-filters-clear');
  const filtersCount = document.getElementById('bc-filters-count');
  const filtersEmpty = document.getElementById('bc-filters-empty');

  if (!grid) return;

  const collectionHandle = grid.dataset.collectionHandle || '';
  const totalPages = parseInt(grid.dataset.collectionPages, 10) || 1;
  const collectionBase = grid.dataset.collectionBase || window.location.pathname;

  let loading = false;
  let nextUrl = sentinel?.dataset.nextUrl || '';
  let observer = null;
  let allProductsLoaded = totalPages <= 1;
  let preloadPromise = null;

  const activeFilters = new Set();
  const productTagsByHandle = new Map();

  function isNinos(title) {
    return /niñ[oa]s?|ninos?/i.test(title);
  }

  function isMujer(title) {
    return /mujer/i.test(title);
  }

  function isAdultos(title) {
    if (/adultos?/i.test(title)) return true;
    return !isNinos(title) && !isMujer(title);
  }

  function isPlayer(title) {
    return /player[\s_-]*version|player/i.test(title);
  }

  function isMangaLarga(title) {
    return /manga[\s-]*larga/i.test(title);
  }

  function isCortavientos(title) {
    return /cortavientos?|chaqueta/i.test(title);
  }

  function yearFromShort(part) {
    const n = parseInt(part, 10);
    if (Number.isNaN(n)) return null;
    return n < 50 ? 2000 + n : 1900 + n;
  }

  function isRetro(title) {
    const t = title.toLowerCase();

    const fullYears = t.match(/\b(19\d{2}|20\d{2})\b/g) || [];
    for (const yearStr of fullYears) {
      if (parseInt(yearStr, 10) < 2021) return true;
    }

    const seasonFull = t.match(/\b(19\d{2}|20\d{2})\s*[\/\-]\s*(19\d{2}|20\d{2})\b/g) || [];
    for (const season of seasonFull) {
      const start = parseInt(season.match(/\d{4}/)[0], 10);
      if (start < 2021) return true;
    }

    const seasonShort = t.match(/\b(\d{2})\s*[\/\-]\s*(\d{2})\b/g) || [];
    for (const season of seasonShort) {
      const parts = season.split(/[\/\-]/);
      const start = yearFromShort(parts[0].trim());
      if (start !== null && start < 2021) return true;
    }

    return false;
  }

  function getTagsForTitle(title) {
    const tags = new Set();
    if (isRetro(title)) tags.add('retro');
    if (isNinos(title)) tags.add('ninos');
    if (isMujer(title)) tags.add('mujer');
    if (isAdultos(title)) tags.add('adultos');
    if (isPlayer(title)) tags.add('player');
    if (isMangaLarga(title)) tags.add('manga-larga');
    if (isCortavientos(title)) tags.add('cortavientos');
    return tags;
  }

  function itemMatchesFilters(handle, title) {
    if (activeFilters.size === 0) return true;
    const tags = productTagsByHandle.get(handle) || getTagsForTitle(title);
    for (const filterId of activeFilters) {
      if (!tags.has(filterId)) return false;
    }
    return true;
  }

  function getHandlesInDom() {
    return new Set(
      Array.from(grid.querySelectorAll('.bc-filter-item'))
        .map((el) => el.dataset.bcHandle)
        .filter(Boolean)
    );
  }

  function tagFilterItems(scope) {
    const root = scope || document;
    root.querySelectorAll('.bc-filter-item').forEach((item) => {
      const handle = item.dataset.bcHandle;
      const title = item.dataset.bcTitle || '';
      if (!handle) return;
      const tags = getTagsForTitle(title);
      productTagsByHandle.set(handle, tags);
      item.dataset.bcTags = Array.from(tags).join(',');
    });
  }

  function appendFilterItems(items) {
    const handlesInDom = getHandlesInDom();
    const added = [];

    items.forEach((item) => {
      const handle = item.dataset.bcHandle;
      if (!handle || handlesInDom.has(handle)) return;
      handlesInDom.add(handle);
      const card = item.querySelector('.pc');
      if (card) card.classList.add('in');
      grid.appendChild(item);
      added.push(item);
    });

    if (added.length) tagFilterItems(grid);
    return added;
  }

  function finishPreload() {
    allProductsLoaded = true;
    nextUrl = '';
    observer?.disconnect();
    if (sentinel) sentinel.remove();
    if (status) status.hidden = true;
  }

  function preloadAllPages() {
    if (allProductsLoaded) return Promise.resolve();
    if (preloadPromise) return preloadPromise;

    if (totalPages <= 1) {
      allProductsLoaded = true;
      return Promise.resolve();
    }

    preloadPromise = (async () => {
      const urls = [];
      for (let page = 2; page <= totalPages; page += 1) {
        urls.push(`${collectionBase}?page=${page}`);
      }

      const pages = await Promise.all(
        urls.map((url) =>
          fetch(url).then((res) => (res.ok ? res.text() : ''))
        )
      );

      pages.forEach((html) => {
        if (!html) return;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const items = Array.from(doc.querySelectorAll('.bc-filter-item'));
        appendFilterItems(items);
      });

      finishPreload();

      if (typeof window.baulInitProductSocialProof === 'function') {
        window.baulInitProductSocialProof();
      }

      if (activeFilters.size > 0) applyFilters();
    })().catch(() => {
      preloadPromise = null;
    });

    return preloadPromise;
  }

  function countMatchingInCollection() {
    if (activeFilters.size === 0) return productTagsByHandle.size;

    let count = 0;
    productTagsByHandle.forEach((tags) => {
      let match = true;
      for (const filterId of activeFilters) {
        if (!tags.has(filterId)) {
          match = false;
          break;
        }
      }
      if (match) count += 1;
    });
    return count;
  }

  function applyFilters() {
    grid.querySelectorAll('.bc-filter-item').forEach((item) => {
      const handle = item.dataset.bcHandle;
      const title = item.dataset.bcTitle || '';
      item.hidden = !itemMatchesFilters(handle, title);
    });

    if (filtersClear) filtersClear.hidden = activeFilters.size === 0;

    const totalMatching = activeFilters.size > 0 ? countMatchingInCollection() : 0;
    if (filtersEmpty) {
      filtersEmpty.hidden = activeFilters.size === 0 || totalMatching > 0;
    }

    if (filtersCount) {
      if (activeFilters.size === 0) {
        filtersCount.hidden = true;
      } else {
        filtersCount.hidden = false;
        filtersCount.textContent =
          totalMatching === 1 ? '1 producto' : `${totalMatching} productos`;
      }
    }

    filtersPills?.querySelectorAll('.bc-filter-pill').forEach((pill) => {
      const id = pill.dataset.filterId;
      pill.classList.toggle('is-active', activeFilters.has(id));
      pill.setAttribute('aria-pressed', activeFilters.has(id) ? 'true' : 'false');
    });
  }

  async function fetchAllCollectionProducts(handle) {
    const products = [];
    let page = 1;

    while (true) {
      const res = await fetch(
        `/collections/${encodeURIComponent(handle)}/products.json?limit=250&page=${page}`
      );
      if (!res.ok) break;
      const data = await res.json();
      if (!data.products?.length) break;
      products.push(...data.products);
      if (data.products.length < 250) break;
      page += 1;
    }

    return products;
  }

  async function enrichProductTags() {
    if (!collectionHandle) return;

    try {
      const products = await fetchAllCollectionProducts(collectionHandle);
      const availableIds = new Set();

      products.forEach((product) => {
        const tags = getTagsForTitle(product.title);
        productTagsByHandle.set(product.handle, tags);
        tags.forEach((tag) => availableIds.add(tag));
      });

      buildFilterBar(availableIds);
      applyFilters();
    } catch (e) {
      const availableIds = new Set();
      productTagsByHandle.forEach((tags) => {
        tags.forEach((tag) => availableIds.add(tag));
      });
      buildFilterBar(availableIds);
    }
  }

  function buildFilterBar(availableIds) {
    if (!filtersRoot || !filtersPills) return;

    filtersPills.innerHTML = '';
    const available = FILTERS.filter((f) => availableIds.has(f.id));

    if (available.length === 0) {
      filtersRoot.hidden = true;
      return;
    }

    available.forEach((filter) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bc-filter-pill';
      btn.dataset.filterId = filter.id;
      btn.textContent = filter.label;
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => onFilterToggle(filter.id));
      filtersPills.appendChild(btn);
    });

    filtersRoot.hidden = false;
  }

  async function onFilterToggle(filterId) {
    if (activeFilters.has(filterId)) {
      activeFilters.delete(filterId);
    } else {
      activeFilters.add(filterId);
    }

    if (activeFilters.size > 0) {
      observer?.disconnect();
      if (status) status.hidden = true;
      await preloadAllPages();
    } else if (!allProductsLoaded && sentinel && nextUrl) {
      observer?.observe(sentinel);
    }

    applyFilters();
  }

  function init() {
    tagFilterItems(document);
    applyFilters();
    enrichProductTags();
    preloadAllPages();
  }

  async function loadMore() {
    if (activeFilters.size > 0 || loading || !nextUrl || allProductsLoaded) return;
    loading = true;
    if (status) status.hidden = false;

    try {
      const res = await fetch(nextUrl);
      if (!res.ok) throw new Error('Failed to load collection page');

      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const newGrid = doc.querySelector('[data-collection-infinite]');
      const newSentinel = doc.getElementById('bc-infinite-sentinel');

      if (newGrid) {
        appendFilterItems(Array.from(newGrid.querySelectorAll('.bc-filter-item')));
        applyFilters();
        if (typeof window.baulInitProductSocialProof === 'function') {
          window.baulInitProductSocialProof();
        }
      }

      nextUrl = newSentinel?.dataset.nextUrl || '';
      if (sentinel) sentinel.dataset.nextUrl = nextUrl;

      if (!nextUrl) finishPreload();
    } catch (e) {
      observer?.disconnect();
    } finally {
      loading = false;
      if (status && activeFilters.size === 0) status.hidden = true;
    }
  }

  filtersClear?.addEventListener('click', async () => {
    activeFilters.clear();
    if (!allProductsLoaded && sentinel && nextUrl) {
      observer?.observe(sentinel);
    }
    applyFilters();
  });

  if (sentinel) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: '240px' }
    );
    if (totalPages <= 1 && nextUrl) observer.observe(sentinel);
  }

  init();
})();
