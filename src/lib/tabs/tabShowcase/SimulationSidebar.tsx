import { IconEdit, IconFlask } from '@tabler/icons-react'
import { Button, Flex } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import {
  type CharacterPreset,
  type Preset,
  presetCharacters,
} from 'lib/tabs/tabShowcase/showcaseTabController'
import { useMemo } from 'react'
import styles from './ShowcaseTab.module.css'

export function SimulationSidebar({
  open,
  onToggle,
  onPresetClick,
}: {
  open: boolean
  onToggle: () => void
  onPresetClick: (preset: Preset) => void
}) {
  const presets = useMemo(() => presetCharacters(), [])

  return (
    <div className={styles.simSidebar}>
      <Flex direction="column" align="center" gap={8}>
        <Button
          className={styles.toggleButton}
          onClick={onToggle}
          variant="filled"
          style={{ width: 80, height: 40, margin: '0 8px' }}
        >
          <IconFlask size={28} />
        </Button>

        <div className={styles.simSidebarPanel} style={{ display: open ? undefined : 'none' }}>
          {presets.map((preset, index) => {
              if (preset.custom) {
                return (
                  <Flex key="custom" justify="center" align="center">
                    <Button
                      variant="transparent"
                      p={0}
                      onClick={() => onPresetClick(preset)}
                      style={{ width: 80, height: 80 }}
                    >
                      <IconEdit size={36} />
                    </Button>
                  </Flex>
                )
              }

              const charPreset = preset as CharacterPreset
              return (
                <Flex key={charPreset.characterId ?? index} justify="center" align="center">
                  <Button
                    variant="transparent"
                    p={0}
                    onClick={() => onPresetClick(preset)}
                    style={{ width: 80, height: 80 }}
                  >
                    <img
                      className={styles.presetImage}
                      src={Assets.getCharacterAvatarById(charPreset.characterId!)}
                    />
                  </Button>
                </Flex>
              )
            })}
        </div>
      </Flex>
    </div>
  )
}
