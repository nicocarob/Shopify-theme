const TOTAL = 5 * 3600000;
const CARD_FLOORS = [45, 65, 85, 105, 125, 155, 190, 270].map((m) => m * 60000);

function getEnd(key, floor) {
  let v = parseInt(localStorage.getItem(key) || '0', 10);
  const now = Date.now();
  if (!v || v < now + floor) {
    v = now + floor + Math.floor(Math.random() * 5 * 60000);
    localStorage.setItem(key, v);
  }
  return v;
}

const cardEnds = CARD_FLOORS.map((f, i) => getEnd('bdc_c' + i, f));

function getSecondsUntil4AM() {
  const now = new Date();
  const next4am = new Date();
  next4am.setHours(4, 0, 0, 0);
  if (now >= next4am) next4am.setDate(next4am.getDate() + 1);
  return Math.floor((next4am - now) / 1000);
}

function fmt(ms) {
  const t = Math.max(0, ms);
  return [Math.floor(t / 3600000), Math.floor((t % 3600000) / 60000), Math.floor((t % 60000) / 1000)]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

function tick() {
  const now = Date.now();

  const mainTimer = document.getElementById('mainTimer');
  if (mainTimer) {
    mainTimer.textContent = fmt(getSecondsUntil4AM() * 1000);
  }

  document.querySelectorAll('.urg-timer').forEach((el) => {
    const i = parseInt(el.dataset.idx, 10);
    const diff = Math.max(0, cardEnds[i] - now);
    el.textContent = fmt(diff);
    const pct = Math.max(5, (diff / TOTAL) * 100);
    const wrap = el.closest('.pc-urgency');
    if (!wrap) return;
    const fill = wrap.querySelector('.urg-fill');
    const clk = wrap.querySelector('.urg-clk');
    if (fill) {
      fill.style.width = pct + '%';
      fill.style.background = pct > 60 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444';
    }
    if (clk) clk.style.left = pct + '%';
  });
}

tick();
setInterval(tick, 1000);

(function initHomeScrollBehavior() {
  if (!document.body.classList.contains('baul-home')) return;

  const nav = performance.getEntriesByType('navigation')[0];
  if (nav?.type !== 'reload') return;

  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  window.scrollTo(0, 0);
})();

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.08 }
);
document.querySelectorAll('.rev,.rev-l,.rev-r,.rev-s').forEach((el) => io.observe(el));

window.addEventListener('scroll', () => {
  const scrollBar = document.getElementById('scroll-bar');
  if (!scrollBar) return;
  const st = window.scrollY;
  const dh = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.style.width = dh > 0 ? (st / dh) * 100 + '%' : '0%';
});

setInterval(() => {
  document.querySelectorAll('.urg-timer').forEach((el) => {
    const parts = el.textContent.split(':');
    if (parts.length === 3) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (h === 0 && m < 60) el.classList.add('danger');
      else el.classList.remove('danger');
    }
  });
}, 5000);

const eyeObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        eyeObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.3 }
);
document.querySelectorAll('.eyebrow').forEach((el) => eyeObs.observe(el));

let cbarFullHeight = 0;

function syncCbarHeight() {
  const cbar = document.getElementById('cbar');
  if (!cbar) return;
  if (document.documentElement.classList.contains('baul-cbar-hidden')) return;

  const height = cbar.offsetHeight;
  if (height > 0) {
    cbarFullHeight = height;
    document.documentElement.style.setProperty('--baul-cbar-full-h', height + 'px');
    document.documentElement.style.setProperty('--baul-cbar-h', height + 'px');
  }
}
syncCbarHeight();
window.addEventListener('resize', syncCbarHeight);
if (typeof ResizeObserver !== 'undefined') {
  const cbarEl = document.getElementById('cbar');
  if (cbarEl) {
    new ResizeObserver(() => {
      if (!document.documentElement.classList.contains('baul-cbar-hidden')) {
        syncCbarHeight();
      }
    }).observe(cbarEl);
  }
}

(function initCbarScrollHide() {
  const threshold = 56;
  let ticking = false;
  let cbarIsHidden = document.documentElement.classList.contains('baul-cbar-hidden');

  function setCbarHidden(hidden) {
    const html = document.documentElement;
    const cbar = document.getElementById('cbar');
    if (!cbar || hidden === cbarIsHidden) return;
    cbarIsHidden = hidden;

    if (hidden) {
      if (cbar.offsetHeight > 0) cbarFullHeight = cbar.offsetHeight;
      cbar.style.maxHeight = cbarFullHeight + 'px';
      requestAnimationFrame(() => {
        html.classList.add('baul-cbar-hidden');
        cbar.style.maxHeight = '';
        html.style.setProperty('--baul-cbar-h', '0px');
      });
      return;
    }

    html.classList.remove('baul-cbar-hidden');
    cbar.style.maxHeight = '';
    const height = cbarFullHeight || cbar.scrollHeight;
    html.style.setProperty('--baul-cbar-h', height + 'px');
    requestAnimationFrame(syncCbarHeight);
  }

  function updateCbarVisibility() {
    setCbarHidden(window.scrollY > threshold);
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(updateCbarVisibility);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateCbarVisibility();
})();

const navToggle = document.getElementById('n-hamburger');
const navLinks = document.getElementById('n-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navToggle.textContent = isOpen ? '✕' : '☰';
  });
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
    });
  });
}

(function initBpGallery() {
  const gallery = document.querySelector('[data-bp-gallery]');
  const slider = gallery && gallery.querySelector('[data-bp-slider]');
  if (!gallery || !slider) return;

  const slides = Array.from(slider.querySelectorAll('.bp-slide'));
  const thumbs = Array.from(gallery.querySelectorAll('.bp-thumb'));
  const dots = Array.from(gallery.querySelectorAll('.bp-slider-dot'));
  if (!slides.length) return;

  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  function setActive(index, scrollIntoView) {
    if (index < 0 || index >= slides.length) return;
    activeIndex = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
    });
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('is-active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });

    if (scrollIntoView && slides[index]) {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) {
        slides[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }

  function getIndexFromScroll() {
    const sliderRect = slider.getBoundingClientRect();
    const center = sliderRect.left + sliderRect.width / 2;
    let closest = 0;
    let minDist = Infinity;

    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.left + rect.width / 2;
      const dist = Math.abs(slideCenter - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    return closest;
  }

  let scrollTimer;
  slider.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const index = getIndexFromScroll();
        if (index !== activeIndex) setActive(index, false);
      }, 80);
    },
    { passive: true }
  );

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const index = parseInt(thumb.dataset.slideIndex, 10);
      if (Number.isNaN(index)) return;
      setActive(index, true);
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.dotIndex, 10);
      if (Number.isNaN(index)) return;
      setActive(index, true);
    });
  });

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActive(Math.min(activeIndex + 1, slides.length - 1), true);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActive(Math.max(activeIndex - 1, 0), true);
    }
  });
})();

function getVariantIdFromForm(form) {
  const explicit = form.querySelector('#baul-variant-id');
  if (explicit && explicit.value) return String(explicit.value).trim();

  const idInput = form.querySelector('input[name="id"]:not([disabled])');
  if (idInput && idInput.value) return String(idInput.value).trim();

  return '';
}

function formHasEasifyOptions(form) {
  return !!(
    form.querySelector('.easify-product-options .tpo_has-option-set') ||
    form.querySelector('[name="tpo_total-additional-price"]') ||
    form.querySelector('[name="properties[_tpo_add_by]"]')
  );
}

function hasPersonalizationInput(form) {
  return Object.keys(collectLineItemProperties(form)).length > 0;
}

function syncEasifyFormFields(form) {
  const parchesField = form.querySelector('[name="properties[Parches]"]');
  if (!parchesField) return;

  const propsField = form.querySelector('[name="properties[_po:items:properties]"]');
  if (!propsField || !propsField.value) return;

  try {
    const props = JSON.parse(propsField.value);
    if (Object.prototype.hasOwnProperty.call(props, 'Parches')) {
      parchesField.value = props['Parches'] || '';
    }
  } catch (e) {
  }
}

function collectLineItemProperties(form) {
  const properties = {};

  form.querySelectorAll('[name^="properties["]').forEach((el) => {
    if (!el.name) return;

    const match = el.name.match(/^properties\[(.+)\]$/);
    if (!match) return;
    const key = match[1];

    const isTpoMarker = key.startsWith('_');
    if (el.disabled && !isTpoMarker) return;

    if (el.type === 'radio') {
      if (el.checked && el.value) properties[key] = el.value;
      return;
    }
    if (el.type === 'checkbox') {
      if (el.checked) properties[key] = el.value || 'Yes';
      return;
    }

    const val = el.value != null ? String(el.value).trim() : '';
    if (val) properties[key] = val;
  });

  return properties;
}

function buildCartAddFormData(form) {
  syncEasifyFormFields(form);

  const formData = new FormData(form);
  const variantId = getVariantIdFromForm(form);
  if (variantId) formData.set('id', variantId);

  const tpoAddBy = form.querySelector('[name="properties[_tpo_add_by]"]');
  if (tpoAddBy && tpoAddBy.value) {
    formData.set(tpoAddBy.name, tpoAddBy.value);
  }

  return formData;
}

function shouldUseFormDataForCart(form) {
  return formHasEasifyOptions(form) || hasPersonalizationInput(form);
}

let baulCartAddDepth = 0;
let baulCartAddReleaseTimer = null;
let baulLocationReload = null;

function beginBaulCartAdd() {
  baulCartAddDepth += 1;
  window.easifyAddToCartEvent = true;

  if (!baulLocationReload) {
    baulLocationReload = window.location.reload.bind(window.location);
    window.location.reload = function baulBlockedReload() {
      if (window.easifyAddToCartEvent) return undefined;
      return baulLocationReload();
    };
  }
}

function endBaulCartAdd() {
  baulCartAddDepth = Math.max(0, baulCartAddDepth - 1);
  if (baulCartAddDepth > 0) return;

  window.clearTimeout(baulCartAddReleaseTimer);
  baulCartAddReleaseTimer = window.setTimeout(() => {
    if (baulCartAddDepth === 0) {
      window.easifyAddToCartEvent = false;
    }
  }, 4000);
}

async function withBaulCartAdd(fn) {
  beginBaulCartAdd();
  try {
    return await fn();
  } finally {
    endBaulCartAdd();
  }
}

function isolateBaulCartButton(btn) {
  if (!btn || btn.dataset.baulIsolated === '1') return btn;

  const clone = btn.cloneNode(true);
  clone.dataset.baulIsolated = '1';
  // clone.classList.add('tpo_ignore');
  clone.classList.remove(
    'product-form__submit',
    'tpo_add-to-cart',
    'add-to-cart-button',
    'button'
  );
  clone.type = 'button';
  clone.removeAttribute('name');
  clone.removeAttribute('data-variant-id');
  btn.replaceWith(clone);
  return clone;
}

function isolateBaulProductButtons() {
  const form = document.getElementById('baul-product-form');
  if (!form) return;

  isolateBaulCartButton(form.querySelector('#bp-add-cart-btn'));
  isolateBaulCartButton(form.querySelector('#bp-buy-btn'));
}

function parseCartAddResponse(data) {
  if (!data || typeof data !== 'object') return [];

  if (Array.isArray(data.items) && data.items.length) return data.items;
  if (data.id || data.variant_id) return [data];

  return [];
}

async function addItemToCartFromForm(form) {
  return withBaulCartAdd(async () => {
    const formData = buildCartAddFormData(form);
    if (!formData.get('id')) throw new Error('Selecciona una variante válida');

    const response = await fetch('/cart/add.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.description || data.message || 'No se pudo agregar al carrito';
      throw new Error(message);
    }

    if (!parseCartAddResponse(data).length) {
      throw new Error('No se pudo agregar al carrito');
    }

    return data;
  });
}

async function addProductFormToCart(form) {
  if (shouldUseFormDataForCart(form)) {
    return addItemToCartFromForm(form);
  }

  const payload = buildCartAddPayload(form);
  if (!payload) throw new Error('Selecciona una variante válida');
  return addItemToCart(payload);
}

function buildCartAddPayload(form) {
  if (!(form instanceof HTMLFormElement)) return null;

  const variantId = getVariantIdFromForm(form);
  if (!variantId) return null;

  const item = {
    id: variantId,
    quantity: 1,
  };

  const qtyInput = form.querySelector('[name="quantity"]');
  if (qtyInput && qtyInput.value) {
    const qty = parseInt(qtyInput.value, 10);
    if (qty > 0) item.quantity = qty;
  }

  const properties = collectLineItemProperties(form);
  if (Object.keys(properties).length) {
    item.properties = properties;
  }

  return { items: [item] };
}

async function fetchCart() {
  const response = await fetch('/cart.js', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  return response.json();
}

async function addItemToCart(payload) {
  return withBaulCartAdd(async () => {
    const body = payload.items ? payload : { items: [payload] };

    const response = await fetch('/cart/add.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.description || data.message || 'No se pudo agregar al carrito';
      throw new Error(message);
    }

    const addedItems = parseCartAddResponse(data);
    if (!addedItems.length) {
      throw new Error('No se pudo agregar al carrito');
    }

    return data;
  });
}

function updateHeaderCartCount(count) {
  document.querySelectorAll('.btn-cart').forEach((btn) => {
    btn.textContent = '🛒 Carrito (' + count + ')';
  });
}

function rememberCartCount(count) {
  sessionStorage.setItem(
    'baul-cart-count',
    JSON.stringify({
      value: count,
      timestamp: Date.now(),
    })
  );
}

async function refreshHeaderCartCount() {
  const cart = await fetchCart();
  if (!cart) return null;
  updateHeaderCartCount(cart.item_count);
  rememberCartCount(cart.item_count);
  return cart;
}

function syncCartHeaderFromSession() {
  const stored = sessionStorage.getItem('baul-cart-count');
  if (!stored) return;

  try {
    const { value, timestamp } = JSON.parse(stored);
    if (Date.now() - timestamp > 300000) return;
    updateHeaderCartCount(Number(value) || 0);
  } catch (e) {
    /* ignore */
  }
}

function initBaulEasifyGuard() {
  if (initBaulEasifyGuard.done) return;
  initBaulEasifyGuard.done = true;

  const descriptor = Object.getOwnPropertyDescriptor(window.Location.prototype, 'href');
  const setHref = descriptor?.set;
  if (!setHref) return;

  Object.defineProperty(window.location, 'href', {
    configurable: true,
    enumerable: descriptor.enumerable,
    get() {
      return descriptor.get.call(window.location);
    },
    set(url) {
      if (window.easifyAddToCartEvent && typeof url === 'string') {
        try {
          const path = new URL(url, window.location.href).pathname.replace(/\/$/, '') || '/';
          if (path === '/cart') return;
        } catch (e) {
          if (/\/cart\/?(\?|$)/.test(url)) return;
        }
      }
      setHref.call(window.location, url);
    },
  });
}

function initBaulCartSync() {
  initBaulEasifyGuard();
  syncCartHeaderFromSession();
  refreshHeaderCartCount();

  window.addEventListener('pageshow', () => {
    syncCartHeaderFromSession();
    refreshHeaderCartCount();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshHeaderCartCount();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBaulCartSync);
} else {
  initBaulCartSync();
}

const productJsonEl = document.getElementById('baul-product-json');
const productForm = document.getElementById('baul-product-form');
if (productJsonEl && productForm) {
  const productData = JSON.parse(productJsonEl.textContent);
  const variantInput = document.getElementById('baul-variant-id');
  const buyBtn = document.getElementById('bp-buy-btn');
  const addCartBtn = document.getElementById('bp-add-cart-btn');
  const priceEl = document.getElementById('bp-price');
  const compareEl = document.getElementById('bp-compare-price');
  const discountEl = document.querySelector('.bp-discount-badge');
  const optionCount = productData.options.length;
  const selected = productData.variants[0]?.options?.slice() || [];

  function formatMoney(cents) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, productData.moneyFormat);
    }
    return '$' + Math.round(cents / 100).toLocaleString('es-CL');
  }

  function findVariant() {
    return productData.variants.find((v) =>
      v.options.every((opt, i) => opt === selected[i])
    );
  }

  function updateUI() {
    const variant = findVariant();
    if (!variant || !variantInput) return;
    variantInput.value = variant.id;
    if (priceEl) priceEl.textContent = formatMoney(variant.price);
    if (compareEl) {
      if (variant.compare_at_price > variant.price) {
        compareEl.textContent = formatMoney(variant.compare_at_price);
        compareEl.style.display = '';
        const pct = Math.round(
          ((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100
        );
        if (discountEl) {
          discountEl.textContent = '−' + pct + '%';
          discountEl.style.display = '';
        }
      } else {
        compareEl.style.display = 'none';
        if (discountEl) discountEl.style.display = 'none';
      }
    }
    if (buyBtn) {
      buyBtn.disabled = !variant.available;
      buyBtn.textContent = variant.available ? 'COMPRAR AHORA' : 'AGOTADO';
    }
    if (addCartBtn) {
      addCartBtn.disabled = !variant.available;
    }
  }

  productForm.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  isolateBaulProductButtons();
  window.addEventListener('load', isolateBaulProductButtons);
  window.setTimeout(isolateBaulProductButtons, 2000);

  async function submitProductForm(redirectToCheckout) {
    await addProductFormToCart(productForm);
    await refreshHeaderCartCount();

    if (redirectToCheckout) {
      window.location.href = '/checkout';
      return;
    }

    if (typeof window.baulCartToastNotify === 'function') {
      window.baulCartToastNotify();
    }
  }

  productForm.addEventListener(
    'click',
    async (event) => {
      const addBtn = event.target.closest('#bp-add-cart-btn');
      const buyBtnTarget = event.target.closest('#bp-buy-btn');
      if (!addBtn && !buyBtnTarget) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (addBtn) {
        if (addBtn.disabled) return;
        addBtn.disabled = true;

        try {
          await submitProductForm(false);
          addBtn.classList.add('is-added');
          window.setTimeout(() => addBtn.classList.remove('is-added'), 900);
        } catch (e) {
          /* keep cart intact */
        } finally {
          const variant = findVariant();
          addBtn.disabled = !(variant && variant.available);
        }
        return;
      }

      if (buyBtnTarget.disabled) return;
      buyBtnTarget.disabled = true;
      const originalText = buyBtnTarget.textContent;
      buyBtnTarget.textContent = 'PROCESANDO…';

      try {
        await submitProductForm(true);
      } catch (e) {
        buyBtnTarget.disabled = false;
        buyBtnTarget.textContent = originalText;
      }
    },
    true
  );

  document.querySelectorAll('.bp-variant-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-unavailable')) return;
      const idx = parseInt(btn.dataset.optionIndex, 10);
      selected[idx] = btn.dataset.value;
      document
        .querySelectorAll('.bp-variant-btn[data-option-index="' + idx + '"]')
        .forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      updateUI();
    });
  });

  const initialVariant = productData.variants.find((v) => v.id === parseInt(variantInput.value, 10));
  if (initialVariant) {
    initialVariant.options.forEach((val, i) => {
      selected[i] = val;
      document.querySelectorAll('.bp-variant-btn[data-option-index="' + i + '"]').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.value === val);
      });
    });
  }
  updateUI();
}

(function initTallasModal() {
  const modal = document.getElementById('modal-tallas');
  if (!modal) return;

  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

  const defaultTab = modal.dataset.defaultTab || 'fan';
  const tabs = modal.querySelectorAll('.tallas-tab');
  const panels = modal.querySelectorAll('.tallas-panel');
  const closeBtn = modal.querySelector('.tallas-close');

  function setTab(tabId) {
    tabs.forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.tab === tabId);
    });
    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === tabId);
    });
  }

  function openModal() {
    setTab(defaultTab);
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.style.overflow = '';
    document.getElementById('btn-tallas')?.focus();
  }

  setTab(defaultTab);

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setTab(tab.dataset.tab));
  });

  closeBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.getElementById('btn-tallas')?.addEventListener('click', openModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();

(function initBaulSizePopup() {
  const overlay = document.getElementById('baul-size-overlay');
  if (!overlay) return;

  const grid = document.getElementById('baul-size-grid');
  const nameEl = overlay.querySelector('.baul-size-product-name');
  const confirmBtn = document.getElementById('baul-size-confirm');
  const productLink = document.getElementById('baul-size-product-link');
  const closeBtn = overlay.querySelector('.baul-size-close');
  const confirmDefaultText = confirmBtn ? confirmBtn.textContent : 'Agregar al carrito';

  let selectedVariantId = null;

  function closePopup() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    selectedVariantId = null;
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = confirmDefaultText;
    }
    if (grid) grid.innerHTML = '';
  }

  function getVariantSizeLabel(variant) {
    const title = variant?.title?.trim();
    if (title && title !== 'Default Title') return title;
    return variant?.option1 || title || '';
  }

  function renderVariants(variants) {
    if (!grid) return;
    grid.innerHTML = '';

    variants.forEach((variant) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'size-btn' + (variant.available ? '' : ' out');
      btn.textContent = getVariantSizeLabel(variant);
      btn.disabled = !variant.available;

      if (variant.available) {
        btn.addEventListener('click', () => {
          grid.querySelectorAll('.size-btn').forEach((el) => el.classList.remove('selected'));
          btn.classList.add('selected');
          selectedVariantId = variant.id;
          if (confirmBtn) confirmBtn.disabled = false;
        });
      }

      grid.appendChild(btn);
    });
  }

  window.baulOpenSizePopup = function (productId, variants, productTitle, productUrl) {
    selectedVariantId = null;
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = confirmDefaultText;
    }
    if (nameEl) nameEl.textContent = productTitle || '';
    if (productLink) productLink.href = productUrl || '#';
    renderVariants(Array.isArray(variants) ? variants : []);
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.baulAddToCart = async function (variantId) {
    const data = await addItemToCart({
      items: [{ id: String(variantId), quantity: 1 }],
    });
    await refreshHeaderCartCount();
    if (typeof window.baulCartToastNotify === 'function') {
      window.baulCartToastNotify();
    }
    return data;
  };

  confirmBtn?.addEventListener('click', async () => {
    if (!selectedVariantId) return;

    confirmBtn.disabled = true;

    try {
      await window.baulAddToCart(selectedVariantId);
      confirmBtn.textContent = '✅ ¡Agregado!';
      setTimeout(closePopup, 1200);
    } catch (e) {
      confirmBtn.textContent = 'Error, intenta de nuevo';
      confirmBtn.disabled = false;
      setTimeout(() => {
        confirmBtn.textContent = confirmDefaultText;
      }, 2000);
    }
  });

  closeBtn?.addEventListener('click', closePopup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closePopup();
  });

  document.addEventListener('click', (event) => {
    const addBtn = event.target.closest('[data-baul-add]');
    if (!addBtn) return;

    event.preventDefault();
    event.stopPropagation();

    let variants = [];
    try {
      variants = JSON.parse(addBtn.dataset.variants || '[]');
    } catch (e) {
      variants = [];
    }

    window.baulOpenSizePopup(
      addBtn.dataset.productId,
      variants,
      addBtn.dataset.productTitle,
      addBtn.dataset.productUrl
    );
  });
})();

(function initCustomizeJersey() {
  const section = document.querySelector('.bp-customize');
  if (!section) return;

  const stage = section.querySelector('.bp-customize-stage');
  const imgA = section.querySelector('.bp-customize-img--a');
  const overlay = section.querySelector('.bp-customize-overlay');
  const nameEl = section.querySelector('.bp-customize-name');
  const numberEl = section.querySelector('.bp-customize-number');
  const nameInput = section.querySelector('#bp-customize-name-input');
  const numberInput = section.querySelector('#bp-customize-number-input');

  const STAGE_REF_WIDTH = 480;

  let loopTimer = null;
  let loopRunning = false;
  let fitRaf = 0;

  function getStageMetrics() {
    const width = imgA?.clientWidth || stage?.clientWidth || 0;
    const scale = width ? Math.min(Math.max(width / STAGE_REF_WIDTH, 0.42), 1.15) : 1;
    return { width, scale };
  }

  function fitText(el, imageWidth, maxWidthRatio, startSize = 48) {
    if (!el || !imageWidth) return;
    const maxWidth = imageWidth * maxWidthRatio;
    el.style.maxWidth = `${maxWidth}px`;
    let size = startSize;
    el.style.fontSize = `${size}px`;
    while (el.scrollWidth > maxWidth && size > 10) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
  }

  function fitOverlayText() {
    const { width, scale } = getStageMetrics();
    if (!width) return;

    const nameStart = Math.max(12, Math.round(42 * scale));
    const numberStart = Math.max(18, Math.round(130 * scale));

    if (nameEl.textContent) {
      fitText(nameEl, width, 0.55, nameStart);
    } else {
      nameEl.style.fontSize = '';
      nameEl.style.maxWidth = '';
    }

    if (numberEl.textContent) {
      fitText(numberEl, width, 0.28, numberStart);
    } else {
      numberEl.style.fontSize = '';
      numberEl.style.maxWidth = '';
    }
  }

  function scheduleFitOverlay() {
    cancelAnimationFrame(fitRaf);
    fitRaf = requestAnimationFrame(() => {
      if (hasUserInput()) fitOverlayText();
    });
  }

  function hasUserInput() {
    return Boolean(nameInput?.value.trim() || numberInput?.value.trim());
  }

  function clearLoopTimer() {
    if (loopTimer) {
      clearTimeout(loopTimer);
      loopTimer = null;
    }
  }

  function showA() {
    stage.classList.remove('is-show-b');
  }

  function showB() {
    stage.classList.add('is-show-b');
  }

  function triggerPop(el) {
    if (!el || !el.textContent) return;
    el.classList.remove('bp-customize-pop');
    void el.offsetWidth;
    el.classList.add('bp-customize-pop');
  }

  function updateOverlay() {
    const name = nameInput?.value.trim().toUpperCase() || '';
    const num = numberInput?.value.trim() || '';

    if (!hasUserInput()) {
      overlay.classList.remove('is-visible');
      overlay.setAttribute('aria-hidden', 'true');
      nameEl.textContent = '';
      numberEl.textContent = '';
      return;
    }

    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    nameEl.textContent = name;
    numberEl.textContent = num;

    fitOverlayText();

    triggerPop(nameEl);
    triggerPop(numberEl);
  }

  function stopLoop() {
    loopRunning = false;
    clearLoopTimer();
  }

  function scheduleLoopStep(showImageB, delay) {
    loopTimer = setTimeout(() => {
      if (!loopRunning || hasUserInput()) return;

      if (showImageB) {
        showB();
        scheduleLoopStep(false, 3000);
      } else {
        showA();
        scheduleLoopStep(true, 2000);
      }
    }, delay);
  }

  function startLoop() {
    if (hasUserInput()) return;

    stopLoop();
    loopRunning = true;
    stage.classList.remove('is-user-mode');
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    showA();
    scheduleLoopStep(true, 2000);
  }

  function onInput() {
    if (nameInput) {
      nameInput.value = nameInput.value.slice(0, 12).toUpperCase();
    }

    if (numberInput) {
      const digits = numberInput.value.replace(/\D/g, '').slice(0, 2);
      if (!digits) {
        numberInput.value = '';
      } else {
        let num = parseInt(digits, 10);
        if (num > 99) num = 99;
        if (num < 1) num = 1;
        numberInput.value = String(num);
      }
    }

    if (hasUserInput()) {
      stopLoop();
      stage.classList.add('is-user-mode');
      showA();
      updateOverlay();
      return;
    }

    stage.classList.remove('is-user-mode');
    updateOverlay();
    startLoop();
  }

  nameInput?.addEventListener('input', onInput);
  numberInput?.addEventListener('input', onInput);
  [nameInput, numberInput].forEach((input) => {
    input?.addEventListener('focus', () => {
      window.setTimeout(scheduleFitOverlay, 280);
    });
  });
  window.addEventListener('resize', scheduleFitOverlay);
  window.visualViewport?.addEventListener('resize', scheduleFitOverlay);
  window.visualViewport?.addEventListener('scroll', scheduleFitOverlay);

  if (stage && typeof ResizeObserver !== 'undefined') {
    const stageObserver = new ResizeObserver(scheduleFitOverlay);
    stageObserver.observe(stage);
  }

  imgA?.addEventListener('load', scheduleFitOverlay);

  startLoop();
})();

(function initEstampadosCarousel() {
  const ESTAMPADOS = [
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/1.png?v=1781579431', pais: 'Alemania' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/2.png?v=1781579431', pais: 'Países Bajos' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/11.png?v=1781579431', pais: 'Uruguay' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/13.png?v=1781579431', pais: 'Inglaterra' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/10.png?v=1781579431', pais: 'España' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/3.png?v=1781579431', pais: 'Chile' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/6.png?v=1781579431', pais: 'Argentina' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/9.png?v=1781579433', pais: 'Brasil' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/8_9e00729d-c530-4b1b-b0db-bea8f384cfe6.png?v=1781579431', pais: 'Portugal' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/4.png?v=1781579431', pais: 'Colombia' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/7_56320c6f-3284-4051-afee-35fe276cf1a6.png?v=1781579431', pais: 'Portugal' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/12.png?v=1781579431', pais: 'Noruega' },
    { img: 'https://cdn.shopify.com/s/files/1/0801/5098/6775/files/5.png?v=1781579432', pais: 'Francia' },
  ];

  const track = document.querySelector('.bp-stamps-track');
  if (!track) return;

  function createCard(item) {
    const link = document.createElement('a');
    link.className = 'bp-stamp-card';
    link.href = `/search?q=${encodeURIComponent(item.pais)}&type=product`;

    const badge = document.createElement('span');
    badge.className = 'bp-stamp-badge';
    badge.textContent = 'NUEVO';

    const img = document.createElement('img');
    img.className = 'bp-stamp-img';
    img.src = item.img;
    img.alt = item.pais;
    img.width = 200;
    img.height = 200;
    img.loading = 'lazy';

    const name = document.createElement('span');
    name.className = 'bp-stamp-name';
    name.textContent = item.pais;

    link.append(badge, img, name);
    return link;
  }

  function renderTrack() {
    track.innerHTML = '';
    [...ESTAMPADOS, ...ESTAMPADOS].forEach((item) => {
      track.appendChild(createCard(item));
    });
  }

  renderTrack();
})();

(function initBaulCartToast() {
  const toast = document.getElementById('baul-cart-toast');
  if (!toast) return;

  const fillEl = toast.querySelector('[data-bct-fill]');
  const messageEl = toast.querySelector('[data-bct-message]');
  const closeBtn = toast.querySelector('.bct-close');
  const continueBtn = toast.querySelector('[data-bct-continue]');
  const milestoneEls = toast.querySelectorAll('.bdp-milestone[data-milestone]');

  let showDelayTimer = null;
  let hideTimer = null;

  function isCartPage() {
    return /\/cart\/?$/.test(window.location.pathname);
  }

  function getDiscountState(count) {
    const c = Math.max(0, Number(count) || 0);
    const reached = [c >= 2, c >= 3, c >= 7];

    if (c >= 8) {
      return {
        message: '✅ ¡Tienes todos los descuentos activos!',
        progress: 100,
        reached,
      };
    }
    if (c === 7) {
      return {
        message: 'Agrega 1 más y la 8va es completamente gratis 🎁',
        progress: 85,
        reached,
      };
    }
    if (c === 6) {
      return {
        message: 'Agrega 1 más — a 7 camisetas desbloqueas la 8va gratis 🎁',
        progress: 81,
        reached,
      };
    }
    if (c === 5) {
      return {
        message: 'Lleva 7 camisetas y la 8va es gratis — te faltan 2 🎁',
        progress: 77,
        reached,
      };
    }
    if (c === 4) {
      return {
        message: 'Lleva 7 camisetas y la 8va es gratis — te faltan 3 🎁',
        progress: 72,
        reached,
      };
    }
    if (c === 3) {
      return {
        message: 'Agrega 1 más y la 4ta te sale a mitad de precio 🔥',
        progress: 68,
        reached,
      };
    }
    if (c === 2) {
      return {
        message: 'Agrega 1 más y la 3ra te sale con 10% off 🎽',
        progress: 40,
        reached,
      };
    }
    if (c === 1) {
      return {
        message: 'Agrega 1 camiseta más y la 3ra te sale con 10% off 🎽',
        progress: 15,
        reached,
      };
    }
    return {
      message: 'Agrega 1 camiseta más y la 3ra te sale con 10% off 🎽',
      progress: 0,
      reached,
    };
  }

  function updateToast(count) {
    const state = getDiscountState(count);
    if (fillEl) fillEl.style.width = `${state.progress}%`;
    if (messageEl) messageEl.textContent = state.message;

    milestoneEls.forEach((el, index) => {
      el.classList.toggle('is-reached', Boolean(state.reached[index]));
    });
  }

  function hideToast() {
    toast.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!toast.classList.contains('is-visible')) {
        toast.hidden = true;
      }
    }, 350);
  }

  function showToast() {
    toast.hidden = false;
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });
  }

  function scheduleToastUpdate() {
    if (isCartPage()) return;

    window.clearTimeout(showDelayTimer);
    window.clearTimeout(hideTimer);

    showDelayTimer = window.setTimeout(async () => {
      try {
        const cart = await fetchCart();
        if (!cart || cart.item_count <= 0) return;

        updateToast(cart.item_count);
        showToast();

        hideTimer = window.setTimeout(hideToast, 7000);
      } catch (e) {
        /* ignore */
      }
    }, 800);
  }

  window.baulCartToastNotify = scheduleToastUpdate;

  closeBtn?.addEventListener('click', () => {
    window.clearTimeout(hideTimer);
    hideToast();
  });

  continueBtn?.addEventListener('click', () => {
    window.clearTimeout(hideTimer);
    hideToast();
  });

  async function addToCartFromForm(form) {
    return addProductFormToCart(form);
  }

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const action = form.getAttribute('action') || '';
    if (!action.includes('/cart/add')) return;

    event.preventDefault();

    if (form.id === 'baul-product-form') return;

    if (!getVariantIdFromForm(form)) return;

    try {
      await addToCartFromForm(form);
      await refreshHeaderCartCount();
      scheduleToastUpdate();
    } catch (e) {
      /* avoid native submit that can corrupt cart state */
    }
  });

  document.addEventListener(
    'click',
    (event) => {
      const btn = event.target.closest('.btn-add');
      if (!btn) return;

      const form = btn.closest('form[action*="/cart/add"]');
      if (!form || btn.type === 'button') return;

      event.preventDefault();
      form.requestSubmit(btn);
    },
    true
  );
})();

const videoEl = document.querySelector('.quality-video');
if (videoEl) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoEl.play();
          observer.unobserve(videoEl);
        }
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(videoEl);
}

function getProductSocialProof(handle) {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = (hash << 5) - hash + handle.charCodeAt(i);
    hash |= 0;
  }
  const r = Math.abs(hash % 1000) / 1000;
  const rating = (4.8 + r * 0.2).toFixed(1);
  const sold = Math.floor(200 + r * 300);
  return { rating, sold };
}

function initProductSocialProof() {
  document.querySelectorAll('.product-stars').forEach((el) => {
    if (el.dataset.proofInit) return;
    const handle = el.dataset.handle;
    if (!handle) return;

    const { rating, sold } = getProductSocialProof(handle);
    el.innerHTML =
      '<span class="ps-stars" aria-hidden="true">★★★★★</span>' +
      '<span class="ps-rating">' +
      rating +
      '</span>' +
      '<span class="ps-sold">· ' +
      sold +
      ' vendidos</span>';
    el.dataset.proofInit = '1';
  });
}

window.baulInitProductSocialProof = initProductSocialProof;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductSocialProof);
} else {
  initProductSocialProof();
}

(function initTeamCollection() {
  function revealCards(root) {
    root.querySelectorAll('.rev, .rev-l, .rev-r, .rev-s').forEach((el) => {
      el.classList.add('in');
    });
  }

  function findProductGrid(doc) {
    return (
      doc.querySelector('[data-baul-team-grid]') ||
      doc.querySelector('.baul-team-grid-section .prod-grid') ||
      doc.querySelector('.baul-team-search-grid-section .prod-grid') ||
      doc.querySelector('.bc-grid.prod-grid') ||
      doc.querySelector('.prod-grid')
    );
  }

  function extractCards(html, excludeId, seenIds) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const grid = findProductGrid(doc);
    if (!grid) return [];

    const cards = [];
    grid.querySelectorAll('.pc').forEach((pc) => {
      const btn = pc.querySelector('[data-product-id]');
      const productId = btn?.dataset.productId;
      if (!productId || seenIds.has(productId) || String(productId) === String(excludeId)) return;
      seenIds.add(productId);
      cards.push(pc.cloneNode(true));
    });
    return cards;
  }

  function fetchHtml(url) {
    return fetch(url).then((response) => {
      if (!response.ok) throw new Error('fetch failed');
      return response.text();
    });
  }

  function loadTeamCollection(section) {
    const target = section.querySelector('[data-baul-team-grid-target]');
    const teamTags = (section.dataset.teamTags || '')
      .split('|')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const searchUrl = section.dataset.searchUrl;
    const excludeId = section.dataset.excludeId;

    if (!target || teamTags.length === 0) return;

    const fetchUrls = [];
    const seenUrls = new Set();

    teamTags.forEach((tag) => {
      const encoded = encodeURIComponent(tag);
      [
        `/collections/all/${encoded}?section_id=baul-team-grid`,
        `/collections/all/${encoded}`,
      ].forEach((url) => {
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          fetchUrls.push(url);
        }
      });
    });

    if (searchUrl && !seenUrls.has(searchUrl)) {
      fetchUrls.push(searchUrl);
    }

    const seenIds = new Set();
    const collectedCards = [];

    Promise.allSettled(fetchUrls.map((url) => fetchHtml(url)))
      .then((results) => {
        results.forEach((result) => {
          if (result.status !== 'fulfilled') return;
          collectedCards.push(...extractCards(result.value, excludeId, seenIds));
        });

        if (collectedCards.length === 0) {
          target.innerHTML = '<p class="bp-team-loading">No hay más productos de este equipo.</p>';
          return;
        }

        target.innerHTML = '';
        collectedCards.forEach((card) => target.appendChild(card));
        revealCards(target);
        window.baulInitProductSocialProof?.();
      })
      .catch(() => {
        target.innerHTML = '<p class="bp-team-loading">No hay más productos de este equipo.</p>';
      });
  }

  function boot() {
    document.querySelectorAll('[data-baul-team-collection]').forEach(loadTeamCollection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
