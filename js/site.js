(function () {
  "use strict";

  var NAV_LINKS = [
    { href: "index.html", label: "Home" },
    { href: "about.html", label: "About Site" },
    { href: "projects.html", label: "Projects" },
    { href: "hobbies.html", label: "Hobbies" },
    { href: "uniswap.html", label: "Uniswap", featured: true },
    { href: "weather-project.html", label: "Weather" },
    { href: "calculator-project.html", label: "Calculator" },
    { href: "reviews.html", label: "Reviews" }
  ];

  function currentPage() {
    var path = window.location.pathname;
    var page = path.substring(path.lastIndexOf("/") + 1);
    return page || "index.html";
  }

  function buildBgEffects() {
    if (document.querySelector(".bg-effects")) return;
    var bg = document.createElement("div");
    bg.className = "bg-effects";
    bg.setAttribute("aria-hidden", "true");
    bg.innerHTML =
      '<div class="orb orb-1"></div>' +
      '<div class="orb orb-2"></div>' +
      '<div class="orb orb-3"></div>' +
      '<div class="grid-overlay"></div>';
    document.body.insertBefore(bg, document.body.firstChild);
  }

  function initNav() {
    var header = document.getElementById("site-header");
    if (!header) return;

    var active = currentPage();
    var navLinksHtml = NAV_LINKS.map(function (item) {
      var cls = "nav-link link-fx";
      if (item.href === active) cls += " active";
      if (item.featured) cls += " nav-featured";
      return '<a href="' + item.href + '" class="' + cls + '">' + item.label + '</a>';
    }).join("");

    header.innerHTML =
      '<div class="container">' +
        '<div class="nav-bar">' +
          '<a href="index.html" class="nav-logo link-fx">Joseph <em>Nabaty</em></a>' +
          '<div class="nav-right">' +
            '<button class="theme-toggle" type="button" aria-label="Toggle theme">' +
              '<span class="toggle-icon icon-moon" aria-hidden="true">&#9790;</span>' +
              '<span class="toggle-icon icon-sun" aria-hidden="true">&#9728;</span>' +
            '</button>' +
            '<button class="nav-burger" type="button" aria-label="Toggle navigation">&#9776;</button>' +
          '</div>' +
          '<nav class="nav-links" aria-label="Main navigation">' + navLinksHtml + '</nav>' +
        '</div>' +
      '</div>';

    header.querySelector(".nav-burger").addEventListener("click", function () {
      header.querySelector(".nav-links").classList.toggle("open");
    });

    if (window.bindThemeToggles) window.bindThemeToggles();
  }

  function initFooter() {
    var footer = document.getElementById("site-footer");
    if (!footer) return;

    footer.innerHTML =
      '<div class="container">' +
        '<p class="footer-bottom" style="padding:1.5rem 0;">' +
          '<a href="about.html">About This Site</a> &middot; ' +
          '<a href="reviews.html">Reviews &amp; Q&amp;A</a> &middot; ' +
          '<a href="assets/Nabaty-Joseph-Resume.pdf" download>Resume (PDF)</a> &middot; ' +
          '<a href="https://github.com/JosephN04" target="_blank" rel="noopener">GitHub</a> &middot; ' +
          '<a href="https://www.linkedin.com/in/josephnabaty/" target="_blank" rel="noopener">LinkedIn</a>' +
          '<br><span style="margin-top:0.5rem;display:inline-block;">&copy; 2026 Joseph Nabaty</span>' +
        '</p>' +
      '</div>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildBgEffects();
    initNav();
    initFooter();
  });

  if (document.readyState !== "loading") {
    buildBgEffects();
  }
})();
