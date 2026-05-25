import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { Assets } from 'lib/rendering/assets'
import { type RelicSetIngameId, setToId } from 'lib/sets/setConfigRegistry'
import { Fragment, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sets } from 'lib/constants/constants'
import classes from './ShowcaseSetBonuses.module.css'
import { useShowcaseDebugVizStore } from './showcaseDebugVizStore'

// ─── Set detection ──────────────────────────────────────────

type ActiveSet = {
  set: Sets
  count: 2 | 4
  ingameId: RelicSetIngameId
}

function getActiveSets(relics: PreviewRelics): ActiveSet[] {
  const setCounts = new Map<Sets, number>()

  for (const relic of Object.values(relics)) {
    if (!relic) continue
    setCounts.set(relic.set, (setCounts.get(relic.set) ?? 0) + 1)
  }

  const results: ActiveSet[] = []
  for (const [set, count] of setCounts) {
    const ingameId = setToId[set]
    if (!ingameId) continue
    if (count >= 4) {
      results.push({ set, count: 2, ingameId })
      results.push({ set, count: 2, ingameId })
    } else if (count >= 2) {
      results.push({ set, count: 2, ingameId })
    }
  }

  return results
}

function useSetName(ingameId: RelicSetIngameId): string {
  const { t } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  return t(`${ingameId}.Name`)
}

// ─── Shared sub-components ──────────────────────────────────

function SetEntry({ s, cardClass }: { s: ActiveSet; cardClass: string }) {
  const name = useSetName(s.ingameId)
  return (
    <div className={cardClass}>
      <img src={Assets.getSetImage(s.set)} className={classes.setIconMd} />
      <div className={classes.cardText}>
        <span className={classes.cardPiece}>{s.count}pc</span>
        <StatTextSm className={classes.cardName}>{name}</StatTextSm>
      </div>
    </div>
  )
}

function Col({ sets, cardClass, colClass, sepClass }: { sets: ActiveSet[]; cardClass: string; colClass?: string; sepClass?: string }) {
  return (
    <div className={colClass ?? classes.cardsCol}>
      {sets.map((s, i) => (
        <Fragment key={i}>
          {i > 0 && sepClass && <div className={sepClass} />}
          <SetEntry s={s} cardClass={cardClass} />
        </Fragment>
      ))}
    </div>
  )
}

function SplitEntry({ s }: { s: ActiveSet }) {
  const name = useSetName(s.ingameId)
  return (
    <div className={classes.cardSplit}>
      <div className={classes.splitIconPanel}>
        <img src={Assets.getSetImage(s.set)} className={classes.setIconMd} />
      </div>
      <div className={classes.splitTextPanel}>
        <span className={classes.cardPiece}>{s.count}pc</span>
        <StatTextSm className={classes.cardName}>{name}</StatTextSm>
      </div>
    </div>
  )
}

function TightEntry({ s }: { s: ActiveSet }) {
  const name = useSetName(s.ingameId)
  return (
    <div className={classes.cardTight}>
      <img src={Assets.getSetImage(s.set)} className={classes.setIconSm} />
      <div className={classes.cardText}>
        <span className={classes.cardPiece}>{s.count}pc</span>
        <StatTextSm className={classes.cardNameSm}>{name}</StatTextSm>
      </div>
    </div>
  )
}

// ─── Viz Components ─────────────────────────────────────────

const BasicViz = ({ sets }: { sets: ActiveSet[] }) => <Col sets={sets} cardClass={classes.card} />
const CoolViz = ({ sets }: { sets: ActiveSet[] }) => <Col sets={sets} cardClass={classes.cardCool} />
const DenseViz = ({ sets }: { sets: ActiveSet[] }) => <Col sets={sets} cardClass={classes.cardDense} />
const PlainViz = ({ sets }: { sets: ActiveSet[] }) => <Col sets={sets} cardClass={classes.cardPlain} />
const SepViz = ({ sets }: { sets: ActiveSet[] }) => <Col sets={sets} cardClass={classes.cardPlain} colClass={classes.separatorCol} sepClass={classes.sepLine} />
const SepFadeViz = ({ sets }: { sets: ActiveSet[] }) => <Col sets={sets} cardClass={classes.cardPlain} colClass={classes.separatorCol} sepClass={classes.sepFadeLine} />
const SepComboViz = ({ sets }: { sets: ActiveSet[] }) => <Col sets={sets} cardClass={classes.cardPlain} colClass={classes.separatorCol} sepClass={classes.sepComboLine} />

function SplitViz({ sets }: { sets: ActiveSet[] }) {
  return (
    <div className={classes.cardsCol}>
      {sets.map((s, i) => <SplitEntry key={i} s={s} />)}
    </div>
  )
}

function TightViz({ sets }: { sets: ActiveSet[] }) {
  return (
    <div className={classes.cardsColTight}>
      {sets.map((s, i) => <TightEntry key={i} s={s} />)}
    </div>
  )
}

// ─── Mode definitions ────────────────────────────────────────

const VIZ_CONFIG: Record<string, { component: React.ComponentType<{ sets: ActiveSet[] }> }> = {
  b1: { component: SplitViz },
  b3: { component: CoolViz },
  b2: { component: BasicViz },
  b4: { component: DenseViz },
  b5: { component: TightViz },
  b6: { component: PlainViz },
  b7: { component: SepViz },
  b12: { component: SepFadeViz },
  b13: { component: SepComboViz },
}

// ─── Main Component ─────────────────────────────────────────

export const ShowcaseSetBonuses = memo(function ShowcaseSetBonuses({
  displayRelics,
}: {
  displayRelics: PreviewRelics
}) {
  const vizMode = useShowcaseDebugVizStore((s) => s.setBonusMode)
  const activeSets = useMemo(() => getActiveSets(displayRelics), [displayRelics])

  if (vizMode === 'b0') return null
  if (activeSets.length === 0) return null

  const { component: VizComponent } = VIZ_CONFIG[vizMode] ?? VIZ_CONFIG.b1

  return (
    <div className={classes.container}>
      <VizComponent sets={activeSets} />
    </div>
  )
})
