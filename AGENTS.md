# Standing brief for Codex: Ritual Archive: Clash

Written 2026-11-14 by the Ritual Archive coordinator (a Claude session, `claude-watch`), at the owner's request. Codex reads this file by
itself at the start of every session in this folder. **Read `HANDOFF.md` next:** it has the code map, how to run and test, and the owner's
earlier decisions.

## The job
Improve this original 2D fighting game, version by version, toward the owner's target:
- **The likely target:** a polished old-style pixel fighter, in the spirit of the classic arcade and 16-bit fighters: crisp sprites,
  readable silhouettes, weighty hits, strong animation and good stages.
- **The stretch target:** a look that approaches a modern big-budget fighter (Mortal Kombat quality).
- Feel comes before looks: responsive controls, clear hitboxes, hit-stop, fair computer play.

`HANDOFF.md` has an older note ("cartoon style like Brawlhalla / Castle Crashers"). Don't change the art style until the coordinator passes
on the owner's choice.

## Work on your own; the coordinator is your contact
The owner wants you to work **mostly on your own, with little input from them**. Make the ordinary calls yourself and note them in your report.
**When you need any input, ask the coordinator, never the owner directly.** The coordinator answers or takes the question to the owner.
If the owner does speak to you directly, their word wins over everything here; tell the coordinator what they said.

**Your mailbox** (the only place outside this folder you may read or write):
- **Orders in:** `C:\Users\mapad\dev\ritual-archive-board\codex\FROM_COORDINATOR.md`, newest at the top. Read it at the start of every run and
  before each version, and act on any entry you haven't acted on yet. Never edit it.
- **Reports out:** `C:\Users\mapad\dev\ritual-archive-board\codex\FROM_CODEX.md`. Add a dated entry at the top when you finish a version, when
  you're blocked, and when you need a decision. Read the real clock for the date and time; never guess it. Each entry says:
  - what changed, and the commit hash;
  - how you tested it, and what you didn't check;
  - what's next, or the one question you need answered, with your recommended pick.
- **When you ask a question,** stop that piece of work and carry on with anything that doesn't depend on the answer. If nothing is left,
  end the run; the coordinator will start you again with the answer.

## Hard rules
- **Everything stays original.** No characters, likenesses, moves, sprites, sounds, music or stages copied from any existing game, anime or
  manga. Technique and art names come from the owner's library (see `HANDOFF.md`). "In the spirit of" means quality and genre, never copying.
- **This folder only,** plus your mailbox. Never read, edit, build or commit in `C:\Users\mapad\dev\ritual-archive-mc`, or anywhere else in
  `C:\Users\mapad\dev\ritual-archive-board`. They belong to other teams.
- **Never push.** `git push origin main` publishes the live site, which the owner shares with a friend. When a version is ready to publish, say
  so in your report; the coordinator gets the owner's yes and pushes it. Commit locally as often as you like.
- **Say how you tested.** "Script-tested" and "seen in a screenshot" are not "played". Nothing counts as played until the owner has played it.
- Never force-push, never rewrite history, never delete the owner's files, and install nothing system-wide.

## Working habits
- One version at a time: read the mailbox, then plan the version, build it, test it and commit it. Write what changed and what you didn't
  check at the top of `HANDOFF.md`, and report in `FROM_CODEX.md`.
- Keep `HANDOFF.md` short and current: it's how the next run picks up.
- Bump the `?v=N` on every `<script>` in `index.html` in any version meant for publishing.
