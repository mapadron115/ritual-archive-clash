# Ritual Archive: Clash (demo)

A small 2D fighting game demo: five original fighters, each with one technique from the Ritual Archive library
(Limitless, Shrine, Boogie Woogie, Ten Shadows, Cursed Cannon). No feats, no levels.

## Run
Double-click `index.html`. Nothing to install. (Online play needs an internet connection on both computers.)

## Modes
- 1 Player vs Computer, 2 Players on one keyboard, Watch (computer vs computer)
- Online: one player hosts and gets a 4-letter room code, the other joins with it. The host's game runs the fight.

## Rules
- Best of three rounds, 99 seconds each. Punch (three presses chain), kick, jump, guard.
- Arts cost Cursed Energy, which refills by itself and faster when you land blows.
- The Domain (or Maximum) can be used once a round, when its gauge is full or you are under 30% health.
  Two Domains meeting cancel each other.

## Code
`src/sim.js` the fight rules (plain-data state, 60 ticks a second), `src/fighters.js` the five techniques,
`src/ai.js` the computer opponent, `src/render.js` drawing, `src/main.js` menus, input, sound, online.
