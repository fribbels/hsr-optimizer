import { SettingOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, Popconfirm, Radio } from 'antd'
import { FormInstance } from 'antd/es/form/hooks/useForm'
import { ABILITY_LIMIT } from 'lib/constants/constants'
import { DEFAULT_BASIC, TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import DB from 'lib/state/db'
import { ComboDrawer } from 'lib/tabs/tabOptimizer/combo/ComboDrawer'
import InputNumberStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'
import { TurnAbilitySelector } from 'lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { OptimizerForm } from 'types/form'

const radioStyle = {
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  paddingInline: 0,
}

export const ComboFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const { t: tCommon } = useTranslation('common')
  const form = Form.useFormInstance<OptimizerForm>() // Get the form instance
  const setComboDrawerOpen = window.store((s) => s.setComboDrawerOpen)
  const comboType = Form.useWatch('comboType', form)
  const comboOptions = useMemo(() => [
    { label: t('ComboOptions.Basic')/* Basic */, value: 'BASIC' },
    { label: t('ComboOptions.Skill')/* Skill */, value: 'SKILL' },
    { label: t('ComboOptions.Ult')/* Ult */, value: 'ULT' },
    { label: t('ComboOptions.Fua')/* Fua */, value: 'FUA' },
    { label: t('ComboOptions.MemoSkill')/* Skillᴹ */, value: 'MEMO_SKILL' },
    { label: t('ComboOptions.MemoTalent')/* Talentᴹ */, value: 'MEMO_TALENT' },
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

      <>
        <Flex vertical gap={8} style={{ marginTop: 2 }}>
          <Button
            onClick={() => setComboDrawerOpen(true)}
            icon={<SettingOutlined/>}
            disabled={comboType == 'simple'}
          >
            {t('RotationButton')}
          </Button>
        </Flex>
        <Form.Item name='comboStateJson' style={{ height: 0 }}>
          <Input
            placeholder='This is a fake hidden input to save combo data into the form'
            style={{ display: 'none' }}
          />
        </Form.Item>
        <ComboDrawer/>
      </>
    </Flex>
  )
}

function add(formInstance: FormInstance<OptimizerForm>) {
  const form = formInstance.getFieldsValue()

  for (let i = 1; i <= ABILITY_LIMIT + 2; i++) {
    if (form.comboTurnAbilities?.[i] == null) {
      formInstance.setFieldValue(['comboTurnAbilities', i], DEFAULT_BASIC)
      break
    }
  }
}

function minus(formInstance: FormInstance<OptimizerForm>) {
  const form = formInstance.getFieldsValue()

  for (let i = ABILITY_LIMIT + 2; i > 1; i--) {
    if (form.comboTurnAbilities?.[i] != null) {
      formInstance.setFieldValue(['comboTurnAbilities', i], null)
      break
    }
  }
}

// TODO: Refactor reset abilities
function reset(formInstance: FormInstance<OptimizerForm>) {
  const characterId = window.store.getState().optimizerTabFocusCharacter!
  const characterMetadata = DB.getMetadata().characters[characterId]

  if (!characterMetadata) return

  const defaultComboAbilities = characterMetadata.scoringMetadata?.simulation?.comboAbilities ?? [null, 'BASIC']
  const defaultComboDot = characterMetadata.scoringMetadata?.simulation?.comboDot ?? 0
  const defaultComboBreak = characterMetadata.scoringMetadata?.simulation?.comboBreak ?? 0

  for (let i = 0; i <= ABILITY_LIMIT + 2; i++) {
    formInstance.setFieldValue(['comboAbilities', i], defaultComboAbilities[i] ?? null)
  }
  formInstance.setFieldValue(['comboDot'], defaultComboDot)
  formInstance.setFieldValue(['comboBreak'], defaultComboBreak)
  formInstance.setFieldValue(['comboStateJson'], '{}')
}

function ComboBasicDefinition(props: { comboOptions: { value: string; label: string }[] }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })

  return (
    <Flex>
      <Flex vertical flex={1} style={{ marginLeft: 2 }} gap={3}>
        <HeaderText>{t('AbilityLabel')/* Abilities */}</HeaderText>
        {Array.from({ length: ABILITY_LIMIT }, (_, i) => (
          <ComboOptionRowSelect
            key={i + 1}
            index={i + 1}
            comboOptions={props.comboOptions}
          />
        ))}
      </Flex>

      <VerticalDivider width={10}/>

      <Flex vertical gap={10} flex={1} align='flex-start'>
        <Flex vertical>
          <HeaderText>{t('CounterLabels.Dot')}</HeaderText>
          <NumberXInput name='comboDot'/>
        </Flex>
        <Flex vertical>
          <HeaderText>{t('CounterLabels.Break')}</HeaderText>
          <NumberXInput name='comboBreak'/>
        </Flex>
      </Flex>
    </Flex>
  )
}

function ComboOptionRowSelect(props: { index: number; comboOptions: { value: string; label: string }[] }) {
  return (
    <Form.Item
      shouldUpdate={(prevValues: OptimizerForm, currentValues: OptimizerForm) =>
        prevValues.comboTurnAbilities !== currentValues.comboTurnAbilities}
      noStyle
    >
      {({ getFieldValue }) => {
        const comboTurnAbilities: TurnAbilityName[] = getFieldValue('comboTurnAbilities') ?? []
        const shouldRenderSegmented = comboTurnAbilities[props.index] != null || props.index < 2

        return shouldRenderSegmented
          ? (
            <TurnAbilitySelector formName={['comboTurnAbilities', props.index]}/>
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
