# gta6-cover-art-v1

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/ehzugzvn/gta6-cover-art-v1/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/ehzugzvn/gta6-cover-art-v1/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Sunset Studio** — a GTA 6-style cover art maker, built for the make.fun bounty [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01). Turn your own photos plus a caption into a five-panel street-saga cover: one big hero panel on the left, a 2×2 grid on the right, thick white borders, and a sunset-gradient title band across the bottom carrying a kicker badge, a giant gradient title and a tagline.

## How it works

- **Photos:** upload one or more of your own photos, or use the six built-in AI sample photos (boulevard, pier, supercar, convertible, neon boardwalk, harbour). Click a panel, then click a photo to place it — one photo can star in several panels, or five photos can share the poster. Drag a photo inside its panel to reposition it, zoom with the slider (or the arrow keys and +/−), and use Fill all panels / Shuffle / Clear panel for fast layouts.
- **Words:** the title, kicker badge and tagline are all editable text fields, redrawn live on the cover in bold condensed lettering with a yellow→orange→pink gradient fill, a thick dark outline and a drop shadow — all drawn with canvas paths, fills and gradients (no borrowed fonts, logos or artwork).
- **Colour grades:** Sunset (warm orange/pink), Neon (teal + magenta) and Clean Pop (bright saturated), applied to the photos on canvas.
- **Export:** one click exports the composed cover as a PNG at 1080×1080, 1080×1350 or 1920×1080, with a live preview the whole time you edit.

## Running it

The app is plain static files under `app/` — no build step, and it works offline in a desktop Chrome. Serve it locally with Node 22 (standard library only):

```
node serve.ts
```

then open http://localhost:8080.

The entry program copies `app/` and `screenshots/` to the output directory and writes `dossier.json` (via the vendored `vendor/makefun-app.ts`):

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=$PWD/out node main.ts
```
