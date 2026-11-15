# Handoff: Ritual Archive: Clash

## Current - version 113 WEB, desktop cache v=116; mobile v112/cache v=115 (2026-11-15)

Mailbox through 17:59 read/acted on; reread at completion, unchanged. V112 committed/live as 8afa390. V113 completes the ordered desktop Domain/Maximum availability and failed-input-feedback audit. Alternate web/mobile from v113; owner phone feedback jumps the queue. Coordinator commits and pushes reviewed versions; Codex never attempts either (01:34/03:00). Owner directly repeated autonomous check-in/report instructions; no new design direction. Arenas closed; optional Rapid Slash and mobile cluster placement/opacity remain deferred.

Reproduced against actual v112 desktop scripts before fixing: full-gauge airborne Domain says FULL READY, unavailable Domain presses have no cue, and unrelated art failures flash Domain. All eight initial audit groups failed; expanded baseline fails nine of ten (shared default compatibility passes). These are script/renderer findings, not observed browser behavior.

Desktop-only adapter src/desktop-feedback.js: qualified airborne Domain/Maximum says LAND FIRST. Sampling an unavailable local Domain key highlights only that card's current reason with the existing crimson field/rails for eighteen presentation updates. Held input does not renew it. Used Maximum and both local/guest slots supported; readiness, changed reason, expiry, blur, pause, selection, new fight and round transitions clear stale cues. This is local availability feedback, not a simulation rejection, cast confirmation or server acknowledgement. Buffering, input encoding, simulation, audio and networking unchanged. Existing art rejection cues otherwise unchanged.

Shared pixel-hud.js only extracts its old Domain-card state into an overridable helper, retaining byte-identical default output. Mobile loads no desktop adapter; every mobile file is byte-identical. All twelve desktop scripts now use v=116; mobile remains v=115.

Files for coordinator commit: HANDOFF.md, README.md, index.html, src/pixel-hud.js, src/desktop-feedback.js (new), tests/desktop-domain.cjs (new), tests/runtime.cjs. HEAD/base 8afa39071f24be711bd1755f4b5a1fa505114b1d; no commit attempt; never pushed.

## Verification and limits

- node tests/desktop-domain.cjs: ten groups, 525 read-only HUD checks. All fifteen fighters/both slots, full-gauge/HP/air/used states, quick/held input and eighteen-update expiry, unrelated real art rejection isolation, readiness cleanup, real successful Domains, freeze-buffered cast, guest/local/watch isolation, blur/pause/select/new-fight/round cleanup. Parallel simulation remains identical.
- 105 roster/state cases compare unadapted shared HUD to 8afa390 byte-for-byte. Desktop pixel differences are confined to Domain cards; ordinary grounded/full/HP-ready/used-without-press cards remain identical.
- node tests/runtime.cjs passes actual twelve-script boot, menus/focus/selection/results/rematch, stale online callback/event coverage, plus real AI/local/host/guest frames for the new cue, exact guest packet and delivery of both blur listeners. Memory DOM/canvas, not a browser.
- node tests/mobile-feedback.cjs passes existing mobile input/overlay, eight touch-feedback groups and CSS guard, plus full CPU match to results/rematch/title (2,813 main-loop frames; raster drawing skipped during long match). node tests/feel.cjs, node tests/art-denial.cjs (196 real rejected timelines, 3,724 ticks, 992 HUD checks), and node tests/mobile-install.cjs pass. Syntax/diff checks pass. git diff confirms mobile/, simulation, fighters, main.js and render.js unchanged. Unchanged stage/world/animation/full-match/performance/audio suites not repeated.
- Sixteen native 640x360 before/after renderer scenes in codex mailbox: Domain press, airborne Domain, used Maximum and unrelated art rejection, on Courtyard/Gallery. Inspected the Courtyard Domain/air/art pairs and Gallery Maximum pair at 1x. Not browser screenshots. Export: node tests/desktop-domain.cjs --baseline --preview-only --out=PATH, then current --out=PATH.
- No browser/phone used; no motion/FPS/latency, real keyboard rollover, audible feedback, trusted DOM/native styling, two-device WebRTC or owner play checked. Script-tested is not played. Please check L/H/slash quick and held unavailable presses, airborne ready gauge/HP, recovery buffering, pause/blur and guest feedback in an actual match.

## Next priorities

V113 ready for coordinator review/commit/publication under 17:59. Next v114 MOBILE per alternation: candidate first-minute Domain/Maximum button distinction audit (name, type and gauge/HP/used/air reasons during real casts/clashes), reproduce before choosing a fix; owner phone feedback takes priority. No decision needed. Leave this one-version run ready for coordinator commit.

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
