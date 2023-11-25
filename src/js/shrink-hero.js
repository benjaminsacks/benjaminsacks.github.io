var rootFontSize = parseFloat(
  getComputedStyle(document.documentElement).fontSize
);
const hero = document.getElementById("hero");
const grid_row = document.getElementById("grid-row-rect");

export function shrinkHero() {
  const newSize = 4 - window.scrollY * 0.011;
  if (newSize > 2.5) {
    hero.style.fontSize = newSize + "rem";
    grid_row.style.height = 200 - newSize * rootFontSize - 24 + "px";
  } else {
    hero.style.fontSize = "2.5rem";
  }
  console.log(window.scrollY);
  console.log(hero.style.fontSize);
  console.log(grid_row.style.height);
}
