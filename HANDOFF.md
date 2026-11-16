# Handoff: Ritual Archive: Clash

## Current - v139 WEB/cache v=142; mobile v138/cache v=141 (2026-11-16 06:17:20 UTC)

Mailbox through 2026-11-16 00:56 acted on. V138 accepted/published as 907e281. Owner directly requested an autonomous check-in, outstanding orders and a mailbox report; no new design direction. One version this run. Coordinator commits; never push.

V139 adds desktop-only src/desktop-contract.js: Pim Larkspur reaches along the strand at move ticks 3-5, pulls her fist into the ribs on the existing tick-six grab, braces at 9-15, then settles. The hand travels 47 pose units backward and the head shifts 29 while both soles stay planted. Serialized move age holds through freezes and first event-free guest snapshots. Costs, damage, strand consumption, grab, guard behavior and recovery stay unchanged. Twenty desktop scripts use v=142. Every pre-existing src file and all mobile content remain unchanged.

Commit: none; HEAD/base 907e2810743d917252c10eefc65fec98bab5c9ce. No add/commit attempt per 01:34/03:00; never pushed. Eight files for coordinator commit: HANDOFF.md, README.md, index.html, src/desktop-contract.js (new), tests/contract-body.cjs (new), tests/runtime.cjs, tests/desktop-domain.cjs, tests/desktop-guard.cjs. Ready for coordinator review/commit/publication. No tests remain running.

## Verification and limits

- Contract-body PASS: five groups / 4,000 parallel ticks / 1,728 rasters / 3,960 frozen holds / 9,202 unchanged defaults / 96 changed scenes. Both slots/facings, full/low health, hit/guard/rear/jump/far targets, actual Gum projectile attachment followed by Contract, missing-strand rejection and Infinity checked. Exact costs, 30 damage (also through guard), tick-six release, strand consumption, grab target, recovery and simulation parity retained. Baseline omits only this adapter: the animation and real-chain animation groups intentionally fail; other three groups pass. Preview-only permits those expected failures.
- Exact native differences remain inside the old/new body union on all three stages. HUD/strand/other arts/Domains/portraits/old sprites unchanged; new sprites have hard alpha, <=24 colors, bounded cells and planted soles. Initial fixture assumptions about the existing slot-dependent 11/12 grab countdown and far-drag convergence were corrected; the new brace ends at the existing tick-16 settle boundary. No simulation fix was needed.
- Full desktop runtime PASS: actual twenty-script boot, menus/input/results/rematch/online and all prior fighter-animation paths, plus real keyboard Gum attachment -> Contract in AI/local/host modes and 22 event-free guest snapshots. Focused AI-mode casts use keys with AI disabled; no balance claim. Earlier partial run superseded after adding this real prerequisite sequence; final full run passed.
- Desktop-domain PASS: 525 checks. Desktop-guard PASS: 2,713 checks / 26,114 parallel ticks. Feel PASS: eleven simulation groups plus keyboard/remote handlers. Mobile-install and five changed/new JS syntax checks PASS. All nineteen pre-existing src files exactly match Git blobs; protected mobile diff clean (mobile/index.html has its pre-existing checkout line-ending difference). Final git diff --check PASS.
- 52 PNGs in mailbox: paired eleven-frame native body/full-scene strips and individual scenes, main/right/Courtyard and mirror/left/Gallery. Inspected before/after main bodies, mirrored bodies, before/after main reach, both release scenes and main late brace. Generated renderer stills, not browser screenshots or observed motion. Export: node tests/contract-body.cjs --out=PATH; baseline adds --baseline --preview-only.
- No browser/phone, physical keys/touch, motion/FPS/latency, audible audio, native CSS/focus/events, OS install/backgrounding, two-device WebRTC or owner play of v139. No performance claim. Historical full-roster/world and unchanged dedicated mobile suites not repeated. Script-tested is not played.
- Owner correction via 23:34 remains: reloaded arena works on iPhone 12 mini/iOS 26.5. V136 MUTE/MOVES still awaits their toolbar-height retest; no new result through 00:56. Retain v122 renderer. Proposed next v140 MOBILE: bring the reviewed Contract body across; owner phone feedback jumps queue. Arenas, optional Rapid Slash, general cluster opacity and library-name audit remain deferred. No question needed.

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
