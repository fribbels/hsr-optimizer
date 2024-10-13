import { Button, Flex, Form, Input, Radio, Segmented, Typography } from 'antd'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants'
import { HeaderText } from 'components/HeaderText'
import InputNumberStyled from 'components/optimizerTab/optimizerForm/InputNumberStyled'
import { useTranslation } from 'react-i18next'
import { SettingOutlined } from '@ant-design/icons'
import { ComboDrawer } from 'components/optimizerTab/rotation/ComboDrawer'
import { FormInstance } from 'antd/es/form/hooks/useForm'

const { Text } = Typography

function SimpleAdvancedToggle(props: {}) {

}

const radioStyle = {
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  paddingInline: 0,
}

export const ComboFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const form = Form.useFormInstance();  // Get the form instance
  const setComboDrawerOpen = window.store((s) => s.setComboDrawerOpen)

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <HeaderText>{t('Header')/* Rotation COMBO formula */}</HeaderText>
      <Flex vertical gap={optimizerTabDefaultGap} style={{ display: 'none' }}>
        <ComboRow title={t('BASIC')} name='BASIC'/>
        <ComboRow title={t('SKILL')} name='SKILL'/>
        <ComboRow title={t('ULT')} name='ULT'/>
        <ComboRow title={t('FUA')} name='FUA'/>
        <ComboRow title={t('DOT')} name='DOT'/>
        <ComboRow title={t('BREAK')} name='BREAK'/>
      </Flex>
      <Form.Item name='comboType'>
        <Radio.Group
          size='small'
          buttonStyle='solid'
          style={{ width: '100%' }}
        >
          <Flex align='center'>
            <Radio.Button style={radioStyle} value='simple'>
              Simple
            </Radio.Button>
            <Radio.Button style={radioStyle} value='advanced'>
              Advanced
            </Radio.Button>
          </Flex>
        </Radio.Group>
      </Form.Item>
      <Flex vertical gap={optimizerTabDefaultGap} style={{ display: 'none' }}>
        <ComboRow title='Basic DMG' name='BASIC'/>
        <ComboRow title='Skill DMG' name='SKILL'/>
        <ComboRow title='Ult DMG' name='ULT'/>
        <ComboRow title='Fua DMG' name='FUA'/>
        <ComboRow title='Dot DMG' name='DOT'/>
        <ComboRow title='Break DMG' name='BREAK'/>
      </Flex>

      <Flex style={{ width: '100%' }} gap={5}>
        <Button size='small' variant='outlined' style={{ flex: 1 }} onClick={() => add(form)}>
          +
        </Button>
        <Button size='small' variant='outlined' style={{ flex: 1 }} onClick={() => reset(form)}>
          Reset
        </Button>
        <Button size='small' variant='outlined' style={{ flex: 1 }} onClick={() => minus(form)}>
          -
        </Button>
      </Flex>
      <ComboBasicDefinition/>

      <Flex vertical gap={8} style={{ marginTop: 5 }}>
        <Flex gap={10}>
          <Flex vertical flex={1}>
            <HeaderText>Dots</HeaderText>
            <NumberXInput name='comboDot'/>
          </Flex>
          <Flex vertical flex={1}>
            <HeaderText>Breaks</HeaderText>
            <NumberXInput name='comboBreak'/>
          </Flex>
        </Flex>

        <Button
          onClick={() => setComboDrawerOpen(true)}
          icon={<SettingOutlined/>}
        >
          Advanced rotation
        </Button>
        <Form.Item name={'comboStateJson'}>
          <Input
            placeholder="This is a fake hidden input to save combo data into the form"
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
  for (let i = 2; i <= 10; i++) {
    formInstance.setFieldValue(['comboAbilities', i], null)
  }
  formInstance.setFieldValue(['comboAbilities', 1], 'BASIC')
}

function ComboBasicDefinition(props: {}) {
  return (
    <Flex vertical style={{ width: '100%' }}>
      <ComboOptionRow index={1}/>
      <ComboOptionRow index={2}/>
      <ComboOptionRow index={3}/>
      <ComboOptionRow index={4}/>
      <ComboOptionRow index={5}/>
      <ComboOptionRow index={6}/>
      <ComboOptionRow index={7}/>
      <ComboOptionRow index={8}/>
    </Flex>
  )
}

const comboOptions = [
  { label: 'Basic', value: 'BASIC' },
  { label: 'Skill', value: 'SKILL' },
  { label: 'Ult', value: 'ULT' },
  { label: 'Fua', value: 'FUA' },
]

function ComboOptionRow(props: { index: number }) {
  return (
    <Form.Item
      shouldUpdate={(prevValues, currentValues) =>
        prevValues.comboAbilities !== currentValues.comboAbilities
      }
      noStyle
    >
      {({ getFieldValue }) => {
        const comboAbilities = getFieldValue('comboAbilities') || [];
        const shouldRenderSegmented = comboAbilities[props.index] != null || props.index < 2;

        return shouldRenderSegmented ? (
          <Form.Item noStyle name={['comboAbilities', props.index]}>
            <Segmented className="comboSegmented" block size="small" options={comboOptions}/>
          </Form.Item>
        ) : null;
      }}
    </Form.Item>
  );
}

// function ComboOptionRow(props: { index: number }) {
//   const form = Form.useFormInstance();  // Get the form instance
//   const [comboAbilities, setComboAbilities] = useState([]);
//
//   useEffect(() => {
//     const currentComboAbilities = form.getFieldValue('comboAbilities') || [];
//     setComboAbilities(currentComboAbilities);
//   }, [form]);
//
//   const shouldRenderSegmented = comboAbilities[props.index] != null || props.index < 2;
//
//   return shouldRenderSegmented ? (
//     <Form.Item noStyle name={['comboAbilities', props.index]}>
//       <Segmented className="comboSegmented" block size="small" options={comboOptions}/>
//     </Form.Item>
//   ) : null;
// }

function ComboRow(props: { title: string; name: string }) {
  return (
    <Flex justify='space-between'>
      <Text>
        {props.title}
      </Text>
      <Form.Item name={['combo', props.name]}>
        <InputNumberStyled
          addonBefore='⨯'
          size='small'
          controls={true}
          style={{ width: 90 }}
          rootClassName='comboInputNumber'
        />
      </Form.Item>
    </Flex>
  )
}

function NumberXInput(props: {name: string}) {
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