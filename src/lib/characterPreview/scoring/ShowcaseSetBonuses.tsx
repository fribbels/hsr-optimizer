import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { Assets } from 'lib/rendering/assets'
import { type RelicSetIngameId, setToId } from 'lib/sets/setConfigRegistry'
import { Fragment, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sets } from 'lib/constants/constants'
import classes from './ShowcaseSetBonuses.module.css'

const SHOW_4PC = true

// ─── Types ─────────────────────────────────────────────────

type DisplayEntry =
  | { type: 'active'; set: Sets; count: number; ingameId: RelicSetIngameId }
  | { type: 'empty'; count: number }

// ─── Set detection + padding ───────────────────────────────

function getDisplaySets(relics: PreviewRelics): DisplayEntry[] {
  const setCounts = new Map<Sets, number>()
  for (const relic of Object.values(relics)) {
    if (!relic) continue
    setCounts.set(relic.set, (setCounts.get(relic.set) ?? 0) + 1)
  }

  const active: DisplayEntry[] = []
  for (const [set, count] of setCounts) {
    const ingameId = setToId[set]
    if (!ingameId) continue
    if (count >= 4) {
      if (SHOW_4PC) {
        active.push({ type: 'active', set, count: 4, ingameId })
      } else {
        active.push({ type: 'active', set, count: 2, ingameId })
        active.push({ type: 'active', set, count: 2, ingameId })
      }
    } else if (count >= 2) {
      active.push({ type: 'active', set, count: 2, ingameId })
    }
  }

  const has4pc = active.some((s) => s.count === 4)
  const target = (SHOW_4PC && has4pc) ? 2 : 3
  const result: DisplayEntry[] = [...active]

  if (SHOW_4PC && active.length === 0) {
    result.push({ type: 'empty', count: 4 })
  }
  while (result.length < target) {
    result.push({ type: 'empty', count: 2 })
  }

  return result
}

// ─── Sub-components ─────────────────────────────────────────

const DEFAULT_SET_ICON = Assets.getDefaultRelic()

function useSetName(ingameId: RelicSetIngameId): string {
  const { t } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  return t(`${ingameId}.Name`)
}

function EmptySetEntry({ count }: { count: number }) {
  return (
    <div className={classes.cardPlain}>
      <img src={DEFAULT_SET_ICON} className={classes.setIconMd} />
      <div className={classes.cardText}>
        <span className={classes.cardPiece}>{count}pc</span>
        <StatTextSm className={classes.cardName}>Inactive</StatTextSm>
      </div>
    </div>
  )
}

function ActiveSetEntry({ entry }: { entry: DisplayEntry & { type: 'active' } }) {
  const name = useSetName(entry.ingameId)
  return (
    <div className={classes.cardPlain}>
      <img src={Assets.getSetImage(entry.set)} className={classes.setIconMd} />
      <div className={classes.cardText}>
        <span className={classes.cardPiece}>{entry.count}pc</span>
        <StatTextSm className={classes.cardName}>{name}</StatTextSm>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────

export const ShowcaseSetBonuses = memo(function ShowcaseSetBonuses({
  displayRelics,
}: {
  displayRelics: PreviewRelics
}) {
  const displaySets = useMemo(() => getDisplaySets(displayRelics), [displayRelics])

  return (
    <div className={classes.container}>
      <div className={classes.separatorCol}>
        {displaySets.map((entry, i) => (
          <Fragment key={i}>
            {i > 0 && <div className={classes.sepMidLine} />}
            {entry.type === 'active'
              ? <ActiveSetEntry entry={entry} />
              : <EmptySetEntry count={entry.count} />}
          </Fragment>
        ))}
      </div>
    </div>
  )
})
