import { SettingOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, Popconfirm, Radio, Segmented } from 'antd'
import { FormInstance } from 'antd/es/form/hooks/useForm'
import DB from 'lib/state/db'
import { ComboDrawer } from 'lib/tabs/tabOptimizer/combo/ComboDrawer'
import InputNumberStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const radioStyle = {
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  paddingInline: 0,
}

export const ComboFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const { t: tCommon } = useTranslation('common')
  const form = Form.useFormInstance() // Get the form instance
  const setComboDrawerOpen = window.store((s) => s.setComboDrawerOpen)
  const comboType = Form.useWatch('comboType', form)
  const comboOptions = useMemo(() => [
    { label: t('ComboOptions.Basic'), value: 'BASIC' },
    { label: t('ComboOptions.Skill'), value: 'SKILL' },
    { label: t('ComboOptions.Ult'), value: 'ULT' },
    { label: t('ComboOptions.Fua'), value: 'FUA' },
  ], [t])

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <HeaderText>{t('Header')/* Rotation COMBO formula */}</HeaderText>
      <Form.Item name='comboType'>
        <Radio.Group
          size='small'
          buttonStyle='solid'
          style={{ width: '100%' }}
        >
          <Flex align='center'>
            <Radio.Button style={radioStyle} value='simple'>
              {t('ModeSelector.Simple')}
            </Radio.Button>
            <Radio.Button style={radioStyle} value='advanced'>
              {t('ModeSelector.Advanced')}
            </Radio.Button>
          </Flex>
        </Radio.Group>
      </Form.Item>

      <Flex style={{ width: '100%' }} gap={5}>
        <Button size='small' variant='outlined' style={{ flex: 1 }} onClick={() => add(form)}>
          {t('RowControls.Add')}
        </Button>
        <Popconfirm
          title={tCommon('Confirm')}
          description={t('RowControls.ResetConfirm.Description')}
          onConfirm={() => reset(form)}
          placement='bottom'
          okText={tCommon('Yes')}
          cancelText={tCommon('Cancel')}
        >
          <Button size='small' variant='outlined' style={{ flex: 1 }}>
            {tCommon('Reset')}
          </Button>
        </Popconfirm>
        <Button size='small' variant='outlined' style={{ flex: 1 }} onClick={() => minus(form)}>
          {t('RowControls.Remove')}
        </Button>
      </Flex>

      <ComboBasicDefinition comboOptions={comboOptions}/>

      <Flex vertical gap={8} style={{ marginTop: 5 }}>
        <Flex gap={10}>
          <Flex vertical flex={1}>
            <HeaderText>{t('CounterLabels.Dot')}</HeaderText>
            <NumberXInput name='comboDot'/>
          </Flex>
          <Flex vertical flex={1}>
            <HeaderText>{t('CounterLabels.Break')}</HeaderText>
            <NumberXInput name='comboBreak'/>
          </Flex>
        </Flex>

        <Button
          onClick={() => setComboDrawerOpen(true)}
          icon={<SettingOutlined/>}
          disabled={comboType == 'simple'}
        >
          {t('RotationButton')}
        </Button>
        <Form.Item name='comboStateJson'>
          <Input
            placeholder='This is a fake hidden input to save combo data into the form'
            style={{ display: 'none' }}
          />
        </Form.Item>
        <ComboDrawer/>
      </Flex>
    </Flex>
  )
}

function add(formInstance: FormInstance) {
  const form = formInstance.getFieldsValue()

  for (let i = 1; i <= 10; i++) {
    if (form.comboAbilities?.[i] == null) {
      formInstance.setFieldValue(['comboAbilities', i], 'BASIC')
      break
    }
  }
}

function minus(formInstance: FormInstance) {
  const form = formInstance.getFieldsValue()

  for (let i = 10; i > 1; i--) {
    if (form.comboAbilities?.[i] != null) {
      formInstance.setFieldValue(['comboAbilities', i], null)
      break
    }
  }
}

function reset(formInstance: FormInstance) {
  const characterId = window.store.getState().optimizerTabFocusCharacter!
  const characterMetadata = DB.getMetadata().characters[characterId]

  if (!characterMetadata) return

  const defaultComboAbilities = characterMetadata.scoringMetadata?.simulation?.comboAbilities ?? [null, 'BASIC']
  const defaultComboDot = characterMetadata.scoringMetadata?.simulation?.comboDot ?? 0
  const defaultComboBreak = characterMetadata.scoringMetadata?.simulation?.comboBreak ?? 0

  for (let i = 0; i <= 10; i++) {
    formInstance.setFieldValue(['comboAbilities', i], defaultComboAbilities[i] ?? null)
  }
  formInstance.setFieldValue(['comboDot'], defaultComboDot)
  formInstance.setFieldValue(['comboBreak'], defaultComboBreak)
  formInstance.setFieldValue(['comboStateJson'], '{}')
}

function ComboBasicDefinition(props: { comboOptions: { value: string; label: string }[] }) {
  return (
    <Flex vertical style={{ width: '100%' }}>
      <ComboOptionRow index={1} comboOptions={props.comboOptions}/>
      <ComboOptionRow index={2} comboOptions={props.comboOptions}/>
      <ComboOptionRow index={3} comboOptions={props.comboOptions}/>
      <ComboOptionRow index={4} comboOptions={props.comboOptions}/>
      <ComboOptionRow index={5} comboOptions={props.comboOptions}/>
      <ComboOptionRow index={6} comboOptions={props.comboOptions}/>
      <ComboOptionRow index={7} comboOptions={props.comboOptions}/>
      <ComboOptionRow index={8} comboOptions={props.comboOptions}/>
    </Flex>
  )
}

function ComboOptionRow(props: { index: number; comboOptions: { value: string; label: string }[] }) {
  return (
    <Form.Item
      shouldUpdate={(prevValues, currentValues) =>
        prevValues.comboAbilities !== currentValues.comboAbilities}
      noStyle
    >
      {({ getFieldValue }) => {
        const comboAbilities = getFieldValue('comboAbilities') || []
        const shouldRenderSegmented = comboAbilities[props.index] != null || props.index < 2

        return shouldRenderSegmented
          ? (
            <Form.Item noStyle name={['comboAbilities', props.index]}>
              <Segmented className='comboSegmented' block size='small' options={props.comboOptions}/>
            </Form.Item>
          )
          : null
      }}
    </Form.Item>
  )
}

function NumberXInput(props: { name: string }) {
  return (
    <Form.Item name={props.name}>
      <InputNumberStyled
        addonBefore='⨯'
        size='small'
        controls={true}
        style={{ width: '100%' }}
        rootClassName='comboInputNumber'
      />
    </Form.Item>
  )
}
