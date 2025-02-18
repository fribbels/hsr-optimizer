import { Flex, Tag, Typography } from 'antd'
import i18next from 'i18next'
import { Sets } from 'lib/constants/constants'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/computedStatsArray'
import { ComputedStatsObject, StatsConfig } from 'lib/optimization/config/computedStatsConfig'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import { aggregateCombatBuffs } from 'lib/simulations/combatBuffsAnalysis'
import { runSimulations } from 'lib/simulations/statSimulationController'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { ReactElement } from 'react'

const { Text } = Typography

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
  const rerun = runSimulations(result.simulationForm, null, [result.originalSim])[0]
  const x = rerun.tracedX!
  return aggregateCombatBuffs(x, result.simulationForm)
}

function BuffGroup(props: { id: string; buffs: Buff[]; buffType: BUFF_TYPE; size: BuffDisplaySize }) {
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

      <Flex vertical>
        {buffs.map((buff, i) => (
          <BuffTag buff={buff} key={i} size={size}/>
        ))}
      </Flex>
    </Flex>
  )
}

export enum BuffDisplaySize {
  SMALL = 375,
  LARGE = 425,
}

function BuffTag(props: { buff: Buff; size: BuffDisplaySize }) {
  const t = i18next.getFixedT(null, ['charactersTab', 'modals', 'common'])
  const { buff, size } = props
  const stat = buff.stat as keyof ComputedStatsObject
  const percent = !StatsConfig[stat].flat
  // @ts-ignore
  const statLabel = computedStatsTempI18NTranslations[stat] ?? stat

  let sourceLabel

  if (buff.source.buffType == BUFF_TYPE.CHARACTER) sourceLabel = buff.source.ability
  else if (buff.source.buffType == BUFF_TYPE.LIGHTCONE) sourceLabel = t(`gameData:Lightcones.${buff.source.id}.Name` as never)
  else sourceLabel = buff.source.label

  return (
    <Tag style={{ padding: 2, paddingLeft: 6, paddingRight: 6, marginTop: -1, marginInlineEnd: 0 }}>
      <Text>
        <Flex justify='space-between' style={{ width: size }}>
          <Flex gap={3} style={{ minWidth: 70 }}>
            <span>
              {`${percent ? TsUtils.precisionRound(buff.value * 100, 2) : TsUtils.precisionRound(buff.value, 0)}`}
            </span>
            <span>
              {`${percent ? '%' : ''}`}
            </span>
          </Flex>
          <span style={{ flex: '1 1 auto', marginRight: 10 }}>
            {`${statLabel}`} {buff.memo ? 'ᴹ' : ''}
          </span>
          <span style={{ flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'end' }}>
            {sourceLabel}
          </span>
        </Flex>
      </Text>
    </Tag>
  )
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
  BASIC_SCALING: 'Basic scaling',
  SKILL_SCALING: 'Skill scaling',
  ULT_SCALING: 'Ult scaling',
  FUA_SCALING: 'Fua scaling',
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
  WIND_RES_PEN: 'Wing RES PEN',
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
  DOT_CHANCE: 'Dot chance',
  EFFECT_RES_PEN: 'Effect RES PEN',
  DOT_SPLIT: 'Dot split',
  DOT_STACKS: 'Dot stacks',
  SUMMONS: 'Summons',
  ENEMY_WEAKNESS_BROKEN: 'Enemy Weakness Broken',
  SUPER_BREAK_MODIFIER: 'Super Break multiplier',
  BASIC_SUPER_BREAK_MODIFIER: 'Basic Super Break multiplier',
  BASIC_TOUGHNESS_DMG: 'Basic Toughness DMG',
  SKILL_TOUGHNESS_DMG: 'Skill Toughness DMG',
  ULT_TOUGHNESS_DMG: 'Ult Toughness DMG',
  FUA_TOUGHNESS_DMG: 'Fua Toughness DMG',
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
  HEAL_TYPE: 'Healing ability type',
  HEAL_FLAT: 'Healing flat',
  HEAL_SCALING: 'Healing scaling',
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
  UNCONVERTIBLE_HP_BUFF: 'Unconvertible HP buff',
  UNCONVERTIBLE_ATK_BUFF: 'Unconvertible ATK buff',
  UNCONVERTIBLE_DEF_BUFF: 'Unconvertible DEF buff',
  UNCONVERTIBLE_SPD_BUFF: 'Unconvertible SPD buff',
  UNCONVERTIBLE_CR_BUFF: 'Unconvertible Crit Rate buff',
  UNCONVERTIBLE_CD_BUFF: 'Unconvertible Crit DMG buff',
  UNCONVERTIBLE_EHR_BUFF: 'Unconvertible Effect Hit Rate buff',
  UNCONVERTIBLE_BE_BUFF: 'Unconvertible Break Effect buff',
  UNCONVERTIBLE_OHB_BUFF: 'Unconvertible Outgoing Healing Boost buff',
  UNCONVERTIBLE_RES_BUFF: 'Unconvertible Effect RES buff',
  UNCONVERTIBLE_ERR_BUFF: 'Unconvertible Energy Regeneration Rate buff',
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
