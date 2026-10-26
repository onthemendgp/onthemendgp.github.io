/* =========================================================
   ON THE MEND – SHARED CARD TEMPLATES
   ---------------------------------------------------------
   One copy of every card, list and filter rule, used by both:
     - assets/site.js  (in the browser, for search and live updates)
     - build.js        (at build time, to write static HTML for crawlers)
   Because both read this file, the static HTML and the live page
   cannot drift apart. Change a card here and run `node build.js`.
   ========================================================= */
window.OTM_CARDS = function (L, DATA, partner, now) {
  L = L || {};
  DATA = DATA || [];
  now = now || Date.now();

  /* ---------- scheduling ---------- */
  /* A clip with a future "release" time stays hidden until then */
  function isLive(item) {
    return !item.release || Date.parse(item.release) <= now;
  }
  var LIVE = DATA.filter(isLive);

  /* ---------- links ---------- */
  function url(v) { return (v && v.indexOf("REPLACE_ME") !== 0) ? v : ""; }
  function platform(name) { return url(L[name]) || "#"; }
  function epLink(id, kind) {
    var ep = (L.episodes || {})[id] || {};
    return url(ep[kind]) || platform(kind === "spotify" ? "spotify" : "youtube");
  }
  function clipLink(id) { return url((L.clips || {})[id]) || platform("youtube"); }

  /* Card image: the "image" in episodes.js when set, otherwise the video's own
     YouTube thumbnail, so a new episode or clip shows its thumbnail as soon as
     its YouTube link is in links.js */
  function thumb(item) {
    if (item.image) return item.image;
    var id = item.type === "clip"
      ? ((/(?:shorts\/|youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{6,})/.exec(url((L.clips || {})[item.id])) || [])[1])
      : ((L.episodes || {})[item.id] || {}).youtubeId;
    return id ? "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg" : "/assets/img/hero.jpg";
  }
  function episodePage(num) {
    for (var i = 0; i < DATA.length; i++) {
      if (DATA[i].type === "episode" && DATA[i].number === num && DATA[i].page) return DATA[i].page;
    }
    return "";
  }

  /* ---------- ordering ---------- */
  /* Newest first: published episodes by number, then coming soon, then clips newest episode first */
  function chronoSort(list) {
    return list.slice().sort(function (a, b) {
      var clipA = a.type === "clip" ? 1 : 0, clipB = b.type === "clip" ? 1 : 0;
      if (clipA !== clipB) return clipA - clipB;
      if (clipA === 1) return (b.episode || 0) - (a.episode || 0);
      var comA = a.type === "coming" ? 1 : 0, comB = b.type === "coming" ? 1 : 0;
      if (comA !== comB) return comA - comB;
      return (b.number || 0) - (a.number || 0);
    });
  }
  function published() {
    return chronoSort(LIVE.filter(function (d) { return d.type === "episode"; }));
  }
  function coming() {
    return LIVE.filter(function (d) { return d.type === "coming"; })
      .sort(function (a, b) { return a.number - b.number; });
  }
  function clips(episodeNumber) {
    return chronoSort(LIVE.filter(function (d) {
      return d.type === "clip" && (episodeNumber == null || d.episode === episodeNumber);
    }));
  }

  /* ---------- streams ---------- */
  /* Episodes carry "stream"; a clip follows its episode. Default is Health, explained */
  function streamOf(item) {
    if (item.stream) return item.stream;
    if (item.type === "clip") {
      for (var i = 0; i < DATA.length; i++) {
        if (DATA[i].type !== "clip" && DATA[i].number === item.episode) return DATA[i].stream || "health";
      }
    }
    return "health";
  }
  var STREAM_LABEL = { health: "Health, explained", behind: "Behind the scenes" };

  /* ---------- search ---------- */
  var STATE_NAMES = { VIC: "Victoria", NSW: "New South Wales", QLD: "Queensland",
    SA: "South Australia", WA: "Western Australia", TAS: "Tasmania",
    NT: "Northern Territory", ACT: "Australian Capital Territory" };

  /* Suburb, state code and full state name are all searchable */
  function locationTerms(item) {
    return [item.suburb || "", item.state || "", STATE_NAMES[item.state] || ""].join(" ");
  }
  /* Every word of the query must start a word somewhere in the item,
     so "skin" finds "skin checks" but not "asking" */
  function matches(item, q) {
    if (!q) return true;
    var hay = " " + (item.title + " " + (item.guest || "") + " " + item.description + " " + item.tags.join(" ") +
      " " + locationTerms(item) + " " + (item.keywords || "")).toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (word) {
      var esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp("[^a-z0-9]" + esc).test(hay);
    });
  }

  /* ---------- partner clinic view (?p=code) ---------- */
  function isFeatured(item) {
    return !!(partner && item.clinic && item.clinic === partner.featuredClinic);
  }

  /* ---------- pieces ---------- */
  var PLAY = '<span class="play"><span class="play-badge"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></span>';

  function locationLabel(item) {
    if (item.suburb && item.state) return item.suburb + ", " + item.state;
    return item.suburb || item.state || "";
  }

  function tagRow(item) {
    var html = "";
    if (isFeatured(item)) html += '<span class="tag tag-yours">Your clinic\'s doctor</span>';
    html += item.tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("");
    var loc = locationLabel(item);
    if (loc) html += '<span class="tag tag-loc">' + loc + "</span>";
    return '<div class="tag-row">' + html + "</div>";
  }

  /* ---------- cards ---------- */
  function episodeCard(item) {
    var yt = epLink(item.id, "youtube");
    var sp = epLink(item.id, "spotify");
    if (item.type === "coming") {
      return '<article class="card coming-card reveal">' +
        '<div class="card-media"><div class="badge-art">Episode ' + item.number + "<br>coming soon</div></div>" +
        '<div class="card-body">' +
        '<span class="card-meta">Episode ' + item.number + " · Coming soon</span>" +
        "<h3>" + item.title + "</h3>" +
        '<p class="card-desc">' + item.description + "</p>" +
        '<p class="card-guest">With ' + item.guestCredit + "</p>" +
        tagRow(item) +
        '<div class="card-actions"><a class="btn btn-ghost" data-out href="' + platform("youtube") + '">Subscribe for the release</a></div>' +
        "</div></article>";
    }
    var stream = streamOf(item);
    return '<article class="card stream-' + stream + ' reveal">' +
      '<a class="card-media"' + (item.page ? ' href="' + item.page + '"' : ' data-out href="' + yt + '"') +
      '><img loading="lazy" src="' + thumb(item) + '" alt="On The Mend, an Australian GP podcast: episode ' +
      item.number + ", " + item.title + '">' + PLAY +
      '<span class="stream-flag">' + STREAM_LABEL[stream] + "</span></a>" +
      '<div class="card-body">' +
      '<span class="card-meta">Episode ' + item.number + " · Full episode</span>" +
      "<h3>" + (item.page ? '<a href="' + item.page + '">' + item.title + "</a>" : item.title) + "</h3>" +
      '<p class="card-desc">' + item.description + "</p>" +
      '<p class="card-guest">With ' + item.guestCredit + "</p>" +
      tagRow(item) +
      '<div class="card-actions">' +
      (item.page ? '<a class="btn btn-coral" href="' + item.page + '">Watch the episode</a>'
                 : '<a class="btn btn-coral" data-out href="' + yt + '">Watch on YouTube</a>') +
      '<a class="btn btn-ghost" data-out href="' + sp + '">Listen on Spotify</a>' +
      "</div></div></article>";
  }

  /* Compact card for the home page clip row */
  function clipCard(item) {
    return '<article class="card clip-card stream-' + streamOf(item) + ' reveal">' +
      '<a class="card-media" data-out href="' + clipLink(item.id) + '"><img loading="lazy" src="' + thumb(item) +
      '" alt="' + item.title + '">' + PLAY + "</a>" +
      '<div class="card-body">' +
      '<span class="card-meta">Clip · Ep ' + item.episode + "</span>" +
      "<h3>" + item.title + "</h3>" +
      "</div></article>";
  }

  /* Compact card for the clip grid on an episode page */
  function episodeClipCard(item) {
    return '<article class="card clip-card reveal">' +
      '<a class="card-media" data-out href="' + clipLink(item.id) + '"><img loading="lazy" src="' + thumb(item) +
      '" alt="' + item.title + '">' + PLAY + "</a>" +
      '<div class="card-body"><span class="card-meta">Clip</span><h3>' + item.title + "</h3></div></article>";
  }

  /* Full card for the episodes hub */
  function clipCardFull(item) {
    var link = clipLink(item.id);
    var page = episodePage(item.episode);
    return '<article class="card stream-' + streamOf(item) + ' reveal">' +
      '<a class="card-media" data-out href="' + link + '" style="aspect-ratio:16/10"><img loading="lazy" src="' +
      thumb(item) + '" alt="' + item.title + '" style="object-position:top">' + PLAY + "</a>" +
      '<div class="card-body">' +
      '<span class="card-meta">Short clip &middot; ' +
      (page ? '<a href="' + page + '">From episode ' + item.episode + "</a>" : "From episode " + item.episode) +
      "</span>" +
      "<h3>" + item.title + "</h3>" +
      '<p class="card-desc">' + item.description + "</p>" +
      '<p class="card-guest">With ' + item.guest + "</p>" +
      tagRow(item) +
      '<div class="card-actions"><a class="btn btn-coral" data-out href="' + link + '">Watch on YouTube</a></div>' +
      "</div></article>";
  }

  /* "Coming next" band on the home page */
  function nextBand(item) {
    if (!item) return "";
    return '<div class="next-band reveal">' +
      '<div class="next-badge"><span>Episode ' + item.number + "</span>coming soon</div>" +
      '<div class="next-text">' +
      '<span class="eyebrow">Coming next</span>' +
      "<h3>" + item.title + "</h3>" +
      "<p>" + item.description + "</p>" +
      '<p class="card-guest">With ' + item.guestCredit + "</p>" +
      "</div>" +
      '<a class="btn btn-ghost" data-out href="' + platform("youtube") + '">Subscribe for the release</a>' +
      "</div>";
  }

  /* Empty state for an episode page whose clips have not been released yet */
  function clipsPending(episodeNumber) {
    var upcoming = DATA.filter(function (d) {
      return d.type === "clip" && d.episode === episodeNumber && !isLive(d);
    }).sort(function (a, b) { return Date.parse(a.release) - Date.parse(b.release); });
    if (!upcoming.length) return "";
    var months = ["January", "February", "March", "April", "May", "June", "July", "August",
      "September", "October", "November", "December"];
    var when = upcoming[0].release.slice(8, 10).replace(/^0/, "") + " " +
      months[parseInt(upcoming[0].release.slice(5, 7), 10) - 1];
    return '<p class="clips-pending">Short clips from this episode are released weekly from ' + when +
      ". Follow along on " + '<a data-out href="' + platform("youtube") + '">YouTube</a> or ' +
      '<a data-out href="' + platform("instagram") + '">Instagram</a>.</p>';
  }

  /* Grouped list for the episodes hub and its search */
  function group(label, note, list) {
    if (!list.length) return "";
    return '<div class="result-group">' +
      '<div class="group-head">' +
      "<h2>" + label + ' <span class="group-count">' + list.length + "</span></h2>" +
      "<p>" + note + "</p>" +
      "</div>" +
      '<div class="grid grid-3">' + list.map(function (i) {
        return i.type === "clip" ? clipCardFull(i) : episodeCard(i);
      }).join("") + "</div></div>";
  }

  function hub(list) {
    var eps = list.filter(function (h) { return h.type !== "clip"; });
    var cl = list.filter(function (h) { return h.type === "clip"; });
    return group("Full episodes", "The complete conversations, around 10 to 15 minutes.", eps) +
      group("Short clips", "One or two minute highlights pulled from the episodes above.", cl);
  }

  /* Hero photo description for the newest episode */
  function heroAlt(item) {
    return "On The Mend, an Australian GP podcast: episode " + item.number + ", " + item.title + ", with " + item.guest;
  }

  /* Hero counts: full episodes, released clips and guests so far */
  function heroStats() {
    var eps = published();
    var guests = {};
    eps.forEach(function (e) { if (e.guest) guests[e.guest] = 1; });
    function stat(n, label) { return '<div class="stat"><b>' + n + "</b><span>" + label + "</span></div>"; }
    return stat(eps.length, "Full episodes") + stat(clips().length, "Short clips") +
      stat(Object.keys(guests).length, "Guests so far");
  }

  /* Home page "What brings you in today?" results: episodes first, then clips */
  function finder(list) {
    var eps = list.filter(function (h) { return h.type === "episode"; });
    var cl = list.filter(function (h) { return h.type === "clip"; });
    return eps.map(episodeCard).join("") + cl.map(clipCardFull).join("");
  }

  return {
    LIVE: LIVE, isLive: isLive, url: url, platform: platform, epLink: epLink, clipLink: clipLink,
    episodePage: episodePage, chronoSort: chronoSort, published: published, coming: coming,
    clips: clips, isFeatured: isFeatured, locationLabel: locationLabel, tagRow: tagRow,
    streamOf: streamOf, STREAM_LABEL: STREAM_LABEL, locationTerms: locationTerms, matches: matches,
    episodeCard: episodeCard, clipCard: clipCard, episodeClipCard: episodeClipCard,
    clipCardFull: clipCardFull, thumb: thumb, nextBand: nextBand, clipsPending: clipsPending, group: group, hub: hub,
    finder: finder, heroStats: heroStats, heroAlt: heroAlt, HOME_EPISODES: 3, WATCH_CLIPS: 3
  };
};
