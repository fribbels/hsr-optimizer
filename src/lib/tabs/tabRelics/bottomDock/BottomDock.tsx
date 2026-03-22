import { Flex } from '@mantine/core'
import { relicCardH } from 'lib/constants/constantsUi'
import { RelicInsightsPanel } from 'lib/tabs/tabRelics/relicInsightsPanel/RelicInsightsPanel'
import { BottomToolbar } from 'lib/tabs/tabRelics/bottomDock/BottomToolbar'
import { ScoredRelicPreview } from 'lib/tabs/tabRelics/bottomDock/ScoredRelicPreview'

export function BottomDock() {
  return (
    <Flex direction="column" gap={10}>
      <BottomToolbar />
      <Flex gap={10} style={{ height: relicCardH }}>
        <ScoredRelicPreview />
        <Flex flex={1} style={{ minWidth: 0 }}>
          <RelicInsightsPanel />
        </Flex>
      </Flex>
    </Flex>
  )
}
