/* =========================================================
   ON THE MEND – SHARED SITE SCRIPT
   Populates links from links.js, renders episode/clip cards
   (templates live in cards.js, shared with build.js), powers the
   search, partner clinic views (?p=code), FAQ accordion, mobile
   menu, reveals and the Shorts lightbox.
   ========================================================= */
(function () {
  var L = window.OTM_LINKS || {};

  /* ----- Partner clinic view (?p=code) ----- */
  var PARTNERS = window.OTM_PARTNERS || {};
  var partnerId = new URLSearchParams(location.search).get("p");
  var partner = (partnerId && PARTNERS[partnerId]) ? PARTNERS[partnerId] : null;

  var C = window.OTM_CARDS(L, window.OTM_DATA, partner);
  var DATA = C.LIVE;                      /* scheduled clips stay hidden until release */
  var platform = C.platform, epLink = C.epLink, chronoSort = C.chronoSort;

  function partnerVisible(item) {
    if (!partner) return true;
    if (!item.suburb) return true;
    if (C.isFeatured(item)) return true;
    return (partner.excludeSuburbs || []).indexOf(item.suburb) === -1;
  }
  function partnerSort(list) {
    if (!partner) return list;
    return list.slice().sort(function (a, b) {
      return (C.isFeatured(b) ? 1 : 0) - (C.isFeatured(a) ? 1 : 0);
    });
  }

  var STATE_NAMES = { VIC: "Victoria", NSW: "New South Wales", QLD: "Queensland",
    SA: "South Australia", WA: "Western Australia", TAS: "Tasmania",
    NT: "Northern Territory", ACT: "Australian Capital Territory" };

  /* Suburb, state code and full state name are all searchable */
  function locationTerms(item) {
    return [item.suburb || "", item.state || "", STATE_NAMES[item.state] || ""].join(" ");
  }

  /* ----- Populate any element with data-link="youtube|spotify|instagram|facebook|tiktok|email" ----- */
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var key = a.getAttribute("data-link");
    if (key === "email") {
      var subj = a.getAttribute("data-subject") || "On The Mend enquiry";
      a.href = "mailto:" + (L.email || "") + "?subject=" + encodeURIComponent(subj);
    } else {
      a.href = platform(key);
      a.target = "_blank";
      a.rel = "noopener";
    }
  });

  function wireOutLinks(root) {
    (root || document).querySelectorAll("[data-out]").forEach(function (a) {
      a.target = "_blank"; a.rel = "noopener";
    });
  }

  /* ----- Now playing chip (hero): the newest episode's show-notes page ----- */
  var nowChip = document.getElementById("now-playing");
  if (nowChip) {
    var latest = C.published()[0];
    if (latest) {
      nowChip.querySelector("small").textContent = "Ep " + latest.number + ": " + latest.title;
      nowChip.href = latest.page || epLink(latest.id, "youtube");
    } else {
      nowChip.style.display = "none";
    }
  }

  /* ----- Home page ----- */
  var epGrid = document.getElementById("home-episodes");
  if (epGrid) epGrid.innerHTML = C.published().slice(0, C.HOME_EPISODES).map(C.episodeCard).join("");
  var nextEl = document.getElementById("home-next");
  if (nextEl) nextEl.innerHTML = C.nextBand(C.coming()[0]);
  var clipRow = document.getElementById("home-clips");
  if (clipRow) clipRow.innerHTML = C.clips().map(C.clipCard).join("");

  /* ----- Episode page clip grid: newly released clips appear without a rebuild ----- */
  document.querySelectorAll("[data-episode-clips]").forEach(function (el) {
    var n = parseInt(el.getAttribute("data-episode-clips"), 10);
    var list = C.clips(n);
    el.innerHTML = list.length
      ? '<div class="clip-grid">' + list.map(C.episodeClipCard).join("") + "</div>"
      : C.clipsPending(n);
  });

  /* ----- Search page ----- */
  var searchInput = document.getElementById("search-input");
  if (searchInput) {
    var resultsEl = document.getElementById("search-results");
    var countEl = document.getElementById("results-count");
    var chips = document.querySelectorAll(".chip[data-q]");

    /* Partner welcome banner */
    if (partner) {
      var banner = document.createElement("div");
      banner.className = "partner-banner";
      banner.innerHTML = "<strong>Patient resources for " + partner.name + "</strong>" +
        "<span>Episodes featuring your clinic's own team appear first. The wider On The Mend health library follows. General information only: always speak with your own GP.</span>";
      var searchBar = document.querySelector(".search-bar");
      searchBar.parentNode.insertBefore(banner, searchBar);
    }

    function normalise(s) { return (s || "").toLowerCase(); }
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (ch) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
      });
    }

    function matches(item, q) {
      if (!q) return true;
      var hay = normalise(item.title + " " + (item.guest || "") + " " + item.description + " " + item.tags.join(" ") + " " + locationTerms(item) + " " + (item.keywords || ""));
      return q.split(/\s+/).every(function (word) { return hay.indexOf(word) !== -1; });
    }

    function render() {
      var q = normalise(searchInput.value.trim());
      var hits = DATA.filter(function (d) { return partnerVisible(d) && matches(d, q); });
      hits = partnerSort(chronoSort(hits));
      chips.forEach(function (c) { c.classList.toggle("active", normalise(c.getAttribute("data-q")) === q); });
      if (!hits.length) {
        countEl.textContent = "";
        resultsEl.innerHTML = '<div class="no-results"><h3>No results for "' + escapeHtml(searchInput.value) + '"</h3>' +
          '<p>Try a different keyword, like skin checks, men\'s health or hearing. New topics are added with every episode.</p></div>';
        return;
      }
      var eps = hits.filter(function (h) { return h.type === "episode"; });
      var soon = hits.filter(function (h) { return h.type === "coming"; });
      var clips = hits.filter(function (h) { return h.type === "clip"; });
      countEl.textContent = q
        ? hits.length + " result" + (hits.length === 1 ? "" : "s") + " for \"" + searchInput.value.trim() + "\""
        : "Showing all " + eps.length + " episodes, " + clips.length + " clips" +
          (soon.length ? " and " + soon.length + " coming soon" : "");

      resultsEl.innerHTML = C.hub(hits);
      wireOutLinks(resultsEl);
      resultsEl.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
    }

    searchInput.addEventListener("input", render);
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        searchInput.value = c.getAttribute("data-q");
        render();
      });
    });
    var params = new URLSearchParams(location.search);
    if (params.get("q")) searchInput.value = params.get("q");
    render();
  }

  /* ----- FAQ accordion ----- */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var answer = item.querySelector(".faq-a");
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ----- Mobile menu ----- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-controls", "site-nav");
    nav.id = "site-nav";
    var setMenu = function (open) {
      nav.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
  }

  /* ----- Reveal on scroll ----- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ----- Short clip lightbox: play Shorts on the site instead of leaving ----- */
  (function shortsPlayer() {
    var SHORT_RE = /(?:youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
    var modal, frame, ytLink, titleEl, lastFocus;

    function build() {
      modal = document.createElement("div");
      modal.className = "short-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-label", "Short clip player");
      modal.innerHTML =
        '<div class="sm-backdrop"></div>' +
        '<div class="sm-box">' +
        '<button class="sm-close" type="button" aria-label="Close clip">&times;</button>' +
        '<div class="sm-frame"></div>' +
        '<div class="sm-foot"><p class="sm-title"></p>' +
        '<a class="sm-yt" target="_blank" rel="noopener">Watch on YouTube</a></div>' +
        "</div>";
      document.body.appendChild(modal);
      frame = modal.querySelector(".sm-frame");
      ytLink = modal.querySelector(".sm-yt");
      titleEl = modal.querySelector(".sm-title");
      modal.querySelector(".sm-close").addEventListener("click", close);
      modal.querySelector(".sm-backdrop").addEventListener("click", close);
    }

    function open(id, href, title) {
      if (!modal) build();
      lastFocus = document.activeElement;
      titleEl.textContent = title || "";
      ytLink.href = href;
      frame.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0&playsinline=1" title="' + (title || "Short clip") +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"' +
        " allowfullscreen></iframe>";
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
      modal.querySelector(".sm-close").focus();
    }

    function close() {
      if (!modal) return;
      modal.classList.remove("open");
      frame.innerHTML = "";               /* stops playback */
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && modal.classList.contains("open")) close();
    });

    /* Delegated so it also covers cards rendered later by the search */
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a || !a.href) return;
      var m = SHORT_RE.exec(a.href);
      if (!m) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;  /* let people open in a new tab */
      e.preventDefault();
      var card = a.closest(".card");
      var h = card && card.querySelector("h3");
      open(m[1], a.href, h ? h.textContent.trim() : "");
    });
  })();

  wireOutLinks(document);
})();
