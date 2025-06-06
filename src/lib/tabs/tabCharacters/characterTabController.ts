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
    OptimizerTabController.setCharacter(characterId)
  },

  navigateToNextCell: (params: NavigateToNextCellParams<Character>) => {
    return arrowKeyGridNavigation(params, window.characterGrid, CharacterTabController.cellClickedCallback)
  },

  drag: (e: RowDragEvent<Character>, index: number) => {
    const characterId = e.node.data?.id
    if (!characterId) return
    DB.insertCharacter(characterId, index)
    SaveState.delayedSave()
    window.characterGrid.current?.api?.redrawRows()
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

  confirmSaveBuild: (name: string) => {
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    const selectedCharacter = useCharacterTabStore.getState().selectedCharacter
    if (!selectedCharacter) return
    const score = RelicScorer.scoreCharacter(selectedCharacter)
    const res = DB.saveCharacterBuild(
      name,
      selectedCharacter.id,
      {
        score: score.totalScore.toFixed(),
        rating: score.totalRating,
      },
    )
    if (res) return Message.error(res.error)
    Message.success(t('SaveSuccess', { name }))
    SaveState.delayedSave()
    setClose(OpenCloseIDs.SAVE_BUILDS_MODAL)
  },

  onSwitchRelicsOk: (switchTo: SwitchRelicsFormSelectedCharacter) => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    if (!focusCharacter) return Message.error(t('NoSelectedCharacter'))
    DB.switchRelics(focusCharacter, switchTo.value)
    Message.success(t('SwitchSuccess', { charId: switchTo.value }))
    SaveState.delayedSave()
    window.forceCharacterTabUpdate()
    window.relicsGrid.current?.api?.redrawRows()
  },

  unequipFocusCharacter: () => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    if (!focusCharacter) return
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    DB.unequipCharacter(focusCharacter)
    window.forceCharacterTabUpdate()
    SaveState.delayedSave()
    Message.success(t('UnequipSuccess'))
  },

  removeFocusCharacter: () => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    if (!focusCharacter) return
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
    DB.removeCharacter(focusCharacter)
    useCharacterTabStore.getState().setFocusCharacter(null)
    window.forceCharacterTabUpdate()
    SaveState.delayedSave()
    Message.success(t('RemoveSuccess'))
  },

  moveFocusCharacterToTop: () => {
    const focusCharacter = useCharacterTabStore.getState().focusCharacter
    if (!focusCharacter) return
    DB.insertCharacter(focusCharacter, 0)
    DB.refreshCharacters()
    window.forceCharacterTabUpdate()
    SaveState.delayedSave()
  },

  sortByScore: () => {
    const characters = DB.getCharacters()
    const sortedCharacters = characters
      .map((character) => ({ score: RelicScorer.scoreCharacter(character), character }))
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .map((x) => x.character)
    DB.setCharacters(sortedCharacters)
    DB.refreshCharacters()
    SaveState.delayedSave()
    window.forceCharacterTabUpdate()
  },
}
