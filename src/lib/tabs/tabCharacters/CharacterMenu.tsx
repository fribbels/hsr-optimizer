import { MenuProps } from 'antd/lib'
import i18next, { TFunction } from 'i18next'
import { Message } from 'lib/interactions/message'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function CharacterMenu() {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterMenu' })

  const items = useMemo(() => generateItems(t), [t])
}

const onMenuClick: MenuProps['onClick'] = (e) => {
  const t = i18next.getFixedT(null, 'charactersTab', 'Messages')
  const key = e.key as ReturnType<typeof generateItems>[number]['children'][number]['key']
  const selectedCharacter = useCharacterTabStore.getState().focusCharacter
  if (!selectedCharacter && !(key === 'scoring' || key === 'sortByScore' || key === 'add')) {
    return Message.error(t('NoSelectedCharacter')) // No selected character
  }
  switch (key) {
    case 'add':
      break
    case 'sortByScore':
      break
    case 'scoring':
      break
    case 'delete':
      break
    case 'edit':
      break
    case 'moveToTop':
      break
    case 'saveBuild':
      break
    case 'switchRelics':
      break
    case 'unequip':
      break
    case 'viewBuilds':
      break
    default:
      console.error(`unknown key ${key} in CharacterTab::CharacterMenu::onMenuClick`)
  }
}

function generateItems(t: TFunction<'charactersTab', 'CharacterMenu'>) {
  return [
    {
      key: 'character group' as const,
      type: 'group' as const,
      label: t('Character.Label'), /* Character */
      children: [
        {
          label: t('Character.Options.Add'), /* Add new character */
          key: 'add' as const,
        },
        {
          label: t('Character.Options.Edit'), /* Edit character / light cone */
          key: 'edit' as const,
        },
        {
          label: t('Character.Options.Switch'), /* Switch relics with */
          key: 'switchRelics' as const,
        },
        {
          label: t('Character.Options.Unequip'), /* Unequip character */
          key: 'unequip' as const,
        },
        {
          label: t('Character.Options.Delete'), /* Delete character */
          key: 'delete' as const,
        },
      ],
    },
    {
      key: 'builds group' as const,
      type: 'group' as const,
      label: t('Build.Label'), /* Builds */
      children: [
        {
          label: t('Build.Options.Save'), /* Save current build */
          key: 'saveBuild' as const,
        },
        {
          label: t('Build.Options.View'), /* View saved builds */
          key: 'viewBuilds' as const,
        },
      ],
    },
    {
      key: 'scoring group' as const,
      type: 'group' as const,
      label: t('Scoring.Label'), /* Scoring */
      children: [
        {
          label: t('Scoring.Options.ScoringModal'), /* Scoring algorithm */
          key: 'scoring' as const,
        },
      ],
    },
    {
      key: 'priority group' as const,
      type: 'group' as const,
      label: t('Priority.Label'), /* Priority */
      children: [
        {
          label: t('Priority.Options.SortByScore'), /* Sort all characters by score */
          key: 'sortByScore' as const,
        },
        {
          label: t('Priority.Options.MoveToTop'), /* Move character to top */
          key: 'moveToTop' as const,
        },
      ],
    },
  ]
}
