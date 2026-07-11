import i18next, { type TFunction } from 'i18next'
import {
  type AbilityColorKey,
  DAMAGE_TAG_ENTRIES,
} from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { CardHeader } from 'lib/characterPreview/buffsAnalysis/BuffGroup'
import {
  getSelectedActions,
  renderPill,
} from 'lib/characterPreview/buffsAnalysis/buffUtils'
import {
  DesignContext,
  ellipsisStyle,
  FilterChangeContext,
  FilterContext,
  getRowBaseStyle,
  getSourceLabelStyle,
  TEXT_DIM,
} from 'lib/characterPreview/buffsAnalysis/designContext'
import {
  ElementTag,
  OutputTag,
} from 'lib/optimization/engine/config/tag'
import { DamageFunctionType } from 'lib/optimization/engine/damage/damageCalculator'
import {
  AbilityKind,
  AbilityMeta,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  Fragment,
  useContext,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { Hit } from 'types/hitConditionalTypes'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

function pct(v: number): string {
  return `${Math.round(v * 100)}%`
}

function num(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, '')
}

type ElementI18nKey = 'Physical' | 'Fire' | 'Ice' | 'Thunder' | 'Wind' | 'Quantum' | 'Imaginary'

const ELEMENT_I18N_KEYS: Partial<Record<ElementTag, ElementI18nKey>> = {
  [ElementTag.Physical]: 'Physical',
  [ElementTag.Fire]: 'Fire',
  [ElementTag.Ice]: 'Ice',
  [ElementTag.Lightning]: 'Thunder',
  [ElementTag.Wind]: 'Wind',
  [ElementTag.Quantum]: 'Quantum',
  [ElementTag.Imaginary]: 'Imaginary',
}

type DamageFunctionI18nKey = 'Crit' | 'DoT' | 'Break' | 'S.Break' | 'Add' | 'Elation'

const FUNCTION_LABELS: Partial<Record<DamageFunctionType, DamageFunctionI18nKey>> = {
  [DamageFunctionType.Crit]: 'Crit',
  [DamageFunctionType.Dot]: 'DoT',
  [DamageFunctionType.Break]: 'Break',
  [DamageFunctionType.SuperBreak]: 'S.Break',
  [DamageFunctionType.Additional]: 'Add',
  [DamageFunctionType.Elation]: 'Elation',
}

type HitPropRow = { value: string, label: string }

function buildRows(hit: Hit, t: TFunction<'optimizerTab', 'ExpandedDataPanel'>, abilityKind: AbilityKind): HitPropRow[] {
  const rows: HitPropRow[] = []
  const add = (v: number | undefined, value: (n: number) => string, label: string) => {
    if (!v) return
    rows.push({ value: value(v), label })
  }

  add(hit.atkScaling, pct, t('BuffsAnalysisDisplay.HitDefinition.AtkScaling'))
  add(hit.hpScaling, pct, t('BuffsAnalysisDisplay.HitDefinition.HpScaling'))
  add(hit.defScaling, pct, t('BuffsAnalysisDisplay.HitDefinition.DefScaling'))

  const addElementRow = () => {
    const i18nKey = ELEMENT_I18N_KEYS[hit.damageElement]
    if (i18nKey) rows.push({ value: i18next.t(`gameData:Elements.${i18nKey}`), label: i18next.t('Element') })
  }

  switch (hit.damageFunctionType) {
    case DamageFunctionType.Crit:
      add(hit.beScaling, pct, t('BuffsAnalysisDisplay.HitDefinition.Crit.BeScaling'))
      add(hit.beCap, num, t('BuffsAnalysisDisplay.HitDefinition.Crit.BeCap'))
      add(hit.elationAtkScaling, pct, t('BuffsAnalysisDisplay.HitDefinition.Crit.ElationAtkScaling'))
      break
    case DamageFunctionType.Dot:
      add(hit.dotBaseChance, pct, t('BuffsAnalysisDisplay.HitDefinition.Dot.Chance'))
      add(hit.dotSplit, num, t('BuffsAnalysisDisplay.HitDefinition.Dot.Split'))
      add(hit.dotStacks, String, t('BuffsAnalysisDisplay.HitDefinition.Dot.Stacks'))
      break
    case DamageFunctionType.Break:
      addElementRow()
      add(hit.specialScaling, pct, t('BuffsAnalysisDisplay.HitDefinition.Break.SpecialScaling'))
      break
    case DamageFunctionType.SuperBreak:
      addElementRow()
      add(hit.extraSuperBreakModifier, pct, t('BuffsAnalysisDisplay.HitDefinition.SuperBreak.ExtraModifier'))
      break
    case DamageFunctionType.Additional:
      add(hit.crOverride, pct, t('BuffsAnalysisDisplay.HitDefinition.Additional.CrOverride'))
      add(hit.cdOverride, pct, t('BuffsAnalysisDisplay.HitDefinition.Additional.CdOverride'))
      break
    case DamageFunctionType.Elation:
      add(hit.elationScaling, pct, t('BuffsAnalysisDisplay.HitDefinition.Elation.Scaling'))
      if (abilityKind === AbilityKind.ELATION_SKILL) {
        add(hit.punchlineStacks, String, t('BuffsAnalysisDisplay.HitDefinition.Elation.Punchline'))
      } else {
        add(hit.punchlineStacks, String, t('BuffsAnalysisDisplay.HitDefinition.Elation.Banger'))
      }
      break
  }

  add(hit.trueDmgModifier, pct, t('BuffsAnalysisDisplay.HitDefinition.TrueDmg'))
  add(hit.toughnessDmg, num, t('BuffsAnalysisDisplay.HitDefinition.Toughness'))
  add(hit.fixedToughnessDmg, num, t('BuffsAnalysisDisplay.HitDefinition.FixedToughness'))

  return rows
}

function HitSubHeader({ label }: { label: string }) {
  const options = useContext(DesignContext)
  const rowBase = getRowBaseStyle(options)
  return (
    <span
      style={{
        ...rowBase,
        fontSize: options.fontSize - 1,
        color: TEXT_DIM,
        letterSpacing: 0.5,
        borderBottom: `1px solid ${options.borderColor}`,
      }}
    >
      {label}
    </span>
  )
}

function HitRow({ hit, isLastHit, abilityKind }: { hit: Hit, isLastHit: boolean, abilityKind: AbilityKind }) {
  const options = useContext(DesignContext)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel' })
  const onFilterChange = useContext(FilterChangeContext)
  const selectedFilter = useContext(FilterContext)
  const rowBase = getRowBaseStyle(options)
  const sourceLabelStyle = getSourceLabelStyle(options)

  const rows = buildRows(hit, t, abilityKind)
  const fnLabel = FUNCTION_LABELS[hit.damageFunctionType]
    ? t(`BuffsAnalysisDisplay.DamageFunctions.${FUNCTION_LABELS[hit.damageFunctionType]!}`)
    : undefined

  const tagPills = hit.outputTag === OutputTag.DAMAGE
    ? DAMAGE_TAG_ENTRIES
      .filter((e) => (hit.damageType & e.tag) !== 0)
      .map((e) => {
        const active = selectedFilter != null && (e.tag & selectedFilter) !== 0
        return renderPill(String(e.tag), e.color, t(`DamageTags.${e.key}`), { onClick: () => onFilterChange?.(e.tag), active })
      })
    : []

  return (
    <>
      {rows.map((row, i) => {
        const isLastRow = isLastHit && i === rows.length - 1
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              ...rowBase,
              borderBottom: isLastRow ? undefined : `1px solid ${options.borderColor}`,
            }}
          >
            <span style={{ minWidth: 60, fontSize: options.fontSize, textWrap: 'nowrap', flexShrink: 0 }}>
              {row.value}
            </span>

            <span style={{ minWidth: 150, flexShrink: 0, ...ellipsisStyle(options.fontSize) }}>
              {row.label}
            </span>

            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
              {tagPills}
            </div>

            {fnLabel && (
              <span style={sourceLabelStyle}>
                {fnLabel}
              </span>
            )}
          </div>
        )
      })}
    </>
  )
}

function ActionHitGroup({ action, isLastAction, t }: {
  action: OptimizerAction,
  isLastAction: boolean,
  t: TFunction<'optimizerTab'>,
}) {
  const hits = action.hits ?? []
  if (hits.length === 0) return null

  const label = t(`ComboFilter.ComboOptions.${AbilityMeta[action.actionType].label}`)

  return (
    <>
      <CardHeader label={label} />
      {hits.map((hit, i) => {
        const fnLabel = FUNCTION_LABELS[hit.damageFunctionType]
          ? t(`ExpandedDataPanel.BuffsAnalysisDisplay.DamageFunctions.${FUNCTION_LABELS[hit.damageFunctionType]!}`)
          : undefined
        const subHeader = hits.length > 1 && fnLabel
          ? `${i + 1}. ${fnLabel}`
          : undefined
        return (
          <Fragment key={i}>
            {subHeader && <HitSubHeader label={subHeader} />}
            <HitRow
              hit={hit}
              isLastHit={isLastAction && i === hits.length - 1}
              abilityKind={action.actionType}
            />
          </Fragment>
        )
      })}
    </>
  )
}

export function HitDefinitionRows({ context, selectedAction }: {
  context: OptimizerContext,
  selectedAction: number | null,
}) {
  const { t } = useTranslation('optimizerTab')
  const actions = getSelectedActions(context, selectedAction)
  if (!actions.length) return null

  return (
    <>
      {actions.map((action, actionIndex) => (
        <ActionHitGroup
          key={actionIndex}
          action={action}
          isLastAction={actionIndex === actions.length - 1}
          t={t}
        />
      ))}
    </>
  )
}
