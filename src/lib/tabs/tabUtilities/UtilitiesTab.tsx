import {
  Flex,
  Tabs,
} from '@mantine/core'
import { Stats } from 'lib/constants/constants'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { Assets } from 'lib/rendering/assets'
import { AhaPanel } from 'lib/tabs/tabUtilities/AhaPanel'
import { EhrPanel } from 'lib/tabs/tabUtilities/EhrPanel'
import {
  pushUtilityHash,
  replaceUtilityHash,
  resolveUtilityPanel,
  UtilityPanel,
  UTILITY_PANELS,
} from 'lib/tabs/tabUtilities/utilityPanels'
import {
  useContext,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

const PANEL_ICONS: Record<UtilityPanel, string> = {
  [UtilityPanel.AHA]: Stats.Elation,
  [UtilityPanel.EHR]: Stats.EHR,
}

const PANEL_I18N_LABEL: Record<UtilityPanel, 'AHA.Label' | 'EHR.Label'> = {
  [UtilityPanel.AHA]: 'AHA.Label',
  [UtilityPanel.EHR]: 'EHR.Label',
}

export function UtilitiesTab() {
  const { t } = useTranslation('modals', { keyPrefix: 'QuickUtils' })
  const [activePanel, setActivePanel] = useState<UtilityPanel>(resolveUtilityPanel)
  const { addActivationListener } = useContext(TabVisibilityContext)

  useEffect(() => {
    return addActivationListener(() => {
      replaceUtilityHash(activePanel)
    })
  }, [addActivationListener, activePanel])

  function handleTabChange(value: string | null) {
    if (!value) return
    const panel = value as UtilityPanel
    setActivePanel(panel)
    pushUtilityHash(panel)
  }

  return (
    <Flex direction='column' gap={5} w={950} style={{ margin: '0 auto' }}>
      <Tabs
        value={activePanel}
        onChange={handleTabChange}
        variant='outline'
        mb={32}
        styles={{ tab: { height: 42, paddingInline: 32 }, panel: { paddingTop: 'var(--mantine-spacing-xl)' } }}
      >
        <Tabs.List>
          {UTILITY_PANELS.map((panel) => (
            <Tabs.Tab key={panel} value={panel}>
              <Flex align='center' gap={8}>
                <img src={Assets.getStatIcon(PANEL_ICONS[panel])} alt='' style={{ height: 20 }} />
                {t(PANEL_I18N_LABEL[panel])}
              </Flex>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value={UtilityPanel.AHA}>
          <AhaPanel />
        </Tabs.Panel>
        <Tabs.Panel value={UtilityPanel.EHR}>
          <EhrPanel />
        </Tabs.Panel>
      </Tabs>
    </Flex>
  )
}
