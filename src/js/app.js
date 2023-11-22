import { heroChart } from "./chart.js";
import { offsetPreviews } from "./offset-previews.js";
import { importHTML } from "./import-html.js";

document.addEventListener("DOMContentLoaded", function () {
  heroChart();
  offsetPreviews();
});

window.onresize = function () {
  location.reload();
};

importHTML("cases-icon");
importHTML("camera-icon");
importHTML("smile-icon");
importHTML("doc-icon");
