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

## In progress when I stopped (the owner's latest ask)
"improve the visuals again, still cartoony but a little more articulated, aiming for that triple-A look ... also add a black
flash chance mechanic".

1. **Black Flash: rules are in `sim.js`, uncommitted-then-committed as WIP, NOT tested, no effect drawn yet.** A landed punch or
   kick (`o.basic`) has a 6% chance (20% in the Zone) for x2.2 damage, +25 CE, a launch, and 8 s of Zone (`f.zone`). Constants
   `BF_*`. It emits `ev 'blackflash'` (x, y, a = attacker index). Still to do: handle that event in `fxEvent` (black star with a
   red edge, jagged red-black lightning, an impact frame, sound in `sfx`), show "IN THE ZONE" on the HUD while `f.zone > 0`,
   a dark-red aura on the fighter, a line in the move list / basics, and a scripted test (force it by setting `S.seed` or
   temporarily `BF_CHANCE = 1`).
2. **Visual upgrade: not started.** My plan, for what it's worth:
   - Fighters: render each into an offscreen canvas, then blit (gives a soft rim glow via `shadowBlur`, a white hit-flash with
     `source-atop`, motion trails). Less chibi proportions (smaller head, longer limbs), tapered capsule limbs with two-tone cel
     shading, a shaped torso, real hands (fist / open when casting) and feet that sit flat on the ground, a neck, eyes with
     irises that look at the foe, layered hair with highlights, an outfit kit per fighter (coat, gi, jacket, hood, tank, scarf).
     Spring the pose (velocity per joint) for overshoot and follow-through instead of the plain lerp in `POSE_CACHE`.
   - Stage: separate layers with parallax off the camera (sky fixed in screen space; far hills .25; town .55; arena 1; a blurred
     foreground 1.35), smooth sky gradient, sun bloom, haze between layers, waving banners, lantern glow, god rays, a vignette.
   - Effects: glow on projectiles and beams, an impact frame on very heavy hits and KOs.
   - Keep the portrait code in `drawHUD` working (it calls `drawFighter` with a fake fighter, `portrait: 1`, index 2/3) and the
     head tags (`f.y - 168`); both depend on fighter height.

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
