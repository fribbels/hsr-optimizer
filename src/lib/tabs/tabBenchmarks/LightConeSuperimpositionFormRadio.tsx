import {
  Form as AntDForm,
  Radio,
} from 'antd'
import { RadioButton } from 'lib/tabs/tabBenchmarks/CharacterEidolonFormRadio'
import { useTranslation } from 'react-i18next'

export function LightConeSuperimpositionFormRadio() {
  const { t } = useTranslation('modals', { keyPrefix: 'EditCharacter' })

  return (
    <AntDForm.Item name='lightConeSuperimposition'>
      <Radio.Group
        value={1}
        buttonStyle='solid'
        style={{ width: '100%', display: 'flex' }}
      >
        <RadioButton text={t('SuperimpositionButton', { superimposition: 1 })} value={1} />
        <RadioButton text={t('SuperimpositionButton', { superimposition: 2 })} value={2} />
        <RadioButton text={t('SuperimpositionButton', { superimposition: 3 })} value={3} />
        <RadioButton text={t('SuperimpositionButton', { superimposition: 4 })} value={4} />
        <RadioButton text={t('SuperimpositionButton', { superimposition: 5 })} value={5} />
      </Radio.Group>
    </AntDForm.Item>
  )
}
