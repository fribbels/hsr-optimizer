# Leaderboard Build Script

Builds private and public leaderboard outputs from a DynamoDB export.

## Usage

```bash
npm run leaderboard -- --worker-threads 12
```

When `--export-path` is omitted, the runner auto-discovers the latest `.json.gz` export under `./exports/`.

Useful scratch run:

```bash
npm run leaderboard -- \
  --worker-threads 12 \
  --top-n 25 \
  --top-n-public 25 \
  --fresh-run \
  --private-output-path ./plans/scratch/leaderboard/private.json \
  --public-output-path ./plans/scratch/leaderboard/public.json \
  --build-score-cache-db-path ./plans/scratch/leaderboard/leaderboard-build-score-cache.sqlite
```

Print config without scoring:

```bash
npm run leaderboard -- --print-config --worker-threads 1
```

## Options

| Option                               | Default                                                    | Notes                                                                  |
| ------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| `--export-path <path>`               | latest server export                                       | DynamoDB export path                                                   |
| `--private-output-path <path>`       | `~/leaderboard-cache/private-ranked-output.json`           | Private ranked output with full metadata                               |
| `--public-output-path <path>`        | `./public/leaderboard/leaderboard.json`                    | Public compressed leaderboard output                                   |
| `--top-n <n>`                        | `100`                                                      | Entries per character for prefilter and private output                 |
| `--top-n-public <n>`                 | `100`, capped by private                                   | Entries emitted per public board                                       |
| `--worker-threads <n>`               | `12`                                                       | Profile workers. Must be a positive integer                            |
| `--build-score-cache-db-path <path>` | `~/leaderboard-cache/leaderboard-build-score-cache.sqlite` | SQLite build-score cache                                               |
| `--prune-build-score-cache`          | off                                                        | Deletes stale cache rows, then runs normally                           |
| `--fresh-run`                        | off                                                        | Clears the entire build-score cache for a full rebuild                  |
| `--refresh-character <id>`           | off                                                        | Recomputes one character and replaces its boards, preserving the rest   |
| `--refresh-oldest-character`         | off                                                        | Refreshes the oldest eligible character not completed today            |
| `--print-config`                     | off                                                        | Prints resolved CLI config and exits before metadata/export/cache work |
| `--help`                             | off                                                        | Prints usage and exits                                                 |

`--fresh-run` and `--prune-build-score-cache` cannot be used together.
Character refresh flags cannot be combined with either cache maintenance flag or with each other.

## Character Refresh

Run a normal leaderboard update first, then use the same output and cache paths:

```powershell
npm run leaderboard -- --refresh-character 1000
npm run leaderboard -- --refresh-oldest-character
```

Refresh recomputes the selected character under the existing prefilter and
batch-convergence rules. It does not limit scoring to yesterday's ranked winners
or exhaustively score every exported profile. All its scoring modes and teams
are replaced together; other characters' boards are retained.

`leaderboard-refresh-history.json`, beside the SQLite database, records successful
completion times and the active cache version for each refreshed character.
Normal runs read this file to reuse the replacement scores. Keep it with the
database. A failed refresh does not activate its cache version or advance its
completion time; a later refresh can restart the character. Old cache rows are
retained, so repeated refreshes increase cache storage until a full cache reset.

Rotation selects never-refreshed characters first, then oldest successful
completion. Only enabled five-star characters with eligible export candidates
participate. Once every eligible character has completed today (local time),
the oldest-character command prints `LEADERBOARD_REFRESH_NO_WORK` and exits
successfully. Explicit character refresh is still allowed that day.

A math refresh preserves existing timeline events, emits no new achievements
for that character, and establishes a new score baseline so subsequent player
improvements can be detected even after a downward scoring correction.

Windows automation performs normal beta/main updates at 04:00, then repeatedly
invokes the compiled main CLI with `--refresh-oldest-character`. It stops starting
characters at 09:00, finishes the active character, and publishes. Normal runs
at 10:00, 16:00, and 22:00 wait if necessary. Registration is a separate step in
`C:/Users/fribbels/utils-hsr-optimizer/set-leaderboard-schedule.ps1`; the main
runtime must contain the new CLI before rotation can start.

## Worker Model

The runner uses profile workers only. Each worker scores whole profiles and owns a SQLite-backed `LeaderboardBuildScoreCache` instance.

Use `--worker-threads 1` for small debug runs. `--worker-threads 0` is invalid.

## Cache Model

There is one supported scoring cache:

- `LeaderboardBuildScoreCache`
- SQLite file: `leaderboard-build-score-cache.sqlite`
- Table: `leaderboard_build_score_cache`
- Internal L1 `Map` plus SQLite persistence

Warm hits skip the full leaderboard build scoring call for a candidate/config/team build.

Cache stats split local and SQLite hits:

- `l1Hits`
- `sqliteHits`
- `misses`
- `writes`
- `corruptRowsDeleted`

Normal runs do not prune automatically. Use `--prune-build-score-cache` when you want maintenance. It removes rows whose leaderboard versions hash no longer matches.

Use `--fresh-run` when you want a fully fresh rebuild. It clears the selected SQLite build-score cache. Normal runs rebuild rankings from the export using cached scores; profile differences are reported rather than used to skip scoring.

## Outputs

- Private output: top `--top-n` entries per board with full metadata, dependency versions, and payload index. Used for incremental runs and auditing.
- Public output: compressed top `--top-n-public` entries per board. UIDs and UID hashes are stripped.

Boards are keyed by character, config type, and team. Eidolon is a frontend filter.

## Prefilter Analysis

Offline script that measures prefilter accuracy and simulates batching strategies against ground truth.

```bash
npm run leaderboard -- --top-n 2000 --top-n-public 100
vite build --config vite.leaderboard.config.ts --configLoader native && node --max-old-space-size=8192 .leaderboard-build/runPreFilterAnalysis.js
```

The first command generates ground truth with top-2000 candidates. The second runs the analysis against the private output and current export. If the analysis prints `Ground Truth Warning`, the private output was generated from a different export snapshot — rerun the leaderboard first.

## Validation

```bash
npm run typecheck:fast
npm run vitest:fast
git diff --check
```

Fast config check:

```bash
npm run leaderboard -- --print-config --worker-threads 1
```
