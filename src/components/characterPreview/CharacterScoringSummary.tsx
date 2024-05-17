import { Flex } from 'antd'
import { defaultGap } from 'lib/constantsUi'
import { SimulationScore, SimulationStatUpgrade } from 'lib/characterScorer'
import { ElementToDamage, Parts, Stats, StatsToShort } from 'lib/constants'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
import { CharacterStatSummary } from 'components/characterPreview/CharacterStatSummary'
import { VerticalDivider } from 'components/Dividers'
import DB from 'lib/db'
import { ReactElement } from 'react'
import { StatCalculator } from 'lib/statCalculator'

export const CharacterScoringSummary = (props: { simScoringResult: SimulationScore }) => {
  const result = Utils.clone(props.simScoringResult)
  if (!result) return ("")

  console.debug('stat sim result', result, props.characterStats)

  // Clean up some spammy data
  delete result.sims
  delete result.maxSim.key

  const characterId = result.currentRequest.characterId
  const characterMetadata = DB.getMetadata().characters[characterId]
  const elementalDmgValue = ElementToDamage[characterMetadata.element]


  function ScoringTeammate(props: { index: number }) {
    const teammate = result.metadata.teammates[props.index]
    return (
      <Flex vertical align="center" gap={2}>
        <img src={Assets.getCharacterAvatarById(teammate.characterId)} style={{height: 60}}/>
        <pre style={{margin: 0}}>
          {`E${teammate.characterEidolon}`}
        </pre>
        <img src={Assets.getLightConeIconById(teammate.lightCone)} style={{height: 60}}/>
        <pre style={{margin: 0}}>
          {`S${teammate.lightConeSuperimposition}`}
        </pre>
      </Flex>
    )
  }

  function ScoringSet(props: { set: string }) {
    return (
      <Flex vertical align="center" gap={2}>
        <img src={Assets.getSetImage(props.set)} style={{height: 60}}/>
      </Flex>
    )
  }

  function ScoringStat(props: { stat: string, part: string }) {
    return (
      <Flex align="center" gap={10}>
        <img src={Assets.getPart(props.part)} style={{height: 30}}/>
        <pre style={{margin: 0}}>{props.stat.replace('Boost', '')}</pre>
      </Flex>
    )
  }

  function ScoringNumber(props: { label: string, number: number, precision?: number }) {
    const precision = props.precision ?? 1
    const show = props.number != 0
    return (
      <Flex align="center" gap={15}>
        <pre style={{margin: 0}}>{props.label}</pre>
        <pre style={{margin: 0}}>{show && props.number.toFixed(precision)}</pre>
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
        <Flex key={Utils.randomId()} align='center' gap={10}>
          <img src={Assets.getStatIcon(stat)} style={{height: 30}}/>
          <pre
            style={{
              margin: 0,
              width: 200
            }}>{`+1x roll: ${StatsToShort[statUpgrade.stat]} +${rollValue.toFixed(1)}${suffix}`}
          </pre>
          <pre style={{margin: 0, width: 250}}>
            {`Score: +${((statUpgrade.percent! - basePercent) * 100).toFixed(2)}%  =>  ${(statUpgrade.percent! * 100).toFixed(2)}%`}
          </pre>
          <pre style={{margin: 0, width: 250}}>
            {`Damage: +${(statUpgrade.SIM_SCORE - currentScore).toFixed(1)}  =>  ${statUpgrade.SIM_SCORE.toFixed(1)}`}
          </pre>
        </Flex>
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
      <div style={{minHeight: 10}}/>

      <Flex gap={20}>
        <Flex vertical gap={defaultGap}>
          <pre style={{margin: 'auto'}}>
            Sim teammates
          </pre>
          <Flex gap={defaultGap}>
            <ScoringTeammate index={0}/>
            <ScoringTeammate index={1}/>
            <ScoringTeammate index={2}/>
          </Flex>
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={defaultGap}>
          <pre style={{margin: '0 auto'}}>
            Sim sets
          </pre>
          <Flex vertical gap={defaultGap}>
            <Flex>
              <ScoringSet set={result.metadata.relicSet1}/>
              <ScoringSet set={result.metadata.relicSet2}/>
            </Flex>

            <ScoringSet set={result.metadata.ornamentSet}/>
          </Flex>
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={defaultGap}>
          <pre style={{margin: '0 auto'}}>
            Formula
          </pre>
          <Flex vertical gap={defaultGap}>
            <ScoringNumber label='BASIC: ' number={result.metadata.formula.BASIC} precision={0}/>
            <ScoringNumber label='SKILL: ' number={result.metadata.formula.SKILL} precision={0}/>
            <ScoringNumber label='ULT:   ' number={result.metadata.formula.ULT} precision={0}/>
            <ScoringNumber label='DOT:   ' number={result.metadata.formula.DOT} precision={0}/>
            <ScoringNumber label='FUA:   ' number={result.metadata.formula.FUA} precision={0}/>
            <ScoringNumber label='BREAK: ' number={result.metadata.formula.BREAK} precision={0}/>
          </Flex>
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={defaultGap}>
          <pre style={{margin: '0 auto'}}>
            Sim main stats
          </pre>
          <Flex vertical gap={defaultGap}>
            <ScoringStat stat={result.maxSim.request.simBody} part={Parts.Body}/>
            <ScoringStat stat={result.maxSim.request.simFeet} part={Parts.Feet}/>
            <ScoringStat stat={result.maxSim.request.simPlanarSphere} part={Parts.PlanarSphere}/>
            <ScoringStat stat={result.maxSim.request.simLinkRope} part={Parts.LinkRope}/>
          </Flex>
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={defaultGap}>
          <pre style={{margin: '0 auto'}}>
            Sim substats
          </pre>
          <Flex gap={50}>
            <Flex vertical gap={defaultGap}>
              <ScoringNumber label='ATK%: ' number={result.maxSim.request.stats[Stats.ATK_P]} precision={0}/>
              <ScoringNumber label='ATK:  ' number={result.maxSim.request.stats[Stats.ATK]} precision={0}/>
              <ScoringNumber label='HP%:  ' number={result.maxSim.request.stats[Stats.HP_P]} precision={0}/>
              <ScoringNumber label='HP:   ' number={result.maxSim.request.stats[Stats.HP]} precision={0}/>
              <ScoringNumber label='DEF%: ' number={result.maxSim.request.stats[Stats.DEF_P]} precision={0}/>
              <ScoringNumber label='DEF:  ' number={result.maxSim.request.stats[Stats.DEF]} precision={0}/>
            </Flex>
            <Flex vertical gap={defaultGap}>
              <ScoringNumber label='SPD:  ' number={result.maxSim.request.stats[Stats.SPD]} precision={2}/>
              <ScoringNumber label='CR:   ' number={result.maxSim.request.stats[Stats.CR]} precision={0}/>
              <ScoringNumber label='CD:   ' number={result.maxSim.request.stats[Stats.CD]} precision={0}/>
              <ScoringNumber label='EHR:  ' number={result.maxSim.request.stats[Stats.EHR]} precision={0}/>
              <ScoringNumber label='RES:  ' number={result.maxSim.request.stats[Stats.RES]} precision={0}/>
              <ScoringNumber label='BE:   ' number={result.maxSim.request.stats[Stats.BE]} precision={0}/>
            </Flex>
          </Flex>
        </Flex>

      </Flex>

      <Flex>
        <Flex vertical gap={defaultGap} style={{width: 225}}>
          <pre style={{margin: 'auto'}}>
            Character basic stats
          </pre>
          <CharacterStatSummary finalStats={result.currentSim} elementalDmgValue={elementalDmgValue} hideCv={true}/>
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={defaultGap} style={{width: 225}}>
          <pre style={{margin: 'auto'}}>
            Ideal sim basic stats
          </pre>
          <CharacterStatSummary finalStats={result.maxSim.result} elementalDmgValue={elementalDmgValue} hideCv={true}/>
        </Flex>

        <Flex style={{width: 120}} justify='space-around'>
          <VerticalDivider/>
        </Flex>

        <Flex vertical gap={defaultGap} style={{width: 225}}>
          <pre style={{margin: 'auto'}}>
            Character <u>combat stats</u>
          </pre>
          <CharacterStatSummary finalStats={result.currentSim.x} elementalDmgValue={elementalDmgValue} hideCv={true}/>
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={defaultGap} style={{width: 225}}>
          <pre style={{margin: 'auto'}}>
            Ideal sim <u>combat stats</u>
          </pre>
          <CharacterStatSummary finalStats={result.maxSim.result.x} elementalDmgValue={elementalDmgValue}
                                hideCv={true}/>
        </Flex>
      </Flex>

      <Flex gap={defaultGap}>
        <Flex vertical gap={10}>
          <pre style={{margin: '0 auto'}}>
            Scoring
          </pre>
          <Flex vertical gap={10}>
            <pre style={{margin: 'auto 0'}}>
              Ideal 42x min substats sim
            </pre>
            <ScoringNumber label='Character DMG:    ' number={result.currentSim.SIM_SCORE}/>
            <ScoringNumber label='Ideal sim DMG:    ' number={result.maxSim.result.SIM_SCORE}/>
            <ScoringNumber label='Character scale:  ' number={result.currentSim.penaltyMultiplier} precision={3}/>
            <ScoringNumber label='Ideal sim scale:  ' number={result.maxSim.penaltyMultiplier} precision={3}/>
            <ScoringNumber label='Percentage:       ' number={result.percent * 100} precision={2}/>
          </Flex>
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={defaultGap}>
          <pre style={{margin: 'auto'}}>
            Substat upgrade comparisons
          </pre>
          <ScoringStatUpgrades/>
        </Flex>
      </Flex>

      <img src='https://i.imgur.com/mhNZxc8.png' style={{marginTop: 10}}/>

      <pre>
        Summary:
        {
          JSON.stringify({
            formula: result.metadata.formula,
            relicSet1: result.metadata.relicSet1,
            relicSet2: result.metadata.relicSet2,
            ornamentSet: result.metadata.ornamentSet,
            bestSimMains: [result.metadata.bestSim.simBody, result.metadata.bestSim.simFeet, result.metadata.bestSim.simPlanarSphere, result.metadata.bestSim.simLinkRope].join(' | '),
            bestSimSubstats: result.metadata.bestSim.stats,
            bestSimFinalStats: {
              ATK: Math.floor(result.maxSim.result[Stats.ATK]),
              CR: Utils.truncate100ths(result.maxSim.result[Stats.CR] * 100),
              CD: Utils.truncate100ths(result.maxSim.result[Stats.CD] * 100),
              SPD: Utils.truncate100ths(result.maxSim.result[Stats.SPD]),
              BE: Utils.truncate100ths(result.maxSim.result[Stats.BE] * 100),
              EHR: Utils.truncate100ths(result.maxSim.result[Stats.EHR] * 100),
              BASIC: Math.floor(result.maxSim.result.BASIC),
              SKILL: Math.floor(result.maxSim.result.SKILL),
              ULT: Math.floor(result.maxSim.result.ULT),
              DOT: Math.floor(result.maxSim.result.DOT),
              FUA: Math.floor(result.maxSim.result.FUA),
              BREAK: Math.floor(result.maxSim.result.BREAK),
            },
          }, null, 2)
        }
      </pre>
      <pre>
        Complete simulation:
        {
          JSON.stringify(result, null, 2)
        }
      </pre>
    </Flex>
  )
}
