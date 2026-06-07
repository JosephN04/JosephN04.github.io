(function () {
  "use strict";

  function revealInViewport(elements) {
    elements.forEach(function (el) {
      if (el.classList.contains("visible")) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add("visible");
      }
    });
  }

  function initReveal() {
    var elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (el) { el.classList.add("visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    elements.forEach(function (el) { observer.observe(el); });

    revealInViewport(elements);
    window.addEventListener("load", function () { revealInViewport(elements); });
  }

  function forceOrbAnimations() {
    var orbs = document.querySelectorAll(".orb");
    orbs.forEach(function (orb) {
      orb.style.animationPlayState = "running";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    forceOrbAnimations();
  });

  /* Re-apply after site.js may have injected the orbs */
  window.addEventListener("load", forceOrbAnimations);
})();

