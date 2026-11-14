# Ritual Archive: Clash (demo)

An original pixel-art 2D fighting game demo: fifteen original fighters, each with one technique from the Ritual Archive library. No feats, no levels.

## Run
Double-click `index.html`. Nothing to install. (Online play needs an internet connection on both computers.)

## Modes
- 1 Player vs Computer, 2 Players on one keyboard, Watch (computer vs computer)
- Online: one player hosts and gets a 4-letter room code, the other joins with it. The host's game runs the fight.
- The title keeps a silent computer exhibition running behind the bitmap wordmark and four described mode choices. Its label identifies the current fighters and arena. Tab browses the buttons; Enter or Space chooses a mode.
- Choose Archive Courtyard, Rainlit Gallery or Dawn Observatory on the fighter selection screen. Online, the host chooses; rounds and rematches keep that stage. Stages have the same fighting bounds and no hazards.
- Fighter selection shows portraits and two full-body previews, including the second costume in mirror matches. Use Tab to reach a choice, arrow keys to browse its roster, then Enter or Space to select. The Fight button stays below the scrolling choices; full move lists and rules expand beneath the arena choices. Quick controls follow the selected mode.
- Technique labels use the full card width, wrap at spaces and start below a consistent name/portrait row. On narrow screens, title and selection use the viewport height; fights keep their 16:9 canvas. This remains a keyboard game.

## Rules
- Best of three rounds, 99 seconds each. Punch (three presses chain), kick, jump, guard.
- Arts cost Cursed Energy, which refills by itself and faster when you land blows.
- The Domain (or Maximum) can be used once a round, when its gauge is full or you are under 30% health.
  Two Domains meeting cancel each other.

## Code

`src/sim.js` contains deterministic fight rules; `src/fighters.js` and `src/fighters2.js` define the fifteen techniques. `src/ai.js` controls the computer. `src/pixel.js`, `pixel-stage.js`, `pixel-domain.js`, `pixel-world.js` and `pixel-hud.js` draw original pixel art; `src/render.js` manages impact events; `src/main.js` handles menus, input, synthesized sound and online play. See `ART_DIRECTION.md` for the art rules.

## Script checks

`node tests/runtime.cjs` checks the real script order, all four HTML mode routes, title returns, advancing attract match and its fighter/stage labels, then the menu-to-match flow: 150 fighter selections across all five modes, full move lists, host/guest restrictions, stable keyboard focus, arrow/Home/End navigation and 30 exact main/mirror preview canvases. An optional output directory saves `v35-title-mark.png`, `v35-attract-frame.png`, `v35-selection-assets.png` and a gameplay frame. These verify canvas contents and scripted behavior, not browser CSS layout or human play. The isolated input/HUD suites omit the DOM boot, which this integration suite executes in full.

`node tests/jab-animation.cjs` checks actual first-punch whiffs/hits/blocks in both slots/facings, distinct withdraw/fold/guard silhouettes, fixed grounded return soles, all eight recovery ticks and immediate second-press chaining from each tick, freezes, hit/KO interruptions, snapshots and unchanged outcomes. Add an output directory for labeled phase, silhouette and actual-input scene previews.

`node tests/kick-animation.cjs` checks actual grounded kick whiffs/hits/blocks in both slots/facings, distinct fold/lower/plant silhouettes, grounded support soles, exact recovery boundaries, freezes, hit/KO interruptions, snapshots and unchanged outcomes. Add an output directory for labeled phase, silhouette and actual-input scene previews.

`node tests/air-facing.cjs` checks the actual world painter for all fifteen builds, both costumes and both facings: complete sprite reflection about the simulation root and forward fist/boot pixels at airborne contact. Add an output directory for an explicitly labeled Greta direction sheet.

`node tests/punch-chain.cjs` checks actual two- and three-press punch chains, whiffs/hits/blocks, both slots/facings, distinct loads and second/third-punch returns, fixed grounded second-punch soles, all nine recovery ticks and immediate third-press chaining from each tick, freeze holds, hit/KO interruptions, snapshots and unchanged outcomes. Add an output directory for labeled second-punch phase, silhouette and actual-input scene previews.

`node tests/air-attacks.cjs` checks actual early/crest/late airborne punch and kick inputs, slowed jumps, real hit/block contacts in both slots, distinct suspended wind-up/recovery silhouettes, floor clearance, freezes, interruptions, snapshots and unchanged outcomes. Add an output directory for phase, silhouette and actual-input scene previews.

`node tests/jump-animation.cjs` checks actual straight/directional jumps under ordinary and Domain-slowed motion, distinct ascent/crest/descent/approach silhouettes, floor clearance, attack/hit interruptions, freezes, snapshots and unchanged outcomes. Add an output directory for phase, silhouette and actual-jump scene previews.

`node tests/victory.cjs` checks knockout, timeout and airborne-winner timelines in both slots, grounded victory phases, recovery eligibility, ties, freezes, snapshots and unchanged outcomes. Add an output directory for phase, silhouette and actual-round previews.

`node tests/footwork.cjs` checks actual forward/backward walking, direction reversals and opponent crossings in both slots, grounded support soles, reduced foot drift at normal-speed frame boundaries, distinct advance/retreat silhouettes, freezes, snapshots and unchanged outcomes. Add an output directory for phase, silhouette and actual-walk scene previews.

`node tests/domain-backdrops.cjs` checks fifteen distinct layered three-tone Domain/Maximum spaces, eight hard-alpha motion phases, unchanged stage floors, freeze/snapshot stability, bounded caches and actual input-driven timelines across all stages. Add an output directory for all-fifteen and detail scene previews. Selected spaces are cached before a round starts. Domain scenery follows the active Domain clock.

`node tests/guard-animation.cjs` checks actual block, guard-break and shock timelines for both player slots, distinct recoil/recovery silhouettes across all builds, repeated contacts, freeze/time-stop holds, snapshots and unchanged simulation. Add an output directory for phase, silhouette and actual-contact scene previews.

`node tests/domain-animation.cjs` checks all fifteen input-driven Domain/Maximum timelines in both player slots, cinematic countdown poses, actual release ticks, held casts, interruption/clash/expiry, snapshots and unchanged simulation. Add an output directory for phase, silhouette and actual-timeline scene previews.

`node tests/cast-animation.cjs` checks palm-cast and spoken-art silhouettes, actual release events and projectile origins, immediate dash transitions, frozen/time-stopped frames, snapshots and unchanged simulation. Add an output directory for phase, silhouette and in-stage previews.

`node tests/art-animation.cjs` checks all 45 arts for both owners, exact startup/contact/recovery boundaries, six distinct art-family silhouettes across all builds, release-hand alignment, frozen/snapshotted frames and unchanged deterministic outcomes. Add an output directory for color/silhouette sheets and actual firing-tick scenes.

`node tests/summons.cjs` checks original hound bounds/bites, Nue wing strokes and dive/bank angles, Toad extension/recoil, three-tone palettes, directional cells, actual summon timelines, freeze/time-stop clocks, snapshot stability and unchanged simulation. Add an output directory and optional version prefix for phase and scene previews.

`node tests/trails.cjs` checks all projectile wakes, birth/flight/expiry phases, diagonal direction, real art samples, freeze/JSON stability and unchanged simulation.

`node tests/airborne.cjs` checks actual airborne reactions, distinct arch/crest/floor-reach silhouettes across all fifteen fighters, freeze holds, takeoff/landing/body-impact dust, event coalescing, bounds and lifecycle. Add an output directory for the current reaction and silhouette preview sheets.

`node tests/contacts.cjs` checks contact-effect phases, real hit/block/break event wiring, exact directional mirroring, expiry and unchanged simulation state.

`node tests/audio.cjs` checks synthesized sound scheduling, damage-dependent hit layers, shared compressor/master gain, mute, audio resume, cached noise, voice limits and node cleanup. Add an output directory to generate a browser audition page and envelope preview. Mocked audio checks do not establish how the game sounds.

Node is optional for development checks; the game itself needs only a browser. Run `node tests/feel.cjs`, `node tests/smoke.cjs`, `node tests/pixel.cjs`, `node tests/animation.cjs`, `node tests/silhouettes.cjs`, `node tests/stage.cjs`, `node tests/world.cjs`, `node tests/hud.cjs` and `node tests/runtime.cjs`. These cover command timing, all matchups, sprite bounds, animation timelines and ground contact, rendering and main-loop integration. They are not human playtests. `node tests/performance.cjs` measures Node CPU raster time only.
