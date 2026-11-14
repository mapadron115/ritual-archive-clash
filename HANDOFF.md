# Handoff: Ritual Archive: Clash

## Current - version 77, script cache v=80 (2026-11-14)

All mailbox entries through 15:19 acted on/acknowledged. V76 committed by coordinator as e7c2d79, not pushed. Owner direct check-in repeats independent work/mailbox/report instructions; no design change.

V77 corrects contradictory Escape guidance: selection's controls reference and the in-match help called it Pause even online, where the fight continues. Both now say Move list, with mode-specific pauses match / online match continues guidance. Online's button says Close list (Esc); offline retains Resume (Esc), refreshed on each opening after mode changes. No input, pause behavior, combat, AI, rendering, audio or network changes. Eleven script URLs v=80.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/main.js. No add/commit attempt per 01:34/03:00; HEAD/base e7c2d79; never push. Ready for review/commit and owner assessment before publication. No design decision pending.

## Verification and limits

- One-off baseline check reproduced the false online Pause promise before editing. Actual-script runtime passes its menus, selection, 200 move-list key events in five modes, offline freeze, neutral guest controls/live snapshots, host continuation, fresh resume input, results and online callback regressions. Eight added in-memory selection/open/close/mode-switch checks pass the actual generated reference/help/button labels across all five modes. No new test file for this text-only change.
- Feel/input (eleven simulation groups plus handlers), HUD learning (2,115 layout/alpha/snapshot states, 90 actual art inputs and 60 Domain uses/resets), source syntax, eleven matching cache URLs and diff whitespace checks pass.
- Exported v77-controls-guidance.html in the codex mailbox: actual generated selection references and open-list content for all five modes, using current CSS. It is a review artifact, not a screenshot. Runtime/title/selection/attract rasters also exported; inspected v77-runtime-frame.png, whose fight rendering is unchanged.
- Retried CUA inventory: browser access host unavailable; no browser surface. Changed DOM wording/layout has not been visually checked. No human play/listening, native focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. Unchanged broad combat/art/audio/performance suites not repeated.
- Prior regression evidence and detailed previews remain in dated FROM_CODEX.md entries. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Retry native browser fight/move-list/results review when the surface works; remaining broad visual refinements follow. Watch identity and third-punch soles are addressed. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
