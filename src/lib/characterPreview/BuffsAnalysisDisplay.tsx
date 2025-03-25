import { Flex, Table } from 'antd'
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
  memo: boolean
  sourceLabel: string
}

function BuffTable(props: { buffs: Buff[]; size: BuffDisplaySize }) {
  const { buffs } = props
  const { t } = useTranslation(['gameData', 'optimizerTab'])
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
            {`${record.statLabel}`} {record.memo ? 'ᴹ' : ''}
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
    // @ts-ignore
    const statLabel: string = StatsConfig[stat]?.label ?? stat

    let sourceLabel
    switch (buff.source.buffType) {
      case BUFF_TYPE.CHARACTER:
        sourceLabel = t(`optimizerTab:ExpandedDataPanel.BuffsAnalysisDisplay.Sources.${buff.source.ability as Exclude<BUFF_ABILITY, 'NONE' | 'SETS' | 'LC'>}`)
        break
      case BUFF_TYPE.LIGHTCONE:
        sourceLabel = t(`Lightcones.${buff.source.id}.Name` as never)
        break
      case BUFF_TYPE.SETS:
        sourceLabel = t(`RelicSets.${setToId[Sets[buff.source.id as keyof typeof Sets]]}.Name`)
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
      memo: buff.memo,
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

const computedStatsTempI18NTranslations = {
  HP_P: 'HP %',
  ATK_P: 'ATK %',
  DEF_P: 'DEF %',
  SPD_P: 'SPD %',
  HP: 'HP',
  ATK: 'ATK',
  DEF: 'DEF',
  SPD: 'SPD',
  CR: 'Crit Rate',
  CD: 'Crit DMG',
  EHR: 'Effect Hit Rate',
  RES: 'Effect RES',
  BE: 'Break Effect',
  ERR: 'Energy Regeneration Rate',
  OHB: 'Outgoing Healing Boost',
  PHYSICAL_DMG_BOOST: 'Physical DMG Boost',
  FIRE_DMG_BOOST: 'Fire DMG Boost',
  ICE_DMG_BOOST: 'Ice DMG Boost',
  LIGHTNING_DMG_BOOST: 'Thunder DMG Boost',
  WIND_DMG_BOOST: 'Wind DMG Boost',
  QUANTUM_DMG_BOOST: 'Quantum DMG Boost',
  IMAGINARY_DMG_BOOST: 'Imaginary DMG Boost',
  ELEMENTAL_DMG: 'DMG %',
  BASIC_ATK_SCALING: 'Basic ATK scaling',
  SKILL_ATK_SCALING: 'Skill ATK scaling',
  ULT_ATK_SCALING: 'Ult ATK scaling',
  FUA_ATK_SCALING: 'Fua ATK scaling',
  BASIC_HP_SCALING: 'Basic HP scaling',
  SKILL_HP_SCALING: 'Skill HP scaling',
  ULT_HP_SCALING: 'Ult HP scaling',
  FUA_HP_SCALING: 'Fua HP scaling',
  DOT_SCALING: 'Dot scaling',
  BASIC_CR_BOOST: 'Basic Crit Rate boost',
  SKILL_CR_BOOST: 'Skill Crit Rate boost',
  ULT_CR_BOOST: 'Ult Crit Rate boost',
  FUA_CR_BOOST: 'Fua Crit Rate boost',
  BASIC_CD_BOOST: 'Basic Crit DMG boost',
  SKILL_CD_BOOST: 'Skill Crit DMG boost',
  ULT_CD_BOOST: 'Ult Crit DMG boost',
  FUA_CD_BOOST: 'Fua Crit DMG boost',
  BASIC_BOOST: 'Basic DMG boost',
  SKILL_BOOST: 'Skill DMG boost',
  ULT_BOOST: 'Ult DMG boost',
  FUA_BOOST: 'Fua DMG boost',
  DOT_BOOST: 'Dot DMG boost',
  BREAK_BOOST: 'Break DMG boost',
  ADDITIONAL_BOOST: 'Additional DMG boost',
  VULNERABILITY: 'Vulnerability',
  BASIC_VULNERABILITY: 'Basic DMG vulnerability',
  SKILL_VULNERABILITY: 'Skill DMG vulnerability',
  ULT_VULNERABILITY: 'Ult DMG vulnerability',
  FUA_VULNERABILITY: 'Fua DMG vulnerability',
  DOT_VULNERABILITY: 'Dot DMG vulnerability',
  BREAK_VULNERABILITY: 'Break DMG vulnerability',
  DEF_PEN: 'DEF PEN',
  BASIC_DEF_PEN: 'Basic DEF PEN',
  SKILL_DEF_PEN: 'Skill DEF PEN',
  ULT_DEF_PEN: 'Ult DEF PEN',
  FUA_DEF_PEN: 'Fua DEF PEN',
  DOT_DEF_PEN: 'Dot DEF PEN',
  BREAK_DEF_PEN: 'Break DEF PEN',
  SUPER_BREAK_DEF_PEN: 'Super Break DEF PEN',
  RES_PEN: 'All-Type RES PEN',
  PHYSICAL_RES_PEN: 'Physical RES PEN',
  FIRE_RES_PEN: 'Fire RES PEN',
  ICE_RES_PEN: 'Ice RES PEN',
  LIGHTNING_RES_PEN: 'Lightning RES PEN',
  WIND_RES_PEN: 'Wind RES PEN',
  QUANTUM_RES_PEN: 'Quantum RES PEN',
  IMAGINARY_RES_PEN: 'Imaginary RES PEN',
  BASIC_RES_PEN: 'Basic DMG RES PEN',
  SKILL_RES_PEN: 'Skill DMG RES PEN',
  ULT_RES_PEN: 'Ult DMG RES PEN',
  FUA_RES_PEN: 'Fua DMG RES PEN',
  DOT_RES_PEN: 'Dot DMG RES PEN',
  BASIC_DMG: 'Basic DMG',
  SKILL_DMG: 'Skill DMG',
  ULT_DMG: 'Ult DMG',
  FUA_DMG: 'Fua DMG',
  DOT_DMG: 'Dot DMG',
  BREAK_DMG: 'Break DMG',
  COMBO_DMG: 'Combo DMG',
  DMG_RED_MULTI: 'Damage reduction',
  EHP: 'Effective HP',
  SHIELD_BOOST: 'Shield boost',
  DOT_CHANCE: 'Dot base chance',
  EFFECT_RES_PEN: 'Effect RES PEN',
  DOT_SPLIT: 'Dot split',
  DOT_STACKS: 'Dot stacks',
  SUMMONS: 'Summons',
  ENEMY_WEAKNESS_BROKEN: 'Enemy weakness broken',
  SUPER_BREAK_MODIFIER: 'Super Break multiplier',
  BASIC_SUPER_BREAK_MODIFIER: 'Basic Super Break multiplier',
  BASIC_TOUGHNESS_DMG: 'Basic Toughness DMG',
  SKILL_TOUGHNESS_DMG: 'Skill Toughness DMG',
  ULT_TOUGHNESS_DMG: 'Ult Toughness DMG',
  FUA_TOUGHNESS_DMG: 'Fua Toughness DMG',
  MEMO_SKILL_TOUGHNESS_DMG: 'Memo Skill Toughness DMG',
  MEMO_TALENT_TOUGHNESS_DMG: 'Memo Talent Toughness DMG',
  TRUE_DMG_MODIFIER: 'True DMG multiplier',
  BASIC_TRUE_DMG_MODIFIER: 'Basic True DMG multiplier',
  SKILL_TRUE_DMG_MODIFIER: 'Skill True DMG multiplier',
  ULT_TRUE_DMG_MODIFIER: 'Ult True DMG multiplier',
  FUA_TRUE_DMG_MODIFIER: 'Fua True DMG multiplier',
  BREAK_TRUE_DMG_MODIFIER: 'Break True DMG multiplier',
  BASIC_FINAL_DMG_BOOST: 'Basic Final DMG boost',
  SKILL_FINAL_DMG_BOOST: 'Skill Final DMG boost',
  ULT_FINAL_DMG_BOOST: 'Ult Final DMG boost',
  BASIC_BREAK_DMG_MODIFIER: 'Basic Break DMG multiplier',
  ULT_ADDITIONAL_DMG_CR_OVERRIDE: 'Ult Additional DMG CR override',
  ULT_ADDITIONAL_DMG_CD_OVERRIDE: 'Ult Additional DMG CD override',
  SKILL_OHB: 'Skill Outgoing Healing Boost',
  ULT_OHB: 'Ult Outgoing Healing Boost',
  HEAL_TYPE: 'Heal ability type',
  HEAL_FLAT: 'Heal flat',
  HEAL_SCALING: 'Heal scaling',
  HEAL_VALUE: 'Heal value',
  SHIELD_FLAT: 'Shield flat',
  SHIELD_SCALING: 'Shield scaling',
  SHIELD_VALUE: 'Shield value',
  BASIC_ADDITIONAL_DMG_SCALING: 'Basic Additional DMG scaling',
  SKILL_ADDITIONAL_DMG_SCALING: 'Skill Additional DMG scaling',
  ULT_ADDITIONAL_DMG_SCALING: 'Ult Additional DMG scaling',
  FUA_ADDITIONAL_DMG_SCALING: 'Fua Additional DMG scaling',
  BASIC_ADDITIONAL_DMG: 'Basic Additional DMG',
  SKILL_ADDITIONAL_DMG: 'Skill Additional DMG',
  ULT_ADDITIONAL_DMG: 'Ult Additional DMG',
  FUA_ADDITIONAL_DMG: 'Fua Additional DMG',
  MEMO_BUFF_PRIORITY: 'Prioritize Memo buffs',
  DEPRIORITIZE_BUFFS: 'Deprioritize buffs',
  MEMO_BASE_HP_SCALING: 'Memo HP scaling',
  MEMO_BASE_HP_FLAT: 'Memo HP flat',
  MEMO_BASE_DEF_SCALING: 'Memo DEF scaling',
  MEMO_BASE_DEF_FLAT: 'Memo DEF flat',
  MEMO_BASE_ATK_SCALING: 'Memo ATK scaling',
  MEMO_BASE_ATK_FLAT: 'Memo ATK flat',
  MEMO_BASE_SPD_SCALING: 'Memo SPD scaling',
  MEMO_BASE_SPD_FLAT: 'Memo SPD flat',
  MEMO_SKILL_SCALING: 'Memo Skill scaling',
  MEMO_TALENT_SCALING: 'Memo Talent scaling',
  UNCONVERTIBLE_HP_BUFF: 'Unconvertible HP',
  UNCONVERTIBLE_ATK_BUFF: 'Unconvertible ATK',
  UNCONVERTIBLE_DEF_BUFF: 'Unconvertible DEF',
  UNCONVERTIBLE_SPD_BUFF: 'Unconvertible SPD',
  UNCONVERTIBLE_CR_BUFF: 'Unconvertible Crit Rate',
  UNCONVERTIBLE_CD_BUFF: 'Unconvertible Crit DMG',
  UNCONVERTIBLE_EHR_BUFF: 'Unconvertible Effect Hit Rate',
  UNCONVERTIBLE_BE_BUFF: 'Unconvertible Break Effect',
  UNCONVERTIBLE_OHB_BUFF: 'Unconvertible Outgoing Healing Boost',
  UNCONVERTIBLE_RES_BUFF: 'Unconvertible Effect RES',
  UNCONVERTIBLE_ERR_BUFF: 'Unconvertible Energy Regeneration Rate',
  BREAK_EFFICIENCY_BOOST: 'Break efficiency boost',
  BASIC_BREAK_EFFICIENCY_BOOST: 'Basic Break efficiency boost',
  ULT_BREAK_EFFICIENCY_BOOST: 'Ult Break efficiency boost',
  BASIC_DMG_TYPE: 'Basic DMG type',
  SKILL_DMG_TYPE: 'Skill DMG type',
  ULT_DMG_TYPE: 'Ult DMG type',
  FUA_DMG_TYPE: 'Fua DMG type',
  DOT_DMG_TYPE: 'Dot DMG type',
  BREAK_DMG_TYPE: 'Break DMG type',
  SUPER_BREAK_DMG_TYPE: 'Super Break DMG type',
  MEMO_DMG_TYPE: 'Memo DMG type',
  ADDITIONAL_DMG_TYPE: 'Additional DMG type',
}

// function
