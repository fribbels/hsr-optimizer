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
import { DPSScoreDisclaimer } from 'lib/tabs/tabShowcase/ShowcaseTab'
import { useGlobalStore } from 'lib/stores/appStore'

export function OptimizerTab() {
  const expandedPanelPosition = useGlobalStore((s) => s.settings.ExpandedInfoPanelPosition)

  return (
    <Flex>
      <Flex direction="column" gap={10} style={{ marginBottom: 100, width: 1302 }}>
        <OptimizerForm />
        <DPSScoreDisclaimer />
        <UnreleasedCharacterDisclaimer />
        <OptimizerGrid />
        <Flex
          gap={10}
          style={{ flexDirection: expandedPanelPosition === SettingOptions.ExpandedInfoPanelPosition.Below ? 'column' : 'column-reverse' }}
        >
          <OptimizerBuildPreview />
          <ExpandedDataPanel />
        </Flex>
      </Flex>
      <Sidebar />
    </Flex>
  )
}
