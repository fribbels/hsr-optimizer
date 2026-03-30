import { Flex } from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { CharacterGrid } from 'lib/tabs/tabCharacters/CharacterGrid'
import { CharacterMenu } from 'lib/tabs/tabCharacters/CharacterMenu'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { FilterBar } from 'lib/tabs/tabCharacters/FilterBar'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { Deferred, DeferredRenderProvider } from 'lib/ui/DeferredRender'
import React, { Suspense, useCallback } from 'react'
import type { Character } from 'types/character'

import { defaultGap, parentH } from 'lib/constants/constantsUi'

export function CharacterTab() {
  const focusCharacter = useCharacterTabStore((s) => s.focusCharacter)
  const selectedCharacter = useCharacterStore((s) => focusCharacter ? s.charactersById[focusCharacter] : null) ?? null

  // --- PROFILING ---
  const renderStart = performance.now()
  React.useEffect(() => {
    console.log(`[TAB PROFILE] CharacterTab render: ${(performance.now() - renderStart).toFixed(1)}ms`)
  })
  // --- END PROFILING ---

  // CharacterPreview calls setInitialCharacter(char) then setOpen(true) sequentially.
  // We open the overlay on setInitialCharacter and ignore setOpen(true) since it's already open.
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
    // open=true is handled by setOriginalCharacterModalInitialCharacter above
  }, [])

  return (
    <DeferredRenderProvider resetKey={null}>
      <Flex
        style={{
          height: '100%',
          marginBottom: 200,
          width: 1593,
        }}
        gap={defaultGap}
      >
        <Flex direction="column" gap={defaultGap}>
          <CharacterMenu />

          <Flex direction="column" gap={defaultGap} miw={320}>
            <div
              id='characterGrid'
              style={{
                width: '100%',
                height: parentH,
              }}
            >
              <Deferred>
                <CharacterGrid />
              </Deferred>
            </div>
          </Flex>
        </Flex>

        <Flex direction="column" gap={defaultGap}>
          <FilterBar />

          <Deferred>
            <Suspense>
              <CharacterPreview
                id='characterTabPreview'
                source={ShowcaseSource.CHARACTER_TAB}
                character={selectedCharacter}
                setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
              />
            </Suspense>
          </Deferred>
        </Flex>
      </Flex>
    </DeferredRenderProvider>
  )
}
