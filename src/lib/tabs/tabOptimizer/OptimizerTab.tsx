import { Flex } from '@mantine/core'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import { SettingOptions } from 'lib/constants/settingsConstants'
import { ExpandedDataPanel } from 'lib/tabs/tabOptimizer/analysis/ExpandedDataPanel'
import { OptimizerBuildPreview } from 'lib/tabs/tabOptimizer/OptimizerBuildPreview'
import { OptimizerGrid } from 'lib/tabs/tabOptimizer/optimizerForm/grid/OptimizerGrid'

import { DPSScoreDisclaimer } from 'lib/characterPreview/DPSScoreDisclaimer'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useGlobalStore } from 'lib/stores/app/appStore'
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

export function OptimizerTab() {
  const expandedPanelPosition = useGlobalStore((s) => s.settings.ExpandedInfoPanelPosition)
  const { isActiveRef, addActivationListener } = useContext(TabVisibilityContext)
  const [activated, setActivated] = useState(isActiveRef.current)

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
