const BAULRULETA = (() => {
  const FOOTBALL_API_KEY = 'd7ed797967614099919ce499d2a4e3b1';
  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxHp9GAd7kk36_jcEZCKapeH_6ixu9ddxfRe13_8jn51cz4ezf7JJobCwMLn7WxqfKbaA/exec';
  
  const PRIZES = [
    {label:'$500',code:'MUNDIAL500',val:'$500 de descuento'},
    {label:'$750',code:'MUNDIAL750',val:'$750 de descuento'},
    {label:'$1.000',code:'MUNDIAL1K',val:'$1.000 de descuento'},
    {label:'$1.500',code:'MUNDIAL1500',val:'$1.500 de descuento'},
    {label:'$2.000',code:'MUNDIAL2K',val:'$2.000 de descuento'},
    {label:'5% OFF',code:'MUNDIAL5OFF',val:'5% de descuento en toda la tienda'},
  ];

  const WHEEL_COLORS = ['#00c851','#ffd700','#e91e8c','#00c851','#ff6b35','#ffd700'];

  const TOP_TEAMS = [
    'Argentina','Brazil','France','England','Spain','Portugal','Germany',
    'Netherlands','Belgium','Italy','Mexico','Uruguay','Colombia','Chile',
    'Morocco','Japan','South Korea','USA','Canada'
  ];

  let matches = [];
  let selectedMatches = [];
  let spinning = false;
  let finalAngle = 0;
  let timerInterval = null;

  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  function getPopupShown() {
    return sessionStorage.getItem('baulRuletaShown');
  }

  function setPopupShown() {
    sessionStorage.setItem('baulRuletaShown', '1');
  }

  async function fetchMatches() {
    try {
      const today = getToday();
      const res = await fetch(
        `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${today}&dateTo=${today}`,
        { headers: { 'X-Auth-Token': FOOTBALL_API_KEY } }
      );
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        return data.matches;
      }
      // Si no hay partidos hoy, buscar los próximos 3 días
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const in3days = new Date();
      in3days.setDate(in3days.getDate() + 3);
      const res2 = await fetch(
        `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${tomorrow.toISOString().split('T')[0]}&dateTo=${in3days.toISOString().split('T')[0]}`,
        { headers: { 'X-Auth-Token': FOOTBALL_API_KEY } }
      );
      const data2 = await res2.json();
      return data2.matches || [];
    } catch(e) {
      return [];
    }
  }

  function scoreTeam(name) {
    const idx = TOP_TEAMS.indexOf(name);
    return idx === -1 ? 0 : TOP_TEAMS.length - idx;
  }

  function selectBestMatches(allMatches) {
    const sorted = [...allMatches].sort((a, b) => {
      const scoreA = scoreTeam(a.homeTeam.name) + scoreTeam(a.awayTeam.name);
      const scoreB = scoreTeam(b.homeTeam.name) + scoreTeam(b.awayTeam.name);
      return scoreB - scoreA;
    });
    return sorted.slice(0, 3);
  }

  function getFlag(teamName) {
    const flags = {
      'Mexico':'🇲🇽','South Africa':'🇿🇦','South Korea':'🇰🇷','Czech Republic':'🇨🇿',
      'Canada':'🇨🇦','Bosnia and Herzegovina':'🇧🇦','Qatar':'🇶🇦','Switzerland':'🇨🇭',
      'Brazil':'🇧🇷','Morocco':'🇲🇦','Haiti':'🇭🇹','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'USA':'🇺🇸','Paraguay':'🇵🇾','Australia':'🇦🇺','Türkiye':'🇹🇷','Turkey':'🇹🇷',
      'Germany':'🇩🇪','Curaçao':'🇨🇼','Ivory Coast':'🇨🇮','Ecuador':'🇪🇨',
      'Netherlands':'🇳🇱','Japan':'🇯🇵','Sweden':'🇸🇪','Tunisia':'🇹🇳',
      'Belgium':'🇧🇪','Egypt':'🇪🇬','Iran':'🇮🇷','New Zealand':'🇳🇿',
      'Spain':'🇪🇸','Cape Verde':'🇨🇻','Saudi Arabia':'🇸🇦','Uruguay':'🇺🇾',
      'France':'🇫🇷','Senegal':'🇸🇳','Iraq':'🇮🇶','Norway':'🇳🇴',
      'Argentina':'🇦🇷','Algeria':'🇩🇿','Austria':'🇦🇹','Jordan':'🇯🇴',
      'Portugal':'🇵🇹','DR Congo':'🇨🇩','Uzbekistan':'🇺🇿','Colombia':'🇨🇴',
      'England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Croatia':'🇭🇷','Ghana':'🇬🇭','Panama':'🇵🇦',
      'Chile':'🇨🇱','Italy':'🇮🇹','Poland':'🇵🇱','Ukraine':'🇺🇦',
    };
    return flags[teamName] || '⚽';
  }

  function buildMatchHTML(match, idx) {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const time = new Date(match.utcDate).toLocaleTimeString('es-CL', {hour:'2-digit',minute:'2-digit'});
    return `
      <div class="br-match">
        <div class="br-match-top">${match.group || 'Fase de grupos'} · ${time} hrs</div>
        <div class="br-match-row">
          <div class="br-team">
            <span class="br-flag">${getFlag(home)}</span>
            <span class="br-tname">${home}</span>
          </div>
          <div class="br-score-wrap">
            <input class="br-score-in" type="number" min="0" max="9" placeholder="0" id="m${idx}a">
            <span class="br-sdash">-</span>
            <input class="br-score-in" type="number" min="0" max="9" placeholder="0" id="m${idx}b">
          </div>
          <div class="br-team br-team-right">
            <span class="br-flag">${getFlag(away)}</span>
            <span class="br-tname">${away}</span>
          </div>
        </div>
      </div>`;
  }

  function drawWheel(angle) {
    const canvas = document.getElementById('br-wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 110, cy = 110, r = 105;
    ctx.clearRect(0, 0, 220, 220);
    const slice = 2 * Math.PI / PRIZES.length;
    PRIZES.forEach((p, i) => {
      const s = angle + i * slice, e = s + slice;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, s, e); ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i]; ctx.fill();
      ctx.strokeStyle = '#0a0a0a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(s + slice / 2);
      ctx.textAlign = 'right'; ctx.fillStyle = '#000'; ctx.font = '600 12px sans-serif';
      ctx.fillText(p.label, r - 8, 4); ctx.restore();
    });
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0a'; ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();
  }

  function spinWheel() {
    if (spinning) return;
    spinning = true;
    document.getElementById('br-btn-spin').disabled = true;
    const winnerIdx = Math.floor(Math.random() * PRIZES.length);
    const slice = 2 * Math.PI / PRIZES.length;
    const target = 2 * Math.PI * 6 + (2 * Math.PI - winnerIdx * slice - slice / 2);
    let start = null;
    function anim(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 4000, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      drawWheel(finalAngle + target * ease);
      if (p < 1) { requestAnimationFrame(anim); }
      else {
        finalAngle = (finalAngle + target) % (2 * Math.PI);
        spinning = false;
        showResult(PRIZES[winnerIdx]);
      }
    }
    requestAnimationFrame(anim);
  }

  function startTimer() {
    let secs = 1800;
    const fill = document.getElementById('br-timer-fill');
    const txt = document.getElementById('br-timer-count');
    timerInterval = setInterval(() => {
      secs--;
      const m = Math.floor(secs / 60), s = secs % 60;
      if (txt) txt.textContent = m + ':' + (s < 10 ? '0' : '') + s;
      if (fill) fill.style.width = Math.round((secs / 1800) * 100) + '%';
      if (secs <= 0) { clearInterval(timerInterval); if (txt) txt.textContent = 'Expirado'; }
    }, 1000);
  }

  async function saveToSheet(email, predictions, prize) {
    try {
      const body = {
        email,
        match1: selectedMatches[0] ? `${selectedMatches[0].homeTeam.name} vs ${selectedMatches[0].awayTeam.name}` : '',
        pred1: predictions[0] || '',
        match2: selectedMatches[1] ? `${selectedMatches[1].homeTeam.name} vs ${selectedMatches[1].awayTeam.name}` : '',
        pred2: predictions[1] || '',
        match3: selectedMatches[2] ? `${selectedMatches[2].homeTeam.name} vs ${selectedMatches[2].awayTeam.name}` : '',
        pred3: predictions[2] || '',
        prize: prize.label,
        coupon: prize.code
      };
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(body)
      });
    } catch(e) { console.log('Sheet error:', e); }
  }

  function showStep(n) {
    ['br-s1','br-s2','br-s3'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.style.display = i + 1 === n ? 'block' : 'none';
    });
  }

  function showResult(prize) {
    document.getElementById('br-res-emoji').textContent = prize.label.includes('%') ? '🎉' : '🏆';
    document.getElementById('br-res-title').textContent = '¡Ganaste ' + prize.label + '!';
    document.getElementById('br-res-code').textContent = prize.code;
    document.getElementById('br-res-val').textContent = prize.val;
    showStep(3);
    startTimer();
  }

  async function handlePredict() {
    const email = document.getElementById('br-email').value.trim();
    if (!email || !email.includes('@')) {
      alert('Ingresa un email válido para participar');
      return;
    }
    const predictions = [];
    for (let i = 0; i < 3; i++) {
      const a = document.getElementById('m' + i + 'a');
      const b = document.getElementById('m' + i + 'b');
      if (a && b) predictions.push((a.value || '0') + '-' + (b.value || '0'));
    }
    const btn = document.getElementById('br-btn-predict');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    showStep(2);
    drawWheel(0);
    const tempPrize = PRIZES[0];
    await saveToSheet(email, predictions, tempPrize);
    btn.disabled = false;
    btn.textContent = 'Guardar y girar la ruleta →';
  }

  function closePopup() {
    const overlay = document.getElementById('br-overlay');
    if (overlay) overlay.style.display = 'none';
    if (timerInterval) clearInterval(timerInterval);
    setPopupShown();
  }

  async function init() {
    if (getPopupShown()) return;
    const overlay = document.getElementById('br-overlay');
    if (!overlay) return;
    const loadingEl = document.getElementById('br-loading');
    const contentEl = document.getElementById('br-content');
    if (loadingEl) loadingEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
    const allMatches = await fetchMatches();
    selectedMatches = selectBestMatches(allMatches);
    const matchesContainer = document.getElementById('br-matches');
    if (matchesContainer) {
      if (selectedMatches.length > 0) {
        matchesContainer.innerHTML = selectedMatches.map((m, i) => buildMatchHTML(m, i)).join('');
      } else {
        matchesContainer.innerHTML = '<p style="color:rgba(255,255,255,0.4);font-size:13px;text-align:center;">No hay partidos disponibles hoy. ¡Vuelve el 11 de junio!</p>';
      }
    }
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
    showStep(1);
    setTimeout(() => { overlay.style.display = 'flex'; }, 100);
    document.getElementById('br-btn-predict').addEventListener('click', handlePredict);
    document.getElementById('br-btn-spin').addEventListener('click', spinWheel);
    document.getElementById('br-btn-close').addEventListener('click', closePopup);
    document.getElementById('br-overlay').addEventListener('click', function(e) {
      if (e.target === this) closePopup();
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => BAULRULETA.init(), 15000);
});
