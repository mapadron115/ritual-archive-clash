# Hand-over: Ritual Archive: Clash (demo)

Written 2026-11-12 by the first session, for its successor. The owner's side project: a 2D browser fighting game, original
fighters, technique and art names from their library (https://mapadron115.github.io/JJK-D-D-Library/codex.html; the data is in
the page's globals `LIBRARY_ENTRIES` and `DOSSIER_LEVELS[id]`, readable from the Browser pane).

**This folder only.** Never edit, build or commit in `C:\Users\mapad\dev\ritual-archive-mc` (the Minecraft mod); its CLAUDE.md
workflow does not apply here.

## Where things are
- Repo: this folder, branch `main`, remote `origin` = https://github.com/mapadron115/ritual-archive-clash (public).
- Live: https://mapadron115.github.io/ritual-archive-clash/ (GitHub Pages from `main`, root). The owner shares this with a friend.
- **Publishing = `git push origin main`. Ask the owner before each publish** (they have said yes each time so far, per version).
- Bump the `?v=N` on every `<script>` in `index.html` at each publish (now `v=3`), or browsers serve stale scripts.
- git is not on PATH: `C:\Users\mapad\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe`. gh: `C:\Program Files\GitHub CLI\gh.exe`
  (logged in as the owner). No node. Python 3 is there.
- Local preview: `python -m http.server 8765 --bind 127.0.0.1 --directory <this folder>`, then the Browser pane at
  `http://127.0.0.1:8765/index.html?v=<anything new>` (the query dodges the cache).

## Code
- `src/sim.js`: the rules. Plain-data state `S`, `step(S, [inputA, inputB])` at 60 ticks/s. `hit()` is the one door for damage
  (guard, counters, combo scaling, hooks `CH[].mul / hurt / dealt / tick`). Arts: `ART[id]`, optional `ART[id+'_can']`, `ART[id+'_re']`.
  Ultimates: `DOMAIN[kind] = { dur, tick }`. `S.stop` is a time stop. Deterministic RNG `rnd(S)`.
- `src/fighters.js` (first five) and `src/fighters2.js` (ten more): `CH` entries and their arts.
- `src/ai.js`: the computer. First five have hand-written picks; the rest use each art's `ai: {min, max, p, hold}`.
- `src/render.js`: all drawing. Camera (`camTarget`, `camPt`), `drawFighter`, `makeBG`, `fxEvent` (events from the sim become
  effects and sounds), `drawHUD`.
- `src/main.js`: menus (DOM), input, loop, synthesized sound, online (PeerJS from unpkg; host runs the sim, guest sends buttons).

## The owner's decisions so far
- 2D side-on, browser, five then fifteen fighters, no feats or levels. Wants it quick to test, then polished.
- Domains/ultimates: once a round, when the gauge is full OR under 30% health. Never an instant win. Two Domains clash and cancel.
- Boogie Woogie may only swap (with the foe or an imbued stone), never free-teleport.
- Mirror matches must be told apart (P2 pale outfit, tags over heads).
- Cartoon style like Brawlhalla / Castle Crashers. Original fighters only: no likenesses of series characters.

## Done by the second session (2026-11-12): Black Flash and the visual upgrade
The owner's ask was "improve the visuals again, still cartoony but a little more articulated, aiming for that triple-A look
... also add a black flash chance mechanic". Committed locally; **not published** (the owner has to say yes; bump `?v=` to 4).

- **Black Flash** (`sim.js`, constants `BF_*`): a landed, unguarded punch or kick has a 6% chance (20% in the Zone) for x2.2
  damage, +25 CE, a launch and 8 s of Zone (`f.zone`). Event `blackflash` (x, y, a = attacker). Script-tested over 2000 punches.
  Look: `fxEvent` sets `FX.impact` (a few frames where the world goes black and the two figures become flat silhouettes) and
  `FX.bf` (black burst with a red edge, black-red lightning from `bolt()`); HUD shows "IN THE ZONE" with a draining bar;
  the fighter gets black-red flames, a red glow and red eyes. Sound in `sfx`. One line in `basics()`.
- **Fighters** (`render.js`, from `const B` to `drawFighter`): bones in `B`, outfits in `KIT` (keyed by technique name),
  `skeleton()` places the feet on the ground and sets the hip height from the legs, `drawBody()` draws into a sprite canvas
  (`SPR`, one per slot: 0/1 fighters, 2/3 HUD portraits), then `drawFighter` lights the sprite as one piece (`source-atop`:
  shade toward the feet, white flash when struck, a rim of light just inside the outline) and copies it to the screen.
  Poses still come from `P`; `springPose` follows them with a damped spring. `P[x].sx` is how far the hips lunge. `FS` is the
  overall size. A portrait is positioned by its head, so `drawHUD` just translates to the ring's centre.
  Head tags sit at `f.y - 196` (246 when `f.big`).
- **Stage** (`makeBG`, `drawArenaLife`, the top of `drawWorld`): layers `BG.sky/cloud/far/town/arena/fore/vig`, drawn at depths
  0, .1, .2, .5, 1, 1.3 through `layer(p)`. Light shafts and dust are drawn live; banners wave; lanterns glow.
- **Effects**: `glow()` (additive) under projectiles, beams, hit stars; white impact frame on hits of 110+ and on a KO.
- **Speed**: `FX.lite` (set in `main.js` `frame` after about three seconds of slow frames) drops the rim pass, light shafts,
  clouds and foreground. Portrait sprites repaint every third frame.
- Testing aid: the Browser pane's screenshot often times out. A tiny receiver that saves `cv.toDataURL()` posts to PNG files
  worked better (fetch POST to a local Python `http.server` subclass), then read the PNGs.

Not done / ideas: the title screen still says "Five techniques"; no hand-played check of feel or frame rate; walk and attack
motion were only seen as still frames.

## How I tested (the pane throttles animation, so nothing was played by hand)
In the Browser pane's JS: stop the loop (`window.requestAnimationFrame = () => 0; G.running = false; FX.silent = true`), then
- full computer matches for every pairing (`newMatch`, loop `step(S, [aiInput(S,0), aiInput(S,1)])` until `S.phase === 'over'`),
  checking for exceptions and NaN, and counting wins for balance;
- one scripted test per art (set positions and meters, press a button mask on a given tick, read the health lost and events);
- screenshots after calling `drawWorld(ctx, S); drawHUD(ctx, S, labels())` by hand.
Say plainly to the owner that it's script-tested, not hand-played.

## Known rough spots
- Balance under computer play is uneven (last run, wins of 28: Bungee Gum 20, Gamma Rage 20, Full Counter 19; Blood
  Manipulation 8, Jajanken 8). The computer plays some fighters badly, so don't over-trust it.
- Online play has only been tested between two tabs on one computer.
- No music; sound effects are simple synth. New-technique effects were never seen in motion.
- Some names came from the Minecraft mod, not the library entry: Standing Ovation, Slicing Exorcism, Grand Effigy Rite;
  "Suspended Volley" is invented.
