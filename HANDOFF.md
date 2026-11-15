# Handoff: Ritual Archive: Clash

## Current - version 116 MOBILE/cache v=119; desktop v115/cache v=118 (2026-11-15)

Mailbox through 18:35 read/acted on; reread at completion, unchanged. V115 committed/live as 8d53f71. V116 completes the ordered mobile guard-button audit, the last HUD/cue pass for a while. Alternate web/mobile; owner phone feedback jumps the queue. V117 WEB must favour fighter reactions/poses, attack anticipation/follow-through or Domain cast moments. V118 MOBILE must measure a busy fight's real mobile renderer frame cost (Domains, sparks, dust, trails), cut the heaviest reproduced cost without changing the look, or report cheap timings and choose another phone-specific gap. One reproduced visible-or-felt improvement per version. Arenas closed; optional Rapid Slash and mobile cluster placement/opacity remain deferred.

Reproduced on v115: GUARD is the same single label during defense, jump, attack/cast and injury recovery; a held contact looks equally protective in all of them. All eight guard-button audit groups fail before the fix because there is no state indicator. Script/model finding, not a browser observation.

Mobile-only button now shows GUARD plus HOLD (instruction), ON (actual guard or ordinary block stun), LAND (free airborne), LOCKED (committed attacks/casts/injury recovery), or WAIT (outside fight phase). An amber plate and two rails stay visible under held/contact styling when unavailable. Input remains enabled so a held guard resumes after recovery/landing. State comes directly from the local serialized fighter, including guest slot 1; no cached warning/host acknowledgement. ON describes guard state, not guaranteed defense against every hit/direction. Upper HUD/strength meters, shared scripts and desktop stay unchanged. All twelve mobile scripts and linked cache resources use v=119; desktop remains v=118.

Files for coordinator commit: HANDOFF.md, README.md, mobile/index.html, mobile/manifest.webmanifest, mobile/mobile.css, mobile/touch.js, tests/mobile.cjs, tests/mobile-guard.cjs (new). HEAD/base 8d53f71; no commit attempt per 01:34/03:00. Never pushed. Owner directly repeated autonomous check-in/report instructions, without new design direction.

## Verification and limits

- node tests/mobile-guard.cjs: eight groups pass, 1,217 read-only button checks and 20,697 paired simulation ticks. Real synthetic pointers into actual readKeys/step: basics and all 45 arts across both slots, held Rock, all fifteen Domain/Maximum casts and cinematic holds, jump/air attacks/landing, ordinary block/break/shock/hit/down and held restoration. Actual front hits deal 20 during kick/cast/jump versus 3 chip while guarding/blocking. Event-free guest snapshots, actual AI/host main-loop recovery, duplicate contacts, cancellation, freeze/hit-stop/time-stop, newRound and lifecycle pass. State rendering leaves simulation identical to its parallel control. Fixed v115 adapter fails all eight groups.
- node tests/mobile-feedback.cjs, mobile-domain.cjs, mobile-audio.cjs, mobile-install.cjs, runtime.cjs and feel.cjs pass. Audio suite includes mobile menu/lifecycle checks; imported mobile harness completes CPU match/results/rematch/title (3,151 frames in final guard run; long match skips raster uploads). Existing upper-HUD pixel identity, 60 art names/states, >=48px targets, gaps and safe-area bounds pass. Syntax/diff checks pass; git diff --exit-code HEAD -- index.html src confirms all desktop/shared source unchanged. Unchanged full-roster/art/stage/performance suites not repeated.
- Thirty before/after phone-size bitmap models in codex mailbox: five states at 667x375, 844x390 and portrait 390x844. Inspected 667 kick before/after, air, restored guard, and 844 Maximum at 1x. Pixel comparisons: every landscape change is confined to the existing 52x48 guard button (2,496 pixels when locked; 592 active); portrait views identical. Export: node tests/mobile-guard.cjs --guard-baseline --preview-only --out=PATH, then current --out=PATH. These are generated layout models, not browser screenshots or CSS measurements. CSS precedence checked statically only.
- No browser/phone, motion/FPS/latency, physical touch/keyboard, audible sound, native pointer capture/focus/CSS, OS lifecycle/install, two-device WebRTC or owner play checked. Script-tested is not played. Owner check: hold GUARD during a kick, long art, Maximum and jump; amber LOCKED/LAND should return to ON after recovery/landing. Ordinary block stun should stay ON. Releasing ordinary guard must stop it on the next physics tick even while the brief contact acknowledgement remains. Check guest slot too.

## Next priorities

V116 ready for coordinator review/commit/publication under 18:35. Next v117 WEB: reproduce one clear fighter-animation gap before changing it; no further HUD/cue pass. Then v118 MOBILE frame-cost audit as above. No decision needed; leave this one-version run ready for coordinator commit.

Owner dive feel notes still take priority. V97: 44 active warning ticks before tick-46 impact, 250 damage, 310-unit width, unchanged cost. Bram retreat delayed 8 ticks escapes/9 hit; jump-away delayed 15 escapes/16 hit. Only owner play judges feel.

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
