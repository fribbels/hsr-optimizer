import {
  Form as AntDForm,
} from 'antd'
import { SegmentedControl } from '@mantine/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function CharacterEidolonFormRadio() {
  const { t } = useTranslation('modals', { keyPrefix: 'EditCharacter' })

  return (
    <AntDForm.Item
      name='characterEidolon'
      getValueFromEvent={(val: string) => Number(val)}
      getValueProps={(val) => ({ value: String(val ?? 0) })}
    >
      <SegmentedControl
        fullWidth
        data={[
          { label: t('EidolonButton', { eidolon: 0 }), value: '0' },
          { label: t('EidolonButton', { eidolon: 1 }), value: '1' },
          { label: t('EidolonButton', { eidolon: 2 }), value: '2' },
          { label: t('EidolonButton', { eidolon: 3 }), value: '3' },
          { label: t('EidolonButton', { eidolon: 4 }), value: '4' },
          { label: t('EidolonButton', { eidolon: 5 }), value: '5' },
          { label: t('EidolonButton', { eidolon: 6 }), value: '6' },
        ]}
      />
    </AntDForm.Item>
  )
}
