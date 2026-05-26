import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { Assets } from 'lib/rendering/assets'
import { type RelicSetIngameId, setToId } from 'lib/sets/setConfigRegistry'
import { Fragment, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sets } from 'lib/constants/constants'
import classes from './ShowcaseSetBonuses.module.css'
import { useShowcaseDebugVizStore } from './showcaseDebugVizStore'

// ─── Types ─────────────────────────────────────────────────

type DisplayEntry =
  | { type: 'active'; set: Sets; count: number; ingameId: RelicSetIngameId }
  | { type: 'empty'; count: number }

// ─── Set detection + padding ───────────────────────────────

function getDisplaySets(relics: PreviewRelics, show4pc: boolean): DisplayEntry[] {
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
      if (show4pc) {
        active.push({ type: 'active', set, count: 4, ingameId })
      } else {
        active.push({ type: 'active', set, count: 2, ingameId })
        active.push({ type: 'active', set, count: 2, ingameId })
      }
    } else if (count >= 2) {
      active.push({ type: 'active', set, count: 2, ingameId })
    }
  }

  const result: DisplayEntry[] = [...active]

  if (show4pc && active.length === 0) {
    result.push({ type: 'empty', count: 4 })
  }

  const target = result.some((e) => e.count === 4) ? 2 : 3
  while (result.length < target) {
    result.push({ type: 'empty', count: 2 })
  }

  return result
}

// ─── Shared sub-components ──────────────────────────────────

const DEFAULT_SET_ICON = Assets.getDefaultRelic()

function useSetName(ingameId: RelicSetIngameId): string {
  const { t } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  return t(`${ingameId}.Name`)
}

function EmptySetEntry({ cardClass, count }: { cardClass: string; count: number }) {
  return (
    <div className={cardClass}>
      <img src={DEFAULT_SET_ICON} className={classes.setIconMd} />
      <div className={classes.cardText}>
        <span className={classes.cardPiece}>{count}pc</span>
        <StatTextSm className={classes.cardName}>Incomplete set</StatTextSm>
      </div>
    </div>
  )
}

function ActiveSetEntry({ entry, cardClass }: { entry: DisplayEntry & { type: 'active' }; cardClass: string }) {
  const name = useSetName(entry.ingameId)
  return (
    <div className={cardClass}>
      <img src={Assets.getSetImage(entry.set)} className={classes.setIconMd} />
      <div className={classes.cardText}>
        <span className={classes.cardPiece}>{entry.count}pc</span>
        <StatTextSm className={classes.cardName}>{name}</StatTextSm>
      </div>
    </div>
  )
}

function EntryRenderer({ entry, cardClass }: { entry: DisplayEntry; cardClass: string }) {
  return entry.type === 'active'
    ? <ActiveSetEntry entry={entry} cardClass={cardClass} />
    : <EmptySetEntry cardClass={cardClass} count={entry.count} />
}

function Col({ sets, cardClass, colClass, sepClass }: { sets: DisplayEntry[]; cardClass: string; colClass?: string; sepClass?: string }) {
  return (
    <div className={colClass ?? classes.cardsCol}>
      {sets.map((entry, i) => (
        <Fragment key={i}>
          {i > 0 && sepClass && <div className={sepClass} />}
          <EntryRenderer entry={entry} cardClass={cardClass} />
        </Fragment>
      ))}
    </div>
  )
}

function SplitEntry({ entry }: { entry: DisplayEntry & { type: 'active' } }) {
  const name = useSetName(entry.ingameId)
  return (
    <div className={classes.cardSplit}>
      <div className={classes.splitIconPanel}>
        <img src={Assets.getSetImage(entry.set)} className={classes.setIconMd} />
      </div>
      <div className={classes.splitTextPanel}>
        <span className={classes.cardPiece}>{entry.count}pc</span>
        <StatTextSm className={classes.cardName}>{name}</StatTextSm>
      </div>
    </div>
  )
}

function TightEntry({ entry }: { entry: DisplayEntry & { type: 'active' } }) {
  const name = useSetName(entry.ingameId)
  return (
    <div className={classes.cardTight}>
      <img src={Assets.getSetImage(entry.set)} className={classes.setIconSm} />
      <div className={classes.cardText}>
        <span className={classes.cardPiece}>{entry.count}pc</span>
        <StatTextSm className={classes.cardNameSm}>{name}</StatTextSm>
      </div>
    </div>
  )
}

// ─── Viz Components ─────────────────────────────────────────

const BasicViz = ({ sets }: { sets: DisplayEntry[] }) => <Col sets={sets} cardClass={classes.card} />
const CoolViz = ({ sets }: { sets: DisplayEntry[] }) => <Col sets={sets} cardClass={classes.cardCool} />
const DenseViz = ({ sets }: { sets: DisplayEntry[] }) => <Col sets={sets} cardClass={classes.cardDense} />
const PlainViz = ({ sets }: { sets: DisplayEntry[] }) => <Col sets={sets} cardClass={classes.cardPlain} />
const SepViz = ({ sets }: { sets: DisplayEntry[] }) => <Col sets={sets} cardClass={classes.cardPlain} colClass={classes.separatorCol} sepClass={classes.sepLine} />
const SepFadeViz = ({ sets }: { sets: DisplayEntry[] }) => <Col sets={sets} cardClass={classes.cardPlain} colClass={classes.separatorCol} sepClass={classes.sepFadeLine} />
const SepMidViz = ({ sets }: { sets: DisplayEntry[] }) => <Col sets={sets} cardClass={classes.cardPlain} colClass={classes.separatorCol} sepClass={classes.sepMidLine} />
const SepComboViz = ({ sets }: { sets: DisplayEntry[] }) => <Col sets={sets} cardClass={classes.cardPlain} colClass={classes.separatorCol} sepClass={classes.sepComboLine} />

function SplitViz({ sets }: { sets: DisplayEntry[] }) {
  return (
    <div className={classes.cardsCol}>
      {sets.map((entry, i) => entry.type === 'active'
        ? <SplitEntry key={i} entry={entry} />
        : <EmptySetEntry key={i} cardClass={classes.cardPlain} count={entry.count} />)}
    </div>
  )
}

function TightViz({ sets }: { sets: DisplayEntry[] }) {
  return (
    <div className={classes.cardsColTight}>
      {sets.map((entry, i) => entry.type === 'active'
        ? <TightEntry key={i} entry={entry} />
        : <EmptySetEntry key={i} cardClass={classes.cardPlain} count={entry.count} />)}
    </div>
  )
}

// ─── Mode definitions ────────────────────────────────────────

const VIZ_CONFIG: Record<string, { component: React.ComponentType<{ sets: DisplayEntry[] }> }> = {
  b1: { component: SplitViz },
  b3: { component: CoolViz },
  b2: { component: BasicViz },
  b4: { component: DenseViz },
  b5: { component: TightViz },
  b6: { component: PlainViz },
  b7: { component: SepViz },
  b12: { component: SepFadeViz },
  b14: { component: SepMidViz },
  b13: { component: SepComboViz },
}

// ─── Main Component ─────────────────────────────────────────

export const ShowcaseSetBonuses = memo(function ShowcaseSetBonuses({
  displayRelics,
}: {
  displayRelics: PreviewRelics
}) {
  const vizMode = useShowcaseDebugVizStore((s) => s.setBonusMode)
  const show4pc = useShowcaseDebugVizStore((s) => s.show4pc)
  const displaySets = useMemo(() => getDisplaySets(displayRelics, show4pc), [displayRelics, show4pc])

  if (vizMode === 'b0') return null

  const { component: VizComponent } = VIZ_CONFIG[vizMode] ?? VIZ_CONFIG.b1

  return (
    <div className={classes.container}>
      <VizComponent sets={displaySets} />
    </div>
  )
})
