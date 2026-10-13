#!/usr/bin/env node
/* =========================================================
   ON THE MEND - STATIC SITE BUILD
   ---------------------------------------------------------
   Why this exists:
   Search engines deprioritise pages they can only reach by
   running JavaScript. This script writes the episode cards,
   links and lists into the HTML itself, so crawlers see real
   content, and site.js then takes over the same containers for
   search, partner views and scheduled clip releases.

   HOW TO USE
     1. Add or edit the episode in assets/episodes.js
        (and its URLs in assets/links.js)
     2. Run:  node build.js && node verify-build.js
     3. Commit and push

   WHAT IT WRITES  (everything between <!--BUILD:x--> markers)
     every page          the navigation, with the current page highlighted
     every page footer   the newest FOOTER_EPISODES episodes
     index.html          now-playing chip, latest episodes, coming next, clip row
     episodes/index.html the full grouped list of episodes and clips + schema
     each episode page   its released clips and links to neighbouring episodes
     about/index.html    the guest list
     sitemap.xml         every page, dated by its last real change

   Card markup lives in assets/cards.js, shared with site.js,
   so the static HTML and the live page always match.
   ========================================================= */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execSync } = require("child_process");

const ROOT = __dirname;
const SITE = "https://onthemendgp.com.au";
const FOOTER_EPISODES = 3;      // how many episodes to list in the footer

/* ---------- load the data files and the shared templates ---------- */
function load() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const f of ["assets/episodes.js", "assets/links.js", "assets/cards.js"]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox);
  }
  return sandbox.window;
}
const W = load();
const DATA = W.OTM_DATA || [];
const C = W.OTM_CARDS(W.OTM_LINKS, DATA, null, Date.now());

/* ---------- file helpers ---------- */
const changed = new Set();
function read(file) { return fs.readFileSync(path.join(ROOT, file), "utf8"); }
function write(file, s) {
  if (read(file) === s) return;              /* untouched files keep their dates */
  fs.writeFileSync(path.join(ROOT, file), s);
  changed.add(file);
}
function replaceBlock(s, name, html) {
  const open = "<!--BUILD:" + name + "-->", close = "<!--/BUILD:" + name + "-->";
  const i = s.indexOf(open), j = s.indexOf(close);
  if (i === -1 || j === -1) return null;
  return s.slice(0, i + open.length) + html + s.slice(j);
}
function fill(file, blocks) {
  let s = read(file);
  const missing = [];
  for (const [name, html] of blocks) {
    const out = replaceBlock(s, name, html);
    if (out === null) missing.push(name); else s = out;
  }
  write(file, s);
  return missing;
}
function allPages() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!["design-options", ".git", "assets", "node_modules"].includes(e.name)) walk(full);
      } else if (e.name.endsWith(".html") && !e.name.startsWith("google")) {
        out.push(path.relative(ROOT, full).split(path.sep).join("/"));
      }
    }
  })(ROOT);
  return out.sort();
}
function pageUrl(file) {
  if (file === "index.html") return "/";
  if (file === "404.html") return null;
  return "/" + file.replace(/index\.html$/, "");
}

/* ---------- shared pieces ---------- */
const NAV = [["/", "Home"], ["/episodes/", "Episodes"], ["/about/", "About"], ["/faq/", "FAQ"],
  ["/clinics/", "For clinics"], ["/contact/", "Contact"]];
function navHtml(u) {
  const section = u && u.startsWith("/episodes/") ? "/episodes/" : u;
  return "\n" + NAV.map(([href, label]) =>
    '      <a href="' + href + '"' + (href === section ? ' class="active" aria-current="page"' : "") +
    ">" + label + "</a>").join("\n") +
    '\n      <a class="cta" data-link="youtube" href="' + C.platform("youtube") + '">Watch on YouTube</a>\n      ';
}

function shortTitle(e) {
  return e.short || e.title.replace(/\s+with\s+.*$/i, "").replace(/[:,].*$/, "").trim();
}

/* Smaller card used for "More episodes" on an episode page */
function relatedCard(e) {
  return '<article class="card reveal"><a class="card-media" href="' + e.page + '"><img loading="lazy" src="' +
    e.image + '" alt="On The Mend, an Australian GP podcast: episode ' + e.number + ", " + e.title + '">' +
    '<span class="play"><span class="play-badge"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></span></a>' +
    '<div class="card-body"><span class="card-meta">Episode ' + e.number + " &middot; Full episode</span>" +
    '<h3><a href="' + e.page + '">' + e.title + "</a></h3>" +
    '<p class="card-desc">' + e.description + "</p>" +
    '<p class="card-guest">With ' + e.guestCredit + "</p></div></article>";
}
/* The episode just before and just after; at either end, the two nearest */
function neighbours(ep, list) {
  const i = list.findIndex((e) => e.id === ep.id);
  let pick = [list[i - 1], list[i + 1]].filter(Boolean);
  if (pick.length < 2) pick = list.filter((e) => e.id !== ep.id)
    .sort((a, b) => Math.abs(a.number - ep.number) - Math.abs(b.number - ep.number)).slice(0, 2);
  return pick.sort((a, b) => b.number - a.number);
}

/* "Where to go next": GP first, then official resources stored per episode in episodes.js */
function nextSteps(ep) {
  if (!ep.next || !ep.next.length) return "";
  return '<div class="next-steps reveal"><span class="eyebrow">Where to go next</span>' +
    "<h2>Trusted places to start</h2>" +
    '<p class="ns-gp"><strong>Start with your GP.</strong> They can tell you what applies to you.</p>' +
    '<ul class="ns-list">' + ep.next.map((r) =>
      '<li><a data-out href="' + r.url + '">' + r.label + "</a>" +
      '<span class="ns-by">' + r.by + "</span>" +
      '<span class="ns-note">' + r.note + "</span></li>").join("") + "</ul></div>";
}

function guestList() {
  const eps = C.published().concat(C.coming());
  return '<ul class="guest-list">' + eps.map((e) =>
    "<li>" + (e.page ? '<a href="' + e.page + '">' : "<span>") +
    '<span class="gl-ep">' + (e.type === "coming" ? "Episode " + e.number + " · coming soon" : "Episode " + e.number) +
    "</span><strong>" + e.guest + "</strong>" +
    '<span class="gl-credit">' + e.guestCredit.replace(e.guest, "").replace(/^,\s*/, "") + "</span>" +
    '<span class="gl-topic">' + e.title + "</span>" +
    (e.page ? "</a>" : "</span>") + "</li>").join("") + "</ul>";
}

/* ================= build ================= */
const published = C.published();
const upcoming = C.coming();
const clips = C.clips();
const today = new Date().toISOString().slice(0, 10);

console.log("On The Mend build");
console.log("  " + published.length + " published episodes, " + upcoming.length + " upcoming, " +
  clips.length + " clips live, " + (DATA.filter((d) => d.type === "clip").length - clips.length) +
  " clips scheduled\n");

const footerHtml = published.slice(0, FOOTER_EPISODES)
  .map((e) => '<li><a href="' + e.page + '">' + shortTitle(e) + "</a></li>").join("") +
  '<li><a href="/episodes/">All episodes</a></li>';

const problems = [];
for (const f of allPages()) {
  const u = pageUrl(f);
  const blocks = [["nav", navHtml(u)], ["footer-episodes", footerHtml]];

  if (f === "index.html") {
    const latest = published[0];
    blocks.push(["now-playing", latest
      ? '<span class="now-text"><b>Now playing</b><small>Ep ' + latest.number + ": " + latest.title + "</small></span>"
      : ""]);
    blocks.push(["home-episodes", published.slice(0, C.HOME_EPISODES).map(C.episodeCard).join("")]);
    blocks.push(["home-next", C.nextBand(upcoming[0])]);
    blocks.push(["home-clips", clips.map(C.clipCard).join("")]);
  }

  if (f === "episodes/index.html") {
    blocks.push(["episode-list", C.hub(C.chronoSort(C.LIVE))]);
    blocks.push(["episodes-schema", '<script type="application/ld+json">' + JSON.stringify({
      "@context": "https://schema.org", "@type": "CollectionPage",
      name: "All episodes and clips", url: SITE + "/episodes/",
      description: "Every episode and clip of On The Mend, an Australian GP podcast for patients.",
      isPartOf: { "@type": "PodcastSeries", name: "On The Mend", url: SITE + "/" },
      mainEntity: {
        "@type": "ItemList", numberOfItems: published.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: published.map((e, i) => ({ "@type": "ListItem", position: i + 1, url: SITE + e.page, name: e.title }))
      }
    }) + "</script>"]);
  }

  if (f === "about/index.html") blocks.push(["guests", guestList()]);

  if (f === "faq/index.html") {
    const names = published.slice().reverse().map((e) => e.guest + " on " + e.topic);
    const listed = names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0];
    blocks.push(["faq-guests", "So far the podcast has featured " + listed + "." +
      (upcoming[0] ? " Coming next: " + upcoming[0].guest + " on " + upcoming[0].topic + "." : "")]);
  }

  const ep = published.find((e) => e.page === u);
  if (ep) {
    const own = C.clips(ep.number);
    blocks.push(["clips", own.length
      ? '<div class="clip-grid">' + own.map(C.episodeClipCard).join("") + "</div>"
      : C.clipsPending(ep.number)]);
    blocks.push(["related", neighbours(ep, published).map(relatedCard).join("")]);
    blocks.push(["next-steps", nextSteps(ep)]);
  }

  if (f === "index.html" && published[0]) {        /* point the now-playing chip at the newest episode */
    write(f, read(f).replace(/(id="now-playing" href=")[^"]*"/, "$1" + published[0].page + '"'));
  }
  let missing = fill(f, blocks);

  /* FAQ schema is rebuilt from the visible questions, so the two always match */
  if (f === "faq/index.html") {
    const s = read(f);
    const strip = (h) => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
      .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const qa = [...s.matchAll(/<button class="faq-q">([\s\S]*?)<span class="icon">[\s\S]*?<div class="faq-a-inner">([\s\S]*?)<\/div><\/div>/g)]
      .map((m) => ({ "@type": "Question", name: strip(m[1]),
        acceptedAnswer: { "@type": "Answer", text: strip(m[2].replace(/<!--[\s\S]*?-->/g, "")) } }));
    missing = missing.concat(fill(f, [["faq-schema", '<script type="application/ld+json">' +
      JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: qa }) + "</script>"]]));
  }

  /* datePublished on the episode schema comes from episodes.js */
  if (ep && ep.published) {
    write(f, read(f).replace(/(<script type="application\/ld\+json">)(\{[^<]*"@type": ?"PodcastEpisode"[^<]*\})(<\/script>)/,
      (all, a, json, b) => { const o = JSON.parse(json); o.datePublished = ep.published; return a + JSON.stringify(o) + b; }));
  }
  missing = missing.filter((n) => !(n === "now-playing" && f !== "index.html"));
  if (missing.length) problems.push(f + " is missing markers: " + missing.join(", "));
}
console.log("  ok  navigation and footer written to " + allPages().length + " pages");
console.log("  ok  home page, episodes hub, episode pages and guest list");

/* ---------- sitemap, dated by each page's last real change ---------- */
function lastChanged(file) {
  try {
    const dirty = execSync('git status --porcelain -- "' + file + '"', { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    if (dirty || changed.has(file)) return today;
    const d = execSync('git log -1 --format=%cs -- "' + file + '"', { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    return d || today;
  } catch (e) { return today; }
}
const order = ["/", "/episodes/", ...published.map((e) => e.page), "/about/", "/faq/", "/clinics/", "/contact/"];
const files = allPages().filter((f) => pageUrl(f));
const urls = order.filter((u) => files.some((f) => pageUrl(f) === u))
  .concat(files.map(pageUrl).filter((u) => !order.includes(u)));
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => {
    const f = files.find((x) => pageUrl(x) === u);
    return "  <url>\n    <loc>" + SITE + u + "</loc>\n    <lastmod>" + lastChanged(f) +
      "</lastmod>\n    <changefreq>" + (u === "/" || u === "/episodes/" ? "weekly" : "monthly") +
      "</changefreq>\n    <priority>" + (u === "/" ? "1.0" : u.startsWith("/episodes/") ? "0.9" : "0.6") +
      "</priority>\n  </url>";
  }).join("\n") + "\n</urlset>\n";
if (!fs.existsSync(path.join(ROOT, "sitemap.xml")) || read("sitemap.xml") !== sitemap) {
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);
}
console.log("  ok  sitemap.xml with " + urls.length + " URLs");

console.log("\n  " + changed.size + " page(s) changed" + (changed.size ? ": " + [...changed].join(", ") : ""));
if (problems.length) { console.log("\n  !!  " + problems.join("\n  !!  ")); process.exitCode = 1; }
console.log("\nDone. Run node verify-build.js, then commit and push.");
