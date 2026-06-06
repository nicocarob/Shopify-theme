const TOTAL = 5 * 3600000;
const CARD_FLOORS = [270 * 60000, 190 * 60000, 80 * 60000, 45 * 60000];

function getEnd(key, floor) {
  let v = parseInt(localStorage.getItem(key) || '0', 10);
  const now = Date.now();
  if (!v || v < now + floor) {
    v = now + floor + Math.floor(Math.random() * 5 * 60000);
    localStorage.setItem(key, v);
  }
  return v;
}

const END_MAIN = getEnd('bdc_main5', 60 * 60000);
const cardEnds = CARD_FLOORS.map((f, i) => getEnd('bdc_c' + i, f));

function fmt(ms) {
  const t = Math.max(0, ms);
  return [Math.floor(t / 3600000), Math.floor((t % 3600000) / 60000), Math.floor((t % 60000) / 1000)]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

function tick() {
  const now = Date.now();
  const mainTimer = document.getElementById('mainTimer');
  if (mainTimer) mainTimer.textContent = fmt(END_MAIN - now);

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

const searchForm = document.getElementById('baul-search-form');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchForm.querySelector('input[name="q"]')?.value?.trim();
    if (q) window.location.href = '/search?q=' + encodeURIComponent(q);
  });
}
