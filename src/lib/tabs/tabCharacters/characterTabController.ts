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
import {
  AppPages,
  DB,
  SavedBuildSource,
} from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
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
    window.store.getState().setActiveKey(AppPages.OPTIMIZER)
    OptimizerTabController.updateCharacter(characterId)
  },

  navigateToNextCell: (params: NavigateToNextCellParams<Character>) => {
    return arrowKeyGridNavigation(params, window.characterGrid, CharacterTabController.cellClickedCallback)
  },

  drag: (e: RowDragEvent<Character>, index: number) => {
    const characterId = e.node.data?.id
    if (!characterId) return
    DB.insertCharacter(characterId, index)
    SaveState.delayedSave()
  },

  onRowDragEnd: (e: RowDragEvent<Character>) => {
    CharacterTabController.drag(e, e.overIndex)
  },

  onRowDragLeave: (e: RowDragEvent<Character>) => {
    if (e.overIndex === 0) return CharacterTabController.drag(e, 0)
    if (e.overIndex === -1 && e.vDirection === 'up') return CharacterTabController.drag(e, 0)
    if (e.overIndex === -1 && e.vDirection === 'down') return CharacterTabController.drag(e, DB.getCharacters().length)
    CharacterTabController.drag(e, e.overIndex)
  },

  onCharacterModalOk: (form: Form) => {
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    if (!form.characterId) return Message.error(t('NoSelectedCharacter'))
    const character = DB.addFromForm(form)
    window.characterGrid.current?.api?.ensureIndexVisible(character.rank)
  },

  confirmSaveBuild: (name: string) => updateBuilds(name, false),

  confirmOverwriteBuild: (name: string) => updateBuilds(name, true),

  onSwitchRelicsOk: (switchTo: SwitchRelicsFormSelectedCharacter) => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    if (!focusCharacter) return Message.error(t('NoSelectedCharacter'))
    DB.switchRelics(focusCharacter, switchTo.value)
    Message.success(t('SwitchSuccess', { charId: switchTo.value }))
    SaveState.delayedSave()
  },

  unequipFocusCharacter: () => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    if (!focusCharacter) return
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    DB.unequipCharacter(focusCharacter)
    SaveState.delayedSave()
    Message.success(t('UnequipSuccess'))
  },

  removeFocusCharacter: () => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    if (!focusCharacter) return
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    DB.removeCharacter(focusCharacter)
    useCharacterTabStore.getState().setFocusCharacter(null)
    SaveState.delayedSave()
    Message.success(t('RemoveSuccess'))
  },

  moveFocusCharacterToTop: () => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    if (!focusCharacter) return
    DB.insertCharacter(focusCharacter, 0)
    SaveState.delayedSave()
  },

  sortByScore: () => {
    const characters = DB.getCharacters()
    const sortedCharacters = characters
      .map((character) => ({ score: RelicScorer.scoreCharacter(character), character }))
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .map((x) => x.character)
    DB.setCharacters(sortedCharacters)
    SaveState.delayedSave()
  },
}

function updateBuilds(name: string, overwrite: boolean) {
  const selectedCharacter = useCharacterTabStore.getState().selectedCharacter
  if (!selectedCharacter) return
  const res = DB.saveCharacterBuild(
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
