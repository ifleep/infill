// Header interactions: mobile nav slide-in (with accordion), search overlay toggle.
document.addEventListener("DOMContentLoaded", () => {
  // ---- Mobile nav ----
  const mobileToggle = document.querySelector(".js-mobile-nav-toggle");
  const mobileRoot = document.querySelector(".js-mobile-nav-root");
  const mobilePanel = document.querySelector(".js-mobile-nav-panel");
  const mobileBackdrop = document.querySelector(".js-mobile-nav-backdrop");
  const mobileClose = document.querySelector(".js-mobile-nav-close");

  function openMobileNav() {
    if (!mobileRoot || !mobilePanel) return;
    mobileRoot.classList.remove("hidden");
    requestAnimationFrame(() => mobilePanel.classList.remove("-translate-x-full"));
    mobileToggle?.setAttribute("aria-expanded", "true");
  }
  function closeMobileNav() {
    if (!mobileRoot || !mobilePanel) return;
    mobilePanel.classList.add("-translate-x-full");
    mobileToggle?.setAttribute("aria-expanded", "false");
    setTimeout(() => mobileRoot.classList.add("hidden"), 300);
  }

  mobileToggle?.addEventListener("click", openMobileNav);
  mobileClose?.addEventListener("click", closeMobileNav);
  mobileBackdrop?.addEventListener("click", closeMobileNav);

  document.querySelectorAll(".js-mobile-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.parentElement.querySelector(".js-mobile-panel");
      const caret = btn.querySelector(".js-mobile-toggle-caret");
      const isOpen = panel && !panel.classList.contains("hidden");
      panel?.classList.toggle("hidden", isOpen);
      caret?.classList.toggle("rotate-90", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // ---- Search overlay ----
  const searchToggle = document.querySelector(".js-search-toggle");
  const searchOverlay = document.querySelector(".js-search-overlay");
  const searchBackdrop = document.querySelector(".js-search-backdrop");
  const searchClose = document.querySelector(".js-search-close");
  const searchInput = document.querySelector(".js-search-input");

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove("hidden");
    setTimeout(() => searchInput?.focus(), 50);
  }
  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add("hidden");
    if (searchInput) searchInput.value = "";
    searchInput?.dispatchEvent(new Event("input"));
  }

  searchToggle?.addEventListener("click", openSearch);
  searchClose?.addEventListener("click", closeSearch);
  searchBackdrop?.addEventListener("click", closeSearch);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (searchOverlay && !searchOverlay.classList.contains("hidden")) closeSearch();
    if (mobileRoot && !mobileRoot.classList.contains("hidden")) closeMobileNav();
  });
});
