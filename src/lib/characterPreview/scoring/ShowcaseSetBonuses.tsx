import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import classes from 'lib/characterPreview/scoring/ShowcaseSetBonuses.module.css'
import { StatTextSm } from 'lib/characterPreview/StatText'
import type { Sets } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import {
  type RelicSetIngameId,
  type SetsOrnaments,
  SetsOrnamentsNames,
  setToId,
} from 'lib/sets/setConfigRegistry'
import {
  Fragment,
  memo,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'

// Types

type DisplayEntry =
  | { active: true, set: Sets, count: number, ingameId: RelicSetIngameId }
  | { active: false, count: number }

// Set detection + padding

const ORNAMENT_SETS = new Set<SetsOrnaments>(SetsOrnamentsNames)

function getDisplaySets(relics: PreviewRelics): DisplayEntry[] {
  const setCounts = new Map<Sets, number>()
  for (const relic of Object.values(relics)) {
    if (!relic) continue
    setCounts.set(relic.set, (setCounts.get(relic.set) ?? 0) + 1)
  }

  const relicEntries: DisplayEntry[] = []
  const ornamentEntries: DisplayEntry[] = []

  for (const [set, count] of setCounts) {
    const ingameId = setToId[set]
    if (!ingameId) continue
    const target = ORNAMENT_SETS.has(set as SetsOrnaments) ? ornamentEntries : relicEntries
    if (count >= 4) {
      target.push({ active: true, set, count: 4, ingameId })
    } else if (count >= 2) {
      target.push({ active: true, set, count: 2, ingameId })
    }
  }

  if (relicEntries.length === 0) {
    relicEntries.push({ active: false, count: 4 })
  }
  const relicTarget = relicEntries.some((e) => e.count === 4) ? 1 : 2
  while (relicEntries.length < relicTarget) {
    relicEntries.push({ active: false, count: 2 })
  }

  if (ornamentEntries.length === 0) {
    ornamentEntries.push({ active: false, count: 2 })
  }

  relicEntries.sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1
    if (a.active && b.active) return b.count - a.count || Number(a.ingameId) - Number(b.ingameId)
    return 0
  })

  return [...relicEntries, ...ornamentEntries]
}

// Sub-components

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
        <StatTextSm className={classes.cardName}>Incomplete set</StatTextSm>
      </div>
    </div>
  )
}

function ActiveSetEntry({ entry }: { entry: DisplayEntry & { active: true } }) {
  const name = useSetName(entry.ingameId)
  return (
    <div className={classes.cardPlain}>
      <img src={Assets.getSetImage(entry.set, undefined, true)} className={classes.setIconMd} />
      <div className={classes.cardText}>
        <span className={classes.cardPiece}>{entry.count}pc</span>
        <StatTextSm className={classes.cardName}>{name}</StatTextSm>
      </div>
    </div>
  )
}

// Main Component

export const ShowcaseSetBonuses = memo(function ShowcaseSetBonuses({
  displayRelics,
}: {
  displayRelics: PreviewRelics,
}) {
  const displaySets = useMemo(() => getDisplaySets(displayRelics), [displayRelics])

  return (
    <div className={classes.container}>
      <div className={classes.separatorCol}>
        {displaySets.map((entry, i) => (
          <Fragment key={i}>
            {i > 0 && <div className={classes.sepMidLine} />}
            {entry.active
              ? <ActiveSetEntry entry={entry} />
              : <EmptySetEntry count={entry.count} />}
          </Fragment>
        ))}
      </div>
    </div>
  )
})
