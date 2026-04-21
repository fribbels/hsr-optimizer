import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import type { CharacterModalForm } from 'lib/overlays/modals/characterModalStore'
import { type SwitchRelicsFormSelectedCharacter } from 'lib/overlays/modals/SwitchRelicsModal'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import * as equipmentService from 'lib/services/equipmentService'
import * as persistenceService from 'lib/services/persistenceService'
import { SaveState } from 'lib/state/saveState'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'

export const CharacterTabController = {
  onCharacterModalOk: (form: CharacterModalForm): boolean => {
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    if (!form.characterId) {
      Message.error(t('NoSelectedCharacter'))
      return false
    }
    if (!form.lightCone) {
      Message.error(t('NoSelectedLightCone'))
      return false
    }
    // Safe cast: after guards, characterId and lightCone are non-null. upsertCharacterFromForm spreads form into character.form
    const character = persistenceService.upsertCharacterFromForm(form as Form)
    SaveState.delayedSave()
    useCharacterTabStore.getState().setFocusCharacter(character.id)
    return true
  },

  onSwitchRelicsOk: (switchTo: SwitchRelicsFormSelectedCharacter) => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    if (!focusCharacter) return Message.error(t('NoSelectedCharacter'))
    equipmentService.switchRelics(focusCharacter, switchTo.value)
    Message.success(t('SwitchSuccess', { charId: switchTo.value }))
    SaveState.delayedSave()
  },

  unequipFocusCharacter: () => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    if (!focusCharacter) return
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    equipmentService.unequipCharacter(focusCharacter)
    SaveState.delayedSave()
    Message.success(t('UnequipSuccess'))
  },

  removeCharacter: (characterId: CharacterId) => {
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    equipmentService.removeCharacter(characterId)
    const { focusCharacter } = useCharacterTabStore.getState()
    if (focusCharacter === characterId) {
      useCharacterTabStore.getState().setFocusCharacter(null)
    }
    SaveState.delayedSave()
    Message.success(t('RemoveSuccess'))
  },

  removeFocusCharacter: () => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    if (!focusCharacter) return
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    equipmentService.removeCharacter(focusCharacter)
    useCharacterTabStore.getState().setFocusCharacter(null)
    SaveState.delayedSave()
    Message.success(t('RemoveSuccess'))
  },

  moveFocusCharacterToTop: () => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    if (!focusCharacter) return
    useCharacterStore.getState().insertCharacter(focusCharacter, 0)
    SaveState.delayedSave()
  },

  sortByScore: () => {
    const characters = useCharacterStore.getState().characters
    const sortedCharacters = characters
      .map((character) => ({ score: RelicScorer.scoreCharacter(character), character }))
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .map((x) => x.character)
    useCharacterStore.getState().setCharacters(sortedCharacters)
    SaveState.delayedSave()
  },
}
