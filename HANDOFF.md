# Handoff: Ritual Archive: Clash

## Current - version 125 WEB/cache v=128; mobile v124/cache v=127 (2026-11-16 UTC)

Mailbox through 20:41 read/acted on; v124 committed/live as 4221d30. Owner directly repeated autonomous check-in/report instructions; no new design direction. One version per run; coordinator commits; never push. No new phone result. The owner's iPhone retest still takes priority.

V125 extends desktop-maximum.js with Everything I Have's low charge coil at active Domain ticks 12-23 and forward-driving body during the existing tick-24 rush. Before, hookload held through both charge and travel (12-39 on a miss). Contact immediately delegates to the existing punch when d.done becomes true; tick-40 miss recovery stays unchanged. Uses only serialized Domain age/completion; no simulation, gameplay, input, effect, audio, roster, name or style change. All fourteen desktop script URLs are v=128. Mobile and every other src file are byte-identical to HEAD.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-maximum.js, tests/allout-body.cjs (new), tests/maximum-body.cjs, tests/runtime.cjs. HEAD/base 4221d308bda01c1bfdb1b5a999a43f2faf0197a0; no add/commit attempt per 01:34/03:00. Never pushed. Ready for coordinator review/commit/publication.

## Verification and limits

- allout-body: four groups, 2,804 ticks, 5,652 rasters, 576 freeze holds, 9,300 unchanged-default/sprite checks, 20 changed native worlds restricted to the loading/travelling fighter. Both slots/facings, close/travelling/guarded/missed casts; 300 hit / 120 guard / zero whiff damage unchanged; actual contact ticks 24/35, tick-24 rush, costs, CE drain, armor release and complete parallel state checked. Read-only bodies and event-free snapshots match. --baseline --preview-only bypasses only the new pose branch and reproduces the static-body failure; other groups pass.
- maximum-body: four groups pass, 1,300 ticks / 2,692 rasters / 144 holds; existing Nuclear Shell coil/brace/release retained. Its unchanged-other-Domain assertion now excludes only the intentionally changed allout window; the new suite owns that window and checks its completed-hit fallback.
- desktop-domain (10 groups / 525 read-only checks), desktop-guard (7 groups / 2,713 HUD checks / 26,114 parallel ticks), mobile-install and feel pass. Complete runtime passes, including fourteen-script HTML boot, menus/input/results/rematch/online, existing fighter adapters and new allout AI/local/host keyboard casts plus sixteen event-free guest snapshots. Syntax and diff checks pass.
- Forty PNG artifacts in the mailbox: courtyard/main/right and Gallery/mirror/left; before/after eight native 640x360 scenes, full-scene strips and 144x128 body-cell strips. Inspected both main body strips, mirrored after strip and tick-24 full-scene pair at native size. Generated exact game-renderer stills, not browser screenshots or observed motion. Export: node tests/allout-body.cjs --baseline --preview-only --out=PATH, then node tests/allout-body.cjs --out=PATH.
- No browser/phone, observed motion/FPS/latency, physical keys/touch, audible audio, native CSS/focus/events, OS lifecycle/install, two-device WebRTC or owner play by Codex. Script-tested is not played. Unchanged mobile runtime/performance/presentation/diagnostics, complete art/stage/world/audio and earlier animation suites not repeated.
- The iPhone 12 mini / iOS 26.5 frozen-world cause remains UNCONFIRMED; separate canvases/opaque fill remain a mitigation awaiting device retest. Any phone result jumps the queue. Otherwise v126 MOBILE: profile the remaining busy-frame CPU path and pick one measured cost, with byte-identical output; desktop stays unchanged. Arenas, optional Rapid Slash and cluster placement/opacity remain deferred.

## Code and run

- Open index.html directly or serve this folder locally; Node is on PATH for tests. No installation needed.
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick attack/jump buffers survive freezes; held attacks do not repeat. Guard is prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- fighters.js/fighters2.js: fifteen fighters, ART[id], optional _can/_re, DOMAIN[kind]. ai.js: tactics/reaction clock.
- pixel.js: integer raster/font/palettes, 134 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: three stages/motion. pixel-domain.js: fifteen Domain spaces. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual builds/stances and mirror palettes. No external art/font dependencies. ART_DIRECTION.md records the style.
- Keep prior behavior: guard strength/low/locked feedback; discoverable ESC move list; compact opening plaques; persistent truthful round results; separate repeated-hit values; setup/HP/ground-aware art cards; serialized time-stop identity; age-driven charge/volley/status/projectile cues. V65-v69 online callback/selection/event fixes stay covered in runtime.cjs. Both clients must reload all scripts (v1 input encoding changed).

## Standing decisions

Read AGENTS.md and mailbox before each version; one version/report per run. Coordinator commits per 01:34/03:00 and now publishes each reviewed version per 17:10; Codex never pushes. Restrict work to this folder and named codex mailbox, never other teams.

Everything original; owner chose pixel art. Combat-rule/damage/roster changes, feature removal and new art styles go to coordinator first. Technique/art names come from the owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run.

Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps only with foe/imbued stone. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Draws award neither side a win. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, eight-second Zone. AI balance remains uneven; simulation wins are not human balance. Live: https://mapadron115.github.io/ritual-archive-clash/ .
