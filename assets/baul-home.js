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

(function initRelatedTrackLoop() {
  const track = document.querySelector('.related-track');
  if (!track) return;

  track.innerHTML += track.innerHTML;
  track.querySelectorAll('.rev-s').forEach((el) => el.classList.add('in'));
  const totalWidth = track.scrollWidth / 2;
  let pos = 0;
  let running = true;

  function loop() {
    if (running) {
      pos += 0.5;
      if (pos >= totalWidth) pos = 0;
      track.scrollLeft = pos;
    }
    requestAnimationFrame(loop);
  }

  track.addEventListener('mouseenter', () => {
    running = false;
  });
  track.addEventListener('mouseleave', () => {
    running = true;
  });
  track.addEventListener('touchstart', () => {
    running = false;
  });
  track.addEventListener('touchend', () => {
    running = true;
  });

  loop();
})();
