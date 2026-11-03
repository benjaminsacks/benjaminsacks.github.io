/* GFC explainer: interactive modules, sections 0-5 */
(function () {
'use strict';
const { mount, sl, seg, preset, badge, money, pct, clamp, pmt, bal, line } = GFC;
const $id = id => document.getElementById(id);
const fmtK = v => v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : '$' + Math.round(v / 1000) + 'k';
const prob = pr => pr < 0.0001 ? '<0.01%' : (pr * 100).toFixed(pr < 0.01 ? 2 : 1) + '%';
const odds = pr => pr < 1e-6 ? 'less than 1 in a million' : pr > 0.5 ? 'more likely than not' : 'about 1 in ' + Math.round(1 / pr).toLocaleString();

/* ===================== Chain (overview + recap) ===================== */
function chain(id, fail) {
  const el = $id(id); if (!el) return;
  const S = [
    ['mia', 1, 'Mia borrows', ['$285k to buy', 'a home'], ['Approved on a low', 'teaser payment']],
    ['cw', 2, 'Lender sells it', ['The loan is sold', 'within weeks'], ['Paid per loan, not', 'per repayment']],
    ['leh', 3, 'Wall St pools it', ['Thousands of loans', 'become bonds (MBS)'], ['Packaged loans it', 'never really checked']],
    ['mdy', 4, 'Slice + rate', ['Bonds cut into', 'tranches and rated'], ['Models assumed no', 'nationwide price fall']],
    ['wc', 5, 'Re-slice (CDO)', ['Leftover BBB slices', 'become new "AAA"'], ['"Safe" built from', 'the weakest slices']],
    ['aig', 6, 'Insure + borrow', ['AIG insures it; banks', 'borrow ~30 to 1'], ['Insurer with no cushion;', 'banks with no slack']],
    ['mia', 7, 'Mia pays', ['Prices fall; losses', 'climb back up'], ['A housing dip became', 'a global crisis']]
  ];
  const link = { 1: 's1', 2: 's2', 3: 's3', 4: 's4', 5: 's5', 6: 's6', 7: 's8' };
  const W = 1000, ry = fail ? 318 : 222, H = ry + 30;
  let s = `<svg class="chain" viewBox="0 0 ${W} ${H}" role="img" aria-label="The chain from one mortgage to the global crisis"><defs><marker id="ar-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker><marker id="arr-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--red)"/></marker></defs>`;
  S.forEach((t, i) => {
    const x = 72 + i * 143, c = GFC.CAST[t[0]].c;
    if (i < 6) s += `<line x1="${x + 38}" y1="94" x2="${x + 143 - 38}" y2="94" stroke="var(--muted)" stroke-width="2.2" marker-end="url(#ar-${id})"/>`;
    s += `<a href="#${link[t[1]]}" class="stn"><circle cx="${x}" cy="30" r="13" fill="${c}" fill-opacity=".25" stroke="${c}" stroke-width="2"/><text x="${x}" y="35" text-anchor="middle" class="sn">${t[1]}</text>${badge(t[0], 60, { x: x - 30, y: 64 })}`;
    if (t[1] === 7) s += `<circle cx="${x + 24}" cy="68" r="10" fill="var(--red)"/><text x="${x + 24}" y="73" text-anchor="middle" font-weight="800" font-size="14" fill="#fff">!</text>`;
    s += `<text x="${x}" y="150" text-anchor="middle" class="st">${t[2]}</text><text x="${x}" y="168" text-anchor="middle" class="sd">${t[3][0]}</text><text x="${x}" y="183" text-anchor="middle" class="sd">${t[3][1]}</text></a>`;
    if (fail) s += `<rect x="${x - 66}" y="202" width="132" height="72" rx="10" fill="var(--red)" fill-opacity=".1" stroke="var(--red)" stroke-opacity=".5"/><text x="${x}" y="219" text-anchor="middle" class="sw">WHAT BROKE</text><text x="${x}" y="241" text-anchor="middle" class="sf">${t[4][0]}</text><text x="${x}" y="258" text-anchor="middle" class="sf">${t[4][1]}</text>`;
  });
  s += `<line x1="928" y1="${ry}" x2="72" y2="${ry}" stroke="var(--red)" stroke-width="2.4" stroke-dasharray="7 6" marker-end="url(#arr-${id})"/><text x="500" y="${ry - 9}" text-anchor="middle" class="sr">When Mia can't pay, the losses travel back up the same chain</text></svg>`;
  el.innerHTML = s;
}
chain('chain-master', false);
chain('chain-recap', true);

/* ===================== Section 1: calculator ===================== */
mount('m-calc', {
  controls: sl('c-price', 'Home price', 100000, 800000, 10000, 300000) + sl('c-down', 'Down payment', 0, 30, 1, 20) + sl('c-rate', 'Interest rate', 2, 12, 0.25, 6.5) + `<div class="row"><span class="lab">Length</span>${seg('c-term', [[15, '15 years'], [30, '30 years']], 30)}</div>`,
  fmts: { 'c-price': v => money(v), 'c-down': v => v + '%', 'c-rate': v => v.toFixed(2) + '%' },
  render: get => {
    const price = get('c-price'), dp = get('c-down') / 100, rate = get('c-rate') / 100, term = +get('c-term');
    const loan = price * (1 - dp), pay = pmt(loan, rate, term), yr = pay * 12, totInt = pay * term * 12 - loan;
    const rows = []; let b = loan;
    for (let y = 0; y < term; y++) { const b2 = bal(loan, rate, term, (y + 1) * 12); rows.push({ prin: b - b2, int: yr - (b - b2) }); b = b2; }
    const cross = rows.findIndex(r => r.prin > r.int) + 1;
    const W = 900, H = 290, m = { l: 56, r: 14, t: 28, b: 44 }, pw = W - m.l - m.r, ph = H - m.t - m.b, bw = pw / term;
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Interest versus principal each year">`;
    [0, .5, 1].forEach(f => { const y = H - m.b - f * ph; s += `<line class="gl" x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}"/><text class="tk" x="${m.l - 8}" y="${y + 4}" text-anchor="end">${f === 0 ? '$0' : fmtK(yr * f)}</text>`; });
    rows.forEach((r, i) => {
      const x = m.l + i * bw + bw * 0.1, w = bw * 0.8, hi = r.int / yr * ph, hp = r.prin / yr * ph;
      s += `<rect x="${x.toFixed(1)}" y="${(H - m.b - hi).toFixed(1)}" width="${w.toFixed(1)}" height="${hi.toFixed(1)}" fill="var(--red)" fill-opacity=".8"/><rect x="${x.toFixed(1)}" y="${(H - m.b - hi - hp).toFixed(1)}" width="${w.toFixed(1)}" height="${hp.toFixed(1)}" fill="var(--green)" fill-opacity=".85"/>`;
      if (i === 0 || (i + 1) % 5 === 0) s += `<text class="tk" x="${x + w / 2}" y="${H - m.b + 17}" text-anchor="middle">${i + 1}</text>`;
    });
    s += `<text class="al" x="${(m.l + W - m.r) / 2}" y="${H - 4}" text-anchor="middle">Year of the loan</text>
      <rect x="${m.l}" y="6" width="12" height="12" fill="var(--red)" fill-opacity=".8"/><text class="tk" x="${m.l + 17}" y="16">Interest (the lender's pay)</text>
      <rect x="${m.l + 250}" y="6" width="12" height="12" fill="var(--green)" fill-opacity=".85"/><text class="tk" x="${m.l + 267}" y="16">Principal (you building equity)</text></svg>`;
    const share = rows[0].int / yr;
    return `<div class="stats">
      <div class="stat"><span>Amount borrowed</span><b>${money(loan)}</b><small>after ${money(price * dp)} down</small></div>
      <div class="stat hot"><span>Monthly payment</span><b>${money(pay)}</b><small>principal + interest only</small></div>
      <div class="stat"><span>Total interest paid</span><b>${money(totInt)}</b><small>${(totInt / loan * 100).toFixed(0)}% of the loan</small></div>
      <div class="stat"><span>Year-1 payments that are interest</span><b>${(share * 100).toFixed(0)}%</b><small>${cross ? 'principal wins from year ' + cross : ''}</small></div></div>
      <div class="chartbox">${s}</div>
      <p class="note">Each bar is one year of payments. Red is the lender's cut. Notice how little green there is early on: <b>early in a mortgage you own very little of your house</b>, which is why a small price fall can leave you owing more than it's worth.</p>`;
  }
});

/* ===================== Section 1: ARM payment shock ===================== */
mount('m-arm', {
  controls: sl('a-rate', 'Rate after the 2-year teaser ends', 6, 13, 0.25, 10.5) + `<div class="presets">${preset('Rate stays 7.5%', { 'a-rate': 7.5 })}${preset('Typical reset: 10.5%', { 'a-rate': 10.5 })}${preset('Harsh reset: 12%', { 'a-rate': 12 })}</div>`,
  fmts: { 'a-rate': v => v.toFixed(2) + '%' },
  render: get => {
    const L = 285000, t = 0.075, inc = 6000;
    const p0 = pmt(L, t, 30), b24 = bal(L, t, 30, 24), nr = get('a-rate') / 100, p1 = pmt(b24, nr, 28);
    const mx = Math.max(p1, 3200), w0 = p0 / mx * 100, w1 = p1 / mx * 100, up = p1 / p0 - 1;
    return `<div class="armrows">
      <div class="arow"><div class="al2">Years 1–2<br><small>teaser 7.5%</small></div><div class="atrack"><i style="width:${w0}%;background:var(--tMEZ)"></i></div><div class="av"><b>${money(p0)}</b> / mo<br><small>${(p0 / inc * 100).toFixed(0)}% of gross income</small></div></div>
      <div class="arow"><div class="al2">Year 3 onward<br><small>reset ${(nr * 100).toFixed(2)}%</small></div><div class="atrack"><i style="width:${w1}%;background:var(--tEQ)"></i></div><div class="av"><b>${money(p1)}</b> / mo<br><small>${(p1 / inc * 100).toFixed(0)}% of gross income</small></div></div></div>
      <div class="callout warn"><b>${up > 0 ? '+' + (up * 100).toFixed(0) + '% (' + money(p1 - p0) + ' more every month)' : 'No change'}</b>. Mia and Sam's loan is $285,000 at 7.5% for two years, then it resets (their household makes about $72,000/yr, or $6,000/month before tax). Many lenders approved subprime borrowers using the <em>teaser</em> payment, not the reset one.</div>`;
  }
});

/* ===================== Section 1: equity / underwater ===================== */
mount('m-equity', {
  controls: sl('e-chg', 'Change in the home\'s price since Mia bought it', -40, 20, 1, -15) + `<div class="presets">${preset('+15% (2006 peak)', { 'e-chg': 15 })}${preset('Flat', { 'e-chg': 0 })}${preset('−15%', { 'e-chg': -15 })}${preset('−35% (Inland Empire 2009)', { 'e-chg': -35 })}</div>`,
  fmts: { 'e-chg': v => (v > 0 ? '+' : '') + v + '%' },
  render: get => {
    const loan = 285000, val = 300000 * (1 + get('e-chg') / 100), eq = val - loan, net = val * 0.94 - loan;
    const W = 560, H = 250, base = 210, sc = 150 / 400000, vh = val * sc, lh = loan * sc;
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="House value versus loan"><line class="gl" x1="40" x2="${W - 20}" y1="${base}" y2="${base}"/>
      <rect x="110" y="${base - vh}" width="130" height="${vh}" fill="var(--blue)" fill-opacity=".55" stroke="var(--blue)" stroke-width="2"/><text x="175" y="${base + 20}" text-anchor="middle" class="tk">House is worth</text><text x="175" y="${base - vh - 8}" text-anchor="middle" class="tv">${money(val)}</text>
      <rect x="320" y="${base - lh}" width="130" height="${lh}" fill="var(--red)" fill-opacity=".5" stroke="var(--red)" stroke-width="2"/><text x="385" y="${base + 20}" text-anchor="middle" class="tk">Mia owes</text><text x="385" y="${base - lh - 8}" text-anchor="middle" class="tv">${money(loan)}</text>`;
    if (eq > 0) s += `<rect x="320" y="${base - vh}" width="130" height="${vh - lh}" fill="var(--green)" fill-opacity=".45" stroke="var(--green)" stroke-dasharray="5 4" stroke-width="2"/><text x="280" y="34" text-anchor="middle" class="tv" fill="var(--ok)">equity: ${money(eq)}</text>`;
    else s += `<rect x="110" y="${base - lh}" width="130" height="${lh - vh}" fill="var(--red)" fill-opacity=".25" stroke="var(--red)" stroke-dasharray="5 4" stroke-width="2"/><text x="280" y="34" text-anchor="middle" class="tv" fill="var(--red)">underwater by ${money(-eq)}</text>`;
    s += '</svg>';
    let verdict, cls;
    if (net > 0) { verdict = `<b>Healthy.</b> Mia has <b>${money(eq)}</b> of equity. If she can't afford the payment she can sell (even after ~6% selling costs she'd walk away with about ${money(net)}) or refinance into a new loan. <em>This was the 2005 plan: "if it gets hard, we'll refinance."</em>`; cls = 'good'; }
    else if (eq > 0) { verdict = `<b>Stuck.</b> On paper she has ${money(eq)} of equity, but after ~6% selling costs she'd still owe about ${money(-net)}. Lenders also won't refinance without a cushion.`; cls = 'warn'; }
    else { verdict = `<b>Underwater by ${money(-eq)}.</b> Selling wouldn't even pay off the loan, and no lender will refinance her. Her only options are to keep paying or to default. If the payment jumps, she may have no choice.`; cls = 'bad'; }
    return `<div class="eqgrid"><div class="chartbox">${s}</div><div class="callout ${cls}">${verdict}</div></div>`;
  }
});

/* ===================== Section 2: old vs new diagrams ===================== */
(function () {
  const el = $id('fig-oldnew'); if (!el) return;
  function row(y, nodes, title, tag, tagc) {
    let s = `<text class="rt" x="16" y="${y - 54}">${title}</text><text class="rtag" x="16" y="${y - 38}" fill="${tagc}">${tag}</text>`;
    nodes.forEach((n, i) => {
      const x = n.x;
      if (i < nodes.length - 1) s += `<line x1="${x + 34}" y1="${y}" x2="${nodes[i + 1].x - 34}" y2="${y}" stroke="var(--muted)" stroke-width="2.2" marker-end="url(#ar-on)"/><text class="al3" x="${(x + nodes[i + 1].x) / 2}" y="${y - 10}" text-anchor="middle">${n.arrow || ''}</text>`;
      s += badge(n.k, 52, { x: x - 26, y: y - 26 }) + `<text class="nt" x="${x}" y="${y + 46}" text-anchor="middle">${n.l}</text><text class="ns" x="${x}" y="${y + 62}" text-anchor="middle" fill="${n.c}">${n.s}</text>`;
    });
    return s;
  }
  const g = 'var(--ok)', r = 'var(--red)';
  el.innerHTML = `<svg class="chain" viewBox="0 0 900 380" role="img" aria-label="Originate to hold versus originate to distribute"><defs><marker id="ar-on" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>
    ${row(100, [{ k: 'mia', x: 110, l: 'Mia', s: 'wants a house', c: 'var(--muted)', arrow: 'a loan' }, { k: 'bank', x: 330, l: 'Local bank', s: 'KEEPS the loan 30 yrs', c: g }], 'THE OLD WAY: "originate to hold"', 'The lender gets repaid only if Mia pays → it checks carefully', g)}
    <text class="note2" x="470" y="104">→ The bank cares a lot whether Mia can repay.</text>
    <line x1="16" y1="168" x2="884" y2="168" stroke="var(--line)" stroke-dasharray="3 4"/>
    ${row(285, [{ k: 'mia', x: 90, l: 'Mia', s: 'wants a house', c: 'var(--muted)', arrow: 'a loan' }, { k: 'cw', x: 280, l: 'Countrywide', s: 'paid per loan', c: r, arrow: 'sold in days' }, { k: 'leh', x: 470, l: 'Lehman', s: 'paid per deal', c: r, arrow: 'pooled' }, { k: 'mbs', x: 650, l: 'MBS trust', s: 'a pile of loans', c: 'var(--muted)', arrow: 'bonds' }, { k: 'inv', x: 810, l: 'Investors', s: 'hold the risk, can\'t see Mia', c: 'var(--tBBB)' }], 'THE NEW WAY: "originate to distribute"', 'Everyone before the end of the chain gets paid up front, then passes the risk along', r)}
  </svg>`;
})();

/* ===================== Section 2: should the lender make the loan? ===================== */
mount('m-incent', {
  controls: sl('i-p', 'Chance this borrower eventually defaults', 0, 40, 1, 15) + `<div class="row"><span class="lab">The lender...</span>${seg('i-mode', [['hold', 'keeps the loan'], ['sell', 'sells it to Wall Street']], 'sell')}</div>`,
  fmts: { 'i-p': v => v + '%' },
  render: get => {
    const p = get('i-p') / 100, fee = 4000, loss = 90000, mode = get('i-mode');
    const hold = fee - p * loss, sell = fee, lo = -36000, hi = 6000, span = hi - lo, z = (0 - lo) / span * 100;
    const bar = v => v >= 0 ? `left:${z}%;width:${v / span * 100}%;background:var(--ok)` : `left:${(v - lo) / span * 100}%;width:${-v / span * 100}%;background:var(--red)`;
    const be = fee / loss;
    const chosen = mode === 'hold' ? hold : sell;
    return `<div class="divb">
      <div class="drow${mode === 'hold' ? ' sel' : ''}"><div class="dl">Keep it<br><small>fee − (chance × loss)</small></div><div class="dtrack"><i class="zero" style="left:${z}%"></i><i class="bar" style="${bar(hold)}"></i></div><div class="dv" style="color:${hold >= 0 ? 'var(--ok)' : 'var(--red)'}">${money(hold)}</div></div>
      <div class="drow${mode === 'sell' ? ' sel' : ''}"><div class="dl">Sell it<br><small>keeps the fee only</small></div><div class="dtrack"><i class="zero" style="left:${z}%"></i><i class="bar" style="${bar(sell)}"></i></div><div class="dv" style="color:var(--ok)">${money(sell)}</div></div></div>
      <div class="callout ${chosen >= 0 ? 'good' : 'bad'}">Assumes a $4,000 fee and a $90,000 loss if the borrower defaults. A lender that <b>keeps</b> the loan only profits if the default chance is below <b>${(be * 100).toFixed(1)}%</b>, so it screens borrowers hard. A lender that <b>sells</b> the loan earns ${money(sell)} <em>no matter what</em>, so it can approve almost anyone. ${chosen < 0 ? 'Here the lender would lose money, so it would say no.' : 'Here the lender says yes — and the risk becomes someone else\'s problem.'}</div>`;
  }
});

/* ===================== Section 3: MBS money-flow diagram ===================== */
(function () {
  const el = $id('fig-mbsflow'); if (!el) return;
  function nodes(y, arr, labelTop, labelBot, tc) {
    let s = '';
    arr.forEach((n, i) => {
      if (i < arr.length - 1) {
        const a = n.x, b = arr[i + 1].x;
        if (tc === 'fwd') s += `<line x1="${a + 36}" y1="${y - 8}" x2="${b - 36}" y2="${y - 8}" stroke="var(--blue)" stroke-width="2.4" marker-end="url(#am-b)"/><text class="al3" x="${(a + b) / 2}" y="${y - 16}" text-anchor="middle">${labelTop[i]}</text>
          <line x1="${b - 36}" y1="${y + 14}" x2="${a + 36}" y2="${y + 14}" stroke="var(--ok)" stroke-width="2.4" marker-end="url(#am-g)"/><text class="al3" x="${(a + b) / 2}" y="${y + 32}" text-anchor="middle">${labelBot[i]}</text>`;
        else s += `<line x1="${a + 36}" y1="${y}" x2="${b - 36}" y2="${y}" stroke="var(--ok)" stroke-width="2.4" marker-end="url(#am-g)"/><text class="al3" x="${(a + b) / 2}" y="${y - 10}" text-anchor="middle">${labelTop[i]}</text>`;
      }
      s += badge(n.k, 54, { x: n.x - 27, y: y - 27 }) + `<text class="nt" x="${n.x}" y="${y + 48}" text-anchor="middle">${n.l}</text>`;
    });
    return s;
  }
  el.innerHTML = `<svg class="chain" viewBox="0 0 900 400" role="img" aria-label="How a mortgage-backed security is built and paid"><defs>
    <marker id="am-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--blue)"/></marker>
    <marker id="am-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--ok)"/></marker></defs>
    <text class="rt" x="16" y="24">① BUILDING IT (one time)</text>
    <text class="rtag" x="16" y="42" fill="var(--muted)"><tspan fill="var(--blue)">blue = loans / bonds</tspan> go right · <tspan fill="var(--ok)">green = cash</tspan> goes left</text>
    ${nodes(120, [{ k: 'cw', x: 100, l: 'Countrywide' }, { k: 'leh', x: 330, l: 'Lehman' }, { k: 'mbs', x: 560, l: 'MBS trust' }, { k: 'inv', x: 790, l: 'Investors' }], ['sells loans', 'drops loans in', 'sells MBS bonds'], ['pays cash for loans', 'cash from bond sales', 'pay cash for bonds'], 'fwd')}
    <line x1="16" y1="200" x2="884" y2="200" stroke="var(--line)" stroke-dasharray="3 4"/>
    <text class="rt" x="16" y="228">② EVERY MONTH (for ~30 years)</text>
    <text class="rtag" x="16" y="246" fill="var(--muted)">Mia's payment travels down the chain to whoever owns the bonds</text>
    ${nodes(318, [{ k: 'mia', x: 100, l: 'Thousands of Mias' }, { k: 'srv', x: 330, l: 'Servicer' }, { k: 'mbs', x: 560, l: 'MBS trust' }, { k: 'inv', x: 790, l: 'Bondholders' }], ['$1,993 each', 'passes it on', 'interest + principal'], [], 'back')}
  </svg>`;
})();

/* ===================== Section 3: pooling / law of large numbers ===================== */
(function () {
  let seed = 4242;
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  mount('m-pool', {
    controls: `<div class="row"><span class="lab">Loans in the pool</span>${seg('p-n', [[1, '1'], [10, '10'], [100, '100'], [1000, '1,000']], 100)}<button class="btn sm" id="p-roll" type="button">↻ Run 600 new pools</button></div>`,
    render: get => {
      const n = +get('p-n'), r = rng(seed + n * 7), T = 600, p = 0.05, res = [], bins = new Array(21).fill(0);
      for (let t = 0; t < T; t++) { let d = 0; for (let i = 0; i < n; i++) if (r() < p) d++; const f = d / n; res.push(f); bins[Math.min(20, Math.floor(f / 0.01 + 1e-9))]++; }
      res.sort((a, b) => a - b);
      const lo = res[Math.floor(T * 0.025)], hi = res[Math.floor(T * 0.975)], worst = res[T - 1], mx = Math.max(...bins);
      const W = 900, H = 250, m = { l: 20, r: 20, t: 24, b: 44 }, bw = (W - m.l - m.r) / 21;
      let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Distribution of pool default rates">`;
      bins.forEach((c, i) => {
        const h = c / mx * (H - m.t - m.b), x = m.l + i * bw, hot = i === 5;
        s += `<rect x="${x + 2}" y="${H - m.b - h}" width="${bw - 4}" height="${h}" fill="${hot ? 'var(--acc)' : 'var(--blue)'}" fill-opacity="${hot ? .9 : .7}"/>`;
        if (c) s += `<text class="tk" x="${x + bw / 2}" y="${H - m.b - h - 5}" text-anchor="middle">${c}</text>`;
        if (i % 5 === 0 || i === 20) s += `<text class="tk" x="${x + bw / 2}" y="${H - m.b + 17}" text-anchor="middle">${i === 20 ? '20%+' : i + '%'}</text>`;
      });
      s += `<text class="al" x="${W / 2}" y="${H - 4}" text-anchor="middle">Share of loans in the pool that defaulted (600 simulated pools; the true chance is 5% each)</text></svg>`;
      return `<div class="chartbox">${s}</div><div class="stats">
        <div class="stat"><span>Typical pool (middle 95%)</span><b>${(lo * 100).toFixed(0)}% – ${(hi * 100).toFixed(0)}%</b><small>of loans default</small></div>
        <div class="stat ${worst > .12 ? 'hot' : ''}"><span>Worst of 600 pools</span><b>${(worst * 100).toFixed(0)}%</b><small>default</small></div></div>
        <p class="note">${n === 1 ? 'A single loan either works out (0%) or doesn\'t (100%). It\'s a gamble.' : n < 100 ? 'Already narrower, but a bad draw still happens.' : 'Almost every pool lands near 5%. <b>This is the pitch for mortgage pools</b>, and it is just the law of large numbers from the <a href="demo-probability-bag.html">Probability Bag</a> and <a href="demo-random-variables.html">Random Variables</a> demos.'} <b>But it only works if the loans are independent.</b> Hold that thought for section 4.</p>`;
    },
    onClick: (e, run) => { if (e.target.closest('#p-roll')) { seed = Math.floor(Math.random() * 1e9); run(); } }
  });
})();

/* ===================== Section 4: tranche waterfall ===================== */
const MBS_T = [
  { k: 'AAA', n: 'Senior', lo: 20, hi: 100, rating: 'AAA', yld: '~5.5%', c: 'var(--tAAA)', h: 150, size: 80 },
  { k: 'MEZ', n: 'Mezzanine', lo: 10, hi: 20, rating: 'AA–A', yld: '~6%', c: 'var(--tMEZ)', h: 72, size: 10 },
  { k: 'BBB', n: 'BBB', lo: 5, hi: 10, rating: 'BBB', yld: '~7.5%', c: 'var(--tBBB)', h: 56, size: 5 },
  { k: 'EQ', n: 'Equity', lo: 0, hi: 5, rating: 'unrated', yld: '15%+', c: 'var(--tEQ)', h: 50, size: 5 }
];
mount('m-waterfall', {
  controls: sl('w-def', 'Share of the mortgages that default', 0, 60, 1, 10) + sl('w-sev', 'Money lost on each defaulted loan (after foreclosure)', 20, 80, 5, 50) +
    `<div class="presets">${preset('Rating-agency base case', { 'w-def': 10, 'w-sev': 50 })}${preset('Trouble', { 'w-def': 20, 'w-sev': 50 })}${preset('2007 nightmare', { 'w-def': 40, 'w-sev': 50 })}</div>`,
  fmts: { 'w-def': v => v + '%', 'w-sev': v => v + '%' },
  render: get => {
    const L = get('w-def') * get('w-sev') / 100; // pool loss, percent
    const segs = MBS_T.map(t => ({ label: t.rating === 'unrated' ? 'Equity' : t.rating, h: t.h, color: t.c, loss: clamp((L - t.lo) / (t.hi - t.lo), 0, 1) }));
    let tw = `<svg class="chart" viewBox="0 0 400 ${44 + 328 + 20}" role="img" aria-label="Tranche tower with losses rising from the bottom">${GFC.hatchDefs}<text class="tv" x="160" y="18" text-anchor="middle">Pool loss: ${L.toFixed(1)}%</text>` + GFC.tower(95, 32, 140, segs);
    let yy = 32; MBS_T.forEach(t => { tw += `<text class="tk" x="240" y="${yy + t.h / 2 + 4}">${t.k === 'EQ' ? 'first 5%' : 'losses ' + t.lo + '–' + t.hi + '%'}</text>`; yy += t.h; });
    tw += `<text class="tk" x="85" y="${32 + 40}" text-anchor="end">paid first</text><text class="tk" x="85" y="${32 + 322}" text-anchor="end">hit first</text></svg>`;
    const rows = MBS_T.map(t => {
      const f = clamp((L - t.lo) / (t.hi - t.lo), 0, 1);
      const st = f <= 0 ? '<span class="chip ok">Untouched</span>' : f >= 1 ? '<span class="chip bad">Wiped out</span>' : `<span class="chip warn">Lost ${(f * 100).toFixed(0)}%</span>`;
      return `<tr><td><i class="sw" style="background:${t.c}"></i><b>${t.n}</b></td><td>${t.size}%</td><td>${t.rating}</td><td>${t.yld}</td><td>${st}</td></tr>`;
    }).join('');
    return `<div class="wf"><div class="chartbox">${tw}</div><div><table class="tbl"><thead><tr><th>Tranche</th><th>Size</th><th>Rating</th><th>Pays (illustr.)</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="note">Pool loss = defaults × loss per default = ${get('w-def')}% × ${get('w-sev')}% = <b>${L.toFixed(1)}%</b>. Losses fill the tower <b>from the bottom</b>. The AAA investor isn't touched until the flood has swallowed everyone beneath, and in the rating agencies' models, that would take losses above <b>20%</b>, a scenario they judged to be nearly impossible.</p></div></div>`;
  }
});

/* ===================== Section 4: correlation ===================== */
mount('m-corr', {
  controls: sl('r-p', 'Average chance a loan defaults', 5, 25, 1, 10) + sl('r-rho', 'Correlation ρ: how "tied together" the loans are', 0.01, 0.6, 0.01, 0.05) +
    `<div class="presets">${preset('Rating agencies\' assumption (ρ ≈ 0.05)', { 'r-rho': 0.05 })}${preset('One national housing bet (ρ = 0.30)', { 'r-rho': 0.3 })}${preset('Everyone sinks together (ρ = 0.50)', { 'r-rho': 0.5 })}</div>`,
  fmts: { 'r-p': v => v + '%', 'r-rho': v => v.toFixed(2) },
  render: get => {
    const p = get('r-p') / 100, rho = get('r-rho'), sev = 0.5, Phi = GFC.Phi, PI = GFC.PhiInv;
    const F = x => x <= 0 ? 0 : x >= 1 ? 1 : Phi((Math.sqrt(1 - rho) * PI(x) - PI(p)) / Math.sqrt(rho)); // P(default fraction <= x)
    const P = Lc => 1 - F(Lc / 100 / sev); // P(pool loss > Lc%)
    const maxL = 35, bwL = 0.5, nb = maxL / bwL, bins = [];
    for (let i = 0; i < nb; i++) { const a = i * bwL / 100 / sev, b = (i + 1) * bwL / 100 / sev; bins.push(i === nb - 1 ? 1 - F(a) : F(b) - F(a)); }
    const mx = Math.max(...bins), W = 900, H = 270, m = { l: 20, r: 20, t: 30, b: 44 }, pw = W - m.l - m.r, bw = pw / nb;
    const sx = L => m.l + L / maxL * pw;
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Distribution of pool losses">`;
    [[0, 5, 'var(--tEQ)', 'Equity'], [5, 10, 'var(--tBBB)', 'BBB'], [10, 20, 'var(--tMEZ)', 'Mezz'], [20, 35, 'var(--tAAA)', 'AAA']].forEach(b => { s += `<rect x="${sx(b[0])}" y="${m.t}" width="${sx(b[1]) - sx(b[0])}" height="${H - m.t - m.b}" fill="${b[2]}" fill-opacity=".13"/><text class="bl" x="${(sx(b[0]) + sx(b[1])) / 2}" y="${m.t - 10}" text-anchor="middle" fill="${b[2]}">${b[3]} zone</text>`; });
    bins.forEach((v, i) => { const h = v / mx * (H - m.t - m.b - 6); s += `<rect x="${m.l + i * bw + .6}" y="${H - m.b - h}" width="${bw - 1.2}" height="${h}" fill="var(--blue)" fill-opacity=".85"/>`; });
    [0, 5, 10, 15, 20, 25, 30, 35].forEach(t => { s += `<text class="tk" x="${sx(t)}" y="${H - m.b + 17}" text-anchor="middle">${t}%${t === 35 ? '+' : ''}</text>`; });
    s += `<text class="al" x="${W / 2}" y="${H - 4}" text-anchor="middle">Loss on the whole pool, across thousands of possible "worlds" (bar heights rescaled each time)</text></svg>`;
    const rowsT = [[5, 'Equity wiped out', 'var(--tEQ)'], [10, 'BBB wiped out', 'var(--tBBB)'], [20, 'AAA starts losing money', 'var(--tAAA)']].map(r => { const pr = P(r[0]); return `<tr><td><i class="sw" style="background:${r[2]}"></i>${r[1]} <small>(pool loss &gt; ${r[0]}%)</small></td><td><b>${prob(pr)}</b></td><td>${odds(pr)}</td></tr>`; }).join('');
    return `<div class="chartbox">${s}</div><table class="tbl"><thead><tr><th>Event</th><th>Chance</th><th>In plain words</th></tr></thead><tbody>${rowsT}</tbody></table>
      <p class="note">The <b>average</b> loan default rate is ${(p * 100).toFixed(0)}% in every picture. Only the correlation changes. Each loan is the same bet, but at higher correlation they succeed or fail <em>together</em>, so the whole pool swings between "fine" and "disaster". That tail is what the AAA investor was told would never happen. (Model: standard one-factor "Vasicek" model; ρ ≈ 0.05 is the low, near-independent assumption widely blamed on the agencies' models.)</p>`;
  }
});

/* ===================== Section 5: CDO build diagram ===================== */
(function () {
  const el = $id('fig-cdo'); if (!el) return;
  const mbsSegs = [['AAA', 96, 'var(--tAAA)'], ['AA–A', 24, 'var(--tMEZ)'], ['BBB', 20, 'var(--tBBB)'], ['', 20, 'var(--tEQ)']];
  const cdoSegs = [['"AAA" ~75%', 120, 'var(--tAAA)'], ['Mezz', 24, 'var(--tMEZ)'], ['BBB', 18, 'var(--tBBB)'], ['Equity', 18, 'var(--tEQ)']];
  let s = `<svg class="chain" viewBox="0 0 900 400" role="img" aria-label="How CDOs are built from the BBB slices of many MBS"><defs><marker id="ar-cdo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--tBBB)"/></marker></defs>
    <text class="rt" x="16" y="22">100 different mortgage-bond deals ("MBS")</text>`;
  [40, 150, 260].forEach((x, i) => {
    let y = 40; mbsSegs.forEach((g, j) => {
      const hl = j === 2;
      s += `<rect x="${x}" y="${y}" width="84" height="${g[1]}" fill="${g[2]}" fill-opacity="${hl ? .55 : .2}" stroke="${g[2]}" stroke-width="${hl ? 3 : 1.4}"/>` + (g[1] >= 20 && g[0] ? `<text class="tt" x="${x + 42}" y="${y + g[1] / 2 + 4}" text-anchor="middle">${g[0]}</text>` : '');
      if (hl) s += `<path d="M${x + 84} ${y + 10} C ${x + 120} ${y + 10}, 400 ${y + 10}, 430 218" fill="none" stroke="var(--tBBB)" stroke-width="2.2" marker-end="url(#ar-cdo)" stroke-dasharray="6 4"/>`;
      y += g[1];
    });
    s += `<text class="tk" x="${x + 42}" y="${y + 16}" text-anchor="middle">MBS #${i + 1}</text>`;
  });
  s += `<text class="nt" x="360" y="120" text-anchor="middle">…× 100</text>
    <text class="note2" x="40" y="254" >Wall Street can't sell the BBB slices:</text><text class="note2" x="40" y="272">too risky for most, too dull for the rest.</text>
    ${badge('cdo', 62, { x: 430, y: 188 })}<text class="nt" x="461" y="270" text-anchor="middle">New CDO</text>
    <line x1="494" y1="219" x2="560" y2="219" stroke="var(--muted)" stroke-width="2.4" marker-end="url(#ar-on2)"/>
    <defs><marker id="ar-on2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>
    <text class="rt" x="580" y="22">Re-slice the pile of BBBs</text>`;
  let y = 40; cdoSegs.forEach((g, j) => { s += `<rect x="580" y="${y}" width="140" height="${g[1]}" fill="${g[2]}" fill-opacity=".3" stroke="${g[2]}" stroke-width="${j === 0 ? 3 : 1.8}"/><text class="tt" x="650" y="${y + g[1] / 2 + 4}" text-anchor="middle">${g[0]}</text>`; y += g[1]; });
  s += `<text class="al3" x="735" y="${40 + 60}">← rated AAA by Moody's/S&amp;P</text><text class="al3" x="735" y="${40 + 76}" fill="var(--tBBB)">…made of BBBs!</text>
    ${badge('wc', 46, { x: 40, y: 318 })}<text class="nt" x="96" y="337">Wing Chau</text><text class="ns" x="96" y="354" fill="var(--muted)">picks which BBB slices go in</text>
    ${badge('ml', 46, { x: 340, y: 318 })}<text class="nt" x="396" y="337">Merrill Lynch</text><text class="ns" x="396" y="354" fill="var(--muted)">builds the CDO, sells it, earns fees</text>
    ${badge('mdy', 46, { x: 640, y: 318 })}<text class="nt" x="696" y="337">Moody's / S&amp;P</text><text class="ns" x="696" y="354" fill="var(--muted)">stamp ~75% of it "AAA"</text>
    <text class="tk" x="650" y="${40 + 180 + 18}" text-anchor="middle">(slice sizes not to scale)</text></svg>`;
  el.innerHTML = s;
})();

/* ===================== Section 5: how the CDO magnifies losses ===================== */
const CDO_T = [
  { n: '"AAA" CDO', lo: 25, hi: 100, c: 'var(--tAAA)', h: 100 },
  { n: 'Mezz CDO', lo: 13, hi: 25, c: 'var(--tMEZ)', h: 54 },
  { n: 'BBB CDO', lo: 8, hi: 13, c: 'var(--tBBB)', h: 40 },
  { n: 'Equity CDO', lo: 0, hi: 8, c: 'var(--tEQ)', h: 36 }
];
const bbbLoss = L => clamp((L - 5) / 5, 0, 1) * 100;
const cdoLoss = (x, t) => clamp((x - t.lo) / (t.hi - t.lo), 0, 1) * 100;
mount('m-cdo', {
  controls: sl('d-loss', 'Loss on the underlying subprime mortgages', 0, 15, 0.1, 3) + `<div class="presets">${preset('3% (normal)', { 'd-loss': 3 })}${preset('6%', { 'd-loss': 6 })}${preset('8%', { 'd-loss': 8 })}${preset('10%', { 'd-loss': 10 })}</div>`,
  fmts: { 'd-loss': v => v.toFixed(1) + '%' },
  render: get => {
    const L = get('d-loss'), b = bbbLoss(L), top = cdoLoss(b, CDO_T[0]);
    const pts = (f) => { const a = []; for (let x = 0; x <= 15.001; x += 0.25) a.push([x, f(x)]); return a; };
    const chart = line({
      w: 560, h: 300, x: [0, 15], y: [0, 100], xt: [0, 5, 10, 15], yt: [0, 25, 50, 75, 100], xf: v => v + '%', yf: v => v + '%', xlab: 'Loss on the underlying mortgages', ylab: 'Loss on that security', label: 'Loss amplification',
      series: [
        { pts: pts(x => x), c: 'var(--muted)', label: 'the mortgages themselves', lp: 46, dy: 18, anchor: 'middle', w: 2.2 },
        { pts: pts(bbbLoss), c: 'var(--tBBB)', label: 'BBB slice of an MBS', lp: 24, dx: -8, dy: 4, anchor: 'end' },
        { pts: pts(x => cdoLoss(bbbLoss(x), CDO_T[0])), c: 'var(--tAAA)', label: '"AAA" slice of a CDO', lp: 40, dx: 10, dy: 20, anchor: 'start' }
      ],
      extra: (sx, sy) => `<line x1="${sx(L)}" x2="${sx(L)}" y1="${sy(0)}" y2="${sy(100)}" stroke="var(--acc)" stroke-width="1.6" stroke-dasharray="4 4"/><circle cx="${sx(L)}" cy="${sy(L)}" r="5" fill="var(--muted)"/><circle cx="${sx(L)}" cy="${sy(b)}" r="6" fill="var(--tBBB)"/><circle cx="${sx(L)}" cy="${sy(top)}" r="7" fill="var(--tAAA)" stroke="#fff" stroke-width="1.5"/>`
    });
    const segs = CDO_T.map(t => ({ label: t.n, h: t.h, color: t.c, loss: cdoLoss(b, t) / 100 }));
    const tw = `<svg class="chart" viewBox="0 0 250 ${44 + 230}" role="img" aria-label="The CDO tranche tower">${GFC.hatchDefs}<text class="tv" x="125" y="16" text-anchor="middle">CDO: pool −${b.toFixed(0)}%</text>${GFC.tower(40, 30, 170, segs)}</svg>`;
    return `<div class="stats three">
      <div class="stat"><span>Mortgages lose</span><b>${L.toFixed(1)}%</b><small>of their value</small></div>
      <div class="stat"><span>→ each BBB slice loses</span><b style="color:var(--tBBB)">${b.toFixed(0)}%</b><small>covers losses from 5% to 10%</small></div>
      <div class="stat ${top > 0 ? 'hot' : ''}"><span>→ the "AAA" CDO slice loses</span><b style="color:var(--tAAA)">${top.toFixed(0)}%</b><small>${top >= 99.5 ? 'totally wiped out' : 'of a bond rated safest-possible'}</small></div></div>
    <div class="cdogrid"><div class="chartbox">${chart}</div><div class="chartbox">${tw}</div></div>
    <p class="note">${L <= 5 ? 'Below 5% nothing happens. This is why it felt safe in the models. Slide to 8%.' : `<b>Leverage in action:</b> a ${L.toFixed(1)}% loss on mortgages became a <b>${b.toFixed(0)}%</b> loss on the BBB slices and ${top > 0 ? 'a <b>' + top.toFixed(0) + '%</b> loss on a bond stamped "AAA"' : 'is not yet reaching the "AAA" slice'}. A 10% loss on mortgages wipes out the "AAA" slice entirely.`} (Simplified: assumes all the BBB slices in the CDO come from identical deals, which is roughly the point: they all depend on the same housing market.)</p>`;
  }
});
})();
