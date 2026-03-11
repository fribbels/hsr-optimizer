import {
  CellClickedEvent,
  CellDoubleClickedEvent,
  IRowNode,
  NavigateToNextCellParams,
  RowDragEvent,
} from 'ag-grid-community'
import i18next from 'i18next'
import {
  OpenCloseIDs,
  setClose,
} from 'lib/hooks/useOpenClose'
import { arrowKeyGridNavigation } from 'lib/interactions/arrowKeyGridNavigation'
import { Message } from 'lib/interactions/message'
import { SwitchRelicsFormSelectedCharacter } from 'lib/overlays/modals/SwitchRelicsModal'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { AppPages, SavedBuildSource } from 'lib/constants/appPages'
import * as buildService from 'lib/services/buildService'
import * as equipmentService from 'lib/services/equipmentService'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById, useCharacterStore } from 'lib/stores/characterStore'
import { useGlobalStore } from 'lib/stores/appStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { updateCharacter } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { gridStore } from 'lib/utils/gridStore'
import { Character } from 'types/character'
import { Form } from 'types/form'

export const CharacterTabController = {
  cellClickedCallback: (node: IRowNode<Character>) => {
    const characterId = node.data?.id
    if (!characterId) return
    useCharacterTabStore.getState().setFocusCharacter(characterId)
  },

  cellClickedListener: (e: CellClickedEvent<Character>) => {
    CharacterTabController.cellClickedCallback(e.node)
  },

  cellDoubleClickedListener: (e: CellDoubleClickedEvent<Character>) => {
    const characterId = e.data?.id
    if (!characterId) return
    useGlobalStore.getState().setActiveKey(AppPages.OPTIMIZER)
    updateCharacter(characterId)
  },

  navigateToNextCell: (params: NavigateToNextCellParams<Character>) => {
    return arrowKeyGridNavigation(params, gridStore.getCharacterGrid()!, CharacterTabController.cellClickedCallback)
  },

  drag: (e: RowDragEvent<Character>, index: number) => {
    const characterId = e.node.data?.id
    if (!characterId) return
    DB.insertCharacter(characterId, index) // non-migratable
    SaveState.delayedSave()
  },

  onRowDragEnd: (e: RowDragEvent<Character>) => {
    CharacterTabController.drag(e, e.overIndex)
  },

  onRowDragLeave: (e: RowDragEvent<Character>) => {
    if (e.overIndex === 0) return CharacterTabController.drag(e, 0)
    if (e.overIndex === -1 && e.vDirection === 'up') return CharacterTabController.drag(e, 0)
    if (e.overIndex === -1 && e.vDirection === 'down') return CharacterTabController.drag(e, useCharacterStore.getState().characters.length)
    CharacterTabController.drag(e, e.overIndex)
  },

  onCharacterModalOk: (form: Form) => {
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    if (!form.characterId) return Message.error(t('NoSelectedCharacter'))
    const character = DB.addFromForm(form) // non-migratable
    gridStore.characterGridApi()?.ensureIndexVisible(character.rank)
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
    DB.insertCharacter(focusCharacter, 0) // non-migratable
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
