import { Flex } from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { useCharacterStore } from 'lib/stores/characterStore'
import { CharacterGrid } from 'lib/tabs/tabCharacters/CharacterGrid'
import { CharacterMenu } from 'lib/tabs/tabCharacters/CharacterMenu'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { FilterBar } from 'lib/tabs/tabCharacters/FilterBar'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import React, { Suspense, useCallback } from 'react'
import { Character } from 'types/character'

const defaultGap = 8
const parentH = 280 * 3 + defaultGap * 2

export default function CharacterTab() {
  const focusCharacter = useCharacterTabStore((s) => s.focusCharacter)
  const selectedCharacter = useCharacterStore((s) => focusCharacter ? s.charactersById[focusCharacter] : null) ?? null

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
    <Flex
      style={{
        height: '100%',
        marginBottom: 200,
        width: 1455,
      }}
      gap={defaultGap}
    >
      <Flex direction="column" gap={defaultGap}>
        <CharacterMenu />

        <Flex direction="column" gap={defaultGap} miw={240}>
          <div
            id='characterGrid'
            style={{
              width: '100%',
              height: parentH,
            }}
          >
            <CharacterGrid />
          </div>
        </Flex>
      </Flex>

      <Flex direction="column" gap={defaultGap}>
        <FilterBar />

        <Suspense>
          <CharacterPreview
            id='characterTabPreview'
            source={ShowcaseSource.CHARACTER_TAB}
            character={selectedCharacter}
            setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
            setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
          />
        </Suspense>
      </Flex>
    </Flex>
  )
}
