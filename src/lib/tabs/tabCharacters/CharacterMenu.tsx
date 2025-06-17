import {
  DownOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Dropdown,
  Modal,
} from 'antd'
import { MenuProps } from 'antd/lib'
import { TFunction } from 'i18next'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Message } from 'lib/interactions/message'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import React, {
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
import {
  Trans,
  useTranslation,
} from 'react-i18next'

export function CharacterMenu() {
  const { t } = useTranslation('charactersTab')
  const { t: tCommon } = useTranslation('common')
  const [confirmationModal, contextHolder] = Modal.useModal()

  const confirm = useCallback(async (content: ReactNode) => {
    return confirmationModal.confirm({
      title: tCommon('Confirm'), // 'Confirm',
      icon: <ExclamationCircleOutlined />,
      content: content,
      okText: tCommon('Confirm'), // 'Confirm',
      cancelText: tCommon('Cancel'), // 'Cancel',
      centered: true,
    })
  }, [tCommon, confirmationModal])

  const onClick = useMemo(() => generateOnClickHandler(confirm, t), [confirm, t])

  const items = useMemo(() => generateItems(t), [t])

  const actionsMenuProps = { items, onClick }

  return (
    <>
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
      {contextHolder}
    </>
  )
}

function generateOnClickHandler(confirm: (content: ReactNode) => Promise<boolean>, t: TFunction<'charactersTab'>) {
  async function onClick(e: Parameters<NonNullable<MenuProps['onClick']>>[0]) {
    const key = e.key as ReturnType<typeof generateItems>[number]['children'][number]['key']
    const { selectedCharacter, focusCharacter, setCharacterModalInitialCharacter, setCharacterModalOpen } = useCharacterTabStore.getState()
    if (!selectedCharacter && !(key === 'scoring' || key === 'sortByScore' || key === 'add')) {
      return Message.error(t('Messages.NoSelectedCharacter')) // No selected character
    }
    switch (key) {
      case 'add':
        setCharacterModalInitialCharacter(null)
        setCharacterModalOpen(true)
        break

      case 'sortByScore':
        if (
          !await confirm(
            <Trans t={t} i18nKey='Messages.SortByScoreWarning'>
              <br />
            </Trans>,
          )
        ) return
        CharacterTabController.sortByScore()
        break

      case 'scoring':
        if (focusCharacter) window.store.getState().setScoringAlgorithmFocusCharacter(focusCharacter)
        setOpen(OpenCloseIDs.SCORING_MODAL)
        break

      case 'delete':
        if (!await confirm(t('Messages.DeleteWarning', { charId: focusCharacter }))) return
        CharacterTabController.removeFocusCharacter()
        break

      case 'edit':
        setCharacterModalInitialCharacter(selectedCharacter)
        setCharacterModalOpen(true)
        break

      case 'moveToTop':
        CharacterTabController.moveFocusCharacterToTop()
        break

      case 'saveBuild':
        setOpen(OpenCloseIDs.SAVE_BUILDS_MODAL)
        break

      case 'switchRelics':
        setOpen(OpenCloseIDs.SWITCH_RELICS_MODAL)
        break

      case 'unequip':
        if (!await confirm(t('Messages.UnequipWarning', { charId: focusCharacter }))) return
        CharacterTabController.unequipFocusCharacter()
        break

      case 'viewBuilds':
        setOpen(OpenCloseIDs.BUILDS_MODAL)
        break

      default:
        console.error(`unknown key ${key} in CharacterTab::CharacterMenu::onMenuClick`)
    }
  }
  return onClick
}

function generateItems(t: TFunction<'charactersTab'>) {
  return [
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
}
