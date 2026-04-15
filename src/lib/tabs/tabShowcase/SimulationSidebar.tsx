import {
  Button,
  Flex,
} from '@mantine/core'
import {
  IconFlask,
  IconPlus,
} from '@tabler/icons-react'
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
  open: boolean,
  onToggle: () => void,
  onPresetClick: (preset: Preset) => void,
}) {
  const presets = useMemo(() => presetCharacters(), [])

  return (
    <div className={styles.simSidebar}>
      <Flex direction='column' align='center' gap={8}>
        <Button
          className={styles.toggleButton}
          onClick={onToggle}
          variant='default'
          style={{ width: 80, height: 40, margin: '0 8px' }}
        >
          <IconFlask size={28} />
        </Button>

        <div className={styles.simSidebarPanel} style={{ display: open ? undefined : 'none' }}>
          {presets.map((preset, index) => {
            if (preset.custom) {
              return (
                <Flex key='custom' justify='center' align='center'>
                  <Button
                    variant='transparent'
                    p={0}
                    onClick={() => onPresetClick(preset)}
                    style={{ width: 80, height: 80 }}
                  >
                    <div className={styles.customPresetIcon}>
                      <IconPlus size={28} />
                    </div>
                  </Button>
                </Flex>
              )
            }

            const charPreset = preset as CharacterPreset
            const isRerun = charPreset.rerun
            const size = isRerun ? 38 : 80
            return (
              <Button
                key={charPreset.characterId ?? index}
                variant='transparent'
                p={0}
                onClick={() => onPresetClick(preset)}
                style={{ width: size, height: size, minWidth: size, display: 'inline-flex' }}
              >
                <img
                  className={styles.presetImage}
                  src={Assets.getCharacterAvatarById(charPreset.characterId!)}
                />
              </Button>
            )
          })}
        </div>
      </Flex>
    </div>
  )
}
