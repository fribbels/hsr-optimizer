import { applyTeamAwareSetConditionalPresetsToStore } from 'lib/conditionals/evaluation/applyPresets'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import DB from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
import { generateConditionalResolverMetadata } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import {
  calculateTeammateSets,
  countTeammates,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/teammateCardUtils'
import {
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

  useOptimizerUIStore.getState().setTeammateCount(countTeammates())

  if (updatedTeammate.lightCone) {
    const store = useOptimizerFormStore.getState()
    const teammate = store.teammates[teammateIndex]
    const conditionalResolverMetadata = generateConditionalResolverMetadata(teammate as any, DB.getMetadata())
    const controller = LightConeConditionalsResolver.get(conditionalResolverMetadata)

    if (!controller.teammateDefaults) return

    const mergedConditionals = Object.assign({}, controller.teammateDefaults(), teammate.lightConeConditionals)
    useOptimizerFormStore.getState().setTeammateField(teammateIndex, 'lightConeConditionals', mergedConditionals)
  } else if (updatedTeammate.characterId) {
    const teammateCharacterId = updatedTeammate.characterId

    const store = useOptimizerFormStore.getState()
    const currentTeammate = store.teammates[teammateIndex]
    const teammateCharacter = DB.getCharacterById(teammateCharacterId)

    let lightCone = currentTeammate.lightCone
    let lightConeSuperimposition = currentTeammate.lightConeSuperimposition
    let characterEidolon = currentTeammate.characterEidolon
    let teamRelicSet = currentTeammate.teamRelicSet
    let teamOrnamentSet = currentTeammate.teamOrnamentSet

    if (teammateCharacter) {
      // Fill out fields based on the teammate's form
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

    const characterConditionals = CharacterConditionalsResolver.get({
      characterId: teammateCharacterId,
      characterEidolon: characterEidolon,
    })

    let characterConditionalsValues = currentTeammate.characterConditionals
    if (characterConditionals.teammateDefaults) {
      characterConditionalsValues = Object.assign({}, characterConditionals.teammateDefaults(), characterConditionalsValues)
    }

    // Update all teammate fields at once
    const storeActions = useOptimizerFormStore.getState()
    storeActions.setTeammateField(teammateIndex, 'characterId', teammateCharacterId)
    storeActions.setTeammateField(teammateIndex, 'characterEidolon', characterEidolon)
    storeActions.setTeammateField(teammateIndex, 'lightCone', lightCone)
    storeActions.setTeammateField(teammateIndex, 'lightConeSuperimposition', lightConeSuperimposition)
    storeActions.setTeammateField(teammateIndex, 'teamRelicSet', teamRelicSet)
    storeActions.setTeammateField(teammateIndex, 'teamOrnamentSet', teamOrnamentSet)
    storeActions.setTeammateField(teammateIndex, 'characterConditionals', characterConditionalsValues)

    applyTeamAwareSetConditionalPresetsToStore()
  } else if (updatedTeammate.characterId === null) {
    useOptimizerFormStore.getState().clearTeammate(teammateIndex)
  } else if (updatedTeammate.lightCone === null) {
    useOptimizerFormStore.getState().clearTeammateLightCone(teammateIndex)
  }
}
