import {
  Flex,
  Modal,
  SegmentedControl,
} from '@mantine/core'
import { Stats } from 'lib/constants/constants'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { AhaPanel } from 'lib/overlays/modals/quickUtils/AhaPanel'
import {
  type SharedProps,
  type UtilOptions,
  utilOptions,
} from 'lib/overlays/modals/quickUtils/common'
import { EhrPanel } from 'lib/overlays/modals/quickUtils/EhrPanel'
import { Assets } from 'lib/rendering/assets'
import {
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

export function QuickUtilsModal() {
  const { isOpen, close } = useOpenClose(OpenCloseIDs.QUICK_UTILS_MODAL)
  const { t } = useTranslation('modals', { keyPrefix: 'QuickUtils' })
  const data = useMemo(() => {
    return utilOptions.map((option) => ({ value: option, label: <SegmentLabel t={t} value={option} /> }))
  }, [t])
  const [activePanel, setActivePanel] = useState<UtilOptions>('Aha')
  return (
    <Modal
      title={t('Title', { activeSectionTitle: t(`${activePanel}.Title`) })}
      onClose={close}
      opened={isOpen}
      size={500}
    >
      <Flex direction='column'>
        <SegmentedControl
          data={data}
          value={activePanel}
          onChange={setActivePanel}
        />
        <PanelRenderer t={t} activePanel={activePanel} />
      </Flex>
    </Modal>
  )
}

interface SegmentLabelProps extends SharedProps {
  value: UtilOptions
}
function SegmentLabel({ t, value }: SegmentLabelProps) {
  switch (value) {
    case 'Aha':
      return (
        <Flex style={{ alignItems: 'center' }}>
          <img src={Assets.getStatIcon(Stats.Elation)} style={{ height: 24 }} />
          {t('Aha.Label')}
        </Flex>
      )
    case 'EHR':
      return (
        <Flex style={{ alignItems: 'center' }}>
          <img src={Assets.getStatIcon(Stats.EHR)} style={{ height: 24 }} />
          {t('EHR.Label')}
        </Flex>
      )
  }
}

interface PanelRendererProps extends SharedProps {
  activePanel: UtilOptions
}
function PanelRenderer({ activePanel, ...sharedProps }: PanelRendererProps) {
  switch (activePanel) {
    case 'Aha':
      return <AhaPanel {...sharedProps} />
    case 'EHR':
      return <EhrPanel {...sharedProps} />
  }
}
