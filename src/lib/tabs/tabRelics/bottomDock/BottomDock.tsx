import { relicCardH } from 'lib/constants/constantsUi'
import { RelicInsightsPanel } from 'lib/tabs/tabRelics/relicInsightsPanel/RelicInsightsPanel'
import { BottomToolbar } from 'lib/tabs/tabRelics/bottomDock/BottomToolbar'
import { ScoredRelicPreview } from 'lib/tabs/tabRelics/bottomDock/ScoredRelicPreview'

export function BottomDock() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <BottomToolbar />
      <div style={{ display: 'flex', gap: 5, minHeight: relicCardH }}>
        <ScoredRelicPreview />
        <div style={{ flex: 1, minWidth: 0 }}>
          <RelicInsightsPanel />
        </div>
      </div>
    </div>
  )
}
