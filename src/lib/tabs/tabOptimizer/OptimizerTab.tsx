import { Flex } from '@mantine/core'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import { SettingOptions } from 'lib/constants/settingsConstants'
import { ExpandedDataPanel } from 'lib/tabs/tabOptimizer/analysis/ExpandedDataPanel'
import { OptimizerBuildPreview } from 'lib/tabs/tabOptimizer/OptimizerBuildPreview'
import { OptimizerGrid } from 'lib/tabs/tabOptimizer/optimizerForm/grid/OptimizerGrid'

import { DPSScoreDisclaimer } from 'lib/characterPreview/DPSScoreDisclaimer'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { CharacterAnnouncement } from 'lib/interactions/CharacterAnnouncement'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { OptimizerForm } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { Sidebar } from 'lib/tabs/tabOptimizer/Sidebar'
import { UnreleasedCharacterDisclaimer } from 'lib/tabs/tabOptimizer/UnreleasedCharacterDisclaimer'
import {
  DeferCreate,
  DeferCreateProvider,
} from 'lib/ui/DeferredRender'
import {
  useContext,
  useEffect,
  useState,
} from 'react'
import type { CharacterId } from 'types/character'
import { useShallow } from 'zustand/react/shallow'

export function OptimizerTab() {
  const expandedPanelPosition = useGlobalStore((s) => s.settings.ExpandedInfoPanelPosition)
  const { isActiveRef, addActivationListener } = useContext(TabVisibilityContext)
  const [activated, setActivated] = useState(isActiveRef.current)

  const {
    characterId,
    teammate0CharId,
    teammate1CharId,
    teammate2CharId,
  } = useOptimizerRequestStore(
    useShallow((s) => ({
      characterId: s.characterId,
      teammate0CharId: s.teammates[0].characterId,
      teammate1CharId: s.teammates[1].characterId,
      teammate2CharId: s.teammates[2].characterId,
    })),
  )

  // First activation: enable DeferCreateProvider for progressive first mount
  useEffect(() => {
    if (activated) return
    return addActivationListener(() => setActivated(true))
  }, [activated, addActivationListener])

  return (
    <DeferCreateProvider resetKey={null} enabled={activated}>
      <Flex>
        <Flex direction='column' gap={10} style={{ marginBottom: 100, width: 1302 }}>
          <OptimizerForm />
          <DPSScoreDisclaimer />
          <UnreleasedCharacterDisclaimer />
          <CharacterAnnouncement
            characterId={characterId}
            teammateCharacterIds={[teammate0CharId, teammate1CharId, teammate2CharId].filter(Boolean) as CharacterId[]}
          />
          <DeferCreate>
            <OptimizerGrid />
          </DeferCreate>
          <DeferCreate>
            <Flex
              gap={10}
              style={{ flexDirection: expandedPanelPosition === SettingOptions.ExpandedInfoPanelPosition.Below ? 'column' : 'column-reverse' }}
            >
              <OptimizerBuildPreview />
              <ExpandedDataPanel />
            </Flex>
          </DeferCreate>
        </Flex>
        <Sidebar />
      </Flex>
    </DeferCreateProvider>
  )
}
