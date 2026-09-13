// Pakistan regions map: click/hover a region to reveal its panel.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".js-pakistan-map").forEach((map) => {
    const regions = map.querySelectorAll(".js-pakistan-region");
    const panels = map.querySelectorAll(".js-pakistan-panel");

    function select(id) {
      panels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.regionPanel !== id);
      });
    }

    regions.forEach((region) => {
      const id = region.dataset.region;
      region.addEventListener("click", () => select(id));
      region.addEventListener("mouseenter", () => select(id));
      region.addEventListener("focus", () => select(id));
      region.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select(id);
        }
      });
    });
  });
});
