(function () {
  const STORAGE_KEY = 'baulRecentlyViewed';
  const MAX_RECENT = 8;
  const DEBOUNCE_MS = 180;
  const MIN_CHARS = 1;
  const SUGGEST_LIMIT = 8;
  const MOBILE_MQ = window.matchMedia('(max-width: 768px)');

  function isMobileLayout() {
    return MOBILE_MQ.matches;
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

  function formatMoney(cents, moneyFormat) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, moneyFormat || '${{amount_no_decimals}}');
    }
    return '$' + Math.round(cents / 100).toLocaleString('es-CL');
  }

  function parseSuggestPrice(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    return Number.isNaN(num) ? 0 : Math.round(num);
  }

  function toPriceCents(product) {
    if (typeof product.price === 'number') return product.price;
    return parseSuggestPrice(product.price);
  }

  function toCompareCents(product) {
    if (typeof product.compare_at_price === 'number') return product.compare_at_price;
    return parseSuggestPrice(product.compare_at_price);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildPricesHtml(product, moneyFormat) {
    const priceCents = toPriceCents(product);
    const compareCents = toCompareCents(product);

    if (compareCents > priceCents && priceCents > 0) {
      return (
        '<div class="baul-search-item__prices">' +
        '<span class="baul-search-item__compare">' +
        escapeHtml(formatMoney(compareCents, moneyFormat)) +
        '</span>' +
        '<span class="baul-search-item__price">' +
        escapeHtml(formatMoney(priceCents, moneyFormat)) +
        '</span></div>'
      );
    }

    if (!priceCents) return '';
    return (
      '<div class="baul-search-item__prices">' +
      '<span class="baul-search-item__price">' +
      escapeHtml(formatMoney(priceCents, moneyFormat)) +
      '</span></div>'
    );
  }

  function buildItemHtml(product, moneyFormat, layout) {
    const img = product.image || product.featured_image?.url || '';
    const title = escapeHtml(product.title || '');
    const url = product.url || '/products/' + (product.handle || '');
    const pricesHtml = buildPricesHtml(product, moneyFormat || product.moneyFormat);
    const imgHtml = img
      ? '<img class="baul-search-item__img" src="' +
        escapeHtml(img) +
        '" alt="" width="240" height="240" loading="lazy">'
      : '<div class="baul-search-item__img baul-search-item__img--empty"></div>';

    if (layout === 'grid') {
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

    return (
      '<a href="' +
      escapeHtml(url) +
      '" class="baul-search-item">' +
      imgHtml +
      '<div class="baul-search-item__body">' +
      '<span class="baul-search-item__title">' +
      title +
      '</span>' +
      pricesHtml +
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

  function buildPanelHtml(recent, popularData, moneyFormat, layout) {
    const popular = popularData.products || [];
    const recentIds = new Set(recent.map((p) => p.id));
    const popularFiltered = popular.filter((p) => !recentIds.has(p.id)).slice(0, MAX_RECENT);

    if (!recent.length && !popularFiltered.length) return '';

    const listClass =
      layout === 'grid' ? 'baul-search-list baul-search-list--grid' : 'baul-search-list';
    let html = '<div class="baul-search-panel">';

    if (recent.length) {
      html +=
        '<div class="baul-search-panel__head">' +
        '<p class="baul-search-panel__label">Visto recientemente</p>' +
        '<button type="button" class="baul-search-panel__clear" data-clear-recent>Borrar</button>' +
        '</div>' +
        '<div class="' +
        listClass +
        '">' +
        recent.map((p) => buildItemHtml(p, moneyFormat, layout)).join('') +
        '</div>';
    }

    if (popularFiltered.length) {
      html +=
        '<div class="baul-search-panel__head' +
        (recent.length ? ' baul-search-panel__head--spaced' : '') +
        '">' +
        '<p class="baul-search-panel__label">Más vendidos</p>' +
        '</div>' +
        '<div class="' +
        listClass +
        '">' +
        popularFiltered.map((p) => buildItemHtml(p, moneyFormat, layout)).join('') +
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
        compare_at_price: data.compare_at_price,
        moneyFormat: data.moneyFormat,
      });
    } catch {
      /* ignore */
    }
  }

  class PredictiveSearch {
    constructor(wrapper) {
      this.wrapper = wrapper;
      this.form = wrapper.querySelector('form') || wrapper;
      this.input = wrapper.querySelector('input[name="q"]');
      this.dropdown = wrapper.querySelector('.baul-search-dropdown');
      this.mobileTrigger = wrapper.querySelector('.n-search-open');
      this.searchMode = wrapper.dataset.searchMode || 'inline';
      this.useOverlay = this.searchMode === 'header' && !!document.getElementById('baul-search-overlay');

      if (!this.input && !this.useOverlay) return;
      if (!this.dropdown && !this.useOverlay) return;

      this.abortController = null;
      this.debounceTimer = null;
      this.moneyFormat = wrapper.dataset.moneyFormat || '${{amount_no_decimals}}';
      this.overlay = this.useOverlay ? document.getElementById('baul-search-overlay') : null;
      this.overlayInput = this.useOverlay
        ? document.getElementById('baul-search-overlay-input')
        : null;
      this.overlayContent = this.useOverlay
        ? document.getElementById('baul-search-overlay-content')
        : null;
      this.overlayClose = this.useOverlay
        ? document.getElementById('baul-search-overlay-close')
        : null;
      this.overlayForm = this.useOverlay
        ? document.getElementById('baul-search-overlay-form')
        : null;

      if (this.input) {
        this.input.setAttribute('aria-autocomplete', 'list');
        if (this.dropdown) {
          this.input.setAttribute('aria-controls', this.dropdown.id || 'baul-search-dropdown');
        }
        this.input.setAttribute('aria-expanded', 'false');
      }

      this.bindEvents();
    }

    getLayout() {
      if (this.useOverlay && this.isOverlayOpen()) return 'grid';
      if (this.searchMode === 'homepage' && isMobileLayout()) return 'grid';
      return 'list';
    }

    getSurface() {
      if (this.useOverlay && this.isOverlayOpen()) return this.overlayContent;
      return this.dropdown;
    }

    getActiveInput() {
      if (this.useOverlay && this.isOverlayOpen()) return this.overlayInput;
      return this.input;
    }

    isOverlayOpen() {
      return this.overlay && !this.overlay.hidden;
    }

    bindEvents() {
      if (this.input) {
        this.input.addEventListener('input', () => this.onInput());
        this.input.addEventListener('focus', () => this.onFocus());
        this.input.addEventListener('keydown', (e) => this.onKeydown(e));
      }

      if (this.mobileTrigger) {
        this.mobileTrigger.addEventListener('click', () => this.openOverlay());
      }

      if (this.overlayInput) {
        this.overlayInput.addEventListener('input', () => this.onInput());
        this.overlayInput.addEventListener('keydown', (e) => this.onKeydown(e));
      }

      if (this.overlayClose) {
        this.overlayClose.addEventListener('click', () => this.closeOverlay());
      }

      if (this.overlay) {
        this.overlay.addEventListener('click', (e) => {
          if (e.target === this.overlay) this.closeOverlay();
        });
      }

      document.addEventListener('click', (e) => {
        if (this.isOverlayOpen()) return;
        if (!this.wrapper.contains(e.target)) this.close();
      });

      MOBILE_MQ.addEventListener('change', () => {
        if (!isMobileLayout() && this.isOverlayOpen()) this.closeOverlay();
      });
    }

    bindSurfaceEvents() {
      const surface = this.getSurface();
      if (!surface || surface.dataset.boundClear === 'true') return;
      surface.dataset.boundClear = 'true';
      surface.addEventListener('click', (e) => {
        const clearBtn = e.target.closest('[data-clear-recent]');
        if (!clearBtn) return;
        e.preventDefault();
        clearRecentlyViewed();
        this.showRecent();
      });
    }

    openOverlay() {
      if (!this.overlay) return;
      if (this.overlay.parentElement !== document.body) {
        document.body.appendChild(this.overlay);
      }
      this.overlay.hidden = false;
      this.overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('baul-search-open');
      if (this.input && this.overlayInput) {
        this.overlayInput.value = this.input.value;
      }
      this.showRecent();
      window.requestAnimationFrame(() => {
        if (this.overlayInput) this.overlayInput.focus();
      });
    }

    closeOverlay() {
      if (!this.overlay) return;
      this.overlay.hidden = true;
      this.overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('baul-search-open');
      if (this.input && this.overlayInput) {
        this.input.value = this.overlayInput.value;
      }
      this.close();
    }

    onFocus() {
      if (this.useOverlay && isMobileLayout()) {
        this.openOverlay();
        return;
      }
      const q = this.getActiveInput()?.value.trim() || '';
      if (q.length < MIN_CHARS) this.showRecent();
      else this.fetchSuggestions(q);
    }

    onInput() {
      clearTimeout(this.debounceTimer);
      const q = this.getActiveInput()?.value.trim() || '';
      if (q.length < MIN_CHARS) {
        this.showRecent();
        return;
      }
      this.debounceTimer = setTimeout(() => this.fetchSuggestions(q), DEBOUNCE_MS);
    }

    onKeydown(e) {
      if (e.key === 'Escape') {
        if (this.isOverlayOpen()) this.closeOverlay();
        else this.close();
        this.getActiveInput()?.blur();
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const surface = this.getSurface();
      if (!surface) return;
      const items = surface.querySelectorAll('.baul-search-item');
      if (!items.length) return;
      e.preventDefault();
      const current = surface.querySelector('.baul-search-item.is-focused');
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
      const surface = this.getSurface();
      if (!surface) return;

      surface.innerHTML =
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

    showRecent() {
      const html = buildPanelHtml(
        getRecentlyViewed(),
        getPopularData(),
        this.moneyFormat,
        this.getLayout()
      );
      if (!html) {
        if (this.isOverlayOpen()) this.closeOverlay();
        else this.close();
        return;
      }
      this.open(html);
    }

    renderResults(products, q) {
      const layout = this.getLayout();
      const listClass =
        layout === 'grid' ? 'baul-search-list baul-search-list--grid' : 'baul-search-list';

      if (!products.length) {
        const html =
          '<div class="baul-search-panel">' +
          '<p class="baul-search-panel__empty">No hay resultados para "' +
          escapeHtml(q) +
          '"</p>' +
          '<a href="/search?q=' +
          encodeURIComponent(q) +
          '&type=product" class="baul-search-view-all">Ver todos los resultados →</a>' +
          '</div>';
        this.open(html);
        return;
      }

      const items = products
        .map((p) =>
          buildItemHtml(
            {
              title: p.title,
              url: p.url,
              image: p.featured_image?.url || p.image,
              price: parseSuggestPrice(p.price),
              compare_at_price: parseSuggestPrice(p.compare_at_price_max),
            },
            this.moneyFormat,
            layout
          )
        )
        .join('');

      const html =
        '<div class="baul-search-panel">' +
        '<div class="baul-search-panel__head">' +
        '<p class="baul-search-panel__label">Resultados</p>' +
        '</div>' +
        '<div class="' +
        listClass +
        '">' +
        items +
        '</div>' +
        '<a href="/search?q=' +
        encodeURIComponent(q) +
        '&type=product" class="baul-search-view-all">Ver todos los resultados →</a>' +
        '</div>';
      this.open(html);
    }

    open(html) {
      const surface = this.getSurface();
      if (!surface) return;
      if (html) surface.innerHTML = html;
      this.bindSurfaceEvents();

      if (this.isOverlayOpen()) return;

      if (this.dropdown) {
        this.dropdown.hidden = false;
        if (this.input) this.input.setAttribute('aria-expanded', 'true');
      }
    }

    close() {
      if (this.isOverlayOpen()) {
        if (this.overlayContent) this.overlayContent.innerHTML = '';
        return;
      }
      if (this.dropdown) {
        this.dropdown.hidden = true;
        if (this.input) this.input.setAttribute('aria-expanded', 'false');
      }
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
