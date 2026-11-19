# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/HisyamMahfuDz/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/HisyamMahfuDz/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline guide and tracker for all **55 trophies of Grand Theft Auto VI on PlayStation 5**, built for make.fun's `gta6-trophy-guide-01` competition ("Build the best GTA 6 trophy guide").

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

The app is plain static files under `app/` — no build step, no network at run time. Open `app/index.html` in desktop Chrome with the network off and it works.

## What it is

- **The full official list**: all 55 trophies with their official name, description and grade (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden on PlayStation until earned), as published on PlayStation and mirrored by Exophase and PSNProfiles.
- **A tracker**: tick trophies off in a checklist saved in your browser (localStorage), with export to a JSON file and import back.
- **Filters**: by kind (story, side, collectibles, activities, combat, exploration, money), by grade, by earned/unearned, plus full-text search.
- **Spoiler mode**: hides the names and descriptions of hidden story trophies until you earn them.
- **A platinum roadmap**: five stages in the order to earn them, built from the official descriptions.
- **Missable & save strategy**: the one possibly-missable trophy (Positive Mental Attitude — a Chapter 1 meditation spot) flagged, with the manual-save habit that protects it, since the game has no mission replay.
- **A guide for every trophy, in our own words**, with steps and named sources beside each one. Nothing copies another guide's text; no Rockstar logo or artwork is used.

## Hand it in (make.fun)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `vendor/makefun-frontend.ts`.

## Screenshots

`screenshots/` holds 4 real renders of the app in desktop Chrome:

1. `1-cover.jpg` — hero, progress bar and the trophy checklist
2. `2-tracker.jpg` — tracker with a demo checklist, filters, and a trophy guide open
3. `3-roadmap.jpg` — the platinum roadmap stages
4. `4-spoiler.jpg` — spoiler mode hiding the story trophies

## License

MIT — see [LICENSE](LICENSE).

---

<sub>Entered on [make.fun](https://make.fun/?ref=0a6j83jv&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
