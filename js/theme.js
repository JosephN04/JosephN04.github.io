(function () {
  "use strict";

  var STORAGE_KEY = "portfolio_theme";

  function getPreferred() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);

    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("aria-pressed", theme === "dark" ? "false" : "true");
    });
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  }

  function bindToggles() {
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "true";
      btn.addEventListener("click", toggleTheme);
    });
  }

  applyTheme(getPreferred());
  window.toggleTheme = toggleTheme;
  window.bindThemeToggles = bindToggles;
})();
