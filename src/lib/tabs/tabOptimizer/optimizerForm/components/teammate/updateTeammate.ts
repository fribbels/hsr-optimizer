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
    if (!teammate.characterId) return
    const lightConeChanged = teammate.lightCone !== updatedTeammate.lightCone

    const lcDefaults = resolveLcDefaults({
      characterId: teammate.characterId,
      characterEidolon: teammate.characterEidolon,
      lightCone: updatedTeammate.lightCone,
      lightConeSuperimposition: teammate.lightConeSuperimposition,
    }, getGameMetadata(), true)
    const lightConeConditionals = lightConeChanged
      ? { ...lcDefaults }
      : { ...lcDefaults, ...teammate.lightConeConditionals }

    store.setTeammateField(teammateIndex, 'lightCone', updatedTeammate.lightCone)
    store.setTeammateField(teammateIndex, 'lightConeConditionals', lightConeConditionals)
  } else if (updatedTeammate.characterId) {
    const teammateCharacterId = updatedTeammate.characterId

    const store = useOptimizerRequestStore.getState()
    const currentTeammate = store.teammates[teammateIndex]
    const teammateCharacter = getCharacterById(teammateCharacterId)
    const characterChanged = currentTeammate.characterId !== teammateCharacterId

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

    const characterDefaults = charController.teammateDefaults?.()
    const characterConditionalsValues = characterChanged
      ? { ...characterDefaults }
      : { ...characterDefaults, ...currentTeammate.characterConditionals }

    const lightConeChanged = currentTeammate.lightCone !== lightCone
    const lcDefaults = lightCone
      ? resolveLcDefaults(
        {
          characterId: teammateCharacterId,
          characterEidolon,
          lightCone,
          lightConeSuperimposition,
        },
        getGameMetadata(),
        true,
      )
      : undefined
    const lightConeConditionalsValues = lightConeChanged
      ? { ...lcDefaults }
      : { ...lcDefaults, ...currentTeammate.lightConeConditionals }

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
