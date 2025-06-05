import { DownOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import { Button, Dropdown, Flex, Modal, theme } from 'antd'
import { MenuProps } from 'antd/lib'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { OpenCloseIDs, setOpen } from 'lib/hooks/useOpenClose'
import { Message } from 'lib/interactions/message'
import { BuildsModal } from 'lib/overlays/modals/BuildsModal'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { SaveBuildModal } from 'lib/overlays/modals/SaveBuildModal'
import { SwitchRelicsModal } from 'lib/overlays/modals/SwitchRelicsModal'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { getGridTheme } from 'lib/rendering/theme'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { CharacterGrid } from 'lib/tabs/tabCharacters/CharacterGrid'
import { FilterBar } from 'lib/tabs/tabCharacters/FilterBar'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import React, { ReactNode, Suspense, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Form } from 'types/form'

const { useToken } = theme

export default function CharacterTab() {
  const { token } = useToken()

  const [confirmationModal, contextHolder] = Modal.useModal()

  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false)
  const characterModalInitialCharacter = useCharacterTabStore((s) => s.characterModalInitialCharacter)
  const setCharacterModalInitialCharacter = useCharacterTabStore((s) => s.setCharacterModalInitialCharacter)

  const { t } = useTranslation(['charactersTab', 'common', 'gameData'])

  console.log('======================================================================= RENDER CharacterTab')

  const characterTabFocusCharacter = window.store((s) => s.characterTabFocusCharacter)
  const setCharacterTabFocusCharacter = window.store((s) => s.setCharacterTabFocusCharacter)
  const setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)
  const selectedCharacter = window.store.getState().charactersById[characterTabFocusCharacter!] ?? null

  const [, forceUpdate] = React.useReducer((o) => !o, false)
  window.forceCharacterTabUpdate = () => {
    console.log('__________ CharacterTab forceCharacterTabUpdate')
    forceUpdate()

    // no charGrid in scorer tab
    if (window.characterGrid?.current?.api?.redrawRows) {
      window.characterGrid.current.api.redrawRows()
    } else {
      console.log('@forceCharacterTabUpdate: No characterGrid.current.api')
    }
  }

  const items = [
    {
      key: 'character group' as const,
      type: 'group' as const,
      label: t('CharacterMenu.Character.Label'), /* Character */
      children: [
        {
          label: t('CharacterMenu.Character.Options.Add'), /* Add new character */
          key: 'add' as const,
        },
        {
          label: t('CharacterMenu.Character.Options.Edit'), /* Edit character / light cone */
          key: 'edit' as const,
        },
        {
          label: t('CharacterMenu.Character.Options.Switch'), /* Switch relics with */
          key: 'switchRelics' as const,
        },
        {
          label: t('CharacterMenu.Character.Options.Unequip'), /* Unequip character */
          key: 'unequip' as const,
        },
        {
          label: t('CharacterMenu.Character.Options.Delete'), /* Delete character */
          key: 'delete' as const,
        },
      ],
    },
    {
      key: 'builds group' as const,
      type: 'group' as const,
      label: t('CharacterMenu.Build.Label'), /* Builds */
      children: [
        {
          label: t('CharacterMenu.Build.Options.Save'), /* Save current build */
          key: 'saveBuild' as const,
        },
        {
          label: t('CharacterMenu.Build.Options.View'), /* View saved builds */
          key: 'viewBuilds' as const,
        },
      ],
    },
    {
      key: 'scoring group' as const,
      type: 'group' as const,
      label: t('CharacterMenu.Scoring.Label'), /* Scoring */
      children: [
        {
          label: t('CharacterMenu.Scoring.Options.ScoringModal'), /* Scoring algorithm */
          key: 'scoring' as const,
        },
      ],
    },
    {
      key: 'priority group' as const,
      type: 'group' as const,
      label: t('CharacterMenu.Priority.Label'), /* Priority */
      children: [
        {
          label: t('CharacterMenu.Priority.Options.SortByScore'), /* Sort all characters by score */
          key: 'sortByScore' as const,
        },
        {
          label: t('CharacterMenu.Priority.Options.MoveToTop'), /* Move character to top */
          key: 'moveToTop' as const,
        },
      ],
    },
  ]

  /*const externalFilterChanged = useCallback(() => {
    characterGrid.current?.api.onFilterChanged()
  }, [])

  useEffect(externalFilterChanged, [characterFilters.name])*/

  function removeClicked() {
    const selectedNodes = window.characterGrid.current?.api.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length == 0) {
      return
    }

    const row = selectedNodes[0].data
    const id = row.id

    DB.removeCharacter(id)
    window.setCharacterRows(DB.getCharacters())
    setCharacterTabFocusCharacter(undefined)
    if (window.relicsGrid?.current?.api) {
      window.relicsGrid.current.api.redrawRows()
    }

    SaveState.delayedSave()

    Message.success(t('Messages.RemoveSuccess') /* Successfully removed character */)
  }

  function unequipClicked() {
    console.log('unequipClicked', DB.getCharacterById(characterTabFocusCharacter!))

    const selectedNodes = window.characterGrid.current?.api.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length == 0) {
      return
    }
    const row = selectedNodes[0].data
    const id = row.id

    DB.unequipCharacter(id)

    window.characterGrid.current?.api.redrawRows()
    window.forceCharacterTabUpdate()
    Message.success(t('Messages.UnequipSuccess') /* Successfully unequipped character */)
    window.relicsGrid.current?.api.redrawRows()

    SaveState.delayedSave()
  }

  // Reuse the same modal for both edit/add and scroll to the selected character
  function onCharacterModalOk(form: Form) {
    if (!form.characterId) {
      return Message.error(t('Messages.NoSelectedCharacter') /* No selected character */)
    }

    const character = DB.addFromForm(form)
    window.characterGrid.current?.api.ensureIndexVisible(character.rank)
  }

  function scoringAlgorithmClicked() {
    if (characterTabFocusCharacter) setScoringAlgorithmFocusCharacter(characterTabFocusCharacter)
    setOpen(OpenCloseIDs.SCORING_MODAL)
  }

  function moveToTopClicked() {
    DB.insertCharacter(characterTabFocusCharacter!, 0)
    DB.refreshCharacters()
    SaveState.delayedSave()
    window.characterGrid.current?.api.redrawRows()
  }

  async function sortByScoreClicked() {
    if (
      !await confirm(
        /* Are you sure you want to sort all characters? <0/>You will lose any custom rankings you have set. */
        <Trans t={t} i18nKey='Messages.SortByScoreWarning'>
          <br />
        </Trans>,
      )
    ) {
      return
    }

    const characterList = DB.getCharacters()

    const scoredCharacters = characterList
      .map((x) => ({ score: RelicScorer.scoreCharacter(x), character: x }))
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .map((x) => x.character)

    DB.setCharacters(scoredCharacters)
    DB.refreshCharacters()
    SaveState.delayedSave()
    window.characterGrid.current?.api.redrawRows()
  }

  const handleActionsMenuClick: MenuProps['onClick'] = async (e) => {
    if (!selectedCharacter && e.key != 'add' && e.key != 'scoring' && e.key != 'sortByScore') {
      Message.error(t('Messages.NoSelectedCharacter') /* No selected character */)
      return
    }

    switch (e.key) {
      case 'add':
        setCharacterModalInitialCharacter(null)
        setIsCharacterModalOpen(true)
        break
      case 'edit':
        setCharacterModalInitialCharacter(selectedCharacter)
        setIsCharacterModalOpen(true)
        break
      case 'switchRelics':
        setOpen(OpenCloseIDs.SWITCH_RELICS_MODAL)
        break
      case 'unequip':
        /* Are you sure you want to unequip $t(gameData:Characters.{{charId}}.Name)? */
        if (!await confirm(t('Messages.UnequipWarning', { charId: selectedCharacter!.id }))) return
        unequipClicked()
        break
      case 'delete':
        /* Are you sure you want to delete $t(gameData:Characters.{{charId}}.Name)? */
        if (!await confirm(t('Messages.DeleteWarning', { charId: selectedCharacter!.id }))) return
        removeClicked()
        break
      case 'saveBuild':
        setOpen(OpenCloseIDs.SAVE_BUILDS_MODAL)
        break
      case 'viewBuilds':
        setOpen(OpenCloseIDs.BUILDS_MODAL)
        break
      case 'scoring':
        scoringAlgorithmClicked()
        break
      case 'moveToTop':
        moveToTopClicked()
        break
      case 'sortByScore':
        await sortByScoreClicked()
        break
      default:
        console.error(`Unknown key ${e.key} in handleActionsMenuClick`)
    }
  }

  const actionsMenuProps = {
    items,
    onClick: handleActionsMenuClick,
  }

  async function confirm(content: ReactNode) {
    return confirmationModal.confirm({
      title: t('common:Confirm'), // 'Confirm',
      icon: <ExclamationCircleOutlined />,
      content: content,
      okText: t('common:Confirm'), // 'Confirm',
      cancelText: t('common:Cancel'), // 'Cancel',
      centered: true,
    })
  }

  const defaultGap = 8
  const parentH = 280 * 3 + defaultGap * 2

  return (
    <Flex
      style={{
        height: '100%',
        marginBottom: 200,
        width: 1455,
      }}
      gap={defaultGap}
    >
      <Flex vertical gap={defaultGap}>
        <Dropdown
          placement='topLeft'
          menu={actionsMenuProps}
          trigger={['hover']}
        >
          <Button
            style={{ width: '100%', height: 40, boxShadow: 'unset', borderRadius: 8 }}
            icon={<UserOutlined />}
            type='default'
          >
            {t('CharacterMenu.ButtonText') /* Character menu */}
            <DownOutlined />
          </Button>
        </Dropdown>

        <Flex vertical gap={8} style={{ minWidth: 240 }}>
          <div
            id='characterGrid'
            className='ag-theme-balham-dark'
            style={{
              display: 'block',
              width: '100%',
              height: parentH,
              ...getGridTheme(token),
            }}
          >
            <CharacterGrid />
          </div>
        </Flex>
      </Flex>

      <Flex vertical gap={defaultGap}>
        <FilterBar />

        <Suspense>
          <CharacterPreview
            id='characterTabPreview'
            source={ShowcaseSource.CHARACTER_TAB}
            character={selectedCharacter}
            setOriginalCharacterModalOpen={setIsCharacterModalOpen}
            setOriginalCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
          />
        </Suspense>
      </Flex>

      <CharacterModal
        onOk={onCharacterModalOk}
        open={isCharacterModalOpen}
        setOpen={setIsCharacterModalOpen}
        initialCharacter={characterModalInitialCharacter}
      />

      <SwitchRelicsModal />

      <SaveBuildModal />

      <BuildsModal />

      {contextHolder}
    </Flex>
  )
}
