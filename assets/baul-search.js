(function () {
  const STORAGE_KEY = 'baulRecentlyViewed';
  const MAX_RECENT = 8;
  const DEBOUNCE_MS = 180;
  const MIN_CHARS = 1;
  const SUGGEST_LIMIT = 8;

  let moneyFormat = '${{amount_no_decimals}}';
  let popularUrl = '/collections/mas-vendidos';
  let popularProducts = [];
  let overlayInstance = null;

  function getRecentlyViewed() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveRecentlyViewed(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
    } catch {
      /* ignore */
    }
  }

  function clearRecentlyViewed() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  function trackRecentlyViewed(product) {
    if (!product || !product.id) return;
    const items = getRecentlyViewed().filter((p) => p.id !== product.id);
    items.unshift(product);
    saveRecentlyViewed(items);
  }

  function formatMoney(cents, format) {
    const fmt = format || moneyFormat;
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, fmt);
    }
    return '$' + Math.round(cents).toLocaleString('es-CL');
  }

  function parseSuggestPrice(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    return Number.isNaN(num) ? 0 : Math.round(num);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function loadPopularData() {
    const el = document.getElementById('baul-search-popular-json');
    if (!el) return;
    try {
      const data = JSON.parse(el.textContent);
      if (data.moneyFormat) moneyFormat = data.moneyFormat;
      popularUrl = data.url || popularUrl;
      popularProducts = data.products || [];
    } catch {
      popularProducts = [];
    }
  }

  function buildPricesHtml(product) {
    const priceCents =
      typeof product.price === 'number' ? product.price : parseSuggestPrice(product.price);
    const compareCents =
      typeof product.compare_at_price === 'number'
        ? product.compare_at_price
        : parseSuggestPrice(product.compare_at_price);

    if (compareCents > priceCents && priceCents > 0) {
      return (
        '<div class="baul-search-item__prices">' +
        '<span class="baul-search-item__compare">' +
        escapeHtml(formatMoney(compareCents)) +
        '</span>' +
        '<span class="baul-search-item__price">' +
        escapeHtml(formatMoney(priceCents)) +
        '</span></div>'
      );
    }

    if (!priceCents) return '';
    return (
      '<div class="baul-search-item__prices">' +
      '<span class="baul-search-item__price">' +
      escapeHtml(formatMoney(priceCents)) +
      '</span></div>'
    );
  }

  function buildCardHtml(product) {
    const img = product.image || product.featured_image?.url || '';
    const title = escapeHtml(product.title || '');
    const url = product.url || '/products/' + (product.handle || '');
    const pricesHtml = buildPricesHtml(product);
    const imgHtml = img
      ? '<img class="baul-search-item__img" src="' +
        escapeHtml(img) +
        '" alt="" width="320" height="320" loading="lazy">'
      : '<div class="baul-search-item__img baul-search-item__img--empty"></div>';

    return (
      '<a href="' +
      escapeHtml(url) +
      '" class="baul-search-item baul-search-item--grid">' +
      '<div class="baul-search-item__media">' +
      imgHtml +
      '</div>' +
      '<div class="baul-search-item__body">' +
      '<span class="baul-search-item__title">' +
      title +
      '</span>' +
      pricesHtml +
      '</div></a>'
    );
  }

  function buildDefaultHtml() {
    const recent = getRecentlyViewed();
    const recentIds = new Set(recent.map((p) => p.id));
    const popular = popularProducts.filter((p) => !recentIds.has(p.id)).slice(0, MAX_RECENT);
    let html = '<div class="baul-search-panel">';

    if (recent.length) {
      html +=
        '<div class="baul-search-panel__head">' +
        '<p class="baul-search-panel__label">Visto recientemente</p>' +
        '<button type="button" class="baul-search-panel__clear" data-clear-recent>Borrar</button>' +
        '</div>' +
        '<div class="baul-search-list baul-search-list--grid">' +
        recent.map(buildCardHtml).join('') +
        '</div>';
    }

    if (popular.length) {
      html +=
        '<div class="baul-search-panel__head' +
        (recent.length ? ' baul-search-panel__head--spaced' : '') +
        '">' +
        '<p class="baul-search-panel__label">Más vendidos</p>' +
        '</div>' +
        '<div class="baul-search-list baul-search-list--grid">' +
        popular.map(buildCardHtml).join('') +
        '</div>' +
        '<a href="' +
        escapeHtml(popularUrl) +
        '" class="baul-search-view-all">Ver todos los más vendidos →</a>';
    }

    if (!recent.length && !popular.length) {
      html +=
        '<p class="baul-search-panel__empty">Escribe el nombre de un equipo o camiseta para buscar.</p>';
    }

    html += '</div>';
    return html;
  }

  function buildResultsHtml(products, q) {
    if (!products.length) {
      return (
        '<div class="baul-search-panel">' +
        '<p class="baul-search-panel__empty">No hay resultados para "' +
        escapeHtml(q) +
        '"</p>' +
        '<a href="/search?q=' +
        encodeURIComponent(q) +
        '&type=product" class="baul-search-view-all">Ver todos los resultados →</a>' +
        '</div>'
      );
    }

    return (
      '<div class="baul-search-panel">' +
      '<div class="baul-search-panel__head">' +
      '<p class="baul-search-panel__label">Resultados</p>' +
      '</div>' +
      '<div class="baul-search-list baul-search-list--grid">' +
      products
        .map((p) =>
          buildCardHtml({
            title: p.title,
            url: p.url,
            image: p.featured_image?.url || p.image,
            price: parseSuggestPrice(p.price),
            compare_at_price: parseSuggestPrice(p.compare_at_price_max),
          })
        )
        .join('') +
      '</div>' +
      '<a href="/search?q=' +
      encodeURIComponent(q) +
      '&type=product" class="baul-search-view-all">Ver todos los resultados →</a>' +
      '</div>'
    );
  }

  class SearchOverlay {
    constructor() {
      this.root = document.getElementById('baul-search-overlay');
      this.input = document.getElementById('baul-search-overlay-input');
      this.content = document.getElementById('baul-search-overlay-content');
      this.closeBtn = document.getElementById('baul-search-overlay-close');
      if (!this.root || !this.input || !this.content) return;

      if (this.root.parentElement !== document.body) {
        document.body.appendChild(this.root);
      }

      this.abortController = null;
      this.debounceTimer = null;
      this.isOpen = false;

      this.closeBtn?.addEventListener('click', () => this.close());
      this.input.addEventListener('input', () => this.onInput());
      this.input.addEventListener('keydown', (e) => this.onKeydown(e));
      this.content.addEventListener('click', (e) => {
        const clearBtn = e.target.closest('[data-clear-recent]');
        if (!clearBtn) return;
        e.preventDefault();
        clearRecentlyViewed();
        this.showDefault();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });
    }

    open(initialQuery) {
      if (!this.root) return;
      this.isOpen = true;
      this.root.hidden = false;
      this.root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('baul-search-open');
      this.input.value = initialQuery || '';
      this.showDefault();
      window.requestAnimationFrame(() => this.input.focus());
    }

    close() {
      if (!this.root) return;
      this.isOpen = false;
      this.root.hidden = true;
      this.root.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('baul-search-open');
      this.input.value = '';
      this.content.innerHTML = '';
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
    }

    onInput() {
      clearTimeout(this.debounceTimer);
      const q = this.input.value.trim();
      if (q.length < MIN_CHARS) {
        this.showDefault();
        return;
      }
      this.debounceTimer = setTimeout(() => this.fetchSuggestions(q), DEBOUNCE_MS);
    }

    onKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    }

    showDefault() {
      this.content.innerHTML = buildDefaultHtml();
    }

    async fetchSuggestions(q) {
      if (this.abortController) this.abortController.abort();
      this.abortController = new AbortController();
      this.content.innerHTML =
        '<div class="baul-search-panel"><p class="baul-search-panel__loading">Buscando…</p></div>';

      try {
        const params = new URLSearchParams({
          q: q,
          'resources[type]': 'product',
          'resources[limit]': String(SUGGEST_LIMIT),
          'resources[options][unavailable_products]': 'last',
        });
        const res = await fetch('/search/suggest.json?' + params, {
          signal: this.abortController.signal,
        });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const products = data?.resources?.results?.products || [];
        this.content.innerHTML = buildResultsHtml(products, q);
      } catch (err) {
        if (err.name !== 'AbortError') {
          this.content.innerHTML =
            '<div class="baul-search-panel"><p class="baul-search-panel__empty">No se pudo cargar la búsqueda. Intenta de nuevo.</p></div>';
        }
      }
    }
  }

  class InlineSearch {
    constructor(wrapper) {
      this.wrapper = wrapper;
      this.input = wrapper.querySelector('input[name="q"]');
      this.dropdown = wrapper.querySelector('.baul-search-dropdown');
      if (!this.input || !this.dropdown) return;

      this.abortController = null;
      this.debounceTimer = null;

      this.input.setAttribute('aria-autocomplete', 'list');
      this.input.setAttribute('aria-controls', this.dropdown.id || 'baul-search-dropdown');
      this.input.setAttribute('aria-expanded', 'false');

      this.input.addEventListener('input', () => this.onInput());
      this.input.addEventListener('focus', () => this.onFocus());
      this.input.addEventListener('keydown', (e) => this.onKeydown(e));
      this.dropdown.addEventListener('click', (e) => {
        const clearBtn = e.target.closest('[data-clear-recent]');
        if (!clearBtn) return;
        e.preventDefault();
        clearRecentlyViewed();
        this.showDefault();
      });

      document.addEventListener('click', (e) => {
        if (!this.wrapper.contains(e.target)) this.close();
      });
    }

    onFocus() {
      const q = this.input.value.trim();
      if (q.length < MIN_CHARS) this.showDefault();
      else this.fetchSuggestions(q);
    }

    onInput() {
      clearTimeout(this.debounceTimer);
      const q = this.input.value.trim();
      if (q.length < MIN_CHARS) {
        this.showDefault();
        return;
      }
      this.debounceTimer = setTimeout(() => this.fetchSuggestions(q), DEBOUNCE_MS);
    }

    onKeydown(e) {
      if (e.key === 'Escape') {
        this.close();
        this.input.blur();
      }
    }

    showDefault() {
      this.open(buildDefaultHtml());
    }

    async fetchSuggestions(q) {
      if (this.abortController) this.abortController.abort();
      this.abortController = new AbortController();
      this.open(
        '<div class="baul-search-panel"><p class="baul-search-panel__loading">Buscando…</p></div>'
      );

      try {
        const params = new URLSearchParams({
          q: q,
          'resources[type]': 'product',
          'resources[limit]': String(SUGGEST_LIMIT),
          'resources[options][unavailable_products]': 'last',
        });
        const res = await fetch('/search/suggest.json?' + params, {
          signal: this.abortController.signal,
        });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const products = data?.resources?.results?.products || [];
        this.open(buildResultsHtml(products, q));
      } catch (err) {
        if (err.name !== 'AbortError') this.close();
      }
    }

    open(html) {
      this.dropdown.innerHTML = html;
      this.dropdown.hidden = false;
      this.input.setAttribute('aria-expanded', 'true');
    }

    close() {
      this.dropdown.hidden = true;
      this.input.setAttribute('aria-expanded', 'false');
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
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
        compare_at_price: data.compare_at_price,
      });
    } catch {
      /* ignore */
    }
  }

  function initHeaderTriggers() {
    document.querySelectorAll('[data-search-trigger="header"]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        if (overlayInstance) overlayInstance.open();
      });
    });
  }

  function init() {
    loadPopularData();
    initRecentlyViewedTracking();
    overlayInstance = new SearchOverlay();
    initHeaderTriggers();
    document.querySelectorAll('.baul-predictive-search--inline').forEach((wrapper) => {
      new InlineSearch(wrapper);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
