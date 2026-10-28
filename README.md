# Xcel Routine Builder

A free, no-login web app for planning **USA Gymnastics Xcel Gold** routines. For each event it lists the requirements and every allowed skill. You pick skills to build a routine and mark which ones you have, are learning, or are working toward.

**Try it:** https://xcelroutines.com/

**Status:** All four Gold events are done: Vault, Bars, Beam, and Floor. Some skill values still need checking against the full Code of Points (marked "check value" in the app, and tracked in the issues).

## Features

- **Requirements checklist** that updates live as you pick skills, with your start value shown at the top
- **Bars, Beam, and Floor routine builders**: put skills in order and see value parts and special requirements add up (bars: low/high bar and connections; beam and floor: split angle decides A or B; floor: connected skills form tumbling passes and dance passages)
- **Full Gold skill list** for each event, with your status for each skill (Have it / Learning / Goal)
- **Start over** any time from the More menu (your skill statuses are kept)
- **Rules quick reference** at the top of each event
- **Share link**: sends a copy of your routines to a coach or teammate, no account needed
- **Export / Import** as a JSON backup
- Works on phones, follows your light/dark setting, and saves to your browser's local storage

## Run it locally

No build step or dependencies. Use the included no-cache server (plain `python3 -m http.server` works too, but browsers may keep old copies of the scripts after you update them):

```bash
cd xcel-routine-builder
python3 serve.py
# open http://localhost:8000
```

(Opening `index.html` straight from disk won't work, because browsers block JavaScript modules on `file://` URLs.)

Run the tests (Node 18+):

```bash
npm test
```

## Publish on GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**. Under **Build and deployment**, set **Source: Deploy from a branch**, then **Branch: `main`**, folder **`/ (root)`**.
3. After about a minute the site is live at `https://<your-username>.github.io/xcel-routine-builder/`.

This repo uses the custom domain **https://xcelroutines.com/**, set by the `CNAME` file and in **Settings → Pages → Custom domain**. If you fork it, delete `CNAME` so your copy uses your own `github.io` address.

All paths are relative, so the app works from that sub-path as-is. The empty `.nojekyll` file tells GitHub Pages to serve the files exactly as they are.

## Project layout

```
index.html              App shell
css/styles.css          All styles (light + dark tokens)
data/events.js          Event tabs
data/gold/vault.js      Gold vault data: rules, requirements, vaults, springboard help
data/gold/bars.js       Gold bars data: rules, scoring, skills (verify: true = best-guess value)
data/gold/beam.js       Gold beam data: rules, split angles, skills
data/gold/floor.js      Gold floor data: rules, split angles, skills
js/main.js              Routing, top bar, share / export / import
js/store.js             State shape, localStorage, share-link encoding
js/logic/vault.js       Vault requirement logic (unit tested)
js/logic/common.js      Shared routine logic: value parts and the repeat rule
js/logic/bars.js        Bars special requirements and start value (unit tested)
js/logic/beam.js        Beam special requirements, split angles, start value (unit tested)
js/logic/floor.js       Floor passes, dance passage, start value (unit tested)
js/views/vault.js       Vault page
js/views/bars.js        Bars page
js/views/beam.js        Beam page
js/views/floor.js       Floor page
js/views/shared.js      Rules panel, checklist, filters, status buttons
tests/                  node --test unit tests
```

### Adding an event

1. Add `data/gold/<event>.js` with its requirements and skills.
2. Add `js/logic/<event>.js` and `js/views/<event>.js`.
3. Add a tab in `data/events.js` and register the view in `js/main.js` (`VIEWS`).

Every event page uses the same building blocks from `js/views/shared.js`, in this order, so they all look and work alike:

- **Rules quick reference** (`rulesPanel`): collapsible, open by default
- **Requirements** (`collapsiblePanel` + `checklist` + `startValueMath`, badge from `readyBadge`): above the routine, collapsible
- **Your routine**: each chosen skill shows its Have / Learning / Goal chip (`statusChip`)
- **Skill list**: filter chips (`filterBar`), status buttons (`statusGroup`), and an "In routine" tag on chosen skills
- A `headline(plan)` export so the start value shows in the top bar

## About the skill data

Skill information is **paraphrased** from the USA Gymnastics *Xcel Code of Points* (2022-2026, extended through the 2027 season) and its 2026-27 updates. This repo does not reproduce the official text. The code numbers (for example `1.101`) match the official vault chart, so you can look each skill up in the book.

**Get the official Code of Points from the [USA Gymnastics store](https://usagym.org/store/).** This site is a planning companion, not a replacement for the book: coaches, judges, and athletes should use the official code.

This is an unofficial fan tool, not affiliated with or endorsed by USA Gymnastics. It may contain mistakes. Always confirm with your coach and the current code. To fix an error, edit the matching file in `data/` (pull requests welcome).

## Contributing

Ideas and fixes are welcome. See the open issues for what's next. If you own the Code of Points, the data-check issue is the most helpful place to start.

## License

MIT
