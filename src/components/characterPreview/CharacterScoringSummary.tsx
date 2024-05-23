import { Divider, Flex, Typography } from 'antd'
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

const { Text } = Typography

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

  function ScoringDetails() {
    return (
      <Flex vertical style={{ marginTop: 20, width: 1000 }}>
        <h1 style={{ margin: 'auto' }}>DPS Score Calculation</h1>
        <Text style={{ fontSize: 18 }}>
          <h2>
            What is DPS Score?
          </h2>
          <p>
            DPS Score is a damage simulation based metric for accurately scoring a
            character's <i>damage performance in combat</i>.
          </p>
          <p>
            This score is calculated using the results of simulating the character's damage performance through the optimizer,
            for a more accurate evaluation than scores based solely on displayed stats.
          </p>
          <p>
            The scoring calculation takes into consideration:
          </p>
          <ul>
            <li>Character eidolons / light cone / superimpositions</li>
            <li>Teammate eidolons / light cone / superimpositions</li>
            <li>Combat passives and buffs from abilities and light cones</li>
            <li>Team composition and teammate synergies</li>
            <li>Character ability rotations</li>
            <li>Stat breakpoints</li>
            <li>Stat overcapping</li>
            <li>Relic set effects</li>
            <li>Super break</li>
            <li>... and more</li>
          </ul>

          <h2>
            How is it calculated?
          </h2>
          <p>
            At its heart, this score is calculated using a Basic / Skill / Ult / FuA / DoT / Break
            ability damage rotation, which is defined per character. These simulations use the character and teammates'
            default optimizer conditional settings, and the damage sum is used to compare between builds.
          </p>

          <h4>
            Benchmark character generation
          </h4>
          <p>
            The original character build is measured against a simulated benchmark character with an ideal distribution of stats,
            which is generated following certain rules to produce a realistic stat build:
          </p>

          <ul style={{ lineHeight: '32px' }}>
            <li>The default damage simulation uses a common team composition and the character's BiS relic + ornament set</li>
            <li>The benchmark uses the same eidolon and superimposition as the original character, at level 80 and maxed traces</li>
            <li>The benchmark has 4 main stats and 50 total substats: 9 from head / hands, 8 from body / feet / sphere / rope</li>
            <li>Each substat is equivalent to a 5 star relic's low roll value</li>
            <li>First, 2 substats are allocated to each substat type, except for Speed, leaving 28 open substats</li>
            <li>Enough substats are then allocated to Speed to match the original character's in-combat Speed</li>
            <li>The remaining substats are then distributed to the other stats options to maximize the build's damage output</li>
            <li>The resulting build must be a substat distribution that is possible to make with the in-game sub and main stat
              restrictions (For example, relics with a main stat cannot also have the same substat, and no duplicate substat slots per piece, etc)
            </li>
          </ul>

          <p>
            This process is repeated through all the possible main stat permutations and substat distributions until the highest damage simulation
            is found. This build's score is then used as the standard for a 100% DPS Score.
          </p>

          <h4>
            Score normalization
          </h4>
          <p>
            All simulation scores are normalized by deducting a baseline damage simulation. The baseline uses the same eidolon and light cone, but no main
            stats and only 2 substats distributed to each of the stats except speed. This adjusts for the base amount of damage that a character's kit deals,
            so that the DPS Score can then measure the resulting damage contribution of each additional substat.
          </p>

          <h4>
            Stat breakpoint penalty
          </h4>
          <p>
            Certain characters will have breakpoints that are forced. For example, 120% combat EHR on Black Swan to maximize her passive EHR to DMG conversion, and to land
            Arcana stacks. Failing to reach the breakpoint will penalize the DPS Score by half the missing
            percentage: <code>dmg scale = min(1, (breakpoint - combat stat) / (breakpoint) * (1/2))</code>. This penalty applies to both the
            original character and the benchmark simulations.
          </p>

          <h4>
            Formula
          </h4>
          <p>
            The resulting formula is <code>DMG Score % = (original dmg - baseline dmg) / (ideal benchmark dmg - baseline dmg)</code>
          </p>

          <h3>
            What are the grade thresholds?
          </h3>

          <p>
            DPS Score is still experimental so scores and grading may be subject to change. These are the current thresholds.
          </p>

          <pre style={{ width: 500 }}>
            <Flex>
              <ul style={{ width: 250 }}>
                <li>WTF+ = 120%</li>
                <li>WTF  = 115%</li>
                <li>SSS+ = 110%</li>
                <li>SSS  = 105%</li>
                <li>SS+  = 100%</li>
                <li>SS   = 95%</li>
                <li>S+   = 90%</li>
                <li>S    = 85%</li>
                <li>A+   = 80%</li>
              </ul>
              <ul>
                <li>A  = 75%</li>
                <li>B+ = 70%</li>
                <li>B  = 65%</li>
                <li>C+ = 60%</li>
                <li>C  = 55%</li>
                <li>D+ = 50%</li>
                <li>D  = 45%</li>
                <li>F+ = 40%</li>
                <li>F  = 35%</li>
              </ul>

            </Flex>
          </pre>
        </Text>
      </Flex>
    )
  }

  return (
    <Flex vertical gap={20}>
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
            Benchmark basic stats
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
            Benchmark <u>combat stats</u>
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
            <ScoringNumber label="Benchmark DMG:      " number={result.maxSim.result.SIM_SCORE} />
            <ScoringNumber label="Baseline DMG        " number={result.baselineSimValue} />
            <ScoringNumber label="Character scale:    " number={result.currentSim.penaltyMultiplier} precision={3} />
            <ScoringNumber label="Benchmark scale:    " number={result.maxSim.result.penaltyMultiplier} precision={3} />
            <ScoringNumber label="Baseline scale:     " number={result.baselineSim.penaltyMultiplier} precision={3} />
            <ScoringNumber label="DPS score %:        " number={result.percent * 100} precision={2} />
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

      <Flex vertical gap={defaultGap}>
        <ScoringDetails />
      </Flex>
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
  for (const x of statUpgrades.slice(0, 5)) {
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
