import { Flex, Table } from 'antd'
import i18next from 'i18next'
import { Sets, setToId } from 'lib/constants/constants'
import { BUFF_ABILITY, BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/computedStatsArray'
import { ComputedStatsObject, StatsConfig } from 'lib/optimization/config/computedStatsConfig'
import { Assets } from 'lib/rendering/assets'
import { originalScoringParams, SimulationScore } from 'lib/scoring/simScoringUtils'
import { aggregateCombatBuffs } from 'lib/simulations/combatBuffsAnalysis'
import { runSimulations } from 'lib/simulations/statSimulationController'
import { cardShadow } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

type BuffsAnalysisProps = {
  result?: SimulationScore
  buffGroups?: Record<BUFF_TYPE, Record<string, Buff[]>>
  singleColumn?: boolean
  size?: BuffDisplaySize
}

export function BuffsAnalysisDisplay(props: BuffsAnalysisProps) {
  const buffGroups = props.buffGroups ?? rerunSim(props.result)

  if (!buffGroups) {
    return <></>
  }

  const buffsDisplayLeft: ReactElement[] = []
  const buffsDisplayRight: ReactElement[] = []
  let groupKey = 0

  const size = props.size ?? BuffDisplaySize.SMALL

  for (const [id, buffs] of Object.entries(buffGroups.PRIMARY)) {
    buffsDisplayLeft.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.PRIMARY} key={groupKey++} size={size}/>)
  }

  for (const [id, buffs] of Object.entries(buffGroups.SETS)) {
    buffsDisplayLeft.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.SETS} key={groupKey++} size={size}/>)
  }

  for (const [id, buffs] of Object.entries(buffGroups.CHARACTER)) {
    buffsDisplayRight.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.CHARACTER} key={groupKey++} size={size}/>)
  }

  for (const [id, buffs] of Object.entries(buffGroups.LIGHTCONE)) {
    buffsDisplayRight.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.LIGHTCONE} key={groupKey++} size={size}/>)
  }

  if (props.singleColumn) {
    return (
      <Flex gap={20} vertical>
        {buffsDisplayLeft}
        {buffsDisplayRight}
      </Flex>
    )
  }

  return (
    <Flex justify='space-between' style={{ width: '100%' }}>
      <Flex gap={20} vertical>
        {buffsDisplayLeft}
      </Flex>
      <Flex gap={20} vertical>
        {buffsDisplayRight}
      </Flex>
    </Flex>
  )
}

function rerunSim(result?: SimulationScore) {
  if (!result) return null
  result.simulationForm.trace = true
  const rerun = runSimulations(result.simulationForm, null, [result.originalSim], originalScoringParams)[0]
  const x = rerun.tracedX!
  return aggregateCombatBuffs(x, result.simulationForm)
}

function BuffGroup(props: { id: string; buffs: Buff[]; buffType: BUFF_TYPE; size: BuffDisplaySize }) {
  const { i18n } = useTranslation() // needed to trigger re-render on language change
  const { id, buffs, buffType, size } = props

  let src
  if (buffType == BUFF_TYPE.PRIMARY) src = Assets.getCharacterAvatarById(id)
  else if (buffType == BUFF_TYPE.CHARACTER) src = Assets.getCharacterAvatarById(id)
  else if (buffType == BUFF_TYPE.LIGHTCONE) src = Assets.getLightConeIconById(id)
  else if (buffType == BUFF_TYPE.SETS) src = Assets.getSetImage(Sets[id as keyof typeof Sets])
  else src = Assets.getBlank()

  return (
    <Flex align='center' gap={5}>
      <img src={src} style={{ width: 64, height: 64 }}/>

      <BuffTable buffs={buffs} size={size}/>
    </Flex>
  )
}

type BuffTableItem = {
  key: number
  value: string
  statLabel: string
  sourceLabel: string
}

function BuffTable(props: { buffs: Buff[]; size: BuffDisplaySize }) {
  const { buffs } = props
  const { t: tOptimizerTab } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay.Sources' })
  const { t: tGameData } = useTranslation('gameData')
  const size = props.size ?? BuffDisplaySize.SMALL

  const columns = [
    {
      dataIndex: 'value',
      key: 'value',
      width: 70,
      minWidth: 70,
      render: (value: string) => <span style={{ textWrap: 'nowrap' }}>{value}</span>,
    },
    {
      dataIndex: 'stat',
      key: 'stat',
      render: (_: string, record: BuffTableItem) => (
        <Flex justify='space-between'>
          <span style={{ flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'nowrap', marginRight: 10, minWidth: 130 }}>
            {record.statLabel}
          </span>
          <span style={{ flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'nowrap', textAlign: 'end' }}>
            {record.sourceLabel}
          </span>
        </Flex>
      ),
    },
  ]

  const data = buffs.map((buff, i) => {
    const stat = buff.stat as keyof ComputedStatsObject
    const percent = !StatsConfig[stat].flat
    const bool = StatsConfig[stat].bool
    const statLabel = translatedLabel(stat, buff.memo)

    let sourceLabel
    switch (buff.source.buffType) {
      case BUFF_TYPE.CHARACTER:
        sourceLabel = tOptimizerTab(`${buff.source.ability as Exclude<BUFF_ABILITY, 'NONE' | 'SETS' | 'LC'>}`)
        break
      case BUFF_TYPE.LIGHTCONE:
        sourceLabel = tGameData(`Lightcones.${buff.source.id}.Name` as never)
        break
      case BUFF_TYPE.SETS:
        sourceLabel = tGameData(`RelicSets.${setToId[Sets[buff.source.id as keyof typeof Sets]]}.Name`)
        break
      default:
        sourceLabel = buff.source.label
    }
    let value
    if (bool) {
      value = buff.value ? 'True' : 'False'
    } else if (percent) {
      value = `${TsUtils.precisionRound(buff.value * 100, 2)} %`
    } else {
      value = `${TsUtils.precisionRound(buff.value, 0)}`
    }

    return {
      key: i,
      value: value,
      statLabel: statLabel,
      sourceLabel: sourceLabel,
    } as BuffTableItem
  })

  return (
    <Table<BuffTableItem>
      columns={columns}
      dataSource={data}
      pagination={false}
      size='small'
      className='buff-table remove-table-bottom-border'
      rowClassName='buff-row'
      tableLayout='fixed'
      style={{
        width: size,
        border: '1px solid #354b7d',
        boxShadow: cardShadow,
        borderRadius: 5,
        overflow: 'hidden',
        fontSize: 14,
      }}
    />
  )
}

export enum BuffDisplaySize {
  SMALL = 390,
  LARGE = 450,
}

// Pattern priority:\
// composite\
// standalone\
// dmg type\
// res pen\
// unconvertible stat\
// stat (i.e. tCommon(`Stats.${stat}`)\
// all remaining go to misc without regex checking
function translatedLabel(stat: keyof ComputedStatsObject, isMemo = false) {
  const label = StatsConfig[stat]?.label ?? stat
  const t = i18next.getFixedT(null, 'optimizerTab', 'ExpandedDataPanel.BuffsAnalysisDisplay.Stats')
  const tCommon = i18next.getFixedT(null, 'common')
  const compositeLabel = /^(Basic|Skill|Ult|Fua|Dot|Break|Memo Skill|Memo Talent) (ATK scaling|DEF scaling|HP scaling|Special scaling|ATK % boost|Crit Rate boost|Crit DMG boost|DMG boost|Vulnerability|RES PEN|DEF PEN|Break DEF PEN|Toughness DMG|Super Break multiplier|Break Efficiency boost|True DMG multiplier|Final DMG multiplier|Break DMG multiplier|Additional DMG scaling|Additional DMG|DMG)$/
  const standaloneLabel = /^(ATK % boost|Crit Rate boost|Crit DMG boost|Vulnerability|RES PEN|DEF PEN|Break DEF PEN|Super Break multiplier|Break Efficiency boost|True DMG multiplier|Final DMG multiplier|DMG)$/
  const dmgTypeLabel = /(Basic|Skill|Ult|Fua|Dot|Break|Memo Skill|Memo Talent|Additional|Super Break) DMG type/
  const resPenLabel = /(Physical|Fire|Ice|Lightning|Wind|Quantum|Imaginary) RES PEN/
  const unconvertibleLabel = /Unconvertible (.*)/
  let matchArr = compositeLabel.exec(label)
  if (matchArr) {
    const prefix = t(`CompositeLabels.Prefix.${matchArr[1]}` as never) as string
    const suffix = t(`CompositeLabels.Suffix.${matchArr[2]}` as never) as string
    const finalLabel = t('CompositeLabels.Label', { prefix, suffix }) as string
    return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) : finalLabel
  }
  matchArr = standaloneLabel.exec(label)
  if (matchArr) {
    const finalLabel = t(`CompositeLabels.Suffix.${matchArr[1]}` as never) as string
    return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) : finalLabel
  }
  matchArr = dmgTypeLabel.exec(label)
  if (matchArr) {
    const ability = t(`CompositeLabels.Prefix.${matchArr[1]}` as never) as string
    const finalLabel = t('DmgType', { ability })
    return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) : finalLabel
  }
  matchArr = resPenLabel.exec(label)
  if (matchArr) {
    const element = tCommon(`Elements.${matchArr[1]}` as never) as string
    const finalLabel = t('ResPen', { element })
    return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) : finalLabel
  }
  matchArr = unconvertibleLabel.exec(label)
  if (matchArr) {
    const stat = tCommon(`Stats.${matchArr[1]}` as never) as string
    const finalLabel = t('Unconvertible', { stat })
    return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) : finalLabel
  }// dmg boost uses the full "element dmg boost" so we can't use only ReadableStats
  if (i18next.exists(`Stats.${label}`)) {
    const finalLabel = tCommon(`Stats.${label}` as never) as string
    return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) : finalLabel
  }// the keys don't have a space between the stat and the % but the labels do, remove for comparison/lookup
  if (i18next.exists(`ReadableStats.${label.replace(' ', '')}`)) {
    const finalLabel = tCommon(`ReadableStats.${label.replace(' ', '')}` as never) as string
    return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) : finalLabel
  }
  const finalLabel = t(`Misc.${label}` as never) as string
  return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) : finalLabel
}
