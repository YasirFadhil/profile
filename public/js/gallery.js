/*
  WWW/public/js/gallery.js
  Gallery-specific JavaScript:
  - Photo category filtering
  - Fade-in animations via IntersectionObserver
  - Accessibility helpers for filter buttons

  Note: Mobile navigation behavior is intentionally NOT handled here.
  Navigation is managed globally by /js/navigation.js loaded from the layout.
*/

(function () {
  // Utility constants for filter button classes (matches markup in gallery.astro)
  const BASE_FILTER_BTN_CLASS =
    "filter-btn px-6 py-3 rounded-full border transition-all duration-300 capitalize";
  const ACTIVE_FILTER_CLASS =
    "bg-gradient-to-r from-blue-500 to-violet-500 text-white border-transparent";
  const INACTIVE_FILTER_CLASS =
    "border-slate-600 text-slate-300 hover:border-blue-400 hover:text-blue-400";

  // Small helper to run code when DOM is ready
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    // FILTERING
    (function initFiltering() {
      const filterBtns = Array.from(document.querySelectorAll(".filter-btn"));
      const photoItems = Array.from(document.querySelectorAll(".photo-item"));
      const noPhotosMsg = document.getElementById("no-photos");

      if (!filterBtns.length || !photoItems.length) return;

      // Helper to set button active state
      function setActiveButton(activeBtn) {
        filterBtns.forEach((btn) => {
          // Reset to base + inactive
          btn.className = BASE_FILTER_BTN_CLASS + " " + INACTIVE_FILTER_CLASS;
        });

        if (activeBtn) {
          activeBtn.className =
            BASE_FILTER_BTN_CLASS + " " + ACTIVE_FILTER_CLASS;
        }
      }

      // Initially ensure the 'all' button is active if present
      const initial = filterBtns.find(
        (b) => (b.getAttribute("data-filter") || "").toLowerCase() === "all",
      );
      if (initial) setActiveButton(initial);

      function applyFilter(filter) {
        let visibleCount = 0;
        photoItems.forEach((item) => {
          const category = (
            item.getAttribute("data-category") || ""
          ).toLowerCase();
          // treat 'all' as pass-through
          if (!filter || filter === "all" || category === filter) {
            item.style.display = ""; // allow CSS grid to manage sizing
            // ensure animation can run when it becomes visible
            requestAnimationFrame(() => {
              item.style.opacity = "1";
              item.style.transform = "translateY(0)";
            });
            visibleCount++;
          } else {
            // hide with display none so grid reflows
            item.style.display = "none";
          }
        });

        if (noPhotosMsg) {
          if (visibleCount === 0) {
            noPhotosMsg.classList.remove("hidden");
          } else {
            noPhotosMsg.classList.add("hidden");
          }
        }
      }

      filterBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const filter = (btn.getAttribute("data-filter") || "").toLowerCase();
          setActiveButton(btn);
          applyFilter(filter);
        });
      });

      // Run initial filter pass (in case items were hidden by server-side)
      applyFilter("all");
    })();

    // FADE-IN ANIMATIONS (IntersectionObserver)
    (function initFadeInObserver() {
      const photoItems = Array.from(document.querySelectorAll(".photo-item"));
      if (!photoItems.length || typeof IntersectionObserver === "undefined") {
        // Fallback: reveal all immediately
        photoItems.forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        });
        return;
      }

      // Set initial styles for transition (if not already present)
      photoItems.forEach((el) => {
        if (!el.style.transition) {
          el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        }
        if (!el.style.opacity) el.style.opacity = "0";
        if (!el.style.transform) el.style.transform = "translateY(12px)";
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              // trigger reveal
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
              // unobserve for performance
              observer.unobserve(el);
            }
          });
        },
        {
          threshold: 0.08,
        },
      );

      photoItems.forEach((el) => observer.observe(el));
    })();

    // OPTIONAL: Accessibility - enable keyboard activation for filter buttons
    (function enhanceAccessibility() {
      const filterBtns = Array.from(document.querySelectorAll(".filter-btn"));
      filterBtns.forEach((btn) => {
        btn.setAttribute("role", "button");
        btn.setAttribute("tabindex", "0");
        btn.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            btn.click();
          }
        });
      });
    })();
  }); // DOMContentLoaded
})();
