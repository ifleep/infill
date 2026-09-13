// Header interactions: mobile nav toggle, search overlay toggle.
document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.querySelector(".js-mobile-nav-toggle");
  const mobileNav = document.querySelector(".js-mobile-nav");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = !mobileNav.classList.contains("hidden");
      mobileNav.classList.toggle("hidden", isOpen);
      mobileToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  const searchToggle = document.querySelector(".js-search-toggle");
  const searchOverlay = document.querySelector(".js-search-overlay");
  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener("click", () => {
      searchOverlay.classList.remove("hidden");
      const input = searchOverlay.querySelector("input[type='search']");
      if (input) input.focus();
    });
    searchOverlay.addEventListener("click", (event) => {
      if (event.target === searchOverlay || event.target.closest(".js-search-close")) {
        searchOverlay.classList.add("hidden");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") searchOverlay.classList.add("hidden");
    });
  }
});
