import { Divider, Flex, Typography } from 'antd'
import { UpArrow } from 'icons/UpArrow'
import { BuffDisplaySize, BuffsAnalysisDisplay } from 'lib/characterPreview/BuffsAnalysisDisplay'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'
import { damageStats } from 'lib/characterPreview/StatRow'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { ElementToDamage, MainStats, Parts, Stats, StatsValues, SubStats } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { defaultGap, iconSize } from 'lib/constants/constantsUi'
import { toBasicStatsObject } from 'lib/optimization/basicStatsArray'
import { Key, StatToKey, toComputedStatsObject } from 'lib/optimization/computedStatsArray'
import { SortOption, SortOptionProperties } from 'lib/optimization/sortOptions'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Assets } from 'lib/rendering/assets'
import { SimulationStatUpgrade } from 'lib/scoring/characterScorer'
import { diminishingReturnsFormula, SimulationScore, spdDiminishingReturnsFormula } from 'lib/scoring/simScoringUtils'
import { Simulation } from 'lib/simulations/statSimulationController'
import DB from 'lib/state/db'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { filterUnique } from 'lib/utils/arrayUtils'
import { localeNumber, localeNumber_0, localeNumber_00, localeNumber_000, numberToLocaleString } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import React, { ReactElement } from 'react'
import { Trans, useTranslation } from 'react-i18next'

// FIXME MED

const { Text } = Typography

export const CharacterScoringSummary = (props: {
  simScoringResult?: SimulationScore
}) => {
  const { t, i18n } = useTranslation(['charactersTab', 'common'])

  if (!props.simScoringResult) return (
    <pre style={{ height: 200 }}>
      {' '}
    </pre>
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

  function ScoringNumberParens(props: {
    label: string
    number?: number
    parens?: number
    precision?: number
  }) {
    const precision = props.precision ?? 1
    const value = props.number ?? 0
    const parens = props.parens ?? 0
    const show = value != 0
    const showParens = parens != 0

    return (
      <Flex gap={5} justify='space-between'>
        <pre style={{ margin: 0 }}>{props.label}</pre>
        <pre style={{ margin: 0, textAlign: 'right' }}>
          {show && numberToLocaleString(value, precision)}
          {showParens && <span style={{ margin: 3 }}>-</span>}
          {showParens && numberToLocaleString(parens, 1)}
        </pre>
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

  function ScoringAbility(props: {
    comboAbilities: string[]
    index: number
  }) {
    const displayValue = i18n.exists(`charactersTab:CharacterPreview.BuildAnalysis.Rotation.${props.comboAbilities[props.index]}`)
      ? t(`CharacterPreview.BuildAnalysis.Rotation.${props.comboAbilities[props.index]}` as never)
      : null
    if (displayValue == null) return <></>

    return (
      <Flex align='center' gap={15}>
        <pre style={{ margin: 0 }}>{`#${props.index} - ${displayValue as string}`}</pre>
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
      const rollValue = TsUtils.precisionRound(StatCalculator.getMaxedSubstatValue(upgradeStat as SubStats, 0.8))

      rows.push(
        <Flex key={Utils.randomId()} align='center' gap={10}>
          <img src={Assets.getStatIcon(upgradeStat)} style={{ height: 30 }}/>
          <pre
            style={{
              margin: 0,
              width: 200,
            }}
          >{`+1x ${t('CharacterPreview.SubstatUpgradeComparisons.Roll')}: ${t(`common:ShortStats.${upgradeStat as SubStats}`)} +${localeNumber_0(rollValue)}${suffix}`}
          </pre>
          <pre style={{ margin: 0, width: 250 }}>
            {`${t('common:Score')}: +${localeNumber_00((upgradePercent - basePercent) * 100)}% -> ${localeNumber_00(statUpgrade.percent! * 100)}%`}
          </pre>
          <pre style={{ margin: 0, width: 300 }}>
            {`${t('CharacterPreview.SubstatUpgradeComparisons.Damage')}: +${localeNumber_0(upgradeSimScore - originalScore)} -> ${localeNumber_0(upgradeSimScore)}`}
          </pre>
          <pre style={{ margin: 0, width: 150 }}>
            {`${t('CharacterPreview.SubstatUpgradeComparisons.Damage')} %: +${localeNumber_000((upgradeSimScore - originalScore) / originalScore * 100)}%`}
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
    const request = props.simulation.request
    const simResult = TsUtils.clone(props.simulation.result)
    const basicStats = toBasicStatsObject(simResult.ca)
    const combatStats = toComputedStatsObject(simResult.xa)
    const highlight = props.type == 'Character'
    const color = 'rgb(225, 165, 100)'
    basicStats[elementalDmgValue] = basicStats.ELEMENTAL_DMG
    combatStats[elementalDmgValue] = combatStats.ELEMENTAL_DMG

    const diminishingReturns: Record<string, number> = {}
    if (props.type == 'Benchmark') {
      for (const [stat, rolls] of Object.entries(request.stats)) {
        const mainsCount = [
          request.simBody,
          request.simFeet,
          request.simPlanarSphere,
          request.simLinkRope,
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

    const stats = request.stats
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
          />
        </Flex>

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '10px auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.Substats`)}
          </pre>
          {/* Character subs (min rolls)/100% benchmark subs (min rolls)/200% perfect subs (max rolls) */}
          <Flex justify='space-between'>
            <Flex vertical gap={defaultGap} style={{ width: 125, paddingLeft: 5 }}>
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.ATK_P}`) + ':'}
                number={stats[Stats.ATK_P]}
                parens={diminishingReturns[Stats.ATK_P]}
                precision={precision}
              />
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.ATK}`) + ':'}
                number={stats[Stats.ATK]}
                parens={diminishingReturns[Stats.ATK]}
                precision={precision}
              />
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.HP_P}`) + ':'}
                number={stats[Stats.HP_P]}
                parens={diminishingReturns[Stats.HP_P]}
                precision={precision}
              />
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.HP}`) + ':'}
                number={stats[Stats.HP]}
                parens={diminishingReturns[Stats.HP]}
                precision={precision}
              />
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.DEF_P}`) + ':'}
                number={stats[Stats.DEF_P]}
                parens={diminishingReturns[Stats.DEF_P]}
                precision={precision}
              />
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.DEF}`) + ':'}
                number={stats[Stats.DEF]}
                parens={diminishingReturns[Stats.DEF]}
                precision={precision}
              />
            </Flex>
            <VerticalDivider/>
            <Flex vertical gap={defaultGap} style={{ width: 125, paddingRight: 5 }}>
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.SPD}`) + ':'}
                number={stats[Stats.SPD]}
                parens={diminishingReturns[Stats.SPD]}
                precision={2}
              />
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.CR}`) + ':'}
                number={stats[Stats.CR]}
                parens={diminishingReturns[Stats.CR]}
                precision={precision}
              />
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.CD}`) + ':'}
                number={stats[Stats.CD]}
                parens={diminishingReturns[Stats.CD]}
                precision={precision}
              />
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.EHR}`) + ':'}
                number={stats[Stats.EHR]}
                parens={diminishingReturns[Stats.EHR]}
                precision={precision}
              />
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.RES}`) + ':'}
                number={stats[Stats.RES]}
                parens={diminishingReturns[Stats.RES]}
                precision={precision}
              />
              <ScoringNumberParens
                label={t(`common:ShortStats.${Stats.BE}`) + ':'}
                number={stats[Stats.BE]}
                parens={diminishingReturns[Stats.BE]}
                precision={precision}
              />
            </Flex>
          </Flex>
        </Flex>

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '0 auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.Mainstats`)}
          </pre>
          {/* Character main stats/100% benchmark main stats/200% perfect main stats */}
          <Flex gap={defaultGap} justify='space-around'>
            <Flex vertical gap={10}>
              <ScoringStat stat={request.simBody !== 'NONE' ? t(`common:ReadableStats.${request.simBody as MainStats}`) : ''} part={Parts.Body}/>
              <ScoringStat stat={request.simFeet !== 'NONE' ? t(`common:ReadableStats.${request.simFeet as MainStats}`) : ''} part={Parts.Feet}/>
              <ScoringStat
                stat={request.simPlanarSphere !== 'NONE' ? t(`common:ReadableStats.${request.simPlanarSphere as MainStats}`) : ''}
                part={Parts.PlanarSphere}
              />
              <ScoringStat stat={request.simLinkRope !== 'NONE' ? t(`common:ReadableStats.${request.simLinkRope as MainStats}`) : ''} part={Parts.LinkRope}/>
            </Flex>
          </Flex>
        </Flex>

        <Flex vertical gap={20}>
          <pre style={{ margin: '0 auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.Abilities`)}
          </pre>
          {/* Character/100% benchmark/200% perfect ability damage */}
          <Flex gap={defaultGap} justify='space-around'>
            <Flex vertical gap={10} style={{ width: 230 }}>
              <ScoringNumber label={String(t('common:ShortDMGTypes.Basic')) + ':'} number={simResult.BASIC} precision={1}/>
              <ScoringNumber label={String(t('common:ShortDMGTypes.Skill')) + ':'} number={simResult.SKILL} precision={1}/>
              <ScoringNumber label={String(t('common:ShortDMGTypes.Ult')) + ':'} number={simResult.ULT} precision={1}/>
              <ScoringNumber label={String(t('common:ShortDMGTypes.Fua')) + ':'} number={simResult.FUA} precision={1}/>
              <ScoringNumber label={String(t('common:ShortDMGTypes.Memo_Skill')) + ':'} number={simResult.MEMO_SKILL} precision={1}/>
              <ScoringNumber label={String(t('common:ShortDMGTypes.Dot')) + ':'} number={simResult.DOT} precision={1}/>
              <ScoringNumber label={String(t('common:ShortDMGTypes.Break')) + ':'} number={simResult.BREAK} precision={1}/>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex vertical gap={15} align='center' style={{ width: 1068 }}>
      <Flex align='center' style={{ marginTop: 15 }} vertical>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          {t('CharacterPreview.BuildAnalysis.Header')/* Character build analysis */}
        </pre>
        <pre style={{ textAlign: 'center' }}>
          {
            t('CharacterPreview.BuildAnalysis.ScoringNote')
            // Note: DPS Score & Combo DMG are scoring metrics for a single ability rotation, and not meant for cross-team comparisons
          }
        </pre>
      </Flex>
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
          <Flex gap={30}>
            <Flex vertical gap={2}>
              <ScoringAbility comboAbilities={result.simulationMetadata.comboAbilities} index={1}/>
              <ScoringAbility comboAbilities={result.simulationMetadata.comboAbilities} index={2}/>
              <ScoringAbility comboAbilities={result.simulationMetadata.comboAbilities} index={3}/>
              <ScoringAbility comboAbilities={result.simulationMetadata.comboAbilities} index={4}/>
              <ScoringAbility comboAbilities={result.simulationMetadata.comboAbilities} index={5}/>
              <ScoringAbility comboAbilities={result.simulationMetadata.comboAbilities} index={6}/>
              <ScoringAbility comboAbilities={result.simulationMetadata.comboAbilities} index={7}/>
              <ScoringAbility comboAbilities={result.simulationMetadata.comboAbilities} index={8}/>
            </Flex>
            <Flex vertical gap={2}>
              <ScoringInteger label={t('CharacterPreview.BuildAnalysis.Rotation.DOTS')} number={result.simulationMetadata.comboDot}/>
              <ScoringInteger label={t('CharacterPreview.BuildAnalysis.Rotation.BREAKS')} number={result.simulationMetadata.comboBreak}/>
            </Flex>
          </Flex>
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

      <Flex vertical align='center' style={{ width: '100%' }}>
        <pre style={{ fontSize: 20, fontWeight: 'bold' }}>
          Combat buffs
        </pre>

        <BuffsAnalysisDisplay result={result} size={BuffDisplaySize.LARGE}/>
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

      <Flex gap={defaultGap} justify='space-around'>
        <Flex vertical gap={defaultGap}>
          <pre style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            {t('CharacterPreview.SubstatUpgradeComparisons.Header')/* Substat upgrade comparisons */}
          </pre>
          <ScoringStatUpgrades/>
        </Flex>
      </Flex>

      <Flex justify='space-around' style={{ marginTop: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          <ColorizedLinkWithIcon
            text={t('CharacterPreview.ScoringDetails.Header')/* How is DPS score calculated? */}
            linkIcon={true}
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/dps-score.md'
          />
        </pre>
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

function addOnHitStats(xa: Float32Array, sortOption: SortOptionProperties) {
  const ability = sortOption.key

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  xa[Key.ELEMENTAL_DMG] += xa[Key[`${ability}_BOOST`]]
  if (ability != SortOption.DOT.key) {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    xa[Key[`${ability}_CR_BOOST`]] && (xa[Key.CR] += xa[Key[`${ability}_CR_BOOST`]])
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    xa[Key[`${ability}_CD_BOOST`]] && (xa[Key.CD] += xa[Key[`${ability}_CD_BOOST`]])
  }
}

const percentFlatStats: Record<string, boolean> = {
  [Stats.ATK_P]: true,
  [Stats.DEF_P]: true,
  [Stats.HP_P]: true,
}

export function CharacterCardCombatStats(props: {
  result: SimulationScore
}) {
  const result = props.result
  const xa = new Float32Array(result.originalSimResult.xa)
  const sortOption = result.characterMetadata.scoringMetadata.sortOption
  addOnHitStats(xa, sortOption)

  const { t } = useTranslation('common')
  const { t: tCharactersTab } = useTranslation('charactersTab')
  const preciseSpd = window.store((s) => s.savedSession[SavedSessionKeys.showcasePreciseSpd])

  const originalSimulationMetadata = result.characterMetadata.scoringMetadata.simulation!
  const elementalDmgValue = ElementToDamage[result.characterMetadata.element]
  let substats = originalSimulationMetadata.substats as SubStats[]
  substats = filterUnique(substats).filter((x) => !percentFlatStats[x])
  if (substats.length < 5) substats.push(Stats.SPD)
  substats.sort((a, b) => SubStats.indexOf(a) - SubStats.indexOf(b))
  const upgradeStats: StatsValues[] = [...substats, elementalDmgValue]

  const rows: ReactElement[] = []

  for (const stat of upgradeStats) {
    if (percentFlatStats[stat]) continue

    const value = damageStats[stat] ? xa[Key.ELEMENTAL_DMG] : xa[StatToKey[stat]]
    const flat = Utils.isFlat(stat)
    const upgraded = damageStats[stat]
      ? Utils.precisionRound(xa[Key.ELEMENTAL_DMG], 2) != Utils.precisionRound(result.originalSimResult.ca[Key.ELEMENTAL_DMG], 2)
      : Utils.precisionRound(xa[StatToKey[stat]], 2) != Utils.precisionRound(result.originalSimResult.ca[StatToKey[stat]], 2)

    let display = localeNumber(Math.floor(value))
    if (stat == Stats.SPD) {
      display = preciseSpd
        ? localeNumber_000(TsUtils.precisionRound(value, 4))
        : localeNumber_0(Utils.truncate10ths(TsUtils.precisionRound(value, 4)))
    } else if (!flat) {
      display = localeNumber_0(Utils.truncate10ths(value * 100))
    }

    const statName = stat.includes('DMG Boost') ? t('DamagePercent') : t(`ReadableStats.${stat}`)

    // Best arrows 🠙 🠡 🡑 🠙 ↑ ↑ ⬆
    rows.push(
      <Flex key={Utils.randomId()} justify='space-between' align='center' style={{ width: '100%' }}>
        <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
        <Flex gap={1} align='center'>
          <StatTextSm>
            {statName}
          </StatTextSm>
          {upgraded && <Arrow/>}
        </Flex>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
        <StatTextSm>{`${display}${flat ? '' : '%'}`}</StatTextSm>
      </Flex>,
    )
  }

  const titleRender = result.simulationForm.deprioritizeBuffs
    ? tCharactersTab('CharacterPreview.DetailsSlider.Labels.SubDpsCombatStats')
    : tCharactersTab('CharacterPreview.DetailsSlider.Labels.CombatStats')

  return (
    <Flex vertical gap={1} align='center' style={{ paddingLeft: 4, paddingRight: 6, marginBottom: 1 }}>
      <HeaderText style={{ fontSize: 16 }}>
        {titleRender}
      </HeaderText>
      {rows}
    </Flex>
  )
}

function Arrow() {
  return (
    <Flex align='center'>
      <UpArrow/>
    </Flex>
  )
}

export function CharacterCardScoringStatUpgrades(props: {
  result: SimulationScore
}) {
  const { t } = useTranslation(['common', 'charactersTab'])
  const result = props.result
  const rows: ReactElement[] = []
  const baseDmg = result.originalSimResult.simScore
  const basePercent = result.percent
  const statUpgrades = result.substatUpgrades.filter((statUpgrade) => statUpgrade.stat != Stats.SPD)
  for (const statUpgrade of statUpgrades.slice(0, 4)) {
    const stat = statUpgrade.stat!
    const upgradeDmg = statUpgrade.simulationResult.simScore / baseDmg - 1

    rows.push(
      <Flex key={Utils.randomId()} justify='space-between' align='center' style={{ width: '100%' }}>
        <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
        <StatTextSm>{`+1x ${t(`ShortReadableStats.${stat as SubStats}`)}`}</StatTextSm>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
        <StatTextSm>{`+ ${localeNumber_00((upgradeDmg * 100))}%`}</StatTextSm>
      </Flex>,
    )
  }

  const extraRows: ReactElement[] = []

  const mainUpgrade = result.mainUpgrades[0]
  if (mainUpgrade && mainUpgrade.percent! - basePercent > 0) {
    const part = mainUpgrade.part!
    const stat = mainUpgrade.stat
    const upgradeDmg = mainUpgrade.simulationResult.simScore / baseDmg - 1

    extraRows.push(
      <Flex gap={3} key={Utils.randomId()} justify='space-between' align='center' style={{ width: '100%', paddingLeft: 1 }}>
        <img src={Assets.getPart(part)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
        <StatTextSm>{`➔ ${t(`ShortReadableStats.${stat as MainStats}`)}`}</StatTextSm>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
        <StatTextSm>{`+ ${localeNumber_00((upgradeDmg * 100))}%`}</StatTextSm>
      </Flex>,
    )
  }

  const setUpgrade = result.setUpgrades[0]
  if (setUpgrade.percent! - basePercent > 0) {
    const upgradeDmg = setUpgrade.simulationResult.simScore / baseDmg - 1

    extraRows.push(
      <Flex gap={2} key={Utils.randomId()} justify='space-between' align='center' style={{ width: '100%', paddingLeft: 1 }}>
        <img src={Assets.getSetImage(setUpgrade.simulation.request.simRelicSet1)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
        <img src={Assets.getSetImage(setUpgrade.simulation.request.simRelicSet2)} style={{ width: iconSize, height: iconSize, marginRight: 5 }}/>
        <img src={Assets.getSetImage(setUpgrade.simulation.request.simOrnamentSet)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
        <StatTextSm>{`+ ${localeNumber_00((upgradeDmg * 100))}%`}</StatTextSm>
      </Flex>,
    )
  }

  if (extraRows.length) {
    rows.splice(4 - extraRows.length, extraRows.length)
    extraRows.map((row) => rows.unshift(row))
  }

  return (
    <Flex vertical gap={1} align='center' style={{ paddingLeft: 4, paddingRight: 6, marginBottom: 0 }}>
      <Flex vertical align='center'>
        <HeaderText style={{ fontSize: 16 }}>
          {t('charactersTab:CharacterPreview.DMGUpgrades')/* Damage Upgrades */}
        </HeaderText>
      </Flex>
      {rows}
    </Flex>
  )
}
