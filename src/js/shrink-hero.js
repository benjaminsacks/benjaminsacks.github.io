const hero = document.getElementById("hero");

export function shrinkHero() {
  const newSize = 4 - window.scrollY * 0.011;
  if (newSize > 2.5) {
    hero.style.fontSize = newSize + "rem";
  } else {
    hero.style.fontSize = "2.5rem";
  }
  console.log(window.scrollY);
  console.log(hero.style.fontSize);
}
