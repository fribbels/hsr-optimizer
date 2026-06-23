import classes from 'lib/characterPreview/scoring/RollStripeBar.module.css'
import {
  ROLL_WIDTH_RATIOS,
  type TierColors,
} from 'lib/characterPreview/scoring/substatRollColors'
import type { AggregatedStatRolls } from 'lib/characterPreview/scoring/substatRollsAggregator'

const MIN_CAP = 18
const MAX_CAP = 36

function computeCap(maxRolls: number): number {
  return Math.min(Math.max(MIN_CAP, maxRolls), MAX_CAP)
}

const SEGMENT_TIERS: { key: 'high' | 'mid' | 'low', ratio: number }[] = [
  { key: 'high', ratio: ROLL_WIDTH_RATIOS.high },
  { key: 'mid', ratio: ROLL_WIDTH_RATIOS.mid },
  { key: 'low', ratio: ROLL_WIDTH_RATIOS.low },
]

export function RollStripeBar({ entry, colors, maxRolls }: {
  entry: AggregatedStatRolls
  colors: TierColors
  maxRolls: number
}) {
  const cap = computeCap(maxRolls)
  const gaps = cap - 1

  return (
    <div className={classes.track}>
      {SEGMENT_TIERS.flatMap(({ key, ratio }, groupIdx) =>
        Array.from({ length: entry[key] }, (_, i) => (
          <div
            key={`${groupIdx}-${i}`}
            className={classes.segment}
            style={{
              flexBasis: `calc((100% - ${gaps}px) * ${ratio} / ${cap})`,
              backgroundColor: colors[key],
            }}
          />
        )),
      )}
    </div>
  )
}
