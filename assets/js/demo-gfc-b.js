/* GFC explainer: interactive modules, sections 6-11 */
(function () {
'use strict';
const { mount, sl, seg, preset, badge, money, clamp, pmt, bal, line } = GFC;
const $id = id => document.getElementById(id);

/* ===================== Section 6: AIG diagram + calculator ===================== */
(function () {
  const el = $id('fig-aig'); if (!el) return;
  el.innerHTML = `<svg class="chain" viewBox="0 0 900 270" role="img" aria-label="How a credit default swap links a bank, a CDO and AIG"><defs>
    <marker id="aa-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--ok)"/></marker>
    <marker id="aa-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--red)"/></marker>
    <marker id="aa-m" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>
    ${badge('cdo', 56, { x: 72, y: 74 })}<text class="nt" x="100" y="156" text-anchor="middle">"AAA" CDO slice</text><text class="ns" x="100" y="172" text-anchor="middle" fill="var(--muted)">rated ultra-safe</text>
    <line x1="134" y1="102" x2="304" y2="102" stroke="var(--muted)" stroke-width="2.4" marker-end="url(#aa-m)"/><text class="al3" x="219" y="92" text-anchor="middle">bank buys the slice</text>
    ${badge('ml', 56, { x: 306, y: 74 })}<text class="nt" x="334" y="156" text-anchor="middle">Merrill, Citi, UBS…</text><text class="ns" x="334" y="172" text-anchor="middle" fill="var(--muted)">"I'm covered by insurance"</text>
    <line x1="368" y1="92" x2="622" y2="92" stroke="var(--ok)" stroke-width="2.4" marker-end="url(#aa-g)"/><text class="al3" x="495" y="82" text-anchor="middle" fill="var(--ok)">① pays a small premium (~0.1%/yr)</text>
    <line x1="622" y1="124" x2="368" y2="124" stroke="var(--red)" stroke-width="2.4" stroke-dasharray="7 5" marker-end="url(#aa-r)"/><text class="al3" x="495" y="144" text-anchor="middle" fill="var(--red)">② promises to pay if the CDO slice loses value</text>
    ${badge('aig', 56, { x: 624, y: 74 })}<text class="nt" x="652" y="156" text-anchor="middle">AIG Financial Products</text><text class="ns" x="652" y="172" text-anchor="middle" fill="var(--muted)">led by Joseph Cassano</text>
    <rect x="740" y="66" width="146" height="82" rx="10" fill="var(--red)" fill-opacity=".1" stroke="var(--red)" stroke-opacity=".5"/><text class="sw" x="813" y="86" text-anchor="middle">RESERVES SET ASIDE</text><text class="tv" x="813" y="118" text-anchor="middle" fill="var(--red)">≈ almost none</text><text class="sf" x="813" y="136" text-anchor="middle">"it'll never pay out"</text>
    <text class="note2" x="16" y="228">Result: the bank reports the slice as safe and cheap to hold. But now the whole system rests on one insurer.</text></svg>`;
})();

mount('m-aig', {
  controls: sl('g-n', 'Protection AIG sold ($ billions of CDOs)', 10, 200, 1, 78) + sl('g-loss', 'Loss on those CDOs', 0, 100, 1, 40) + sl('g-prem', 'Premium AIG collects per year', 0.05, 0.5, 0.05, 0.1) + sl('g-yr', 'Years of collecting premiums', 1, 6, 1, 3),
  fmts: { 'g-n': v => '$' + v + 'B', 'g-loss': v => v + '%', 'g-prem': v => v.toFixed(2) + '%', 'g-yr': v => v + ' yrs' },
  render: get => {
    const n = get('g-n'), loss = get('g-loss') / 100, pr = get('g-prem') / 100, yr = get('g-yr');
    const prem = n * pr * yr, owed = n * loss, mx = Math.max(prem, owed, 1);
    return `<div class="divb">
      <div class="drow"><div class="dl">Premiums collected<br><small>${yr} yrs × ${(pr * 100).toFixed(2)}% × $${n}B</small></div><div class="dtrack"><i class="bar" style="left:0;width:${prem / mx * 100}%;background:var(--ok)"></i></div><div class="dv" style="color:var(--ok)">$${prem.toFixed(2)}B</div></div>
      <div class="drow"><div class="dl">AIG owes<br><small>${(loss * 100).toFixed(0)}% × $${n}B</small></div><div class="dtrack"><i class="bar" style="left:0;width:${owed / mx * 100}%;background:var(--red)"></i></div><div class="dv" style="color:var(--red)">$${owed.toFixed(1)}B</div></div></div>
    <div class="callout ${owed > prem ? 'bad' : 'good'}">${owed > prem ? `AIG collected <b>$${prem.toFixed(2)}B</b> but owes <b>$${owed.toFixed(1)}B</b>, <b>${(owed / prem).toFixed(0)}×</b> what it took in. ` : 'In this scenario the premiums cover the losses, which is how AIG thought about it. '}Insurance is fine when losses are rare and <em>independent</em> (house fires). It breaks when everyone's house burns down on the same day. In real life AIG's total rescue ultimately reached about <b>$182 billion</b>. (Illustrative numbers: AIGFP's actual subprime-CDO protection was about $78B, part of a CDS book of roughly $500B.)</div>`;
  }
});

/* ===================== Section 7: leverage ===================== */
mount('m-lev', {
  controls: sl('l-lev', 'Leverage: $ of assets for every $1 of the bank\'s own money', 5, 40, 1, 30) + sl('l-mv', 'Change in the value of the bank\'s assets', -10, 10, 0.5, -3) +
    `<div class="presets">${preset('Ordinary bank (~10×)', { 'l-lev': 10 })}${preset('Lehman, late 2007 (~31×)', { 'l-lev': 31 })}${preset('Bear Stearns, late 2007 (~33×)', { 'l-lev': 33 })}</div>`,
  fmts: { 'l-lev': v => v + ' to 1', 'l-mv': v => (v > 0 ? '+' : '') + v.toFixed(1) + '%' },
  render: get => {
    const lev = get('l-lev'), mv = get('l-mv') / 100, A0 = 100, E0 = A0 / lev, D = A0 - E0, A1 = A0 * (1 + mv), E1 = A1 - D, roe = E1 / E0 - 1;
    const sc = 1.9, base = 250, W = 470;
    const stack = (x, A, E, title) => {
      const debtH = Math.min(D, Math.max(A, 0)) * sc, eqH = Math.max(E, 0) * sc;
      let s = `<rect x="${x}" y="${base - debtH}" width="130" height="${debtH}" fill="var(--muted)" fill-opacity=".35" stroke="var(--muted)" stroke-width="1.5"/><text class="tk" x="${x + 65}" y="${base - debtH / 2 + 4}" text-anchor="middle">borrowed $${Math.min(D, Math.max(A, 0)).toFixed(0)}</text>`;
      if (E > 0) s += `<rect x="${x}" y="${base - debtH - eqH}" width="130" height="${eqH}" fill="var(--ok)" fill-opacity=".6" stroke="var(--ok)" stroke-width="2"/>`;
      else s += `<rect x="${x}" y="${base}" width="130" height="${-E * sc}" fill="var(--red)" fill-opacity=".5" stroke="var(--red)" stroke-width="2" stroke-dasharray="5 4"/><text class="tv" x="${x + 65}" y="${base + -E * sc / 2 + 5}" text-anchor="middle" fill="var(--red)">hole: $${(-E).toFixed(1)}</text>`;
      s += `<text class="tv" x="${x + 65}" y="${base - debtH - eqH - 8}" text-anchor="middle">assets $${A.toFixed(1)}</text><text class="nt" x="${x + 65}" y="${base + 62}" text-anchor="middle">${title}</text>`;
      if (E > 0) s += `<text class="tk" x="${x + 142}" y="${base - debtH - eqH / 2 + 4}" fill="var(--ok)">own $${E.toFixed(1)}</text>`;
      return s;
    };
    const svg = `<svg class="chart" viewBox="0 0 ${W} ${base + 90}" role="img" aria-label="Bank balance sheet before and after">${stack(40, A0, E0, 'Before')}${stack(280, A1, E1, 'After')}<text class="tk" x="220" y="${base - 60}" text-anchor="middle">→</text></svg>`;
    const dead = E1 <= 0;
    return `<div class="levgrid"><div class="chartbox">${svg}</div><div><div class="stats one">
      <div class="stat"><span>Return on the bank's own money</span><b style="color:${roe >= 0 ? 'var(--ok)' : 'var(--red)'}">${roe >= 0 ? '+' : ''}${(roe * 100).toFixed(0)}%</b><small>a ${(mv * 100).toFixed(1)}% asset move × ${lev}</small></div>
      <div class="stat"><span>Fall that wipes the bank out</span><b>${(100 / lev).toFixed(1)}%</b><small>1 ÷ ${lev}</small></div></div>
      <div class="callout ${dead ? 'bad' : 'good'}">${dead ? '<b>Insolvent:</b> it owes more than it owns. Lenders will stop lending to it today, not tomorrow.' : mv >= 0 ? 'Profits get <b>multiplied</b>, which is why banks loved leverage (and CEOs\' bonuses did too).' : 'Losses get <b>multiplied</b> too, but the bank survives this one. Try a bigger drop, or a higher leverage.'}</div></div></div>`;
  }
});

(function () {
  const el = $id('fig-repo'); if (!el) return;
  el.innerHTML = `<svg class="chain" viewBox="0 0 900 240" role="img" aria-label="How overnight repo borrowing works"><defs>
    <marker id="ap-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--blue)"/></marker>
    <marker id="ap-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--ok)"/></marker></defs>
    ${badge('leh', 64, { x: 90, y: 66 })}<text class="nt" x="122" y="158" text-anchor="middle">Lehman</text><text class="ns" x="122" y="174" text-anchor="middle" fill="var(--muted)">needs cash today</text>
    ${badge('inv', 64, { x: 706, y: 66 })}<text class="nt" x="738" y="158" text-anchor="middle">Money-market fund</text><text class="ns" x="738" y="174" text-anchor="middle" fill="var(--muted)">has spare cash overnight</text>
    <line x1="170" y1="86" x2="690" y2="86" stroke="var(--blue)" stroke-width="2.6" marker-end="url(#ap-b)"/><text class="al3" x="430" y="76" text-anchor="middle" fill="var(--blue)">hands over mortgage bonds as collateral ("pawn")</text>
    <line x1="690" y1="126" x2="170" y2="126" stroke="var(--ok)" stroke-width="2.6" marker-end="url(#ap-g)"/><text class="al3" x="430" y="148" text-anchor="middle" fill="var(--ok)">lends cash, usually for just ONE night</text>
    <text class="note2" x="16" y="214">Tomorrow morning Lehman must do it all again. Billions of dollars, every single day, for years.</text></svg>`;
})();

/* ===================== Section 8: house prices ===================== */
const HP = [[2000, 100], [2001, 106], [2002, 114], [2003, 123], [2004, 136], [2005, 154], [2006, 178], [2006.5, 184], [2007, 182], [2007.5, 178], [2008, 169], [2008.5, 158], [2009, 146], [2009.5, 139], [2010, 141], [2010.5, 142], [2011, 137], [2011.5, 135], [2012, 134], [2012.5, 138], [2013, 144]];
GFC.timeline('tl-house', {
  series: [{ pts: HP, c: 'var(--blue)', area: true, w: 3 }], x: [2000, 2013], y: [80, 200], xt: [2000, 2002, 2004, 2006, 2008, 2010, 2012], yt: [100, 125, 150, 175, 200], yf: v => v, xf: v => v, ylab: 'US home price index (Jan 2000 = 100)', label: 'US house prices 2000-2013',
  bands: [{ x0: 2003.5, x1: 2004.5, c: 'var(--tBBB)', o: .18 }],
  events: [
    { x: 2003.5, date: 'Jun 2003 – Jun 2004', b: 'fed', title: 'The Fed holds rates at 1%', text: 'After the dot-com bust and 9/11, the Federal Reserve (chair: Alan Greenspan) cut its target rate to 1% and left it there for a year. Borrowing was cheap, mortgages were cheap, and investors hunting for yield turned to mortgage bonds. The Fed then raised rates 17 times in a row, to 5.25% by mid-2006.' },
    { x: 2005.5, date: '2005 – 2006', b: 'mdy', title: 'The ratings machine at full speed', text: 'Subprime lending hit roughly $600 billion a year (about one new mortgage in five). Moody\'s rated nearly 30 mortgage-related securities <em>every working day</em> in 2006. Over 2000–2007 about 45,000 mortgage-related securities got Moody\'s highest AAA rating; in early 2010 only six private US companies had that rating.' },
    { x: 2006.5, date: 'Summer 2006', b: 'mia', title: 'House prices peak', text: 'Prices stopped rising. For Mia, the "refinance later" plan began to die. Over the next six years the national index would fall about 27% (some metro areas lost half). The machine needed ever-rising prices; it never got them again.' },
    { x: 2007.25, date: 'Apr 2, 2007', b: 'nc', title: 'New Century Financial files for bankruptcy', text: 'New Century, one of the biggest subprime lenders, collapsed. Its Wall Street lenders refused to keep financing its loans after waves of borrowers missed their very <em>first</em> payment. The lenders that fed the machine were the first to die.' },
    { x: 2007.45, date: 'Jun – Jul 2007', b: 'bs', title: 'Two Bear Stearns hedge funds collapse', text: 'Two Bear Stearns funds loaded with mortgage CDOs imploded. Merrill Lynch seized some of their collateral and tried to sell it, but found almost no buyers, the first proof that the bonds were worth far less than the prices on the books.' },
    { x: 2007.6, date: 'Jul 10, 2007', b: 'mdy', title: 'Mass downgrades', text: 'Moody\'s and S&P cut ratings on hundreds of subprime mortgage bonds in a single week, bonds many had just been calling safe. Citigroup\'s CEO Chuck Prince had said days earlier: "As long as the music is playing, you\'ve got to get up and dance. We\'re still dancing."' },
    { x: 2007.65, date: 'Aug 2007', b: 'cw', title: 'The first freeze', text: 'BNP Paribas froze three funds, citing the "complete evaporation of liquidity". Banks stopped trusting each other, and borrowing costs jumped. Countrywide, short of cash, drew down its entire $11.5 billion credit lines; Bank of America soon invested $2 billion and, in 2008, bought the whole company.' },
    { x: 2007.83, date: 'Oct – Nov 2007', b: 'ml', title: 'Merrill and Citi take the first huge CDO losses', text: 'Merrill Lynch wrote down $8.4 billion on mortgage assets, and CEO Stan O\'Neal left days later. Citigroup\'s Prince also resigned. Banks that owned "AAA" CDO slices discovered what they were worth.' },
    { x: 2012.2, date: 'Early 2012', b: 'mia', title: 'The bottom', text: 'National home prices bottomed about 27% below the peak (the 20-city index: about 35%). Mortgage-lending, construction jobs, and families\' wealth took much longer than that to recover.' }
  ]
});

/* ===================== Section 9: the doom-loop cycle ===================== */
(function () {
  const el = $id('m-cycle'); if (!el) return;
  const N = [
    { k: 'mia', t: ['House prices', 'fall'], d: 'Starting in mid-2006, home prices stop rising and then fall. Mia can no longer refinance or sell at a profit, and her ARM is about to reset.' },
    { k: 'cw', t: ['Mortgages', 'default'], d: 'Borrowers with resets and no equity stop paying. Delinquencies climb and lenders like New Century and (later) Countrywide, IndyMac and Washington Mutual fail.' },
    { k: 'mbs', t: ['MBS lose', 'value'], d: 'Less cash flows into the trusts. Equity and BBB slices are wiped out first. Then, worse, nobody can tell what any slice is worth, so it can\'t be sold at any price.' },
    { k: 'cdo', t: ['CDOs collapse', '(even the "AAA")'], d: 'CDOs built from BBB slices are hit hardest, as you saw in the amplification chart. Merrill, Citi and UBS book tens of billions in losses on CDOs they thought were safe.' },
    { k: 'leh', t: ['Banks & AIG', 'lose their cushion'], d: 'At ~30× leverage, a few percent of losses erases a bank\'s equity. AIG must hand over billions in collateral. Bear (March) and Lehman (September) fall; Merrill is sold in a weekend.' },
    { k: 'inv', t: ['Lending', 'freezes'], d: 'Nobody knows who is holding the bad assets, so nobody lends: not overnight repo, not commercial paper, not between banks. A famous money-market fund "breaks the buck", and savers panic.' },
    { k: 'mia', t: ['Layoffs, no credit,', 'more foreclosures'], d: 'Firms that can\'t borrow cut jobs. Families that lose jobs default. Foreclosures flood the market, pushing home prices down further... back to the start of the loop. It only stopped when governments stepped in.' }
  ];
  let step = 0;
  const cx = 450, cy = 250, rx = 345, ry = 185;
  const pos = N.map((_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N.length; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  function draw() {
    const hw = 82, hh = 30;
    let s = `<svg class="chain" viewBox="0 0 900 510" role="img" aria-label="The doom loop: from falling house prices to a global credit freeze and back"><defs><marker id="cy-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker><marker id="cy-h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--acc)"/></marker></defs>`;
    N.forEach((n, i) => {
      const j = (i + 1) % N.length, a = pos[i], b = pos[j], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const off = (hw + 4) / Math.max(Math.abs(ux), 1e-6), offy = (hh + 4) / Math.max(Math.abs(uy), 1e-6), d = Math.min(off, offy);
      const on = i < step - 0 && step > 0 && (i + 1 < step || (i === N.length - 1 && step === N.length + 1));
      const lit = (step >= i + 2) || (i === N.length - 1 && step > N.length);
      s += `<line x1="${a[0] + ux * d}" y1="${a[1] + uy * d}" x2="${b[0] - ux * d}" y2="${b[1] - uy * d}" stroke="${lit ? 'var(--acc)' : 'var(--muted)'}" stroke-opacity="${lit ? 1 : .35}" stroke-width="${lit ? 3 : 2}" marker-end="url(#${lit ? 'cy-h' : 'cy-a'})"/>`;
    });
    N.forEach((n, i) => {
      const [x, y] = pos[i], shown = step >= i + 1, cur = step === i + 1;
      s += `<g opacity="${shown ? 1 : .32}"><rect x="${x - hw}" y="${y - hh}" width="${2 * hw}" height="${2 * hh}" rx="14" fill="var(--panel)" stroke="${cur ? 'var(--acc)' : 'var(--line)'}" stroke-width="${cur ? 3.5 : 1.6}"/>${badge(n.k, 40, { x: x - hw + 8, y: y - 20 })}<text class="cn" x="${x - hw + 54}" y="${y - 2}">${n.t[0]}</text><text class="cn" x="${x - hw + 54}" y="${y + 15}">${n.t[1]}</text><circle cx="${x - hw + 4}" cy="${y - hh + 4}" r="11" fill="${cur ? 'var(--acc)' : 'var(--soft)'}" stroke="var(--line)"/><text x="${x - hw + 4}" y="${y - hh + 8.5}" text-anchor="middle" class="sn" fill="${cur ? 'var(--onAcc)' : 'var(--ink)'}">${i + 1}</text></g>`;
    });
    s += `<text class="rt" x="450" y="240" text-anchor="middle">The doom loop</text><text class="note2" x="450" y="262" text-anchor="middle">${step > N.length ? 'Round and round it goes…' : 'Press "Next" to follow the chain reaction'}</text></svg>`;
    const cur = N[Math.min(step, N.length) - 1];
    el.innerHTML = `<div class="chartbox">${s}</div><div class="callout ${step === 0 ? '' : 'good'}" style="min-height:5.5em">${step === 0 ? 'A housing problem became a banking problem because of everything you\'ve learned so far: the layers hid the risk, leverage magnified the damage, and short-term funding made the banks run-able. Step through it.' : `<b>${step > N.length ? 'Loop!' : step + '. ' + cur.t.join(' ')}</b> ${step > N.length ? 'Each lap made the next one worse: falling prices → defaults → bank losses → fewer loans → job losses → more defaults.' : cur.d}`}</div>
      <div class="tlnav"><button class="btn sm" data-c="-1"${step === 0 ? ' disabled' : ''}>← Back</button><button class="btn sm" data-c="reset">↺ Restart</button><button class="btn sm primary" data-c="1"${step > N.length ? ' disabled' : ''}>Next →</button></div>`;
  }
  el.classList.add('mod');
  el.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; step = b.dataset.c === 'reset' ? 0 : clamp(step + +b.dataset.c, 0, N.length + 1); draw(); });
  draw();
})();

/* ===================== Section 9: stock market timeline ===================== */
const SP = [[2007, 9, 1549], [2007, 10, 1481], [2007, 11, 1468], [2008, 0, 1379], [2008, 1, 1331], [2008, 2, 1323], [2008, 3, 1386], [2008, 4, 1400], [2008, 5, 1280], [2008, 6, 1267], [2008, 7, 1283], [2008, 8, 1166], [2008, 9, 969], [2008, 10, 896], [2008, 11, 903], [2009, 0, 826], [2009, 1, 735], [2009, 2, 797], [2009, 3, 873], [2009, 4, 919], [2009, 5, 919]].map(r => [r[0] + r[1] / 12 + 1 / 24, r[2]]);
SP.splice(0, 0, [2007.77, 1565]); SP.splice(SP.findIndex(p => p[0] > 2009.18), 0, [2009.18, 677]);
GFC.timeline('tl-sp', {
  series: [{ pts: SP, c: 'var(--blue)', area: true, w: 3 }], x: [2007.6, 2009.6], y: [500, 1700], xt: [2007.75, 2008, 2008.25, 2008.5, 2008.75, 2009, 2009.25, 2009.5], yt: [600, 800, 1000, 1200, 1400, 1600],
  xf: v => { const y = Math.floor(v + 1e-6), m = Math.round((v - y) * 12); return ['Jan', 'Apr', 'Jul', 'Oct'][Math.round(m / 3) % 4] + (m === 0 ? " '" + String(y).slice(2) : ''); }, ylab: 'S&P 500 index', label: 'S&P 500 stock index 2007-2009',
  events: [
    { x: 2007.77, date: 'Oct 9, 2007', b: 'inv', title: 'The stock market peaks', text: 'The S&P 500 hit 1,565 and the Dow 14,164, even as the mortgage world was already cracking. The stock market was one of the last places to notice.' },
    { x: 2008.21, date: 'Mar 14–16, 2008', b: 'bs', title: 'Bear Stearns: a bank run, 21st-century style', text: 'Over a few days Bear\'s cash cushion fell from about $18 billion to about $2 billion as lenders refused to roll its repo loans. The Fed lent against about $29 billion of its assets to help JPMorgan buy it for $2 a share (raised to $10). A year earlier its stock had traded near $170.' },
    { x: 2008.53, date: 'Jul 2008', b: 'ff', title: 'Fannie, Freddie and IndyMac wobble', text: 'IndyMac, a huge California lender of "Alt-A" loans, failed on July 11. Fannie and Freddie\'s shares collapsed as the world realized how many mortgage losses they\'d absorbed. Treasury Secretary Hank Paulson asked Congress for emergency powers over them.' },
    { x: 2008.71, date: 'September 2008', b: 'leh', title: 'Lehman week', text: 'The worst month: the government took over Fannie and Freddie, Lehman went bankrupt, Merrill was sold, AIG was rescued, a money-market fund broke the buck, and Washington Mutual failed. See the day-by-day below.' },
    { x: 2008.8, date: 'October 2008', b: 'ust', title: 'Panic and TARP', text: 'Congress passed the $700 billion TARP bailout on Oct 3 after first voting it down. Global markets fell anyway. The LIBOR–OIS spread (a "bank fear" gauge, normally ~0.1%) hit about 3.6% on Oct 10. The S&P lost about 17% that month.' },
    { x: 2009.18, date: 'Mar 9, 2009', b: 'inv', title: 'The bottom', text: 'The S&P 500 closed at 677, about 57% below its peak (the Dow fell about 54%). A 401(k) invested in stocks lost more than half of its value on paper in 17 months. Stocks then rebounded, but the pain in jobs and housing lasted years.' }
  ]
});

/* ===================== Section 10: Mia's story ===================== */
(function () {
  const el = $id('m-mia'); if (!el) return;
  // illustrative Inland-Empire-like home value path (Jan of each year) in $k
  const VAL = { 2005: 300, 2006: 345, 2007: 335, 2008: 290, 2009: 220, 2010: 195, 2011: 185 };
  const YEARS = [2005, 2006, 2007, 2008, 2009, 2010, 2011], L = 285000, TAX = 450, RESET = 0.105, FIXED = 0.065;
  function sim(loanType, job) {
    const out = []; let lost = null;
    YEARS.forEach(y => {
      const m = (y - 2005) * 12; let bl, pay;
      if (loanType === 'arm') { if (m < 24) { bl = bal(L, 0.075, 30, m); pay = pmt(L, 0.075, 30); } else { const b24 = bal(L, 0.075, 30, 24); bl = bal(b24, RESET, 28, m - 24); pay = pmt(b24, RESET, 28); } }
      else { bl = bal(L, FIXED, 30, m); pay = pmt(L, FIXED, 30); }
      const val = VAL[y] * 1000, inc = (job && y >= 2008) ? 3800 : 6000, burden = (pay + TAX) / inc, net = val * 0.94 - bl;
      let status, cls;
      if (y === 2005) { status = 'Just bought, with 5% down. Equity is razor-thin, but prices are rising fast, so everyone assumes it will be fine.'; cls = 'warn'; }
      else if (lost) { status = `Lost the house in ${lost}.`; cls = 'bad'; }
      else if (net > 0) { status = burden > 0.45 ? 'Stretched, but she <b>could</b> sell or refinance if needed.' : 'Fine: payments manageable, and she could sell with money to spare.'; cls = burden > 0.45 ? 'warn' : 'good'; }
      else if (burden > 0.4) { status = '<b>Can\'t afford it and can\'t sell it</b> (she\'d owe the bank money). She defaults. Foreclosure follows.'; cls = 'bad'; lost = y; }
      else { status = 'Underwater, but the payment is affordable, so she <b>keeps paying and keeps the house</b>. She is stuck, not broke.'; cls = 'warn'; }
      out.push({ y, val, bl, pay, inc, burden, net, status, cls, lost: !!(lost && lost < y), lostNow: lost === y });
    });
    return out;
  }
  mount('m-mia', {
    controls: `<div class="row"><span class="lab">Mia & Sam's loan</span>${seg('mi-loan', [['arm', '2/28 ARM (what they got)'], ['fix', '30-year fixed (what they could have had)']], 'arm')}</div>
      <div class="row"><span class="lab">Sam's job</span>${seg('mi-job', [['0', 'Keeps his job'], ['1', 'Laid off in 2008 (household income −37%)']], 0)}</div>` + sl('mi-y', 'Year', 2005, 2011, 1, 2005),
    fmts: { 'mi-y': v => 'Jan ' + v },
    render: get => {
      const rows = sim(get('mi-loan'), get('mi-job') === '1'), y = get('mi-y'), r = rows.find(q => q.y === y);
      const stop = rows.find(q => q.lostNow); const endY = stop ? stop.y : 2011;
      const vp = rows.filter(q => q.y <= endY).map(q => [q.y, q.val / 1000]), bp = rows.filter(q => q.y <= endY).map(q => [q.y, q.bl / 1000]);
      const chart = line({
        w: 640, h: 280, x: [2004.8, 2011.2], y: [0, 400], xt: YEARS, yt: [0, 100, 200, 300, 400], xf: v => v, yf: v => '$' + v + 'k', label: "Mia's home value versus her loan",
        series: [{ pts: vp, c: 'var(--blue)', label: 'House value', lp: 1, dy: -10, w: 3, anchor: 'start' }, { pts: bp, c: 'var(--red)', label: 'Loan balance', lp: 0, dy: 20, w: 3, anchor: 'start', dx: 4 }],
        extra: (sx, sy) => {
          let s = `<line x1="${sx(y)}" x2="${sx(y)}" y1="${sy(0)}" y2="${sy(400)}" stroke="var(--acc)" stroke-dasharray="4 4" stroke-width="1.6"/>`;
          if (!r.lost) s += `<circle cx="${sx(y)}" cy="${sy(r.val / 1000)}" r="6" fill="var(--blue)"/><circle cx="${sx(y)}" cy="${sy(r.bl / 1000)}" r="6" fill="var(--red)"/>`;
          if (stop) s += `<text x="${sx(stop.y)}" y="${sy(stop.val / 1000) - 12}" text-anchor="middle" font-size="22" fill="var(--red)" font-weight="800">✕</text>`;
          return s;
        }
      });
      const eq = r.val - r.bl;
      const body = r.lost ? `<div class="stats"><div class="stat hot"><span>Status</span><b>Foreclosed</b><small>since ${stop.y}</small></div></div>` : `<div class="stats">
        <div class="stat"><span>House worth</span><b>${money(r.val)}</b><small>${r.val >= 300000 ? '+' : ''}${((r.val / 300000 - 1) * 100).toFixed(0)}% vs. purchase</small></div>
        <div class="stat"><span>Mortgage owed</span><b>${money(r.bl)}</b><small>paying ${money(r.pay)}/mo</small></div>
        <div class="stat ${eq < 0 ? 'hot' : ''}"><span>Equity</span><b style="color:${eq < 0 ? 'var(--red)' : 'var(--ok)'}">${money(eq)}</b><small>${eq < 0 ? 'underwater' : 'cushion'}</small></div>
        <div class="stat"><span>Housing cost ÷ income</span><b>${(r.burden * 100).toFixed(0)}%</b><small>incl. ~$${TAX} tax+insurance</small></div></div>`;
      return `<div class="chartbox">${chart}</div>${body}<div class="callout ${r.cls}"><b>Jan ${y}:</b> ${r.status}</div>
        <p class="note">Composite family, illustrative numbers loosely modeled on California's Inland Empire (Riverside/San Bernardino), one of the hardest-hit areas. They bought in Jan 2005 for $300,000 with 5% down. In this simplified model rates after the reset stay at ${(RESET * 100).toFixed(1)}%; real adjustable rates moved every six months. Toggle the loan type and Sam's job and watch what changes. <b>Negative equity alone didn't force default. Negative equity plus an unaffordable payment did.</b></p>`;
    }
  });
})();

/* ===================== Section 10: unemployment + wealth ===================== */
(function () {
  const el = $id('chart-unemp'); if (!el) return;
  const U = [[2007.9, 5.0], [2008.2, 5.1], [2008.45, 5.6], [2008.7, 6.2], [2008.95, 7.3], [2009.2, 8.7], [2009.45, 9.5], [2009.78, 10.0], [2010.2, 9.9], [2010.95, 9.3], [2011.45, 9.1], [2011.95, 8.5], [2012.45, 8.2], [2012.95, 7.9], [2013.95, 6.7]];
  el.innerHTML = line({
    w: 600, h: 270, x: [2007.8, 2014], y: [4, 11], xt: [2008, 2009, 2010, 2011, 2012, 2013, 2014], yt: [4, 6, 8, 10], xf: v => v, yf: v => v + '%', label: 'US unemployment rate 2008-2014',
    series: [{ pts: U, c: 'var(--red)', area: true, w: 3 }],
    extra: sx => `<circle cx="${sx(2009.78)}" cy="${(270 - 42) - (10 - 4) / 7 * (270 - 18 - 42)}" r="5.5" fill="var(--red)"/><text class="tv" x="${sx(2009.78) + 10}" y="${(270 - 42) - (10 - 4) / 7 * (270 - 18 - 42) - 8}">10.0% (Oct 2009)</text>`
  });
  const w = $id('chart-wealth'); if (!w) return;
  const rows = [['White', 16, 'var(--blue)'], ['Black', 53, 'var(--tBBB)'], ['Asian', 54, 'var(--tAAA)'], ['Hispanic', 66, 'var(--tEQ)']];
  w.innerHTML = '<div class="divb">' + rows.map(r => `<div class="drow"><div class="dl">${r[0]} households</div><div class="dtrack"><i class="bar" style="left:0;width:${r[1] / 70 * 100}%;background:${r[2]}"></i></div><div class="dv" style="color:${r[2]}">−${r[1]}%</div></div>`).join('') + '</div>';
})();
})();
