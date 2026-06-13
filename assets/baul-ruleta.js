const BAULRULETA = (() => {
  const PRIZES = [
    { label: '$500', code: 'MUNDIAL500', val: '$500 de descuento' },
    { label: '$750', code: 'MUNDIAL750', val: '$750 de descuento' },
    { label: '$1.000', code: 'MUNDIAL1K', val: '$1.000 de descuento' },
    { label: '$1.500', code: 'MUNDIAL1500', val: '$1.500 de descuento' },
    { label: '$2.000', code: 'MUNDIAL2K', val: '$2.000 de descuento' },
    { label: '5% OFF', code: 'MUNDIAL5OFF', val: '5% de descuento en toda la tienda' },
    { label: 'Número gratis', code: 'NUM26CAB', val: 'Número en la camiseta gratis ($990)' },
    { label: 'Nombre gratis', code: 'NOM26CAB', val: 'Nombre en la camiseta gratis ($990)' },
  ];

  const WHEEL_COLORS = ['#00c851', '#ffd700', '#e91e8c', '#00c851', '#ff6b35', '#ffd700', '#00c851', '#ffd700'];

  let spinning = false;
  let finalAngle = 0;
  let timerInterval = null;

  function getPopupShown() {
    const data = localStorage.getItem('baulRuletaDate');
    if (!data) return false;
    return data === new Date().toISOString().split('T')[0];
  }

  function setPopupShown() {
    localStorage.setItem('baulRuletaDate', new Date().toISOString().split('T')[0]);
  }

  function drawWheel(angle) {
    const canvas = document.getElementById('br-wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 110;
    const cy = 110;
    const r = 105;
    ctx.clearRect(0, 0, 220, 220);
    const slice = (2 * Math.PI) / PRIZES.length;
    PRIZES.forEach((p, i) => {
      const s = angle + i * slice;
      const e = s + slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, s, e);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i];
      ctx.fill();
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(s + slice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#000';
      ctx.font = '600 12px sans-serif';
      ctx.fillText(p.label, r - 8, 4);
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

  function spinWheel() {
    if (spinning) return;
    spinning = true;
    document.getElementById('br-btn-spin').disabled = true;
    const winnerIdx = Math.floor(Math.random() * PRIZES.length);
    const slice = (2 * Math.PI) / PRIZES.length;
    const target = 2 * Math.PI * 6 + (2 * Math.PI - winnerIdx * slice - slice / 2);
    let start = null;
    function anim(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 4000, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      drawWheel(finalAngle + target * ease);
      if (p < 1) {
        requestAnimationFrame(anim);
      } else {
        finalAngle = (finalAngle + target) % (2 * Math.PI);
        spinning = false;
        showResult(PRIZES[winnerIdx]);
      }
    }
    requestAnimationFrame(anim);
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

  function showStep(n) {
    const s2 = document.getElementById('br-s2');
    const s3 = document.getElementById('br-s3');
    if (s2) s2.style.display = n === 2 ? 'block' : 'none';
    if (s3) s3.style.display = n === 3 ? 'block' : 'none';
  }

  function showResult(prize) {
    document.getElementById('br-res-emoji').textContent = prize.label.includes('%') ? '🎉' : '🏆';
    document.getElementById('br-res-title').textContent = '¡Ganaste ' + prize.label + '!';
    document.getElementById('br-res-code').textContent = prize.code;
    document.getElementById('br-res-val').textContent = prize.val;
    showStep(3);
    startTimer();
    setPopupShown();
  }

  function closePopup() {
    const overlay = document.getElementById('br-overlay');
    if (overlay) overlay.style.display = 'none';
    if (timerInterval) clearInterval(timerInterval);
    setPopupShown();
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
