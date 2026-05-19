(function () {
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function buildToc() {
    const content = document.getElementById("termsContent");
    const toc = document.getElementById("termsTocList");
    if (!content || !toc) return;

    const headings = content.querySelectorAll("h2, h3");
    if (!headings.length) return;

    const used = new Set();
    const frag = document.createDocumentFragment();

    headings.forEach((h) => {
      const text = (h.textContent || "").trim();
      if (!text) return;

      let id = h.id ? h.id : slugify(text);
      if (!id) return;

      // Make unique if repeated headings exist
      let uniqueId = id;
      let i = 2;
      while (used.has(uniqueId) || document.getElementById(uniqueId)) {
        uniqueId = `${id}-${i++}`;
      }
      used.add(uniqueId);
      h.id = uniqueId;

      const a = document.createElement("a");
      a.href = `#${uniqueId}`;
      a.textContent = text;
      a.dataset.level = h.tagName.toLowerCase();

      // indent h3 slightly
      if (h.tagName.toLowerCase() === "h3") {
        a.style.paddingLeft = "18px";
        a.style.opacity = "0.95";
      }

      frag.appendChild(a);
    });

    toc.innerHTML = "";
    toc.appendChild(frag);

    // Active link on scroll
    const links = Array.from(toc.querySelectorAll("a"));
    const targets = links
      .map((l) => document.getElementById(l.getAttribute("href").slice(1)))
      .filter(Boolean);

    const setActive = (id) => {
      links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`));
    };

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible && visible.target && visible.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: [0.05, 0.2, 0.6] }
    );

    targets.forEach((t) => obs.observe(t));
  }

  function setupMobileToggle() {
    const btn = document.querySelector(".terms-toc__toggle");
    const list = document.getElementById("termsTocList");
    if (!btn || !list) return;

    btn.addEventListener("click", () => {
      const open = list.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close after click on a link (mobile)
    list.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      if (window.matchMedia("(max-width: 990px)").matches) {
        list.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildToc();
    setupMobileToggle();
  });
})();
