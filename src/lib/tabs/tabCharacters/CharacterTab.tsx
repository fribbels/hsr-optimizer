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
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { useDeferReveal } from 'lib/ui/DeferredRender'
import { useCallback, useContext, useEffect } from 'react'
import type { Character } from 'types/character'

import { cardTotalW, defaultGap, parentH } from 'lib/constants/constantsUi'

export function CharacterTab() {
  // Sync selected character from optimizer tab on activation
  const { addActivationListener } = useContext(TabVisibilityContext)
  useEffect(() => {
    return addActivationListener(() => {
      const id = useOptimizerDisplayStore.getState().focusCharacterId
      if (id) {
        useCharacterTabStore.setState({ focusCharacter: id })
      }
    })
  }, [addActivationListener])

  const focusCharacter = useCharacterTabStore((s) => s.focusCharacter)
  const selectedCharacter = useCharacterStore((s) => focusCharacter ? s.charactersById[focusCharacter] : null) ?? null
  const containerRef = useDeferReveal()

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
      ref={containerRef}
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
            <CharacterGrid />
          </div>
        </Flex>
      </Flex>

      <Flex direction="column" gap={defaultGap} w={cardTotalW}>
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
