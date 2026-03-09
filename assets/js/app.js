(function init() {
  // System core setup
  const container = document.getElementById('outerContainer');
  const viewport = document.getElementById('viewport');

  // Both container and viewport must exist for the grid logic
  if (!container || !viewport) return;

  // Core geometry logic
  function recalculateGrid() {
    // Container dimensions
    const computedStyle = window.getComputedStyle(container);
    const pxLeft = parseFloat(computedStyle.paddingLeft);
    const pxRight = parseFloat(computedStyle.paddingRight);
    const activeWidth = container.clientWidth - pxLeft - pxRight;

    // Determine columns based on current viewport width
    const tw = window.innerWidth;
    let cols = 4; // Mobile

    if (tw >= 1280) { // xl (large desktop)
      cols = 16;
    } else if (tw >= 1024) { // lg (desktop)
      cols = 12;
    } else if (tw >= 640) { // sm/md (tablet)
      cols = 8;
    }

    // Compute symmetric cell size
    const cellSize = Math.floor(activeWidth / cols);

    // Lock grid width to exact cell multiple to prevent partial lines on edges
    const gridWidth = cols * cellSize;

    // Inject CSS properties
    document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
    document.documentElement.style.setProperty('--grid-width', `${gridWidth}px`);
  }

  // Initial pass
  recalculateGrid();

  // Resize observation
  window.addEventListener('resize', recalculateGrid);

  // Parallax sub-system
  // Translates the background upwards slower than normal scroll speed (st)
  viewport.addEventListener('scroll', () => {
    const st = viewport.scrollTop;
    document.documentElement.style.setProperty('--bg-y', `${Math.floor(-st * 0.5)}px`);
  });
})();
