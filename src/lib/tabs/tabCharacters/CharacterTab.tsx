import {
  Flex,
  SegmentedControl,
} from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
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
import { useDeferReveal } from 'lib/ui/DeferredRender'
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'
import type {
  Character,
  CharacterId,
} from 'types/character'

import {
  cardTotalW,
  defaultGap,
  parentH,
} from 'lib/constants/constantsUi'

const densityOptions = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
]

export function CharacterTab() {
  // Only sync when optimizer focus changed — otherwise tab revisits stomp the user's selection.
  // Initialize to saved session character so session restore doesn't trigger a sync on first visit.
  const { addActivationListener } = useContext(TabVisibilityContext)
  const savedSessionCharacterId = useGlobalStore.getState().savedSession[SavedSessionKeys.optimizerCharacterId]
  const lastSyncedFocusRef = useRef<CharacterId | undefined>(savedSessionCharacterId)
  useEffect(() => {
    return addActivationListener(() => {
      const id = useOptimizerDisplayStore.getState().focusCharacterId
      if (!id) return
      if (id === lastSyncedFocusRef.current) return
      lastSyncedFocusRef.current = id
      useCharacterTabStore.getState().setFocusCharacter(id)
    })
  }, [addActivationListener])

  const focusCharacter = useCharacterTabStore((s) => s.focusCharacter)
  const selectedCharacter = useCharacterStore((s) => focusCharacter ? s.charactersById[focusCharacter] : null) ?? null
  const containerRef = useDeferReveal()

  const density = useGlobalStore((s) => s.savedSession.characterGridDensity)
  const preset = characterGridPresets[density]
  const gridCssVars = precomputedCssVars[density]

  const onDensityChange = useCallback((value: string) => {
    if (!(value in characterGridPresets)) return
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.characterGridDensity, value as CharacterGridDensity)
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

  return (
    <Flex
      ref={containerRef}
      style={{
        height: '100%',
        marginBottom: 200,
        width: 1593,
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
            onChange={onDensityChange}
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
