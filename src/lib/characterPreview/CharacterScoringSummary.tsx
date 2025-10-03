import { Alert, Divider, Flex } from 'antd'
import { BuffDisplaySize, BuffsAnalysisDisplay } from 'lib/characterPreview/BuffsAnalysisDisplay'
import { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'
import { AbilityDamageSummary } from 'lib/characterPreview/summary/AbilityDamageSummary'
import { ComboRotationSummary } from 'lib/characterPreview/summary/ComboRotationSummary'
import { DpsScoreGradeRuler } from 'lib/characterPreview/summary/DpsScoreGradeRuler'
import { DpsScoreMainStatUpgradesTable } from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import { DpsScoreSubstatUpgradesTable } from 'lib/characterPreview/summary/DpsScoreSubstatUpgradesTable'
import { EstimatedTbpRelicsDisplay } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { SubstatRollsSummary } from 'lib/characterPreview/summary/SubstatRollsSummary'
import { ElementToDamage, MainStats, Parts, Stats } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { toBasicStatsObject } from 'lib/optimization/basicStatsArray'
import { Key, StatToKey, toComputedStatsObject } from 'lib/optimization/computedStatsArray'
import { Assets } from 'lib/rendering/assets'
import { diminishingReturnsFormula, ScoringType, SimulationScore, spdDiminishingReturnsFormula } from 'lib/scoring/simScoringUtils'
import { Simulation } from 'lib/simulations/statSimulationTypes'
import DB from 'lib/state/db'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { VerticalDivider } from 'lib/ui/Dividers'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { Trans, useTranslation } from 'react-i18next'
import {DPSScoreDisclaimer} from "lib/tabs/tabShowcase/ShowcaseTab";

// FIXME MED

export const CharacterScoringSummary = (props: {
  simScoringResult?: SimulationScore
  displayRelics: SingleRelicByPart
  showcaseMetadata: ShowcaseMetadata
}) => {
  const { t, i18n } = useTranslation(['charactersTab', 'common'])

  if (!props.simScoringResult) return (
    <></>
  )

  const result = TsUtils.clone(props.simScoringResult)

  const characterId = result.simulationForm.characterId
  const characterMetadata = DB.getMetadata().characters[characterId]
  const elementalDmgValue = ElementToDamage[characterMetadata.element]

  function ScoringSet(props: {
    set: string
  }) {
    return (
      <Flex vertical align='center' gap={2}>
        <img src={Assets.getSetImage(props.set)} style={{ height: 60 }}/>
      </Flex>
    )
  }

  function ScoringStat(props: {
    stat: string
    part: string
  }) {
    const display = props.stat?.replace('Boost', '') || ''
    return (
      <Flex align='center' gap={10}>
        <img src={Assets.getPart(props.part)} style={{ height: 30 }}/>
        <pre style={{ margin: 0 }}>{display}</pre>
      </Flex>
    )
  }

  function ScoringNumber(props: {
    label: string
    number?: number
    precision?: number
    useGrouping?: boolean
  }) {
    const precision = props.precision ?? 1
    const value = props.number ?? 0
    const show = value != 0
    return (
      <Flex gap={15} justify='space-between'>
        <pre style={{ margin: 0 }}>{props.label}</pre>
        <pre style={{ margin: 0, textAlign: 'right' }}>{show && numberToLocaleString(value, precision, props.useGrouping)}</pre>
      </Flex>
    )
  }

  function ScoringInteger(props: {
    label: string
    number?: number
    valueWidth?: number
  }) {
    const value = props.number ?? 0
    return (
      <Flex gap={9} justify='space-between'>
        <pre style={{ margin: 0 }}>{props.label}</pre>
        <pre style={{ margin: 0, width: props.valueWidth }}>{value}</pre>
      </Flex>
    )
  }

  function ScoringText(props: {
    label: string
    text?: string
  }) {
    const value = props.text ?? ''
    return (
      <Flex align='center' gap={1} justify='space-between'>
        <pre style={{ margin: 0 }}>{props.label}</pre>
        <pre style={{ margin: 0, textAlign: 'right' }}>{value}</pre>
      </Flex>
    )
  }

  // We clone stats to make DMG % a combat stat, since it the stat preview only cares about elemental stat not all type
  const original = TsUtils.clone(result.originalSimResult)
  const benchmark = TsUtils.clone(result.benchmarkSimResult)
  const maximum = TsUtils.clone(result.maximumSimResult)

  const originalBasicStats = original.ca
  const benchmarkBasicStats = benchmark.ca
  const maximumBasicStats = maximum.ca

  const originalCombatStats = original.xa
  const benchmarkCombatStats = benchmark.xa
  const maximumCombatStats = maximum.xa

  originalBasicStats[StatToKey[elementalDmgValue]] = originalBasicStats[Key.ELEMENTAL_DMG]
  benchmarkBasicStats[StatToKey[elementalDmgValue]] = benchmarkBasicStats[Key.ELEMENTAL_DMG]
  maximumBasicStats[StatToKey[elementalDmgValue]] = maximumBasicStats[Key.ELEMENTAL_DMG]

  originalCombatStats[StatToKey[elementalDmgValue]] = originalCombatStats[Key.ELEMENTAL_DMG]
  benchmarkCombatStats[StatToKey[elementalDmgValue]] = benchmarkCombatStats[Key.ELEMENTAL_DMG]
  maximumCombatStats[StatToKey[elementalDmgValue]] = maximumCombatStats[Key.ELEMENTAL_DMG]

  const statPreviewWidth = 300
  const divider = (
    <Flex vertical>
      <Divider type='vertical' style={{ flexGrow: 1, margin: '10px 30px' }}/>
    </Flex>
  )

  function ScoringColumn(props: {
    simulation: Simulation
    percent: number
    precision: number
    type: 'Character' | 'Benchmark' | 'Perfect'
  }) {
    const simulation = TsUtils.clone(props.simulation)
    const simRequest = simulation.request
    const simResult = simulation.result!

    const basicStats = toBasicStatsObject(simResult.ca)
    const combatStats = toComputedStatsObject(simResult.xa)

    const highlight = props.type == 'Character'
    const color = 'rgb(225, 165, 100)'
    basicStats[elementalDmgValue] = basicStats.ELEMENTAL_DMG
    combatStats[elementalDmgValue] = combatStats.ELEMENTAL_DMG

    const diminishingReturns: Record<string, number> = {}
    if (props.type == 'Benchmark') {
      for (const [stat, rolls] of Object.entries(simRequest.stats)) {
        const mainsCount = [
          simRequest.simBody,
          simRequest.simFeet,
          simRequest.simPlanarSphere,
          simRequest.simLinkRope,
          Stats.ATK,
          Stats.HP,
        ].filter((x) => x == stat).length
        if (stat == Stats.SPD) {
          diminishingReturns[stat] = rolls - spdDiminishingReturnsFormula(mainsCount, rolls)
        } else {
          diminishingReturns[stat] = rolls - diminishingReturnsFormula(mainsCount, rolls)
        }
      }
    }

    const precision = props.precision

    return (
      <Flex vertical gap={25} style={{ margin: 'auto' }}>
        <Flex vertical gap={defaultGap}>
          <Flex justify='space-around'>
            <pre style={{ fontSize: 20, fontWeight: 'bold', color: highlight ? color : '' }}>
              <u>{t(`CharacterPreview.ScoringColumn.${props.type}.Header`, { score: Utils.truncate10ths(Utils.precisionRound(props.percent * 100)) })}</u>
            </pre>
            {/* Character/Benchmark/Perfect build ({{score}}%) */}
          </Flex>
        </Flex>

        <Flex vertical gap={defaultGap} style={{ width: statPreviewWidth, margin: 'auto' }}>
          <pre style={{ margin: 'auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.BasicStats`)}
          </pre>
          {/* Character/100% benchmark/200% prefect basic stats */}
          <CharacterStatSummary
            characterId={characterId}
            finalStats={basicStats}
            elementalDmgValue={elementalDmgValue}
            simScore={simResult.simScore}
            showAll={true}
            asyncSimScoringExecution={null}
          />
        </Flex>

        <Flex vertical gap={defaultGap} style={{ width: statPreviewWidth, margin: 'auto' }}>
          <pre style={{ margin: 'auto', color: highlight ? color : '' }}>
            <Trans t={t} i18nKey={`CharacterPreview.ScoringColumn.${props.type}.CombatStats`}>
              build type <u>combat stats</u>
            </Trans>
          </pre>
          <CharacterStatSummary
            characterId={characterId}
            finalStats={combatStats}
            elementalDmgValue={elementalDmgValue}
            simScore={simResult.simScore}
            showAll={true}
            asyncSimScoringExecution={null}
          />
        </Flex>

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '10px auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.Substats`)}
          </pre>
          {/* Character subs (min rolls)/100% benchmark subs (min rolls)/200% perfect subs (max rolls) */}

          <SubstatRollsSummary
            simRequest={simulation.request}
            precision={precision}
            diminish={props.type == 'Benchmark'}
            columns={2}
          />
        </Flex>

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '0 auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.Mainstats`)}
          </pre>
          {/* Character main stats/100% benchmark main stats/200% perfect main stats */}
          <Flex gap={defaultGap} justify='space-around'>
            <Flex vertical gap={10}>
              <ScoringStat stat={simRequest.simBody ? t(`common:ReadableStats.${simRequest.simBody as MainStats}`) : ''} part={Parts.Body}/>
              <ScoringStat stat={simRequest.simFeet ? t(`common:ReadableStats.${simRequest.simFeet as MainStats}`) : ''} part={Parts.Feet}/>
              <ScoringStat stat={simRequest.simPlanarSphere ? t(`common:ReadableStats.${simRequest.simPlanarSphere as MainStats}`) : ''} part={Parts.PlanarSphere}/>
              <ScoringStat stat={simRequest.simLinkRope ? t(`common:ReadableStats.${simRequest.simLinkRope as MainStats}`) : ''} part={Parts.LinkRope}/>
            </Flex>
          </Flex>
        </Flex>

        <Flex vertical gap={20} style={{ lineHeight: '22px' }}>
          <pre style={{ margin: '0 auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.Abilities`)}
          </pre>
          {/* Character/100% benchmark/200% perfect ability damage */}
          <AbilityDamageSummary
            simResult={simulation.result!}
          />
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex vertical gap={15} align='center' style={{ width: 1068 }}>
      <Flex align='center' vertical gap={5}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          <ColorizedTitleWithInfo
            text={t('CharacterPreview.BuildAnalysis.Header')/* Character build analysis */}
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/dps-score.md'
          />
        </pre>
        <DPSScoreDisclaimer/>
        {/*<pre style={{ textAlign: 'center', color: 'rgb(225, 165, 100)', lineHeight: '24px', fontSize: 14, textWrap: 'wrap', margin: 0 }}>*/}
        {/*  {*/}
        {/*    t('CharacterPreview.BuildAnalysis.ScoringNote')*/}
        {/*  }*/}
        {/*</pre>*/}
        <DpsScoreGradeRuler
          score={result.originalSimScore}
          minimum={result.baselineSimScore}
          maximum={result.maximumSimScore}
          benchmark={result.benchmarkSimScore}
        />
      </Flex>

      <Flex gap={defaultGap} vertical style={{ width: '100%' }} align='center'>
        <pre style={{ fontSize: 22, textDecoration: 'underline' }}>
          {t('CharacterPreview.SubstatUpgradeComparisons.Header')/* Substat upgrade comparisons */}
        </pre>
        <DpsScoreSubstatUpgradesTable simScore={result}/>
      </Flex>

      <Flex gap={defaultGap} vertical style={{ width: '100%' }} align='center'>
        <pre style={{ fontSize: 22, textDecoration: 'underline' }}>
          {t('CharacterPreview.SubstatUpgradeComparisons.MainStatHeader')/* Main stat upgrade comparisons */}
        </pre>
        <DpsScoreMainStatUpgradesTable simScore={result}/>
      </Flex>

      <Flex gap={defaultGap} vertical style={{ width: '100%', marginTop: 10 }} align='center'>
        <ColorizedTitleWithInfo
          text={t('CharacterPreview.BuildAnalysis.RelicRarityHeader')/* Relic rarity upgrade comparisons */}
          url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md#estimated-tbp'
        />
        <Alert
          message={t('CharacterPreview.BuildAnalysis.RelicRarityNote')}
          type='info'
          showIcon
          style={{ marginBottom: 20, width: '100%' }}
        />
        <EstimatedTbpRelicsDisplay
          displayRelics={props.displayRelics}
          showcaseMetadata={props.showcaseMetadata}
          scoringType={ScoringType.COMBAT_SCORE}
        />
      </Flex>

      <pre style={{ fontSize: 22, textDecoration: 'underline' }}>
        {t('CharacterPreview.BuildAnalysis.SimulatedBenchmarks')/* Simulated benchmark builds */}
      </pre>

      <Flex gap={25} style={{ width: '100%' }} justify='space-around'>
        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '5px auto' }}>
            {t('CharacterPreview.BuildAnalysis.SimulationTeammates')/* Simulation teammates */}
          </pre>
          <Flex gap={15}>
            <ScoringTeammate result={result} index={0}/>
            <ScoringTeammate result={result} index={1}/>
            <ScoringTeammate result={result} index={2}/>
          </Flex>
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '5px auto' }}>
            {t('CharacterPreview.BuildAnalysis.SimulationSets')/* Simulation sets */}
          </pre>
          <Flex vertical gap={defaultGap}>
            <Flex>
              <ScoringSet set={result.maximumSim.request.simRelicSet1}/>
              <ScoringSet set={result.maximumSim.request.simRelicSet2}/>
            </Flex>
            <ScoringSet set={result.maximumSim.request.simOrnamentSet}/>
          </Flex>
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '5px auto' }}>
            {t('CharacterPreview.BuildAnalysis.Rotation.Header')/* Combo damage rotation */}
          </pre>
          <ComboRotationSummary
            simMetadata={result.simulationMetadata}
          />
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={10}>
          <pre style={{ margin: '5px auto' }}>
            {t('CharacterPreview.BuildAnalysis.CombatResults.Header')/* Combat damage results */}
          </pre>
          <Flex vertical gap={10} style={{ width: 255 }}>
            <ScoringText
              label={t('CharacterPreview.BuildAnalysis.CombatResults.Primary')}
              text={
                // @ts-ignore type of key is not specific enough for ts to know that t() will resolve properly
                t(`CharacterPreview.BuildAnalysis.CombatResults.Abilities.${result.characterMetadata.scoringMetadata.sortOption.key}`)
              }
            />
            <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Character')} number={result.originalSimScore} precision={1}/>
            <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Baseline')} number={result.baselineSimScore} precision={1}/>
            <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Benchmark')} number={result.benchmarkSimScore} precision={1}/>
            <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Maximum')} number={result.maximumSimScore} precision={1}/>
            <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Score')} number={result.percent * 100} precision={2}/>
          </Flex>
        </Flex>
      </Flex>

      <Flex>
        <ScoringColumn
          simulation={result.originalSim}
          percent={result.percent}
          precision={2}
          type='Character'
        />

        {divider}

        <ScoringColumn
          simulation={result.benchmarkSim}
          percent={1.00}
          precision={0}
          type='Benchmark'
        />

        {divider}

        <ScoringColumn
          simulation={result.maximumSim}
          percent={2.00}
          precision={0}
          type='Perfect'
        />
      </Flex>

      <Flex vertical align='center' style={{ width: '100%' }}>
        <pre style={{ fontSize: 22, textDecoration: 'underline' }}>
          {
            result.simulationForm.deprioritizeBuffs
              ? t('CharacterPreview.BuildAnalysis.CombatBuffs.SubDpsHeader')/* Combat buffs (Sub DPS) */
              : t('CharacterPreview.BuildAnalysis.CombatBuffs.Header')/* Combat buffs */
          }
        </pre>

        <BuffsAnalysisDisplay result={result} size={BuffDisplaySize.LARGE}/>
      </Flex>
    </Flex>
  )
}

export function ScoringTeammate(props: {
  result: SimulationScore
  index: number
}) {
  const { t } = useTranslation('common')
  const teammate = props.result.simulationMetadata.teammates[props.index]
  const iconSize = 60
  return (
    <Flex vertical align='center' gap={5}>
      <img src={Assets.getCharacterAvatarById(teammate.characterId)} style={{ height: iconSize }}/>
      <pre style={{ margin: 0 }}>
        {t('EidolonNShort', { eidolon: teammate.characterEidolon })}
      </pre>
      <img src={Assets.getLightConeIconById(teammate.lightCone)} style={{ height: iconSize }}/>
      <pre style={{ margin: 0 }}>
        {t('SuperimpositionNShort', { superimposition: teammate.lightConeSuperimposition })}
      </pre>
    </Flex>
  )
}
