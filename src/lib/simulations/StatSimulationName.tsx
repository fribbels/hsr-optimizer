import { Badge, Flex } from '@mantine/core'
import {
  Constants,
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import {
  Simulation,
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'
import { Utils } from 'lib/utils/utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Stat } from 'types/relic'

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

export function StatSimulationName(props: { sim: Simulation }) {
  const { sim } = props
  return (
    <Flex gap={5}>
      <SimSetsDisplay sim={sim} />

      |

      <SimMainsDisplay sim={sim} />

      |

      <Flex>
        {sim.name ? `${sim.name}` : null}
      </Flex>

      <Flex>
        {sim.name ? `|` : null}
      </Flex>

      <SimSubstatsDisplay sim={sim} />
    </Flex>
  )
}

function SimSetsDisplay(props: { sim: Simulation }) {
  const request = props.sim.request
  const imgSize = 22
  const relicImage1 = Assets.getSetImage(request.simRelicSet1)
  const relicImage2 = Assets.getSetImage(request.simRelicSet2)
  const ornamentImage = request.simOrnamentSet ? Assets.getSetImage(request.simOrnamentSet) : Assets.getBlank()
  return (
    <Flex gap={5}>
      <Flex style={{ width: imgSize * 2 + 5 }} justify='center'>
        <img style={{ width: request.simRelicSet1 ? imgSize : 0 }} src={relicImage1} />
        <img style={{ width: request.simRelicSet2 ? imgSize : 0 }} src={relicImage2} />
      </Flex>

      <img style={{ width: imgSize }} src={ornamentImage} />
    </Flex>
  )
}

function SimMainsDisplay(props: { sim: Simulation }) {
  const request = props.sim.request
  const imgSize = 22
  return (
    <Flex>
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simBody, true)} />
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simFeet, true)} />
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simPlanarSphere, true)} />
      <img style={{ width: imgSize }} src={Assets.getStatIcon(request.simLinkRope, true)} />
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
      renderArray.push({
        stat: stat,
        value: value,
      })
    }
  }

  renderArray.sort((a, b) => substatToPriority[a.stat] - substatToPriority[b.stat])

  function renderStat(x: Stat) {
    return props.sim.simType == StatSimTypes.SubstatRolls
      ? `${t([x.stat])} x ${x.value}`
      : `${t([x.stat])} ${x.value}${Utils.isFlat(x.stat) ? '' : '%'}`
  }

  return (
    <Flex gap={0}>
      {renderArray.map((x) => {
        return (
          <Flex key={x.stat}>
            <Badge
              style={{ paddingInline: '5px', marginInlineEnd: '5px' }}
            >
              {renderStat(x)}
            </Badge>
          </Flex>
        )
      })}
    </Flex>
  )
}
