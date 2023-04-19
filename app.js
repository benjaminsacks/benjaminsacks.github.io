document.addEventListener("DOMContentLoaded", function () {
  d3.csv("bigfoot_sightings.csv").then(function (data) {
    // Create SVG and padding for the chart
    const heightValue = 300;
    const widthValue = 1000;
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("viewBox", `0 0 ${widthValue} ${heightValue}`);
    const margin = {
      top: 0,
      bottom: 50,
      left: 70,
      right: 70,
    };
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`);
    const width = widthValue - margin.left - margin.right;
    const height = heightValue - margin.top - margin.bottom;
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
      .y((dataPoint) => yScale(dataPoint.count));

    const scaleFactor = widthValue / window.innerWidth;
    console.log("window.innerWidth:\t" + window.innerWidth);
    console.log("scaleFactor:\t\t" + scaleFactor);

    // Add path
    const path = grp
      .append("path")
      .attr("transform", `translate(${margin.left},0)`)
      .datum(data)
      .attr("class", "chartLine")
      .attr("stroke-width", 3 * scaleFactor)
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
      .attr("class", "axisOffWhite")
      .attr("stroke-width", 3 * scaleFactor)
      .style("font-size", 18 * scaleFactor)
      .call(d3.axisBottom(xScale).ticks(10 / scaleFactor));

    // Add the Y Axis
    chart
      .append("g")
      .attr("transform", `translate(0, 0)`)
      .attr("class", "axisOffWhite")
      .attr("stroke-width", 2 * scaleFactor)
      .style("font-size", 18 * scaleFactor)
      .call(d3.axisLeft(yScale).ticks(1));
  });
});

window.onresize = function () {
  location.reload();
};
