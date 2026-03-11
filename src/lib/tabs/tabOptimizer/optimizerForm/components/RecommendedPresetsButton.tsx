import { IconChevronDown } from '@tabler/icons-react'
import { Button, Flex, Menu } from '@mantine/core'
import { applySpdPreset } from 'lib/conditionals/evaluation/applyPresets'
import { Message } from 'lib/interactions/message'
import { getGameMetadata } from 'lib/state/gameMetadata'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { generateSpdPresets } from './spdPresetConfig'

export type { PresetDefinition } from 'lib/scoring/presetEffects'
export { PresetEffects } from 'lib/scoring/presetEffects'

export type { SpdPresets, SpdPresetCategory, SpdPresetsResult } from './spdPresetConfig'
export { generateSpdPresets, setSortColumn } from './spdPresetConfig'

export const RecommendedPresetsButton = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })
  const optimizerTabFocusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)

  const { categories, allPresets } = useMemo(() => {
    return generateSpdPresets(t)
  }, [t])

  const items = useMemo(function() {
    if (!optimizerTabFocusCharacter) return []
    const character = getGameMetadata().characters[optimizerTabFocusCharacter]
    if (!character) return []

    const groupedChildren = categories.map((category) => {
      const presetItems = Object.values(category.presets).map((preset) => ({
        ...preset,
        label: <div style={{ minWidth: 450, lineHeight: '18px' }}>{preset.label}</div>,
      }))

      return { type: 'group' as const, label: category.label, children: presetItems }
    })

    return [{
      key: t('StandardLabel', { id: character.id }),
      label: t('StandardLabel', { id: character.id }),
      children: groupedChildren,
    }]
  }, [optimizerTabFocusCharacter, t, categories])

  const handlePresetClick = (key: string) => {
    if (allPresets[key]) {
      applySpdPreset(allPresets[key].value!, optimizerTabFocusCharacter)
    } else {
      Message.warning(t('PresetNotAvailable') /* 'Preset not available, please select another option' */)
    }
  }

  return (
    <Menu>
      <Flex style={{ flex: 1, width: '100%' }}>
        <Button
          style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          onClick={() => applySpdPreset(allPresets.SPD0.value!, optimizerTabFocusCharacter)}
        >
          {t('RecommendedPresets') /* Recommended presets */}
        </Button>
        <Menu.Target>
          <Button style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: '0 8px' }}>
            <IconChevronDown size={16} />
          </Button>
        </Menu.Target>
      </Flex>
      <Menu.Dropdown>
        {items.map((item) => (
          <React.Fragment key={item.key}>
            {item.children.map((group) => (
              <React.Fragment key={group.label}>
                <Menu.Label>{group.label}</Menu.Label>
                {group.children.map((child) => (
                  <Menu.Item key={child.key} onClick={() => handlePresetClick(child.key)} disabled={child.disabled}>
                    {child.label}
                  </Menu.Item>
                ))}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
