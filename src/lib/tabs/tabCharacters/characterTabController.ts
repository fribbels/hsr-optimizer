import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import { SwitchRelicsFormSelectedCharacter } from 'lib/overlays/modals/SwitchRelicsModal'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { SavedBuildSource } from 'lib/constants/appPages'
import * as buildService from 'lib/services/buildService'
import * as equipmentService from 'lib/services/equipmentService'
import * as persistenceService from 'lib/services/persistenceService'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById, useCharacterStore } from 'lib/stores/characterStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { Form } from 'types/form'

export const CharacterTabController = {
  onCharacterModalOk: (form: Form) => {
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    if (!form.characterId) return Message.error(t('NoSelectedCharacter'))
    const character = persistenceService.upsertCharacterFromForm(form)
    SaveState.delayedSave()
    useCharacterTabStore.getState().setFocusCharacter(character.id)
  },

  confirmSaveBuild: (name: string) => updateBuilds(name, false),

  confirmOverwriteBuild: (name: string) => updateBuilds(name, true),

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
    void import('lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions').then(({ recalculatePermutations }) => recalculatePermutations())
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

function updateBuilds(name: string, overwrite: boolean) {
  const focusCharacter = useCharacterTabStore.getState().focusCharacter
  const selectedCharacter = getCharacterById(focusCharacter ?? undefined)
  if (!selectedCharacter) return
  const res = buildService.saveBuild(
    name,
    selectedCharacter.id,
    SavedBuildSource.SHOWCASE,
    overwrite,
  )
  if (res) return Message.error(res.error)
  if (overwrite) {
    Message.success(i18next.t('modals:SaveBuild.ConfirmOverwrite.SuccessMessage', { name }))
  } else {
    Message.success(i18next.t('charactersTab:Messages.SaveSuccess', { name }))
  }
}
