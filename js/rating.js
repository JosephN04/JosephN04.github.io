(function () {
  "use strict";

  const STORAGE_KEY = "portfolio_rating_submitted";
  const SUPABASE_JS_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";

  let supabaseClient = null;

  function isConfigured() {
    const cfg = window.SUPABASE_CONFIG;
    return cfg && cfg.url && cfg.anonKey &&
      !cfg.url.includes("YOUR_PROJECT_ID") &&
      !cfg.anonKey.includes("YOUR_ANON");
  }

  function loadSupabaseScript() {
    return new Promise(function (resolve, reject) {
      if (window.supabase) {
        resolve();
        return;
      }
      var script = document.createElement("script");
      script.src = SUPABASE_JS_URL;
      script.onload = resolve;
      script.onerror = function () { reject(new Error("Failed to load Supabase client")); };
      document.head.appendChild(script);
    });
  }

  async function getClient() {
    if (supabaseClient) return supabaseClient;
    if (!isConfigured()) return null;

    await loadSupabaseScript();
    supabaseClient = window.supabase.createClient(
      window.SUPABASE_CONFIG.url,
      window.SUPABASE_CONFIG.anonKey
    );
    return supabaseClient;
  }

  function renderStars(container, selected, interactive) {
    container.innerHTML = "";
    for (var i = 1; i <= 5; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "star-btn" + (i <= selected ? " selected" : "");
      btn.setAttribute("aria-label", i + " star" + (i > 1 ? "s" : ""));
      btn.textContent = "\u2605";
      btn.dataset.value = i;

      if (!interactive) {
        btn.disabled = true;
      } else {
        btn.addEventListener("mouseenter", function () {
          highlightStars(container, parseInt(this.dataset.value, 10));
        });
        btn.addEventListener("mouseleave", function () {
          clearHover(container);
        });
        btn.addEventListener("click", function () {
          submitRating(parseInt(this.dataset.value, 10), container);
        });
      }

      container.appendChild(btn);
    }
  }

  function highlightStars(container, upTo) {
    container.querySelectorAll(".star-btn").forEach(function (btn) {
      var val = parseInt(btn.dataset.value, 10);
      btn.classList.toggle("hover", val <= upTo);
    });
  }

  function clearHover(container) {
    container.querySelectorAll(".star-btn").forEach(function (btn) {
      btn.classList.remove("hover");
    });
  }

  function formatStats(count, average) {
    if (count === 0) {
      return "No ratings yet — be the first!";
    }
    return (
      '<span class="avg">' + average.toFixed(1) + "</span> out of 5 " +
      "&middot; " + count + " rating" + (count !== 1 ? "s" : "")
    );
  }

  async function fetchStats(statsEl) {
    var client = await getClient();
    if (!client) {
      statsEl.innerHTML = '<span class="rating-loading">Database not configured yet</span>';
      return { count: 0, average: 0 };
    }

    statsEl.innerHTML = '<span class="rating-loading">Loading ratings\u2026</span>';

    var result = await client
      .from("portfolio_ratings")
      .select("stars");

    if (result.error) {
      statsEl.innerHTML = '<span class="rating-message error">Could not load ratings</span>';
      return { count: 0, average: 0 };
    }

    var rows = result.data || [];
    var count = rows.length;
    var average = count === 0
      ? 0
      : rows.reduce(function (sum, r) { return sum + r.stars; }, 0) / count;

    statsEl.innerHTML = formatStats(count, average);
    return { count: count, average: average };
  }

  async function submitRating(stars, starContainer) {
    var messageEl = document.getElementById("rating-message");
    if (localStorage.getItem(STORAGE_KEY)) {
      if (messageEl) {
        messageEl.textContent = "You already rated this site. Thank you!";
        messageEl.classList.remove("error");
      }
      return;
    }

    var client = await getClient();
    if (!client) {
      if (messageEl) {
        messageEl.textContent = "Rating unavailable — database not configured.";
        messageEl.classList.add("error");
      }
      return;
    }

    starContainer.querySelectorAll(".star-btn").forEach(function (btn) {
      btn.disabled = true;
    });

    var result = await client
      .from("portfolio_ratings")
      .insert({ stars: stars });

    if (result.error) {
      if (messageEl) {
        messageEl.textContent = "Could not save your rating. Please try again.";
        messageEl.classList.add("error");
      }
      starContainer.querySelectorAll(".star-btn").forEach(function (btn) {
        btn.disabled = false;
      });
      return;
    }

    localStorage.setItem(STORAGE_KEY, String(stars));
    renderStars(starContainer, stars, false);

    if (messageEl) {
      messageEl.textContent = "Thanks for your " + stars + "-star rating!";
      messageEl.classList.remove("error");
    }

    var statsEl = document.getElementById("rating-stats");
    if (statsEl) await fetchStats(statsEl);
  }

  function initRatingWidget() {
    var starContainer = document.getElementById("star-rating");
    var statsEl = document.getElementById("rating-stats");
    if (!starContainer || !statsEl) return;

    var alreadyRated = localStorage.getItem(STORAGE_KEY);
    var previousStars = alreadyRated ? parseInt(alreadyRated, 10) : 0;

    renderStars(starContainer, previousStars, !alreadyRated);

    if (alreadyRated) {
      var messageEl = document.getElementById("rating-message");
      if (messageEl) {
        messageEl.textContent = "You rated this site " + previousStars + " star" + (previousStars !== 1 ? "s" : "") + ".";
      }
    }

    fetchStats(statsEl);
  }

  document.addEventListener("DOMContentLoaded", initRatingWidget);
})();
