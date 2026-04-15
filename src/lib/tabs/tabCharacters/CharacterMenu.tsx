import {
  Button,
  Menu,
} from '@mantine/core'
import {
  IconChevronDown,
  IconUser,
} from '@tabler/icons-react'
import type { TFunction } from 'i18next'
import { useConfirmAction } from 'lib/hooks/useConfirmAction'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Message } from 'lib/interactions/message'
import { useBuildsModalStore } from 'lib/overlays/modals/buildsModalStore'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { useSaveBuildModalStore } from 'lib/overlays/modals/saveBuildModalStore'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { getCharacterById } from 'lib/stores/character/characterStore'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import {
  Fragment,
  type ReactNode,
  useMemo,
} from 'react'
import {
  Trans,
  useTranslation,
} from 'react-i18next'
import { BuildSource } from 'types/savedBuild'

export function CharacterMenu() {
  const { t } = useTranslation('charactersTab')
  const confirm = useConfirmAction()

  const onClick = useMemo(() => generateOnClickHandler(confirm, t), [confirm, t])

  const items = useMemo(() => generateItems(t), [t])

  return (
    <>
      <Menu trigger='click' position='top-start' width='target'>
        <Menu.Target>
          <Button
            style={{ width: '100%', height: 40, boxShadow: 'unset', borderRadius: 4 }}
            leftSection={<IconUser size={16} />}
            rightSection={<IconChevronDown size={16} />}
            variant='default'
          >
            {t('CharacterMenu.ButtonText') /* Character menu */}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {items.map((group, i) => (
            <Fragment key={group.key}>
              {i > 0 && <Menu.Divider />}
              <Menu.Label>{group.label}</Menu.Label>
              {group.children.map((child) => (
                <Menu.Item key={child.key} onClick={() => onClick({ key: child.key })}>
                  {child.label}
                </Menu.Item>
              ))}
            </Fragment>
          ))}
        </Menu.Dropdown>
      </Menu>
    </>
  )
}

function generateOnClickHandler(confirm: (content: ReactNode) => Promise<boolean>, t: TFunction<'charactersTab'>) {
  async function onClick(e: { key: string }) {
    const key = e.key as ReturnType<typeof generateItems>[number]['children'][number]['key']
    const { focusCharacter } = useCharacterTabStore.getState()
    const selectedCharacter = getCharacterById(focusCharacter ?? undefined)
    if (!selectedCharacter && !(key === 'scoring' || key === 'sortByScore' || key === 'add')) {
      return Message.error(t('Messages.NoSelectedCharacter')) // No selected character
    }
    switch (key) {
      case 'add':
        useCharacterModalStore.getState().openOverlay({
          initialCharacter: null,
          onOk: CharacterTabController.onCharacterModalOk,
        })
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
        if (focusCharacter) useGlobalStore.getState().setScoringAlgorithmFocusCharacter(focusCharacter)
        setOpen(OpenCloseIDs.SCORING_MODAL)
        break

      case 'delete':
        if (!await confirm(t('Messages.DeleteWarning', { charId: focusCharacter ?? '' }))) return
        CharacterTabController.removeFocusCharacter()
        break

      case 'edit':
        useCharacterModalStore.getState().openOverlay({
          initialCharacter: selectedCharacter ?? null,
          onOk: CharacterTabController.onCharacterModalOk,
        })
        break

      case 'moveToTop':
        CharacterTabController.moveFocusCharacterToTop()
        break

      case 'saveBuild':
        if (focusCharacter) {
          useSaveBuildModalStore.getState().openOverlay({ source: BuildSource.Character, characterId: focusCharacter })
        }
        break

      case 'switchRelics':
        setOpen(OpenCloseIDs.SWITCH_RELICS_MODAL)
        break

      case 'unequip':
        if (!await confirm(t('Messages.UnequipWarning', { charId: focusCharacter ?? '' }))) return
        CharacterTabController.unequipFocusCharacter()
        break

      case 'viewBuilds':
        if (focusCharacter) {
          useBuildsModalStore.getState().openOverlay({ characterId: focusCharacter })
        }
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
  ]
}
