import { UpArrow } from 'icons/UpArrow'
import { damageStats } from 'lib/characterPreview/StatRow'
import { StatTextSm } from 'lib/characterPreview/StatText'
import {
  type ElementName,
  ElementToDamage,
  PathNames,
  Stats,
  type StatsValues,
  SubStats,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { BasicStatToKey } from 'lib/optimization/basicStatsArray'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { Assets } from 'lib/rendering/assets'
import {
  StatsToStatKey,
} from 'lib/scoring/simScoringUtils'
import {
  type PrimaryActionStats,
  type RunStatSimulationsResult,
} from 'lib/simulations/statSimulationTypes'
import { useGlobalStore } from 'lib/stores/app/appStore'
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
import {
  precisionRound,
  truncate10ths,
} from 'lib/utils/mathUtils'
import { isFlat } from 'lib/utils/statUtils'
import {
  memo,
  type ReactElement,
} from 'react'
import { useTranslation } from 'react-i18next'
import iconClasses from 'style/icons.module.css'
import { type DBMetadataCharacter } from 'types/metadata'

export const CharacterCardCombatStats = memo(function CharacterCardCombatStats({ characterMetadata, originalSimResult, deprioritizeBuffs }: {
  characterMetadata: DBMetadataCharacter,
  originalSimResult: RunStatSimulationsResult,
  deprioritizeBuffs: boolean,
}) {
  const { t } = useTranslation('common')
  const { t: tCharactersTab } = useTranslation('charactersTab')
  const preciseSpd = useGlobalStore((s) => s.savedSession[SavedSessionKeys.showcasePreciseSpd])

  const element = characterMetadata.element as ElementName
  const x = originalSimResult.x
  const primaryActionStats = originalSimResult.primaryActionStats

  const upgradeStats: StatsValues[] = pickCombatStats(characterMetadata)
  const upgradeDisplayWrappers = aggregateCombatStats(x, upgradeStats, preciseSpd, element, primaryActionStats)

  const rows: ReactElement[] = []

  for (const wrapper of upgradeDisplayWrappers) {
    const { stat, display, flat, upgraded } = wrapper

    const isElationDmg = stat === Stats.Elation
    const isElementalDmg = !isElationDmg && stat.includes('DMG Boost')
    const statName = isElementalDmg ? t('DamagePercent') : t(`ReadableStats.${stat}`)

    // Best arrows 🠙 🠡 🡑 🠙 ↑ ↑ ⬆
    rows.push(
      <div key={stat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <img src={Assets.getStatIcon(stat)} className={iconClasses.statIconSpaced} />
        <div style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <StatTextSm>
            {statName}
          </StatTextSm>
          {upgraded && <Arrow />}
        </div>
        <CombatStatDivider />
        <StatTextSm>{`${display}${flat ? '' : '%'}`}</StatTextSm>
      </div>,
    )
  }

  const titleRender = deprioritizeBuffs
    ? tCharactersTab('CharacterPreview.DetailsSlider.Labels.SubDpsCombatStats')
    : tCharactersTab('CharacterPreview.DetailsSlider.Labels.CombatStats')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: 4, paddingRight: 6, marginBottom: 1 }}>
      <HeaderText style={{ fontSize: 16, textDecoration: 'none' }}>
        {titleRender}
      </HeaderText>
      {rows}
    </div>
  )
})

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

    const flat = isFlat(stat)
    const xaValue = getStatValue(x, stat, element, primaryActionStats!)
    const caValue = getBasicStatValue(x, stat, element)
    const upgraded = precisionRound(xaValue, 2) !== precisionRound(caValue, 2)

    let display = localeNumber(Math.floor(xaValue))
    if (stat === Stats.SPD) {
      display = preciseSpd
        ? localeNumber_000(precisionRound(xaValue, 3))
        : localeNumber_0(truncate10ths(precisionRound(xaValue, 3)))
    } else if (!flat) {
      display = localeNumber_0(truncate10ths(precisionRound(xaValue * 100, 4)))
    }

    displayWrappers.push({
      stat,
      upgraded,
      display,
      flat,
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

  if (characterMetadata.path === PathNames.Elation) {
    substats.push(Stats.Elation)
  }

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
  // Handle Elation DMG stat separately - it's not tied to the character's element
  if (stat === Stats.Elation) {
    const statKey = StatsToStatKey[stat]
    return x.getActionValueByIndex(statKey, SELF_ENTITY_INDEX)
  }

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
  // Elation is in damageStats but not element-specific
  if (stat === Stats.Elation) {
    return x.c.a[BasicStatToKey[stat]]
  }

  if (damageStats[stat]) {
    return x.c.a[BasicStatToKey[ElementToDamage[element] as StatsValues]]
  }

  return x.c.a[BasicStatToKey[stat]]
}

function Arrow() {
  return (
    <div>
      <UpArrow />
    </div>
  )
}

function CombatStatDivider() {
  return <span style={{ margin: 'auto 10px', flexGrow: 1, borderBottom: '1px dashed rgba(255, 255, 255, 0.10)' }} />
}
