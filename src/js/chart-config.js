const vw = Math.max(
  document.documentElement.clientWidth || 0,
  window.innerWidth || 0
);
var gridUnit = 0.92 * 0.25 * vw;
var chartWidth = vw;
var chartHeight = vw * 0.5;
var margin = {
  top: chartWidth * 0.1,
  bottom: chartWidth * 0.1,
  left: chartWidth * 0.125 + 0.04 * vw,
  right: chartWidth * 0.125 + 0.03 * vw,
};
var numTicks = 2;

if (vw > 1200) {
  gridUnit = 100;
  chartWidth = gridUnit * 12;
  chartHeight = gridUnit * 3 + 76;
  margin = {
    top: 76,
    bottom: gridUnit,
    left: gridUnit,
    right: gridUnit,
  };
  numTicks = 10;
} else if (vw > 992) {
  gridUnit = 83;
  chartWidth = gridUnit * 12;
  chartHeight = gridUnit * 4 + 8;
  margin = {
    top: 32 + 8,
    bottom: gridUnit,
    left: gridUnit,
    right: gridUnit,
  };
  numTicks = 10;
} else if (vw > 768) {
  gridUnit = 96;
  chartWidth = gridUnit * 8;
  chartHeight = gridUnit * 3 + 60;
  margin = {
    top: 60,
    bottom: gridUnit,
    left: gridUnit,
    right: gridUnit,
  };
  numTicks = 10;
} else if (vw > 576) {
  gridUnit = 96;
  chartWidth = gridUnit * 6;
  chartHeight = gridUnit * 3 + 60;
  margin = {
    top: 60,
    bottom: gridUnit,
    left: gridUnit,
    right: gridUnit,
  };
  numTicks = 10;
}

export { gridUnit, chartWidth, chartHeight, margin, numTicks };
