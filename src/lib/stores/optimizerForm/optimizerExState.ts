import {
  getLightningLordMaxHits,
  JingYuan,
  LIGHTNING_LORD_MIN_HITS,
  LIGHTNING_LORD_MIN_STACKS,
} from 'lib/conditionals/character/1200/JingYuan'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { patchComboConditionalDefault } from 'lib/stores/optimizerForm/optimizerFormConversions'
import type {
  OptimizerRequestState,
  TeammateState,
} from 'lib/stores/optimizerForm/optimizerFormTypes'
import {
  type CharacterId,
  type ExFlags,
} from 'types/character'
import type { ConditionalValueMap } from 'types/conditionals'

function clampExConditionals(characterId: CharacterId | undefined, mask: ExFlags, conditionals: ConditionalValueMap): ConditionalValueMap {
  if (characterId !== JingYuan.id) return conditionals

  const maxHits = getLightningLordMaxHits(mask)
  const next = { ...conditionals }

  if (typeof next.talentHitsPerAction === 'number') {
    next.talentHitsPerAction = Math.min(maxHits, Math.max(LIGHTNING_LORD_MIN_STACKS, next.talentHitsPerAction))
  }

  if (typeof next.talentAttacks === 'number') {
    next.talentAttacks = Math.min(maxHits, Math.max(LIGHTNING_LORD_MIN_HITS, next.talentAttacks))
  }

  const unchanged = next.talentHitsPerAction === conditionals.talentHitsPerAction
    && next.talentAttacks === conditionals.talentAttacks

  return unchanged ? conditionals : next
}

function clampExComboDefaults(json: string, previous: ConditionalValueMap, next: ConditionalValueMap, teammateIndex?: 0 | 1 | 2): string {
  const changed: ConditionalValueMap = {}

  for (const [key, value] of Object.entries(next)) {
    if (value !== previous[key]) changed[key] = value
  }

  if (Object.keys(changed).length === 0) return json

  return patchComboConditionalDefault(json, 'character', changed, teammateIndex)
}

// Update controls and sorting after applying character/build overrides.
export function normalizeExState(state: OptimizerRequestState): OptimizerRequestState {
  const characterConditionals = clampExConditionals(state.characterId, state.characterEx, state.characterConditionals)
  let comboStateJson = clampExComboDefaults(state.comboStateJson, state.characterConditionals, characterConditionals)

  const teammates: [TeammateState, TeammateState, TeammateState] = [...state.teammates]

  for (const index of [0, 1, 2] as const) {
    const teammate = teammates[index]
    const conditionals = clampExConditionals(teammate.characterId, teammate.characterEx, teammate.characterConditionals)
    if (conditionals === teammate.characterConditionals) continue

    comboStateJson = clampExComboDefaults(comboStateJson, teammate.characterConditionals, conditionals, index)
    teammates[index] = { ...teammate, characterConditionals: conditionals }
  }

  let resultSort = state.resultSort

  if (resultSort === SortOption.FUA.key && state.characterId) {
    const controller = CharacterConditionalsResolver.get({
      characterId: state.characterId,
      characterEidolon: state.characterEidolon,
      characterEx: state.characterEx,
    })

    if (!controller.actionDeclaration().includes(AbilityKind.FUA)) {
      resultSort = SortOption.COMBO.key
    }
  }

  return {
    ...state,
    characterConditionals,
    comboStateJson,
    teammates,
    resultSort,
  }
}
