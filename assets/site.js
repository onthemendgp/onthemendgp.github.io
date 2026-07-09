/* =========================================================
   ON THE MEND – SHARED SITE SCRIPT
   Populates links from links.js, renders episode/clip cards,
   powers the search, partner clinic views (?p=code), FAQ
   accordion, mobile menu and reveals.
   ========================================================= */
(function () {
  var L = window.OTM_LINKS || {};
  var DATA = window.OTM_DATA || [];

  /* ----- Partner clinic view (?p=code) ----- */
  var PARTNERS = window.OTM_PARTNERS || {};
  var partnerId = new URLSearchParams(location.search).get("p");
  var partner = (partnerId && PARTNERS[partnerId]) ? PARTNERS[partnerId] : null;

  function isFeatured(item) {
    return !!(partner && item.clinic && item.clinic === partner.featuredClinic);
  }
  function partnerVisible(item) {
    if (!partner) return true;
    if (!item.suburb) return true;
    if (isFeatured(item)) return true;
    return (partner.excludeSuburbs || []).indexOf(item.suburb) === -1;
  }
  function partnerSort(list) {
    if (!partner) return list;
    return list.slice().sort(function (a, b) {
      return (isFeatured(b) ? 1 : 0) - (isFeatured(a) ? 1 : 0);
    });
  }

  function url(v) {
    return (v && v.indexOf("REPLACE_ME") !== 0) ? v : "";
  }
  function platform(name) { return url(L[name]) || "#"; }
  function epLink(id, kind) {
    var ep = (L.episodes || {})[id] || {};
    return url(ep[kind]) || platform(kind === "spotify" ? "spotify" : "youtube");
  }
  function clipLink(id) {
    return url((L.clips || {})[id]) || platform("youtube");
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

  /* ----- Card templates ----- */
  var playSvg = '<span class="play"><span class="play-badge"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></span>';

  function tagRow(item) {
    var html = "";
    if (isFeatured(item)) html += '<span class="tag tag-yours">Your clinic\'s doctor</span>';
    html += item.tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("");
    if (item.region) html += '<span class="tag tag-loc">' + item.region + "</span>";
    return '<div class="tag-row">' + html + "</div>";
  }

  function episodeCard(item) {
    var yt = epLink(item.id, "youtube");
    var sp = epLink(item.id, "spotify");
    if (item.type === "coming") {
      return '<article class="card coming-card reveal">' +
        '<div class="card-media"><div class="badge-art">Episode ' + item.number + '<br>coming soon</div></div>' +
        '<div class="card-body">' +
        '<span class="card-meta">Episode ' + item.number + ' · Coming soon</span>' +
        "<h3>" + item.title + "</h3>" +
        '<p class="card-desc">' + item.description + "</p>" +
        '<p class="card-guest">With ' + item.guestCredit + "</p>" +
        tagRow(item) +
        '<div class="card-actions"><a class="btn btn-ghost" data-out href="' + platform("youtube") + '">Subscribe for the release</a></div>' +
        "</div></article>";
    }
    return '<article class="card reveal">' +
      '<a class="card-media" data-out href="' + yt + '"><img loading="lazy" src="' + item.image + '" alt="Episode ' + item.number + ": " + item.title + '">' + playSvg + "</a>" +
      '<div class="card-body">' +
      '<span class="card-meta">Episode ' + item.number + " · Full episode</span>" +
      "<h3>" + item.title + "</h3>" +
      '<p class="card-desc">' + item.description + "</p>" +
      '<p class="card-guest">With ' + item.guestCredit + "</p>" +
      tagRow(item) +
      '<div class="card-actions">' +
      '<a class="btn btn-coral" data-out href="' + yt + '">Watch on YouTube</a>' +
      '<a class="btn btn-ghost" data-out href="' + sp + '">Listen on Spotify</a>' +
      "</div></div></article>";
  }

  function clipCard(item) {
    var link = clipLink(item.id);
    return '<article class="card clip-card reveal">' +
      '<a class="card-media" data-out href="' + link + '"><img loading="lazy" src="' + item.image + '" alt="' + item.title + '">' + playSvg + "</a>" +
      '<div class="card-body">' +
      '<span class="card-meta">Clip · Ep ' + item.episode + "</span>" +
      "<h3>" + item.title + "</h3>" +
      "</div></article>";
  }

  function searchCard(item) {
    return item.type === "clip" ? clipCardFull(item) : episodeCard(item);
  }

  function clipCardFull(item) {
    var link = clipLink(item.id);
    return '<article class="card reveal">' +
      '<a class="card-media" data-out href="' + link + '" style="aspect-ratio:16/10"><img loading="lazy" src="' + item.image + '" alt="' + item.title + '" style="object-position:top">' + playSvg + "</a>" +
      '<div class="card-body">' +
      '<span class="card-meta">Short clip · From episode ' + item.episode + "</span>" +
      "<h3>" + item.title + "</h3>" +
      '<p class="card-desc">' + item.description + "</p>" +
      '<p class="card-guest">With ' + item.guest + "</p>" +
      tagRow(item) +
      '<div class="card-actions"><a class="btn btn-coral" data-out href="' + link + '">Watch on YouTube</a></div>' +
      "</div></article>";
  }

  function wireOutLinks(root) {
    (root || document).querySelectorAll("[data-out]").forEach(function (a) {
      a.target = "_blank"; a.rel = "noopener";
    });
  }

  /* ----- Now playing chip (hero) ----- */
  var nowChip = document.getElementById("now-playing");
  if (nowChip) {
    var latest = DATA.filter(function (d) { return d.type === "episode"; })
      .sort(function (a, b) { return b.number - a.number; })[0];
    if (latest) {
      nowChip.querySelector("small").textContent = "Ep " + latest.number + ": " + latest.title;
      nowChip.href = epLink(latest.id, "youtube");
      nowChip.target = "_blank";
      nowChip.rel = "noopener";
    } else {
      nowChip.style.display = "none";
    }
  }

  /* ----- Home page grids ----- */
  var epGrid = document.getElementById("home-episodes");
  if (epGrid) {
    var eps = DATA.filter(function (d) { return d.type === "episode" || d.type === "coming"; });
    epGrid.innerHTML = eps.map(episodeCard).join("");
  }
  var clipRow = document.getElementById("home-clips");
  if (clipRow) {
    var clips = DATA.filter(function (d) { return d.type === "clip"; });
    clipRow.innerHTML = clips.map(clipCard).join("");
  }

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

    function matches(item, q) {
      if (!q) return true;
      var hay = normalise(item.title + " " + (item.guest || "") + " " + item.description + " " + item.tags.join(" ") + " " + (item.region || "") + " " + (item.keywords || ""));
      return q.split(/\s+/).every(function (word) { return hay.indexOf(word) !== -1; });
    }

    function render() {
      var q = normalise(searchInput.value.trim());
      var hits = DATA.filter(function (d) { return partnerVisible(d) && matches(d, q); });
      hits = partnerSort(hits);
      chips.forEach(function (c) { c.classList.toggle("active", normalise(c.getAttribute("data-q")) === q); });
      if (!hits.length) {
        countEl.textContent = "";
        resultsEl.innerHTML = '<div class="no-results"><h3>No results for "' + searchInput.value + '"</h3>' +
          '<p>Try a different keyword, like skin checks, men\'s health or hearing. New topics are added with every episode.</p></div>';
        return;
      }
      var epsCount = hits.filter(function (h) { return h.type !== "clip"; }).length;
      var clipCount = hits.length - epsCount;
      countEl.textContent = q
        ? hits.length + " result" + (hits.length === 1 ? "" : "s") + " for \"" + searchInput.value.trim() + "\""
        : "Showing all " + epsCount + " episodes and " + clipCount + " clips";
      resultsEl.innerHTML = '<div class="grid grid-3">' + hits.map(searchCard).join("") + "</div>";
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
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      document.querySelector(".nav").classList.toggle("open");
    });
  }

  /* ----- Reveal on scroll ----- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  wireOutLinks(document);
})();
