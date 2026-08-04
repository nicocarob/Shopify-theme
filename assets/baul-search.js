(function () {
  const STORAGE_KEY = 'baulRecentlyViewed';
  const MAX_RECENT = 8;
  const DEBOUNCE_MS = 180;
  const MIN_CHARS = 1;
  const SUGGEST_LIMIT = 8;
  const MOBILE_QUERY = '(max-width: 768px)';

  let mobileSheet = null;
  let activeInstance = null;

  function isMobile() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

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
      /* ignore quota errors */
    }
  }

  function trackRecentlyViewed(product) {
    if (!product || !product.id) return;
    const items = getRecentlyViewed().filter((p) => p.id !== product.id);
    items.unshift(product);
    saveRecentlyViewed(items);
  }

  function formatMoney(cents, moneyFormat) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, moneyFormat || '${{amount_no_decimals}}');
    }
    return '$' + Math.round(cents / 100).toLocaleString('es-CL');
  }

  function suggestPrice(product, moneyFormat) {
    if (product.price_formatted) return product.price_formatted;
    if (product.price == null || product.price === '') return '';
    if (typeof product.price === 'number') {
      return formatMoney(product.price, moneyFormat);
    }
    const num = parseFloat(product.price);
    if (Number.isNaN(num)) return String(product.price);
    return formatMoney(Math.round(num * 100), moneyFormat);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildItemHtml(product, moneyFormat) {
    const img = product.image || product.featured_image?.url || '';
    const title = escapeHtml(product.title || '');
    const url = product.url || '/products/' + (product.handle || '');
    const price = suggestPrice(product, moneyFormat || product.moneyFormat);
    const priceHtml = price
      ? '<span class="baul-search-item__price">' + escapeHtml(price) + '</span>'
      : '';
    const imgHtml = img
      ? '<img class="baul-search-item__img" src="' +
        escapeHtml(img) +
        '" alt="" width="48" height="48" loading="lazy">'
      : '<div class="baul-search-item__img baul-search-item__img--empty"></div>';
    return (
      '<a href="' +
      escapeHtml(url) +
      '" class="baul-search-item">' +
      imgHtml +
      '<div class="baul-search-item__body"><span class="baul-search-item__title">' +
      title +
      '</span>' +
      priceHtml +
      '</div></a>'
    );
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

  function buildPanelHtml(recent, popularData, moneyFormat) {
    const popular = popularData.products || [];
    const recentIds = new Set(recent.map((p) => p.id));
    const popularFiltered = popular.filter((p) => !recentIds.has(p.id)).slice(0, MAX_RECENT);

    if (!recent.length && !popularFiltered.length) return '';

    let html = '<div class="baul-search-panel">';

    if (recent.length) {
      html +=
        '<p class="baul-search-panel__label">Vistos recientemente</p>' +
        '<div class="baul-search-list">' +
        recent.map((p) => buildItemHtml(p, moneyFormat)).join('') +
        '</div>';
    }

    if (popularFiltered.length) {
      html +=
        '<p class="baul-search-panel__label' +
        (recent.length ? ' baul-search-panel__label--spaced' : '') +
        '">Más vendidos</p>' +
        '<div class="baul-search-list">' +
        popularFiltered.map((p) => buildItemHtml(p, moneyFormat)).join('') +
        '</div>' +
        '<a href="' +
        escapeHtml(popularData.url || '/collections/mas-vendidos') +
        '" class="baul-search-view-all">Ver todos los más vendidos →</a>';
    }

    html += '</div>';
    return html;
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
        moneyFormat: data.moneyFormat,
      });
    } catch {
      /* ignore */
    }
  }

  function ensureMobileSheet() {
    if (mobileSheet) return mobileSheet;

    const el = document.createElement('div');
    el.className = 'baul-search-mobile';
    el.hidden = true;
    el.innerHTML =
      '<div class="baul-search-mobile__bar">' +
      '<form class="baul-search-mobile__form" action="/search" method="get" role="search">' +
      '<input type="hidden" name="type" value="product">' +
      '<input class="baul-search-mobile__input" type="search" name="q" autocomplete="off" enterkeyhint="search" aria-label="Buscar equipo o camiseta">' +
      '</form>' +
      '<button type="button" class="baul-search-mobile__close" aria-label="Cerrar búsqueda">✕</button>' +
      '</div>' +
      '<div class="baul-search-mobile__panel" aria-live="polite"></div>';

    document.body.appendChild(el);

    const input = el.querySelector('.baul-search-mobile__input');
    const panel = el.querySelector('.baul-search-mobile__panel');
    const closeBtn = el.querySelector('.baul-search-mobile__close');
    const form = el.querySelector('.baul-search-mobile__form');

    closeBtn.addEventListener('click', () => {
      if (activeInstance) activeInstance.closeMobileSheet();
    });

    form.addEventListener('submit', () => {
      if (activeInstance) activeInstance.closeMobileSheet();
    });

    mobileSheet = { el, input, panel, form };
    return mobileSheet;
  }

  class PredictiveSearch {
    constructor(wrapper) {
      this.wrapper = wrapper;
      this.form = wrapper.querySelector('form') || wrapper;
      this.input = wrapper.querySelector('input[name="q"]');
      this.dropdown = wrapper.querySelector('.baul-search-dropdown');
      if (!this.input || !this.dropdown) return;

      this.abortController = null;
      this.debounceTimer = null;
      this.moneyFormat = wrapper.dataset.moneyFormat || '${{amount_no_decimals}}';
      this.isLight = wrapper.classList.contains('baul-predictive-search--light');
      this.mobileOpen = false;
      this.ignoreOutsideUntil = 0;

      this.input.setAttribute('aria-autocomplete', 'list');
      this.input.setAttribute('aria-controls', this.dropdown.id || 'baul-search-dropdown');
      this.input.setAttribute('aria-expanded', 'false');

      this.bindEvents();
      this.setupMobileTrigger();

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.mobileOpen) this.closeMobileSheet();
      });
    }

    getPanelEl() {
      if (this.mobileOpen && mobileSheet) return mobileSheet.panel;
      return this.dropdown;
    }

    getQueryInput() {
      if (this.mobileOpen && mobileSheet) return mobileSheet.input;
      return this.input;
    }

    setupMobileTrigger() {
      if (!isMobile()) return;

      const openSheet = (e) => {
        e.preventDefault();
        this.openMobileSheet();
      };

      this.input.setAttribute('readonly', 'readonly');
      this.input.setAttribute('inputmode', 'search');
      this.input.addEventListener('click', openSheet);
      this.input.addEventListener('focus', openSheet);
    }

    openMobileSheet() {
      const sheet = ensureMobileSheet();
      activeInstance = this;
      this.mobileOpen = true;

      sheet.form.action = this.form.action || '/search';
      sheet.input.value = this.input.value;
      sheet.input.placeholder = this.input.placeholder || 'Buscar equipo o camiseta...';
      sheet.el.classList.toggle('baul-search-mobile--light', this.isLight);
      sheet.el.hidden = false;
      document.body.classList.add('baul-search-mobile-open');

      sheet.input.oninput = () => this.onInput();
      sheet.input.onkeydown = (e) => this.onKeydown(e);

      this.ignoreOutsideUntil = Date.now() + 400;
      this.showDefaultPanel();

      requestAnimationFrame(() => {
        sheet.input.focus({ preventScroll: true });
      });
    }

    closeMobileSheet() {
      if (!this.mobileOpen) return;
      const sheet = ensureMobileSheet();
      this.input.value = sheet.input.value;
      this.mobileOpen = false;
      sheet.el.hidden = true;
      sheet.panel.innerHTML = '';
      sheet.input.oninput = null;
      sheet.input.onkeydown = null;
      document.body.classList.remove('baul-search-mobile-open');
      if (activeInstance === this) activeInstance = null;
      this.close();
    }

    bindEvents() {
      if (!isMobile()) {
        this.input.removeAttribute('readonly');
        this.input.addEventListener('input', () => this.onInput());
        this.input.addEventListener('focus', () => this.onFocus());
        this.input.addEventListener('keydown', (e) => this.onKeydown(e));
      }

      document.addEventListener('pointerdown', (e) => {
        if (Date.now() < this.ignoreOutsideUntil) return;
        if (this.mobileOpen) return;
        if (!this.wrapper.contains(e.target)) this.close();
      });
    }

    onFocus() {
      if (isMobile()) return;
      const q = this.getQueryInput().value.trim();
      if (q.length < MIN_CHARS) {
        this.showDefaultPanel();
      } else {
        this.fetchSuggestions(q);
      }
    }

    onInput() {
      clearTimeout(this.debounceTimer);
      const q = this.getQueryInput().value.trim();
      if (q.length < MIN_CHARS) {
        this.showDefaultPanel();
        return;
      }
      this.debounceTimer = setTimeout(() => this.fetchSuggestions(q), DEBOUNCE_MS);
    }

    onKeydown(e) {
      if (e.key === 'Escape') {
        if (this.mobileOpen) this.closeMobileSheet();
        else this.close();
        this.getQueryInput().blur();
        return;
      }
      const panel = this.getPanelEl();
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const items = panel.querySelectorAll('.baul-search-item');
      if (!items.length) return;
      e.preventDefault();
      const current = panel.querySelector('.baul-search-item.is-focused');
      let index = current ? Array.from(items).indexOf(current) : -1;
      if (e.key === 'ArrowDown') index = Math.min(index + 1, items.length - 1);
      else index = Math.max(index - 1, 0);
      items.forEach((item) => item.classList.remove('is-focused'));
      items[index].classList.add('is-focused');
      items[index].scrollIntoView({ block: 'nearest' });
    }

    async fetchSuggestions(q) {
      if (this.abortController) this.abortController.abort();
      this.abortController = new AbortController();

      const panel = this.getPanelEl();
      panel.innerHTML =
        '<div class="baul-search-panel"><p class="baul-search-panel__loading">Buscando…</p></div>';
      this.open();

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
        this.renderResults(products, q);
      } catch (err) {
        if (err.name !== 'AbortError') this.close();
      }
    }

    showDefaultPanel() {
      const html = buildPanelHtml(getRecentlyViewed(), getPopularData(), this.moneyFormat);
      if (!html) {
        this.close();
        return;
      }
      this.open(html);
    }

    renderResults(products, q) {
      const panel = this.getPanelEl();
      if (!products.length) {
        panel.innerHTML =
          '<div class="baul-search-panel">' +
          '<p class="baul-search-panel__empty">No hay resultados para "' +
          escapeHtml(q) +
          '"</p>' +
          '<a href="/search?q=' +
          encodeURIComponent(q) +
          '&type=product" class="baul-search-view-all">Ver todos los resultados →</a>' +
          '</div>';
        this.open();
        return;
      }

      const items = products
        .map((p) =>
          buildItemHtml(
            {
              title: p.title,
              url: p.url,
              image: p.featured_image?.url || p.image,
              price: p.price,
            },
            this.moneyFormat
          )
        )
        .join('');

      panel.innerHTML =
        '<div class="baul-search-panel">' +
        '<p class="baul-search-panel__label">Resultados</p>' +
        '<div class="baul-search-list">' +
        items +
        '</div>' +
        '<a href="/search?q=' +
        encodeURIComponent(q) +
        '&type=product" class="baul-search-view-all">Ver todos los resultados →</a>' +
        '</div>';
      this.open();
    }

    open(html) {
      const panel = this.getPanelEl();
      if (html) panel.innerHTML = html;
      if (!this.mobileOpen) {
        this.dropdown.hidden = false;
        this.wrapper.classList.add('is-active');
      }
      this.input.setAttribute('aria-expanded', 'true');
    }

    close() {
      if (this.mobileOpen) return;
      this.dropdown.hidden = true;
      this.wrapper.classList.remove('is-active');
      this.input.setAttribute('aria-expanded', 'false');
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
    }
  }

  function init() {
    initRecentlyViewedTracking();
    document.querySelectorAll('.baul-predictive-search').forEach((wrapper) => {
      new PredictiveSearch(wrapper);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
