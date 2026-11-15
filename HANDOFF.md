# Handoff: Ritual Archive: Clash

## Current - version 106, mobile cache v=109; desktop v=108 (2026-11-15)

Mailbox through 16:41 read/acted on. V105 accepted/committed as bdcf6b8 (not pushed). Owner directly repeated autonomous check-in/report instructions. V106 starts the separate phone-browser game ordered at 16:36. No desktop index/src file changed; arenas and optional Rapid Slash note stay closed/deferred.

V106 adds mobile/index.html, mobile/mobile.css and mobile/touch.js. Its visible milestone is a dedicated 52x48 CSS-pixel multitouch fight deck below the complete arena: movement, jump, hold guard, punch/kick, three numbered arts, Domain/Maximum, Moves and Mute. Actual pointer handlers feed shared main.js held bits and latched taps; duplicate contacts, release/cancel/capture loss, blur, hidden tabs, menus and rotation clear correctly. Separate touch-oriented menus bootstrap CPU/watch/online using shared code read-only. Mobile-only HUD adapter replaces ESC and overlapping keyboard hints; desktop stays byte-identical. Safe areas and a portrait rotation card are included; offline rotation pauses until Resume, online continues with local input neutral.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html (new), mobile/mobile.css (new), mobile/touch.js (new), tests/mobile.cjs (new). HEAD/base bdcf6b8; no add/commit attempt per 01:34/03:00; never pushed. All twelve mobile script URLs v=109; eleven desktop URLs remain v=108 because shared sources/desktop page are unchanged.

## Verification and limits

- node tests/mobile.cjs passes actual mobile HTML/script loading; synthetic event objects dispatched to actual pointer handlers in a memory DOM; all ten held/edge commands, simultaneous movement/punch through frame -> readKeys -> step, duplicate contacts, jump/guard/kick/three arts/Domain, freeze-safe quick taps, cancellations and lifecycle cleanup. CPU/watch and actual host/guest encoding paths covered; fifteen fighter-specific Domain/Maximum labels, 36 safe-area button bounds and pairwise separation checks pass.
- A complete seeded-simulation CPU match advances through the shared main loop with repeated touch punches, actual AI, round results, match completion, delayed result screen, rematch and title return. Raster drawing skipped during this long lifecycle check; no claim of human play or measured frame rate.
- Existing desktop runtime/menu/input/results/network-lifecycle and feel/input suites pass. Syntax and diff whitespace pass. git diff --exit-code HEAD -- index.html src confirms exact desktop/shared-file preservation.
- Inspected generated 844x390, 667x375 and 390x844 layout models in codex mailbox. Landscape uses the live geometry function, real rendered fight and controls drawn at those bounds; portrait model shows the rotation card. Before images are illustrative no-deck comparisons using the same mobile renderer at full 16:9, not literal v105/browser captures. First still caught overlapping HUD hints; shortened and regenerated. No CSS engine was used for these models.
- Computer/browser capture retried: browser access host unavailable. No actual phone, browser CSS/menu layout or native PointerEvent dispatch, touch feel, sound/listening, motion/FPS, phone keyboard/viewport behavior or real two-computer WebRTC verification. Existing desktop full-match/world/stage/art/audio/performance suites not repeated; source unchanged.

## Next priorities

V107 remains mobile-first: audit real touch menu routes and phone-sized selection/pause/results layout, improve arena use of landscape space if practical without covering HUD/controls, and obtain coordinator browser captures where available. Then harden mobile online/input lifecycle, and installable manifest/icons last. No app-store packaging. Mobile comes first until a phone match can run start to finish, then alternate mobile and web-audit versions. V106 is ready for coordinator review/commit; owner phone testing needs coordinator publication approval, never a Codex push. No decision blocks the next mobile version.

Owner dive feel/readability notes still take priority. V97: 44 active warning ticks before tick-46 impact, 250 damage, 310-unit width, unchanged cost. Bram retreat delayed 8 ticks escapes/9 hit; jump-away delayed 15 escapes/16 hit. Only owner play judges feel.

## Code and run

- Open index.html directly or serve this folder locally; Node is on PATH for tests. No installation needed.
- src/sim.js: serializable state, 60-Hz step(S,[mask0,mask1]), hit(), hooks, freeze/round rules. Low ten bits held; upper bits explicit presses (INPUT_SHIFT). Nine-active-tick attack/jump buffers survive freezes; held attacks do not repeat. Guard is prepared for both slots before attacks; AI defense waits 10-16 active ticks.
- fighters.js/fighters2.js: fifteen fighters, ART[id], optional _can/_re, DOMAIN[kind]. ai.js: tactics/reaction clock.
- pixel.js: integer raster/font/palettes, 134 poses/builds, pxArtPose/pxPose/pxFighterFrame and caches. pixel-stage.js: three stages/motion. pixel-domain.js: fifteen Domain spaces. pixel-world.js: world/effects/presentation. pixel-hud.js: portraits/meters/cards/tags. render.js: event/FX lifecycle. main.js: menus/input/audio/PeerJS/loop.
- Native 640x360, nearest-neighbor enlargement; original 144x128 fighter cells rooted at (64,120), individual builds/stances and mirror palettes. No external art/font dependencies. ART_DIRECTION.md records the style.
- Keep prior behavior: guard strength/low/locked feedback; discoverable ESC move list; compact opening plaques; persistent truthful round results; separate repeated-hit values; setup/HP/ground-aware art cards; serialized time-stop identity; age-driven charge/volley/status/projectile cues. V65-v69 online callback/selection/event fixes stay covered in runtime.cjs. Both clients must reload all scripts (v1 input encoding changed).

## Standing decisions

Read AGENTS.md and mailbox before each version; one version/report per run. Coordinator commits per 01:34/03:00 and obtains owner's publication approval; never push. Restrict work to this folder and named codex mailbox, never other teams.

Everything original; owner chose pixel art. Combat-rule/damage/roster changes, feature removal and new art styles go to coordinator first. Technique/art names come from the owner's library: https://mapadron115.github.io/JJK-D-D-Library/codex.html (LIBRARY_ENTRIES and DOSSIER_LEVELS). Existing Standing Ovation, Slicing Exorcism, Grand Effigy Rite and Suspended Volley still need a library audit; no names added this run.

Domains once per round at full gauge OR <=30% HP; two Domains cancel, never instant wins. Boogie Woogie swaps only with foe/imbued stone. Mirror P2 palette plus actor tags. Best of three, 99 seconds. Draws award neither side a win. Black Flash 6% (20% Zone), 2.2x damage, +25 CE, eight-second Zone. AI balance remains uneven; simulation wins are not human balance. Live: https://mapadron115.github.io/ritual-archive-clash/ .
