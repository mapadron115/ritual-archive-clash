# Handoff: Ritual Archive: Clash

## Current - version 74, script cache v=77 (2026-11-14)

All mailbox entries through 14:57 acted on/acknowledged. V73 committed by coordinator as ce9189f, not pushed. Owner direct check-in repeats independent work/mailbox/report instructions; no design change.

V74 fixes the deferred third-punch floor fault. In eleven builds, calf contours extended 1-3 source pixels below the authored soles during hook wind-up/contact/return. Hook poses now use the established bulk-aware ankle inset, keeping both boots on the floor in all fifteen builds/costumes. The shared hook-shaped art poses receive the same correction. Only calf pixels change; no pose coordinates, collision, combat, damage, timing, input, AI, sound or networking changes. Eleven script URLs v=77.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel.js, tests/hook-grounding.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base ce9189f; never push. Ready for review/commit and owner assessment before publication. No design decision pending.

## Verification and limits

- V74 test first failed on unchanged v73 (Bram hookw, bottom 121 versus sole 120). Current: 180 floor/sole frames, 60 actual three-press chains across all builds/slots/facings, 2,520 parallel-state ticks and 3,240 impact/cinematic/time-stop holds. Snapshot/read-only world/HUD rasters and authored sole positions pass. Baseline matrix: 180 hook frames changed only within calves (first changed row 96; sole row 120), 3,840 unrelated frames byte-identical.
- Existing punch-chain (360 hit/block/whiff chains, 270 immediate chain transitions), art animation (90 timelines), Domain animation (30 timelines), pixel bounds/palettes (4,020 frames), airborne facing (120 contacts), damage readability (300 timelines/2,496 layouts), damage stacks (18 timelines/11,700 layouts), feel/input (eleven groups plus handlers), HUD (75) and runtime/menu/results/online regressions pass. Changed source/test syntax, eleven matching cache URLs and diff whitespace checks pass.
- Exported 108 before and 108 after full native scenes into the codex mailbox. Inspected Greta courtyard wind-up and Gallery mirror follow-through before/after, plus Corvin Observatory mirror settlement at 1x. These are memory-raster composites with transient FX omitted, not browser screenshots, motion or play. Runtime/title/selection/attract exports also retained there.
- V74 browser inventory retry again reports 'The browser access host is unavailable'; no native tab, layout/focus/activation or motion check obtained. No human play/listening, FPS, keyboard rollover or real WebRTC/two-computer check. Unchanged broad full-match/stage/world/other effects/audio/performance suites not repeated.
- Prior regression evidence and detailed previews remain in dated FROM_CODEX.md entries. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Retry native browser fight/move-list/results review when the surface works; remaining broad visual refinements follow. Third-punch soles are now addressed. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
