import { Accordion } from '@mantine/core'
import { RELICS_TAB_WIDTH } from 'lib/constants/constantsUi'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { BottomDock } from 'lib/tabs/tabRelics/bottomDock/BottomDock'
import { RecentRelics } from 'lib/tabs/tabRelics/RecentRelics'
import { RelicsGrid } from 'lib/tabs/tabRelics/RelicsGrid'
import { TopBar } from 'lib/tabs/tabRelics/topBar/TopBar'
import { DeferCreateProvider } from 'lib/ui/DeferredRender'
import {
  useContext,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

export function RelicsTab() {
  const hasRecentRelics = useScannerState((s) => s.connected && s.recentRelics.length > 0)
  const { t } = useTranslation('relicsTab')

  // Enable deferred rendering after first tab activation
  const { isActiveRef, addActivationListener } = useContext(TabVisibilityContext)
  const [activated, setActivated] = useState(isActiveRef.current)

  useEffect(() => {
    if (activated) return
    return addActivationListener(() => setActivated(true))
  }, [activated, addActivationListener])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: RELICS_TAB_WIDTH, marginBottom: 100 }}>
      <TopBar />

      {hasRecentRelics && (
        <div
          style={{
            overflow: 'hidden',
            borderRadius: 'var(--radius-md)',
            background: 'var(--layer-1)',
            boxShadow: 'var(--shadow-card-flat)',
            border: 'var(--border-subtle)',
          }}
        >
          <Accordion
            defaultValue={['1']}
            multiple
            chevronPosition='right'
            variant='default'
            transitionDuration={200}
            styles={{
              control: { fontSize: 20, alignItems: 'baseline' },
              content: { paddingBlock: 0, paddingBottom: 10 },
              chevron: { paddingInlineStart: 12 },
            }}
          >
            <Accordion.Item value='1'>
              <Accordion.Control>{t('RecentlyUpdatedRelics.Header')}</Accordion.Control>
              <Accordion.Panel>
                <RecentRelics />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </div>
      )}

      <RelicsGrid />

      <DeferCreateProvider resetKey={null} enabled={activated}>
        <BottomDock />
      </DeferCreateProvider>
    </div>
  )
}
