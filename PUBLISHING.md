# Publishing a new episode

Everything on the site is generated from two data files. You never hand-edit the
home page, the episodes list, the footer or the sitemap again.

## The three steps

**1. Add the episode data**

In `assets/episodes.js`, add the episode object (copy an existing one). Fields:

| Field | What it does |
|---|---|
| `id` | internal key, must match the key in `links.js` |
| `type` | `"episode"` when published, `"coming"` for a teaser, `"clip"` for a short |
| `number` | episode number |
| `page` | `/episodes/<slug>/` for published episodes |
| `title`, `guest`, `guestCredit` | shown on cards. Guest credit must be a plain statement of fact |
| `clinic`, `suburb`, `state` | `suburb` may be empty when not tied to one place. `state` drives the location tag |
| `image` | `/assets/img/epN.jpg` |
| `description`, `tags`, `keywords` | `keywords` are searchable but never displayed |

In `assets/links.js`, add the YouTube and Spotify URLs under the same `id`,
plus any clip URLs.

**2. Build**

```
node build.js
node verify-build.js
```

`build.js` writes the episode cards, the footer links and the sitemap into the
HTML. `verify-build.js` confirms the generated HTML matches what `site.js`
renders at runtime, so the page cannot flicker or drift.

**3. Commit and push**

```
git add . && git commit -m "Publish episode N" && git push
```

Then in Google Search Console, paste the new episode URL into the inspection bar
at the top and click **Request indexing**.

## The episode page itself

`build.js` does not create the show-notes page. Copy an existing folder under
`episodes/` and edit it. It needs:

- Title, meta description, canonical, Open Graph and Twitter tags
- JSON-LD blocks: `Organization`, `PodcastEpisode`, `VideoObject`, `BreadcrumbList`
- `VideoObject` duration and upload date **must match YouTube exactly**. Check the
  duration shown in YouTube Studio. Wrong values can cause Google to drop the
  video result
- Chapters in `hasPart`, with the last `endOffset` equal to the real runtime
- The embedded video, key takeaways, guest bio, clips, related episodes
- The collapsed transcript at the bottom
- The disclaimer. Mental health topics also carry Lifeline 13 11 14

## Why the build script exists

Search engines deprioritise pages they can only reach by running JavaScript. In
July 2026 all three episode pages sat in Search Console as "Discovered, currently
not indexed" with **last crawled: N/A**, because every link to them was created
at runtime by `site.js`. Google knew the URLs from the sitemap and decided they
were not worth fetching.

`build.js` puts real links in the HTML. `site.js` still runs and takes over the
same containers, so search and filtering are unchanged for visitors.

## Scaling

The footer shows the newest 3 episodes plus "All episodes", set by
`FOOTER_EPISODES` in `build.js`. It never grows. The `/episodes/` hub carries the
complete list, which is the standard pattern. Past roughly 150 episodes, split the
hub into pages.

## Compliance reminders

- Factual, balanced, non-promotional. Risks as well as benefits
- No testimonials about a regulated health service
- No patient details that could identify someone
- No brand names for devices or medications
- No comparisons with other practitioners or clinics
- Disclaimer on every page. Lifeline 13 11 14 on mental health content
- Bowel screening starts at 45
- Never name the parent organisation. The show is presented as independent
- No em dashes anywhere in copy
