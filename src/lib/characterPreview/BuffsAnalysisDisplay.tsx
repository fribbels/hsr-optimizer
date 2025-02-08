import { Flex, Tag, Typography } from 'antd'
import { Sets } from 'lib/constants/constants'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/computedStatsArray'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import { aggregateCombatBuffs } from 'lib/simulations/combatBuffsAnalysis'
import { runSimulations } from 'lib/simulations/statSimulationController'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { ReactElement } from 'react'

const { Text } = Typography

export function BuffsAnalysisDisplay(props: { result: SimulationScore }) {
  const { result } = props
  result.simulationForm.trace = true
  const rerun = runSimulations(result.simulationForm, null, [result.originalSim])[0]
  const x = rerun.tracedX!
  const buffGroups = aggregateCombatBuffs(x, result.simulationForm)

  const buffsDisplayLeft: ReactElement[] = []
  const buffsDisplayRight: ReactElement[] = []
  let groupKey = 0

  for (const [id, buffs] of Object.entries(buffGroups.PRIMARY)) {
    buffsDisplayLeft.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.PRIMARY} key={groupKey++}/>)
  }

  for (const [id, buffs] of Object.entries(buffGroups.SETS)) {
    buffsDisplayLeft.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.SETS} key={groupKey++}/>)
  }

  for (const [id, buffs] of Object.entries(buffGroups.CHARACTER)) {
    buffsDisplayRight.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.CHARACTER} key={groupKey++}/>)
  }

  for (const [id, buffs] of Object.entries(buffGroups.LIGHTCONE)) {
    buffsDisplayRight.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.LIGHTCONE} key={groupKey++}/>)
  }

  // for (let i = buffsDisplayLeft.length - 1; i > 0; i--) {
  //   buffsDisplayLeft.splice(i, 0, <CustomHorizontalDivider height={10}/>)
  // }
  //
  // for (let i = buffsDisplayRight.length - 1; i > 0; i--) {
  //   buffsDisplayRight.splice(i, 0, <CustomHorizontalDivider height={10}/>)
  // }

  console.log(rerun)

  return (
    <Flex gap={100}>
      <Flex gap={20} vertical>
        {buffsDisplayLeft}
      </Flex>
      <Flex gap={20} vertical>
        {buffsDisplayRight}
      </Flex>
    </Flex>
  )
}

function BuffGroup(props: { id: string; buffs: Buff[]; buffType: BUFF_TYPE }) {
  const { id, buffs, buffType } = props

  let src
  if (buffType == BUFF_TYPE.PRIMARY) src = Assets.getCharacterAvatarById(id)
  else if (buffType == BUFF_TYPE.CHARACTER) src = Assets.getCharacterAvatarById(id)
  else if (buffType == BUFF_TYPE.LIGHTCONE) src = Assets.getLightConeIconById(id)
  else if (buffType == BUFF_TYPE.SETS) src = Assets.getSetImage(Sets[id as keyof typeof Sets])
  else src = Assets.getBlank()

  return (
    <Flex align='center' gap={10}>
      <img src={src} style={{ width: 64, height: 64 }}/>

      <Flex vertical>
        {buffs.map((buff, i) => (
          <BuffTag buff={buff} key={i}/>
        ))}
      </Flex>
    </Flex>
  )
}

function BuffTag(props: { buff: Buff }) {
  const { buff } = props
  const memo = false

  return (
    <Tag style={{ padding: 2, paddingLeft: 6, paddingRight: 6 }}>
      <Flex justify='space-between' style={{ width: 400 }}>
        <Text style={{ fontSize: 14 }}>
          {`${buff.stat} (${buff.source.label})`}
        </Text>
        <Text style={{ fontSize: 14 }}>
          {`${TsUtils.precisionRound(buff.value)}`}
        </Text>
      </Flex>
    </Tag>
  )
}

// ${memo ? 'ᴹ' : ''} :
