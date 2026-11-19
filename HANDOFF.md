# Handoff: Ritual Archive: Clash

## 2026-11-19 15:47:31 UTC - v164 MOBILE: reviewed Stone toss ready

Read AGENTS.md, HANDOFF.md and coordinator mailbox through the newest 10:32 order. The owner directly requested this autonomous check-in and report. Acknowledged accepted v163 commit abf9c62; earlier effects orders are recorded as completed. Finished the requested broad desktop runtime check FIRST, then delivered one mobile version. No next version started.

Mobile now loads the unchanged src/desktop-stone.js after Gum: hip gather, low backswing, tick-8 underarm release, rising follow-through and return to guard. Mobile title/error stamps v164; all 39 versioned mobile resource URLs (35 scripts) and three manifest icons cache v=167. Desktop index.html remains v163/cache v=166; every src file and mobile touch/CSS/runtime implementation remain unchanged. Projectile motion, bounce, damage, cost and live stone swap are unchanged.

Commit: none; base/HEAD abf9c62589f13d79a729c8a6bdc476960e118f4d. No add/commit/push attempted: coordinator retains commits. Seven files for review/commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, tests/mobile.cjs, tests/mobile-utility.cjs, tests/mobile-stone.cjs (new).

Verification:
- FULL tests/runtime.cjs PASS on the accepted v163 tree, exit 0, through final Bungee Gum group and final canvas-alpha assertions. The partial v163 run is now resolved. Log: v164-runtime.log. No desktop/source edits followed this run.
- mobile-stone PASS, all four groups: 8,640 paired simulation ticks, 912 raster comparisons, 432 frozen holds, 48 event-free guest snapshots, 2,828 unchanged poses and 144 changed native scenes. Both slots/facings, full/low HP, hit/guard/rear/jump/far/wall/Infinity; touch and remote second-press swaps; exact desktop-world parity; all-stage body-only changes; unchanged HUD/controls, interruptions and round resets.
- Included actual mobile HTML/script-order runtime harness PASS: synthetic pointer commands, multitouch, main-loop moves/arts/Domain, freeze taps, host/guest encoding, rotation, 15 Domain labels, 36 safe-area bounds and full CPU match/rematch/menu.
- mobile-utility PASS: three groups, 26 viewport/safe-area layouts and 16 mute toggles. --stone-baseline --preview-only reproduces the three missing-body failures while swap parity passes (failures intentionally allowed only for this diagnostic). New test parses; all 39 mobile URLs resolve locally; git diff --check passes. Desktop index.html and src diff empty.
- 232 generated PNGs in codex/v164: paired native scenes, twelve-frame body/phone strips, release models at 667x375, 812x320, 844x390 and portrait, close and distant throws. Viewed before/after P1 body strips, mirrored P2 body strip and distant phone release. Clear low backswing, rising follow-through and fixed feet; no observed clipping. Renderer/layout models, not browser screenshots or live motion.
- Logs in the codex mailbox: v164-runtime.log, v164-stone.log, v164-baseline.log, v164-utility.log. All final processes exited 0. Initial log redirection used a nonexistent local codex folder; corrected to mailbox before running. Python was unavailable for the edit helper; no files changed by that attempt, then used Node successfully.

Limits/next: no browser/phone session, physical touch, live FPS/latency, audio listening, two-device WebRTC or owner play. The v136 iPhone 12 mini/iOS 26.5 MUTE/MOVES toolbar-height retest remains pending and jumps the queue. Ready for coordinator review/commit/publication decision; never pushed. Recommended next after approval: resume desktop ordinary-art/feel audit. Rapid Slash, arenas, cluster opacity and library-name audit remain deferred. Stopping after this version for review; no question needed.

## Code and run

- Open index.html directly or serve this folder locally; Node is on PATH for tests. No installation needed.
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick attack/jump buffers survive freezes; held attacks do not repeat. Guard is prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- fighters.js/fighters2.js: fifteen fighters, ART[id], optional _can/_re, DOMAIN[kind]. ai.js: tactics/reaction clock.
- pixel.js: integer raster/font/palettes, fighter poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: three stages/motion. pixel-domain.js: fifteen Domain spaces. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual builds/stances and mirror palettes. No external art/font dependencies. ART_DIRECTION.md records the style.
- Keep prior behavior: guard strength/low/locked feedback; discoverable ESC move list; compact opening plaques; persistent truthful round results; separate repeated-hit values; setup/HP/ground-aware art cards; serialized time-stop identity; age-driven charge/volley/status/projectile cues. V65-v69 online callback/selection/event fixes stay covered in runtime.cjs. Both clients must reload all scripts (v1 input encoding changed).

## Standing decisions

Read AGENTS.md and mailbox before each version; one version/report per run. Coordinator commits per 01:34/03:00 and now publishes each reviewed version per 17:10; Codex never pushes. Restrict work to this folder and named codex mailbox, never other teams.

Everything original; owner chose pixel art. Combat-rule/damage/roster changes, feature removal and new art styles go to coordinator first. Technique/art names come from the owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run.

Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps only with foe/imbued stone. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Draws award neither side a win. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, eight-second Zone. AI balance remains uneven; simulation wins are not human balance. Live: https://mapadron115.github.io/ritual-archive-clash/ .
