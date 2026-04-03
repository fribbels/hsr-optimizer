import { Accordion } from '@mantine/core'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { BottomDock } from 'lib/tabs/tabRelics/bottomDock/BottomDock'
import { RelicsGrid } from 'lib/tabs/tabRelics/RelicsGrid'
import { RecentRelics } from 'lib/tabs/tabRelics/RecentRelics'
import { TopBar } from 'lib/tabs/tabRelics/topBar/TopBar'
import { DeferReveal, useDeferReveal } from 'lib/ui/DeferredRender'
import { useTranslation } from 'react-i18next'

export const TAB_WIDTH = 1460

export function RelicsTab() {
  const hasRecentRelics = useScannerState((s) => s.connected && s.recentRelics.length > 0)
  const { t } = useTranslation('relicsTab')
  const containerRef = useDeferReveal()

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: TAB_WIDTH, marginBottom: 100 }}>
      <TopBar />

      {hasRecentRelics && (
        <div style={{
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          background: 'var(--layer-1)',
          boxShadow: 'var(--shadow-card-flat)',
          border: 'var(--border-subtle)',
        }}>
          <Accordion
            defaultValue={['1']}
            multiple
            chevronPosition="right"
            variant="default"
            transitionDuration={200}
            styles={{
              control: { fontSize: 20, alignItems: 'baseline' },
              content: { paddingBlock: 0, paddingBottom: 10 },
              chevron: { paddingInlineStart: 12 },
            }}
          >
            <Accordion.Item value="1">
              <Accordion.Control>{t('RecentlyUpdatedRelics.Header')}</Accordion.Control>
              <Accordion.Panel><RecentRelics /></Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </div>
      )}

      <DeferReveal>
        <RelicsGrid />
      </DeferReveal>

      <DeferReveal>
        <BottomDock />
      </DeferReveal>
    </div>
  )
}
