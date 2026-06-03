import { IconCheck, IconX } from '@tabler/icons-react'
import { Flex, NumberInput, SegmentedControl, Select, Title as MantineTitle } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { WarpIncomeOptions } from 'lib/tabs/tabWarp/warpCalculatorController'
import { StarlightMultiplier, StarlightRefund, type WarpRequest, WarpIncomeType } from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { PassIcon } from 'lib/tabs/tabWarp/WarpMilestoneTable'
import { HeaderText } from 'lib/ui/HeaderText'
import { MultiSelectPills } from 'lib/ui/MultiSelectPills'
import { VerticalDivider } from 'lib/ui/Dividers'
import { localeNumber, localeNumber_0, localeNumberComma } from 'lib/utils/i18nUtils'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './WarpCalculatorTab.module.css'

const HEADER_LABEL_GAP = 4

export function WarpSettingsPanel({ form }: { form: UseFormReturnType<WarpRequest> }) {
  const { t } = useTranslation('warpCalculatorTab', { keyPrefix: 'SectionTitles' })
  const { t: tPity } = useTranslation('warpCalculatorTab', { keyPrefix: 'PityCounter' })

  return (
    <Flex style={{ marginBottom: 30 }}>
      <Flex direction="column" flex={1}>
        <Title>
          <Flex justify='center' gap={10}>
            {t('Settings')/* Settings */}
          </Flex>
        </Title>

        <div className={classes.settingsGrid}>
          <ResourceNumberField label={t('Jades')/* Jades */} icon={Assets.getJade()} field='jades' form={form}/>
          <ResourceNumberField label={t('Passes')/* Passes */} icon={Assets.getPass()} field='passes' form={form}/>

          <Flex direction="column" gap={HEADER_LABEL_GAP}>
            <HeaderText>{t('Starlight')/* Starlight */}</HeaderText>
            <Select
              leftSection={resourceIcon(Assets.getStarlight())}
              leftSectionWidth={34} leftSectionPointerEvents='none'
              styles={{ input: { paddingLeft: 42 } }}
              data={generateStarlightOptions()}
              comboboxProps={{ keepMounted: false, width: 'fit-content' }}
              value={form.getValues().starlight}
              onChange={(val) => { if (val != null) form.setFieldValue('starlight', val as StarlightRefund) }}
            />
          </Flex>

          <Flex direction="column" gap={HEADER_LABEL_GAP} style={{ overflow: 'hidden' }}>
            <HeaderText>{t('AdditionalResources')/* Additional resources */}</HeaderText>
            <MultiSelectPills
              placeholder='None' clearable size='xs' maxDisplayedValues={0}
              data={generateIncomeOptions()} dropdownWidth={500}
              value={form.getValues().income}
              onChange={(val) => form.setFieldValue('income', val)}
              renderOption={(option) => (
                <Flex align='center' gap={4}><span>{option.label}</span><PassIcon/></Flex>
              )}
            />
          </Flex>
        </div>
      </Flex>

      <VerticalDivider width={30}/>

      <Flex direction="column" flex={1}>
        <Flex>
          <Title flex={1}>{t('Character')/* Character */}</Title>
          <Title flex={1}>{t('LightCone')/* Light Cone */}</Title>
        </Flex>

        <div className={classes.settingsGrid}>
          <PityField label={tPity('PityCounter')/* Pity counter */} field='pityCharacter' max={89} form={form}/>
          <PityField label={tPity('PityCounter')/* Pity counter */} field='pityLightCone' max={79} form={form}/>
          <GuaranteedField label={tPity('Guaranteed')/* Guaranteed */} field='guaranteedCharacter' form={form}/>
          <GuaranteedField label={tPity('Guaranteed')/* Guaranteed */} field='guaranteedLightCone' form={form}/>
        </div>
      </Flex>
    </Flex>
  )
}

function Title(props: { children: ReactNode, flex?: number }) {
  return (
    <MantineTitle order={5} style={{ margin: 0, marginBottom: 8, textAlign: 'center', flex: props.flex }}>
      {props.children}
    </MantineTitle>
  )
}

function resourceIcon(src: string) {
  return (
    <Flex align='center' justify='center' w='100%' h='60%' pl={2} style={{ borderRight: '1px solid var(--border-default)' }}>
      <img src={src} style={{ height: 24 }}/>
    </Flex>
  )
}

function ResourceNumberField(props: {
  label: string
  icon: string
  field: 'jades' | 'passes'
  form: UseFormReturnType<WarpRequest>
}) {
  const { label, icon, field, form } = props
  return (
    <Flex direction="column" gap={HEADER_LABEL_GAP}>
      <HeaderText>{label}</HeaderText>
      <NumberInput
        placeholder='0' min={0} style={{ width: '100%' }} hideControls
        leftSection={resourceIcon(icon)}
        leftSectionWidth={34} leftSectionPointerEvents='none'
        styles={{ input: { paddingLeft: 42 } }}
        {...form.getInputProps(field)}
      />
    </Flex>
  )
}

function PityField(props: { label: string, field: keyof WarpRequest, max: number, form: UseFormReturnType<WarpRequest> }) {
  return (
    <Flex direction="column" gap={HEADER_LABEL_GAP}>
      <HeaderText>{props.label}</HeaderText>
      <NumberInput
        placeholder='0' min={0} max={props.max}
        style={{ width: '100%' }}
        hideControls
        {...props.form.getInputProps(props.field)}
      />
    </Flex>
  )
}

function GuaranteedField(props: { label: string, field: 'guaranteedCharacter' | 'guaranteedLightCone', form: UseFormReturnType<WarpRequest> }) {
  return (
    <Flex direction="column" gap={HEADER_LABEL_GAP}>
      <HeaderText>{props.label}</HeaderText>
      <SegmentedControl
        fullWidth
        data={[
          { label: <IconX size={18}/>, value: 'false' },
          { label: <IconCheck size={18}/>, value: 'true' },
        ]}
        value={String(props.form.getValues()[props.field] ?? false)}
        onChange={(val) => props.form.setFieldValue(props.field, val === 'true')}
      />
    </Flex>
  )
}

function generateIncomeOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'IncomeOptions')
  const types = [WarpIncomeType.F2P, WarpIncomeType.EXPRESS, WarpIncomeType.BP_EXPRESS]

  return types.map((type) => ({
    group: t(`Type.${type}`),
    items: WarpIncomeOptions
      .filter((option) => option.type === type)
      .map((option) => {
        const totalPhases = Math.max(...WarpIncomeOptions.filter((o) => o.type === type && o.version === option.version).map((o) => o.phase))
        const labelPrefix = t('Label', {
          versionNumber: option.version,
          phaseNumber: option.phase,
          totalPhases: totalPhases,
          type: t(`Type.${option.type}`),
        })
        return {
          value: option.id,
          label: `${labelPrefix} +${localeNumberComma(option.passes)}`,
        }
      }),
  }))
}

function generateStarlightOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'RefundLabels')
  return Object.values(StarlightRefund).map((refund) => ({
    value: refund,
    label: t(`${refund}_FULL`, { Percentage: refundLabel(refund, refund === StarlightRefund.REFUND_AVG) }),
  }))
}

function refundLabel(starlight: StarlightRefund, showDecimal: boolean = false) {
  const value = StarlightMultiplier[starlight] * 100
  return showDecimal ? localeNumber_0(value) : localeNumber(value)
}
