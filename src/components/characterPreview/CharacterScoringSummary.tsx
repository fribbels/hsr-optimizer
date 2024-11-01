import { Divider, Flex, Typography } from 'antd'
import { defaultGap, iconSize } from 'lib/constantsUi'
import { SimulationScore, SimulationStatUpgrade } from 'lib/characterScorer'
import { ElementToDamage, MainStats, Parts, Stats, StatsValues, SubStats } from 'lib/constants'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
import { CharacterStatSummary } from 'components/characterPreview/CharacterStatSummary'
import { VerticalDivider } from 'components/Dividers'
import DB from 'lib/db'
import React, { ReactElement } from 'react'
import { StatCalculator } from 'lib/statCalculator'
import { StatTextSm } from 'components/characterPreview/StatText'
import { HeaderText } from 'components/HeaderText'
import { TsUtils } from 'lib/TsUtils'
import { Simulation } from 'lib/statSimulationController'
import { damageStats } from 'components/characterPreview/StatRow'
import { UpArrow } from 'icons/UpArrow'
import { SortOption } from 'lib/optimizer/sortOptions'
import { Trans, useTranslation } from 'react-i18next'
import { ColorizedLinkWithIcon } from 'components/common/ColorizedLink'

export const CharacterScoringSummary = (props: { simScoringResult: SimulationScore }) => {
  const result = TsUtils.clone(props.simScoringResult)
  const { t, i18n } = useTranslation(['charactersTab', 'common'])
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
      <Flex vertical align='center' gap={2}>
        <img src={Assets.getSetImage(props.set)} style={{ height: 60 }}/>
      </Flex>
    )
  }

  function ScoringStat(props: { stat: string; part: string }) {
    const display = props.stat?.replace('Boost', '') || ''
    return (
      <Flex align='center' gap={10}>
        <img src={Assets.getPart(props.part)} style={{ height: 30 }}/>
        <pre style={{ margin: 0 }}>{display}</pre>
      </Flex>
    )
  }

  function ScoringAbility(props: { comboAbilities: string[]; index: number }) {
    const displayValue = i18n.exists(`charactersTab:CharacterPreview.BuildAnalysis.Rotation.${props.comboAbilities[props.index]}`)
      // @ts-ignore ts is being dumb :/, key existence is verified on the line above and for some reason can't tell that t() always returns a string
      ? t(`CharacterPreview.BuildAnalysis.Rotation.${props.comboAbilities[props.index]}`)
      : null
    if (displayValue == null) return <></>

    return (
      <Flex align='center' gap={15}>
        <pre style={{ margin: 0 }}>{`#${props.index} - ${displayValue as string}`}</pre>
      </Flex>
    )
  }

  function ScoringDisplayColumn(props: {
    values: { label: string; value: number | string; precision?: number }[]
    style?: React.CSSProperties
    rowSpacing?: React.CSSProperties['gap']
    columnSpacing?: React.CSSProperties['gap']
    justify?: React.CSSProperties['justifyContent']
    align?: React.CSSProperties['alignItems']
  }) {
    const labels: ReactElement[] = []
    const values: ReactElement[] = []
    props.values.forEach((value) => {
      labels.push(<pre style={{ margin: 0 }}>{value.label}</pre>)
      if (typeof value.value === 'number') {
        values.push(<pre style={{ margin: 0 }}>{(value.value).toFixed(value.precision ?? 0)}</pre>)
      } else {
        values.push(<pre style={{ margin: 0 }}>{value.value || ' '}</pre>)
      }
    })
    return (
      <Flex align={props.align} justify={props.justify} style={props.style} gap={props.columnSpacing}>
        <Flex vertical gap={props.rowSpacing}>
          {labels}
        </Flex>
        <Flex vertical gap={props.rowSpacing}>
          {values}
        </Flex>
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
        <Flex key={Utils.randomId()} align='center' gap={10}>
          <img src={Assets.getStatIcon(upgradeStat)} style={{ height: 30 }}/>
          <pre
            style={{
              margin: 0,
              width: 200,
            }}
          >{`+1x ${t('CharacterPreview.SubstatUpgradeComparisons.Roll')}: ${t(`common:ShortStats.${upgradeStat as SubStats}`)} +${rollValue.toFixed(1)}${suffix}`}
          </pre>
          <pre style={{ margin: 0, width: 250 }}>
            {`${t('common:Score')}: +${((upgradePercent - basePercent) * 100).toFixed(2)}% -> ${(statUpgrade.percent! * 100).toFixed(2)}%`}
          </pre>
          <pre style={{ margin: 0, width: 300 }}>
            {`${t('CharacterPreview.SubstatUpgradeComparisons.Damage')}: +${(upgradeSimScore - originalScore).toFixed(1)} -> ${upgradeSimScore.toFixed(1)}`}
          </pre>
          <pre style={{ margin: 0, width: 150 }}>
            {`${t('CharacterPreview.SubstatUpgradeComparisons.Damage')} %: +${((upgradeSimScore - originalScore) / originalScore * 100).toFixed(3)}%`}
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
    const basicStats = simResult
    const combatStats = basicStats.x
    const highlight = props.type == 'Character'
    const color = 'rgb(225, 165, 100)'
    basicStats[elementalDmgValue] = basicStats.ELEMENTAL_DMG
    combatStats[elementalDmgValue] = combatStats.ELEMENTAL_DMG

    return (
      <Flex vertical gap={25}>
        <Flex vertical gap={defaultGap}>
          <Flex justify='space-around'>
            <pre style={{ fontSize: 20, fontWeight: 'bold', color: highlight ? color : '' }}>
              <u>{t(`CharacterPreview.ScoringColumn.${props.type}.Header`, { score: Utils.truncate10ths(Utils.precisionRound(props.percent * 100)) })}</u>
            </pre>
            {/* Character/Benchmark/Perfect build ({{score}}%) */}
          </Flex>
        </Flex>

        <Flex vertical gap={defaultGap} style={{ width: statPreviewWidth }}>
          <pre style={{ margin: 'auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.BasicStats`)}
          </pre>
          {/* Character/100% benchmark/200% prefect basic stats */}
          <CharacterStatSummary
            finalStats={basicStats}
            elementalDmgValue={elementalDmgValue}
            simScore={simResult.simScore}
          />
        </Flex>

        <Flex vertical gap={defaultGap} style={{ width: statPreviewWidth }}>
          <pre style={{ margin: 'auto', color: highlight ? color : '' }}>
            <Trans t={t} i18nKey={`CharacterPreview.ScoringColumn.${props.type}.CombatStats`}>
              build type <u>combat stats</u>
            </Trans>
          </pre>
          <CharacterStatSummary
            finalStats={combatStats}
            elementalDmgValue={elementalDmgValue}
            simScore={simResult.simScore}
          />
        </Flex>

        <Flex vertical gap={defaultGap}>
          <pre style={{ margin: '10px auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.Substats`)}
          </pre>
          {/* Character subs (min rolls)/100% benchmark subs (min rolls)/200% perfect subs (max rolls) */}
          <Flex gap={5} justify='space-around'>
            <ScoringDisplayColumn
              style={{ width: 120 }} rowSpacing={defaultGap} columnSpacing={23}
              values={[
                { label: t(`common:ShortStats.${Stats.ATK_P}`) + ':', value: request.stats[Stats.ATK_P] || ' ', precision: props.precision },
                { label: t(`common:ShortStats.${Stats.ATK}`) + ':', value: request.stats[Stats.ATK] || ' ', precision: props.precision },
                { label: t(`common:ShortStats.${Stats.HP_P}`) + ':', value: request.stats[Stats.HP_P] || ' ', precision: props.precision },
                { label: t(`common:ShortStats.${Stats.HP}`) + ':', value: request.stats[Stats.HP] || ' ', precision: props.precision },
                { label: t(`common:ShortStats.${Stats.DEF_P}`) + ':', value: request.stats[Stats.DEF_P] || ' ', precision: props.precision },
                { label: t(`common:ShortStats.${Stats.DEF}`) + ':', value: request.stats[Stats.DEF] || ' ', precision: props.precision },
              ]}
            />
            <ScoringDisplayColumn
              style={{ width: 100 }} rowSpacing={defaultGap} columnSpacing={31}
              values={[
                { label: t(`common:ShortStats.${Stats.SPD}`) + ':', value: request.stats[Stats.SPD] || ' ', precision: 2 },
                { label: t(`common:ShortStats.${Stats.CR}`) + ':', value: request.stats[Stats.CR] || ' ', precision: props.precision },
                { label: t(`common:ShortStats.${Stats.CD}`) + ':', value: request.stats[Stats.CD] || ' ', precision: props.precision },
                { label: t(`common:ShortStats.${Stats.EHR}`) + ':', value: request.stats[Stats.EHR] || ' ', precision: props.precision },
                { label: t(`common:ShortStats.${Stats.RES}`) + ':', value: request.stats[Stats.RES] || ' ', precision: props.precision },
                { label: t(`common:ShortStats.${Stats.BE}`) + ':', value: request.stats[Stats.BE] || ' ', precision: props.precision },
              ]}
            />
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
              <ScoringStat stat={request.simPlanarSphere !== 'NONE' ? t(`common:ReadableStats.${request.simPlanarSphere as MainStats}`) : ''} part={Parts.PlanarSphere}/>
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
            <ScoringDisplayColumn
              rowSpacing={10}
              columnSpacing={103}
              justify='space-between'
              values={[
                /* eslint-disable @typescript-eslint/restrict-plus-operands */
                { label: t('common:ShortDMGTypes.Basic') + ':', value: simResult.BASIC || ' ', precision: 1 },
                { label: t('common:ShortDMGTypes.Skill') + ':', value: simResult.SKILL || ' ', precision: 1 },
                { label: t('common:ShortDMGTypes.Ult') + ':', value: simResult.ULT || ' ', precision: 1 },
                { label: t('common:ShortDMGTypes.Fua') + ':', value: simResult.FUA || ' ', precision: 1 },
                { label: t('common:ShortDMGTypes.Dot') + ':', value: simResult.DOT || ' ', precision: 1 },
                { label: t('common:ShortDMGTypes.Break') + ':', value: simResult.BREAK || ' ', precision: 1 },
              ]}
            />
          </Flex>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex vertical gap={15} align='center'>
      <Flex justify='space-around' style={{ marginTop: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          {t('CharacterPreview.BuildAnalysis.Header')/* Character build analysis */}
        </pre>
      </Flex>
      <Flex gap={30}>
        <Flex vertical gap={defaultGap} style={{ marginLeft: 10 }}>
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
            <ScoringDisplayColumn
              rowSpacing={2} columnSpacing={9}
              values={[
                { label: t('CharacterPreview.BuildAnalysis.Rotation.DOTS'), value: result.simulationMetadata.comboDot },
                { label: t('CharacterPreview.BuildAnalysis.Rotation.BREAKS'), value: result.simulationMetadata.comboBreak },
              ]}
            />
          </Flex>
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={10}>
          <pre style={{ margin: '5px auto' }}>
            {t('CharacterPreview.BuildAnalysis.CombatResults.Header')/* Combat damage results */}
          </pre>
          <Flex vertical gap={10}>

            <ScoringDisplayColumn
              style={{ width: 255 }} rowSpacing={10} justify='space-between'
              values={[
                // @ts-ignore type of key is not specific enough for ts to know that t() will resolve properly
                { label: t('CharacterPreview.BuildAnalysis.CombatResults.Primary'), value: t(`CharacterPreview.BuildAnalysis.CombatResults.Abilities.${result.characterMetadata.scoringMetadata.sortOption.key}`) },
                { label: t('CharacterPreview.BuildAnalysis.CombatResults.Character'), value: result.originalSimScore, precision: 1 },
                { label: t('CharacterPreview.BuildAnalysis.CombatResults.Baseline'), value: result.baselineSimScore, precision: 1 },
                { label: t('CharacterPreview.BuildAnalysis.CombatResults.Benchmark'), value: result.benchmarkSimScore, precision: 1 },
                { label: t('CharacterPreview.BuildAnalysis.CombatResults.Maximum'), value: result.maximumSimScore, precision: 1 },
                { label: t('CharacterPreview.BuildAnalysis.CombatResults.Score'), value: result.percent * 100, precision: 2 },
              ]}
            />

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

export function ScoringTeammate(props: { result: SimulationScore; index: number }) {
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

function addOnHitStats(simulationScore: SimulationScore) {
  const sortOption = simulationScore.characterMetadata.scoringMetadata.sortOption
  const ability = sortOption.key
  const x = simulationScore.originalSimResult.x

  x.ELEMENTAL_DMG += x[`${ability}_BOOST`]
  if (ability != SortOption.DOT.key) {
    x[Stats.CR] += x[`${ability}_CR_BOOST`]
    x[Stats.CD] += x[`${ability}_CD_BOOST`]
  }
}

const percentFlatStats = {
  [Stats.ATK_P]: true,
  [Stats.DEF_P]: true,
  [Stats.HP_P]: true,
}

export function CharacterCardCombatStats(props: { result: SimulationScore }) {
  const result = TsUtils.clone(props.result)
  addOnHitStats(result)

  const { t } = useTranslation('common')
  const originalSimulationMetadata = result.characterMetadata.scoringMetadata.simulation
  const simulationMetadata = result.simulationMetadata
  const elementalDmgValue = ElementToDamage[result.characterMetadata.element]
  const nonDisplayStats = simulationMetadata.nonDisplayStats || []
  let substats = originalSimulationMetadata.substats
  substats = substats.filter((x) => !nonDisplayStats.includes(x))
  substats = Utils.filterUnique(substats).filter((x) => !percentFlatStats[x])
  if (substats.length < 5) substats.push(Stats.SPD)
  substats.sort((a, b) => SubStats.indexOf(a) - SubStats.indexOf(b))
  substats.push(elementalDmgValue)

  const rows: ReactElement[] = []

  for (const stat of substats) {
    if (percentFlatStats[stat]) continue

    const value = damageStats[stat] ? result.originalSimResult.x.ELEMENTAL_DMG : result.originalSimResult.x[stat]
    const flat = Utils.isFlat(stat)
    const upgraded = damageStats[stat]
      ? Utils.precisionRound(result.originalSimResult.x.ELEMENTAL_DMG, 2) != Utils.precisionRound(result.originalSimResult.ELEMENTAL_DMG, 2)
      : Utils.precisionRound(result.originalSimResult.x[stat], 2) != Utils.precisionRound(result.originalSimResult[stat], 2)

    let display = Math.floor(value)
    if (stat == Stats.SPD) {
      display = Utils.truncate10ths(value).toFixed(1)
    } else if (!flat) {
      display = Utils.truncate10ths(value * 100).toFixed(1)
    }

    // Best arrows 🠙 🠡 🡑 🠙 ↑ ↑ ⬆
    rows.push(
      <Flex key={Utils.randomId()} justify='space-between' align='center' style={{ width: '100%' }}>
        <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
        <StatTextSm>
          <Flex gap={3} align='center'>
            {t(`ReadableStats.${stat as StatsValues}`)}{upgraded && <Arrow/>}
          </Flex>
        </StatTextSm>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
        <StatTextSm>{`${display}${flat ? '' : '%'}`}</StatTextSm>
      </Flex>,
    )
  }

  return (
    <Flex vertical gap={1} align='center' style={{ paddingLeft: 4, paddingRight: 6, marginBottom: 1 }}>
      <Flex vertical align='center'>
        <HeaderText style={{ fontSize: 16 }}>
          {t('CombatStats')/* Combat Stats */}
        </HeaderText>
      </Flex>
      {rows}
    </Flex>
  )
}

function Arrow() {
  return (
    <Flex style={{}} align='center'>
      <UpArrow/>
    </Flex>
  )
}

export function CharacterCardScoringStatUpgrades(props: { result: SimulationScore }) {
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
        <StatTextSm>{`+ ${(upgradeDmg * 100).toFixed(2)}%`}</StatTextSm>
      </Flex>,
    )
  }

  const extraRows: ReactElement[] = []

  const mainUpgrade = result.mainUpgrades[0]
  if (mainUpgrade && mainUpgrade.percent! - basePercent > 0) {
    const part = mainUpgrade.part as Parts
    const stat = mainUpgrade.stat
    const upgradeDmg = mainUpgrade.simulationResult.simScore / baseDmg - 1

    extraRows.push(
      <Flex gap={3} key={Utils.randomId()} justify='space-between' align='center' style={{ width: '100%', paddingLeft: 1 }}>
        <img src={Assets.getPart(part)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
        <StatTextSm>{`➔ ${t(`ShortReadableStats.${stat as MainStats}`)}`}</StatTextSm>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
        <StatTextSm>{`+ ${(upgradeDmg * 100).toFixed(2)}%`}</StatTextSm>
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
        <StatTextSm>{`+ ${(upgradeDmg * 100).toFixed(2)}%`}</StatTextSm>
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
