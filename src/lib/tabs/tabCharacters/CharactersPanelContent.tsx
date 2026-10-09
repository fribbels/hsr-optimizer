import {
  Flex,
  SegmentedControl,
} from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import {
  cardTotalW,
  CHARACTERS_TAB_WIDTH,
  defaultGap,
  parentH,
} from 'lib/constants/constantsUi'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { CharacterGrid } from 'lib/tabs/tabCharacters/CharacterGrid'
import {
  type CharacterGridDensity,
  characterGridPresets,
  precomputedCssVars,
} from 'lib/tabs/tabCharacters/characterGridPresets'
import { CharacterMenu } from 'lib/tabs/tabCharacters/CharacterMenu'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { FilterBar } from 'lib/tabs/tabCharacters/FilterBar'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import {
  useCallback,
  useMemo,
} from 'react'
import type { Character } from 'types/character'
import { useTranslation } from 'react-i18next'

const DENSITY_VALUES = ['default', 'compact'] as const

function isCharacterGridDensity(value: string): value is CharacterGridDensity {
  return DENSITY_VALUES.some((density) => density === value)
}

export function CharactersPanelContent() {
  const focusCharacter = useCharacterTabStore((s) => s.focusCharacter)
  const selectedCharacter = useCharacterStore((s) => focusCharacter ? s.charactersById[focusCharacter] : null) ?? null

  // Density controls the size and width of the saved-character grid.
  const density = useGlobalStore((s) => s.savedSession.characterGridDensity)
  const preset = characterGridPresets[density]
  const gridCssVars = precomputedCssVars[density]

  const handleDensityChange = useCallback((value: string) => {
    if (!isCharacterGridDensity(value)) return
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.characterGridDensity, value)
    SaveState.delayedSave()
  }, [])

  const setOriginalCharacterModalInitialCharacter = useCallback((character: Character | null) => {
    useCharacterModalStore.getState().openOverlay({
      initialCharacter: character,
      onOk: CharacterTabController.onCharacterModalOk,
    })
  }, [])

  const setOriginalCharacterModalOpen = useCallback((open: boolean) => {
    if (!open) {
      useCharacterModalStore.getState().closeOverlay()
    }
  }, [])

  const { t } = useTranslation('charactersTab', { keyPrefix: 'GridDensityOptions' })

  const densityOptions = useMemo(
    () => DENSITY_VALUES.map((value) => ({ value, label: t(value) })),
    [t],
  )

  return (
    <Flex
      style={{
        height: '100%',
        marginBottom: 200,
        width: CHARACTERS_TAB_WIDTH,
      }}
      gap={defaultGap}
    >
      <Flex direction='column' gap={defaultGap}>
        <CharacterMenu />

        <Flex direction='column' gap={defaultGap} miw={preset.listWidth}>
          <div
            id='characterGrid'
            style={{
              width: '100%',
              height: parentH,
              ...gridCssVars,
            }}
          >
            <CharacterGrid />
          </div>
          <SegmentedControl
            data={densityOptions}
            value={density}
            onChange={handleDensityChange}
            fullWidth
          />
        </Flex>
      </Flex>

      <Flex direction='column' gap={defaultGap} w={cardTotalW}>
        <FilterBar />

        <CharacterPreview
          id='characterTabPreview'
          source={ShowcaseSource.CHARACTER_TAB}
          character={selectedCharacter}
          setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
          setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
        />
      </Flex>
    </Flex>
  )
}
