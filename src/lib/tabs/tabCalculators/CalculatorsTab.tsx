import {
  Flex,
  Tabs,
} from '@mantine/core'
import { Stats } from 'lib/constants/constants'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { Assets } from 'lib/rendering/assets'
import { AhaPanel } from 'lib/tabs/tabCalculators/AhaPanel'
import { EhrPanel } from 'lib/tabs/tabCalculators/EhrPanel'
import {
  CALCULATOR_PANELS,
  CalculatorPanel,
  pushCalculatorHash,
  replaceCalculatorHash,
  resolveCalculatorPanel,
} from 'lib/tabs/tabCalculators/calculatorPanels'
import {
  useContext,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

const PANEL_ICONS: Record<CalculatorPanel, string> = {
  [CalculatorPanel.AHA]: Stats.Elation,
  [CalculatorPanel.EHR]: Stats.EHR,
}

const PANEL_I18N_LABEL = {
  [CalculatorPanel.AHA]: 'AHA.Label',
  [CalculatorPanel.EHR]: 'EHR.Label',
} as const

export function CalculatorsTab() {
  const { t } = useTranslation('modals', { keyPrefix: 'QuickUtils' })
  const [activePanel, setActivePanel] = useState<CalculatorPanel>(resolveCalculatorPanel)
  const { addActivationListener } = useContext(TabVisibilityContext)

  useEffect(() => {
    return addActivationListener(() => {
      replaceCalculatorHash(activePanel)
    })
  }, [addActivationListener, activePanel])

  function handleTabChange(value: string | null) {
    if (!value || !(Object.values(CalculatorPanel) as string[]).includes(value)) return
    const panel = value as CalculatorPanel
    setActivePanel(panel)
    pushCalculatorHash(panel)
  }

  return (
    <Flex direction='column' gap={5} w={950} style={{ margin: '0 auto' }}>
      <Tabs
        value={activePanel}
        onChange={handleTabChange}
        variant='outline'
        mb={32}
        styles={{ tab: { height: 42, paddingInline: 32 }, panel: { paddingTop: 10 } }}
      >
        <Tabs.List>
          {CALCULATOR_PANELS.map((panel) => (
            <Tabs.Tab key={panel} value={panel}>
              <Flex align='center' gap={8}>
                <img src={Assets.getStatIcon(PANEL_ICONS[panel])} alt='' style={{ height: 20 }} />
                {t(PANEL_I18N_LABEL[panel])}
              </Flex>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value={CalculatorPanel.AHA}>
          <AhaPanel />
        </Tabs.Panel>
        <Tabs.Panel value={CalculatorPanel.EHR}>
          <EhrPanel />
        </Tabs.Panel>
      </Tabs>
    </Flex>
  )
}
