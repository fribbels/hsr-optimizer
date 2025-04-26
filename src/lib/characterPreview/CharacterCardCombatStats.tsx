import { Divider, Flex } from 'antd'
import { UpArrow } from 'icons/UpArrow'
import { damageStats } from 'lib/characterPreview/StatRow'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { ElementToDamage, Stats, StatsValues, SubStats } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { iconSize } from 'lib/constants/constantsUi'
import { Key, StatToKey } from 'lib/optimization/computedStatsArray'
import { SortOptionProperties } from 'lib/optimization/sortOptions'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import { HeaderText } from 'lib/ui/HeaderText'
import { filterUnique, getIndexOf } from 'lib/utils/arrayUtils'
import { localeNumber, localeNumber_0, localeNumber_000 } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { DBMetadataCharacter } from 'types/metadata'

export function CharacterCardCombatStats(props: {
  result: SimulationScore
}) {
  const { t } = useTranslation('common')
  const { t: tCharactersTab } = useTranslation('charactersTab')
  const preciseSpd = window.store((s) => s.savedSession[SavedSessionKeys.showcasePreciseSpd])

  const { result } = props

  const characterMetadata = result.characterMetadata!
  const sortOption = characterMetadata.scoringMetadata.sortOption
  const xa = new Float32Array(result.originalSimResult.xa)
  const ca = result.originalSimResult.ca

  addOnHitStats(xa, sortOption)
  const upgradeStats: StatsValues[] = pickCombatStats(characterMetadata)
  const upgradeDisplayWrappers = aggregateCombatStats(xa, ca, upgradeStats, preciseSpd)

  const rows: ReactElement[] = []

  for (const wrapper of upgradeDisplayWrappers) {
    const { stat, display, flat, upgraded } = wrapper

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

type StatDisplayWrapper = {
  stat: StatsValues
  display: string
  flat: boolean
  upgraded: boolean
}

function aggregateCombatStats(xa: Float32Array, ca: Float32Array, upgradeStats: StatsValues[], preciseSpd: boolean) {
  const displayWrappers: StatDisplayWrapper[] = []
  for (const stat of upgradeStats) {
    if (percentFlatStats[stat]) continue

    const flat = Utils.isFlat(stat)
    const value = damageStats[stat] ? xa[Key.ELEMENTAL_DMG] : xa[StatToKey[stat]]
    const upgraded = damageStats[stat]
      ? Utils.precisionRound(xa[Key.ELEMENTAL_DMG], 2) != Utils.precisionRound(ca[Key.ELEMENTAL_DMG], 2)
      : Utils.precisionRound(xa[StatToKey[stat]], 2) != Utils.precisionRound(ca[StatToKey[stat]], 2)

    let display = localeNumber(Math.floor(value))
    if (stat == Stats.SPD) {
      display = preciseSpd
        ? localeNumber_000(TsUtils.precisionRound(value, 4))
        : localeNumber_0(Utils.truncate10ths(TsUtils.precisionRound(value, 4)))
    } else if (!flat) {
      display = localeNumber_0(Utils.truncate10ths(TsUtils.precisionRound(value * 100, 4)))
    }

    displayWrappers.push({
      stat: stat,
      upgraded: upgraded,
      display: display,
      flat: flat,
    })
  }

  return displayWrappers
}

function pickCombatStats(characterMetadata: DBMetadataCharacter) {
  const simulationMetadata = characterMetadata.scoringMetadata.simulation!
  const elementalDmgValue = ElementToDamage[characterMetadata.element]

  let substats: StatsValues[] = [...simulationMetadata.substats as SubStats[]]

  substats.push(Stats.SPD)

  // Dedupe, remove flats, standardize order
  substats = filterUnique(substats).filter((x) => !percentFlatStats[x])
  substats.sort((a, b) => getIndexOf(SubStats, a) - getIndexOf(SubStats, b))
  substats.push(elementalDmgValue)

  return substats
}

function addOnHitStats(xa: Float32Array, sortOption: SortOptionProperties) {
  const ability = sortOption.key as keyof typeof AbilityType
  const abilityDmgBoost = xa[Key[`${ability}_DMG_BOOST`]]
  const abilityCrBoost = xa[Key[`${ability}_CR_BOOST`]]
  const abilityCdBoost = xa[Key[`${ability}_CD_BOOST`]]

  xa[Key.ELEMENTAL_DMG] += abilityDmgBoost

  if (abilityCrBoost > 0) xa[Key.CR] += abilityCrBoost + xa[Key.CR_BOOST]
  if (abilityCdBoost > 0) xa[Key.CD] += abilityCdBoost + xa[Key.CD_BOOST]
}

const percentFlatStats: Record<string, boolean> = {
  [Stats.ATK_P]: true,
  [Stats.DEF_P]: true,
  [Stats.HP_P]: true,
}

function Arrow() {
  return (
    <Flex align='center'>
      <UpArrow/>
    </Flex>
  )
}
