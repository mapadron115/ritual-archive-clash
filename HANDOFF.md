# Handoff: Ritual Archive: Clash

## Current - version 93, script cache v=96 (2026-11-14)

Mailbox through 19:51 acted on/acknowledged. Coordinator committed v92 as ea6f33a, not pushed, and closed all three arenas. Owner directly repeated autonomous check-in/mailbox/report instructions, with no new design decision. One version this run; all arena code left alone.

V93 adds a compact air-punch wake below the extended forearm. The old jumping fist had no strike-path cue. Muted shaded material keeps the fist leading and the face clear; the tail contracts through the existing eight active ticks, with no retained FX state. Both bodies remain in front. Landing, interruption, recovery, invulnerability blink and impact silhouettes suppress it. No combat/input/audio/AI/network changes. Eleven script URLs v=96.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-world.js, tests/air-punch-wake.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base ea6f33a; never push. Ready for coordinator review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New air-punch-wake regression fails with --baseline on v92 (no visible wake); final passes 300 early/crest/late/hit/block input timelines across all fifteen builds, mirror costumes, both slots and directions; 12,128 parallel-state ticks, 2,940 native frame/snapshot checks, 120 contacts, 288 freeze holds and 240 normal/enlarged hard-alpha shapes. Minimum opening-active whiff difference 105 pixels. Checks unchanged occupied body pixels, read-only state/effects, snapshot parity, reflection, contraction, twenty fractional/edge crops, interruptions, landing and impact silhouettes. Fixed ea6f33a reference preserves before pairs after commit. First draft failed Greta's visibility threshold; widened its lower edge before final pass.
- Air-attacks passes 360 actual early/crest/late/slow timelines, 240 costume phase silhouettes and 120 hit/block contacts, freezes, floors, snapshots, hit/KO, landing/rematch and unchanged outcomes. World passes 308 frames. Feel/input passes eleven simulation groups plus actual keyboard handlers. Actual-script runtime/title/selection/move list/results/input and online lifecycle suites pass; world/runtime rerun after final geometry adjustment. Source/new-test syntax, eleven v96 URLs and diff whitespace pass.
- Native 640x360 v93-before/after-ch0-whiff-d0-courtyard-right-t4.png inspected at 1x, plus Greta gallery-left-t6 pair, ch0 block-d25-gallery-right-t4 and ch0/Greta late-t11 frames. The small lower trail reads beneath the extended arm; faces and fists stay clear, and the late cue is compact. Additional early/crest/descending, hit/block and mirror pairs across all three stages retained in the codex mailbox, alongside v93-runtime-frame/selection-assets/title-mark/attract-frame. Generated memory rasters, not browser captures or observed motion.
- No owner play/listening, live browser/focus/activation, motion/FPS, keyboard rollover or real two-computer WebRTC check. Browser not retried. Unchanged stage, full-match, individual art, audio/contact and performance suites not repeated. Last full-match smoke: 225 matchups/1,169,896 ticks. Scripts and stills do not count as owner play.

## Next priorities

Owner first-minute readability/feel/listening notes take priority. All three arenas are closed per 19:51. Next audit should reproduce one visible gap in a fighter, hit, HUD or round flow, with full native before/after scenes at 1x. No speculative balance/audio changes. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
