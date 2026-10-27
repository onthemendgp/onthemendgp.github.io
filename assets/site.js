/* =========================================================
   ON THE MEND – SHARED SITE SCRIPT
   Populates links from links.js, renders episode/clip cards
   (templates live in cards.js, shared with build.js), powers the
   search and topic filter, partner clinic views (?p=code), FAQ
   accordion, mobile menu, reveals and the Shorts lightbox.
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
    var heroImg = document.getElementById("hero-img");
    if (latest && heroImg) { heroImg.src = C.thumb(latest); heroImg.alt = C.heroAlt(latest); }
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
  var watchClips = document.getElementById("watch-clips");
  if (watchClips) watchClips.innerHTML = C.clips().slice(0, C.WATCH_CLIPS).map(C.clipCard).join("");
  var statsEl = document.getElementById("hero-stats");
  if (statsEl) statsEl.innerHTML = C.heroStats();      /* clip count moves as scheduled clips release */

  /* ----- Docked episode player: plays a full episode without leaving the page ----- */
  var dock = null;
  function playEpisode(ep) {
    var id = ((L.episodes || {})[ep.id] || {}).youtubeId;
    if (!id) return false;
    if (!dock) {
      dock = document.createElement("div");
      dock.className = "player-dock";
      dock.setAttribute("role", "region");
      dock.setAttribute("aria-label", "Episode player");
      dock.innerHTML =
        '<div class="pd-frame"></div>' +
        '<div class="pd-bar">' +
        '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
        '<span class="pd-text"><b>Now playing</b><a class="pd-title"></a></span>' +
        '<button type="button" class="pd-close" aria-label="Close player">&times;</button>' +
        "</div>";
      document.body.appendChild(dock);
      dock.querySelector(".pd-close").addEventListener("click", function () {
        dock.classList.remove("open");
        dock.querySelector(".pd-frame").innerHTML = "";   /* stops playback */
      });
    }
    var title = dock.querySelector(".pd-title");
    title.textContent = "Ep " + ep.number + ": " + ep.title;
    title.href = ep.page || epLink(ep.id, "youtube");
    dock.querySelector(".pd-frame").innerHTML =
      '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1" title="' +
      ep.title.replace(/"/g, "&quot;") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    dock.classList.add("open");
    return true;
  }
  var heroPlay = document.getElementById("hero-play");
  if (heroPlay) {
    heroPlay.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var latest = C.published()[0];
      if (latest && playEpisode(latest)) e.preventDefault();
    });
  }

  /* ----- Myth or fact ----- */
  var quizCards = document.querySelectorAll(".quiz-card");
  if (quizCards.length) {
    var scoreEl = document.getElementById("quiz-score");
    var right = 0, answered = 0;
    quizCards.forEach(function (card) {
      card.querySelectorAll("[data-guess]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (card.classList.contains("answered")) return;
          var correct = btn.getAttribute("data-guess") === card.getAttribute("data-answer");
          answered++; if (correct) right++;
          card.classList.add("answered", correct ? "is-right" : "is-wrong");
          card.querySelector(".quiz-result").textContent = correct ? "You got it." : "Not quite.";
          if (scoreEl) scoreEl.textContent = "Your score: " + right + " of " + answered + ".";
          var answer = card.querySelector(".quiz-answer");
          answer.setAttribute("tabindex", "-1");
          answer.focus();
        });
      });
    });
  }

  /* ----- Episode pages: chapters jump the embedded video instead of leaving the site ----- */
  var chapterLinks = document.querySelectorAll(".chapters a");
  var epFrame = document.querySelector('iframe[src*="youtube"]');
  if (chapterLinks.length && epFrame) {
    chapterLinks.forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        var m = /[?&]v=([A-Za-z0-9_-]{6,}).*?[?&]t=(\d+)s/.exec(a.href);
        if (!m) return;
        e.preventDefault();
        epFrame.src = "https://www.youtube-nocookie.com/embed/" + m[1] + "?start=" + m[2] + "&autoplay=1&rel=0";
        chapterLinks.forEach(function (o) { o.classList.toggle("playing", o === a); });
        epFrame.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  /* ----- Episode pages: Key takeaways / Show notes / Transcript tabs -----
     Without JavaScript every panel simply shows in turn, so nothing is ever hidden from readers or Google */
  var tabList = document.querySelector(".ep-tabs");
  if (tabList) {
    var tabs = tabList.querySelectorAll("[role=tab]");
    var showTab = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabList.hidden = false;
    tabList.parentNode.classList.add("tabs-ready");
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { showTab(t); });
      t.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (step) { e.preventDefault(); showTab(tabs[(i + step + tabs.length) % tabs.length], true); }
      });
    });
    var start = location.hash === "#transcript" ? document.getElementById("tab-transcript") : tabs[0];
    showTab(start || tabs[0]);
  }

  /* ----- Episode pages: the first released clip in the side panel ----- */
  document.querySelectorAll("[data-first-clip]").forEach(function (box) {
    var first = C.clips(parseInt(box.getAttribute("data-first-clip"), 10))[0];
    if (!first) return;                    /* clips not out yet: the card points to the clips section */
    box.querySelector(".side-title").innerHTML =
      '<a class="side-clip-media" href="' + C.clipLink(first.id) + '"><img src="' + C.thumb(first) + '" alt=""><span>' + first.title + "</span></a>";
    var btn = box.querySelector(".btn");
    btn.href = C.clipLink(first.id);
    btn.textContent = "Watch the clip";
  });

  /* ----- Episode pages: copy a link to this page ----- */
  document.querySelectorAll("[data-copy-link]").forEach(function (b) {
    b.addEventListener("click", function () {
      var url = location.origin + location.pathname;
      var done = function () { b.textContent = "Link copied"; setTimeout(function () { b.textContent = "Copy link"; }, 2500); };
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(done, function () { prompt("Copy this link", url); });
      }
    });
  });

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

    var hubStream = "";
    var hubStreamBtns = document.querySelectorAll(".stream-btn");

    function render() {
      var q = normalise(searchInput.value.trim());
      hubStreamBtns.forEach(function (b) {
        var on = b.getAttribute("data-stream") === hubStream;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var hits = DATA.filter(function (d) {
        return partnerVisible(d) && C.matches(d, q) && (!hubStream || C.streamOf(d) === hubStream);
      });
      hits = partnerSort(chronoSort(hits));
      chips.forEach(function (c) {
        var on = normalise(c.getAttribute("data-q")) === q;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (!hits.length) {
        countEl.textContent = "";
        var what = [searchInput.value.trim(), hubStream ? C.STREAM_LABEL[hubStream] : ""].filter(Boolean).join(" in ");
        resultsEl.innerHTML = '<div class="no-results"><h3>No results for "' + escapeHtml(what) + '"</h3>' +
          '<p>Try a different keyword, like skin checks, men\'s health or hearing. New topics are added with every episode.</p></div>';
        return;
      }
      var eps = hits.filter(function (h) { return h.type === "episode"; });
      var soon = hits.filter(function (h) { return h.type === "coming"; });
      var clips = hits.filter(function (h) { return h.type === "clip"; });
      countEl.textContent = (q
        ? hits.length + " result" + (hits.length === 1 ? "" : "s") + " for \"" + searchInput.value.trim() + "\""
        : "Showing " + (hubStream ? "" : "all ") + eps.length + " episodes, " + clips.length + " clips" +
          (soon.length ? " and " + soon.length + " coming soon" : "")) +
        (hubStream ? " in " + C.STREAM_LABEL[hubStream] : "");

      resultsEl.innerHTML = C.hub(hits);
      wireOutLinks(resultsEl);
      resultsEl.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
    }

    searchInput.addEventListener("input", render);
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        /* a second tap on the active topic clears it */
        searchInput.value = c.classList.contains("active") ? "" : c.getAttribute("data-q");
        render();
      });
    });
    hubStreamBtns.forEach(function (b) {
      b.addEventListener("click", function () { hubStream = b.getAttribute("data-stream"); render(); });
    });
    var params = new URLSearchParams(location.search);
    if (params.get("q")) searchInput.value = params.get("q");
    if (C.STREAM_LABEL[params.get("stream")]) hubStream = params.get("stream");
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
  /* Safety net: if a browser never reports scrolling (some phone browsers), show everything anyway */
  if (typeof setTimeout === "function") setTimeout(function () { document.querySelectorAll(".reveal:not(.visible)").forEach(function (el) { el.classList.add("visible"); }); }, 2500);

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

  /* ----- Count clicks out to the platforms (GoatCounter, cookie-free) -----
     Shows up in GoatCounter as click-youtube, click-spotify and so on,
     with the page the click came from in the title. */
  var OUT = [["youtube", /(^|\.)(youtube\.com|youtu\.be)$/], ["spotify", /(^|\.)spotify\.com$/],
    ["instagram", /(^|\.)instagram\.com$/], ["facebook", /(^|\.)facebook\.com$/], ["tiktok", /(^|\.)tiktok\.com$/]];
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    var gc = window.goatcounter;
    if (!a || !gc || !gc.count) return;
    var name = null;
    if (a.closest(".chapters")) name = "chapter";          /* plays on the page, so not a YouTube click */
    else if (/^mailto:/i.test(a.href)) name = "email";
    else if (/docs\.google\.com\/forms\//.test(a.href)) name = "question-form";
    else {
      var host = "";
      try { host = new URL(a.href).hostname; } catch (err) { return; }
      for (var i = 0; i < OUT.length; i++) if (OUT[i][1].test(host)) { name = OUT[i][0]; break; }
    }
    if (!name) return;
    gc.count({ path: "click-" + name, title: "Click to " + name + " from " + location.pathname, event: true });
  });

  wireOutLinks(document);
})();
