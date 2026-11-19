# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Kace2122/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Kace2122/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Legend — an offline web app that guides and tracks all 55 GTA 6 trophies: the official list with saved progress, filters and a spoiler setting, a roadmap to the platinum, and a guide to each that cites its sources.

The tracker is a checklist saved in your browser (localStorage) with export to file and import back, filters by kind (story, missable, collectibles, activities, online), search, a spoiler setting that hides story trophy names and descriptions until earned, and progress counters (earned/total, per grade, %). The roadmap orders the list into five phases — story, side stories, partner crime, activities, then the long grind to 100% — and the missables page flags the one possibly missable trophy, Positive Mental Attitude, and the time-sensitive race to watch for. Every trophy has a guide written in our own words that names its sources beside it: Exophase for the official name, description and grade; PSNProfiles for rarity percentages and progress counters; OutputLag for how-to detail where a place or step is pinned down. Anything not pinned down by a source is labelled as our own advice from the official description, not yet checked in the game — the game is not out yet, so no guide can honestly claim more. No guide text is copied from another guide, wiki or forum, and no Rockstar logo or artwork is used. The app works fully offline and makes no network request at runtime.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. `?demo=1` seeds a fixed 13-trophy demo progress set (only when no progress is saved yet); `#/roadmap`, `#/missables` and `#/guide/<id>` jump straight to those views.

---

<sub>Entered on [make.fun](https://make.fun/?ref=9j3afemp&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
