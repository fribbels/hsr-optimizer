import { Accordion, Flex } from '@mantine/core'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { BottomDock } from 'lib/tabs/tabRelics/bottomDock/BottomDock'
import { RelicsGrid } from 'lib/tabs/tabRelics/RelicsGrid'
import { RecentRelics } from 'lib/tabs/tabRelics/RecentRelics'
import { TopBar } from 'lib/tabs/tabRelics/topBar/TopBar'
import { useTranslation } from 'react-i18next'

export const TAB_WIDTH = 1460

export function RelicsTab() {
  const { recentRelics } = useScannerState()
  const { t } = useTranslation('relicsTab')

  return (
    <Flex direction="column" gap={10} style={{ width: TAB_WIDTH, marginBottom: 100 }}>
      <TopBar />

      {recentRelics.length > 0 && (
        <Accordion defaultValue={['1']} multiple>
          <Accordion.Item value="1">
            <Accordion.Control>{t('RecentlyUpdatedRelics.Header')}</Accordion.Control>
            <Accordion.Panel><RecentRelics /></Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      <RelicsGrid />

      <BottomDock />
    </Flex>
  )
}
