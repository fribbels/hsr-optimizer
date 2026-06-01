import { IconCheck, IconX } from '@tabler/icons-react'
import { Divider, Flex, NumberInput, Paper, SegmentedControl, Select, Title as MantineTitle } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { UseFormReturnType } from '@mantine/form'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { SaveState } from 'lib/state/saveState'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import { BannerRotation, calculateWarps, DEFAULT_WARP_REQUEST, EidolonLevel, type EnrichedWarpRequest, StarlightMultiplier, StarlightRefund, SuperimpositionLevel, normalizeWarpTargets, WarpIncomeOptions, WarpIncomeType, type WarpRequest, WarpStrategy } from 'lib/tabs/tabWarp/warpCalculatorController'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { MultiSelectPills } from 'lib/ui/MultiSelectPills'
import { localeNumber, localeNumber_0, localeNumberComma } from 'lib/utils/i18nUtils'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { scannerChannel, useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import classes from './WarpCalculatorTab.module.css'
import { WarpUnifiedTable } from 'lib/tabs/tabWarp/WarpUnifiedTable'

const HEADER_LABEL_GAP = 4

export function WarpCalculatorTab() {
  const { t } = useTranslation('warpCalculatorTab')

  return (
    <Flex direction="column" style={{ maxWidth: 950, width: '100%' }} align='center' gap="xl">
      <ColorizedTitleWithInfo
        text={t('SectionTitles.Planner')/* Warp Planner */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/warp-planner.md'
      />

      <WarpPlanner/>
    </Flex>
  )
}

function sanitizeWarpRequest(warpRequest: WarpRequest) {
  if (!warpRequest) return { ...DEFAULT_WARP_REQUEST }

  const hasStoredTargets = Array.isArray(warpRequest.targets) && warpRequest.targets.length > 0

  // Spread produces a new object — safe from mutating store state
  const sanitized = { ...DEFAULT_WARP_REQUEST, ...warpRequest }

  // Filter to only valid IDs instead of clearing all selections
  if (!Array.isArray(sanitized.income)) {
    sanitized.income = []
  } else {
    sanitized.income = sanitized.income.filter((incomeId) =>
      WarpIncomeOptions.some((option) => option.id === incomeId),
    )
  }

  sanitized.targets = normalizeWarpTargets(hasStoredTargets ? sanitized : { ...sanitized, targets: [] })
  sanitized.bannerRotation = BannerRotation.NEW
  sanitized.currentEidolonLevel = EidolonLevel.NONE
  sanitized.currentSuperimpositionLevel = SuperimpositionLevel.NONE

  return sanitized
}

function WarpPlanner() {
  const { t } = useTranslation('warpCalculatorTab', { keyPrefix: 'SectionTitles' })
  const storedWarpRequest = useWarpCalculatorStore((s) => s.request)

  const warpRequest = sanitizeWarpRequest(storedWarpRequest)

  const form = useForm<WarpRequest>({
    initialValues: warpRequest,
    onValuesChange: (values) => {
      useWarpCalculatorStore.getState().setRequest(values)
      SaveState.delayedSave(10_000)
    },
  })

  scannerChannel.use((event) => {
    const ingestWarpResources = useScannerState.getState().ingestWarpResources
    if (!ingestWarpResources) return

    switch (event.event) {
      case "UpdateGachaFunds":
        form.setFieldValue("jades", event.data.stellar_jade + event.data.oneric_shards)
        break

      case "UpdateMaterials":
        const state = useScannerState.getState()
        const specialPasses = state.materials["102"] ?? { count: 0 }
        const undyingStarlight = state.materials["252"] ?? { count: 0 }

        form.setFieldValue("passes", specialPasses.count + Math.floor(undyingStarlight.count / 20))
        break

      case "GachaResult":
        const gachaResult = event.data
        const pityUpdate = gachaResult.pity_5

        if (gachaResult.banner_type === "Character") {
          if (pityUpdate.kind === "ResetPity") {
            form.setFieldValue("pityCharacter", pityUpdate.amount)
            form.setFieldValue("guaranteedCharacter", pityUpdate.set_guarantee)
          } else if (pityUpdate.kind === "AddPity") {
            const currentPity = form.getValues().pityCharacter
            form.setFieldValue("pityCharacter", currentPity + gachaResult.pity_5.amount)
          }

        } else if (gachaResult.banner_type === "LightCone") {
          if (pityUpdate.kind === "ResetPity") {
            form.setFieldValue("pityLightCone", pityUpdate.amount)
            form.setFieldValue("guaranteedLightCone", pityUpdate.set_guarantee)
          } else if (pityUpdate.kind === "AddPity") {
            const currentPity = form.getValues().pityLightCone
            form.setFieldValue("pityLightCone", currentPity + gachaResult.pity_5.amount)
          }
        }
    }
  }, [form])

  const warpResult = calculateWarps(form.getValues())

  return (
    <div className={classes.plannerShell}>
      <Paper style={{ width: '100%' }} p="xl" pb={8} withBorder>
        <Flex style={{ marginBottom: 30 }}>
          <Flex direction="column" flex={1}>
            <Title>
              <Flex justify='center' gap={10}>
                {t('Settings')/* Settings */}
              </Flex>
            </Title>

            <div className={classes.settingsGrid}>
              <Flex direction="column" gap={HEADER_LABEL_GAP}>
                <HeaderText>{t('Jades')/* Jades */}</HeaderText>
                <NumberInput
                  placeholder='0' min={0} style={{ width: '100%' }} hideControls
                  leftSection={<Flex align='center' justify='center' w='100%' h='60%' pl={2} style={{ borderRight: '1px solid #444' }}><img src={Assets.getJade()} style={{ height: 24 }}/></Flex>}
                  leftSectionWidth={34} leftSectionPointerEvents='none'
                  styles={{ input: { paddingLeft: 42 } }}
                  {...form.getInputProps('jades')}
                />
              </Flex>

              <Flex direction="column" gap={HEADER_LABEL_GAP} className={classes.settingsStrategy}>
                <HeaderText>{t('DefaultStrategy')/* Default Strategy */}</HeaderText>
                <Select
                  data={generateStrategyOptions()}
                  value={String(form.getValues().strategy)}
                  styles={{ input: { height: 30, minHeight: 30 } }}
                  onChange={(val) => { if (val != null) form.setFieldValue('strategy', Number(val) as WarpStrategy) }}
                />
              </Flex>

              <Flex direction="column" gap={HEADER_LABEL_GAP}>
                <HeaderText>{t('Passes')/* Passes */}</HeaderText>
                <NumberInput
                  placeholder='0' min={0} style={{ width: '100%' }} hideControls
                  leftSection={<Flex align='center' justify='center' w='100%' h='60%' pl={2} style={{ borderRight: '1px solid #444' }}><img src={Assets.getPass()} style={{ height: 24 }}/></Flex>}
                  leftSectionWidth={34} leftSectionPointerEvents='none'
                  styles={{ input: { paddingLeft: 42 } }}
                  {...form.getInputProps('passes')}
                />
              </Flex>

              <Flex direction="column" gap={HEADER_LABEL_GAP}>
                <HeaderText>{t('Starlight')/* Starlight */}</HeaderText>
                <Select
                  leftSection={<Flex align='center' justify='center' w='100%' h='60%' pl={2} style={{ borderRight: '1px solid #444' }}><img src={Assets.getStarlight()} style={{ height: 24 }}/></Flex>}
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
                    <Flex align='center' gap={4}><span>{option.label}</span><img src={Assets.getPass()} style={{ height: 16 }}/></Flex>
                  )}
                />
              </Flex>
            </div>
          </Flex>

          <VerticalDivider width={30}/>

          <Flex direction="column" flex={1} justify='space-between'>
            <Flex direction="column">
              <Title>{t('Character')/* Character */}</Title>
              <PityInputs banner='Character' form={form}/>
            </Flex>

            <Flex direction="column">
              <Title>{t('LightCone')/* Light Cone */}</Title>
              <PityInputs banner='LightCone' form={form}/>
            </Flex>
          </Flex>
        </Flex>

        <WarpSummary enriched={warpResult.request}/>

        <WarpUnifiedTable form={form} targetResults={warpResult.targetResults} request={warpResult.request}/>
      </Paper>
    </div>
  )
}

function Title(props: { children: ReactNode }) {
  return (
    <MantineTitle order={5} style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>
      {props.children}
    </MantineTitle>
  )
}

function WarpSummary(props: { enriched: EnrichedWarpRequest }) {
  const { enriched } = props

  return (
    <Divider
      mt={40} mb={0}
      label={
        <Flex align='center' gap={4} style={{ fontSize: 16 }}>
          {localeNumberComma(enriched.totalJade)}
          <img style={{ height: 16 }} src={Assets.getJade()}/>
          <span>+</span>
          {localeNumberComma(enriched.passes)}
          <img style={{ height: 16 }} src={Assets.getPass()}/>
          {enriched.additionalPasses > 0 && (
            <>
              <span>+</span>
              {localeNumberComma(enriched.additionalPasses)}
              <img style={{ height: 16 }} src={Assets.getPass()}/>
            </>
          )}
          <span>+</span>
          {localeNumberComma(enriched.totalStarlight)}
          <img style={{ height: 16 }} src={Assets.getStarlight()}/>
          <span>=</span>
          {localeNumberComma(enriched.warps)}
          <img style={{ height: 16 }} src={Assets.getPass()}/>
        </Flex>
      }
      labelPosition='center'
    />
  )
}

function PityInputs(props: { banner: string, form: UseFormReturnType<WarpRequest> }) {
  const { t } = useTranslation(['warpCalculatorTab', 'common'])
  const { form } = props

  const pityField = `pity${props.banner}` as keyof WarpRequest
  const guaranteedField = `guaranteed${props.banner}` as keyof WarpRequest

  return (
    <Flex gap={20} w='100%'>
      <Flex direction="column" flex={1} gap={HEADER_LABEL_GAP}>
        <HeaderText>{t('PityCounter.PityCounter')/* Pity counter */}</HeaderText>

        <NumberInput
          placeholder='0' min={0} max={props.banner === 'Character' ? 89 : 79}
          style={{ width: '100%' }}
          hideControls
          {...form.getInputProps(pityField)}
        />
      </Flex>
      <Flex direction="column" flex={1} gap={HEADER_LABEL_GAP}>
        <HeaderText>{t('PityCounter.Guaranteed')/* Guaranteed */}</HeaderText>
        <SegmentedControl
          fullWidth
          data={[
            { label: <IconCheck size={18}/>, value: 'true' },
            { label: <IconX size={18}/>, value: 'false' },
          ]}
          value={String(form.getValues()[guaranteedField] ?? false)}
          onChange={(val) => form.setFieldValue(guaranteedField, (val === 'true') as never)}
        />
      </Flex>
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

function generateStrategyOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'StrategyLabels')
  return [
    { value: String(WarpStrategy.S1), label: t('S1')/* 'S1 first' */ },
    { value: String(WarpStrategy.E0), label: t('E0')/* 'E0 first' */ },
    { value: String(WarpStrategy.E1), label: t('E1')/* 'E1 first' */ },
    { value: String(WarpStrategy.E2), label: t('E2')/* 'E2 first' */ },
    { value: String(WarpStrategy.E3), label: t('E3')/* 'E3 first' */ },
    { value: String(WarpStrategy.E4), label: t('E4')/* 'E4 first' */ },
    { value: String(WarpStrategy.E5), label: t('E5')/* 'E5 first' */ },
    { value: String(WarpStrategy.E6), label: t('E6')/* 'E6 first' */ },
  ]
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
