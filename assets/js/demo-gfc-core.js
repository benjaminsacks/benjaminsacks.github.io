/* GFC explainer: core helpers (cast badges, charts, widgets, quiz engine) */
(function () {
'use strict';
const G = window.GFC = {};
G.$ = (s, r = document) => r.querySelector(s);
G.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
G.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
G.money = (n, d = 0) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
G.pct = (x, d = 0) => (x * 100).toFixed(d) + '%';

/* ---------- Mortgage math ---------- */
G.pmt = (P, rate, years) => { const r = rate / 12, n = years * 12; return r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)); };
G.bal = (P, rate, years, m) => { const r = rate / 12, p = G.pmt(P, rate, years); return r === 0 ? P - p * m : P * Math.pow(1 + r, m) - p * (Math.pow(1 + r, m) - 1) / r; };

/* ---------- Normal distribution ---------- */
function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
G.Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
G.PhiInv = function (p) {
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pl = 0.02425, ph = 1 - pl; let q, r;
  if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > ph) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  q = p - 0.5; r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
};

/* ---------- The cast: ONE badge per entity, reused everywhere ---------- */
G.CAST = {
  mia: { name: 'Mia & Sam Torres', c: '#2fb7a6', shape: 'circle', glyph: 'house' },
  cw:  { name: 'Countrywide', c: '#4a8cff', shape: 'sq', t: 'CW' },
  nc:  { name: 'New Century', c: '#8b7bff', shape: 'sq', t: 'NC' },
  ff:  { name: 'Fannie & Freddie', c: '#a6cf3f', shape: 'hex', t: 'F&F' },
  leh: { name: 'Lehman Brothers', c: '#ff5a4f', shape: 'sq', t: 'LB' },
  bs:  { name: 'Bear Stearns', c: '#35c7e8', shape: 'sq', t: 'BS' },
  ml:  { name: 'Merrill Lynch', c: '#ff9f43', shape: 'sq', t: 'ML' },
  wc:  { name: 'Wing Chau', c: '#ff6fb1', shape: 'circle', t: 'WC' },
  mdy: { name: "Moody's", c: '#b08cff', shape: 'hex', t: 'M' },
  aig: { name: 'AIG', c: '#cfd8e3', shape: 'sq', t: 'AIG' },
  fed: { name: 'Federal Reserve', c: '#e3b505', shape: 'hex', t: 'FED' },
  ust: { name: 'U.S. Treasury', c: '#e3b505', shape: 'hex', t: 'UST' },
  gov: { name: 'FDIC & regulators', c: '#e3b505', shape: 'hex', t: 'GOV' },
  inv: { name: 'Investors', c: '#8a96a3', shape: 'circle', t: '$' },
  bank:{ name: 'Local bank', c: '#8a96a3', shape: 'sq', t: 'BANK' },
  srv: { name: 'Servicer', c: '#8a96a3', shape: 'sq', t: 'SRV' },
  mbs: { name: 'MBS trust', c: '#8aa4c8', shape: 'sq', t: 'MBS', dashed: true },
  cdo: { name: 'CDO', c: '#d6b36a', shape: 'sq', t: 'CDO', dashed: true }
};
G.badge = function (k, s = 44, o = {}) {
  const p = G.CAST[k]; if (!p) return '';
  const dash = p.dashed ? ' stroke-dasharray="4 3"' : '';
  const common = `fill="${p.c}" fill-opacity=".22" stroke="${p.c}" stroke-width="3"${dash}`;
  let shape;
  if (p.shape === 'circle') shape = `<circle cx="24" cy="24" r="21" ${common}/>`;
  else if (p.shape === 'hex') shape = `<polygon points="24,3 42.5,13.5 42.5,34.5 24,45 5.5,34.5 5.5,13.5" ${common} stroke-linejoin="round"/>`;
  else shape = `<rect x="4" y="4" width="40" height="40" rx="10" ${common}/>`;
  let inner;
  if (p.glyph === 'house') inner = '<path d="M13 25 L24 14.5 L35 25 M16 23 V34 H32 V23 M21 34 V27 H27 V34" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
  else {
    const n = p.t.length, fs = n <= 1 ? 22 : n === 2 ? 17 : n === 3 ? 14 : 11;
    inner = `<text x="24" y="${(24 + fs * 0.36).toFixed(1)}" text-anchor="middle" font-family="Space Mono,monospace" font-weight="700" font-size="${fs}" fill="var(--ink)">${p.t.replace('&', '&amp;')}</text>`;
  }
  const pos = o.x != null ? ` x="${o.x}" y="${o.y}"` : '';
  return `<svg class="badge"${pos} width="${s}" height="${s}" viewBox="0 0 48 48" role="img" aria-label="${p.name}">${shape}${inner}</svg>`;
};
G.who = (k, label) => `<span class="who">${G.badge(k, 22)}<b>${label || G.CAST[k].name}</b></span>`;
G.hydrate = function (root = document) {
  G.$$('[data-badge]', root).forEach(e => { e.innerHTML = G.badge(e.dataset.badge, +e.dataset.size || 44); });
  G.$$('[data-who]', root).forEach(e => { e.outerHTML = G.who(e.dataset.who, e.dataset.label || e.textContent.trim() || undefined); });
};

/* ---------- Line chart ---------- */
G.line = function (o) {
  const W = o.w || 900, H = o.h || 340, m = Object.assign({ l: 54, r: 20, t: 18, b: 42 }, o.m || {});
  const [x0, x1] = o.x, [y0, y1] = o.y;
  const sx = v => m.l + (v - x0) / (x1 - x0) * (W - m.l - m.r);
  const sy = v => H - m.b - (v - y0) / (y1 - y0) * (H - m.t - m.b);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.label || 'chart'}">`;
  (o.bands || []).forEach(b => { s += `<rect x="${sx(b.x0)}" y="${m.t}" width="${sx(b.x1) - sx(b.x0)}" height="${H - m.t - m.b}" fill="${b.c}" fill-opacity="${b.o || .1}"/>` + (b.label ? `<text class="bl" x="${(sx(b.x0) + sx(b.x1)) / 2}" y="${m.t + 13}" text-anchor="middle">${b.label}</text>` : ''); });
  (o.yt || []).forEach(t => { s += `<line class="gl" x1="${m.l}" x2="${W - m.r}" y1="${sy(t)}" y2="${sy(t)}"/><text class="tk" x="${m.l - 8}" y="${sy(t) + 4}" text-anchor="end">${(o.yf || (v => v))(t)}</text>`; });
  (o.xt || []).forEach(t => { s += `<line class="gl" x1="${sx(t)}" x2="${sx(t)}" y1="${m.t}" y2="${H - m.b}" style="opacity:.45"/><text class="tk" x="${sx(t)}" y="${H - m.b + 18}" text-anchor="middle">${(o.xf || (v => v))(t)}</text>`; });
  if (o.xlab) s += `<text class="al" x="${(m.l + W - m.r) / 2}" y="${H - 4}" text-anchor="middle">${o.xlab}</text>`;
  if (o.ylab) s += `<text class="al" transform="translate(12 ${(m.t + H - m.b) / 2}) rotate(-90)" text-anchor="middle">${o.ylab}</text>`;
  (o.series || []).forEach(se => {
    const pts = se.pts.map(p => sx(p[0]).toFixed(1) + ',' + sy(p[1]).toFixed(1)).join(' ');
    if (se.area) s += `<polygon points="${sx(se.pts[0][0]).toFixed(1)},${sy(y0)} ${pts} ${sx(se.pts[se.pts.length - 1][0]).toFixed(1)},${sy(y0)}" fill="${se.c}" fill-opacity=".14"/>`;
    s += `<polyline points="${pts}" fill="none" stroke="${se.c}" stroke-width="${se.w || 2.8}"${se.dash ? ` stroke-dasharray="${se.dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
    if (se.label) { const p = se.pts[Math.min(se.lp != null ? se.lp : se.pts.length - 1, se.pts.length - 1)]; s += `<text class="sl2" x="${sx(p[0]) + (se.dx || 0)}" y="${sy(p[1]) + (se.dy != null ? se.dy : -8)}" text-anchor="${se.anchor || 'end'}" fill="${se.c}">${se.label}</text>`; }
  });
  if (o.extra) s += o.extra(sx, sy, { W, H, m });
  return s + '</svg>';
};
G.interp = (pts, x) => { for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [a, b] = [pts[i - 1], pts[i]]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0] || 1); } return pts[pts.length - 1][1]; };

/* ---------- Tranche tower ---------- */
/* segs from TOP to BOTTOM: {label, sub, h, color(css var), loss(0..1), hl} */
G.tower = function (x, y, w, segs, o = {}) {
  let cy = y, s = '';
  segs.forEach(g => {
    s += `<rect x="${x}" y="${cy}" width="${w}" height="${g.h}" fill="${g.color}" fill-opacity=".28" stroke="${g.color}" stroke-width="${g.hl ? 3.5 : 1.8}"/>`;
    const L = G.clamp(g.loss || 0, 0, 1);
    if (L > 0) { const lh = g.h * L; s += `<rect x="${x}" y="${cy + g.h - lh}" width="${w}" height="${lh}" fill="url(#hatch)" /><rect x="${x}" y="${cy + g.h - lh}" width="${w}" height="${lh}" fill="#ff3b30" fill-opacity=".38"/><line x1="${x}" x2="${x + w}" y1="${cy + g.h - lh}" y2="${cy + g.h - lh}" stroke="#ff3b30" stroke-width="2"/>`; }
    if (g.label && g.h >= 14) s += `<text class="tt" x="${x + w / 2}" y="${cy + g.h / 2 + 4}" text-anchor="middle">${g.label}</text>`;
    cy += g.h;
  });
  return s;
};
G.hatchDefs = '<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#ff3b30" stroke-width="2.2" stroke-opacity=".55"/></pattern></defs>';

/* ---------- Widgets ---------- */
G.sl = (id, label, min, max, step, val) => `<label class="sl"><span>${label}</span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><output id="${id}-o"></output></label>`;
G.seg = (name, opts, val) => `<div class="seg" role="radiogroup">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}"${v == val ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
G.preset = (label, obj) => `<button type="button" class="btn sm" data-set='${JSON.stringify(obj)}'>${label}</button>`;

G.mount = function (id, spec) {
  const el = document.getElementById(id); if (!el) return null;
  el.classList.add('mod');
  el.innerHTML = `<div class="ctl">${spec.controls || ''}</div><div class="out"></div>`;
  const out = el.querySelector('.out');
  const get = k => {
    const i = el.querySelector('#' + k);
    if (i) return (i.type === 'range' || i.type === 'number') ? parseFloat(i.value) : i.value;
    const r = el.querySelector(`input[name="${k}"]:checked`); return r ? r.value : null;
  };
  const run = () => {
    for (const k in (spec.fmts || {})) { const o = el.querySelector('#' + k + '-o'); if (o) o.textContent = spec.fmts[k](get(k)); }
    out.innerHTML = spec.render(get, el);
  };
  el.addEventListener('input', run);
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-set]');
    if (b) {
      const o = JSON.parse(b.dataset.set);
      for (const k in o) { const i = el.querySelector('#' + k); if (i) i.value = o[k]; else { const r = el.querySelector(`input[name="${k}"][value="${o[k]}"]`); if (r) r.checked = true; } }
      run();
    }
    if (spec.onClick) spec.onClick(e, run, get);
  });
  run();
  return { el, run, get };
};

/* ---------- Timeline explorer: line chart + clickable events + card ---------- */
G.timeline = function (id, o) {
  const el = document.getElementById(id); if (!el) return;
  el.classList.add('mod');
  let idx = 0;
  const main = o.series[0].pts;
  function draw() {
    const chart = G.line({
      w: o.w || 900, h: o.h || 320, x: o.x, y: o.y, xt: o.xt, yt: o.yt, xf: o.xf, yf: o.yf, ylab: o.ylab, label: o.label,
      bands: o.bands, series: o.series,
      extra: (sx, sy, d) => {
        let s = '';
        o.events.forEach((e, i) => {
          const yv = G.interp(main, e.x), on = i === idx;
          if (on) s += `<line x1="${sx(e.x)}" x2="${sx(e.x)}" y1="${d.m.t}" y2="${d.H - d.m.b}" stroke="var(--acc)" stroke-width="1.6" stroke-dasharray="4 4"/>`;
          s += `<g class="mk${on ? ' on' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="${e.title}"><circle cx="${sx(e.x)}" cy="${sy(yv)}" r="${on ? 9 : 6.5}" /><text x="${sx(e.x)}" y="${sy(yv) + 3.6}" text-anchor="middle">${i + 1}</text></g>`;
        });
        return s;
      }
    });
    const e = o.events[idx];
    el.innerHTML = `<div class="tlchart">${chart}</div>
      <div class="tlcard" aria-live="polite">
        <div class="tlbadge">${G.badge(e.b, 56)}</div>
        <div class="tlbody"><div class="tldate">${e.date} · event ${idx + 1} of ${o.events.length}</div><h4>${e.title}</h4><p>${e.text}</p></div>
      </div>
      <div class="tlnav"><button class="btn sm" data-d="-1"${idx === 0 ? ' disabled' : ''}>← Earlier</button><span class="hintx">Click a numbered dot, or step through</span><button class="btn sm primary" data-d="1"${idx === o.events.length - 1 ? ' disabled' : ''}>Next event →</button></div>`;
  }
  el.addEventListener('click', ev => {
    const m = ev.target.closest('.mk'); if (m) { idx = +m.dataset.i; draw(); return; }
    const b = ev.target.closest('[data-d]'); if (b) { idx = G.clamp(idx + +b.dataset.d, 0, o.events.length - 1); draw(); }
  });
  el.addEventListener('keydown', ev => { const m = ev.target.closest('.mk'); if (m && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); idx = +m.dataset.i; draw(); G.$$('.mk', el)[idx].focus(); } });
  draw();
};

/* ---------- Quiz engine ---------- */
G.QUIZ = {};
const state = { solved: 0, total: 0 };
function updScore() { const e = document.getElementById('score'); if (e) e.textContent = `Practice ${state.solved}/${state.total}`; }
function parseNum(v) { v = String(v).replace(/[$,%\s]/g, '').replace(/^\((.*)\)$/, '-$1').replace(/[−–]/g, '-'); return v === '' ? NaN : parseFloat(v); }
G.buildQuiz = function (el, items) {
  state.total += items.length;
  el.innerHTML = items.map((it, i) => {
    let body;
    if (it.type === 'num') body = `<div class="numrow"><span class="pre">${it.unit || ''}</span><input type="text" inputmode="decimal" autocomplete="off" placeholder="your answer" aria-label="answer"><span class="post">${it.post || ''}</span><button class="btn sm primary chk">Check</button></div>`;
    else body = `<div class="opts">${it.o.map((o, j) => `<button type="button" class="opt" data-j="${j}"><span class="ol">${'ABCD'[j]}</span><span>${o}</span></button>`).join('')}</div>`;
    return `<div class="qz" data-i="${i}"><div class="qq"><span class="qn">${i + 1}</span><div>${it.q}</div></div>${body}<div class="fb" aria-live="polite"></div></div>`;
  }).join('');
  const done = (q, it, ok) => {
    q.classList.add('solved'); q.querySelector('.fb').className = 'fb good';
    q.querySelector('.fb').innerHTML = `<b>${ok === 'shown' ? 'Answer' : 'Correct'}.</b> ${it.why}`;
    if (!q.dataset.counted) { q.dataset.counted = 1; if (ok !== 'shown') state.solved++; updScore(); }
  };
  el.addEventListener('click', e => {
    const q = e.target.closest('.qz'); if (!q) return; const it = items[+q.dataset.i]; const fb = q.querySelector('.fb');
    if (q.classList.contains('solved')) return;
    const opt = e.target.closest('.opt');
    if (opt) {
      const j = +opt.dataset.j;
      if (j === it.a) { opt.classList.add('right'); G.$$('.opt', q).forEach(b => b.disabled = true); done(q, it, true); }
      else { opt.classList.add('wrong'); opt.disabled = true; q.dataset.miss = (+q.dataset.miss || 0) + 1; fb.className = 'fb bad'; fb.innerHTML = (it.hint || 'Not quite. Re-read the section above and try another option.') + (q.dataset.miss >= 2 ? ' <button class="linkbtn show">Show me the answer</button>' : ''); }
      return;
    }
    if (e.target.closest('.chk')) check(q, it);
    if (e.target.closest('.show')) { if (it.type === 'num') q.querySelector('input').value = it.a; else q.querySelector(`.opt[data-j="${it.a}"]`).classList.add('right'); G.$$('.opt', q).forEach(b => b.disabled = true); done(q, it, 'shown'); }
  });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.qz input')) { const q = e.target.closest('.qz'); check(q, items[+q.dataset.i]); } });
  function check(q, it) {
    const fb = q.querySelector('.fb'); const v = parseNum(q.querySelector('input').value);
    const tol = it.tol != null ? it.tol : Math.max(Math.abs(it.a) * 0.005, 0.005);
    if (!isNaN(v) && Math.abs(v - it.a) <= tol) { done(q, it, true); return; }
    q.dataset.miss = (+q.dataset.miss || 0) + 1; fb.className = 'fb bad';
    fb.innerHTML = (isNaN(v) ? 'Type a number first.' : (it.hint || 'Not quite. Check your arithmetic, or use the interactive above to see the numbers.')) + (q.dataset.miss >= 2 ? ' <button class="linkbtn show">Show me the answer</button>' : '');
  }
  updScore();
};
})();
