(function () {
  "use strict";

  var SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  var PREVIEW_COUNT = 5;
  var client = null;

  var PROJECT_LABELS = {
    portfolio: "Portfolio",
    uniswap: "UniSwap",
    weather: "Weather App",
    calculator: "Currency Calculator"
  };

  function storageKey(slug) { return "feedback_submitted_" + slug; }

  function isConfigured() {
    var c = window.SUPABASE_CONFIG;
    return c && c.url && c.anonKey &&
      c.url.indexOf("YOUR_PROJECT_ID") === -1 &&
      c.anonKey.indexOf("YOUR_ANON") === -1;
  }

  function loadScript() {
    return new Promise(function (resolve, reject) {
      if (window.supabase) { resolve(); return; }
      var s = document.createElement("script");
      s.src = SUPABASE_JS;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function getClient() {
    if (client) return client;
    if (!isConfigured()) return null;
    await loadScript();
    client = window.supabase.createClient(
      window.SUPABASE_CONFIG.url,
      window.SUPABASE_CONFIG.anonKey
    );
    return client;
  }

  function renderStars(container, selected, interactive, onSelect) {
    container.innerHTML = "";
    for (var i = 1; i <= 5; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "feedback-star" + (i <= selected ? " selected" : "");
      btn.setAttribute("aria-label", i + " stars");
      btn.innerHTML = "&#9733;";
      btn.dataset.value = String(i);
      if (!interactive) {
        btn.disabled = true;
      } else {
        btn.addEventListener("mouseenter", function () {
          highlight(container, parseInt(this.dataset.value, 10));
        });
        btn.addEventListener("mouseleave", function () { clearHighlight(container); });
        btn.addEventListener("click", function () {
          var v = parseInt(this.dataset.value, 10);
          container.dataset.selected = String(v);
          renderStars(container, v, true, onSelect);
          if (onSelect) onSelect(v);
        });
      }
      container.appendChild(btn);
    }
  }

  function highlight(container, upTo) {
    container.querySelectorAll(".feedback-star").forEach(function (b) {
      b.classList.toggle("hover", parseInt(b.dataset.value, 10) <= upTo);
    });
  }

  function clearHighlight(container) {
    container.querySelectorAll(".feedback-star").forEach(function (b) {
      b.classList.remove("hover");
    });
  }

  function starString(n) {
    var s = "";
    for (var i = 0; i < 5; i++) s += i < n ? "\u2605" : "\u2606";
    return s;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) { return ""; }
  }

  async function fetchFeedback(slug) {
    var db = await getClient();
    if (!db) return [];
    var res = await db.from("feedback")
      .select("stars, message, created_at, project_slug")
      .eq("project_slug", slug)
      .order("created_at", { ascending: false });
    return res.error ? [] : (res.data || []);
  }

  async function fetchAllFeedback() {
    var db = await getClient();
    if (!db) return [];
    var res = await db.from("feedback")
      .select("stars, message, created_at, project_slug")
      .order("created_at", { ascending: false });
    return res.error ? [] : (res.data || []);
  }

  function calcStats(rows) {
    if (!rows.length) return { count: 0, average: 0 };
    var sum = rows.reduce(function (a, r) { return a + r.stars; }, 0);
    return { count: rows.length, average: sum / rows.length };
  }

  function renderReviewCard(row) {
    var label = PROJECT_LABELS[row.project_slug] || row.project_slug;
    var msg = row.message ? escapeHtml(row.message) : "<em>No written feedback</em>";
    return (
      '<article class="review-card">' +
        '<span class="review-project">' + escapeHtml(label) + '</span>' +
        '<div class="review-stars" aria-label="' + row.stars + ' stars">' + starString(row.stars) + '</div>' +
        '<p class="review-text">' + msg + '</p>' +
        '<div class="review-meta">' + formatDate(row.created_at) + '</div>' +
      '</article>'
    );
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function renderReviewsList(container, rows, expanded) {
    var show = expanded ? rows : rows.slice(0, PREVIEW_COUNT);
    container.innerHTML = show.map(renderReviewCard).join("");
    var existing = container.parentElement.querySelector(".show-more-btn");
    if (existing) existing.remove();
    if (rows.length > PREVIEW_COUNT && !expanded) {
      var btn = document.createElement("button");
      btn.className = "show-more-btn link-fx";
      btn.textContent = "Show " + (rows.length - PREVIEW_COUNT) + " more reviews";
      btn.addEventListener("click", function () {
        renderReviewsList(container, rows, true);
      });
      container.parentElement.appendChild(btn);
    }
  }

  async function submitFeedback(slug, stars, message, widget) {
    var msgEl = widget.querySelector(".feedback-msg");
    if (localStorage.getItem(storageKey(slug))) {
      if (msgEl) msgEl.textContent = "You already submitted feedback for this. Thank you!";
      return;
    }
    var db = await getClient();
    if (!db) {
      if (msgEl) { msgEl.textContent = "Database not configured."; msgEl.classList.add("error"); }
      return;
    }
    var btn = widget.querySelector(".feedback-submit");
    if (btn) btn.disabled = true;

    var res = await db.from("feedback").insert({
      project_slug: slug,
      stars: stars,
      message: message || null
    });

    if (res.error) {
      if (msgEl) { msgEl.textContent = "Could not save. Please try again."; msgEl.classList.add("error"); }
      if (btn) btn.disabled = false;
      return;
    }

    localStorage.setItem(storageKey(slug), "1");
    if (msgEl) { msgEl.textContent = "Thank you for your feedback!"; msgEl.classList.remove("error"); }

    var starsEl = widget.querySelector(".feedback-stars");
    if (starsEl) renderStars(starsEl, stars, false);
    var ta = widget.querySelector(".feedback-textarea");
    if (ta) { ta.disabled = true; ta.value = message; }
    if (btn) btn.disabled = true;

    var statsEl = widget.querySelector(".feedback-stats");
    if (statsEl) {
      var rows = await fetchFeedback(slug);
      var st = calcStats(rows);
      statsEl.innerHTML = formatStatsHtml(st);
    }
  }

  function formatStatsHtml(st) {
    if (!st.count) return "No ratings yet - be the first!";
    return '<span class="avg">' + st.average.toFixed(1) + '</span> / 5 &middot; ' + st.count + ' review' + (st.count !== 1 ? 's' : '');
  }

  function initWidget(el) {
    var slug = el.dataset.feedbackSlug;
    if (!slug) return;

    var starsEl = el.querySelector(".feedback-stars");
    var statsEl = el.querySelector(".feedback-stats");
    var ta = el.querySelector(".feedback-textarea");
    var btn = el.querySelector(".feedback-submit");
    var msgEl = el.querySelector(".feedback-msg");
    var done = localStorage.getItem(storageKey(slug));

    renderStars(starsEl, done ? 5 : 0, !done);

    fetchFeedback(slug).then(function (rows) {
      if (statsEl) statsEl.innerHTML = isConfigured()
        ? formatStatsHtml(calcStats(rows))
        : '<span class="rating-loading">Database not configured</span>';
    });

    if (done && msgEl) msgEl.textContent = "You already submitted feedback. Thank you!";
    if (done && ta) ta.disabled = true;
    if (done && btn) btn.disabled = true;

    if (btn) {
      btn.addEventListener("click", function () {
        var stars = parseInt(starsEl.dataset.selected || "0", 10);
        if (!stars) {
          if (msgEl) { msgEl.textContent = "Please select a star rating."; msgEl.classList.add("error"); }
          return;
        }
        submitFeedback(slug, stars, ta ? ta.value.trim() : "", el);
      });
    }
  }

  async function initReviewsPage() {
    var listEl = document.getElementById("all-reviews-list");
    if (!listEl) return;

    var rows = await fetchAllFeedback();
    if (!rows.length) {
      listEl.innerHTML = '<p style="color:var(--muted);text-align:center;">No reviews yet. Be the first to leave feedback!</p>';
      return;
    }
    renderReviewsList(listEl, rows, false);
  }

  async function initQa() {
    var listEl = document.getElementById("qa-list");
    var form = document.getElementById("qa-form");
    if (!listEl && !form) return;

    var db = await getClient();
    if (listEl && db) {
      var res = await db.from("qa_questions")
        .select("question, answer, answered_at, created_at")
        .eq("is_published", true)
        .order("answered_at", { ascending: false });
      var items = res.data || [];
      if (!items.length) {
        listEl.innerHTML = '<p style="color:var(--muted);">No answered questions yet. Ask something below!</p>';
      } else {
        listEl.innerHTML = items.map(function (q) {
          return (
            '<div class="qa-item reveal">' +
              '<p class="qa-q">' + escapeHtml(q.question) + '</p>' +
              '<p class="qa-a">' + escapeHtml(q.answer) + '</p>' +
            '</div>'
          );
        }).join("");
      }
    }

    if (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        var input = form.querySelector('[name="question"]');
        var msg = form.querySelector(".qa-msg") || form.querySelector(".feedback-msg");
        var question = input.value.trim();
        if (!question) return;
        if (localStorage.getItem("qa_submitted_recent")) {
          if (msg) msg.textContent = "You recently submitted a question. Please wait before asking again.";
          return;
        }
        var db2 = await getClient();
        if (!db2) {
          if (msg) { msg.textContent = "Database not configured."; msg.classList.add("error"); }
          return;
        }
        var res2 = await db2.from("qa_questions").insert({ question: question });
        if (res2.error) {
          if (msg) { msg.textContent = "Could not submit question."; msg.classList.add("error"); }
          return;
        }
        localStorage.setItem("qa_submitted_recent", "1");
        input.value = "";
        if (msg) { msg.textContent = "Question submitted! I'll answer it soon."; msg.classList.remove("error"); }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-feedback-slug]").forEach(initWidget);
    initReviewsPage();
    initQa();
  });
})();
