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
| `--fresh-run`                        | off                                                        | Clears the build-score cache and bypasses private-output reuse         |
| `--print-config`                     | off                                                        | Prints resolved CLI config and exits before metadata/export/cache work |
| `--help`                             | off                                                        | Prints usage and exits                                                 |

`--fresh-run` and `--prune-build-score-cache` cannot be used together.

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

Use `--fresh-run` when you want a fully fresh rebuild. It clears the selected SQLite build-score cache and ignores previous private output for incremental skip decisions.

## Outputs

- Private output: top `--top-n` entries per board with full metadata, dependency versions, and payload index. Used for incremental runs and auditing.
- Public output: compressed top `--top-n-public` entries per board. UIDs and UID hashes are stripped.

Boards are keyed by character, config type, and team. Eidolon is a frontend filter.

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
