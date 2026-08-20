#!/usr/bin/env node
/* =========================================================
   ON THE MEND - STATIC SITE BUILD
   ---------------------------------------------------------
   Why this exists:
   Search engines deprioritise pages they can only reach by
   running JavaScript. Episode pages were being discovered from
   the sitemap but never crawled, because every link to them was
   generated at runtime by site.js. This script writes those
   links and cards into the HTML itself, so crawlers see real
   content and site.js simply enhances it with search.

   HOW TO USE
     1. Add or edit the episode in assets/episodes.js
        (and its URLs in assets/links.js)
     2. Run:  node build.js
     3. Commit and push

   WHAT IT WRITES  (everything between <!--BUILD:x--> markers)
     index.html            latest episode cards + clip row
     episodes/index.html   full grouped list of episodes and clips
     every page footer     the newest FOOTER_EPISODES episodes
     sitemap.xml           every page, with today's date

   The card markup below mirrors site.js. If you change how a
   card looks in one file, change it in the other, then run
   `node verify-build.js` to confirm they still match.
   ========================================================= */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const SITE = "https://onthemendgp.com.au";
const FOOTER_EPISODES = 3;      // how many episodes to list in the footer
const HOME_EPISODES = 0;        // 0 = show all on the home page

/* ---------- load the data files ---------- */
function load() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const f of ["assets/episodes.js", "assets/links.js"]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox);
  }
  return { DATA: sandbox.window.OTM_DATA || [], L: sandbox.window.OTM_LINKS || {} };
}

const { DATA, L } = load();

/* ---------- link helpers (same rules as site.js) ---------- */
const url = (v) => (v && v.indexOf("REPLACE_ME") !== 0 ? v : "");
const platform = (n) => url(L[n]) || "#";
const epLink = (id, kind) => url(((L.episodes || {})[id] || {})[kind]) ||
  platform(kind === "spotify" ? "spotify" : "youtube");
const clipLink = (id) => url((L.clips || {})[id]) || platform("youtube");
const episodePage = (num) => {
  const e = DATA.find((d) => d.type === "episode" && d.number === num && d.page);
  return e ? e.page : "";
};

/* ---------- ordering (same as chronoSort in site.js) ---------- */
function chronoSort(list) {
  return list.slice().sort((a, b) => {
    const ca = a.type === "clip" ? 1 : 0, cb = b.type === "clip" ? 1 : 0;
    if (ca !== cb) return ca - cb;
    if (ca === 1) return (b.episode || 0) - (a.episode || 0);
    const ma = a.type === "coming" ? 1 : 0, mb = b.type === "coming" ? 1 : 0;
    if (ma !== mb) return ma - mb;
    return (b.number || 0) - (a.number || 0);
  });
}

/* ---------- card markup (mirrors site.js) ---------- */
const PLAY = '<span class="play"><span class="play-badge"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></span>';

const STATE_NAMES = { VIC: "Victoria", NSW: "New South Wales", QLD: "Queensland",
  SA: "South Australia", WA: "Western Australia", TAS: "Tasmania",
  NT: "Northern Territory", ACT: "Australian Capital Territory" };

function locationLabel(item) {
  if (item.suburb && item.state) return item.suburb + ", " + item.state;
  return item.suburb || item.state || "";
}

function tagRow(item) {
  let html = item.tags.map((t) => '<span class="tag">' + t + "</span>").join("");
  const loc = locationLabel(item);
  if (loc) html += '<span class="tag tag-loc">' + loc + "</span>";
  return '<div class="tag-row">' + html + "</div>";
}

function episodeCard(item) {
  const yt = epLink(item.id, "youtube");
  const sp = epLink(item.id, "spotify");
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
  return '<article class="card reveal">' +
    '<a class="card-media"' + (item.page ? ' href="' + item.page + '"' : ' data-out href="' + yt + '"') +
    '><img loading="lazy" src="' + item.image + '" alt="On The Mend, an Australian GP podcast: episode ' +
    item.number + ", " + item.title + '">' + PLAY + "</a>" +
    '<div class="card-body">' +
    '<span class="card-meta">Episode ' + item.number + " · Full episode</span>" +
    "<h3>" + (item.page ? '<a href="' + item.page + '">' + item.title + "</a>" : item.title) + "</h3>" +
    '<p class="card-desc">' + item.description + "</p>" +
    '<p class="card-guest">With ' + item.guestCredit + "</p>" +
    tagRow(item) +
    '<div class="card-actions">' +
    '<a class="btn btn-coral" data-out href="' + yt + '">Watch on YouTube</a>' +
    '<a class="btn btn-ghost" data-out href="' + sp + '">Listen on Spotify</a>' +
    "</div></div></article>";
}

function clipCard(item) {
  const link = clipLink(item.id);
  return '<article class="card clip-card reveal">' +
    '<a class="card-media" data-out href="' + link + '"><img loading="lazy" src="' + item.image +
    '" alt="' + item.title + '">' + PLAY + "</a>" +
    '<div class="card-body">' +
    '<span class="card-meta">Clip · Ep ' + item.episode + "</span>" +
    "<h3>" + item.title + "</h3>" +
    "</div></article>";
}

function clipCardFull(item) {
  const link = clipLink(item.id);
  const page = episodePage(item.episode);
  return '<article class="card reveal">' +
    '<a class="card-media" data-out href="' + link + '" style="aspect-ratio:16/10"><img loading="lazy" src="' +
    item.image + '" alt="' + item.title + '" style="object-position:top">' + PLAY + "</a>" +
    '<div class="card-body">' +
    '<span class="card-meta">Short clip &middot; ' +
    (page ? '<a href="' + page + '">From episode ' + item.episode + "</a>"
          : "From episode " + item.episode) + "</span>" +
    "<h3>" + item.title + "</h3>" +
    '<p class="card-desc">' + item.description + "</p>" +
    '<p class="card-guest">With ' + item.guest + "</p>" +
    tagRow(item) +
    '<div class="card-actions"><a class="btn btn-coral" data-out href="' + link + '">Watch on YouTube</a></div>' +
    "</div></article>";
}

/* Footer labels stay short: use episode.short if set, else cut at a colon, comma or " with " */
function shortTitle(t) {
  return t.replace(/\s+with\s+.*$/i, "").replace(/[:,].*$/, "").trim();
}

function group(label, note, list) {
  if (!list.length) return "";
  return '<div class="result-group">' +
    '<div class="group-head">' +
    "<h2>" + label + ' <span class="group-count">' + list.length + "</span></h2>" +
    "<p>" + note + "</p>" +
    "</div>" +
    '<div class="grid grid-3">' + list.map((i) => (i.type === "clip" ? clipCardFull(i) : episodeCard(i))).join("") +
    "</div></div>";
}

/* ---------- write between markers ---------- */
function replaceBlock(file, name, html) {
  const p = path.join(ROOT, file);
  let s = fs.readFileSync(p, "utf8");
  const open = "<!--BUILD:" + name + "-->", close = "<!--/BUILD:" + name + "-->";
  const i = s.indexOf(open), j = s.indexOf(close);
  if (i === -1 || j === -1) return false;
  s = s.slice(0, i + open.length) + html + s.slice(j);
  fs.writeFileSync(p, s);
  return true;
}

function allPages() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== "design-options" && e.name !== ".git" && e.name !== "assets") walk(full); }
      else if (e.name.endsWith(".html") && !e.name.startsWith("google")) out.push(path.relative(ROOT, full));
    }
  })(ROOT);
  return out;
}

/* ================= build ================= */
const episodes = chronoSort(DATA.filter((d) => d.type === "episode" || d.type === "coming"));
const clips = chronoSort(DATA.filter((d) => d.type === "clip"));
const published = episodes.filter((e) => e.type === "episode" && e.page);

console.log("On The Mend build");
console.log("  " + published.length + " published episodes, " +
  (episodes.length - published.length) + " upcoming, " + clips.length + " clips\n");

/* home page */
const homeEps = HOME_EPISODES ? episodes.slice(0, HOME_EPISODES) : episodes;
console.log(replaceBlock("index.html", "home-episodes", homeEps.map(episodeCard).join("")) ? "  ok  index.html home-episodes" : "  !!  index.html home-episodes marker missing");
console.log(replaceBlock("index.html", "home-clips", clips.map(clipCard).join("")) ? "  ok  index.html home-clips" : "  !!  index.html home-clips marker missing");

/* episodes hub: the full static list, grouped the same way the search groups it */
const hub =
  group("Full episodes", "The complete conversations, usually 10 to 15 minutes.", episodes) +
  group("Short clips", "One or two minute highlights pulled from the episodes above.", clips);
console.log(replaceBlock("episodes/index.html", "episode-list", hub) ? "  ok  episodes/index.html episode-list" : "  !!  episodes hub marker missing");

/* episodes hub: CollectionPage describing the library, with an ordered ItemList */
const collection = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "All episodes and clips",
  url: SITE + "/episodes/",
  description: "Every episode and clip of On The Mend, an Australian GP podcast for patients.",
  isPartOf: { "@type": "PodcastSeries", name: "On The Mend", url: SITE + "/" },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: published.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: published.map((e, i) => ({
      "@type": "ListItem", position: i + 1, url: SITE + e.page, name: e.title
    }))
  }
};
console.log(replaceBlock("episodes/index.html", "episodes-schema",
  '<script type="application/ld+json">' + JSON.stringify(collection) + "</script>")
  ? "  ok  episodes/index.html CollectionPage schema (" + published.length + " episodes)"
  : "  !!  episodes-schema marker missing");

/* footer: newest few episodes, on every page */
const footerHtml = published.slice(0, FOOTER_EPISODES)
  .map((e) => '<li><a href="' + e.page + '">' + (e.short || shortTitle(e.title)) + "</a></li>").join("") +
  '<li><a href="/episodes/">All episodes</a></li>';
let footers = 0;
for (const f of allPages()) if (replaceBlock(f, "footer-episodes", footerHtml)) footers++;
console.log("  ok  footer episode links written to " + footers + " pages");

/* sitemap */
const today = new Date().toISOString().slice(0, 10);
const urls = ["/", "/episodes/", ...published.map((e) => e.page), "/about/", "/faq/", "/clinics/", "/contact/"];
const seen = new Set(); const unique = urls.filter((u) => !seen.has(u) && seen.add(u));
fs.writeFileSync(path.join(ROOT, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  unique.map((u) =>
    "  <url>\n    <loc>" + SITE + u + "</loc>\n    <lastmod>" + today +
    "</lastmod>\n    <changefreq>" + (u === "/" || u === "/episodes/" ? "weekly" : "monthly") +
    "</changefreq>\n    <priority>" + (u === "/" ? "1.0" : u.startsWith("/episodes/") ? "0.9" : "0.6") +
    "</priority>\n  </url>").join("\n") +
  "\n</urlset>\n");
console.log("  ok  sitemap.xml rebuilt with " + unique.length + " URLs, dated " + today);

console.log("\nDone. Commit and push, then request indexing in Search Console for anything new.");
