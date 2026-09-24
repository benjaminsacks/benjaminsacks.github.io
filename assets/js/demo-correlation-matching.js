(function () {
  const L = ['A', 'B', 'C', 'D'];
  const MINUS = '−';
  const S = { stat: 'R2', view: 'scatter', data: [], perm: [], picks: [null, null, null, null], checked: false };

  const rand = (a, b) => a + Math.random() * (b - a);
  const randn = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

  // Four |r| values whose R² values are clearly separated
  function pickTargets() {
    for (let tries = 0; tries < 5000; tries++) {
      const abs = Array.from({ length: 4 }, () => Math.round(rand(0.2, 0.99) * 100) / 100);
      const s = abs.slice().sort((a, b) => a - b);
      let ok = true;
      for (let i = 1; i < 4; i++) {
        if (s[i] * s[i] - s[i - 1] * s[i - 1] < 0.15 || s[i] - s[i - 1] < 0.06) { ok = false; break; }
      }
      if (!ok) continue;
      let signs = abs.map(() => Math.random() < 0.5 ? -1 : 1);
      if (signs.every(x => x === signs[0])) signs[Math.floor(Math.random() * 4)] *= -1;
      return abs.map((a, i) => a * signs[i]);
    }
    return [0.95, -0.7, 0.45, -0.25];
  }

  // Linear data whose sample r equals the target exactly
  function makeData(r) {
    const n = 50 + Math.floor(Math.random() * 51);
    const spans = [10, 20, 40, 50, 100];
    const span = spans[Math.floor(Math.random() * spans.length)];
    const x0 = Math.round(rand(0, 60) / 5) * 5;
    const xs = Array.from({ length: n }, () => x0 + Math.random() * span);
    const mag = rand(0.3, 4.5) * (20 / span) ** 0.5;
    const m = Math.sign(r) * mag;
    const b = rand(-40, 60);
    const xbar = xs.reduce((s, v) => s + v, 0) / n;
    const Sxx = xs.reduce((s, v) => s + (v - xbar) ** 2, 0);
    let e = xs.map(() => randn());
    const ebar = e.reduce((s, v) => s + v, 0) / n;
    e = e.map(v => v - ebar);
    const beta = e.reduce((s, v, i) => s + v * (xs[i] - xbar), 0) / Sxx;
    e = e.map((v, i) => v - beta * (xs[i] - xbar));
    const See = e.reduce((s, v) => s + v * v, 0);
    const target = m * m * Sxx * (1 / (r * r) - 1);
    const k = Math.sqrt(target / See);
    const ys = xs.map((x, i) => b + m * x + e[i] * k);
    // Fit from the data itself
    const ybar = ys.reduce((s, v) => s + v, 0) / n;
    const Sxy = xs.reduce((s, v, i) => s + (v - xbar) * (ys[i] - ybar), 0);
    const Syy = ys.reduce((s, v) => s + (v - ybar) ** 2, 0);
    const slope = Sxy / Sxx, icpt = ybar - slope * xbar;
    return { xs, ys, slope, icpt, r: Sxy / Math.sqrt(Sxx * Syy) };
  }

  function newRound() {
    S.data = pickTargets().map(makeData);
    let p; do { p = shuffle([0, 1, 2, 3]); } while (p.every((v, i) => v === i));
    S.perm = p;             // letter k shows dataset perm[k]
    S.picks = [null, null, null, null];
    S.checked = false;
    render();
  }

  const correctLetter = i => S.perm.indexOf(i);
  const fmtNum = (v, d) => (v < 0 ? MINUS : '') + Math.abs(v).toFixed(d);
  const decFor = v => Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2;
  const rVal = d => Math.round(d.r * 100) / 100;
  const statText = (d, which) => which === 'R2' ? (rVal(d) ** 2).toFixed(2) : fmtNum(rVal(d), 2);
  const statLabel = which => which === 'R2' ? 'R²' : '<i class="v">r</i>';

  function eqText(d) {
    const m = d.slope, b = d.icpt;
    const mS = fmtNum(m, decFor(m));
    const bS = Math.abs(b).toFixed(decFor(b));
    return `<i class="v">ŷ</i> = ${mS}<i class="v">x</i> ${b < 0 ? MINUS : '+'} ${bS}`;
  }

  function niceTicks(min, max, count) {
    const raw = (max - min) / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const nrm = raw / mag;
    const step = (nrm < 1.5 ? 1 : nrm < 3 ? 2 : nrm < 7 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const t = []; for (let v = lo; v <= hi + step / 2; v += step) t.push(+v.toFixed(10));
    return { lo, hi, t, step };
  }
  const tickLabel = (v, step) => { const d = Math.max(0, -Math.floor(Math.log10(step))); return (v < 0 ? MINUS : '') + Math.abs(v).toFixed(d); };

  function scatterSVG(d) {
    const W = 420, H = 270, ml = 48, mr = 12, mt = 10, mb = 30;
    const X = niceTicks(Math.min(...d.xs), Math.max(...d.xs), 5);
    const Y = niceTicks(Math.min(...d.ys), Math.max(...d.ys), 4);
    const sx = v => ml + (v - X.lo) / (X.hi - X.lo) * (W - ml - mr);
    const sy = v => H - mb - (v - Y.lo) / (Y.hi - Y.lo) * (H - mt - mb);
    let g = '';
    X.t.forEach(v => { g += `<line class="gl" x1="${sx(v)}" x2="${sx(v)}" y1="${mt}" y2="${H - mb}"/><text x="${sx(v)}" y="${H - mb + 18}" text-anchor="middle">${tickLabel(v, X.step)}</text>`; });
    Y.t.forEach(v => { g += `<line class="gl" x1="${ml}" x2="${W - mr}" y1="${sy(v)}" y2="${sy(v)}"/><text x="${ml - 7}" y="${sy(v) + 4}" text-anchor="end">${tickLabel(v, Y.step)}</text>`; });
    g += `<line class="axis" x1="${ml}" x2="${ml}" y1="${mt}" y2="${H - mb}"/><line class="axis" x1="${ml}" x2="${W - mr}" y1="${H - mb}" y2="${H - mb}"/>`;
    const pts = d.xs.map((x, i) => `<circle cx="${sx(x).toFixed(1)}" cy="${sy(d.ys[i]).toFixed(1)}" r="4.2"/>`).join('');
    return `<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter plot">${g}${pts}</svg>`;
  }

  function render() {
    const other = S.stat === 'R2' ? 'r' : 'R2';
    const noun = S.view === 'scatter' ? 'plot' : 'equation';
    document.getElementById('title').innerHTML = `Match each ${noun} to its <span class="text-accent">${statLabel(S.stat)}</span>`;
    document.querySelectorAll('[data-stat]').forEach(b => b.setAttribute('aria-pressed', b.dataset.stat === S.stat));
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === S.view));

    let right = 0;
    const cards = S.data.map((d, i) => {
      const pick = S.picks[i], ans = correctLetter(i);
      const ok = pick === ans;
      if (ok) right++;
      const state = S.checked ? (ok ? 'good' : 'bad') : '';
      const verdict = S.checked ? (ok ? `<span class="verdict good">Correct</span>` : `<span class="verdict bad">Answer: ${L[ans]}</span>`) : '';
      const body = S.view === 'scatter' ? scatterSVG(d)
        : `<div class="eq"><div class="line">${eqText(d)}</div><div class="other">${statLabel(other)} = ${statText(d, other)}</div></div>`;
      const btns = L.map((l, k) => {
        const taken = S.picks.some((p, j) => p === k && j !== i);
        const cls = [taken ? 'taken' : '', S.checked && !ok && k === ans ? 'answer' : ''].join(' ').trim();
        return `<button class="${cls}" data-p="${i}" data-k="${k}" aria-pressed="${pick === k}" aria-label="Match ${noun} ${i + 1} to ${l}">${l}</button>`;
      }).join('');
      return `<article class="card ${state}"><div class="card-head"><span class="num"><b>${i + 1}</b>${noun[0].toUpperCase() + noun.slice(1)}</span>${verdict}</div>${body}<div class="picker">${btns}</div></article>`;
    }).join('');
    document.getElementById('prompts').innerHTML = cards;

    const ans = L.map((l, k) => {
      const d = S.data[S.perm[k]];
      const who = S.checked ? `${noun[0].toUpperCase() + noun.slice(1)} ${S.perm[k] + 1}` : '';
      const used = S.picks.includes(k) ? 'used' : '';
      return `<div class="ans ${used}"><span class="let">${l}</span><span class="val"><span class="lab">${statLabel(S.stat)} =</span>${statText(d, S.stat)}</span><span class="who">${who}</span></div>`;
    }).join('');
    document.getElementById('answers').innerHTML = `<h2>Choices</h2>${ans}`;

    document.getElementById('score').textContent = S.checked ? `${right} of 4 correct` : '';
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.stat) { S.stat = b.dataset.stat; render(); return; }
    if (b.dataset.view) { S.view = b.dataset.view; render(); return; }
    if (b.dataset.p !== undefined) {
      const i = +b.dataset.p, k = +b.dataset.k;
      if (S.picks[i] === k) { S.picks[i] = null; }
      else { S.picks = S.picks.map((p, j) => j !== i && p === k ? null : p); S.picks[i] = k; }
      S.checked = false; render(); return;
    }
    if (b.id === 'check') { S.checked = true; render(); return; }
    if (b.id === 'new') { newRound(); }
  });

  newRound();
})();
