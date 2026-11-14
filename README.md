# Ritual Archive: Clash (demo)

An original pixel-art 2D fighting game demo: fifteen original fighters, each with one technique from the Ritual Archive library. No feats, no levels.

## Run
Double-click `index.html`. Nothing to install. (Online play needs an internet connection on both computers.)

## Modes
- 1 Player vs Computer, 2 Players on one keyboard, Watch (computer vs computer)
- Online: one player hosts and gets a 4-letter room code, the other joins with it. The host's game runs the fight.
- Choose Archive Courtyard, Rainlit Gallery or Dawn Observatory on the fighter selection screen. Online, the host chooses; rounds and rematches keep that stage. Stages have the same fighting bounds and no hazards.

## Rules
- Best of three rounds, 99 seconds each. Punch (three presses chain), kick, jump, guard.
- Arts cost Cursed Energy, which refills by itself and faster when you land blows.
- The Domain (or Maximum) can be used once a round, when its gauge is full or you are under 30% health.
  Two Domains meeting cancel each other.

## Code

`src/sim.js` contains deterministic fight rules; `src/fighters.js` and `src/fighters2.js` define the fifteen techniques. `src/ai.js` controls the computer. `src/pixel.js`, `pixel-stage.js`, `pixel-world.js` and `pixel-hud.js` draw original pixel art; `src/render.js` manages impact events; `src/main.js` handles menus, input, synthesized sound and online play. See `ART_DIRECTION.md` for the art rules.

## Script checks

Node is optional for development checks; the game itself needs only a browser. Run `node tests/feel.cjs`, `node tests/smoke.cjs`, `node tests/pixel.cjs`, `node tests/animation.cjs`, `node tests/silhouettes.cjs`, `node tests/stage.cjs`, `node tests/world.cjs`, `node tests/hud.cjs` and `node tests/runtime.cjs`. These cover command timing, all matchups, sprite bounds, animation timelines and ground contact, rendering and main-loop integration. They are not human playtests. `node tests/performance.cjs` measures Node CPU raster time only.
