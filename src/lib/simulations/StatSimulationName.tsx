import { Flex } from '@mantine/core'
import type { CSSProperties } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import type { SubStats } from 'lib/constants/constants'
import {
  Constants,
  Stats,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import type { Simulation } from 'lib/simulations/statSimulationTypes'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import type { Stat } from 'types/relic'
import { isFlat } from 'lib/utils/statUtils'

const IMG_SIZE = 22

const SUBSTAT_TAG_STYLE: CSSProperties = {
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 4,
  paddingInline: 3,
  paddingBlock: 1,
  marginInlineEnd: 5,
  fontSize: 11.5,
  whiteSpace: 'nowrap',
  background: 'rgba(255, 255, 255, 0.06)',
}

const substatToPriority: Record<string, number> = {
  [Stats.ATK_P]: 0,
  [Stats.ATK]: 1,
  [Stats.CR]: 2,
  [Stats.CD]: 3,
  [Stats.SPD]: 4,
  [Stats.BE]: 5,
  [Stats.HP_P]: 6,
  [Stats.HP]: 7,
  [Stats.DEF_P]: 8,
  [Stats.DEF]: 9,
  [Stats.EHR]: 10,
  [Stats.RES]: 11,
}

function renderStat(x: Stat, simType: StatSimTypes, t: TFunction<'common', 'ShortStats'>) {
  return simType === StatSimTypes.SubstatRolls
    ? `${t(x.stat)} x ${x.value}`
    : `${t(x.stat)} ${x.value}${isFlat(x.stat) ? '' : '%'}`
}

export function StatSimulationName(props: { sim: Simulation }) {
  return (
    <Flex gap={5} align="center">
      <SimSetsDisplay sim={props.sim} />

      <span>|</span>

      <SimMainsDisplay sim={props.sim} />

      <span>|</span>

      {props.sim.name && <span>{props.sim.name}</span>}

      {props.sim.name && <span>|</span>}

      <SimSubstatsDisplay sim={props.sim} />
    </Flex>
  )
}

function SimSetsDisplay(props: { sim: Simulation }) {
  const request = props.sim.request
  const relicImage1 = Assets.getSetImage(request.simRelicSet1)
  const relicImage2 = Assets.getSetImage(request.simRelicSet2)
  const ornamentImage = request.simOrnamentSet ? Assets.getSetImage(request.simOrnamentSet) : Assets.getBlank()
  return (
    <Flex gap={5}>
      <Flex w={IMG_SIZE * 2 + 5} justify='center'>
        <img style={{ width: request.simRelicSet1 ? IMG_SIZE : 0 }} src={relicImage1} />
        <img style={{ width: request.simRelicSet2 ? IMG_SIZE : 0 }} src={relicImage2} />
      </Flex>

      <img style={{ width: IMG_SIZE }} src={ornamentImage} />
    </Flex>
  )
}

function SimMainsDisplay(props: { sim: Simulation }) {
  const request = props.sim.request
  return (
    <Flex>
      <img style={{ width: IMG_SIZE }} src={Assets.getStatIcon(request.simBody, true)} />
      <img style={{ width: IMG_SIZE }} src={Assets.getStatIcon(request.simFeet, true)} />
      <img style={{ width: IMG_SIZE }} src={Assets.getStatIcon(request.simPlanarSphere, true)} />
      <img style={{ width: IMG_SIZE }} src={Assets.getStatIcon(request.simLinkRope, true)} />
    </Flex>
  )
}

function SimSubstatsDisplay(props: { sim: Simulation }) {
  const { t } = useTranslation('common', { keyPrefix: 'ShortStats' })
  const renderArray: { stat: SubStats; value: number }[] = []
  const substats = props.sim.request.stats
  for (const stat of Constants.SubStats) {
    const value = substats[stat]
    if (value) {
      renderArray.push({ stat, value })
    }
  }

  renderArray.sort((a, b) => substatToPriority[a.stat] - substatToPriority[b.stat])

  return (
    <Flex>
      {renderArray.map((x) => (
        <span key={x.stat} style={SUBSTAT_TAG_STYLE}>
          {renderStat(x, props.sim.simType, t)}
        </span>
      ))}
    </Flex>
  )
}
