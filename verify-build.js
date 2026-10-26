#!/usr/bin/env node
/* =========================================================
   ON THE MEND - BUILD VERIFIER
   ---------------------------------------------------------
   build.js writes card markup into the HTML. site.js writes the
   same cards at runtime. If those two ever disagree, the page
   would visibly "jump" when JavaScript loads.

   This script runs site.js against a minimal fake DOM and diffs
   its output against the static blocks build.js produced.

   Run after build.js:   node verify-build.js
   ========================================================= */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

/* ---------- minimal DOM ---------- */
function el() {
  const e = {
    innerHTML: "", textContent: "", style: {}, children: [],
    classList: { toggle() {}, add() {}, remove() {}, contains: () => false },
    getAttribute: () => null, setAttribute() {}, addEventListener() {},
    closest: () => null, querySelector: () => el(), querySelectorAll: () => [],
    appendChild() {}, insertBefore() {}, focus() {}
  };
  return e;
}

function runSiteJs() {
  const results = el(), count = el(), input = el(), homeEps = el(), homeClips = el(), homeNext = el();
  input.value = "";
  const byId = {
    "search-results": results, "results-count": count, "search-input": input,
    "home-episodes": homeEps, "home-clips": homeClips, "home-next": homeNext, "now-playing": null
  };
  let renderFn = null;
  input.addEventListener = (ev, fn) => { if (ev === "input") renderFn = fn; };

  const sandbox = {
    window: {}, console: { log() {}, warn() {}, error() {} },
    URLSearchParams: class { constructor() {} get() { return null; } },
    IntersectionObserver: class { observe() {} unobserve() {} },
    location: { search: "" },
    document: {
      getElementById: (id) => (id in byId ? byId[id] : null),
      querySelector: (s) => (s === ".search-bar" ? { parentNode: { insertBefore() {} } } : null),
      querySelectorAll: () => [],
      createElement: el, body: { appendChild() {}, style: {} },
      activeElement: { focus() {} }, addEventListener() {}
    }
  };
  sandbox.window.document = sandbox.document;
  vm.createContext(sandbox);
  vm.runInContext(read("assets/episodes.js"), sandbox);
  vm.runInContext(read("assets/links.js"), sandbox);
  vm.runInContext(read("assets/partners.js"), sandbox);
  vm.runInContext(read("assets/cards.js"), sandbox);
  vm.runInContext(read("assets/site.js"), sandbox);
  if (renderFn) renderFn();
  return { homeEps: homeEps.innerHTML, homeClips: homeClips.innerHTML, homeNext: homeNext.innerHTML, hub: results.innerHTML };
}

/* ---------- pull the static blocks back out ---------- */
function block(file, name) {
  const s = read(file);
  const open = "<!--BUILD:" + name + "-->", close = "<!--/BUILD:" + name + "-->";
  const i = s.indexOf(open), j = s.indexOf(close);
  if (i === -1 || j === -1) return null;
  return s.slice(i + open.length, j);
}

/* ---------- compare ---------- */
const live = runSiteJs();
const checks = [
  ["home episode cards", block("index.html", "home-episodes"), live.homeEps],
  ["home clip row", block("index.html", "home-clips"), live.homeClips],
  ["home coming next", block("index.html", "home-next"), live.homeNext],
  ["episodes hub list", block("episodes/index.html", "episode-list"), live.hub]
];

let failed = 0;
console.log("Comparing build.js output against site.js output\n");
for (const [name, staticHtml, liveHtml] of checks) {
  if (staticHtml === null) { console.log("  !!  " + name + ": marker not found"); failed++; continue; }
  if (staticHtml === liveHtml) {
    console.log("  ok  " + name + " (" + staticHtml.length + " chars, identical)");
  } else {
    failed++;
    console.log("  !!  " + name + " DIFFERS");
    console.log("      static: " + staticHtml.length + " chars");
    console.log("      live:   " + liveHtml.length + " chars");
    for (let i = 0; i < Math.max(staticHtml.length, liveHtml.length); i++) {
      if (staticHtml[i] !== liveHtml[i]) {
        console.log("      first difference at character " + i + ":");
        console.log("        static: ..." + JSON.stringify(staticHtml.slice(Math.max(0, i - 40), i + 60)));
        console.log("        live:   ..." + JSON.stringify(liveHtml.slice(Math.max(0, i - 40), i + 60)));
        break;
      }
    }
  }
}

/* ---------- real platform links and the visitor counter on every page ---------- */
console.log("\nPlatform links and visitor counter");
(function walk(dir) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir ? dir + "/" + e.name : e.name;
    if (e.isDirectory()) {
      if (!["design-options", ".git", "assets", "node_modules", "print"].includes(e.name)) walk(rel);
    } else if (e.name.endsWith(".html") && !e.name.startsWith("google")) {
      const s = read(rel);
      const dead = (s.match(/<a [^>]*data-link="[a-z]+"[^>]*href="#"/g) || []).length;
      const counter = s.includes("gc.zgo.at/count.js");
      if (dead || !counter) {
        console.log("  !!  " + rel + (dead ? "  " + dead + " button(s) still link to #" : "") + (counter ? "" : "  no visitor counter"));
        failed++;
      }
    }
  }
})("");
console.log(failed ? "" : "  ok  every page has real links and the counter");

/* ---------- every episode page reachable by a static link ---------- */
console.log("\nStatic crawl paths");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(read("assets/episodes.js"), sandbox);
const pages = (sandbox.window.OTM_DATA || []).filter((d) => d.page).map((d) => d.page);
const html = ["index.html", "about/index.html", "faq/index.html", "clinics/index.html",
  "contact/index.html", "episodes/index.html", "404.html"].filter((f) => fs.existsSync(path.join(ROOT, f))).map(read).join("");
for (const p of pages) {
  const n = (html.match(new RegExp('href="' + p + '"', "g")) || []).length;
  console.log((n > 0 ? "  ok  " : "  !!  ") + p + "  " + n + " static links");
  if (!n) failed++;
}

console.log(failed ? "\n" + failed + " problem(s) found." : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
