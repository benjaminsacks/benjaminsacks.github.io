import { heroChart } from "./chart.js";
import { offsetPreviews } from "./offset-previews.js";

document.addEventListener("DOMContentLoaded", function () {
  heroChart();
  offsetPreviews();
});

window.onresize = function () {
  location.reload();
};
