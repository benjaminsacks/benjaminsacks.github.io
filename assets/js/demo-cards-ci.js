(function demoCI() {
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const NON_SPADE_SUITS = ['♥', '♦', '♣'];
  const SPADE = '♠';
  const N_CARDS = 50;
  const P0 = 0.25;
  const MAX_SAMPLES = 50;

  const Z_TABLE = {
    80: 1.2816, 81: 1.3106, 82: 1.3408, 83: 1.3722, 84: 1.4051,
    85: 1.4395, 86: 1.4758, 87: 1.5141, 88: 1.5548, 89: 1.5982,
    90: 1.6449, 91: 1.6954, 92: 1.7507, 93: 1.8119, 94: 1.8808,
    95: 1.9600, 96: 2.0537, 97: 2.1701, 98: 2.3263, 99: 2.5758
  };

  let samples = [];
  let overwriteIndex = 0;
  let currentConfLevel = 0.95;
  let isAnimating = false;
  
  // DOM Elements
  const btnDrawTop = document.getElementById('btn-draw-top');
  const btnDraw = document.getElementById('btn-draw');
  const btnAdd50 = document.getElementById('btn-add-50');
  const btnClear = document.getElementById('btn-clear');
  const toggleTrueP = document.getElementById('toggle-true-p');
  const sliderConf = document.getElementById('slider-conf');
  const labelConf = document.getElementById('label-conf');
  const cardGrid = document.getElementById('card-grid');
  const statsTally = document.getElementById('stats-tally');
  const chartContainer = document.getElementById('chart-container');

  let tiles = [];

  // Initialize Tile Grid
  function initGrid() {
    cardGrid.innerHTML = '';
    tiles = [];
    for (let i = 0; i < N_CARDS; i++) {
      const tile = document.createElement('div');
      tile.className = 'card-tile';
      // Default placeholder before drawing
      tile.innerHTML = `<span style="opacity:0.2; font-size: 0.5em;">—</span>`;
      cardGrid.appendChild(tile);
      tiles.push(tile);
    }
  }

  function randomCard() {
    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    const isSpade = Math.random() < P0;
    const suit = isSpade ? SPADE : NON_SPADE_SUITS[Math.floor(Math.random() * NON_SPADE_SUITS.length)];
    return { rank, suit, isSpade };
  }

  function renderTile(tile, card) {
    const color = (card.suit === '♥' || card.suit === '♦') ? '#D62828' : 'var(--text)';
    tile.innerHTML = `<div style="color:${color}; display:flex; flex-direction:column; align-items:center; line-height:1.1;">
      <span style="font-size:0.9em">${card.rank}</span>
      <span style="font-size:1.3em">${card.suit}</span>
    </div>`;
  }

  function renderChart() {
    chartContainer.innerHTML = '';
    if (!window.d3) return;
    
    const width = chartContainer.clientWidth;
    const height = chartContainer.clientHeight;
    // margins adjusted for labels
    const margin = { top: 20, right: 30, bottom: 65, left: 65 };
    
    const svg = d3.select('#chart-container').append('svg')
      .attr('width', width)
      .attr('height', height);

    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
      .domain(d3.range(1, MAX_SAMPLES + 1))
      .range([height - margin.bottom, margin.top]) 
      .paddingInner(0.4)
      .paddingOuter(0.2);

    // Calculate Y axis ticks based on height to prevent overlap
    const maxTicks = Math.floor((height - margin.top - margin.bottom) / 15);
    const tickStep = Math.ceil(MAX_SAMPLES / maxTicks) || 1;
    const yTickValues = d3.range(1, MAX_SAMPLES + 1).filter(d => d % 5 === 0 || d === 1);

    const xAxis = d3.axisBottom(x).ticks(10);
    const yAxis = d3.axisLeft(y).tickValues(yTickValues);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.selectAll("text").attr("fill", "#e9e9e9").attr("font-family", "'Space Mono', monospace"))
      .call(g => g.selectAll("line").attr("stroke", "#333"))
      .call(g => g.select(".domain").attr("stroke", "#333"));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .call(g => g.selectAll("text").attr("fill", "#666").attr("font-family", "'Space Mono', monospace"))
      .call(g => g.selectAll("line").attr("stroke", "#333"))
      .call(g => g.select(".domain").attr("stroke", "#333"));

    // X Axis Label
    svg.append('text')
      .attr('x', margin.left + (width - margin.left - margin.right) / 2)
      .attr('y', height - 15)
      .attr('fill', '#e9e9e9')
      .attr('font-size', '12px')
      .attr('font-family', "'Space Mono', monospace")
      .attr('text-anchor', 'middle')
      .text('Proportion');

    // Y Axis Label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + (height - margin.top - margin.bottom) / 2))
      .attr('y', 20)
      .attr('fill', '#e9e9e9')
      .attr('font-size', '12px')
      .attr('font-family', "'Space Mono', monospace")
      .attr('text-anchor', 'middle')
      .text('Sample');

    // True P line
    if (toggleTrueP.checked) {
      svg.append('line')
        .attr('x1', x(P0)).attr('x2', x(P0))
        .attr('y1', margin.top).attr('y2', height - margin.bottom)
        .attr('stroke', '#e9e9e9')
        .attr('stroke-dasharray', '4,4')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    }

    // Draw CIs
    samples.forEach((samp, i) => {
      const cy = y(i + 1) + y.bandwidth() / 2;
      const color = (toggleTrueP.checked && !samp.containsP0) ? '#D62828' : '#e3b505';
      
      const tickH = Math.min(y.bandwidth(), 6);

      svg.append('line')
        .attr('x1', x(samp.lower)).attr('x2', x(samp.upper))
        .attr('y1', cy).attr('y2', cy)
        .attr('stroke', color)
        .attr('stroke-width', 2);
        
      svg.append('line')
        .attr('x1', x(samp.lower)).attr('x2', x(samp.lower))
        .attr('y1', cy - tickH/2).attr('y2', cy + tickH/2)
        .attr('stroke', color)
        .attr('stroke-width', 2);
        
      svg.append('line')
        .attr('x1', x(samp.upper)).attr('x2', x(samp.upper))
        .attr('y1', cy - tickH/2).attr('y2', cy + tickH/2)
        .attr('stroke', color)
        .attr('stroke-width', 2);
        
      svg.append('circle')
        .attr('cx', x(samp.phat))
        .attr('cy', cy)
        .attr('r', 2)
        .attr('fill', color);
    });
  }

  function updateTally(spadesCount) {
    if (spadesCount === '--') {
      statsTally.innerHTML = `Spades: -- / ${N_CARDS} &nbsp;|&nbsp; p̂ = NaN`;
    } else {
      const phat = spacesCountToPhat(spadesCount);
      statsTally.innerHTML = `Spades: ${spadesCount} / ${N_CARDS} &nbsp;|&nbsp; p̂ = ${phat.toFixed(3)}`;
    }
  }

  function spacesCountToPhat(spadesCount) {
    return spadesCount / N_CARDS;
  }

  function calculateSample(spadesCount) {
    const phat = spacesCountToPhat(spadesCount);
    const se = Math.sqrt((phat * (1 - phat)) / N_CARDS);
    const z = Z_TABLE[Math.round(currentConfLevel * 100)];
    
    let lower = Math.max(0, phat - z * se);
    let upper = Math.min(1, phat + z * se);
    
    if (phat === 0) {
      lower = 0;
      upper = z * Math.sqrt((P0 * (1-P0)) / N_CARDS);
    }
    
    const containsP0 = lower <= P0 && P0 <= upper;
    return { phat, lower, upper, containsP0, confLevel: currentConfLevel, z };
  }

  function recordSample(sampleObj) {
    if (samples.length < MAX_SAMPLES) {
      samples.push(sampleObj);
    } else {
      samples[overwriteIndex] = sampleObj;
      overwriteIndex = (overwriteIndex + 1) % MAX_SAMPLES;
    }
  }

  function replaceAllSamples(newSamples) {
    samples = newSamples;
    overwriteIndex = 0;
  }

  function setUIAccess(disabled) {
    btnDrawTop.disabled = disabled;
    btnDraw.disabled = disabled;
    btnAdd50.disabled = disabled;
    btnClear.disabled = disabled;
  }

  async function animateDraw() {
    if (isAnimating) return;
    isAnimating = true;
    setUIAccess(true);

    tiles.forEach(t => t.classList.remove('highlight-spade'));
    updateTally('--');

    const durationShuffle = 1000;
    const durationSettle = 1000;
    const fps = 15;
    const frameTime = 1000 / fps;
    
    const finalCards = [];
    let spadesCount = 0;
    for (let i = 0; i < N_CARDS; i++) {
      const c = randomCard();
      finalCards.push(c);
      if (c.isSpade) spadesCount++;
    }

    const startTime = performance.now();
    await new Promise(resolve => {
      const shuffleInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        if (elapsed > durationShuffle) {
          clearInterval(shuffleInterval);
          resolve();
        } else {
          tiles.forEach(t => renderTile(t, randomCard()));
        }
      }, frameTime);
    });

    const indices = Array.from({length: N_CARDS}, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const settleIntervalMs = durationSettle / N_CARDS;
    for (let i = 0; i < N_CARDS; i++) {
      const idx = indices[i];
      renderTile(tiles[idx], finalCards[idx]);
      await new Promise(r => setTimeout(r, settleIntervalMs));
    }

    tiles.forEach((t, i) => {
      if (finalCards[i].isSpade) t.classList.add('highlight-spade');
    });

    const s = calculateSample(spadesCount);
    recordSample(s);
    renderChart();
    updateTally(spadesCount);
    
    isAnimating = false;
    setUIAccess(false);
  }

  // Event Listeners
  btnDrawTop.addEventListener('click', animateDraw);
  btnDraw.addEventListener('click', animateDraw);
  
  btnAdd50.addEventListener('click', async () => {
    if (isAnimating) return;
    
    const newSamples = [];
    for (let i = 0; i < 49; i++) {
      let spades = 0;
      for (let j = 0; j < N_CARDS; j++) {
        if (Math.random() < P0) spades++;
      }
      newSamples.push(calculateSample(spades));
    }
    
    replaceAllSamples(newSamples);
    
    await animateDraw();
  });

  btnClear.addEventListener('click', () => {
    samples = [];
    overwriteIndex = 0;
    initGrid();
    updateTally('--');
    tiles.forEach(t => t.classList.remove('highlight-spade'));
    renderChart();
  });

  toggleTrueP.addEventListener('change', renderChart);

  function recomputeIntervals() {
    samples = samples.map(s => {
      const spadesCount = Math.round(s.phat * N_CARDS);
      return calculateSample(spadesCount);
    });
  }

  sliderConf.addEventListener('input', (e) => {
    currentConfLevel = parseInt(e.target.value, 10) / 100;
    labelConf.textContent = `Confidence level: ${e.target.value}%`;
    recomputeIntervals();
    renderChart();
  });

  window.addEventListener('resize', renderChart);

  // Kickoff
  initGrid();
  setTimeout(renderChart, 150);

})();
