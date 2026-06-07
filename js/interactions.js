(function () {
  "use strict";

  function ripple(x, y) {
    var el = document.createElement("span");
    el.className = "click-ripple";
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 800);
  }

  document.addEventListener("click", function (e) {
    var target = e.target.closest(".link-fx, .nav-link, .card-link, .btn, .project-card a, .glass-card a");
    if (!target) return;
    ripple(e.clientX, e.clientY);
    target.style.transition = "transform 0.12s ease";
    target.style.transform = "scale(0.98)";
    setTimeout(function () { target.style.transform = ""; }, 120);
  });
})();
