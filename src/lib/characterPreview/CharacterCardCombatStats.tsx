import {
  Divider,
  Flex,
} from 'antd'
import { UpArrow } from 'icons/UpArrow'
import { damageStats } from 'lib/characterPreview/StatRow'
import { StatTextSm } from 'lib/characterPreview/StatText'
import {
  ElementName,
  ElementToDamage,
  ElementToStatKeyDmgBoost,
  Stats,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { iconSize } from 'lib/constants/constantsUi'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { Assets } from 'lib/rendering/assets'
import {
  SimulationScore,
  StatsToStatKey,
} from 'lib/scoring/simScoringUtils'
import { PrimaryActionStats } from 'lib/simulations/statSimulationTypes'
import { HeaderText } from 'lib/ui/HeaderText'
import {
  filterUnique,
  getIndexOf,
} from 'lib/utils/arrayUtils'
import {
  localeNumber,
  localeNumber_0,
  localeNumber_000,
} from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { DBMetadataCharacter } from 'types/metadata'

export function CharacterCardCombatStats(props: {
  result: SimulationScore,
}) {
  const { t } = useTranslation('common')
  const { t: tCharactersTab } = useTranslation('charactersTab')
  const preciseSpd = window.store((s) => s.savedSession[SavedSessionKeys.showcasePreciseSpd])

  const { result } = props

  const characterMetadata = result.characterMetadata!
  const element = characterMetadata.element as ElementName
  const x = result.originalSimResult.x
  const primaryActionStats = result.originalSimResult.primaryActionStats

  const upgradeStats: StatsValues[] = pickCombatStats(characterMetadata)
  const upgradeDisplayWrappers = aggregateCombatStats(x, upgradeStats, preciseSpd, element, primaryActionStats)

  const rows: ReactElement[] = []

  for (const wrapper of upgradeDisplayWrappers) {
    const { stat, display, flat, upgraded } = wrapper

    const statName = stat.includes('DMG Boost') ? t('DamagePercent') : t(`ReadableStats.${stat}`)

    // Best arrows 🠙 🠡 🡑 🠙 ↑ ↑ ⬆
    rows.push(
      <Flex key={Utils.randomId()} justify='space-between' align='center' style={{ width: '100%' }}>
        <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }} />
        <Flex gap={1} align='center'>
          <StatTextSm>
            {statName}
          </StatTextSm>
          {upgraded && <Arrow />}
        </Flex>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
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
  stat: StatsValues,
  display: string,
  flat: boolean,
  upgraded: boolean,
}

function aggregateCombatStats(
  x: ComputedStatsContainer,
  upgradeStats: StatsValues[],
  preciseSpd: boolean,
  element: ElementName,
  primaryActionStats?: PrimaryActionStats,
) {
  const displayWrappers: StatDisplayWrapper[] = []

  for (const stat of upgradeStats) {
    if (percentFlatStats[stat]) continue

    const flat = Utils.isFlat(stat)
    const xaValue = getStatValue(x, stat, element, primaryActionStats!)
    const caValue = getBasicStatValue(x, stat, element)
    const upgraded = Utils.precisionRound(xaValue, 2) != Utils.precisionRound(caValue, 2)

    let display = localeNumber(Math.floor(xaValue))
    if (stat == Stats.SPD) {
      display = preciseSpd
        ? localeNumber_000(TsUtils.precisionRound(xaValue, 3))
        : localeNumber_0(Utils.truncate10ths(TsUtils.precisionRound(xaValue, 3)))
    } else if (!flat) {
      display = localeNumber_0(Utils.truncate10ths(TsUtils.precisionRound(xaValue * 100, 4)))
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

const percentFlatStats: Record<string, boolean> = {
  [Stats.ATK_P]: true,
  [Stats.DEF_P]: true,
  [Stats.HP_P]: true,
}

// Get stat value from Container with primary action's boosts included.
// For memosprite characters, the source entity (memosprite) may differ from entity 0 (main character).
// primaryActionStats contains fully resolved values from the source entity at primary action time,
// matching the damage formula: cr = CR + CR_BOOST, cd = CD + CD_BOOST, dmg = DMG_BOOST + elementBoost.
function getStatValue(
  x: ComputedStatsContainer,
  stat: StatsValues,
  element: ElementName,
  primaryActionStats: PrimaryActionStats,
): number {
  // Handle elemental DMG stats: source entity's element boost + generic DMG_BOOST (action+hit)
  if (damageStats[stat]) {
    return primaryActionStats.sourceEntityElementDmgBoost + primaryActionStats.DMG_BOOST
  }

  // For CR and CD, use the fully resolved source entity values (already includes CR_BOOST/CD_BOOST)
  if (stat === Stats.CR) {
    return primaryActionStats.sourceEntityCR
  }
  if (stat === Stats.CD) {
    return primaryActionStats.sourceEntityCD
  }

  const statKey = StatsToStatKey[stat]
  return x.getActionValueByIndex(statKey, SELF_ENTITY_INDEX)
}

// Get basic stat value from Container's basic stats array
function getBasicStatValue(x: ComputedStatsContainer, stat: StatsValues, element: ElementName): number {
  // Handle elemental DMG stats
  if (damageStats[stat]) {
    return x.c.a[ElementToStatKeyDmgBoost[element]]
  }

  const statKey = StatsToStatKey[stat]
  // Basic stats use the same indices 0-14 for core stats
  return x.c.a[statKey]
}

function Arrow() {
  return (
    <Flex align='center'>
      <UpArrow />
    </Flex>
  )
}
