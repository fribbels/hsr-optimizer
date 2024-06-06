import { Divider, Flex, Typography } from 'antd'
import { defaultGap, iconSize } from 'lib/constantsUi'
import { SimulationScore, SimulationStatUpgrade } from 'lib/characterScorer'
import { ElementToDamage, Parts, Stats, StatsToReadable, StatsToShort, StatsToShortSpaced } from 'lib/constants'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
import { CharacterStatSummary } from 'components/characterPreview/CharacterStatSummary'
import { VerticalDivider } from 'components/Dividers'
import DB from 'lib/db'
import React, { ReactElement } from 'react'
import { StatCalculator } from 'lib/statCalculator'
import StatText from 'components/characterPreview/StatText'
import { HeaderText } from 'components/HeaderText'
import { TsUtils } from 'lib/TsUtils'
import { Simulation } from 'lib/statSimulationController'

const { Text } = Typography

export const CharacterScoringSummary = (props: { simScoringResult: SimulationScore }) => {
  const result = TsUtils.clone(props.simScoringResult)
  if (!result) return (
    <pre style={{ height: 200 }}>
      {' '}
    </pre>
  )

  const characterId = result.simulationForm.characterId
  const characterMetadata = DB.getMetadata().characters[characterId]
  const elementalDmgValue: string = ElementToDamage[characterMetadata.element]

  function ScoringSet(props: { set: string }) {
    return (
      <Flex vertical align="center" gap={2}>
        <img src={Assets.getSetImage(props.set)} style={{ height: 60 }} />
      </Flex>
    )
  }

  function ScoringStat(props: { stat: string; part: string }) {
    const display = props.stat?.replace('Boost', '') || ''
    return (
      <Flex align="center" gap={10}>
        <img src={Assets.getPart(props.part)} style={{ height: 30 }} />
        <pre style={{ margin: 0 }}>{display}</pre>
      </Flex>
    )
  }

  function ScoringNumber(props: { label: string; number: number; precision?: number }) {
    const precision = props.precision ?? 1
    const value = props.number ?? 0
    const show = value != 0
    return (
      <Flex align="center" gap={15}>
        <pre style={{ margin: 0 }}>{props.label}</pre>
        <pre style={{ margin: 0 }}>{show && value.toFixed(precision)}</pre>
      </Flex>
    )
  }

  function ScoringStatUpgrades() {
    const rows: ReactElement[] = []
    const originalScore = result.originalSimScore
    const basePercent = result.percent

    for (const substatUpgrade of result.substatUpgrades) {
      const statUpgrade: SimulationStatUpgrade = substatUpgrade
      const upgradeSimScore = statUpgrade.simulationResult.simScore
      const upgradePercent = statUpgrade.percent!
      const upgradeStat = statUpgrade.stat!
      const isFlat = Utils.isFlat(statUpgrade.stat)
      const suffix = isFlat ? '' : '%'
      const rollValue = Utils.precisionRound(StatCalculator.getMaxedSubstatValue(upgradeStat, 0.8))

      rows.push(
        <Flex key={Utils.randomId()} align="center" gap={5}>
          <img src={Assets.getStatIcon(upgradeStat)} style={{ height: 30 }} />
          <pre
            style={{
              margin: 0,
              width: 200,
            }}
          >{`+1x roll: ${StatsToShort[upgradeStat]} +${rollValue.toFixed(1)}${suffix}`}
          </pre>
          <pre style={{ margin: 0, width: 250 }}>
            {`Score: +${((upgradePercent - basePercent) * 100).toFixed(2)}% -> ${(statUpgrade.percent! * 100).toFixed(2)}%`}
          </pre>
          <pre style={{ margin: 0, width: 250 }}>
            {`Damage: +${(upgradeSimScore - originalScore).toFixed(1)} -> ${upgradeSimScore.toFixed(1)}`}
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
            This score is calculated by using the optimizer to simulate the character's combat stats and rates the build based on
            how much the relics contribute to damage, for a more accurate evaluation than scores based solely on stat weights.
          </p>
          <p>
            The scoring calculation takes into consideration:
          </p>
          <ul>
            <li>Character eidolons / light cone / superimpositions</li>
            <li>Teammate eidolons / light cone / superimpositions</li>
            <li>Combat passives and buffs from abilities and light cones</li>
            <li>Team composition and teammate buffs</li>
            <li>Character ability rotations</li>
            <li>Stat breakpoints</li>
            <li>Stat overcapping</li>
            <li>Relic set effects</li>
            <li>Super break</li>
            <li>...etc</li>
          </ul>

          <h2>
            How is it calculated?
          </h2>
          <p>
            At its heart, this score is calculated using a Basic / Skill / Ult / FuA / DoT / Break
            ability damage rotation defined per character. These simulations use the optimizer's default conditional settings
            for the character / teammates / light cones / relic sets, and the damage sum is then used to compare between builds.
          </p>

          <h4>
            Simulation benchmarks
          </h4>

          <p>
            The scoring algorithm generates three builds to measure the damage of the original character against.
          </p>

          <ul style={{ lineHeight: '32px' }}>
            <li>Baseline (0%) - No substats, no main stats</li>
            <li>
              Benchmark (100%) - A strong build, generated following certain rules with a realistic distribution of 48x min rolls
            </li>
            <li>Perfection (200%) - The perfect build, generated with an ideal distribution of 54x max rolled substats</li>
          </ul>

          <p>
            The original character's build is scored based on how its damage compares to the benchmark percentages.
            The benchmark and perfection builds will always match the original character's speed.
          </p>

          <h4>
            100% benchmark ruleset
          </h4>

          <p>
            The 100% benchmark character is designed to be a strong and realistic build that is difficult to reach,
            but attainable with some character investment into relic farming. The following ruleset defines how the build is generated and why it differs from the perfect build.
          </p>

          <ul style={{ lineHeight: '32px' }}>
            <li>The default damage simulation uses a common team composition and the character's BiS relic + ornament set</li>
            <li>The 100% benchmark uses the same eidolon and superimposition as the original character, at level 80 and maxed traces</li>
            <li>The 100% benchmark has 4 main stats and 48 total substats: 8 from each gear slot</li>
            <li>Each substat is equivalent to a 5 star relic's low roll value, except for speed which uses mid rolls</li>
            <li>First, 2 substats are allocated to each substat type, except for Speed</li>
            <li>Substats are then allocated to Speed to match the original character's in-combat Speed</li>
            <li>The remaining substats are then distributed to the other stats options to maximize the build's damage output</li>
            <li>The resulting build must be a substat distribution that is possible to make with the in-game sub and main stat
              restrictions (For example, relics with a main stat cannot also have the same substat, and no duplicate substat slots per piece, etc)
            </li>
            <li>An artificial diminishing returns penalty is applied to substats with greater than <code>18 - (3 * main stats)</code> rolls, to simulate the difficulty of obtaining multiple rolls in a single stat</li>
          </ul>

          <p>
            This process is repeated through all the possible main stat permutations and substat distributions until the highest damage simulation
            is found. That build's damage is then used as the standard for a 100% DPS Score.
          </p>

          <h4>
            200% benchmark ruleset
          </h4>

          <p>
            The 200% perfection character follows a similar generation process with a few differences.
          </p>

          <ul style={{ lineHeight: '32px' }}>
            <li>54x max roll substats</li>
            <li>No diminishing returns penalty</li>
            <li>All substats are ideally distributed, but the build must still be possible to make</li>
          </ul>

          <h4>
            Score normalization
          </h4>
          <p>
            All simulation scores are normalized by deducting a baseline damage simulation. The baseline uses the same eidolon and light cone, but no main
            stats and no substats. This adjusts for the base amount of damage that a character's kit deals,
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
            original character and the benchmark simulations but not the baseline.
          </p>

          <h4>
            Formula
          </h4>
          <p>
            The resulting formula is:
          </p>

          <ul>
            <li>If DMG  &lt; 100% benchmark</li>
            <ul style={{ paddingLeft: 20 }}>
              <li>
                <code>DMG Score = (character dmg - 0% baseline dmg) / (100% benchmark dmg - 0% baseline dmg)</code>
              </li>
            </ul>
          </ul>
          <ul>
            <li>If DMG ≥ 100% benchmark</li>
            <ul style={{ paddingLeft: 20 }}>
              <li>
                <code>DMG Score = 1 + (character dmg - 100% benchmark dmg) / (200% perfect dmg - 100% benchmark dmg)</code>
              </li>
            </ul>
          </ul>

          <h3>
            What are the grade thresholds?
          </h3>

          <p>
            Grading is based on the benchmark as 100%.
          </p>

          <pre style={{ width: 500 }}>
            <Flex>
              <ul style={{ width: 300 }}>
                <li>WTF+ = 135% ↑ 9%</li>
                <li>WTF  = 126% ↑ 8%</li>
                <li>SSS+ = 118% ↑ 7%</li>
                <li>SSS  = 111% ↑ 6%</li>
                <li>SS+  = 105% ↑ 5%</li>
                <li>SS   = 100% [Benchmark]</li>
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
            Speed is controlled separately from the other stats because damage isn't comparable between different speed thresholds.
            For example, higher speed can actually result in lower damage with Bronya as a teammate if the Speed tuning is thrown off.
            To make damage comparisons fair, we equalize the Speed variable by forcing the sim's substats to match the original character's combat speed.
          </p>

          <h4>Why does a build score lower even though it has higher Sim Damage?</h4>
          <p>
            The benchmark sims have to equalize speed, so if the higher damage build has lower speed, then it will be compared to benchmark builds at that same lower speed, and therefore may score lower.
            In general this means that the sim will reallocate every reduced speed roll into a damage stat instead.
          </p>

          <h4>What's the reasoning behind the benchmark simulation rules?</h4>
          <p>
            The simulation rules were designed to create a realistic benchmark build for 100% DPS Score, which should be difficult to achieve yet possible
            with character investment. After trialing many methodologies for generating simulation stats, this set of rules produced the most
            consistent and reasonable 100% benchmarks across all characters and builds.
          </p>

          <p>
            The spread of 2 substats across all stat options provides some baseline consistency, and simulates how substats are
            imperfectly distributed in actual player builds. The spread rolls also help to balance out characters that are more stat hungry and
            require multiple stats to be effective, vs characters that only need two or three stats.
          </p>

          <p>
            Applying diminishing returns to high stacking substats is a way to make the benchmark fair for characters that primarily scale off
            of a single stat, for example Boothill and break effect. The ideal distribution will want every relic roll to go into break effect, but stacking
            5x rolls of a single stat on a relic is extremely rare / unrealistic in practice, so the simulation rules add diminishing returns to account for that.
          </p>

          <h4>Why are the scores different for different teams?</h4>
          <p>
            Team buffs and synergy will change the ideal benchmark simulation's score. For example, a benchmark sim with Fu Xuan on
            the team may invest more substats into Crit DMG instead of Crit Rate since her passive Crit Rate will change the optimal
            distribution of crit rolls. Teams should be customized to fit the actual teammates used for the character ingame for an accurate score.
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

  const originalBasicStats = TsUtils.clone(result.originalSimResult)
  const benchmarkBasicStats = TsUtils.clone(result.benchmarkSimResult)
  const maximumBasicStats = TsUtils.clone(result.maximumSimResult)

  const originalCombatStats = originalBasicStats.x
  const benchmarkCombatStats = benchmarkBasicStats.x
  const maximumCombatStats = maximumBasicStats.x

  originalBasicStats[elementalDmgValue] = originalBasicStats.ELEMENTAL_DMG
  benchmarkBasicStats[elementalDmgValue] = benchmarkBasicStats.ELEMENTAL_DMG
  maximumBasicStats[elementalDmgValue] = maximumBasicStats.ELEMENTAL_DMG

  originalCombatStats[elementalDmgValue] = originalCombatStats.ELEMENTAL_DMG
  benchmarkCombatStats[elementalDmgValue] = benchmarkCombatStats.ELEMENTAL_DMG
  maximumCombatStats[elementalDmgValue] = maximumCombatStats.ELEMENTAL_DMG

  const statPreviewWidth = 300
  const divider = (
    <Flex vertical>
      <Divider type="vertical" style={{ flexGrow: 1, margin: '10px 30px' }} />
    </Flex>
  )

  function ScoringColumn(props: {
    simulation: Simulation
    percent: number
    subText: string
    mainText: string
    basicText: string
    damageText: string
    statText: string
    nameText: string
    precision: number
  }) {
    const request = props.simulation.request
    const simResult = TsUtils.clone(props.simulation.result)
    const basicStats = simResult
    const combatStats = basicStats.x
    basicStats[elementalDmgValue] = basicStats.ELEMENTAL_DMG
    combatStats[elementalDmgValue] = combatStats.ELEMENTAL_DMG

    return (
      <Flex vertical gap={50}>
        <Flex vertical gap={defaultGap}>
          <Flex justify="space-around">
            <pre style={{ fontSize: 20, fontWeight: 'bold' }}>
              <u>{`${props.nameText} build (${Utils.truncate10ths(Utils.precisionRound(props.percent * 100))}%)`}</u>
            </pre>
          </Flex>

          <pre style={{ margin: '10px auto' }}>
            {props.subText}
          </pre>
          <Flex gap={5} justify="space-around">
            <Flex vertical gap={defaultGap} style={{ width: 120 }}>
              <ScoringNumber label="ATK%: " number={request.stats[Stats.ATK_P]} precision={props.precision} />
              <ScoringNumber label="ATK:  " number={request.stats[Stats.ATK]} precision={props.precision} />
              <ScoringNumber label="HP%:  " number={request.stats[Stats.HP_P]} precision={props.precision} />
              <ScoringNumber label="HP:   " number={request.stats[Stats.HP]} precision={props.precision} />
              <ScoringNumber label="DEF%: " number={request.stats[Stats.DEF_P]} precision={props.precision} />
              <ScoringNumber label="DEF:  " number={request.stats[Stats.DEF]} precision={props.precision} />
            </Flex>
            <Flex vertical gap={defaultGap} style={{ width: 100 }}>
              <ScoringNumber label="SPD:  " number={request.stats[Stats.SPD]} precision={2} />
              <ScoringNumber label="CR:   " number={request.stats[Stats.CR]} precision={props.precision} />
              <ScoringNumber label="CD:   " number={request.stats[Stats.CD]} precision={props.precision} />
              <ScoringNumber label="EHR:  " number={request.stats[Stats.EHR]} precision={props.precision} />
              <ScoringNumber label="RES:  " number={request.stats[Stats.RES]} precision={props.precision} />
              <ScoringNumber label="BE:   " number={request.stats[Stats.BE]} precision={props.precision} />
            </Flex>
          </Flex>
        </Flex>

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '0 auto' }}>
            {props.mainText}
          </pre>
          <Flex gap={defaultGap} justify="space-around">
            <Flex vertical gap={10}>
              <ScoringStat stat={StatsToReadable[request.simBody]} part={Parts.Body} />
              <ScoringStat stat={StatsToReadable[request.simPlanarSphere]} part={Parts.PlanarSphere} />
              <ScoringStat stat={StatsToReadable[request.simFeet]} part={Parts.Feet} />
              <ScoringStat stat={StatsToReadable[request.simLinkRope]} part={Parts.LinkRope} />
            </Flex>
          </Flex>
        </Flex>

        <Flex vertical gap={defaultGap} style={{ width: statPreviewWidth }}>
          <pre style={{ margin: 'auto' }}>
            {props.basicText}
          </pre>
          <CharacterStatSummary
            finalStats={basicStats}
            elementalDmgValue={elementalDmgValue}
            simScore={simResult.simScore}
          />
        </Flex>

        <Flex vertical gap={defaultGap} style={{ width: statPreviewWidth }}>
          <pre style={{ margin: 'auto' }}>
            {props.statText} <u>combat stats</u>
          </pre>
          <CharacterStatSummary
            finalStats={combatStats}
            elementalDmgValue={elementalDmgValue}
            simScore={simResult.simScore}
          />
        </Flex>

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '0 auto' }}>
            {props.damageText}
          </pre>
          <Flex gap={defaultGap} justify="space-around">
            <Flex vertical gap={10}>
              <ScoringNumber label="Basic DMG:           " number={simResult.BASIC} />
              <ScoringNumber label="Skill DMG:           " number={simResult.SKILL} />
              <ScoringNumber label="Ult DMG:             " number={simResult.ULT} />
              <ScoringNumber label="Fua DMG:             " number={simResult.FUA} />
              <ScoringNumber label="Dot DMG:             " number={simResult.DOT} />
              <ScoringNumber label="Break DMG:           " number={simResult.BREAK} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex vertical gap={15} align="center">
      <Flex justify="space-around" style={{ marginTop: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          Character build analysis
        </pre>
      </Flex>
      <Flex gap={40}>
        <Flex vertical gap={defaultGap} style={{ marginLeft: 10 }}>
          <pre style={{ margin: '5px auto' }}>
            Simulation teammates
          </pre>
          <Flex gap={15}>
            <ScoringTeammate result={result} index={0} />
            <ScoringTeammate result={result} index={1} />
            <ScoringTeammate result={result} index={2} />
          </Flex>
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '5px auto' }}>
            Simulation sets
          </pre>
          <Flex vertical gap={defaultGap}>
            <Flex>
              <ScoringSet set={result.maximumSim.request.simRelicSet1} />
              <ScoringSet set={result.maximumSim.request.simRelicSet2} />
            </Flex>
            <ScoringSet set={result.maximumSim.request.simOrnamentSet} />
          </Flex>
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '5px auto' }}>
            Formula
          </pre>
          <Flex vertical gap={defaultGap}>
            <ScoringNumber label="BASIC:     " number={result.simulationMetadata.formula.BASIC} precision={0} />
            <ScoringNumber label="SKILL:     " number={result.simulationMetadata.formula.SKILL} precision={0} />
            <ScoringNumber label="ULT:       " number={result.simulationMetadata.formula.ULT} precision={0} />
            <ScoringNumber label="FUA:       " number={result.simulationMetadata.formula.FUA} precision={0} />
            <ScoringNumber label="DOT:       " number={result.simulationMetadata.formula.DOT} precision={0} />
            <ScoringNumber label="BREAK:     " number={result.simulationMetadata.formula.BREAK} precision={0} />
          </Flex>
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={10}>
          <pre style={{ margin: '5px auto' }}>
            Simulation damage results
          </pre>
          <Flex vertical gap={10}>
            <ScoringNumber label="Character DMG:       " number={result.originalSimScore} />
            <ScoringNumber label="Baseline DMG:        " number={result.baselineSimScore} />
            <ScoringNumber label="Benchmark DMG:       " number={result.benchmarkSimScore} />
            <ScoringNumber label="Maximum DMG:         " number={result.maximumSimScore} />
            <ScoringNumber label="DPS score %:         " number={result.percent * 100} precision={2} />
          </Flex>
        </Flex>
      </Flex>

      <Flex>
        <ScoringColumn
          simulation={result.originalSim}
          percent={result.percent}
          precision={2}
          subText="Character subs (min rolls)"
          mainText="Character main stats"
          basicText="Character basic stats"
          damageText="Character ability damage"
          statText="Character"
          nameText="Character"
        />

        {divider}

        <ScoringColumn
          simulation={result.benchmarkSim}
          percent={1.00}
          precision={0}
          subText="100% benchmark subs (min rolls)"
          mainText="100% benchmark main stats"
          basicText="100% benchmark basic stats"
          damageText="100% benchmark ability damage"
          statText="100% benchmark"
          nameText="Benchmark"
        />

        {divider}

        <ScoringColumn
          simulation={result.maximumSim}
          percent={2.00}
          precision={0}
          subText="200% perfect subs (max rolls)"
          mainText="200% perfect main stats"
          basicText="200% perfect basic stats"
          damageText="200% perfect ability damage"
          statText="200% perfect"
          nameText="Perfect"
        />
      </Flex>

      <Flex gap={defaultGap} justify="space-around">
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
  const teammate = props.result.simulationMetadata.teammates[props.index]
  const iconSize = 60
  return (
    <Flex vertical align="center" gap={5}>
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
  const basePercent = result.percent
  const statUpgrades = result.substatUpgrades.filter((statUpgrade) => statUpgrade.stat != Stats.SPD)
  for (const statUpgrade of statUpgrades.slice(0, 5)) {
    const stat = statUpgrade.stat!

    rows.push(
      <Flex key={Utils.randomId()} justify="space-between" align="center" style={{ width: '100%' }}>
        <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }} />
        <StatText>{`+1x ${StatsToShortSpaced[stat]}`}</StatText>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
        <StatText>{`+ ${((statUpgrade.percent! - basePercent) * 100).toFixed(2)}%`}</StatText>
      </Flex>,
    )
  }

  const extraRows: ReactElement[] = []

  const mainUpgrade = result.mainUpgrades[0]
  if (mainUpgrade && mainUpgrade.percent! - basePercent > 0) {
    const part = mainUpgrade.part
    const stat = mainUpgrade.stat

    extraRows.push(
      <Flex gap={3} key={Utils.randomId()} justify="space-between" align="center" style={{ width: '100%', paddingLeft: 1 }}>
        <img src={Assets.getPart(part)} style={{ width: iconSize, height: iconSize, marginRight: 3 }} />
        <StatText>{`➔ ${StatsToShortSpaced[stat]}`}</StatText>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
        <StatText>{`+ ${((mainUpgrade.percent! - basePercent) * 100).toFixed(2)}%`}</StatText>
      </Flex>,
    )
  }

  const setUpgrade = result.setUpgrades[0]
  if (setUpgrade.percent! - basePercent > 0) {
    extraRows.push(
      <Flex gap={3} key={Utils.randomId()} justify="space-between" align="center" style={{ width: '100%', paddingLeft: 1 }}>
        <img src={Assets.getSetImage(setUpgrade.simulation.request.simRelicSet1)} style={{ width: iconSize, height: iconSize, marginRight: 3 }} />
        <img src={Assets.getSetImage(setUpgrade.simulation.request.simRelicSet2)} style={{ width: iconSize, height: iconSize, marginRight: 10 }} />
        <img src={Assets.getSetImage(setUpgrade.simulation.request.simOrnamentSet)} style={{ width: iconSize, height: iconSize, marginRight: 3 }} />
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
        <StatText>{`+ ${((setUpgrade.percent! - basePercent) * 100).toFixed(2)}%`}</StatText>
      </Flex>,
    )
  }

  if (extraRows.length) {
    rows.splice(5 - extraRows.length, extraRows.length)
    extraRows.map((row) => rows.push(row))
  }

  //  =>  ${(statUpgrade.percent! * 100).toFixed(2)}%
  return (
    <Flex vertical gap={1} align="center" style={{ paddingLeft: 6, paddingRight: 8, marginBottom: 0 }}>
      <Flex vertical align="center">
        <HeaderText style={{ fontSize: 16, marginBottom: 1 }}>
          DPS score improvements
        </HeaderText>
      </Flex>
      {rows}
    </Flex>
  )
}
