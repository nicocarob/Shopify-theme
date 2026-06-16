const MATCHES = [
  { date: new Date('2026-06-11T15:00:00-04:00'), home: 'México', away: 'Sudáfrica', flagHome: '🇲🇽', flagAway: '🇿🇦' },
  { date: new Date('2026-06-11T22:00:00-04:00'), home: 'Corea del Sur', away: 'Chequia', flagHome: '🇰🇷', flagAway: '🇨🇿' },
  { date: new Date('2026-06-12T15:00:00-04:00'), home: 'Canadá', away: 'Bosnia', flagHome: '🇨🇦', flagAway: '🇧🇦' },
  { date: new Date('2026-06-12T21:00:00-04:00'), home: 'Estados Unidos', away: 'Paraguay', flagHome: '🇺🇸', flagAway: '🇵🇾' },
  { date: new Date('2026-06-13T15:00:00-04:00'), home: 'Qatar', away: 'Suiza', flagHome: '🇶🇦', flagAway: '🇨🇭' },
  { date: new Date('2026-06-13T18:00:00-04:00'), home: 'Brasil', away: 'Marruecos', flagHome: '🇧🇷', flagAway: '🇲🇦' },
  { date: new Date('2026-06-13T21:00:00-04:00'), home: 'Haití', away: 'Escocia', flagHome: '🇭🇹', flagAway: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { date: new Date('2026-06-14T12:00:00-04:00'), home: 'Australia', away: 'Turquía', flagHome: '🇦🇺', flagAway: '🇹🇷' },
  { date: new Date('2026-06-14T15:00:00-04:00'), home: 'Alemania', away: 'Curazao', flagHome: '🇩🇪', flagAway: '🇨🇼' },
  { date: new Date('2026-06-14T18:00:00-04:00'), home: 'Países Bajos', away: 'Japón', flagHome: '🇳🇱', flagAway: '🇯🇵' },
  { date: new Date('2026-06-14T21:00:00-04:00'), home: 'Costa de Marfil', away: 'Ecuador', flagHome: '🇨🇮', flagAway: '🇪🇨' },
  { date: new Date('2026-06-15T12:00:00-04:00'), home: 'España', away: 'Cabo Verde', flagHome: '🇪🇸', flagAway: '🇨🇻' },
  { date: new Date('2026-06-15T15:00:00-04:00'), home: 'Bélgica', away: 'Egipto', flagHome: '🇧🇪', flagAway: '🇪🇬' },
  { date: new Date('2026-06-15T18:00:00-04:00'), home: 'Arabia Saudí', away: 'Uruguay', flagHome: '🇸🇦', flagAway: '🇺🇾' },
  { date: new Date('2026-06-15T21:00:00-04:00'), home: 'Irán', away: 'Nueva Zelanda', flagHome: '🇮🇷', flagAway: '🇳🇿' },
  { date: new Date('2026-06-16T15:00:00-04:00'), home: 'Francia', away: 'Senegal', flagHome: '🇫🇷', flagAway: '🇸🇳' },
  { date: new Date('2026-06-16T18:00:00-04:00'), home: 'Irak', away: 'Noruega', flagHome: '🇮🇶', flagAway: '🇳🇴' },
  { date: new Date('2026-06-16T21:00:00-04:00'), home: 'Argentina', away: 'Argelia', flagHome: '🇦🇷', flagAway: '🇩🇿' },
  { date: new Date('2026-06-17T13:00:00-04:00'), home: 'Portugal', away: 'DR Congo', flagHome: '🇵🇹', flagAway: '🇨🇩' },
  { date: new Date('2026-06-17T21:00:00-04:00'), home: 'Colombia', away: 'Uzbekistán', flagHome: '🇨🇴', flagAway: '🇺🇿' },
  { date: new Date('2026-06-18T13:00:00-04:00'), home: 'Inglaterra', away: 'Croacia', flagHome: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', flagAway: '🇭🇷' },
  { date: new Date('2026-06-19T13:00:00-04:00'), home: 'Argentina', away: 'Austria', flagHome: '🇦🇷', flagAway: '🇦🇹' },
  { date: new Date('2026-06-20T13:00:00-04:00'), home: 'Brasil', away: 'Haití', flagHome: '🇧🇷', flagAway: '🇭🇹' },
  { date: new Date('2026-06-21T13:00:00-04:00'), home: 'España', away: 'Arabia Saudí', flagHome: '🇪🇸', flagAway: '🇸🇦' },
  { date: new Date('2026-06-22T13:00:00-04:00'), home: 'Francia', away: 'Irak', flagHome: '🇫🇷', flagAway: '🇮🇶' },
  { date: new Date('2026-06-23T13:00:00-04:00'), home: 'Portugal', away: 'Uzbekistán', flagHome: '🇵🇹', flagAway: '🇺🇿' },
  { date: new Date('2026-06-24T13:00:00-04:00'), home: 'Alemania', away: 'Costa de Marfil', flagHome: '🇩🇪', flagAway: '🇨🇮' },
  { date: new Date('2026-07-04T16:00:00-04:00'), home: 'Octavos', away: 'de Final', flagHome: '⚽', flagAway: '🏆' },
  { date: new Date('2026-07-11T16:00:00-04:00'), home: 'Cuartos', away: 'de Final', flagHome: '⚽', flagAway: '🏆' },
  { date: new Date('2026-07-15T18:00:00-04:00'), home: 'Semifinal', away: 'Mundial', flagHome: '⚽', flagAway: '🏆' },
  { date: new Date('2026-07-19T15:00:00-04:00'), home: 'Final', away: 'Mundial 2026', flagHome: '🏆', flagAway: '🌟' },
];

const TEAM_RANK = {
  Argentina: 10,
  Brasil: 10,
  Francia: 9,
  Inglaterra: 9,
  España: 9,
  Portugal: 8,
  Alemania: 8,
  'Países Bajos': 7,
  Uruguay: 7,
  Colombia: 7,
  Bélgica: 7,
  'Estados Unidos': 6,
  México: 6,
  Japón: 6,
  'Corea del Sur': 6,
  Croacia: 6,
  Ecuador: 5,
  Senegal: 5,
  Marruecos: 5,
};

const TOTAL = 5 * 3600000;
const CARD_FLOORS = [45, 65, 85, 105, 125, 155, 190, 270].map((m) => m * 60000);
const FALLBACK_BANNER_TEXT = '⏱️ ENVÍO GRATIS POR TIEMPO LIMITADO — TERMINA EN:';

function getChileDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(date);
}

function getMatchScore(match) {
  const rank = (team) => TEAM_RANK[team] || 1;
  return rank(match.home) + rank(match.away);
}

function pickFeaturedMatch() {
  const now = Date.now();
  const todayKey = getChileDateKey(new Date());
  const todayUpcoming = MATCHES.filter(
    (match) => getChileDateKey(match.date) === todayKey && match.date.getTime() > now
  );

  if (todayUpcoming.length) {
    return todayUpcoming.reduce((best, match) =>
      getMatchScore(match) > getMatchScore(best) ? match : best
    );
  }

  const future = MATCHES.filter((match) => match.date.getTime() > now);
  if (!future.length) return null;

  const byDay = {};
  future.forEach((match) => {
    const key = getChileDateKey(match.date);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(match);
  });

  const nearestDay = Object.keys(byDay).sort()[0];
  return byDay[nearestDay].reduce((best, match) =>
    getMatchScore(match) > getMatchScore(best) ? match : best
  );
}

function getBannerText(match) {
  if (!match) return FALLBACK_BANNER_TEXT;
  if (window.innerWidth >= 768) {
    return '⏱️ Envío GRATIS antes de ' + match.home + ' vs ' + match.away + ' — TERMINA EN:';
  }
  return '⏱️ Envío GRATIS hasta el partido ' + match.flagHome + ' vs ' + match.flagAway;
}

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

let featuredMatch = pickFeaturedMatch();
let matchEnd = featuredMatch ? featuredMatch.date.getTime() : 0;

function updateBannerCopy() {
  featuredMatch = pickFeaturedMatch();
  matchEnd = featuredMatch ? featuredMatch.date.getTime() : 0;
  const cbarText = document.querySelector('.cbar-text');
  if (cbarText) cbarText.textContent = getBannerText(featuredMatch);
}

function fmt(ms) {
  const t = Math.max(0, ms);
  return [Math.floor(t / 3600000), Math.floor((t % 3600000) / 60000), Math.floor((t % 60000) / 1000)]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

function tick() {
  const now = Date.now();

  if (!featuredMatch || matchEnd <= now) {
    updateBannerCopy();
  }

  const mainTimer = document.getElementById('mainTimer');
  if (mainTimer) {
    mainTimer.textContent = featuredMatch ? fmt(matchEnd - now) : '00:00:00';
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
    if (clk) clk.style.left = 'calc(' + pct + '% - 5px)';
  });
}

updateBannerCopy();
window.addEventListener('resize', () => {
  const cbarText = document.querySelector('.cbar-text');
  if (cbarText) cbarText.textContent = getBannerText(featuredMatch);
});

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
      atcBtn.disabled = !variant.available;
      atcBtn.textContent = variant.available ? 'AGREGAR AL CARRO' : 'AGOTADO';
    }
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
  updateUI();
}

(function initTallasModal() {
  const modal = document.getElementById('modal-tallas');
  if (!modal) return;

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

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  setTab(defaultTab);

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setTab(tab.dataset.tab));
  });

  closeBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.getElementById('btn-tallas')?.addEventListener('click', () => {
    setTab(defaultTab);
    document.body.style.overflow = 'hidden';
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

  function renderVariants(variants) {
    if (!grid) return;
    grid.innerHTML = '';

    variants.forEach((variant) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'size-btn' + (variant.available ? '' : ' out');
      btn.textContent = variant.option1 || variant.title;
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
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ id: variantId, quantity: 1 }),
    });

    if (!response.ok) throw new Error('Cart add failed');
    return response.json();
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

  const wrap = document.querySelector('.bp-stamps-wrap');
  const track = document.querySelector('.bp-stamps-track');
  if (!wrap || !track) return;

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

  let pos = 0;
  let running = true;
  let loopWidth = 0;

  function measureLoopWidth() {
    loopWidth = track.scrollWidth / 2;
    if (pos >= loopWidth) pos = 0;
  }

  function loop() {
    if (running && loopWidth > 0) {
      pos += 1.2;
      if (pos >= loopWidth) pos = 0;
      track.scrollLeft = pos;
    }
    requestAnimationFrame(loop);
  }

  measureLoopWidth();
  loop();

  wrap.addEventListener('mouseenter', () => {
    running = false;
  });
  wrap.addEventListener('mouseleave', () => {
    running = true;
  });
  track.addEventListener('touchstart', () => {
    running = false;
  }, { passive: true });
  track.addEventListener('touchend', () => {
    running = true;
  });

  window.addEventListener('resize', measureLoopWidth);

  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(measureLoopWidth);
    observer.observe(track);
  }
})();
