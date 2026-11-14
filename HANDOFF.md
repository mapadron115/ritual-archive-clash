# Handoff: Ritual Archive: Clash

## Current - version 88, script cache v=91 (2026-11-14)

All mailbox entries through 16:58 acted on/acknowledged. V87 committed by coordinator as cea4ca1, not pushed. Owner's direct check-in repeats autonomous work/mailbox/report instructions; no design change or decision pending.

V88 follows the requested arena audit: the Observatory's large brass instrument had fixed hoops and only a thin moving pointer. Its inner hoop now turns from broad to edge-on and back, with shaded upper brass and a pale lower rim inside the fixed outer frame. Axle, pedestal, floor and both fighters stay in front/in place as appropriate. Uses the existing sixteen-phase/global-clock backdrop loop and 24-surface cache, with no extra state/cache or simulation, combat, input, sound, AI, roster/style or network changes. Eleven script URLs v=91.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-stage.js, tests/observatory-hoop.cjs (new). No add/commit attempt per 01:34/03:00; HEAD/base cea4ca1; never push. Candidate for review/commit and owner motion/readability assessment before publication.

## Verification and limits

- New regression first failed on v87: open/edge-on instrument frames differed by only 306 pixels. Final passes 498 native stage/fight frames across every build/mirror costume/direction and idle/air/guard poses; 2,558,256 clear fighter pixels. Minimum full-scene difference from the fixed instrument: 1,744 native pixels. Open/edge-on instrument difference: 3,176 pixels; rim nearest support <=12 pixels across every phase, including wrap. Loop seam changes 724 pixels versus 1,982 at the fast middle turn. Tests check read-only snapshots, hard alpha, fixed floors, unchanged other stages/outside the instrument bounds and cache identity. Fixed-hoop suppression keeps scene assertions useful after commit.
- Stage motion passes 48 opaque loop frames, six two-cycle input timelines, snapshots/unchanged outcomes, clock/freeze behavior, rain masking and bounded cache retention. Initial integration caught a shorter visible pointer from putting the hub on top; restored its original order, preserving max centroid step 9.12 px. Stage suite (48 frames/45 Domain combinations), world (308), feel/input and actual-script runtime/menu/selection/results/online lifecycle suites pass. Syntax, eleven matching v91 URLs and diff whitespace pass.
- Exported 60 before/60 after native 640x360 fight/HUD pairs (all differ): Isolde/Greta, both directions, idle/air/guard and phases 0/4/8/12/15; plus sixteen-phase native instrument contact sheets. Inspected before/after ch0-idle-right-p8 and p0, ch14-air-left-p4, ch14-guard-left-p15 and the complete after-loop sheet at 1x. The broad/edge-on difference is clear; the ring stays behind airborne bodies. v88-runtime-frame.png, v88-selection-assets.png, v88-title-mark.png and v88-attract-frame.png retained in mailbox. These are memory rasters, not browser screenshots or observed motion.
- Node CPU-only performance suite: ordinary world+HUD medians 1.88/1.93/1.97 ms and p95 5.84/2.31/2.78 ms (courtyard/gallery/observatory), 120 samples each while other checks ran. Not comparative or browser FPS. All Domain/contact profiling completed; 24 simultaneous damage values cost median 13.99 ms in that existing stress scenario. No new runtime cache allocation.
- No human play/listening, live browser layout/focus/activation, motion/FPS, keyboard rollover or real WebRTC/two-computer check. No browser retry after v77's unavailable access host. Unchanged full-match, individual move/art, audio and contact suites not repeated. Owner must judge whether the 16-step hoop motion feels mechanical/smooth enough and stays subordinate to the fight.
- Prior detailed evidence remains in dated FROM_CODEX.md. Last full-match smoke: 225 ordered matchups/1,169,896 ticks. Nobody has listened to validate synthesized sound. Coordinator browser reviews covered title/selection through v37, not fights/results. Neither scripts nor screenshots count as owner play.

## Next priorities

Owner first-minute offline readability/feel/listening notes take priority. Per 15:30/12:21, choose only arena/move/hit improvements demonstrably visible in full scenes at 1x; subtle pixel and wording fixes wait. Review the Observatory hoop in motion and the recent contact/ground/air-kick cues before further tuning. Next independent audit: whether stage values separate both mirror costumes during crowded first-minute combat; only change a reproduced visible gap. Retry native browser fight/move-list/results review when the surface works. No speculative balance or audio retuning. Known balance question already passed to coordinator: late run/vertical jump cannot escape the locked diving Maximum, while swap escapes and guard reduces damage; leave its rule unchanged.

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
