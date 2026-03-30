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
import { DeferCreate, DeferReveal, DeferCreateProvider } from 'lib/ui/DeferredRender'
import React, { useContext, useEffect, useRef, useState } from 'react'

export function OptimizerTab() {
  const expandedPanelPosition = useGlobalStore((s) => s.settings.ExpandedInfoPanelPosition)
  const { isActiveRef, addActivationListener } = useContext(TabVisibilityContext)
  const [activated, setActivated] = useState(isActiveRef.current)
  const containerRef = useRef<HTMLDivElement>(null)

  // First activation: enable DeferCreateProvider for progressive first mount
  useEffect(() => {
    if (activated) return
    return addActivationListener(() => setActivated(true))
  }, [activated, addActivationListener])

  // Subsequent activations: imperatively stagger section visibility to spread
  // browser layout across frames. Zero React re-renders.
  useEffect(() => {
    let rafId: number
    return addActivationListener(() => {
      const sections = containerRef.current?.querySelectorAll<HTMLElement>(':scope [data-defer-reveal]')
      if (!sections?.length) return
      for (const section of sections) section.style.display = 'none'
      let i = 0
      cancelAnimationFrame(rafId)
      function tick() {
        if (i < sections!.length) {
          sections![i].style.display = ''
          i++
          rafId = requestAnimationFrame(tick)
        }
      }
      rafId = requestAnimationFrame(tick)
    })
  }, [addActivationListener])

  // --- PROFILING ---
  const renderStart = performance.now()
  React.useEffect(() => {
    console.log(`[TAB PROFILE] OptimizerTab render: ${(performance.now() - renderStart).toFixed(1)}ms`)
  })
  // --- END PROFILING ---

  return (
    <DeferCreateProvider resetKey={null} enabled={activated}>
      <Flex ref={containerRef}>
        <Flex direction="column" gap={10} style={{ marginBottom: 100, width: 1302 }}>
          <OptimizerForm />
          <DPSScoreDisclaimer />
          <UnreleasedCharacterDisclaimer />
          <DeferCreate>
            <DeferReveal>
              <OptimizerGrid />
            </DeferReveal>
          </DeferCreate>
          <DeferCreate>
            <DeferReveal>
              <Flex
                gap={10}
                style={{ flexDirection: expandedPanelPosition === SettingOptions.ExpandedInfoPanelPosition.Below ? 'column' : 'column-reverse' }}
              >
                <OptimizerBuildPreview />
                <ExpandedDataPanel />
              </Flex>
            </DeferReveal>
          </DeferCreate>
        </Flex>
        <Sidebar />
      </Flex>
    </DeferCreateProvider>
  )
}
