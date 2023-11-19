Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};
var dataset = ["bigfoot_sightings.csv", "ufo_sightings.csv"].sample();

document.addEventListener("DOMContentLoaded", function () {
  // const rem = getComputedStyle(document.body).getPropertyValue("font-size");
  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
  var chartWidth = vw;
  var chartHeight = chartWidth * 0.5;
  var margin = {
    top: chartWidth * 0.1,
    bottom: chartWidth * 0.1,
    left: chartWidth * 0.125 + 0.04*vw,
    right: chartWidth * 0.125 + 0.04*vw,
  };
  var numTicks = 2;

  if (vw > 1200) {
    chartWidth = 100 * 12;
    chartHeight = 100 * 3 + 76;
    margin = {
      top: 76,
      bottom: 100,
      left: 100,
      right: 100,
    };
    numTicks = 10;
  } else if (vw > 992) {
    chartWidth = 83 * 12;
    chartHeight = 83 * 4 + 8;
    margin = {
      top: 32 + 8,
      bottom: 83,
      left: 83,
      right: 83,
    };
    numTicks = 10;
  } else if (vw > 768) {
    chartWidth = 96 * 8;
    chartHeight = 96 * 3 + 60;
    margin = {
      top: 60,
      bottom: 96,
      left: 96,
      right: 96,
    };
    numTicks = 10;
  } else if (vw > 576) {
    chartWidth = 96 * 6;
    chartHeight = 96 * 3 + 60;
    margin = {
      top: 60,
      bottom: 96,
      left: 96,
      right: 96,
    };
    numTicks = 10;
  }

  d3.csv("datasets//" + dataset).then(function (data) {
    // Create SVG and padding for the chart
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("height", chartHeight)
      .attr("width", chartWidth);
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const grp = chart
      .append("g")
      .attr("transform", `translate(-${margin.left},-${margin.top})`);

    // Create scales
    const yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, (dataPoint) => parseInt(dataPoint.count))]);
    const xScale = d3
      .scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, (dataPoint) => dataPoint.year));

    const line = d3
      .line()
      .x((dataPoint) => xScale(dataPoint.year))
      .y((dataPoint) => yScale(dataPoint.count) + margin.top);

    // Add path
    const path = grp
      .append("path")
      .attr("transform", `translate(${margin.left},0)`)
      .datum(data)
      .attr("class", "chartLine")
      .attr("stroke-width", 3)
      .attr("d", line);

    const pathLength = path.node().getTotalLength();
    // D3 provides lots of transition options, have a play around here:
    // https://github.com/d3/d3-transition
    const transitionPath = d3.transition().ease(d3.easeSin).duration(8000);

    path
      .attr("stroke-dashoffset", pathLength)
      .attr("stroke-dasharray", pathLength)
      .transition(transitionPath)
      .attr("stroke-dashoffset", 0);

    // Add the X Axis
    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("class", "chart-axis")
      .style("font-size", "1rem")
      .call(d3.axisBottom(xScale).ticks(numTicks).tickFormat(d3.format("d")));

    // Add the Y Axis
    const maxCount = d3.max(data, (dataPoint) => parseInt(dataPoint.count));
    var maxTick = Math.floor((maxCount * 0.95) / 100) * 100;
    chart
      .append("g")
      .attr("transform", `translate(0, 0)`)
      .attr("class", "chart-axis")
      .style("font-size", "1rem")
      .call(d3.axisLeft(yScale).ticks(2).tickValues([0, maxTick]));

    chart
      .append("text")
      .attr("class", "ylabel")
      .attr("text-anchor", "end")
      .attr("y", "-1em")
      .attr("x", chartWidth - 2 * margin.right)
      // .attr("transform", "rotate(90)")
      // .style("font-size", 18)
      .text(dataset);
  });
});

// window.onresize = function () {
//   location.reload();
// };
