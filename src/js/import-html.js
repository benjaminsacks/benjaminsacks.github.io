export function importHTML(filename) {
  fetch("src/icons/" + filename + ".html")
    .then((response) => response.text())
    .then((html) => {
      document.getElementById(filename).innerHTML = html;
    })
    .catch((error) =>
      console.error(`Error fetching content from ${file}:`, error)
    );
}
