(function () {
  const STORAGE_KEY = 'baulRecentlyViewed';
  const MAX_ITEMS = 8;
  const DEBOUNCE_MS = 200;
  const MIN_CHARS = 1;
  const SUGGEST_LIMIT = 8;

  const modal = document.getElementById('baul-search-modal');
  const form = document.getElementById('baul-search-modal-form');
  const input = document.getElementById('baul-search-modal-input');
  const body = document.getElementById('baul-search-modal-body');
  const clearBtn = document.getElementById('baul-search-modal-clear');

  if (!modal || !form || !input || !body) return;

  const moneyFormat = modal.dataset.moneyFormat || '${{amount_no_decimals}}';
  let debounceTimer = null;
  let abortController = null;
  let lastFocus = null;

  function getRecentlyViewed() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function trackRecentlyViewed(product) {
    if (!product || !product.id) return;
    const items = getRecentlyViewed().filter((p) => p.id !== product.id);
    items.unshift(product);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    } catch {
      /* ignore */
    }
  }

  function initRecentlyViewedTracking() {
    const el = document.getElementById('baul-product-json');
    if (!el) return;
    try {
      const data = JSON.parse(el.textContent);
      if (!data.id) return;
      trackRecentlyViewed({
        id: data.id,
        handle: data.handle,
        title: data.title,
        url: data.url,
        image: data.image,
        price: data.price,
        compare_at_price: data.compare_at_price || 0,
        moneyFormat: data.moneyFormat,
      });
    } catch {
      /* ignore */
    }
  }

  function getPopularData() {
    const el = document.getElementById('baul-search-popular-json');
    if (!el) return { url: '/collections/mas-vendidos', products: [] };
    try {
      const data = JSON.parse(el.textContent);
      if (Array.isArray(data)) return { url: '/collections/mas-vendidos', products: data };
      return {
        url: data.url || '/collections/mas-vendidos',
        products: data.products || [],
      };
    } catch {
      return { url: '/collections/mas-vendidos', products: [] };
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatMoney(cents) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, moneyFormat);
    }
    return '$' + Math.round(cents / 100).toLocaleString('es-CL');
  }

  function parseCents(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    if (Number.isNaN(num)) return 0;
    return Math.round(num * 100);
  }

  function buildPriceHtml(product) {
    const priceCents =
      typeof product.price === 'number' ? product.price : parseCents(product.price);
    const compareCents =
      product.compare_at_price != null
        ? typeof product.compare_at_price === 'number'
          ? product.compare_at_price
          : parseCents(product.compare_at_price)
        : parseCents(product.compare_at_price_max);

    if (compareCents > priceCents && priceCents > 0) {
      return (
        '<div class="baul-search-card__price">' +
        '<span class="baul-search-card__compare">' +
        escapeHtml(formatMoney(compareCents)) +
        '</span>' +
        '<span class="baul-search-card__sale">' +
        escapeHtml(formatMoney(priceCents)) +
        '</span></div>'
      );
    }

    if (priceCents > 0) {
      return (
        '<div class="baul-search-card__price"><span class="baul-search-card__regular">' +
        escapeHtml(formatMoney(priceCents)) +
        '</span></div>'
      );
    }

    return '';
  }

  function buildCardHtml(product) {
    const img = product.image || product.featured_image?.url || '';
    const title = escapeHtml(product.title || '');
    const url = product.url || '/products/' + (product.handle || '');
    const imgHtml = img
      ? '<img class="baul-search-card__img" src="' +
        escapeHtml(img) +
        '" alt="" width="240" height="300" loading="lazy">'
      : '<div class="baul-search-card__img baul-search-card__img--empty"></div>';

    return (
      '<li class="baul-search-card">' +
      '<a class="baul-search-card__link" href="' +
      escapeHtml(url) +
      '">' +
      '<div class="baul-search-card__media">' +
      imgHtml +
      '</div>' +
      '<div class="baul-search-card__content">' +
      '<p class="baul-search-card__title">' +
      title +
      '</p>' +
      buildPriceHtml(product) +
      '</div></a></li>'
    );
  }

  function buildSection(title, products, footerHtml) {
    if (!products.length) return '';
    return (
      '<section class="baul-search-section">' +
      '<h4 class="baul-search-section__title">' +
      escapeHtml(title) +
      '</h4>' +
      '<ul class="baul-search-grid" role="listbox">' +
      products.map(buildCardHtml).join('') +
      '</ul>' +
      (footerHtml || '') +
      '</section>'
    );
  }

  function buildDefaultHtml() {
    const recent = getRecentlyViewed();
    const popularData = getPopularData();
    const recentIds = new Set(recent.map((p) => p.id));
    const popular = (popularData.products || [])
      .filter((p) => !recentIds.has(p.id))
      .slice(0, MAX_ITEMS);

    let html = '';
    if (recent.length) {
      html += buildSection('Vistos recientemente', recent);
    }
    if (popular.length) {
      html += buildSection(
        'Productos',
        popular,
        '<a href="' +
          escapeHtml(popularData.url || '/collections/mas-vendidos') +
          '" class="baul-search-modal__footer-link">Ver todos los más vendidos →</a>'
      );
    }
    return html;
  }

  function renderResults(products, q) {
    if (!products.length) {
      body.innerHTML =
        '<div class="baul-search-modal__empty">No hay resultados para "' +
        escapeHtml(q) +
        '"</div>' +
        '<a href="/search?q=' +
        encodeURIComponent(q) +
        '&type=product" class="baul-search-modal__footer-link">Ver todos los resultados →</a>';
      return;
    }

    const mapped = products.map((p) => ({
      title: p.title,
      url: p.url,
      image: p.featured_image?.url || p.image,
      price: parseCents(p.price),
      compare_at_price: parseCents(p.compare_at_price_max),
    }));

    body.innerHTML = buildSection(
      'Productos',
      mapped,
      '<a href="/search?q=' +
        encodeURIComponent(q) +
        '&type=product" class="baul-search-modal__footer-link">Ver todos los resultados →</a>'
    );
  }

  function showDefault() {
    const html = buildDefaultHtml();
    body.innerHTML = html || '<div class="baul-search-modal__empty">Escribe para buscar productos</div>';
  }

  function updateClearButton() {
    if (!clearBtn) return;
    const hasValue = input.value.trim().length > 0;
    clearBtn.hidden = !hasValue;
  }

  async function fetchSuggestions(q) {
    if (abortController) abortController.abort();
    abortController = new AbortController();

    body.innerHTML = '<div class="baul-search-modal__loading">Buscando…</div>';

    try {
      const params = new URLSearchParams({
        q: q,
        'resources[type]': 'product',
        'resources[limit]': String(SUGGEST_LIMIT),
        'resources[options][unavailable_products]': 'last',
      });
      const res = await fetch('/search/suggest.json?' + params, {
        signal: abortController.signal,
      });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      renderResults(data?.resources?.results?.products || [], q);
    } catch (err) {
      if (err.name !== 'AbortError') showDefault();
    }
  }

  function onInput() {
    updateClearButton();
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < MIN_CHARS) {
      showDefault();
      return;
    }
    debounceTimer = setTimeout(() => fetchSuggestions(q), DEBOUNCE_MS);
  }

  function openModal(prefill) {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('baul-search-modal-open');
    if (typeof prefill === 'string') input.value = prefill;
    updateClearButton();
    showDefault();
    requestAnimationFrame(() => input.focus({ preventScroll: true }));
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('baul-search-modal-open');
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function bindTriggers() {
    document.querySelectorAll('[data-search-open], #n-search-open').forEach((btn) => {
      btn.addEventListener('click', () => openModal());
    });
  }

  input.addEventListener('input', onInput);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      updateClearButton();
      showDefault();
      input.focus();
    });
  }

  modal.querySelectorAll('[data-search-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  form.addEventListener('submit', () => closeModal());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      e.preventDefault();
      closeModal();
    }
  });

  bindTriggers();
  initRecentlyViewedTracking();
})();
