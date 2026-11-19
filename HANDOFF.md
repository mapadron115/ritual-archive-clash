# Handoff: Ritual Archive: Clash

## Current - v162 MOBILE ready for review; desktop v161/cache v=164 (2026-11-19 14:16:41 UTC)

Clash resumed by Coordinator 30 at 09:11, quoting the owner. Acted on the outstanding 2026-11-16 12:27 resume order: v162 brings the approved Bungee Gum body to mobile. Effects queue already completed per the latest prior report; no sky/effects work this run. One version, then stop for coordinator review. Coordinator commits; never push.

Mobile now loads the unchanged src/desktop-gum.js after Paper: low wrist coil at ticks 4-7, open flick on tick-8 strand release, follow-through 11-13, withdrawal 14-16 and guard return 17-19. Mobile title/error stamps v162; all 38 versioned resources (34 scripts) and three manifest icons cache v=165. Desktop index.html and every src file match HEAD exactly. Combat, attachment, projectile flight, controls, HUD and layout unchanged.

Commit: none; base/HEAD feb957d9354b1ffc6c52f003b4c2eaabfa606b58. No add/commit attempted per coordinator 01:34/03:00; never pushed. Seven files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, tests/mobile.cjs, tests/mobile-utility.cjs, tests/mobile-gum.cjs (new).

## Verification and limits

- mobile-gum PASS: three new groups, 8,400 parallel simulation ticks, 912 raster comparisons, 432 frozen holds, 48 event-free guest snapshots, 2,836 unchanged poses and 120 changed native scenes. Both slots/facings, full/low HP, hit/guard/rear/jump/far/wall/Infinity, exact desktop-world parity, unchanged HUD/control states, other moves, interruptions and resets.
- Included real mobile HTML/script runtime harness PASS: synthetic pointer commands, multitouch, main-loop attacks/jump/guard/arts/Domain, freeze taps, host/guest encoding, rotation, 15 Domain labels, 36 safe-area bounds and full CPU match/rematch/menu. Synthetic automation is not human play.
- mobile-utility PASS: three groups, 26 viewport/safe-area layouts and 16 mute toggles. --gum-baseline --preview-only reproduces all three missing-body groups as expected; baseline failures intentionally allowed. New test parses. All cache URLs resolve locally; git diff --check passes; desktop index.html/src diff empty.
- 232 generated PNGs in codex/v162: before/after native scenes, body/phone strips, release models at 667x375, 812x320, 844x390 and portrait. Inspected before/after P1 body strips, mirrored P2 strip, distant phone release and close mirror native follow-through. Coil/flick/recovery read clearly with fixed feet and no observed clipping. These are renderer/layout models, not browser screenshots or live motion.
- Logs in codex mailbox: v162-gum.log, v162-baseline.log, v162-utility.log. All processes completed successfully. Desktop/full-roster standalone suites not repeated because production source is unchanged.
- No phone/browser session, physical touch, live FPS/latency, audible audio, two-device WebRTC or owner play. The v136 MUTE/MOVES iPhone 12 mini/iOS 26.5 toolbar-height retest remains pending and jumps the queue.
- Ready for coordinator review/commit/publication and owner play. No v163 started. Next: resume desktop ordinary-art/feel audit; optional Rapid Slash, arenas, cluster opacity and library-name audit remain deferred. Mailbox reread through 2026-11-19 09:11; no question needed.

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
