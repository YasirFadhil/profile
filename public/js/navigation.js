/*
  WWW/public/js/navigation.js
  Navigation behavior for desktop and mobile:
  - Mobile hamburger toggle
  - Close mobile menu on link click or outside click
  - Smooth scrolling for in-page anchors (works with '#id' and '/#id' links)
  - Active section highlight on scroll
*/

(function () {
  function initNavigation() {
    try {
      const mobileMenuBtn = document.getElementById("mobile-menu-btn");
      const mobileMenu = document.getElementById("mobile-menu");
      const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
      const navElement = document.querySelector("nav");

      // Utility to set hamburger icon state
      function setHamburgerIcon(isOpen) {
        if (!mobileMenuBtn) return;
        const icon = mobileMenuBtn.querySelector("i");
        if (!icon) return;
        if (isOpen) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-times");
        } else {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      }

      // Toggle mobile menu
      if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          const isHidden = mobileMenu.classList.toggle("hidden");
          // if hidden === true => menu is hidden, else shown
          setHamburgerIcon(!isHidden);
        });

        // Close mobile menu when clicking on mobile links
        mobileNavLinks.forEach(function (link) {
          link.addEventListener("click", function () {
            if (!mobileMenu.classList.contains("hidden")) {
              mobileMenu.classList.add("hidden");
              setHamburgerIcon(false);
            }
          });
        });

        // Close when clicking outside the menu/button
        document.addEventListener("click", function (event) {
          const target = event.target;
          if (
            mobileMenu &&
            mobileMenuBtn &&
            !mobileMenu.classList.contains("hidden") &&
            !mobileMenu.contains(target) &&
            !mobileMenuBtn.contains(target)
          ) {
            mobileMenu.classList.add("hidden");
            setHamburgerIcon(false);
          }
        });
      }

      // Smooth scrolling for anchor links (handles anchors with hash)
      document.querySelectorAll("a[href*=\"#\"]").forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
          // Use anchor.hash (will be '' if none). For links like '/#projects', .hash === '#projects'
          const hash = anchor.hash;
          if (!hash) return; // nothing to scroll to

          // If link points to another page (different pathname & hostname), let it navigate
          const samePage =
            anchor.pathname === window.location.pathname ||
            anchor.pathname === "" ||
            anchor.pathname === "/" ||
            anchor.pathname === window.location.pathname.replace(/^\//, "");

          if (!samePage && anchor.hostname && anchor.hostname !== window.location.hostname) {
            // external link - skip
            return;
          }

          const target = document.querySelector(hash);
          if (!target) return; // no matching section

          e.preventDefault();

          // If mobile menu is open, close it
          if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
            mobileMenu.classList.add("hidden");
            setHamburgerIcon(false);
          }

          // Compute offset for fixed nav
          const navHeight = navElement ? navElement.offsetHeight : 80;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        });
      });

      // Button helpers (View My Work, Get In Touch)
      document.querySelectorAll("button").forEach(function (btn) {
        const text = (btn.textContent || "").trim();
        if (text.includes("View My Work")) {
          btn.addEventListener("click", function () {
            const projectsSection = document.querySelector("#projects");
            if (!projectsSection) return;
            const navHeight = navElement ? navElement.offsetHeight : 80;
            const targetPosition = projectsSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({ top: targetPosition, behavior: "smooth" });
          });
        }
        if (text.includes("Get In Touch")) {
          btn.addEventListener("click", function () {
            const contactSection = document.querySelector("#contact");
            if (!contactSection) return;
            const navHeight = navElement ? navElement.offsetHeight : 80;
            const targetPosition = contactSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({ top: targetPosition, behavior: "smooth" });
          });
        }
      });

      // Active nav highlight on scroll
      function updateActiveNav() {
        const sections = Array.from(document.querySelectorAll("section[id]"));
        if (!sections.length) return;
        const navItems = Array.from(document.querySelectorAll("nav a[href*='#'], .mobile-nav-link"));
        const navHeight = navElement ? navElement.offsetHeight : 80;
        let current = "";

        sections.forEach(function (section) {
          const rectTop = section.getBoundingClientRect().top + window.pageYOffset;
          if (window.pageYOffset >= rectTop - navHeight - 100) {
            current = section.id;
          }
        });

        navItems.forEach(function (item) {
          // item.hash works for '/#id' links as well
          const itemHash = item.hash || (item.getAttribute("href") || "").split("#").pop() ? "#" + (item.getAttribute("href") || "").split("#").pop() : "";
          if (!itemHash) return;
          if (itemHash === "#" + current) {
            item.classList.remove("text-slate-300");
            item.classList.add("text-blue-400");
          } else {
            item.classList.remove("text-blue-400");
            item.classList.add("text-slate-300");
          }
        });
      }

      // Throttle for scroll
      let rafPending = false;
      window.addEventListener("scroll", function () {
        if (!rafPending) {
          rafPending = true;
          window.requestAnimationFrame(function () {
            updateActiveNav();
            rafPending = false;
          });
        }
      });

      // Initial highlight run
      updateActiveNav();
    } catch (err) {
      // Don't break the site if something unexpected happens
      // eslint-disable-next-line no-console
      console.error("Navigation init error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigation);
  } else {
    initNavigation();
  }
})();
