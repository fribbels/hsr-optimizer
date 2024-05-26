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
import { HeaderText } from 'components/HeaderText'

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
      <Flex vertical style={{ marginTop: 80, width: 1000 }}>
        <h1 style={{ margin: 'auto' }}>DPS Score Calculation (Beta)</h1>
        <Text style={{ fontSize: 18 }}>
          <h2>
            What is DPS Score?
          </h2>
          <p>
            DPS Score is a damage simulation based metric for accurately scoring a
            character's <i>damage performance in combat</i>.
          </p>
          <p>
            This score is calculated using the results of simulating the character's damage through the optimizer,
            for a more accurate evaluation than scores based solely on the displayed stats.
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
            ability damage rotation defined per character. These simulations use the optimizer's default conditional settings
            for the character / teammates / light cones / sets, and the damage sum is then used to compare between builds.
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
            <li>The benchmark has 4 main stats and 54 total substats: 9 from each gear slot</li>
            <li>Each substat is equivalent to a 5 star relic's low roll value</li>
            <li>First, 3 substats are allocated to each substat type, except for Speed</li>
            <li>Substats are then allocated to Speed to match the original character's in-combat Speed</li>
            <li>The remaining substats are then distributed to the other stats options to maximize the build's damage output</li>
            <li>The resulting build must be a substat distribution that is possible to make with the in-game sub and main stat
              restrictions (For example, relics with a main stat cannot also have the same substat, and no duplicate substat slots per piece, etc)
            </li>
          </ul>

          <p>
            This process is repeated through all the possible main stat permutations and substat distributions until the highest damage simulation
            is found. That build's damage is then used as the standard for a 100% DPS Score.
          </p>

          <h4>
            Score normalization
          </h4>
          <p>
            All simulation scores are normalized by deducting a baseline damage simulation. The baseline uses the same eidolon and light cone, but no main
            stats and only 3 substats distributed to each of the stats except speed. This adjusts for the base amount of damage that a character's kit deals,
            so that the DPS Score can then measure the resulting damage contribution of each additional substat.
          </p>

          <h4>
            Relic / ornament sets
          </h4>
          <p>
            Each character has a defined BiS set, and a few other equivalent sets that can be considered similar in performance. If the original character's
            sets matches any of the acceptable sets, the character will be scored against a benchmark generated matching that set, otherwise the original character will be scored against the BiS.
          </p>

          <h4>
            Stat breakpoint penalty
          </h4>
          <p>
            Certain characters will have breakpoints that are forced. For example, 120% combat EHR on Black Swan to maximize her passive EHR to DMG conversion, and to land
            Arcana stacks. Failing to reach the breakpoint will penalize the DPS Score for the missing percentage. This penalty applies to both the
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
                <li>WTF+ = 125%</li>
                <li>WTF  = 120%</li>
                <li>SSS+ = 115%</li>
                <li>SSS  = 110%</li>
                <li>SS+  = 105%</li>
                <li>SS   = 100%</li>
                <li>S+   = 95%</li>
                <li>S    = 90%</li>
                <li>A+   = 85%</li>
              </ul>
              <ul>
                <li>A  = 80%</li>
                <li>B+ = 75%</li>
                <li>B  = 70%</li>
                <li>C+ = 65%</li>
                <li>C  = 60%</li>
                <li>D+ = 55%</li>
                <li>D  = 50%</li>
                <li>F+ = 45%</li>
                <li>F  = 40%</li>
              </ul>
            </Flex>
          </pre>

          <h2>FAQs</h2>

          <h4>Why does the sim match Speed?</h4>
          <p>
            Speed is controlled separately from the other stats because comparing builds between different speed thresholds
            introduces a lot of complexity to the calculations. For example higher speed can actually result in lower damage with
            Bronya as a teammate if the Speed tuning is thrown off. To simplify the comparisons, we equalize the Speed variable by using
            the sim's substats to match the original character's combat speed.
          </p>

          <h4>What's the reasoning behind the benchmark simulation rules?</h4>
          <p>
            The simulation rules were designed to create a realistic benchmark build for 100% DPS Score, which should be difficult to achieve yet possible
            with character investment. After trialing many methodologies for generating simulation stats, this set of rules produced the most
            consistent and reasonable 100% benchmarks across all characters and builds.
          </p>

          <p>
            The spread of 3 substats across all stat options provides some baseline consistency, and simulates how substats are
            imperfectly distributed in actual player builds. The spread rolls also help to balance out characters that are more stat hungry and
            require multiple stats to be effective, vs characters that only need two or three stats.
          </p>

          <h4>Why are the scores different for different teams?</h4>
          <p>
            Team buffs and synergy will change the ideal benchmark simulation's score. For example, a benchmark sim with Fu Xuan on
            the team may invest more substats into Crit DMG instead of Crit Rate since her passive Crit Rate will change the optimal
            distribution of crit rolls. Teams can be customized to fit the actual teammates used for the character ingame.
          </p>

          <h4>Why are certain stat breakpoints forced?</h4>
          <p>
            The only forced breakpoints currently are Effect Hit Rate minimums for DoT characters.
            Take Black Swan for example, the purpose of forcing the sim to use her 120% breakpoint is so it can't just ignore EHR
            to chase more maximum DoT damage. EHR is more than just DMG conversion as it also lets her land Arcana debuffs to reach her 7th Arcana stack
            for DEF pen. The penalty is calculated as a 1% deduction per missing roll from the breakpoint.
          </p>
          <p>
            <code>dmg scale = min(1, (breakpoint - combat stat) / (min stat value))</code>
          </p>

          <h4>How were the default simulation teams / sets chosen?</h4>
          <p>
            The defaults come from a combination of usage statistics and community guidance. Best in slot sets and teammates will change
            with new game updates, so the default parameters may also change. Please visit the Discord server for suggestions and feedback on the scoring design.
          </p>

          <h4>Why is a character scoring low?</h4>
          <p>
            The `DPS score improvements` section will give a quick overview of the sets and stats that could be improved. For a more detailed explanation,
            the full simulation is detailed below the character card, including the benchmark character's stat distribution, basic stats, combat stats, and main stats.
            Comparing the original character's stats to the benchmark character's stats is helpful to show the difference in builds and see where to improve.
          </p>

          <p>
            An often underestimated component of the build is completed BiS set effects. Set effects can play a large part in optimizing a character's potential damage output
            and rainbow or broken sets will often score worse than full sets.
          </p>
        </Text>
      </Flex>
    )
  }

  // We clone stats to make DMG % a combat stat, since it the stat preview only cares about elemental stat not all type
  const combatStats = Utils.clone(result.currentSim.x)
  combatStats[elementalDmgValue] = combatStats.ELEMENTAL_DMG

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
              <ScoringSet set={result.maxSim.request.simRelicSet1} />
              <ScoringSet set={result.maxSim.request.simRelicSet2} />
            </Flex>

            <ScoringSet set={result.maxSim.request.simOrnamentSet} />
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
        <Flex vertical gap={defaultGap} style={{ width: 250 }}>
          <pre style={{ margin: 'auto' }}>
            Character basic stats
          </pre>
          <CharacterStatSummary finalStats={result.currentSim} elementalDmgValue={elementalDmgValue} hideCv={true} />
        </Flex>

        <Flex vertical>
          <Divider type="vertical" style={{ flexGrow: 1, margin: '2px 2px' }} />
        </Flex>

        <Flex vertical gap={defaultGap} style={{ width: 250 }}>
          <pre style={{ margin: 'auto' }}>
            Benchmark basic stats
          </pre>
          <CharacterStatSummary finalStats={result.maxSim.result} elementalDmgValue={elementalDmgValue} hideCv={true} />
        </Flex>

        <Flex vertical>
          <Divider type="vertical" style={{ flexGrow: 1, margin: '2px 20px', borderInlineWidth: 3 }} />
        </Flex>

        <Flex vertical gap={defaultGap} style={{ width: 250 }}>
          <pre style={{ margin: 'auto' }}>
            Character <u>combat stats</u>
          </pre>
          <CharacterStatSummary finalStats={combatStats} elementalDmgValue={elementalDmgValue} hideCv={true} />
        </Flex>

        <Flex vertical>
          <Divider type="vertical" style={{ flexGrow: 1, margin: '2px 2px' }} />
        </Flex>

        <Flex vertical gap={defaultGap} style={{ width: 250 }}>
          <pre style={{ margin: 'auto' }}>
            Benchmark <u>combat stats</u>
          </pre>
          <CharacterStatSummary
            finalStats={combatStats} elementalDmgValue={elementalDmgValue}
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
              54x substats sim results
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
          <pre style={{ marginLeft: 'auto', marginRight: 'auto' }}>
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

  const setUpgrade = result.setUpgrades[0]
  if (setUpgrade.percent! - basePercent > 0) {
    rows.splice(4, 1)
    rows.push(
      <Flex gap={3} key={Utils.randomId()} justify="space-between" align="center" style={{ width: '100%', paddingLeft: 1 }}>
        <img src={Assets.getSetImage(setUpgrade.simulation.request.simRelicSet1)} style={{ width: iconSize, height: iconSize, marginRight: 3 }} />
        <img src={Assets.getSetImage(setUpgrade.simulation.request.simRelicSet2)} style={{ width: iconSize, height: iconSize, marginRight: 10 }} />
        <img src={Assets.getSetImage(setUpgrade.simulation.request.simOrnamentSet)} style={{ width: iconSize, height: iconSize, marginRight: 3 }} />
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
        <StatText>{`+ ${((setUpgrade.percent! - basePercent) * 100).toFixed(2)}%`}</StatText>
      </Flex>,
    )
  }

  console.debug(setUpgrade)

  //  =>  ${(statUpgrade.percent! * 100).toFixed(2)}%
  return (
    <Flex vertical gap={3} align="center" style={{ paddingLeft: 6, paddingRight: 8, marginBottom: 5 }}>
      <Flex vertical align="center">
        <HeaderText style={{ fontSize: 16, marginBottom: 2 }}>
          DPS score improvements
        </HeaderText>
      </Flex>
      {rows}
    </Flex>
  )
}
