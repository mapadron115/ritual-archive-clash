# Handoff: Ritual Archive: Clash

## Current - version 129 WEB/cache v=132; mobile v128/cache v=131 (2026-11-16 02:55:23 UTC)

Mailbox through 21:46 read/acted on; v128 committed/live as e44d927. Owner directly repeated autonomous check-in/report instructions; no new design direction. One version per run; coordinator commits; never push. No new iPhone retest result; that still takes priority.

V129 replaces Convergence's static late charge with a low fold at Domain ticks 20-31 and an upright aim at 32-39. The new desktop-only src/desktop-convergence.js loads last. Selection uses serialized Domain age; tick-40 beam, recoil, damage, guard and swap escape stay unchanged. All fifteen desktop script URLs use v=132. Mobile and every existing src file are byte-identical. No combat, HUD, effect, input, audio, roster/name, dependency or style change.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-convergence.js (new), tests/convergence-body.cjs (new), tests/runtime.cjs, tests/desktop-domain.cjs, tests/desktop-guard.cjs. HEAD/base e44d927bf37f1265198214d04dd635d280300e49. No add/commit attempt per 01:34/03:00; never pushed. Ready for coordinator review/commit/publication.

## Verification and limits

- convergence-body: five groups PASS; 2,100 parallel ticks, 4,272 rasters, 384 pause holds, 8,296 unchanged defaults, sixteen changed native scenes and 24 gathering-blood composites across three stages. Real casts in both slots/facings: 240 normal / 96 guarded / zero rear or swap damage; no self-health cost; exact tick-40 beam. Read-only drawing, event-free snapshots, prior sprites, body-only world differences, exact HUD, hard alpha, <=24 colors and cell/floor bounds. Blood layer stays exact; at least 140 bright pixels remain visible.
- --baseline --preview-only omits only the new adapter: the static-body group fails as expected; other four pass. Preview-only permits that expected failure. Initial floor check caught the low coat hem; raised hips four pixels and reran PASS.
- Convergence charge, Nuclear Shell / allout / voice body suites, desktop-domain (525 HUD checks), desktop-guard (2,713 checks / 26,114 ticks), mobile-maximum (five groups; 3,228 ticks / 312 rasters / 48 guest packets), mobile-install and feel PASS. Two HUD harnesses now exclude the new adapter only when loading historical/shared sources; normal current HTML still loads it. Syntax, diff checks and existing-source/mobile identity PASS. Complete fifteen-script desktop runtime PASS: menus/input/results/rematch/online, prior hit/summon/Maximum paths, plus Convergence casts through AI/local/host keyboard frames and sixteen event-free guest snapshots. Focused AI-mode cast is keyboard-triggered; this is not an AI-balance claim.
- Forty PNGs in mailbox: before/after eight native scenes, full-scene strips and body strips for main/right/courtyard and mirror/left/Gallery. Inspected main body pair, mirrored after bodies, tick-32 full-scene pair, low-fold scene and mirrored aim scene. These are exact renderer stills, not browser screenshots or observed motion. Export: node tests/convergence-body.cjs --baseline --preview-only --out=PATH, then without baseline/preview-only.
- No browser/phone, physical touch/keys, motion/FPS/latency, audible audio, native CSS/focus/events, OS install/backgrounding, two-device WebRTC or owner play. Unchanged historical art/audio/world, full mobile presentation/diagnostics/performance suites not repeated; no performance claim. Script-tested is not played. iPhone frozen-world cause remains UNCONFIRMED; separate buffers/opaque fill await device retest.
- Next v130 MOBILE: bring these two Convergence bodies to the phone with phone-size strips and frame-cost check; desktop unchanged. Phone retest jumps the queue. Arenas, optional Rapid Slash and control-cluster placement/opacity remain deferred.

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
