let upsellTimer = null;
let upsellAutoCloseTimer = null;

function scheduleUpsell() {
  clearTimeout(upsellTimer);
  upsellTimer = setTimeout(async () => {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      if (cart.item_count === 0) {
        const upsell = document.getElementById('br-upsell');
        if (upsell) {
          upsell.style.display = 'flex';
          clearTimeout(upsellAutoCloseTimer);
          upsellAutoCloseTimer = setTimeout(() => closeUpsell(), 15000);
        }
      }
    } catch (e) {}
  }, 5000);
}

function closeUpsell() {
  const upsell = document.getElementById('br-upsell');
  if (upsell) upsell.style.display = 'none';
  clearTimeout(upsellTimer);
  clearTimeout(upsellAutoCloseTimer);
}

const BAULRULETA = (() => {
  const PRIZES = [
    { label: 'Nombre gratis', code: 'NOM26CAB', val: '¡Ganaste personalización gratis! Escribe tu nombre en tu camiseta sin costo 🎽', emoji: '✨', prob: 25 },
    { label: 'Número gratis', code: 'NUM26CAB', val: '¡Ganaste personalización gratis! Elige tu número favorito sin costo 🎽', emoji: '🎽', prob: 25 },
    { label: '$1.000 OFF', code: 'MUNDIAL1K', val: '¡Ganaste $1.000 de descuento! Válido comprando 2 o más camisetas 🔥', emoji: '🔥', prob: 18 },
    { label: '$1.250 OFF', code: 'MUNDIAL1250', val: '¡Ganaste $1.250 de descuento! Válido comprando 2 o más camisetas 🔥', emoji: '💥', prob: 12 },
    { label: 'Camiseta gratis', code: '', val: '¡Ganaste una camiseta gratis! Lleva 4 camisetas y la 5ta es tuya 🎽', emoji: '🏆', prob: 20 },
  ];

  const WHEEL_COLORS = ['#00c851', '#1a1a1a', '#ffd700', '#1a1a1a', '#e91e8c'];

  const SPIN_DURATION = 7000;
  const SHAKE_WINDOW = 800;
  const SHAKE_DELAY = 300;
  const FIREWORK_DURATION = 4000;
  const KLAVIYO_API_KEY = 'RMwPCt';

  let spinning = false;
  let pendingPrize = null;
  let timerInterval = null;
  let fireworksRaf = null;
  let fireworksCanvas = null;

  function easeOutQuintic(t) {
    return 1 - Math.pow(1 - t, 8);
  }

  function getPopupShown() {
    const data = localStorage.getItem('baulRuletaDate');
    if (!data) return false;
    return data === new Date().toISOString().split('T')[0];
  }

  function setPopupShown() {
    localStorage.setItem('baulRuletaDate', new Date().toISOString().split('T')[0]);
  }

  async function subscribeToKlaviyo(email, prize) {
    if (!email || !prize) return false;

    try {
      const response = await fetch(
        'https://a.klaviyo.com/client/subscriptions/?company_id=' + KLAVIYO_API_KEY,
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            revision: '2023-12-15',
          },
          body: JSON.stringify({
            data: {
              type: 'subscription',
              attributes: {
                custom_source: 'ruleta_mundial_2026',
                profile: {
                  data: {
                    type: 'profile',
                    attributes: {
                      email: email,
                      properties: {
                        coupon_code: prize.code,
                        coupon_value: prize.val,
                      },
                    },
                  },
                },
              },
              relationships: {
                list: {
                  data: {
                    type: 'list',
                    id: 'Uij28M',
                  },
                },
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Klaviyo error:', response.status, errorText);
        return false;
      }

      return true;
    } catch (e) {
      console.log('Klaviyo error:', e);
      return false;
    }
  }

  function getWeightedWinner() {
    const total = PRIZES.reduce((sum, p) => sum + p.prob, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < PRIZES.length; i++) {
      rand -= PRIZES[i].prob;
      if (rand <= 0) return i;
    }
    return PRIZES.length - 1;
  }

  function drawWheel(angle) {
    const canvas = document.getElementById('br-wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 110;
    const cy = 110;
    const r = 105;
    const slice = (2 * Math.PI) / PRIZES.length;

    ctx.clearRect(0, 0, 220, 220);

    PRIZES.forEach((prize, i) => {
      const start = angle + i * slice;
      const end = start + slice;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i];
      ctx.fill();
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = WHEEL_COLORS[i] === '#1a1a1a' ? '#ffffff' : '#000000';
      ctx.font = '600 11px sans-serif';
      ctx.fillText(prize.label, r - 10, 4);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function clearWheelShake(canvas, shakeInterval) {
    if (shakeInterval) clearInterval(shakeInterval);
    if (canvas) canvas.style.transform = '';
    return null;
  }

  function spinWheel() {
    if (spinning) return;
    spinning = true;

    const spinBtn = document.getElementById('br-btn-spin');
    if (spinBtn) spinBtn.disabled = true;

    const canvas = document.getElementById('br-wheel-canvas');
    const wi = getWeightedWinner();
    const slice = (2 * Math.PI) / PRIZES.length;
    const targetAngle = 2 * Math.PI * 10 - wi * slice - slice / 2 - Math.PI / 2;

    let start = null;
    let shakeInterval = null;
    let shakeStarted = false;

    function finishSpin() {
      shakeInterval = clearWheelShake(canvas, shakeInterval);
      console.log('Winner index:', wi, '| Prize:', PRIZES[wi].label);
      setTimeout(() => {
        spinning = false;
        showEmailStep(PRIZES[wi]);
      }, SHAKE_DELAY);
    }

    function anim(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = easeOutQuintic(progress);

      drawWheel(targetAngle * eased);

      const remaining = SPIN_DURATION - elapsed;
      if (!shakeStarted && remaining <= SHAKE_WINDOW && progress < 1) {
        shakeStarted = true;
        let flip = 1;
        shakeInterval = setInterval(() => {
          if (canvas) canvas.style.transform = 'translateX(' + flip * 2 + 'px)';
          flip *= -1;
        }, 35);
      }

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        finishSpin();
      }
    }

    requestAnimationFrame(anim);
  }

  function ensureFireworksCanvas() {
    const popup = document.getElementById('br-popup');
    if (!popup) return null;

    if (!fireworksCanvas) {
      fireworksCanvas = document.createElement('canvas');
      fireworksCanvas.id = 'br-fireworks';
      fireworksCanvas.width = popup.offsetWidth || 420;
      fireworksCanvas.height = popup.offsetHeight || 560;
      fireworksCanvas.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:20;border-radius:inherit;';
      if (getComputedStyle(popup).position === 'static') {
        popup.style.position = 'relative';
      }
      popup.appendChild(fireworksCanvas);
    }

    fireworksCanvas.width = popup.offsetWidth || 420;
    fireworksCanvas.height = popup.offsetHeight || 560;
    return fireworksCanvas;
  }

  function launchFireworks() {
    const canvas = ensureFireworksCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const colors = ['#ffd700', '#00c851', '#e91e8c', '#ffffff', '#ff6b35'];
    const particles = [];
    const startTime = performance.now();

    if (fireworksRaf) cancelAnimationFrame(fireworksRaf);

    function spawnBurst(count) {
      const cx = canvas.width * 0.5;
      const cy = canvas.height * 0.38;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 7;
        const life = 0.7 + Math.random() * 1.1;
        particles.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (1.5 + Math.random() * 2),
          color: colors[Math.floor(Math.random() * colors.length)],
          life,
          maxLife: life,
          decay: 0.01 + Math.random() * 0.015,
          size: 2 + Math.random() * 3.5,
        });
      }
    }

    spawnBurst(120);
    setTimeout(() => spawnBurst(80), 600);

    function tick(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.08;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(p.life / p.maxLife, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (elapsed < FIREWORK_DURATION) {
        fireworksRaf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fireworksRaf = null;
      }
    }

    fireworksRaf = requestAnimationFrame(tick);
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function startTimer() {
    let secs = 1800;
    const fill = document.getElementById('br-timer-fill');
    const txt = document.getElementById('br-timer-count');

    if (txt) txt.textContent = '30:00';
    if (fill) fill.style.width = '100%';
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      secs--;
      if (txt) txt.textContent = formatTime(Math.max(secs, 0));
      if (fill) fill.style.width = Math.round((Math.max(secs, 0) / 1800) * 100) + '%';
      if (secs <= 0) clearInterval(timerInterval);
    }, 1000);
  }

  function showStep(step) {
    const s2 = document.getElementById('br-s2');
    const s2b = document.getElementById('br-s2b');
    const s3 = document.getElementById('br-s3');
    if (s2) s2.style.display = step === 2 ? 'block' : 'none';
    if (s2b) s2b.style.display = step === '2b' ? 'block' : 'none';
    if (s3) s3.style.display = step === 3 ? 'block' : 'none';
  }

  function showEmailStep(prize) {
    pendingPrize = prize;
    showStep('2b');
  }

  async function handleReveal() {
    const emailInput = document.getElementById('br-email-reveal');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email || !email.includes('@')) {
      alert('Ingresa un email válido para ver tu cupón');
      return;
    }

    const btn = document.getElementById('br-btn-reveal');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Enviando...';
    }

    await subscribeToKlaviyo(email, pendingPrize);

    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Ver mi cupón →';
    }

    showResult(pendingPrize);
  }

  function showResult(prize) {
    const disclaimer =
      'Ningún premio de la ruleta es acumulable con las promociones por volumen de la tienda. Se aplica solo el que más te convenga.';
    const hasCode = Boolean(prize.code && String(prize.code).trim());
    const couponBox = document.querySelector('.br-coupon-box');
    const resSub = document.querySelector('.br-res-sub');
    const timerBar = document.querySelector('.br-timer-bar');
    const timerTxt = document.querySelector('.br-timer-txt');

    document.getElementById('br-res-emoji').textContent = prize.emoji;
    document.getElementById('br-res-title').textContent = prize.val;

    if (hasCode) {
      if (couponBox) couponBox.style.display = '';
      if (resSub) {
        resSub.style.display = '';
        resSub.textContent = 'Úsalo en los próximos 30 minutos';
      }
      if (timerBar) timerBar.style.display = '';
      if (timerTxt) timerTxt.style.display = '';
      document.getElementById('br-res-code').textContent = prize.code;
      document.getElementById('br-res-val').textContent = disclaimer;
      startTimer();
    } else {
      if (couponBox) couponBox.style.display = 'none';
      if (resSub) {
        resSub.style.display = '';
        resSub.textContent = disclaimer;
      }
      if (timerBar) timerBar.style.display = 'none';
      if (timerTxt) timerTxt.style.display = 'none';
      if (timerInterval) clearInterval(timerInterval);
    }

    showStep(3);
    launchFireworks();
    setPopupShown();
    scheduleUpsell();
  }

  function closePopup() {
    const overlay = document.getElementById('br-overlay');
    if (overlay) overlay.style.display = 'none';
    if (timerInterval) clearInterval(timerInterval);
    if (fireworksRaf) cancelAnimationFrame(fireworksRaf);
    if (fireworksCanvas) {
      const ctx = fireworksCanvas.getContext('2d');
      ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    }
    setPopupShown();
    scheduleUpsell();
  }

  function init() {
    if (getPopupShown()) return;

    const overlay = document.getElementById('br-overlay');
    if (!overlay) return;

    showStep(2);
    drawWheel(0);

    setTimeout(() => {
      overlay.style.display = 'flex';
    }, 100);

    document.getElementById('br-btn-spin').addEventListener('click', spinWheel);
    document.getElementById('br-btn-reveal').addEventListener('click', handleReveal);
    document.getElementById('br-btn-close').addEventListener('click', closePopup);
    document.getElementById('br-overlay').addEventListener('click', function (e) {
      if (e.target === this) closePopup();
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => BAULRULETA.init(), 15000);
});
