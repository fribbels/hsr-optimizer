import { applyTeamAwareSetConditionalPresetsToStore } from 'lib/conditionals/evaluation/applyPresets'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getCharacterById } from 'lib/stores/character/characterStore'
import { resolveLcDefaults } from 'lib/stores/optimizerForm/optimizerFormStoreActions'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { calculateTeammateSets } from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/teammateCardUtils'
import type {
  Form,
  TeammateProperty,
} from 'types/form'

const TEAMMATE_PROPERTIES: TeammateProperty[] = ['teammate0', 'teammate1', 'teammate2']

const PROPERTY_TO_INDEX: Record<string, 0 | 1 | 2> = { teammate0: 0, teammate1: 1, teammate2: 2 }

export function updateTeammate(changedValues: Partial<Form>) {
  const property = TEAMMATE_PROPERTIES.find((p) => changedValues[p])
  const updatedTeammate = property && changedValues[property]
  if (!updatedTeammate) return
  const teammateIndex = PROPERTY_TO_INDEX[property]

  if (updatedTeammate.lightCone) {
    const store = useOptimizerRequestStore.getState()
    const teammate = store.teammates[teammateIndex]

    const lcDefaults = resolveLcDefaults(teammate as any, getGameMetadata(), true)
    if (!lcDefaults) return

    const mergedConditionals = { ...lcDefaults, ...teammate.lightConeConditionals }
    useOptimizerRequestStore.getState().setTeammateField(teammateIndex, 'lightConeConditionals', mergedConditionals)
  } else if (updatedTeammate.characterId) {
    const teammateCharacterId = updatedTeammate.characterId

    const store = useOptimizerRequestStore.getState()
    const currentTeammate = store.teammates[teammateIndex]
    const teammateCharacter = getCharacterById(teammateCharacterId)

    let lightCone = currentTeammate.lightCone
    let lightConeSuperimposition = currentTeammate.lightConeSuperimposition
    let characterEidolon = currentTeammate.characterEidolon
    let teamRelicSet = currentTeammate.teamRelicSet
    let teamOrnamentSet = currentTeammate.teamOrnamentSet

    if (teammateCharacter) {
      lightCone = teammateCharacter.form.lightCone
      lightConeSuperimposition = teammateCharacter.form.lightConeSuperimposition || 1
      characterEidolon = teammateCharacter.form.characterEidolon
      const activeTeammateSets = calculateTeammateSets(teammateCharacter)
      teamRelicSet = activeTeammateSets.teamRelicSet
      teamOrnamentSet = activeTeammateSets.teamOrnamentSet
    } else {
      lightConeSuperimposition = 1
      characterEidolon = 0
    }

    const charController = CharacterConditionalsResolver.get({
      characterId: teammateCharacterId,
      characterEidolon: characterEidolon,
    })

    let characterConditionalsValues = currentTeammate.characterConditionals
    if (charController.teammateDefaults) {
      characterConditionalsValues = { ...charController.teammateDefaults(), ...characterConditionalsValues }
    }

    let lightConeConditionalsValues = currentTeammate.lightConeConditionals
    if (lightCone) {
      const lcDefaults = resolveLcDefaults({
        characterId: teammateCharacterId,
        characterEidolon,
        lightCone,
        lightConeSuperimposition,
      }, getGameMetadata(), true)
      if (lcDefaults) {
        lightConeConditionalsValues = { ...lcDefaults, ...lightConeConditionalsValues }
      }
    }

    useOptimizerRequestStore.getState().setTeammate(teammateIndex, {
      characterId: teammateCharacterId,
      characterEidolon,
      lightCone,
      lightConeSuperimposition,
      teamRelicSet,
      teamOrnamentSet,
      characterConditionals: characterConditionalsValues,
      lightConeConditionals: lightConeConditionalsValues,
    })

    applyTeamAwareSetConditionalPresetsToStore()
  } else if (updatedTeammate.characterId === null) {
    useOptimizerRequestStore.getState().clearTeammate(teammateIndex)
  } else if (updatedTeammate.lightCone === null) {
    useOptimizerRequestStore.getState().clearTeammateLightCone(teammateIndex)
  }
}
