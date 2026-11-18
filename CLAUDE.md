# Macar Dex — notes for Claude Code

Owner: Arturo (Macar). Talk to him in Spanish from Spain: short sentences, straight to the point, one recommendation when he asks for a decision, honest, no flattery. The app UI is in English with Spanish names/descriptions shown alongside.

## What this is
Study app for Pokémon Champions VGC (Reg M-C, Level 50). Plain static site, no build step, no framework. Installable PWA served by GitHub Pages from `main` / root: https://macar218.github.io/macar-dex/

## Files
| File | What | Edited by |
|---|---|---|
| `index.html` | All markup + all CSS (one `<style>` block; new CSS goes at the end, before `</style>`) | hand |
| `app.js` | Home, Dex, Moves, Speed, Types, Abilities, Natures, Quiz, Top 30 | hand |
| `calcui.js` | Damage calc UI, Items tab, Teams (import/build), weather & terrain guide | hand |
| `smogcalc.js` | `@smogon/calc` 0.12.0 bundle (data + calc). Gen `0` = Champions. Lazy-loaded when the Calc tab opens | never by hand |
| `data.js` | `window.DEX`: 343 forms (stats, types, abilities, sprites as base64) | rarely |
| `moves.js` | `window.MOVES` (510) + `window.LEARN` (learnsets) | rarely |
| `es.js` | Spanish names and descriptions for abilities, moves, natures | rarely |
| `items.js` | `window.ITEMS` (166 items, EN/ES desc, sprite, `u` users) + `window.CSETS` (ladder item/spread per form) | weekly (CSETS and `u` only) |
| `meta.js` | Usage: `SRC`, `USAGES` (showdown/online), `EVENTS` (official Regionals), `KEYS`, `CURREG` | weekly |
| `sets.js` | `window.SETS`: abilities / moves / teammates per form from Smogon | weekly (new Smogon month) |
| `sw.js` | Service worker: network-first (fresh files when online), cache fallback (offline). No version bump needed | rarely |
| `manifest.webmanifest`, `icon-*.png` | PWA install | rarely |

Keys everywhere: lowercase name without symbols (`Charizard-Mega-Y` → `charizardmegay`).

## Rules that must not break
- Lv 50 stats: HP = base + 75 + SP; others = ⌊(base + 20 + SP) × nature⌋. 66 SP total, 32 max per stat.
- Damage calc: always the Smogon engine (gen 0). Never write our own damage formula.
- Quiz: no repeated question inside a run; mistakes are only re-asked in **Review mistakes**, and only leave that list when answered right there. Daily = 20 questions, same for everyone each day: 6 speed, 8 Pokémon + type chart, 2 abilities, 2 moves, 1 item, 1 nature, shuffled. No Mega Stone item questions.
- Home: Quiz tile is the wide one, at the bottom. Dock: Home, Dex, Speed, Calc, Quiz, More. More order: Teams, Type chart, Natures, Items, Abilities, Moves.
- Mascot (header / intro) is original (device with eyes and simple feet). Do not turn it into Rotom or any real character.
- localStorage keys (user data, keep compatible): `vgcTeams`, `vgcTeamA`, `vgcCalc`, `vgcHist`, `vgcQuiz2`, `vgcMissed` (last 300), `vgcDaily`, `vgcDesc`.
- Mobile first (iPhone, installed from Safari). Check 390 px wide and desktop. Bottom bar uses safe-area insets and a visualViewport fix in `app.js`.

## Weekly data update
A scheduled task runs every Monday 08:47 Europe/Madrid (`Macar Dex: actualizar uso (cada lunes)`). It updates `meta.js`, and on a new Smogon month `sets.js` and `CSETS`/`u` in `items.js`, then commits `Weekly data update YYYY-MM-DD` to `main`. It never touches code files. Full procedure: `docs/weekly-update.md`.

Until now the app was also published as a Claude artifact (slug `6fb9c22c-53aa-4189-b00c-cf726cc514ff`) and the task kept both in sync. Arturo now edits in Claude Code, so this repository should be treated as the source of truth; if the artifact is dropped, update the task so it only writes to this repository.

## Testing before pushing
No test suite in the repo. Serve locally (`python3 -m http.server`) and check in a browser at 390 px and desktop: no console errors, every tab opens, a calc result shows, a quiz runs to the end, Teams import/build works, and the app still loads offline after one online visit.
