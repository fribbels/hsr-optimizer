import {
  Form as AntDForm,
} from 'antd'
import { SegmentedControl } from '@mantine/core'
import { useTranslation } from 'react-i18next'

export function LightConeSuperimpositionFormRadio() {
  const { t } = useTranslation('modals', { keyPrefix: 'EditCharacter' })

  return (
    <AntDForm.Item
      name='lightConeSuperimposition'
      getValueFromEvent={(val: string) => Number(val)}
      getValueProps={(val) => ({ value: String(val ?? 1) })}
    >
      <SegmentedControl
        fullWidth
        data={[
          { label: t('SuperimpositionButton', { superimposition: 1 }), value: '1' },
          { label: t('SuperimpositionButton', { superimposition: 2 }), value: '2' },
          { label: t('SuperimpositionButton', { superimposition: 3 }), value: '3' },
          { label: t('SuperimpositionButton', { superimposition: 4 }), value: '4' },
          { label: t('SuperimpositionButton', { superimposition: 5 }), value: '5' },
        ]}
      />
    </AntDForm.Item>
  )
}
