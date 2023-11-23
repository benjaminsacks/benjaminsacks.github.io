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

// TODO: modularize this b
const hero = document.getElementById("hero");

function handleScroll() {
  const newSize = 4 - window.scrollY * 0.011;
  if (newSize > 2.5) {
    hero.style.fontSize = newSize + "rem";
  } else {
    hero.style.fontSize = "2.5rem";
  }
  console.log(window.scrollY);
  console.log(hero.style.fontSize);
}

window.onscroll = handleScroll;
handleScroll();
