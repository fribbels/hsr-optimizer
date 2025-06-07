import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import {
  Flex,
  theme,
} from 'antd'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { BuildsModal } from 'lib/overlays/modals/BuildsModal'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { SaveBuildModal } from 'lib/overlays/modals/SaveBuildModal'
import { SwitchRelicsModal } from 'lib/overlays/modals/SwitchRelicsModal'
import { getGridTheme } from 'lib/rendering/theme'
import DB from 'lib/state/db'
import { CharacterGrid } from 'lib/tabs/tabCharacters/CharacterGrid'
import { CharacterMenu } from 'lib/tabs/tabCharacters/CharacterMenu'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { FilterBar } from 'lib/tabs/tabCharacters/FilterBar'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import React, { Suspense } from 'react'

const { useToken } = theme

export default function CharacterTab() {
  const { token } = useToken()

  const characterModalOpen = useCharacterTabStore((s) => s.characterModalOpen)
  const setCharacterModalOpen = useCharacterTabStore((s) => s.setCharacterModalOpen)
  const characterModalInitialCharacter = useCharacterTabStore((s) => s.characterModalInitialCharacter)
  const setCharacterModalInitialCharacter = useCharacterTabStore((s) => s.setCharacterModalInitialCharacter)

  console.log('======================================================================= RENDER CharacterTab')

  const selectedCharacter = useCharacterTabStore((s) => s.selectedCharacter)

  const [, forceUpdate] = React.useReducer((o) => !o, false)
  window.forceCharacterTabUpdate = () => {
    console.log('__________ CharacterTab forceCharacterTabUpdate')
    forceUpdate()

    window.setCharacterRows(DB.getCharacters())
    window.characterGrid.current?.api?.redrawRows()
  }

  const defaultGap = 8
  const parentH = 280 * 3 + defaultGap * 2

  return (
    <Flex
      style={{
        height: '100%',
        marginBottom: 200,
        width: 1455,
      }}
      gap={defaultGap}
    >
      <Flex vertical gap={defaultGap}>
        <CharacterMenu />

        <Flex vertical gap={8} style={{ minWidth: 240 }}>
          <div
            id='characterGrid'
            className='ag-theme-balham-dark'
            style={{
              display: 'block',
              width: '100%',
              height: parentH,
              ...getGridTheme(token),
            }}
          >
            <CharacterGrid />
          </div>
        </Flex>
      </Flex>

      <Flex vertical gap={defaultGap}>
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

      <SaveBuildModal />

      <BuildsModal />
    </Flex>
  )
}
