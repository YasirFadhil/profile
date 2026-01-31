/*
  public/js/navigation.js
  Robust navigation behavior with event delegation and MutationObserver.

  Goals:
  - Make mobile menu toggling resilient to client-side page transitions where DOM nodes may be replaced.
  - Use event delegation (listen on document) so newly-inserted buttons/links still work.
  - Persist menu open/closed state on <html> via a data attribute so UI can be restored if elements are re-rendered.
  - Close the menu when clicking links, outside the menu, or pressing Escape.
  - Smooth scrolling for hash anchors on the same page.
  - Active nav highlighting for sections on scroll (works with nav links and mobile links).

  Notes:
  - This file assumes it's loaded with `defer` so DOM is available or will be soon.
  - The script never caches DOM nodes long-term; nodes are queried as needed so it tolerates DOM replacement.
*/

(function () {
  "use strict";

  // Selectors - keep them small and stable
  const MOBILE_MENU_BTN_SELECTOR = "#mobile-menu-btn";
  const MOBILE_MENU_SELECTOR = "#mobile-menu";
  const MOBILE_LINK_SELECTOR = ".mobile-nav-link";
  const NAV_SELECTOR = "nav";
  const HAMBURGER_ICON_SELECTOR = "#mobile-menu-btn i";

  // Data attribute used to persist menu state across DOM replacements
  const STATE_KEY = "mobileMenuOpen";

  // Utility to check if an element exists and is visible
  function elementIsVisible(el) {
    if (!el) return false;
    return !(el.classList && el.classList.contains("hidden"));
  }

  // Read persisted state
  function getPersistedState() {
    return document.documentElement.dataset[STATE_KEY] === "true";
  }

  // Persist state
  function setPersistedState(isOpen) {
    document.documentElement.dataset[STATE_KEY] = isOpen ? "true" : "false";
  }

  // Set hamburger icon state (switch fa-bars <-> fa-times)
  function updateHamburgerIcon(isOpen) {
    const icon = document.querySelector(HAMBURGER_ICON_SELECTOR);
    if (!icon) return;
    icon.classList.remove(isOpen ? "fa-bars" : "fa-times");
    icon.classList.add(isOpen ? "fa-times" : "fa-bars");
  }

  // Toggle visibility of menu element (adds/removes 'hidden' class)
  function setMenuVisibility(isOpen) {
    const menu = document.querySelector(MOBILE_MENU_SELECTOR);
    if (!menu) {
      // Still persist the state so when the menu is re-rendered we can restore it
      setPersistedState(isOpen);
      updateHamburgerIcon(isOpen);
      return;
    }

    if (isOpen) {
      menu.classList.remove("hidden");
    } else {
      menu.classList.add("hidden");
    }

    setPersistedState(isOpen);
    updateHamburgerIcon(isOpen);
  }

  function toggleMenu() {
    const menu = document.querySelector(MOBILE_MENU_SELECTOR);
    const isCurrentlyOpen =
      getPersistedState() || (menu && elementIsVisible(menu));
    setMenuVisibility(!isCurrentlyOpen);
  }

  function closeMenu() {
    setMenuVisibility(false);
  }

  function openMenu() {
    setMenuVisibility(true);
  }

  // Event delegation handler for clicks
  function delegatedClickHandler(e) {
    const target = e.target;

    // Toggle button clicked?
    const clickedToggle = target.closest(MOBILE_MENU_BTN_SELECTOR);
    if (clickedToggle) {
      e.stopPropagation();
      toggleMenu();
      return;
    }

    // Mobile link clicked? Close menu after navigation or scrolling.
    const clickedMobileLink = target.closest(MOBILE_LINK_SELECTOR);
    if (clickedMobileLink) {
      // Let the navigation happen naturally (link may navigate to new page).
      // Close the menu immediately to avoid it lingering after client-side routing.
      closeMenu();
      // Allow default link behavior to continue.
      return;
    }

    // Clicked an anchor with a hash (smooth-scroll behavior). Use same-page detection.
    const clickedAnchor = target.closest('a[href*="#"]');
    if (clickedAnchor) {
      const href = clickedAnchor.getAttribute("href") || "";
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return; // nothing to do

      const hash = href.slice(hashIndex);
      if (!hash || hash === "#") return;

      // Determine if link points to same page
      const anchorUrl = new URL(clickedAnchor.href, window.location.href);
      const isSamePage =
        anchorUrl.pathname === window.location.pathname &&
        anchorUrl.hostname === window.location.hostname;

      if (!isSamePage) {
        // External or different page anchor - let the navigation happen normally.
        // Close menu so it doesn't remain open if client-side navigation reuses DOM.
        closeMenu();
        return;
      }

      // Same-page anchor -> smooth scroll and prevent default
      const targetEl = document.querySelector(hash);
      if (!targetEl) return;

      e.preventDefault();
      // Close mobile menu if open to avoid overlapping UI during scroll
      closeMenu();

      const navEl = document.querySelector(NAV_SELECTOR);
      const navHeight = navEl ? navEl.offsetHeight : 80;
      const targetPosition =
        targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
      return;
    }

    // If click outside mobile menu and button -> close menu
    const mobileMenu = document.querySelector(MOBILE_MENU_SELECTOR);
    const mobileBtn = document.querySelector(MOBILE_MENU_BTN_SELECTOR);
    if (
      mobileMenu &&
      mobileBtn &&
      !mobileMenu.classList.contains("hidden") &&
      !mobileMenu.contains(target) &&
      !mobileBtn.contains(target)
    ) {
      closeMenu();
    }
  }

  // Close menu on Escape key
  function keydownHandler(e) {
    if (e.key === "Escape" || e.key === "Esc") {
      closeMenu();
    }
  }

  // Active navigation highlighting (works for desktop links and mobile links)
  function updateActiveNav() {
    const sections = Array.from(document.querySelectorAll("section[id]"));
    if (!sections.length) return;
    const navElement = document.querySelector(NAV_SELECTOR);
    const navItems = Array.from(
      document.querySelectorAll(
        "nav a[href*='#'], .mobile-nav-link, nav a[href^='/']",
      ),
    );
    const navHeight = navElement ? navElement.offsetHeight : 80;
    let current = "";

    sections.forEach(function (section) {
      const rectTop = section.getBoundingClientRect().top + window.pageYOffset;
      if (window.pageYOffset >= rectTop - navHeight - 100) {
        current = section.id;
      }
    });

    navItems.forEach(function (item) {
      const href = item.getAttribute("href") || "";
      // derive a hash like '#projects' or empty
      const hashPart = href.includes("#") ? href.split("#").pop() : "";
      const itemHash = hashPart ? "#" + hashPart : "";
      if (!itemHash) {
        // If this is a plain link (no hash), try to match by pathname
        try {
          const itemUrl = new URL(item.href, window.location.href);
          const samePath = itemUrl.pathname === window.location.pathname;
          if (samePath && current === "") {
            item.classList.add("text-blue-400");
            item.classList.remove("text-slate-300");
          } else {
            item.classList.remove("text-blue-400");
            item.classList.add("text-slate-300");
          }
        } catch (err) {
          // ignore malformed URL
        }
        return;
      }

      if (itemHash === "#" + current) {
        item.classList.remove("text-slate-300");
        item.classList.add("text-blue-400");
      } else {
        item.classList.remove("text-blue-400");
        item.classList.add("text-slate-300");
      }
    });
  }

  // Throttled scroll handler via requestAnimationFrame
  let rafPending = false;
  function onScroll() {
    if (!rafPending) {
      rafPending = true;
      window.requestAnimationFrame(function () {
        updateActiveNav();
        rafPending = false;
      });
    }
  }

  // MutationObserver: watch for insertion/removal of navigation elements and re-apply UI state
  function createNavObserver() {
    const observer = new MutationObserver(function (mutations) {
      // If mobile menu or button were added/removed, restore state to match persisted value.
      let sawRelevant = false;
      mutations.forEach(function (m) {
        // check added nodes for our selectors
        m.addedNodes &&
          m.addedNodes.forEach(function (node) {
            if (!(node instanceof Element)) return;
            if (
              node.matches &&
              (node.matches(MOBILE_MENU_SELECTOR) ||
                node.matches(MOBILE_MENU_BTN_SELECTOR) ||
                (node.querySelector &&
                  (node.querySelector(MOBILE_MENU_SELECTOR) ||
                    node.querySelector(MOBILE_MENU_BTN_SELECTOR))))
            ) {
              sawRelevant = true;
            }
          });
        // also check removed nodes; if nav was removed, we still want to persist state
        m.removedNodes &&
          m.removedNodes.forEach(function (node) {
            if (!(node instanceof Element)) return;
            if (
              node.matches &&
              (node.matches(MOBILE_MENU_SELECTOR) ||
                node.matches(MOBILE_MENU_BTN_SELECTOR))
            ) {
              sawRelevant = true;
            }
          });
      });

      if (sawRelevant) {
        // restore UI state based on persisted flag
        setMenuVisibility(getPersistedState());
        // ensure hamburger icon matches
        updateHamburgerIcon(getPersistedState());
      }
    });

    // Watch the whole document body for subtree changes
    const root = document.body || document.documentElement;
    if (root) {
      observer.observe(root, { childList: true, subtree: true });
    }
    return observer;
  }

  // Initialize once DOM is ready (or immediately if already ready)
  function init() {
    try {
      // Restore UI based on persisted state (useful after client-side transitions)
      setMenuVisibility(getPersistedState());

      // Event delegation for clicks: handle toggle, link clicks, outside clicks, anchor smooth scroll
      document.addEventListener("click", delegatedClickHandler, {
        passive: false,
      });

      // Close menu with Escape
      document.addEventListener("keydown", keydownHandler);

      // Close menu when the browser's history state changes (e.g., client-side routing)
      window.addEventListener("popstate", function () {
        // small delay to allow new DOM to render if the router replaces content
        setTimeout(function () {
          // persist closed state (safer to close on navigation)
          closeMenu();
        }, 50);
      });

      // Smooth scrolling for programmatic button clicks (e.g., "View My Work", "Get In Touch")
      document.addEventListener("click", function (e) {
        const btn = e.target.closest("button");
        if (!btn) return;
        const text = (btn.textContent || "").trim();
        if (text.includes("View My Work")) {
          const projectsSection = document.querySelector("#projects");
          if (!projectsSection) return;
          const navEl = document.querySelector(NAV_SELECTOR);
          const navHeight = navEl ? navEl.offsetHeight : 80;
          const targetPosition =
            projectsSection.getBoundingClientRect().top +
            window.pageYOffset -
            navHeight;
          window.scrollTo({ top: targetPosition, behavior: "smooth" });
        }
        if (text.includes("Get In Touch")) {
          const contactSection = document.querySelector("#contact");
          if (!contactSection) return;
          const navEl = document.querySelector(NAV_SELECTOR);
          const navHeight = navEl ? navEl.offsetHeight : 80;
          const targetPosition =
            contactSection.getBoundingClientRect().top +
            window.pageYOffset -
            navHeight;
          window.scrollTo({ top: targetPosition, behavior: "smooth" });
        }
      });

      // Active nav on scroll
      window.addEventListener("scroll", onScroll, { passive: true });
      // run initial highlight
      updateActiveNav();

      // Start observing DOM so we can re-apply UI when navigation replaces nodes
      createNavObserver();

      // Accessibility: ensure hamburger icon shows as bars by default if none persisted
      const persisted = getPersistedState();
      updateHamburgerIcon(persisted);
    } catch (err) {
      // Don't let navigation errors break the rest of the page
      // eslint-disable-next-line no-console
      console.error("Navigation init error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
