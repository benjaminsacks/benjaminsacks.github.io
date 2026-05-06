(function nelderMeadDemo() {
  'use strict';

  // ─── Objective function ────────────────────────────────────────────────────
  // f(x,y) = −exp(−(√(x²+y²) − 2)² + x)
  // Global minimum at approximately (2.5, 0), f ≈ −9.49
  function f([x, y]) {
    const r = Math.sqrt(x * x + y * y);
    return -Math.exp(-((r - 2) ** 2) + x);
  }

  // ─── Algorithm parameters ──────────────────────────────────────────────────
  const ALPHA = 1;   // reflection  (r = 2c − w)
  const GAMMA = 2;   // expansion   (e = c + 2(r − c))
  const SIGMA = 0.5; // shrink      (p ← u + 0.5(p − u))
  // Contraction: p₁ = midpoint(w,c), p₂ = midpoint(c,r) — no RHO needed

  // Fixed initial simplex — distinct f-values, spans interesting region
  // f(-1,2)≈−0.348, f(4,3)≈−0.0067, f(2,-3)≈−0.561
  const INITIAL_SIMPLEX = [[-1, 2], [4, 3], [2, -3]];

  // ─── Pseudocode lines (indices 0–18) ──────────────────────────────────────
  const PSEUDOCODE = [
    { indent: 0, text: 'Initialize simplex with three points' },
    { indent: 0, text: 'Evaluate f at each vertex' },
    { indent: 0, text: 'Sort: f(u) ≤ f(v) ≤ f(w)' },
    { indent: 0, text: 'Compute centroid c = (u + v) / 2' },
    { indent: 0, text: 'Reflect: r = 2c − w' },
    { indent: 0, text: 'Evaluate f(r)' },
    { indent: 1, text: 'If f(u) ≤ f(r) < f(v):  replace w ← r' },
    { indent: 1, text: 'Else if f(r) < f(u):' },
    { indent: 2, text: 'Expand: e = c + 2(r − c)' },
    { indent: 2, text: 'Evaluate f(e)' },
    { indent: 2, text: 'If f(e) < f(r):  replace w ← e' },
    { indent: 2, text: 'Else:  replace w ← r' },
    { indent: 1, text: 'Else (f(r) ≥ f(v)):' },
    { indent: 2, text: 'p₁ = (w + c) / 2  and  p₂ = (c + r) / 2' },
    { indent: 2, text: 'Evaluate f(p₁) and f(p₂)' },
    { indent: 2, text: 'If min(f(p₁), f(p₂)) < f(v):  w ← best of p₁, p₂' },
    { indent: 2, text: 'Else: shrink — p ← u + 0.5(p − u) for all p' },
    { indent: 0, text: 'Check convergence' },
    { indent: 0, text: 'Repeat ↑' },
  ];

  // ─── Step generation ──────────────────────────────────────────────────────
  // Each display step captures the complete visual state so Back works correctly.
  function generateSteps(initial) {
    const steps = [];
    const MAX_ITER = 30;
    const TOL = 1e-5;

    function snap(pts) { return pts.map(p => [...p]); }
    function sorted(pts) {
      const s = pts.slice().sort((a, b) => f(a) - f(b));
      return { u: [...s[0]], v: [...s[1]], w: [...s[2]] };
    }

    let pts = snap(initial);

    // ── Step 0: Initialize
    steps.push({
      phase: 'initialize', lineIndex: 0,
      simplex: snap(pts), labels: null, centroid: null, proposal: null,
      message: 'The simplex is initialized with three starting vertices in the search space.',
      iteration: 0, converged: false,
    });

    // ── Step 1: Evaluate
    const fInit = initial.map(p => f(p));
    steps.push({
      phase: 'evaluate', lineIndex: 1,
      simplex: snap(pts), labels: null, centroid: null, proposal: null,
      message: `Evaluating f at each vertex: f(p₁) = ${fInit[0].toFixed(3)}, f(p₂) = ${fInit[1].toFixed(3)}, f(p₃) = ${fInit[2].toFixed(3)}.`,
      iteration: 0, converged: false,
    });

    for (let iter = 1; iter <= MAX_ITER; iter++) {
      // Sort
      const { u, v, w } = sorted(pts);
      const fu = f(u), fv = f(v), fw = f(w);
      pts = [u, v, w]; // keep sorted order for clarity

      steps.push({
        phase: 'sort', lineIndex: 2,
        simplex: snap(pts), labels: { u, v, w }, centroid: null, proposal: null,
        message: `Iteration ${iter}: f(u) = ${fu.toFixed(4)},  f(v) = ${fv.toFixed(4)},  f(w) = ${fw.toFixed(4)}.`,
        iteration: iter, converged: false,
      });

      // Centroid of best two
      const c = [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2];

      steps.push({
        phase: 'centroid', lineIndex: 3,
        simplex: snap(pts), labels: { u, v, w }, centroid: [...c], proposal: null,
        message: `Centroid c = midpoint of u and v = (${c[0].toFixed(3)}, ${c[1].toFixed(3)}).`,
        iteration: iter, converged: false,
      });

      // Reflect
      const r = [c[0] + ALPHA * (c[0] - w[0]), c[1] + ALPHA * (c[1] - w[1])];
      const fr = f(r);

      steps.push({
        phase: 'reflect', lineIndex: 4,
        simplex: snap(pts), labels: { u, v, w }, centroid: [...c],
        proposal: { type: 'reflect', point: [...r] },
        message: `Reflecting w through c: r = 2c − w = (${r[0].toFixed(3)}, ${r[1].toFixed(3)}).`,
        iteration: iter, converged: false,
      });

      steps.push({
        phase: 'evaluate-r', lineIndex: 5,
        simplex: snap(pts), labels: { u, v, w }, centroid: [...c],
        proposal: { type: 'reflect', point: [...r], value: fr },
        message: `f(r) = ${fr.toFixed(4)}.  f(u) = ${fu.toFixed(4)},  f(v) = ${fv.toFixed(4)},  f(w) = ${fw.toFixed(4)}.`,
        iteration: iter, converged: false,
      });

      if (fu <= fr && fr < fv) {
        // Accept reflection
        pts = [u, v, [...r]];
        steps.push({
          phase: 'accept-reflect', lineIndex: 6,
          simplex: snap(pts), labels: { u, v, w: r }, centroid: [...c],
          proposal: { type: 'reflect', point: [...r], accepted: true },
          message: `f(u) ≤ f(r) < f(v): the reflected point improves on w. Replacing w ← r.`,
          iteration: iter, converged: false,
        });

      } else if (fr < fu) {
        // Reflection beats best — try expansion
        steps.push({
          phase: 'try-expand', lineIndex: 7,
          simplex: snap(pts), labels: { u, v, w }, centroid: [...c],
          proposal: { type: 'reflect', point: [...r] },
          message: `f(r) = ${fr.toFixed(4)} < f(u) = ${fu.toFixed(4)}: reflection beats the best point! Trying expansion.`,
          iteration: iter, converged: false,
        });

        const e = [c[0] + GAMMA * (r[0] - c[0]), c[1] + GAMMA * (r[1] - c[1])];
        const fe = f(e);

        steps.push({
          phase: 'expand', lineIndex: 8,
          simplex: snap(pts), labels: { u, v, w }, centroid: [...c],
          proposal: { type: 'expand', reflect: [...r], point: [...e] },
          message: `Expansion point e = c + γ(r − c) = (${e[0].toFixed(3)}, ${e[1].toFixed(3)}).`,
          iteration: iter, converged: false,
        });

        steps.push({
          phase: 'evaluate-e', lineIndex: 9,
          simplex: snap(pts), labels: { u, v, w }, centroid: [...c],
          proposal: { type: 'expand', reflect: [...r], point: [...e], value: fe },
          message: `f(e) = ${fe.toFixed(4)},  f(r) = ${fr.toFixed(4)}.`,
          iteration: iter, converged: false,
        });

        if (fe < fr) {
          pts = [u, v, [...e]];
          steps.push({
            phase: 'accept-expand', lineIndex: 10,
            simplex: snap(pts), labels: { u, v, w: e }, centroid: [...c],
            proposal: { type: 'expand', point: [...e], accepted: true },
            message: `f(e) = ${fe.toFixed(4)} < f(r): expansion accepted. Replacing w ← e.`,
            iteration: iter, converged: false,
          });
        } else {
          pts = [u, v, [...r]];
          steps.push({
            phase: 'reject-expand', lineIndex: 11,
            simplex: snap(pts), labels: { u, v, w: r }, centroid: [...c],
            proposal: { type: 'reflect', point: [...r], accepted: true },
            message: `f(e) ≥ f(r): expansion didn't improve further. Replacing w ← r instead.`,
            iteration: iter, converged: false,
          });
        }

      } else {
        // f(r) >= f(v) — dual contraction
        steps.push({
          phase: 'try-contract', lineIndex: 12,
          simplex: snap(pts), labels: { u, v, w }, centroid: [...c],
          proposal: { type: 'reflect', point: [...r] },
          message: `f(r) = ${fr.toFixed(4)} ≥ f(v) = ${fv.toFixed(4)}: reflection not helpful. Trying contraction.`,
          iteration: iter, converged: false,
        });

        // p₁ = midpoint(w, c)  [inside contraction, ¼ of the way from w to r]
        // p₂ = midpoint(c, r)  [outside contraction, ¾ of the way from w to r]
        const p1 = [(w[0] + c[0]) / 2, (w[1] + c[1]) / 2];
        const p2 = [(c[0] + r[0]) / 2, (c[1] + r[1]) / 2];
        const fp1 = f(p1), fp2 = f(p2);

        steps.push({
          phase: 'contract', lineIndex: 13,
          simplex: snap(pts), labels: { u, v, w }, centroid: [...c],
          proposal: { type: 'contract', p1: [...p1], p2: [...p2] },
          message: `p₁ = (w+c)/2 = (${p1[0].toFixed(3)}, ${p1[1].toFixed(3)});  p₂ = (c+r)/2 = (${p2[0].toFixed(3)}, ${p2[1].toFixed(3)}).`,
          iteration: iter, converged: false,
        });

        steps.push({
          phase: 'evaluate-contract', lineIndex: 14,
          simplex: snap(pts), labels: { u, v, w }, centroid: [...c],
          proposal: { type: 'contract', p1: [...p1], p2: [...p2], fp1, fp2 },
          message: `f(p₁) = ${fp1.toFixed(4)},  f(p₂) = ${fp2.toFixed(4)},  f(v) = ${fv.toFixed(4)}.`,
          iteration: iter, converged: false,
        });

        const bestFp = Math.min(fp1, fp2);
        if (bestFp < fv) {
          const usep1 = fp1 <= fp2;
          const best  = usep1 ? p1 : p2;
          const bName = usep1 ? 'p₁' : 'p₂';
          pts = [u, v, [...best]];
          steps.push({
            phase: 'accept-contract', lineIndex: 15,
            simplex: snap(pts), labels: { u, v, w: best }, centroid: [...c],
            proposal: { type: 'contract', p1: [...p1], p2: [...p2], fp1, fp2, accepted: bName },
            message: `min(f(p₁), f(p₂)) = ${bestFp.toFixed(4)} < f(v): accepting ${bName}. Replacing w ← ${bName}.`,
            iteration: iter, converged: false,
          });
        } else {
          const newV = [u[0] + SIGMA * (v[0] - u[0]), u[1] + SIGMA * (v[1] - u[1])];
          const newW = [u[0] + SIGMA * (w[0] - u[0]), u[1] + SIGMA * (w[1] - u[1])];
          pts = [u, newV, newW];
          steps.push({
            phase: 'shrink', lineIndex: 16,
            simplex: snap(pts), labels: { u, v: newV, w: newW }, centroid: [...c],
            proposal: null,
            message: `Neither contraction point beats f(v). Shrinking all vertices toward u.`,
            iteration: iter, converged: false,
          });
        }
      }

      // Convergence check
      const fVals = pts.map(p => f(p));
      const fMean = fVals.reduce((a, b) => a + b, 0) / 3;
      const fStd  = Math.sqrt(fVals.reduce((s, fi) => s + (fi - fMean) ** 2, 0) / 3);
      const converged = fStd < TOL;

      steps.push({
        phase: converged ? 'converged' : 'convergence-check',
        lineIndex: 17,
        simplex: snap(pts), labels: null, centroid: null, proposal: null,
        message: converged
          ? `Converged after ${iter} iteration${iter === 1 ? '' : 's'}! Minimum ≈ (${pts[0][0].toFixed(4)}, ${pts[0][1].toFixed(4)}),  f ≈ ${f(pts[0]).toExponential(3)}.`
          : `Not yet converged (σ_f = ${fStd.toExponential(2)}). Continuing…`,
        iteration: iter, converged,
      });

      if (converged) break;

      steps.push({
        phase: 'repeat', lineIndex: 18,
        simplex: snap(pts), labels: null, centroid: null, proposal: null,
        message: `Starting iteration ${iter + 1}.`,
        iteration: iter, converged: false,
      });
    }

    return steps;
  }

  // ─── State ────────────────────────────────────────────────────────────────
  let allSteps  = generateSteps(INITIAL_SIMPLEX);
  let stepIndex = 0;
  let playTimer = null;
  let stepSpeed = 200; // ms

  // ─── DOM refs ─────────────────────────────────────────────────────────────
  const btnBack    = document.getElementById('nm-btn-back');
  const btnNext    = document.getElementById('nm-btn-next');
  const btnPlay    = document.getElementById('nm-btn-play');
  const btnPause   = document.getElementById('nm-btn-pause');
  const btnReset   = document.getElementById('nm-btn-reset');
  const speedInput = document.getElementById('nm-speed');
  const msgEl      = document.getElementById('nm-message');
  const iterEl     = document.getElementById('nm-iter');
  const codeLines  = document.querySelectorAll('.nm-code-line');
  const vizEl      = document.getElementById('nm-viz');

  // ─── Visualization setup ─────────────────────────────────────────────────
  const MARGIN = { top: 24, right: 24, bottom: 40, left: 44 };
  // viewBox dimensions — SVG scales via CSS
  const VB_W = 520, VB_H = 420;
  const INNER_W = VB_W - MARGIN.left - MARGIN.right;
  const INNER_H = VB_H - MARGIN.top - MARGIN.bottom;

  // Data domain
  const X_DOM = [-4, 6];
  const Y_DOM = [-5, 5];

  function xPx(x) { return MARGIN.left + ((x - X_DOM[0]) / (X_DOM[1] - X_DOM[0])) * INNER_W; }
  function yPx(y) { return MARGIN.top  + ((Y_DOM[1] - y) / (Y_DOM[1] - Y_DOM[0])) * INNER_H; }

  // Build the SVG skeleton
  const svgNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs = {}) {
    const e = document.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }

  const svg = el('svg', {
    viewBox: `0 0 ${VB_W} ${VB_H}`,
    'aria-label': 'Nelder-Mead algorithm visualization',
    role: 'img',
  });
  vizEl.appendChild(svg);

  // ── Clip path
  const defs = el('defs');
  const clipPath = el('clipPath', { id: 'nm-plot-clip' });
  clipPath.appendChild(el('rect', {
    x: MARGIN.left, y: MARGIN.top, width: INNER_W, height: INNER_H,
  }));
  defs.appendChild(clipPath);
  svg.appendChild(defs);

  // ── Background rect
  svg.appendChild(el('rect', {
    x: MARGIN.left, y: MARGIN.top, width: INNER_W, height: INNER_H,
    fill: '#161616',
  }));

  // ── Contour layer (built once)
  const contourGroup = el('g', { 'clip-path': 'url(#nm-plot-clip)' });
  svg.appendChild(contourGroup);

  // ── Axes group
  const axesGroup = el('g');
  svg.appendChild(axesGroup);

  // ── Guide layer (dashed lines, arrows) — below simplex
  const guideGroup = el('g', { 'clip-path': 'url(#nm-plot-clip)' });
  svg.appendChild(guideGroup);

  // ── Simplex layer
  const simplexGroup = el('g', { 'clip-path': 'url(#nm-plot-clip)' });
  svg.appendChild(simplexGroup);

  // ── Marker layer (centroid, proposals)
  const markerGroup = el('g', { 'clip-path': 'url(#nm-plot-clip)' });
  svg.appendChild(markerGroup);

  // ── Label layer
  const labelGroup = el('g', { 'clip-path': 'url(#nm-plot-clip)' });
  svg.appendChild(labelGroup);

  // Arrow marker def
  const arrowMarker = el('marker', {
    id: 'nm-arrow', markerWidth: '8', markerHeight: '8',
    refX: '6', refY: '3', orient: 'auto',
  });
  arrowMarker.appendChild(el('path', {
    d: 'M0,0 L0,6 L8,3 z',
    fill: 'rgba(227,181,5,0.7)',
  }));
  defs.appendChild(arrowMarker);

  const arrowAccepted = el('marker', {
    id: 'nm-arrow-ok', markerWidth: '8', markerHeight: '8',
    refX: '6', refY: '3', orient: 'auto',
  });
  arrowAccepted.appendChild(el('path', {
    d: 'M0,0 L0,6 L8,3 z',
    fill: 'rgba(100,220,100,0.8)',
  }));
  defs.appendChild(arrowAccepted);

  // ─── Build contour plot (D3 required) ─────────────────────────────────────
  function buildContours() {
    if (!window.d3) return;

    const N = 120;
    const values = new Float64Array(N * N);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = X_DOM[0] + (i / (N - 1)) * (X_DOM[1] - X_DOM[0]);
        const y = Y_DOM[1] - (j / (N - 1)) * (Y_DOM[1] - Y_DOM[0]);
        values[j * N + i] = f([x, y]);
      }
    }

    // f ranges from ≈ −9.49 (global min near (2.5,0)) to ≈ 0 at the domain edges.
    // Dense thresholds near the minimum, sparser toward 0.
    const thresholds = [-9, -8, -7, -6, -5, -4, -3, -2, -1.5, -1, -0.75, -0.5, -0.25, -0.1];

    const contours = d3.contours().size([N, N]).thresholds(thresholds)(values);

    // Color: warm gold at minimum (most negative) → near-black at 0
    const colorFill = d3.scaleSequential()
      .domain([-9.5, 0])
      .interpolator(d3.interpolateRgb('#3a2800', '#141414'));

    const strokeColor = d3.scaleSequential()
      .domain([-9.5, 0])
      .interpolator(d3.interpolateRgb('rgba(227,181,5,0.65)', 'rgba(227,181,5,0.06)'));

    const geoTransform = d3.geoTransform({
      point(px, py) {
        this.stream.point(
          MARGIN.left + (px / N) * INNER_W,
          MARGIN.top  + (py / N) * INNER_H,
        );
      },
    });
    const path = d3.geoPath(geoTransform);

    d3.select(contourGroup).selectAll('path')
      .data(contours)
      .join('path')
      .attr('d', path)
      .attr('fill', d => colorFill(d.value))
      .attr('stroke', d => strokeColor(d.value))
      .attr('stroke-width', 0.7);
  }

  // ─── Build axes (pure manual SVG, no D3) ─────────────────────────────────
  function buildAxes() {
    // Border rect
    axesGroup.appendChild(el('rect', {
      x: MARGIN.left, y: MARGIN.top, width: INNER_W, height: INNER_H,
      fill: 'none', stroke: '#444', 'stroke-width': 1,
    }));

    // X axis ticks and labels
    for (let x = Math.ceil(X_DOM[0]); x <= X_DOM[1]; x++) {
      const px = xPx(x);
      axesGroup.appendChild(el('line', {
        x1: px, y1: MARGIN.top + INNER_H,
        x2: px, y2: MARGIN.top + INNER_H + 4,
        stroke: '#555', 'stroke-width': 1,
      }));
      const lbl = el('text', {
        x: px, y: MARGIN.top + INNER_H + 14,
        'text-anchor': 'middle', fill: '#666',
        'font-family': "'Space Mono',monospace", 'font-size': '9',
      });
      lbl.textContent = x;
      axesGroup.appendChild(lbl);
    }

    // Y axis ticks and labels
    for (let y = Math.ceil(Y_DOM[0]); y <= Y_DOM[1]; y++) {
      const py = yPx(y);
      axesGroup.appendChild(el('line', {
        x1: MARGIN.left - 4, y1: py,
        x2: MARGIN.left,     y2: py,
        stroke: '#555', 'stroke-width': 1,
      }));
      const lbl = el('text', {
        x: MARGIN.left - 7, y: py + 3,
        'text-anchor': 'end', fill: '#666',
        'font-family': "'Space Mono',monospace", 'font-size': '9',
      });
      lbl.textContent = y;
      axesGroup.appendChild(lbl);
    }

    // True minimum marker at (2.5, 0) — dashed ring
    const mx = xPx(2.5), my = yPx(0);
    const minGrp = el('g');
    minGrp.appendChild(el('circle', {
      cx: mx, cy: my, r: 4,
      fill: 'none', stroke: 'rgba(227,181,5,0.45)',
      'stroke-width': 1.5, 'stroke-dasharray': '3,2',
    }));
    const minLbl = el('text', {
      x: mx + 7, y: my - 5,
      fill: 'rgba(227,181,5,0.45)',
      'font-family': "'Space Mono',monospace", 'font-size': '9',
    });
    minLbl.textContent = 'min';
    minGrp.appendChild(minLbl);
    axesGroup.appendChild(minGrp);
  }

  // ─── Rendering helpers ────────────────────────────────────────────────────
  function clearGroup(g) { while (g.firstChild) g.removeChild(g.firstChild); }

  function drawX(g, [x, y], color, size = 7) {
    const px = xPx(x), py = yPx(y);
    g.appendChild(el('line', { x1: px - size, y1: py - size, x2: px + size, y2: py + size, stroke: color, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
    g.appendChild(el('line', { x1: px + size, y1: py - size, x2: px - size, y2: py + size, stroke: color, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
  }

  function drawCircle(g, [x, y], color, r = 5.5, glow = false) {
    const px = xPx(x), py = yPx(y);
    if (glow) {
      g.appendChild(el('circle', { cx: px, cy: py, r: r + 4, fill: color, opacity: 0.18 }));
    }
    g.appendChild(el('circle', { cx: px, cy: py, r, fill: color, stroke: '#1e1e1e', 'stroke-width': 1 }));
  }

  function drawDiamond(g, [x, y], color, size = 5) {
    const px = xPx(x), py = yPx(y);
    const pts = `${px},${py - size} ${px + size},${py} ${px},${py + size} ${px - size},${py}`;
    g.appendChild(el('polygon', { points: pts, fill: color, stroke: '#1e1e1e', 'stroke-width': 1 }));
  }

  function drawLabel(g, [x, y], text, color, dx = 9, dy = -7) {
    const lbl = el('text', {
      x: xPx(x) + dx, y: yPx(y) + dy,
      fill: color, 'font-family': "'Space Mono',monospace",
      'font-size': '11', 'font-weight': '700',
    });
    lbl.textContent = text;
    g.appendChild(lbl);
  }

  function drawArrow(g, from, to, color = 'rgba(227,181,5,0.7)', dashed = false) {
    const line = el('line', {
      x1: xPx(from[0]), y1: yPx(from[1]),
      x2: xPx(to[0]),   y2: yPx(to[1]),
      stroke: color, 'stroke-width': 1.5,
      'marker-end': `url(#nm-arrow)`,
    });
    if (dashed) line.setAttribute('stroke-dasharray', '5,3');
    g.appendChild(line);
  }

  function drawDashedLine(g, from, to, color = 'rgba(227,181,5,0.35)') {
    g.appendChild(el('line', {
      x1: xPx(from[0]), y1: yPx(from[1]),
      x2: xPx(to[0]),   y2: yPx(to[1]),
      stroke: color, 'stroke-width': 1, 'stroke-dasharray': '5,3',
    }));
  }

  // ─── Render a display step ─────────────────────────────────────────────────
  function render(step) {
    clearGroup(guideGroup);
    clearGroup(simplexGroup);
    clearGroup(markerGroup);
    clearGroup(labelGroup);

    const { simplex, labels, centroid, proposal, phase } = step;

    // ── Triangle
    const triPts = simplex.map(([x, y]) => `${xPx(x)},${yPx(y)}`).join(' ');
    simplexGroup.appendChild(el('polygon', {
      points: triPts,
      fill: 'rgba(227,181,5,0.06)',
      stroke: 'rgba(227,181,5,0.6)',
      'stroke-width': 1.6,
    }));

    // ── Vertex markers
    if (labels) {
      // u — best (gold circle, glow)
      drawCircle(simplexGroup, labels.u, '#e3b505', 5.5, true);
      drawLabel(labelGroup, labels.u, 'u', '#e3b505');

      // v — second (muted circle)
      drawCircle(simplexGroup, labels.v, '#a07c00', 5);
      drawLabel(labelGroup, labels.v, 'v', '#a07c00');

      // w — worst (X, red-orange)
      drawX(simplexGroup, labels.w, '#d45f00', 7);
      drawLabel(labelGroup, labels.w, 'w', '#d45f00');
    } else {
      // Unlabeled initialization / convergence: draw plain dots
      for (const pt of simplex) {
        drawCircle(simplexGroup, pt, '#a08030', 5);
      }
    }

    // ── Centroid
    if (centroid) {
      drawDiamond(markerGroup, centroid, '#7eccb8', 5);
      drawLabel(labelGroup, centroid, 'c', '#7eccb8', 9, -7);
    }

    // ── Proposal points and guide lines
    if (proposal) {
      const { type, point, reflect, accepted, value } = proposal;

      if (type === 'reflect') {
        if (labels) drawArrow(guideGroup, labels.w, point, 'rgba(227,181,5,0.6)', true);
        if (accepted) {
          drawCircle(markerGroup, point, '#4fc97e', 5.5, true);
          drawLabel(labelGroup, point, 'r ✓', '#4fc97e');
        } else {
          drawCircle(markerGroup, point, '#e3b505', 5);
          const lbl = value !== undefined ? `r=${value.toFixed(2)}` : 'r';
          drawLabel(labelGroup, point, lbl, '#e3b505');
        }
      }

      if (type === 'expand') {
        // Show reflection as ghost
        if (reflect) {
          drawCircle(markerGroup, reflect, 'rgba(227,181,5,0.5)', 4);
          drawLabel(labelGroup, reflect, 'r', 'rgba(227,181,5,0.6)');
          if (centroid) drawArrow(guideGroup, reflect, point, 'rgba(100,220,100,0.6)', true);
        }
        if (accepted) {
          drawCircle(markerGroup, point, '#4fc97e', 5.5, true);
          drawLabel(labelGroup, point, 'e ✓', '#4fc97e');
        } else {
          drawCircle(markerGroup, point, '#70e080', 5);
          const lbl = value !== undefined ? `e=${value.toFixed(2)}` : 'e';
          drawLabel(labelGroup, point, lbl, '#70e080');
        }
      }

      if (type === 'contract') {
        const { p1, p2, fp1, fp2, accepted } = proposal;
        // Dashed guide from w toward c
        if (labels && centroid) drawDashedLine(guideGroup, labels.w, centroid, 'rgba(180,120,50,0.38)');

        function drawContractPt(pt, fp, name, baseColor) {
          if (!pt) return;
          const isWinner = accepted === name;
          const isLoser  = accepted && !isWinner;
          if (isWinner) {
            drawDiamond(markerGroup, pt, '#4fc97e', 5);
            drawLabel(labelGroup, pt, name + ' ✓', '#4fc97e');
          } else {
            const lbl = fp !== undefined ? `${name}=${fp.toFixed(2)}` : name;
            drawDiamond(markerGroup, pt, isLoser ? 'rgba(192,128,64,0.45)' : baseColor, 5);
            drawLabel(labelGroup, pt, lbl, isLoser ? 'rgba(192,128,64,0.55)' : baseColor);
          }
        }

        drawContractPt(p1, fp1, 'p₁', '#c08040');  // inside  — between w and c
        drawContractPt(p2, fp2, 'p₂', '#d09050');  // outside — between c and r
      }
    }
  }

  // ─── Pseudocode highlight ─────────────────────────────────────────────────
  function highlightLine(idx) {
    codeLines.forEach((line, i) => {
      line.classList.toggle('nm-code-active', i === idx);
    });
  }

  // ─── UI update ────────────────────────────────────────────────────────────
  function applyStep(idx) {
    const step = allSteps[idx];
    render(step);
    highlightLine(step.lineIndex);
    if (msgEl) msgEl.textContent = step.message;
    if (iterEl) iterEl.textContent = step.iteration > 0
      ? `Iteration ${step.iteration}  ·  Step ${idx + 1} / ${allSteps.length}`
      : `Step ${idx + 1} / ${allSteps.length}`;

    btnBack.disabled  = idx === 0;
    btnNext.disabled  = idx >= allSteps.length - 1 || step.converged;
    btnPlay.disabled  = idx >= allSteps.length - 1 || step.converged || playTimer !== null;
    btnPause.disabled = playTimer === null;
  }

  function stopPlay() {
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    btnPlay.disabled  = stepIndex >= allSteps.length - 1 || allSteps[stepIndex].converged;
    btnPause.disabled = true;
  }

  function scheduleNext() {
    playTimer = setTimeout(() => {
      playTimer = null;
      if (stepIndex < allSteps.length - 1 && !allSteps[stepIndex].converged) {
        stepIndex++;
        applyStep(stepIndex);
        if (!allSteps[stepIndex].converged && stepIndex < allSteps.length - 1) {
          scheduleNext();
        } else {
          stopPlay();
        }
      } else {
        stopPlay();
      }
    }, Math.max(50, Math.min(5000, stepSpeed)));
  }

  // ─── Event listeners ──────────────────────────────────────────────────────
  btnNext.addEventListener('click', () => {
    stopPlay();
    if (stepIndex < allSteps.length - 1 && !allSteps[stepIndex].converged) {
      stepIndex++;
      applyStep(stepIndex);
    }
  });

  btnBack.addEventListener('click', () => {
    stopPlay();
    if (stepIndex > 0) {
      stepIndex--;
      applyStep(stepIndex);
    }
  });

  btnPlay.addEventListener('click', () => {
    if (stepIndex >= allSteps.length - 1 || allSteps[stepIndex].converged) return;
    btnPlay.disabled  = true;
    btnPause.disabled = false;
    scheduleNext();
  });

  btnPause.addEventListener('click', stopPlay);

  btnReset.addEventListener('click', () => {
    stopPlay();
    allSteps   = generateSteps(INITIAL_SIMPLEX);
    stepIndex  = 0;
    applyStep(0);
  });

  speedInput.addEventListener('change', () => {
    const v = parseInt(speedInput.value, 10);
    stepSpeed = isNaN(v) || v < 50 ? 200 : Math.min(v, 5000);
    speedInput.value = stepSpeed;
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight' || e.key === 'l') btnNext.click();
    if (e.key === 'ArrowLeft'  || e.key === 'h') btnBack.click();
    if (e.key === ' ') {
      e.preventDefault();
      if (playTimer) btnPause.click(); else btnPlay.click();
    }
  });

  // ─── Init ─────────────────────────────────────────────────────────────────
  buildContours();
  buildAxes();
  applyStep(0);

})();
