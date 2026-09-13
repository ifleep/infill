// Live search inside the header overlay — ported from
// src/components/search/search-overlay.tsx. Uses WooCommerce's own public
// Store API (no custom search backend) for product matches, and the WP REST
// API for the product_brand taxonomy (registered with show_in_rest => true).

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".js-search-input");
  const popular = document.querySelector(".js-search-popular");
  const emptyMsg = document.querySelector(".js-search-empty");
  const brandsWrap = document.querySelector(".js-search-brands");
  const brandsList = document.querySelector(".js-search-brands-list");
  const productsList = document.querySelector(".js-search-products");
  if (!input) return;

  document.querySelectorAll(".js-search-suggestion").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.textContent.trim();
      input.dispatchEvent(new Event("input"));
      input.focus();
    });
  });

  input.addEventListener("keydown", (event) => {
    const q = input.value.trim();
    if (event.key === "Enter" && q) {
      window.location.href = `${window.location.origin}/?s=${encodeURIComponent(q)}&post_type=product`;
    }
  });

  async function runSearch(q) {
    const [productsRes, brandsRes] = await Promise.all([
      fetch(`/wp-json/wc/store/v1/products?search=${encodeURIComponent(q)}&per_page=6`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/wp-json/wp/v2/product_brand?search=${encodeURIComponent(q)}&per_page=4`).then((r) => (r.ok ? r.json() : [])),
    ]).catch(() => [[], []]);

    renderResults(productsRes || [], brandsRes || []);
  }

  function renderResults(products, brands) {
    const hasResults = products.length > 0 || brands.length > 0;

    emptyMsg.classList.toggle("hidden", hasResults || !input.value.trim());
    if (!hasResults && input.value.trim()) {
      emptyMsg.textContent = `No matches for "${input.value.trim()}" yet — try a broader term.`;
    }

    brandsWrap.classList.toggle("hidden", brands.length === 0);
    brandsList.innerHTML = "";
    for (const brand of brands) {
      const a = document.createElement("a");
      a.href = brand.link;
      a.className = "focus-ring rounded-full bg-surface-sunken px-3.5 py-1.5 text-sm text-ink hover:bg-blue-50";
      a.textContent = brand.name;
      brandsList.appendChild(a);
    }

    productsList.classList.toggle("hidden", products.length === 0);
    productsList.innerHTML = "";
    for (const product of products) {
      const li = document.createElement("li");
      const category = product.categories && product.categories[0] ? product.categories[0].name : "";
      li.innerHTML = `
        <a href="${product.permalink}" class="focus-ring flex items-center justify-between gap-4 py-3 hover:text-blue-700">
          <span>
            <span class="block text-sm font-medium text-ink">${product.name}</span>
          </span>
          <span class="text-xs uppercase tracking-wide text-ink-faint">${category}</span>
        </a>`;
      productsList.appendChild(li);
    }
  }

  const debouncedSearch = debounce((q) => runSearch(q), 250);

  input.addEventListener("input", () => {
    const q = input.value.trim();
    popular.classList.toggle("hidden", q.length > 0);

    if (!q) {
      emptyMsg.classList.add("hidden");
      brandsWrap.classList.add("hidden");
      productsList.classList.add("hidden");
      return;
    }
    debouncedSearch(q);
  });
});
