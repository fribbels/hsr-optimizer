import { Flex } from 'antd'
import i18next from 'i18next'
import { DAMAGE_TAG_ENTRIES } from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { CardHeader } from 'lib/characterPreview/buffsAnalysis/BuffGroup'
import {
  getSelectedActions,
  renderPill,
} from 'lib/characterPreview/buffsAnalysis/buffUtils'
import {
  DesignContext,
  ellipsisStyle,
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
import { Hit } from 'types/hitConditionalTypes'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

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

const FUNCTION_LABELS: Partial<Record<DamageFunctionType, string>> = {
  [DamageFunctionType.Crit]: 'Crit',
  [DamageFunctionType.Dot]: 'DoT',
  [DamageFunctionType.Break]: 'Break',
  [DamageFunctionType.SuperBreak]: 'S.Break',
  [DamageFunctionType.Additional]: 'Add',
  [DamageFunctionType.Elation]: 'Elation',
}

type HitPropRow = { value: string, label: string }

function buildRows(hit: Hit): HitPropRow[] {
  const rows: HitPropRow[] = []
  const add = (v: number | undefined, value: (n: number) => string, label: string) => {
    if (!v) return
    rows.push({ value: value(v), label })
  }

  add(hit.atkScaling, pct, 'ATK Scaling')
  add(hit.hpScaling, pct, 'HP Scaling')
  add(hit.defScaling, pct, 'DEF Scaling')

  const addElementRow = () => {
    const i18nKey = ELEMENT_I18N_KEYS[hit.damageElement]
    if (i18nKey) rows.push({ value: i18next.t(`gameData:Elements.${i18nKey}`), label: 'Element' })
  }

  switch (hit.damageFunctionType) {
    case DamageFunctionType.Crit:
      add(hit.beScaling, pct, 'BE Scaling')
      add(hit.beCap, num, 'BE Cap')
      add(hit.elationAtkScaling, pct, 'Elation ATK Scaling')
      break
    case DamageFunctionType.Dot:
      add(hit.dotBaseChance, pct, 'DoT Chance')
      add(hit.dotSplit, num, 'DoT Split')
      add(hit.dotStacks, String, 'DoT Stacks')
      break
    case DamageFunctionType.Break:
      addElementRow()
      add(hit.specialScaling, pct, 'Special Scaling')
      break
    case DamageFunctionType.SuperBreak:
      addElementRow()
      add(hit.extraSuperBreakModifier, pct, 'Extra Modifier')
      break
    case DamageFunctionType.Additional:
      add(hit.crOverride, pct, 'CR Override')
      add(hit.cdOverride, pct, 'CD Override')
      break
    case DamageFunctionType.Elation:
      add(hit.elationScaling, pct, 'Elation Scaling')
      add(hit.punchlineStacks, String, 'Punchline Stacks')
      break
  }

  add(hit.trueDmgModifier, pct, 'True DMG modifier')
  add(hit.toughnessDmg, num, 'Toughness DMG')
  add(hit.fixedToughnessDmg, num, 'Fixed Toughness')

  return rows
}

function HitSubHeader(props: { label: string }) {
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
      {props.label}
    </span>
  )
}

function HitRow(props: { hit: Hit, isLastHit: boolean }) {
  const { hit, isLastHit } = props
  const options = useContext(DesignContext)
  const rowBase = getRowBaseStyle(options)
  const sourceLabelStyle = getSourceLabelStyle(options)

  const rows = buildRows(hit)
  const fnLabel = FUNCTION_LABELS[hit.damageFunctionType]

  const tagPills = hit.outputTag === OutputTag.DAMAGE
    ? DAMAGE_TAG_ENTRIES
      .filter((e) => (hit.damageType & e.tag) !== 0)
      .map((e) => renderPill(String(e.tag), e.color, e.label))
    : []

  return (
    <>
      {rows.map((row, i) => {
        const isLastRow = isLastHit && i === rows.length - 1
        return (
          <Flex
            key={i}
            align='center'
            gap={6}
            style={{
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

            <Flex gap={2} style={{ flexShrink: 0 }}>
              {tagPills}
            </Flex>

            {fnLabel && (
              <span style={sourceLabelStyle}>
                {fnLabel}
              </span>
            )}
          </Flex>
        )
      })}
    </>
  )
}

function ActionHitGroup(props: {
  action: OptimizerAction
  isLastAction: boolean
}) {
  const { action, isLastAction } = props
  const hits = action.hits ?? []
  if (hits.length === 0) return null

  const label = AbilityMeta[action.actionType as AbilityKind]?.label ?? action.actionType

  return (
    <>
      <CardHeader label={label} />
      {hits.map((hit, i) => {
        const fnLabel = FUNCTION_LABELS[hit.damageFunctionType]
        const subHeader = hits.length > 1 && fnLabel
          ? `${i + 1}. ${fnLabel}`
          : undefined
        return (
          <Fragment key={i}>
            {subHeader && <HitSubHeader label={subHeader} />}
            <HitRow
              hit={hit}
              isLastHit={isLastAction && i === hits.length - 1}
            />
          </Fragment>
        )
      })}
    </>
  )
}

export function HitDefinitionRows(props: {
  context: OptimizerContext
  selectedAction: number | null
}) {
  const { context, selectedAction } = props
  const options = useContext(DesignContext)

  const actions = getSelectedActions(context, selectedAction)
  if (!actions.length) return null

  return (
    <>
      {actions.map((action, actionIndex) => (
        <ActionHitGroup
          key={actionIndex}
          action={action}
          isLastAction={actionIndex === actions.length - 1}
        />
      ))}
    </>
  )
}
