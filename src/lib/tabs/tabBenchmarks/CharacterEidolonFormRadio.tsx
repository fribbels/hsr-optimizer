import { Form as AntDForm, Radio } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function CharacterEidolonFormRadio() {
  const { t } = useTranslation('modals', { keyPrefix: 'EditCharacter' })

  return (
    <AntDForm.Item name='characterEidolon'>
      <Radio.Group
        value={0}
        buttonStyle='solid'
        style={{ width: '100%', display: 'flex' }}
      >
        <RadioButton text={t('EidolonButton', { eidolon: 0 })} value={0}/>
        <RadioButton text={t('EidolonButton', { eidolon: 1 })} value={1}/>
        <RadioButton text={t('EidolonButton', { eidolon: 2 })} value={2}/>
        <RadioButton text={t('EidolonButton', { eidolon: 3 })} value={3}/>
        <RadioButton text={t('EidolonButton', { eidolon: 4 })} value={4}/>
        <RadioButton text={t('EidolonButton', { eidolon: 5 })} value={5}/>
        <RadioButton text={t('EidolonButton', { eidolon: 6 })} value={6}/>
      </Radio.Group>
    </AntDForm.Item>
  )
}

export function RadioButton(props: {
  text: string
  value: number
}) {
  return (
    <Radio.Button value={props.value} style={{ flex: 1, padding: 'unset', textAlign: 'center' }}>{props.text}</Radio.Button>
  )
}
