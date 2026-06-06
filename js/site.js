(function () {
  "use strict";

  var NAV_LINKS = [
    { href: "index.html", label: "About" },
    { href: "Course Projects.html", label: "Projects" },
    { href: "hobbies.html", label: "Hobbies" },
    { href: "WeatherProject.html", label: "Weather" },
    { href: "CalculatorProject.html", label: "Calculator" }
  ];

  function currentPage() {
    var path = window.location.pathname;
    var page = path.substring(path.lastIndexOf("/") + 1);
    return page || "index.html";
  }

  function initNav() {
    var header = document.getElementById("header");
    if (!header) return;

    var active = currentPage();

    var inner = document.createElement("div");
    inner.className = "nav-inner";

    var logo = document.createElement("a");
    logo.href = "index.html";
    logo.className = "site-logo";
    logo.innerHTML = "Joseph Nabaty <span>/ Portfolio</span>";

    var toggle = document.createElement("button");
    toggle.className = "nav-toggle";
    toggle.setAttribute("aria-label", "Toggle navigation");
    toggle.textContent = "\u2630";

    var links = document.createElement("nav");
    links.className = "nav-links";
    links.setAttribute("aria-label", "Main navigation");

    NAV_LINKS.forEach(function (item) {
      var a = document.createElement("a");
      a.href = item.href;
      a.className = "button" + (item.href === active ? " active" : "");
      a.textContent = item.label;
      links.appendChild(a);
    });

    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });

    inner.appendChild(logo);
    inner.appendChild(toggle);
    inner.appendChild(links);

    header.innerHTML = "";
    header.appendChild(inner);
  }

  function initFooter() {
    var footer = document.getElementById("footer");
    if (!footer) return;

    footer.innerHTML =
      '<div class="footer-inner">' +
        '<div class="rating-section">' +
          '<h3>Rate this portfolio</h3>' +
          '<p class="rating-subtitle">How was your experience? Your feedback helps me improve.</p>' +
          '<div id="star-rating" class="star-rating" role="group" aria-label="Star rating"></div>' +
          '<div id="rating-stats" class="rating-stats"></div>' +
          '<div id="rating-message" class="rating-message"></div>' +
        '</div>' +
        '<p class="footer-meta">' +
          'Last updated: 2026 &middot; ' +
          '<a href="https://github.com/JosephN04" target="_blank" rel="noopener">GitHub</a> &middot; ' +
          '<a href="https://www.linkedin.com/in/josephnabaty/" target="_blank" rel="noopener">LinkedIn</a>' +
        '</p>' +
      '</div>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initFooter();
  });
})();
