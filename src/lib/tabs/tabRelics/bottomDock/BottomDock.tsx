import { relicCardH } from 'lib/constants/constantsUi'
import {
  BottomToolbarLeft,
  BottomToolbarRight,
} from 'lib/tabs/tabRelics/bottomDock/BottomToolbar'
import { ScoredRelicPreview } from 'lib/tabs/tabRelics/bottomDock/ScoredRelicPreview'
import { RelicInsightsPanel } from 'lib/tabs/tabRelics/relicInsightsPanel/RelicInsightsPanel'
import { VerticalDivider } from 'lib/ui/Dividers'

export function BottomDock() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <BottomToolbarLeft />
        <ScoredRelicPreview />
      </div>
      <VerticalDivider width={4} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
        <BottomToolbarRight />
        <div style={{ flex: 1, minHeight: relicCardH }}>
          <RelicInsightsPanel />
        </div>
      </div>
    </div>
  )
}
