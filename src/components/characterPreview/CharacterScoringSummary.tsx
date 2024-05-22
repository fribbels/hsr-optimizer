import { Divider, Flex } from 'antd'
import { defaultGap, iconSize } from 'lib/constantsUi'
import { SimulationScore, SimulationStatUpgrade } from 'lib/characterScorer'
import { ElementToDamage, Parts, Stats, StatsToShort, StatsToShortSpaced } from 'lib/constants'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
import { CharacterStatSummary } from 'components/characterPreview/CharacterStatSummary'
import { VerticalDivider } from 'components/Dividers'
import DB from 'lib/db'
import React, { ReactElement } from 'react'
import { StatCalculator } from 'lib/statCalculator'
import StatText from 'components/characterPreview/StatText'

export const CharacterScoringSummary = (props: { simScoringResult: SimulationScore }) => {
  const result = Utils.clone(props.simScoringResult)
  if (!result) return (
    <pre style={{ height: 200 }}>
      {' '}
    </pre>
  )

  // console.debug('stat sim result', result, props.characterStats)

  // Clean up some spammy data
  delete result.sims
  delete result.maxSim.key

  const characterId = result.currentRequest.characterId
  const characterMetadata = DB.getMetadata().characters[characterId]
  const elementalDmgValue = ElementToDamage[characterMetadata.element]

  function ScoringSet(props: { set: string }) {
    return (
      <Flex vertical align="center" gap={2}>
        <img src={Assets.getSetImage(props.set)} style={{ height: 60 }} />
      </Flex>
    )
  }

  function ScoringStat(props: { stat: string; part: string }) {
    return (
      <Flex align="center" gap={10}>
        <img src={Assets.getPart(props.part)} style={{ height: 30 }} />
        <pre style={{ margin: 0 }}>{props.stat.replace('Boost', '')}</pre>
      </Flex>
    )
  }

  function ScoringNumber(props: { label: string; number: number; precision?: number }) {
    const precision = props.precision ?? 1
    const show = props.number != 0
    return (
      <Flex align="center" gap={15}>
        <pre style={{ margin: 0 }}>{props.label}</pre>
        <pre style={{ margin: 0 }}>{show && props.number.toFixed(precision)}</pre>
      </Flex>
    )
  }

  function ScoringStatUpgrades() {
    const rows: ReactElement[] = []
    const currentScore = result.currentSim.SIM_SCORE
    const basePercent = result.percent

    for (const x of result.statUpgrades) {
      const statUpgrade: SimulationStatUpgrade = x
      const stat = statUpgrade.stat
      const isFlat = Utils.isFlat(statUpgrade.stat)
      const suffix = isFlat ? '' : '%'
      const rollValue = Utils.precisionRound(StatCalculator.getMaxedSubstatValue(stat, 0.8))
      // const simStatValue = Utils.precisionRound(statUpgrade.simulationResult[stat]) * (isFlat ? 1 : 100)

      rows.push(
        <Flex key={Utils.randomId()} align="center" gap={5}>
          <img src={Assets.getStatIcon(stat)} style={{ height: 30 }} />
          <pre
            style={{
              margin: 0,
              width: 200,
            }}
          >{`+1x roll: ${StatsToShort[statUpgrade.stat]} +${rollValue.toFixed(1)}${suffix}`}
          </pre>
          <pre style={{ margin: 0, width: 250 }}>
            {`Score: +${((statUpgrade.percent! - basePercent) * 100).toFixed(2)}% -> ${(statUpgrade.percent! * 100).toFixed(2)}%`}
          </pre>
          <pre style={{ margin: 0, width: 250 }}>
            {`Damage: +${(statUpgrade.SIM_SCORE - currentScore).toFixed(1)} -> ${statUpgrade.SIM_SCORE.toFixed(1)}`}
          </pre>
        </Flex>,
      )
    }

    return (
      <Flex vertical gap={defaultGap}>
        {rows}
      </Flex>
    )
  }

  return (
    <Flex vertical gap={40}>
      <div style={{ minHeight: 10 }} />

      <Flex gap={20}>
        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: 'auto' }}>
            Sim teammates
          </pre>
          <Flex gap={20}>
            <ScoringTeammate result={result} index={0} />
            <ScoringTeammate result={result} index={1} />
            <ScoringTeammate result={result} index={2} />
          </Flex>
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '0 auto' }}>
            Sim sets
          </pre>
          <Flex vertical gap={defaultGap}>
            <Flex>
              <ScoringSet set={result.metadata.relicSet1} />
              <ScoringSet set={result.metadata.relicSet2} />
            </Flex>

            <ScoringSet set={result.metadata.ornamentSet} />
          </Flex>
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '0 auto' }}>
            Formula
          </pre>
          <Flex vertical gap={defaultGap}>
            <ScoringNumber label="BASIC: " number={result.metadata.formula.BASIC} precision={0} />
            <ScoringNumber label="SKILL: " number={result.metadata.formula.SKILL} precision={0} />
            <ScoringNumber label="ULT:   " number={result.metadata.formula.ULT} precision={0} />
            <ScoringNumber label="DOT:   " number={result.metadata.formula.DOT} precision={0} />
            <ScoringNumber label="FUA:   " number={result.metadata.formula.FUA} precision={0} />
            <ScoringNumber label="BREAK: " number={result.metadata.formula.BREAK} precision={0} />
          </Flex>
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={defaultGap} style={{ width: 160 }}>
          <pre style={{ margin: '0 auto' }}>
            Sim main stats
          </pre>
          <Flex vertical gap={defaultGap}>
            <ScoringStat stat={result.maxSim.request.simBody} part={Parts.Body} />
            <ScoringStat stat={result.maxSim.request.simFeet} part={Parts.Feet} />
            <ScoringStat stat={result.maxSim.request.simPlanarSphere} part={Parts.PlanarSphere} />
            <ScoringStat stat={result.maxSim.request.simLinkRope} part={Parts.LinkRope} />
          </Flex>
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '0 auto' }}>
            Sim substats
          </pre>
          <Flex gap={20}>
            <Flex vertical gap={defaultGap} style={{ width: 100 }}>
              <ScoringNumber label="ATK%: " number={result.maxSim.request.stats[Stats.ATK_P]} precision={0} />
              <ScoringNumber label="ATK:  " number={result.maxSim.request.stats[Stats.ATK]} precision={0} />
              <ScoringNumber label="HP%:  " number={result.maxSim.request.stats[Stats.HP_P]} precision={0} />
              <ScoringNumber label="HP:   " number={result.maxSim.request.stats[Stats.HP]} precision={0} />
              <ScoringNumber label="DEF%: " number={result.maxSim.request.stats[Stats.DEF_P]} precision={0} />
              <ScoringNumber label="DEF:  " number={result.maxSim.request.stats[Stats.DEF]} precision={0} />
            </Flex>
            <Flex vertical gap={defaultGap} style={{ width: 100 }}>
              <ScoringNumber label="SPD:  " number={result.maxSim.request.stats[Stats.SPD]} precision={2} />
              <ScoringNumber label="CR:   " number={result.maxSim.request.stats[Stats.CR]} precision={0} />
              <ScoringNumber label="CD:   " number={result.maxSim.request.stats[Stats.CD]} precision={0} />
              <ScoringNumber label="EHR:  " number={result.maxSim.request.stats[Stats.EHR]} precision={0} />
              <ScoringNumber label="RES:  " number={result.maxSim.request.stats[Stats.RES]} precision={0} />
              <ScoringNumber label="BE:   " number={result.maxSim.request.stats[Stats.BE]} precision={0} />
            </Flex>
          </Flex>
        </Flex>

      </Flex>

      <Flex>
        <Flex vertical gap={defaultGap} style={{ width: 225 }}>
          <pre style={{ margin: 'auto' }}>
            Character basic stats
          </pre>
          <CharacterStatSummary finalStats={result.currentSim} elementalDmgValue={elementalDmgValue} hideCv={true} />
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={defaultGap} style={{ width: 225 }}>
          <pre style={{ margin: 'auto' }}>
            Ideal sim basic stats
          </pre>
          <CharacterStatSummary finalStats={result.maxSim.result} elementalDmgValue={elementalDmgValue} hideCv={true} />
        </Flex>

        <Flex style={{ width: 80 }} justify="space-around">
          <VerticalDivider />
        </Flex>

        <Flex vertical gap={defaultGap} style={{ width: 225 }}>
          <pre style={{ margin: 'auto' }}>
            Character <u>combat stats</u>
          </pre>
          <CharacterStatSummary finalStats={result.currentSim.x} elementalDmgValue={elementalDmgValue} hideCv={true} />
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={defaultGap} style={{ width: 225 }}>
          <pre style={{ margin: 'auto' }}>
            Ideal sim <u>combat stats</u>
          </pre>
          <CharacterStatSummary
            finalStats={result.maxSim.result.x} elementalDmgValue={elementalDmgValue}
            hideCv={true}
          />
        </Flex>
      </Flex>

      <Flex gap={defaultGap}>
        <Flex vertical gap={10}>
          <pre style={{ margin: '0 auto' }}>
            Scoring
          </pre>
          <Flex vertical gap={10}>
            <pre style={{ margin: 'auto 0', marginBottom: 10 }}>
              50x substats sim results
            </pre>
            <ScoringNumber label="Character DMG:      " number={result.currentSim.SIM_SCORE} />
            <ScoringNumber label="Ideal sim DMG:      " number={result.maxSim.result.SIM_SCORE} />
            <ScoringNumber label="Baseline sim DMG    " number={result.baselineSimValue} />
            <ScoringNumber label="Character scale:    " number={result.currentSim.penaltyMultiplier} precision={3} />
            <ScoringNumber label="Ideal sim scale:    " number={result.maxSim.penaltyMultiplier} precision={3} />
            <ScoringNumber label="Baseline sim scale: " number={result.baselineSim.penaltyMultiplier} precision={3} />
            <ScoringNumber label="Percentage:         " number={result.percent * 100} precision={2} />
          </Flex>
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: 'auto' }}>
            Substat upgrade comparisons
          </pre>
          <ScoringStatUpgrades />
        </Flex>
      </Flex>

      <img src="https://i.imgur.com/mhNZxc8.png" style={{ marginTop: 10 }} />
    </Flex>
  )
}

export function ScoringTeammate(props: { result: SimulationScore; index: number }) {
  const teammate = props.result.metadata.teammates[props.index]
  const iconSize = 55
  return (
    <Flex vertical align="center" gap={2}>
      <img src={Assets.getCharacterAvatarById(teammate.characterId)} style={{ height: iconSize }} />
      <pre style={{ margin: 0 }}>
        {`E${teammate.characterEidolon}`}
      </pre>
      <img src={Assets.getLightConeIconById(teammate.lightCone)} style={{ height: iconSize }} />
      <pre style={{ margin: 0 }}>
        {`S${teammate.lightConeSuperimposition}`}
      </pre>
    </Flex>
  )
}

export function CharacterCardScoringStatUpgrades(props: { result: SimulationScore }) {
  const result = props.result
  const rows: ReactElement[] = []
  const currentScore = result.currentSim.SIM_SCORE
  const basePercent = result.percent
  const statUpgrades = result.statUpgrades.filter((x) => x.stat != Stats.SPD)

  for (const x of statUpgrades) {
    const statUpgrade: SimulationStatUpgrade = x
    const stat = statUpgrade.stat
    const isFlat = Utils.isFlat(statUpgrade.stat)
    const suffix = isFlat ? '' : '%'
    const rollValue = Utils.precisionRound(StatCalculator.getMaxedSubstatValue(stat, 0.8))
    // const simStatValue = Utils.precisionRound(statUpgrade.simulationResult[stat]) * (isFlat ? 1 : 100)

    rows.push(
      <Flex key={Utils.randomId()} justify="space-between" align="center" style={{ width: '100%' }}>
        <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }} />
        <StatText>{`+1x ${StatsToShortSpaced[statUpgrade.stat]}`}</StatText>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
        <StatText>{`+ ${((statUpgrade.percent! - basePercent) * 100).toFixed(2)}%`}</StatText>
      </Flex>,
    )
  }
  //  =>  ${(statUpgrade.percent! * 100).toFixed(2)}%
  return (
    <Flex vertical gap={3} align="center" style={{ paddingLeft: 6, paddingRight: 8, marginBottom: 5 }}>
      {rows}
    </Flex>
  )
}
