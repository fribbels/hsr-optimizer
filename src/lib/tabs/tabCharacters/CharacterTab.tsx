import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import { Flex } from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { BuildsModal } from 'lib/overlays/modals/BuildsModal'
import { CharacterModal } from 'lib/overlays/modals/CharacterModal'
import { SaveBuildModal } from 'lib/overlays/modals/SaveBuildModal'
import { SwitchRelicsModal } from 'lib/overlays/modals/SwitchRelicsModal'
import { useCharacterStore } from 'lib/stores/characterStore'
import { AppPages } from 'lib/constants/appPages'
import { CharacterGrid } from 'lib/tabs/tabCharacters/CharacterGrid'
import { CharacterMenu } from 'lib/tabs/tabCharacters/CharacterMenu'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { FilterBar } from 'lib/tabs/tabCharacters/FilterBar'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import React, { Suspense } from 'react'
import { useShallow } from 'zustand/react/shallow'

const defaultGap = 8
const parentH = 280 * 3 + defaultGap * 2

export default function CharacterTab() {
  const {
    characterModalOpen,
    setCharacterModalOpen,
    characterModalInitialCharacter,
    setCharacterModalInitialCharacter,
    saveBuildModalOpen,
    setSaveBuildModalOpen,
    buildsModalOpen,
    setBuildsModalOpen,
    focusCharacter,
  } = useCharacterTabStore(useShallow((s) => ({
    characterModalOpen: s.characterModalOpen,
    setCharacterModalOpen: s.setCharacterModalOpen,
    characterModalInitialCharacter: s.characterModalInitialCharacter,
    setCharacterModalInitialCharacter: s.setCharacterModalInitialCharacter,
    saveBuildModalOpen: s.saveBuildModalOpen,
    setSaveBuildModalOpen: s.setSaveBuildModalOpen,
    buildsModalOpen: s.buildsModalOpen,
    setBuildsModalOpen: s.setBuildsModalOpen,
    focusCharacter: s.focusCharacter,
  })))

  const selectedCharacter = useCharacterStore((s) => focusCharacter ? s.charactersById[focusCharacter] : null) ?? null

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
            className='ag-theme-balham-dark'
            style={{
              display: 'block',
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
            setOriginalCharacterModalOpen={setCharacterModalOpen}
            setOriginalCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
          />
        </Suspense>
      </Flex>

      <CharacterModal
        onOk={CharacterTabController.onCharacterModalOk}
        open={characterModalOpen}
        setOpen={setCharacterModalOpen}
        initialCharacter={characterModalInitialCharacter}
      />

      <SwitchRelicsModal />

      <SaveBuildModal
        source={AppPages.CHARACTERS}
        character={selectedCharacter}
        isOpen={saveBuildModalOpen}
        close={() => setSaveBuildModalOpen(false)}
      />

      <BuildsModal
        selectedCharacter={selectedCharacter}
        isOpen={buildsModalOpen}
        close={() => setBuildsModalOpen(false)}
      />
    </Flex>
  )
}
