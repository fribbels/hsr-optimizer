import { CheckOutlined, CloseOutlined, ThunderboltFilled } from '@ant-design/icons'
import { Button, Card, Flex, Form as AntDForm, Form, Input, InputNumber, Radio, Select, SelectProps, Space, Table, TableProps, Tag, TreeSelect, Typography } from 'antd'
import chroma from 'chroma-js'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import { BannerRotation, DEFAULT_WARP_REQUEST, EidolonLevel, handleWarpRequest, StarlightMultiplier, StarlightRefund, SuperimpositionLevel, WarpIncomeDefinition, WarpIncomeOptions, WarpIncomeType, WarpMilestoneResult, WarpRequest, WarpStrategy } from 'lib/tabs/tabWarp/warpCalculatorController'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber, localeNumber_0, localeNumberComma } from 'lib/utils/i18nUtils'
import { Utils } from 'lib/utils/utils'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { scannerChannel, useScannerState } from '../tabImport/ScannerWebsocketClient'

const { Text } = Typography

export default function WarpCalculatorTab(): React.JSX.Element {
  const { t } = useTranslation('warpCalculatorTab')

  return (
    <Flex vertical style={{ height: 1400, width: 950 }} align='center'>
      <ColorizedTitleWithInfo
        text={t('SectionTitles.Planner')/* Warp Planner */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/warp-planner.md'
      />

      <Inputs/>

      <Results/>
    </Flex>
  )
}

export function sanitizeWarpRequest(warpRequest: WarpRequest) {
  if (!warpRequest) return { ...DEFAULT_WARP_REQUEST }

  if (!Array.isArray(warpRequest.income)
    || !warpRequest.income.every((incomeId) => WarpIncomeOptions.find((option) => option.id === incomeId))) {
    warpRequest.income = []
  }

  return Object.assign({}, DEFAULT_WARP_REQUEST, warpRequest)
}

function Inputs() {
  const { t } = useTranslation('warpCalculatorTab', { keyPrefix: 'SectionTitles' })
  const storedWarpRequest = useWarpCalculatorStore((s) => s.request)
  const [form] = Form.useForm<WarpRequest>()

  const warpRequest = sanitizeWarpRequest(storedWarpRequest)

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

        if (gachaResult.banner_type == "Character") {
          if (pityUpdate.kind == "ResetPity") {
            form.setFieldValue("pityCharacter", pityUpdate.amount)
            form.setFieldValue("guaranteedCharacter", pityUpdate.set_guarantee)
          } else if (pityUpdate.kind == "AddPity") {
            const currentPity = form.getFieldValue("pityCharacter")
            form.setFieldValue("pityCharacter", currentPity + gachaResult.pity_5.amount)
          }

        } else if (gachaResult.banner_type == "LightCone") {
          if (pityUpdate.kind == "ResetPity") {
            form.setFieldValue("pityLightCone", pityUpdate.amount)
            form.setFieldValue("guaranteedLightCone", pityUpdate.set_guarantee)
          } else if (pityUpdate.kind == "AddPity") {
            const currentPity = form.getFieldValue("pityLightCone")
            form.setFieldValue("pityLightCone", currentPity + gachaResult.pity_5.amount)
          }
        }
    }
  }, [form])

  return (
    <Form
      form={form}
      initialValues={warpRequest}
      style={{
        width: 900,
      }}
    >
      <Card style={{ width: 900 }}>
        <Flex style={{ marginBottom: 30 }}>
          <Flex vertical style={{ flex: 1 }}>
            <Title>
              <Flex justify='center' gap={10}>
                {t('Settings')/* Settings */}
              </Flex>
            </Title>

            <Flex vertical gap={16}>
              <Flex gap={25} justify='space-between'>
                <Flex align='flex-end' gap={8} flex={1}>
                  <Flex vertical>
                    <HeaderText>{t('Jades')/* Jades */}</HeaderText>
                    <Form.Item name='jades'>
                      <InputNumber
                        placeholder='0'
                        min={0}
                        style={{ width: '100%' }}
                        controls={false}
                        addonBefore={<img src={Assets.getJade()} style={{ height: 24 }}/>}
                      />
                    </Form.Item>
                  </Flex>
                </Flex>

                <Flex vertical flex={1}>
                  <HeaderText>{t('Banner')/* Banner */}</HeaderText>
                  <Form.Item name='bannerRotation'>
                    <Radio.Group buttonStyle='solid' block>
                      <Radio.Button value={BannerRotation.NEW}>{t('New')}</Radio.Button>
                      <Radio.Button value={BannerRotation.RERUN}>{t('Rerun')}</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Flex>
              </Flex>

              <Flex gap={25}>
                <Flex align='flex-end' gap={8} flex={1}>
                  <Flex vertical>
                    <HeaderText>{t('Passes')/* Passes */}</HeaderText>
                    <Form.Item name='passes'>
                      <InputNumber
                        placeholder='0'
                        min={0}
                        style={{ width: '100%' }}
                        controls={false}
                        addonBefore={<img src={Assets.getPass()} style={{ height: 24 }}/>}
                      />
                    </Form.Item>
                  </Flex>
                </Flex>

                <Flex vertical flex={1}>
                  <HeaderText>{t('Strategy')/* Strategy */}</HeaderText>
                  <Form.Item name='strategy'>
                    <Select
                      options={generateStrategyOptions()}
                    />
                  </Form.Item>
                </Flex>
              </Flex>

              <Flex gap={25}>
                <Flex vertical style={{ width: 0, flex: 1, overflow: 'hidden' }}>
                  <HeaderText>{t('Starlight')/* Starlight */}</HeaderText>

                  <Space.Compact style={{ display: 'flex' }}>
                    <Input
                      disabled
                      style={{
                        width: 36,
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        cursor: 'auto',
                        backgroundImage: `url(${Assets.getStarlight()})`,
                        backgroundSize: '24px',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                    <Form.Item noStyle name='starlight'>
                      <Select
                        style={{ flex: 1 }}
                        options={generateStarlightOptions()}
                        popupMatchSelectWidth={false}
                        optionLabelProp='labelInValue'
                      />
                    </Form.Item>
                  </Space.Compact>
                </Flex>

                <Flex vertical style={{ width: 0, flex: 1, overflow: 'hidden' }}>
                  <HeaderText>{t('AdditionalResources')/* Additional resources */}</HeaderText>
                  <Form.Item name='income'>
                    <TreeSelect
                      multiple
                      showCheckedStrategy={TreeSelect.SHOW_CHILD}
                      maxTagCount={0}
                      listHeight={500}
                      showSearch={false}
                      treeCheckable={false}
                      treeExpandAction='click'
                      placeholder='None'
                      treeDefaultExpandedKeys={extractEnabledIncomeTypes(warpRequest)}
                      allowClear
                      treeData={generateIncomeOptions()}
                      popupMatchSelectWidth={500}
                    />
                  </Form.Item>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <VerticalDivider width={40}/>

          <Flex vertical style={{ flex: 1 }} justify='space-between'>
            <Flex vertical>
              <Title>{t('Character')/* Character */}</Title>
              <PityInputs banner='Character'/>
            </Flex>

            <Flex vertical>
              <Title>{t('LightCone')/* Light Cone */}</Title>
              <PityInputs banner='LightCone'/>
            </Flex>
          </Flex>
        </Flex>

        <Flex style={{ width: '100%' }} gap={20}>
          <Button
            type='primary'
            block
            style={{ height: 45 }}
            onClick={() => {
              useWarpCalculatorStore.getState().setResult(null)
              setTimeout(() => handleWarpRequest(form.getFieldsValue()), 50)
            }}
            icon={<ThunderboltFilled/>}
          >
            {t('Calculate')/* Calculate */}
          </Button>
        </Flex>
      </Card>
    </Form>
  )
}

// When users have a saved warp income type, we should expand the parent by default so it doesn't get lost
function extractEnabledIncomeTypes(warpRequest: WarpRequest) {
  return (warpRequest.income ?? []).map((incomeOption) => parseInt(incomeOption.substring(incomeOption.length - 1)))
}

function Title(props: { children: React.ReactNode }) {
  return (
    <Typography.Title level={5} style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>
      {props.children}
    </Typography.Title>
  )
}

function Results() {
  const { t, i18n } = useTranslation('warpCalculatorTab')
  const warpResult = useWarpCalculatorStore((s) => s.result)

  if (!warpResult?.request) {
    return <></>
  }

  const warpTableData: WarpTableData[] = Object.entries(warpResult.milestoneResults ?? {})
    .map(([label, result]) => ({ key: label, warps: result.warps, wins: result.wins }))

  console.log(warpResult)

  const columns: TableProps<WarpMilestoneResult>['columns'] = [
    {
      title: t('ColumnTitles.Goal'),
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      width: 200,
      render: (key: string, record: WarpMilestoneResult) => (
        <Flex style={{ position: 'relative', marginLeft: 5, height: '100%' }} align='center'>
          <div
            style={{
              display: record.wins < chanceThreshold ? 'none' : 'block',
              width: `${record.wins * 100}%`,
              borderRadius: 4,
              position: 'absolute',
              height: '100%',
              backgroundColor: chroma.scale(['#df524bcc', '#efe959cc', '#89d86dcc']).domain([0, 0.33, 1])(record.wins).hex(),
              zIndex: 1,
            }}
          />

          <Flex style={{ width: '100%', zIndex: 2 }} justify='center' align='center'>
            <Tag color='#000000aa' style={{ opacity: opacity(record.wins), border: 0, padding: '2px 12px 2px 12px' }}>
              <Text style={{ margin: 0, alignItems: 'center' }}>
                {translateLabel(key)}
              </Text>
            </Tag>
          </Flex>
        </Flex>
      ),
    },
    {
      title: (
        <Flex justify='center' align='center' gap={5}>
          <Trans
            t={t}
            i18nKey='ColumnTitles.Chance'
            values={{ ticketCount: warpResult.request.warps.toLocaleString(i18n.resolvedLanguage!.split('_')[0]) }}
          >
            Success chance with [[ticketCount]]
            <img style={{ height: 18 }} src={Assets.getPass()}/>
          </Trans>
        </Flex>
      ),
      dataIndex: 'wins',
      width: 250,
      align: 'center',
      render: (n: number) => `${Utils.truncate10ths(n * 100).toLocaleString(i18n.resolvedLanguage!.split('_')[0], {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}%`,
    },
    {
      // title: 'Average # of warps required',
      title: (
        <Flex justify='center' align='center' gap={5}>
          <Trans t={t} i18nKey='ColumnTitles.Average'>
            Average # of
            <img style={{ height: 18 }} src={Assets.getPass()}/>
            required
          </Trans>
        </Flex>
      ),
      dataIndex: 'warps',
      align: 'center',
      width: 250,
      render: (n: number, record: WarpMilestoneResult) => (
        <Flex align='center' justify='center' gap={4}>
          <>
            {`${Math.ceil(n)}`}
            <img style={{ height: 16, opacity: opacity(record.wins) }} src={Assets.getPass()}/>
          </>
        </Flex>
      ),
    },
  ]

  return (
    <Flex vertical gap={20} style={{}} align='center'>
      <Flex justify='space-around' style={{ marginTop: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          {t('SectionTitles.Results')/* Results */}
        </pre>
      </Flex>

      <Text style={{ fontSize: 18 }}>
        <pre style={{ margin: 0 }}>
          <Flex align='center' gap={5}>
            <span>{t('TotalAvailable')/* Total warps available: */}</span>

            {`( ${localeNumberComma(warpResult.request.totalJade ?? 0)}`}
            <img style={{ height: 24 }} src={Assets.getJade()}/>
            <span>) + (</span>
            {localeNumberComma(warpResult.request.totalPasses ?? 0)}
            <img style={{ height: 24 }} src={Assets.getPass()}/>
            <span>) + (</span>
            {localeNumberComma(warpResult.request.totalStarlight ?? 0)}
            <img style={{ height: 24 }} src={Assets.getStarlight()}/>
            <span>) </span>
            <span>= </span>
            {localeNumberComma(warpResult.request.warps ?? 0)}
            <img style={{ height: 24 }} src={Assets.getPass()}/>
          </Flex>
        </pre>
      </Text>

      <Flex vertical gap={10} style={{ width: '100%' }}>
        <Table<WarpMilestoneResult>
          style={{ width: '100%' }}
          columns={columns}
          dataSource={warpTableData}
          pagination={false}
          rowClassName={(record) => `
            warp-table-row
            ${record.wins < chanceThreshold ? 'warp-table-row-disabled' : ''}
          `}
        />
      </Flex>
    </Flex>
  )
}

const chanceThreshold = 0.001

type WarpTableData = {
  key: string
} & WarpMilestoneResult

function opacity(n: number) {
  return n < chanceThreshold ? 0.10 : 1.0
}

function PityInputs(props: { banner: string }) {
  const { t } = useTranslation(['warpCalculatorTab', 'common'])
  const bannerRotation: BannerRotation = AntDForm.useWatch(['bannerRotation'])

  return (
    <Flex gap={25} style={{ width: '100%' }}>
      <Flex vertical flex={1}>
        <HeaderText>{t('PityCounter.PityCounter')/* Pity counter */}</HeaderText>

        <Form.Item name={`pity${props.banner}`}>
          <InputNumber
            placeholder='0' min={0} max={props.banner == 'Character' ? 89 : 79}
            style={{ width: '100%' }}
            controls={false}
          />
        </Form.Item>
      </Flex>
      <Flex vertical flex={1} style={{ display: bannerRotation == BannerRotation.RERUN ? 'flex' : 'none' }}>
        <HeaderText>{t('PityCounter.CurrentEidolonSuperImp')/* Current */}</HeaderText>

        <Form.Item name={props.banner === 'Character' ? 'currentEidolonLevel' : 'currentSuperimpositionLevel'}>
          <Select
            options={props.banner == 'Character'
              ? generateEidolonLevelOptions()
              : generateSuperimpositionLevelOptions()}
          />
        </Form.Item>
      </Flex>
      <Flex vertical flex={1}>
        <HeaderText>{t('PityCounter.Guaranteed')/* Guaranteed */}</HeaderText>
        <Form.Item name={`guaranteed${props.banner}`}>
          <Radio.Group
            block
            optionType='button'
            buttonStyle='solid'
          >
            <Radio.Button value={true}><CheckOutlined/></Radio.Button>
            <Radio.Button value={false}><CloseOutlined/></Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Flex>
    </Flex>
  )
}

function generateIncomeOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'IncomeOptions')
  const locale = i18next.resolvedLanguage?.split('_')[0]
  const types = [WarpIncomeType.F2P, WarpIncomeType.EXPRESS, WarpIncomeType.BP_EXPRESS]

  const options = types.map((type) => ({
    title: t(`Type.${type}`),
    value: type,
    selectable: false,
    children: WarpIncomeOptions
      .filter((option) => option.type === type)
      .flatMap((option) => {
        const results = [{
          value: option.id,
          title: option.type == WarpIncomeType.NONE
            ? t('Type.0')
            : (
              <Flex align='center' gap={3}>
                <IncomeOptionLabel option={option}/>
                {`+${option.passes.toLocaleString(locale)}`}
                <img style={{ height: 18 }} src={Assets.getPass()}/>
              </Flex>
            ),
        }]

        if (option.phase == 2) {
          results.push({
            title: <></>,
            value: option.id + 'divider',
            // @ts-ignore
            className: 'tree-select-divider',
            // @ts-ignore
            disabled: true,
          })
        }

        return results
      }).slice(0, -1),
  }))

  return options
}

function IncomeOptionLabel(props: { option: WarpIncomeDefinition }) {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'IncomeOptions')
  return (
    <div style={{ marginRight: 2 }}>
      {
        t('Label',
          {
            versionNumber: props.option.version,
            phaseNumber: props.option.phase,
            type: t(`Type.${props.option.type}`),
          },
        )
        /* `[v${props.option.version} ${props.option.type}]: ` */
      }
    </div>
  )
}

function generateStrategyOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'StrategyLabels')
  const options: SelectProps['options'] = [
    { value: WarpStrategy.S1, label: t('S1')/* 'S1 first' */ },
    { value: WarpStrategy.E0, label: t('E0')/* 'E0 first' */ },
    { value: WarpStrategy.E1, label: t('E1')/* 'E1 first' */ },
    { value: WarpStrategy.E2, label: t('E2')/* 'E2 first' */ },
    { value: WarpStrategy.E3, label: t('E3')/* 'E3 first' */ },
    { value: WarpStrategy.E4, label: t('E4')/* 'E4 first' */ },
    { value: WarpStrategy.E5, label: t('E5')/* 'E5 first' */ },
    { value: WarpStrategy.E6, label: t('E6')/* 'E6 first' */ },
  ]

  return options
}

function generateStarlightOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'RefundLabels')
  return Object.values(StarlightRefund).map((refund) => ({
    value: refund,
    label: t(`${refund}_FULL`, { Percentage: refundLabel(refund, refund === StarlightRefund.REFUND_AVG) }),
    labelInValue: t(refund, { Percentage: refundLabel(refund, refund === StarlightRefund.REFUND_AVG) }),
  }))
}

function refundLabel(starlight: StarlightRefund, showDecimal: boolean = false) {
  const value = StarlightMultiplier[starlight] * 100
  return showDecimal ? localeNumber_0(value) : localeNumber(value)
}

function generateEidolonLevelOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'EidolonLevels')
  const options: SelectProps['options'] = [
    { value: EidolonLevel.NONE, label: t('NONE') },
    { value: EidolonLevel.E0, label: t('E0') },
    { value: EidolonLevel.E1, label: t('E1') },
    { value: EidolonLevel.E2, label: t('E2') },
    { value: EidolonLevel.E3, label: t('E3') },
    { value: EidolonLevel.E4, label: t('E4') },
    { value: EidolonLevel.E5, label: t('E5') },
    { value: EidolonLevel.E6, label: t('E6') },
  ]

  return options
}

function generateSuperimpositionLevelOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'SuperimpositionLevels')
  const options: SelectProps['options'] = [
    { value: SuperimpositionLevel.NONE, label: t('NONE') },
    { value: SuperimpositionLevel.S1, label: t('S1') },
    { value: SuperimpositionLevel.S2, label: t('S2') },
    { value: SuperimpositionLevel.S3, label: t('S3') },
    { value: SuperimpositionLevel.S4, label: t('S4') },
    { value: SuperimpositionLevel.S5, label: t('S5') },
  ]

  return options
}

function translateLabel(label: string) {
  const t = i18next.getFixedT(null, ['warpCalculatorTab', 'common'])
  if (label == 'S1') return t('common:SuperimpositionNShort', { superimposition: 1 })
  return t('warpCalculatorTab:TargetLabel', { superimposition: label.charAt(3), eidolon: label.charAt(1) })
}
