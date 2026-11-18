# Hosting runbook: onthemendgp.com.au

_Updated 18 November 2026. Written after a 3 to 4 day GitHub account suspension in November 2026 took the site offline. Goal: no single account can take the site down._

This file sits in the website repo, so it is publicly readable at `/HOSTING-RUNBOOK.md`. Never put passwords, recovery codes or email addresses in it.

## How it fits together

| Layer | Service | What it does | If it fails |
|---|---|---|---|
| Domain name | Crazy Domains (registrar) | Owns `onthemendgp.com.au` and points it at Cloudflare's nameservers | Nothing changes while the nameservers stay put. Renewal is the only risk |
| DNS | Cloudflare, account "On The Mend" (nameservers `itzel.ns.cloudflare.com`, `paul.ns.cloudflare.com`) | The address book: points the domain at the Pages project | See Emergency 3 |
| Hosting | Cloudflare Pages, project `onthemendgp` in the same account | Serves the site to visitors | See Emergency 3 |
| Code | GitHub, org `onthemendgp`, repo `onthemendgp.github.io` | Stores the website files. A push to `main` makes Cloudflare publish a fresh copy within about a minute | The site keeps serving its last copy. Publish by direct upload (Emergency 1) |

There is no build step on Cloudflare. `node build.js` runs on Ajmal's computer and the built pages are committed, so Cloudflare serves the repo root as it is.

GitHub Pages is still switched on as a fallback until early December 2026, but the domain no longer points at it. Once the Cloudflare setup has been stable for two weeks, unpublish it (GitHub, repo Settings > Pages).

## Who owns what

| Account | Who | Notes |
|---|---|---|
| GitHub organisation `onthemendgp` | Ajmal (Owner), Arun (Owner, invited 17 Nov 2026) | The repo belongs to the organisation, not to a person. The Cloudflare GitHub app is installed on this org for the one repo only |
| Cloudflare account "On The Mend" | Milinda (Super Admin), Ajmal (Administrator). Asked Milinda on 18 Nov 2026 to make Ajmal a Super Admin and add Arun | Holds only `onthemendgp.com.au` and the Pages project. Created by Milinda; renamed from his default name |
| Cloudflare account "On The Mend (spare)" | Ajmal | Empty spare made on 17 Nov 2026. Holds a pending copy of the domain and nothing live. Safe to ignore |
| Crazy Domains (registrar) | Milinda | Know when the domain renews and that auto-renew is on |
| Google Search Console | Ajmal | Verified by an HTML file. Add a DNS TXT verification as a backup (see below) |

Everyone with access should use two-factor sign-in with an authenticator app, and keep backup codes somewhere other than that account.

## Cloudflare settings (normal state)

- DNS: `onthemendgp.com.au` CNAME `onthemendgp.pages.dev` (proxied) and `www` CNAME `onthemendgp.pages.dev` (proxied). Both added by Pages > Custom domains.
- Redirect rule: `https://www.onthemendgp.com.au/*` to `https://onthemendgp.com.au/${1}`, 301, keeps the query string.
- SSL/TLS: Always Use HTTPS on, minimum TLS 1.2, TLS 1.3 on. HSTS off on purpose.
- Security: Email Address Obfuscation off (it rewrote the site's mailto links).
- AI Crawl Control: nothing blocked. robots.txt is ours, unchanged.
- Notification: "Website deploy failed" (Pages, production) emails Ajmal.
- No email on the domain (the show uses a Gmail address), so no MX records.

Cloudflare Pages redirects any `.html` address to the same address without `.html` (for example `/404.html` to `/404`). That is expected.

## Normal publishing

Unchanged, see `PUBLISHING.md`. After `git push`, check **Workers & Pages > onthemendgp > Deployments** shows a green tick.

## Emergency 1: GitHub is down or an account is suspended

The site stays up on Cloudflare. Only needed if a change must go live before GitHub is back.

From WSL, in the `Website` folder:

```
node build.js && node verify-build.js
```

```
git archive --format=zip HEAD -o ~/otm-site.zip
```

(Commit locally first. This packs exactly what is committed, without `.git`, `design-options` or `print`.)

Then unzip it to a folder and run:

```
npx wrangler pages deploy <folder> --project-name onthemendgp --branch main
```

Wrangler asks you to sign in to Cloudflare in the browser the first time. When GitHub is back, `git push` as normal.

## Emergency 2: a Cloudflare login is locked

Another member of the On The Mend Cloudflare account signs in and does what is needed. This is why the account needs at least two people who can manage it.

## Emergency 3: Cloudflare itself is unavailable

Rare. Fall back to GitHub Pages:

1. GitHub: repo `onthemendgp.github.io` > Settings > Pages. Make sure it is published from `main`, `/ (root)`, with custom domain `onthemendgp.com.au`.
2. Milinda changes the nameservers at Crazy Domains back to Crazy Domains' DNS (`ns1.dnspackage.com` to `ns4.dnspackage.com`) with:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `onthemendgp.github.io` |

Nameserver changes can take a few hours to reach everyone.

## Yearly check

- Domain renewal date with Crazy Domains, auto-renew on.
- Everyone listed above can still sign in to GitHub and Cloudflare.
- Test Emergency 1 once on a preview branch (`--branch test`) so nobody learns it in a crisis.
