// import { shrinkHero } from "./shrink-hero.js";
import { heroChart } from "./chart.js";
import { offsetPreviews } from "./offset-previews.js";
import { importHTML } from "./import-html.js";

document.addEventListener("DOMContentLoaded", function () {
  // shrinkHero();
  heroChart();
  offsetPreviews();
});

window.onresize = function () {
  location.reload();
};
// window.onscroll = shrinkHero;

importHTML("cases-icon");
importHTML("camera-icon");
importHTML("smile-icon");
importHTML("doc-icon");
