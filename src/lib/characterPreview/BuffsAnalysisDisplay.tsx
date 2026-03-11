import { Flex, Table } from '@mantine/core'
import i18next from 'i18next'
import styles from 'lib/characterPreview/BuffsAnalysisDisplay.module.css'
import { SetKey, Sets } from 'lib/constants/constants'
import { setToId } from 'lib/sets/setConfigRegistry'
import {
  BUFF_ABILITY,
  BUFF_TYPE,
} from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/basicStatsArray'
import { AKeyType } from 'lib/optimization/engine/config/keys'
import { newStatsConfig, StatConfigEntry } from 'lib/optimization/engine/config/statsConfig'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { Assets } from 'lib/rendering/assets'
import {
  originalScoringParams,
  SimulationScore,
} from 'lib/scoring/simScoringUtils'
import { aggregateCombatBuffs } from 'lib/simulations/combatBuffsAnalysis'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { currentLocale } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

type BuffsAnalysisProps = {
  result?: SimulationScore,
  buffGroups?: Record<BUFF_TYPE, Record<string, Buff[]>>,
  singleColumn?: boolean,
  size?: BuffDisplaySize,
}

function getStatConfig(stat: string): StatConfigEntry | undefined {
  return newStatsConfig[stat as AKeyType]
}

export function BuffsAnalysisDisplay(props: BuffsAnalysisProps) {
  const buffGroups = props.buffGroups ?? rerunSim(props.result)

  if (!buffGroups) {
    return <></>
  }

  const buffsDisplayLeft: ReactElement[] = []
  const buffsDisplayRight: ReactElement[] = []
  let groupKey = 0

  const size = props.size ?? BuffDisplaySize.SMALL

  for (const [id, buffs] of Object.entries(buffGroups.PRIMARY)) {
    buffsDisplayLeft.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.PRIMARY} key={groupKey++} size={size} />)
  }

  for (const [id, buffs] of Object.entries(buffGroups.SETS)) {
    buffsDisplayLeft.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.SETS} key={groupKey++} size={size} />)
  }

  for (const [id, buffs] of Object.entries(buffGroups.CHARACTER)) {
    buffsDisplayRight.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.CHARACTER} key={groupKey++} size={size} />)
  }

  for (const [id, buffs] of Object.entries(buffGroups.LIGHTCONE)) {
    buffsDisplayRight.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.LIGHTCONE} key={groupKey++} size={size} />)
  }

  if (props.singleColumn) {
    return (
      <Flex gap={20} direction="column">
        {buffsDisplayLeft}
        {buffsDisplayRight}
      </Flex>
    )
  }

  return (
    <Flex justify='space-between' className={styles.fullWidth}>
      <Flex gap={20} direction="column">
        {buffsDisplayLeft}
      </Flex>
      <Flex gap={20} direction="column">
        {buffsDisplayRight}
      </Flex>
    </Flex>
  )
}

function rerunSim(result?: SimulationScore) {
  if (!result) return null
  result.simulationForm.trace = true
  const context = generateContext(result.simulationForm)
  const rerun = runStatSimulations([result.originalSim], result.simulationForm, context, originalScoringParams)[0]
  return aggregateCombatBuffs(rerun.x, result.simulationForm)
}

function BuffGroup(props: { id: string, buffs: Buff[], buffType: BUFF_TYPE, size: BuffDisplaySize }) {
  const { i18n } = useTranslation() // needed to trigger re-render on language change
  const { id, buffs, buffType, size } = props

  let src
  if (buffType == BUFF_TYPE.PRIMARY) src = Assets.getCharacterAvatarById(id)
  else if (buffType == BUFF_TYPE.CHARACTER) src = Assets.getCharacterAvatarById(id)
  else if (buffType == BUFF_TYPE.LIGHTCONE) src = Assets.getLightConeIconById(id)
  else if (buffType == BUFF_TYPE.SETS) src = Assets.getSetImage(Sets[id as SetKey])
  else src = Assets.getBlank()

  return (
    <Flex align='center' gap={5}>
      <img src={src} className={styles.groupImage} />

      <BuffTable buffs={buffs} size={size} />
    </Flex>
  )
}

type BuffTableItem = {
  key: number,
  value: string,
  statLabel: string,
  sourceLabel: string,
}

function BuffTable(props: { buffs: Buff[], size: BuffDisplaySize }) {
  const { buffs } = props
  const { t: tOptimizerTab } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay' })
  const { t: tGameData } = useTranslation('gameData')
  const size = props.size ?? BuffDisplaySize.SMALL

  const data = buffs.map((buff, i) => {
    const stat = buff.stat
    const config = getStatConfig(stat)
    const percent = !config?.flat
    const bool = config?.bool
    const statLabel = translatedLabel(stat, buff.memo)

    let sourceLabel: string
    const source = buff.source
    switch (source.buffType) {
      case BUFF_TYPE.CHARACTER:
        if (source.ability === BUFF_ABILITY.CYRENE_ODE_TO) {
          sourceLabel = tGameData('Characters.1415.Name')
        } else {
          sourceLabel = tOptimizerTab(`Sources.${source.ability}`)
        }
        break
      case BUFF_TYPE.LIGHTCONE:
        sourceLabel = tGameData(`Lightcones.${source.id}.Name`)
        break
      case BUFF_TYPE.SETS:
        sourceLabel = tGameData(`RelicSets.${setToId[Sets[source.id]]}.Name`)
        break
      default:
        sourceLabel = source.label
    }
    let value
    if (bool) {
      value = tOptimizerTab(`Values.${buff.value ? 'BoolTrue' : 'BoolFalse'}`)
    } else if (percent) {
      value = TsUtils.precisionRound(buff.value * 100, 2).toLocaleString(currentLocale()) + ' %'
    } else {
      value = TsUtils.precisionRound(buff.value, 0).toLocaleString(currentLocale())
    }

    return {
      key: i,
      value: value,
      statLabel: statLabel,
      sourceLabel: sourceLabel,
    } as BuffTableItem
  })

  return (
    <Table
      className={styles.buffTable}
      style={{ width: size }}
    >
      <Table.Tbody>
        {data.map((row) => (
          <Table.Tr key={row.key}>
            <Table.Td className={styles.valueCell}>
              <span className={styles.noWrap}>{row.value}</span>
            </Table.Td>
            <Table.Td>
              <Flex justify='space-between'>
                <span className={styles.statLabel}>
                  {row.statLabel}
                </span>
                <span className={styles.sourceLabel}>
                  {row.sourceLabel}
                </span>
              </Flex>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export enum BuffDisplaySize {
  SMALL = 390,
  LARGE = 450,
}

function translatedLabel(stat: string, isMemo = false): string {
  const config = getStatConfig(stat)
  if (!config) return stat

  const label = config.label
  if (typeof label === 'string') {
    return isMemo ? i18next.t('MemospriteLabel', { label }) as string : label
  }

  // SimpleLabel with ns/key properties
  // @ts-ignore
  const finalLabel: string = i18next.t(`${label.ns}:${label.key}`, label.args)
  return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) as string : finalLabel
}
