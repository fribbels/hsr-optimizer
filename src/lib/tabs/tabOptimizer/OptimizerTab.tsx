import { Flex } from '@mantine/core'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import { SettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import { ExpandedDataPanel } from 'lib/tabs/tabOptimizer/analysis/ExpandedDataPanel'
import { OptimizerBuildPreview } from 'lib/tabs/tabOptimizer/OptimizerBuildPreview'
import { OptimizerGrid } from 'lib/tabs/tabOptimizer/optimizerForm/grid/OptimizerGrid'

import { OptimizerForm } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { Sidebar } from 'lib/tabs/tabOptimizer/Sidebar'
import { UnreleasedCharacterDisclaimer } from 'lib/tabs/tabOptimizer/UnreleasedCharacterDisclaimer'
import { DPSScoreDisclaimer } from 'lib/characterPreview/DPSScoreDisclaimer'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { Deferred, DeferredRenderProvider } from 'lib/ui/DeferredRender'
import React, { useContext, useEffect, useState } from 'react'

export function OptimizerTab() {
  const expandedPanelPosition = useGlobalStore((s) => s.settings.ExpandedInfoPanelPosition)
  const { isActiveRef, addActivationListener } = useContext(TabVisibilityContext)
  const [activated, setActivated] = useState(isActiveRef.current)

  useEffect(() => {
    if (activated) return
    return addActivationListener(() => setActivated(true))
  }, [activated, addActivationListener])

  // --- PROFILING ---
  const renderStart = performance.now()
  React.useEffect(() => {
    console.log(`[TAB PROFILE] OptimizerTab render: ${(performance.now() - renderStart).toFixed(1)}ms`)
  })
  // --- END PROFILING ---

  return (
    <DeferredRenderProvider resetKey={null} enabled={activated}>
      <Flex>
        <Flex direction="column" gap={10} style={{ marginBottom: 100, width: 1302 }}>
          <OptimizerForm />
          <DPSScoreDisclaimer />
          <UnreleasedCharacterDisclaimer />
          <Deferred>
            <OptimizerGrid />
          </Deferred>
          <Deferred>
            <Flex
              gap={10}
              style={{ flexDirection: expandedPanelPosition === SettingOptions.ExpandedInfoPanelPosition.Below ? 'column' : 'column-reverse' }}
            >
              <OptimizerBuildPreview />
              <ExpandedDataPanel />
            </Flex>
          </Deferred>
        </Flex>
        <Sidebar />
      </Flex>
    </DeferredRenderProvider>
  )
}
