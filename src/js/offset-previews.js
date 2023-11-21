import { gridUnit, chartHeight } from "./chart-config.js";

export function offsetPreviews() {
  var projectPreviews = document.getElementById("project-previews");
  var projectPreviewsRect = projectPreviews.getBoundingClientRect();
  var wrapperRect = document.getElementById("wrapper").getBoundingClientRect();

  var offset =
    (projectPreviewsRect.top + chartHeight - wrapperRect.top - 5) % gridUnit;

  projectPreviews.style.marginTop = (gridUnit - offset - 5).toString() + "px";
}
