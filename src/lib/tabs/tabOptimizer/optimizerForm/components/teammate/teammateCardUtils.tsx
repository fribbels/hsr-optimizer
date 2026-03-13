import { Flex } from '@mantine/core'
import { TFunction } from 'i18next'
import {
  Constants,
  SACERDOS_RELIVED_ORDEAL_1_STACK,
  SACERDOS_RELIVED_ORDEAL_2_STACK,
  Sets,
} from 'lib/constants/constants'
import { teammateOrnamentOptions, teammateRelicOptions } from 'lib/sets/setConfigRegistry'
import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
import { getRelicById } from 'lib/stores/relicStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { ArrayFilters } from 'lib/utils/arrayUtils'
import { Character } from 'types/character'
import { ReactElement } from 'types/components'

export const rightPanelWidth = 110

export const parentW = rightPanelWidth
export const parentH = rightPanelWidth

export const lcWidth = 120

export const lcParentW = lcWidth
export const lcParentH = lcWidth
export const lcInnerW = lcWidth
export const lcInnerH = lcWidth

export const cardHeight = 490

export function optionRenderer() {
  return (option: {
    data: {
      value: string
      desc: string
    }
  }) => (
    option.data.value
      ? (
        <Flex gap={10} align='center'>
          <Flex>
            <img
              src={Assets.getSetImage(option.data.value, Constants.Parts.PlanarSphere)}
              className={iconClasses.icon26}
            />
          </Flex>
          {option.data.desc}
        </Flex>
      )
      : (
        <div>
          None
        </div>
      )
  )
}

export const labelRender = (set: string, text: string) => (
  <Flex align='center' gap={3}>
    <img src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)} className={iconClasses.icon20} />
    <div style={{ fontSize: 12 }}>
      {text}
    </div>
  </Flex>
)

const teammateRelicSets = [
  Sets.MessengerTraversingHackerspace,
  Sets.WatchmakerMasterOfDreamMachinations,
  Sets.SacerdosRelivedOrdeal,
  Sets.WarriorGoddessOfSunAndThunder,
  Sets.WorldRemakingDeliverer,
  Sets.DivinerOfDistantReach,
]
const teammateOrnamentSets = [
  Sets.BrokenKeel,
  Sets.FleetOfTheAgeless,
  Sets.PenaconyLandOfTheDreams,
  Sets.LushakaTheSunkenSeas,
  Sets.AmphoreusTheEternalLand,
]

// Find 4 piece relic sets and 2 piece ornament sets
export function calculateTeammateSets(teammateCharacter: Character) {
  const relics = Object.values(teammateCharacter.equipped).map((id) => getRelicById(id)).filter(ArrayFilters.nonNullable)
  const activeTeammateSets: {
    teamRelicSet?: string
    teamOrnamentSet?: string
  } = {}
  for (const set of teammateRelicSets) {
    if (relics.filter((relic) => relic.set == set).length == 4) {
      if (set == Sets.MessengerTraversingHackerspace) continue
      if (set == Sets.SacerdosRelivedOrdeal) {
        if (
          teammateCharacter.id == '1313' // Sunday
          || teammateCharacter.id == '1306' // Sparkle
        ) {
          activeTeammateSets.teamRelicSet = SACERDOS_RELIVED_ORDEAL_2_STACK
        } else {
          activeTeammateSets.teamRelicSet = SACERDOS_RELIVED_ORDEAL_1_STACK
        }
      } else {
        activeTeammateSets.teamRelicSet = set
      }
    }
  }

  for (const set of teammateOrnamentSets) {
    if (relics.filter((relic) => relic.set == set).length == 2) {
      activeTeammateSets.teamOrnamentSet = set
    }
  }

  return activeTeammateSets
}

export function countTeammates() {
  const state = useOptimizerRequestStore.getState()
  return state.teammates.filter((teammate) => teammate?.characterId).length
}

export type OptionRender = {
  value: string
  desc: string
  label: ReactElement
}

export function renderTeammateRelicSetOptions(t: TFunction<'optimizerTab', 'TeammateCard'>) {
  return () => {
    return teammateRelicOptions.map((option) => ({
      value: option.value,
      desc: option.desc(t),
      label: labelRender(option.value, option.label(t)),
    }))
  }
}

export function renderTeammateOrnamentSetOptions(t: TFunction<'optimizerTab', 'TeammateCard'>) {
  return () => {
    return teammateOrnamentOptions.map((option) => ({
      value: option.value,
      desc: option.desc(t),
      label: labelRender(option.value, option.label(t)),
    }))
  }
}
