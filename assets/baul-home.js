const TOTAL = 5 * 3600000;
const MAIN_DURATION_MS = 5 * 3600 * 1000;
const MAIN_TIMER_KEY = 'bdc_main5';
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

function getMainEnd() {
  const now = Date.now();
  let end = parseInt(localStorage.getItem(MAIN_TIMER_KEY) || '0', 10);
  if (!end || end <= now) {
    end = now + MAIN_DURATION_MS;
    localStorage.setItem(MAIN_TIMER_KEY, end);
  }
  return end;
}

let mainEnd = getMainEnd();
const cardEnds = CARD_FLOORS.map((f, i) => getEnd('bdc_c' + i, f));

function fmt(ms) {
  const t = Math.max(0, ms);
  return [Math.floor(t / 3600000), Math.floor((t % 3600000) / 60000), Math.floor((t % 60000) / 1000)]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

function tick() {
  const now = Date.now();
  let mainRemaining = mainEnd - now;
  if (mainRemaining <= 0) {
    mainEnd = now + MAIN_DURATION_MS;
    localStorage.setItem(MAIN_TIMER_KEY, mainEnd);
    mainRemaining = MAIN_DURATION_MS;
  }
  const mainTimer = document.getElementById('mainTimer');
  if (mainTimer) mainTimer.textContent = fmt(mainRemaining);

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
    if (clk) clk.style.left = 'calc(' + pct + '% - 5px)';
  });
}

tick();
setInterval(tick, 1000);

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

const navSearchToggle = document.getElementById('n-search-toggle');
const navSearchForm = document.getElementById('n-search-form');
if (navSearchToggle && navSearchForm) {
  navSearchToggle.addEventListener('click', () => {
    const isOpen = navSearchForm.classList.toggle('is-open');
    navSearchToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
      const input = navSearchForm.querySelector('input[name="q"]');
      if (input) input.focus();
    }
  });
}

function syncCbarHeight() {
  const cbar = document.getElementById('cbar');
  if (!cbar) return;
  document.documentElement.style.setProperty('--baul-cbar-h', cbar.offsetHeight + 'px');
}
syncCbarHeight();
window.addEventListener('resize', syncCbarHeight);
if (typeof ResizeObserver !== 'undefined') {
  const cbarEl = document.getElementById('cbar');
  if (cbarEl) new ResizeObserver(syncCbarHeight).observe(cbarEl);
}

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

const mainImg = document.getElementById('bp-main-img');
if (mainImg) {
  document.querySelectorAll('.bp-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const src = thumb.dataset.src;
      if (!src) return;
      mainImg.src = src;
      document.querySelectorAll('.bp-thumb').forEach((t) => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
  });
}

const productJsonEl = document.getElementById('baul-product-json');
const productForm = document.getElementById('baul-product-form');
if (productJsonEl && productForm) {
  const productData = JSON.parse(productJsonEl.textContent);
  const variantInput = document.getElementById('baul-variant-id');
  const atcBtn = document.getElementById('bp-atc-btn');
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

  function getCustomExtra() {
    if (!productData.showCustom || !productData.addonPrices) return 0;
    const section = document.getElementById('bp-custom-section');
    if (!section) return 0;

    const prices = productData.addonPrices;
    let extra = 0;

    const nameInput = section.querySelector('[name="properties[Nombre]"]');
    const numInput = section.querySelector('[name="properties[Número]"]');
    if (nameInput && nameInput.value.trim()) extra += prices.nombre;
    if (numInput && numInput.value.trim()) extra += prices.numero;

    section.querySelectorAll('[data-addon]').forEach((el) => {
      if (el.type === 'checkbox' && el.checked) {
        extra += prices[el.dataset.addon] || 0;
      }
      if (el.type === 'radio' && el.checked) {
        const key = el.dataset.addon;
        if (key && key !== 'libertadoresNone') {
          extra += prices[key] || 0;
        }
      }
    });

    return extra;
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
    if (atcBtn) {
      const extra = getCustomExtra();
      const total = variant.price + extra;
      atcBtn.disabled = !variant.available;
      if (!variant.available) {
        atcBtn.textContent = 'AGOTADO';
      } else if (productData.showCustom) {
        atcBtn.textContent = 'AGREGAR AL CARRO — ' + formatMoney(total);
      } else {
        atcBtn.textContent = 'AGREGAR AL CARRO';
      }
    }
  }

  function bindCustomization() {
    const section = document.getElementById('bp-custom-section');
    if (!section) return;

    section.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', updateUI);
      input.addEventListener('change', updateUI);
    });

    productForm.addEventListener('submit', () => {
      const nameInput = section.querySelector('[name="properties[Nombre]"]');
      const numInput = section.querySelector('[name="properties[Número]"]');
      if (nameInput && !nameInput.value.trim()) nameInput.disabled = true;
      if (numInput && !numInput.value.trim()) numInput.disabled = true;

      const libNone = section.querySelector('[data-addon="libertadoresNone"]');
      if (libNone && libNone.checked) libNone.disabled = true;
    });
  }

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
  bindCustomization();
  updateUI();
}
