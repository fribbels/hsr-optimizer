import { CaretRightOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Flex,
  Form,
  Image,
  Input,
  InputNumber,
  InputRef,
  Modal,
  Radio,
  Select,
  theme,
  Tooltip,
} from 'antd'
import { FormInstance } from 'antd/es/form/hooks/useForm'
import i18next from 'i18next'
import {
  Constants,
  MainStats,
  Parts,
  setToId,
  Stats,
  SubStats,
  UnreleasedSets,
} from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { SettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import {
  calculateUpgradeValues,
  RelicForm,
  RelicUpgradeValues,
  validateRelic,
} from 'lib/overlays/modals/relicModalController'
import { Assets } from 'lib/rendering/assets'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import {
  lockScroll,
  unlockScroll,
} from 'lib/rendering/scrollController'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { RelicLocator } from 'lib/tabs/tabRelics/RelicLocator'
import { HeaderText } from 'lib/ui/HeaderText'
import {
  localeNumber,
  localeNumber_0,
} from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyObject } from 'types/common'
import { Relic } from 'types/relic'

// FIXME MED

const { useToken } = theme

function RadioIcon(props: { value: string, src: string }) {
  return (
    <Radio.Button value={props.value} style={{ height: 35, width: 50, paddingLeft: 10 }}>
      <Image
        preview={false}
        width={30}
        src={props.src}
      />
    </Radio.Button>
  )
}

function renderMainStat(relic: Relic): { stat: MainStats, value: number } | EmptyObject {
  const mainStat = relic.main?.stat
  const mainValue = relic.main?.value

  if (!mainStat) return {}

  return renderStat(mainStat, mainValue)
}

function renderSubstat(relic: Relic, index: number) {
  const substat = relic.substats[index]
  if (!substat?.stat) return {} as EmptyObject

  const stat = substat.stat
  const value = substat.value

  return renderStat(stat, value, relic) as { stat: SubStats, value: number }
}

function renderStat<S extends SubStats | MainStats>(stat: S, value: number, relic?: Relic): { stat: S, value: number } {
  if (stat == Stats.SPD) {
    if (relic?.verified) {
      return {
        stat: stat,
        value: Utils.truncate10ths(value),
      }
    } else {
      return {
        stat: stat,
        value: value % 1 !== 0 ? Utils.truncate10ths(value.toFixed(1)) : Math.floor(value),
      }
    }
  } else if (Utils.isFlat(stat)) {
    return {
      stat: stat,
      value: Math.floor(value),
    }
  } else {
    return {
      stat: stat,
      value: Utils.truncate10ths(Utils.precisionRound(Math.floor(value * 10) / 10)),
    }
  }
}

type MainStatOption = {
  label: ReactElement | string,
  value: string,
}

// selectedRelic, onOk, setOpen, open, type
export default function RelicModal(props: {
  selectedRelic?: Relic,
  type: string,
  onOk: (relic: Relic) => void,
  setOpen: (open: boolean) => void,
  open: boolean,
}) {
  const { t } = useTranslation(['modals', 'common', 'gameData'])
  const { token } = useToken()
  const [relicForm] = Form.useForm<RelicForm>()
  const [mainStatOptions, setMainStatOptions] = useState<MainStatOption[]>([])
  const characters = useCharacterTabStore((s) => s.characters)
  const showLocator = window.store((s) => s.settings.ShowLocatorInRelicsModal)

  const isLiveImport = useScannerState((s) => s.ingest)

  useEffect(() => {
    if (props.open) {
      lockScroll()
    } else {
      unlockScroll()
    }
  }, [props.open])

  const characterOptions = useMemo(() => generateCharacterList({ currentCharacters: characters, longNameLabel: true }), [characters, i18next.resolvedLanguage])

  const relicOptions = useMemo(() => {
    const setOptions: {
      label: ReactElement,
      value: string,
    }[] = []
    for (const entry of Object.entries(Constants.SetsRelics).filter((x) => !UnreleasedSets[x[1]])) {
      setOptions.push({
        label: (
          <Flex align='center' gap={10}>
            <img style={{ height: 22, width: 22 }} src={Assets.getSetImage(entry[1])} />
            {t(`gameData:RelicSets.${setToId[entry[1]]}.Name`)}
          </Flex>
        ),
        value: entry[1],
      })
    }
    return setOptions
  }, [t])

  const planarOptions = useMemo(() => {
    const setOptions: {
      label: ReactElement,
      value: string,
    }[] = []
    for (const entry of Object.entries(Constants.SetsOrnaments).filter((x) => !UnreleasedSets[x[1]])) {
      setOptions.push({
        label: (
          <Flex align='center' gap={10}>
            <img style={{ height: 22, width: 22 }} src={Assets.getSetImage(entry[1])} />
            {t(`gameData:RelicSets.${setToId[entry[1]]}.Name`)}
          </Flex>
        ),
        value: entry[1],
      })
    }
    return setOptions
  }, [t])

  const part = Form.useWatch('part', relicForm)

  function getSetOptions(part: Parts) {
    if (!part) return relicOptions.concat(planarOptions)
    if (part === Parts.LinkRope || part === Parts.PlanarSphere) return planarOptions
    return relicOptions
  }

  const setOptions = getSetOptions(part)

  const equippedBy: string = Form.useWatch('equippedBy', relicForm)
  const [upgradeValues, setUpgradeValues] = useState<RelicUpgradeValues[]>([])

  useEffect(() => {
    let defaultValues = {
      grade: 5,
      enhance: 15,
      part: Constants.Parts.Head,
      mainStatType: Constants.Stats.HP,
      mainStatValue: Math.floor(Constants.MainStatsValues[Constants.Stats.HP][5].base + Constants.MainStatsValues[Constants.Stats.HP][5].increment * 15),
    } as RelicForm

    const relic = props.selectedRelic
    if (!relic || props.type != 'edit') {
      // Ignore
    } else {
      defaultValues = {
        equippedBy: relic.equippedBy ?? 'None',
        grade: relic.grade,
        enhance: relic.enhance,
        set: relic.set,
        part: relic.part,
        mainStatType: renderMainStat(relic).stat,
        mainStatValue: renderMainStat(relic).value,
        substatType0: renderSubstat(relic, 0).stat,
        substatValue0: renderSubstat(relic, 0).value?.toString(),
        substatType1: renderSubstat(relic, 1).stat,
        substatValue1: renderSubstat(relic, 1).value?.toString(),
        substatType2: renderSubstat(relic, 2).stat,
        substatValue2: renderSubstat(relic, 2).value?.toString(),
        substatType3: renderSubstat(relic, 3).stat,
        substatValue3: renderSubstat(relic, 3).value?.toString(),
      }
    }
    onValuesChange(defaultValues)
    relicForm.setFieldsValue(defaultValues)
  }, [props.selectedRelic, props.open, relicForm, props])

  useEffect(() => {
    let mainStatOptions: MainStatOption[] = []
    if (props.selectedRelic?.part) {
      mainStatOptions = Object.entries(Constants.PartsMainStats[props.selectedRelic?.part]).map((entry) => ({
        label: (
          <Flex align='center' gap={10}>
            <img src={Assets.getStatIcon(entry[1], true)} style={{ width: 22, height: 22 }} />
            {t(`common:Stats.${entry[1]}`)}
          </Flex>
        ),
        value: entry[1],
      }))
    }

    setMainStatOptions(mainStatOptions)
    relicForm.setFieldValue('mainStatType', props.selectedRelic?.main?.stat)
  }, [props.selectedRelic?.part, props.selectedRelic?.main?.stat, relicForm, t])

  useEffect(() => {
    if (mainStatOptions.length > 0) {
      const mainStatValues = mainStatOptions.map((item) => item.value)
      // @ts-ignore
      if (mainStatValues.includes(props.selectedRelic?.main?.stat)) {
        relicForm.setFieldValue('mainStatType', props.selectedRelic?.main?.stat)
      } else {
        relicForm.setFieldValue('mainStatType', mainStatOptions[0].value)
      }
    }

    // We hook into the main stat change to update substats, not ideal but it works
    resetUpgradeValues()
  }, [relicForm, mainStatOptions, props.selectedRelic?.main?.stat])

  const onFinish = (relicForm: RelicForm) => {
    const relic = validateRelic(relicForm)
    if (!relic) return
    if (relicsAreDifferent(props.selectedRelic, relic)) {
      relic.verified = false
    }

    console.log(t('Relic.Messages.EditSuccess'), /* Successfully edited relic */ relic)

    props.onOk(relic)
    props.setOpen(false)
  }
  const onFinishFailed = () => {
    Message.error(t('Relic.Messages.SubmitFail') /* Submit failed! */)
    props.setOpen(false)
  }
  const onValuesChange = (formValues: RelicForm) => {
    let mainStatOptions: MainStatOption[] = []
    if (formValues.part) {
      const part = formValues.part
      mainStatOptions = Object.entries(Constants.PartsMainStats[part]).map((entry) => ({
        label: (
          <Flex align='center' gap={10}>
            <img src={Assets.getStatIcon(entry[1], true)} style={{ width: 22, height: 22 }} />
            {t(`common:Stats.${entry[1]}`)}
          </Flex>
        ),
        value: entry[1],
      }))
      setMainStatOptions(mainStatOptions)
      relicForm.setFieldValue('mainStatType', mainStatOptions[0]?.value)

      const defaultSet = getSetOptions(part)[0].value
      if (part === Parts.PlanarSphere || part === Parts.LinkRope) {
        // @ts-ignore
        if (!Object.values(Constants.SetsOrnaments).includes(formValues.set)) {
          relicForm.setFieldValue('set', defaultSet)
        }
        // @ts-ignore
      } else if (!Object.values(Constants.SetsRelics).includes(formValues.set)) {
        relicForm.setFieldValue('set', defaultSet)
      }
    }

    const mainStatType: string = mainStatOptions[0]?.value || relicForm.getFieldValue('mainStatType')
    const enhance: number = relicForm.getFieldValue('enhance')
    const grade: number = relicForm.getFieldValue('grade')

    if (mainStatType != undefined && enhance != undefined && grade != undefined) {
      const specialStats = [
        Stats.OHB,
        Stats.Physical_DMG,
        Stats.Physical_DMG,
        Stats.Fire_DMG,
        Stats.Ice_DMG,
        Stats.Lightning_DMG,
        Stats.Wind_DMG,
        Stats.Quantum_DMG,
        Stats.Imaginary_DMG,
      ]
      const floorStats = [Stats.HP, Stats.ATK]

      let mainStatValue = TsUtils.calculateRelicMainStatValue(mainStatType, grade, enhance)

      // @ts-ignore TS doesn't like mismatched types when using .includes
      if (specialStats.includes(mainStatType)) { // Outgoing Healing Boost and elemental damage bonuses has a weird rounding with one decimal place
        mainStatValue = Utils.truncate10ths(mainStatValue)
        // @ts-ignore TS doesn't like mismatched types when using .includes
      } else if (floorStats.includes(mainStatType)) {
        mainStatValue = Math.floor(mainStatValue)
      } else {
        mainStatValue = Utils.truncate10ths(mainStatValue)
      }
      relicForm.setFieldValue('mainStatValue', mainStatValue)
    }
  }

  function resetUpgradeValues() {
    const statUpgrades = calculateUpgradeValues(relicForm.getFieldsValue())
    setUpgradeValues(statUpgrades)
  }

  const handleCancel = () => {
    props.setOpen(false)
  }
  const handleOk = () => {
    relicForm.submit()
  }

  const plusThree = () => {
    // Upgrade to nearest 3
    relicForm.setFieldValue('enhance', Math.floor(Math.min(relicForm.getFieldValue('enhance') as number + 3, 15) / 3) * 3)
  }

  const enhanceOptions: {
    value: number,
    label: string,
  }[] = useMemo(() => {
    const ret: {
      value: number,
      label: string,
    }[] = []
    for (let i = 15; i >= 0; i--) {
      ret.push({ value: i, label: '+' + i })
    }
    return ret
  }, [])

  return (
    <Form
      form={relicForm}
      layout='vertical'
      preserve={false}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      onValuesChange={onValuesChange}
    >
      <Modal
        width={560}
        centered
        destroyOnClose
        closable={!isLiveImport} // Hide X button in live import mode as it overlaps with the alert
        open={props.open} //
        onCancel={() => props.setOpen(false)}
        footer={
          <Flex key='footer' justify={showLocator === SettingOptions.ShowLocatorInRelicsModal.Yes ? 'space-between' : 'flex-end'}>
            <Flex style={{ width: 298, paddingLeft: 1 }}>
              {props.selectedRelic && showLocator === SettingOptions.ShowLocatorInRelicsModal.Yes && <RelicLocator relic={props.selectedRelic} />}
            </Flex>

            <Flex gap={10} style={{ width: 180 }}>
              <Button onClick={handleCancel} style={{ flex: 1 }}>
                {t('common:Cancel')}
              </Button>
              <Button type='primary' onClick={handleOk} style={{ flex: 1 }}>
                {t('common:Submit')}
              </Button>
            </Flex>
          </Flex>
        }
      >
        <Flex vertical gap={5}>

          {isLiveImport && <Alert message={t('Relic.LiveImportWarning') /* Live import mode is enabled, your changes might be overwritten. */} type='warning' showIcon/>}
          <Flex gap={10}>
            <Flex vertical gap={5}>
              <HeaderText>{t('Relic.Part') /* Part */}</HeaderText>

              <Form.Item name='part'>
                <Radio.Group buttonStyle='solid'>
                  <RadioIcon value={Constants.Parts.Head} src={Assets.getPart(Constants.Parts.Head)} />
                  <RadioIcon value={Constants.Parts.Hands} src={Assets.getPart(Constants.Parts.Hands)} />
                  <RadioIcon value={Constants.Parts.Body} src={Assets.getPart(Constants.Parts.Body)} />
                  <RadioIcon value={Constants.Parts.Feet} src={Assets.getPart(Constants.Parts.Feet)} />
                  <RadioIcon value={Constants.Parts.PlanarSphere} src={Assets.getPart(Constants.Parts.PlanarSphere)} />
                  <RadioIcon value={Constants.Parts.LinkRope} src={Assets.getPart(Constants.Parts.LinkRope)} />
                </Radio.Group>
              </Form.Item>

              <HeaderText>{t('Relic.Set') /* Set */}</HeaderText>
              <Form.Item name='set'>
                <Select
                  showSearch
                  allowClear
                  style={{
                    width: 300,
                  }}
                  listHeight={350}
                  placeholder={t('Relic.Set') /* Set */}
                  options={setOptions}
                  maxTagCount='responsive'
                >
                </Select>
              </Form.Item>

              <HeaderText>{t('Relic.Enhance') /* Enhance / Grade */}</HeaderText>

              <Flex gap={10}>
                <Form.Item name='enhance'>
                  <Select
                    showSearch
                    style={{ width: 115 }}
                    options={enhanceOptions}
                  />
                </Form.Item>

                <Button style={{ width: 50 }} onClick={plusThree}>
                  +3
                </Button>

                <Form.Item name='grade'>
                  <Select
                    showSearch
                    style={{ width: 115 }}
                    options={[
                      { value: 2, label: '2 ★' },
                      { value: 3, label: '3 ★' },
                      { value: 4, label: '4 ★' },
                      { value: 5, label: '5 ★' },
                    ]}
                    onChange={resetUpgradeValues}
                  />
                </Form.Item>
              </Flex>

              <HeaderText>{t('Relic.Mainstat') /* Main stat */}</HeaderText>

              <Flex gap={10}>
                <Form.Item name='mainStatType'>
                  <Select
                    showSearch
                    style={{
                      width: 210,
                    }}
                    maxTagCount='responsive'
                    options={mainStatOptions}
                    disabled={mainStatOptions.length <= 1}
                  />
                </Form.Item>

                <Form.Item name='mainStatValue'>
                  <InputNumber controls={false} disabled style={{ width: 80 }} />
                </Form.Item>
              </Flex>
            </Flex>

            <div style={{ display: 'block', minWidth: 12 }} />

            <Flex vertical gap={5} style={{}}>
              <HeaderText>{t('Relic.Wearer') /* Equipped by */}</HeaderText>
              <Form.Item name='equippedBy'>
                <Select
                  showSearch
                  filterOption={Utils.titleFilterOption}
                  style={{ height: 35 }}
                  options={characterOptions}
                  optionLabelProp='title'
                />
              </Form.Item>

              <div
                style={{
                  height: 180,
                  overflow: 'hidden',
                  marginTop: 7,
                  borderRadius: 10,
                  boxShadow: `0px 0px 0px 1px ${token.colorBorder} inset`,
                }}
              >
                <img
                  style={{ width: '100%' }}
                  src={Assets.getCharacterPreviewById(equippedBy == 'None' ? '' : equippedBy)}
                />
              </div>
            </Flex>
          </Flex>

          <Flex gap={20}>
            <Flex vertical gap={5} style={{ width: '100%' }}>
              <Flex justify='space-between'>
                <HeaderText>{t('Relic.Substat') /* Substats */}</HeaderText>
                <Flex style={{ width: 180 }}>
                  <HeaderText>{t('Relic.Upgrades') /* Substat upgrades */}</HeaderText>
                </Flex>
              </Flex>

              <SubstatInput
                index={0}
                upgrades={upgradeValues}
                relicForm={relicForm}
                resetUpgradeValues={resetUpgradeValues}
                plusThree={plusThree}
              />

              <SubstatInput
                index={1}
                upgrades={upgradeValues}
                relicForm={relicForm}
                resetUpgradeValues={resetUpgradeValues}
                plusThree={plusThree}
              />

              <SubstatInput
                index={2}
                upgrades={upgradeValues}
                relicForm={relicForm}
                resetUpgradeValues={resetUpgradeValues}
                plusThree={plusThree}
              />

              <SubstatInput
                index={3}
                upgrades={upgradeValues}
                relicForm={relicForm}
                resetUpgradeValues={resetUpgradeValues}
                plusThree={plusThree}
              />
            </Flex>
          </Flex>
        </Flex>
      </Modal>
    </Form>
  )
}

function SubstatInput(props: {
  index: 0 | 1 | 2 | 3,
  upgrades: RelicUpgradeValues[],
  relicForm: FormInstance<RelicForm>,
  resetUpgradeValues: () => void,
  plusThree: () => void,
}) {
  const inputRef = useRef<InputRef>(null)
  const [hovered, setHovered] = React.useState(false)
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  const statTypeField = `substatType${props.index}` as `substatType${typeof props.index}`
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  const statValueField = `substatValue${props.index}` as `substatValue${typeof props.index}`
  const { t } = useTranslation('modals', { keyPrefix: 'Relic' })

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select() // Select the entire text when focused
    }
  }

  function upgradeClicked(quality: 'low' | 'mid' | 'high') {
    console.log(props, quality)

    props.relicForm.setFieldValue(statValueField, props.upgrades[props.index][quality])
    props.resetUpgradeValues()
    props.plusThree()
  }

  const formatStat = (value?: string | number) => {
    const stat = props.relicForm.getFieldValue(`substatType${props.index}`)
    if (!value) return ''
    if (Utils.isFlat(stat) && stat !== Stats.SPD) return localeNumber(Number(value))
    return localeNumber_0(Number(value))
  }

  const substatOptionsMemoized = useMemo(() => {
    const output: {
      label: ReactElement,
      value: string,
    }[] = []
    for (const entry of Object.entries(Constants.SubStats)) {
      output.push({
        label: (() => {
          return (
            <Flex align='center' gap={10}>
              <img style={{ width: 22, height: 22 }} src={Assets.getStatIcon(entry[1], true)} />
              {i18next.t(`common:Stats.${entry[1]}`)}
            </Flex>
          )
        })(),
        value: entry[1],
      })
    }
    return output
  }, [i18next.resolvedLanguage])

  function UpgradeButton(subProps: {
    quality: 'low' | 'mid' | 'high',
  }) {
    const value = props.upgrades?.[props.index]?.[subProps.quality]

    const displayValue = formatStat(value)

    return (
      <Flex style={{ width: '100%' }}>
        <Button
          type={hovered ? 'default' : 'dashed'}
          style={{ width: '100%', padding: 0 }}
          onClick={() => upgradeClicked(subProps.quality)}
          disabled={value == undefined}
          tabIndex={-1}
        >
          {displayValue}
        </Button>
      </Flex>
    )
  }

  const stat = props.relicForm.getFieldValue(statTypeField) as RelicForm[typeof statTypeField]

  return (
    <Flex gap={10} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Flex gap={10}>
        <Form.Item name={statTypeField}>
          <Select
            showSearch
            allowClear
            style={{
              width: 210,
            }}
            placeholder={t('SubstatPlaceholder')}
            maxTagCount='responsive'
            options={substatOptionsMemoized}
            listHeight={750}
            onChange={() => {
              if (props.relicForm.getFieldValue(statTypeField)) {
                props.relicForm.setFieldValue(statValueField, 0)
              } else {
                props.relicForm.setFieldValue(statValueField, undefined)
              }
              props.resetUpgradeValues()
            }}
            tabIndex={0}
          />
        </Form.Item>

        <Tooltip
          trigger={['focus']}
          title={stat == Stats.SPD ? t('SpdInputWarning') : ''}
          placement='top'
        >
          <Form.Item name={`substatValue${props.index}`}>
            <Input
              ref={inputRef}
              onFocus={handleFocus}
              style={{ width: 80 }}
              onChange={props.resetUpgradeValues}
              tabIndex={0}
            />
          </Form.Item>
        </Tooltip>
      </Flex>
      <CaretRightOutlined style={{ width: 12 }} />
      <Flex gap={5} style={{ width: '100%' }}>
        <UpgradeButton quality='low' />
        <UpgradeButton quality='mid' />
        <UpgradeButton quality='high' />
      </Flex>
    </Flex>
  )
}

function relicHash(relic: Relic) {
  return TsUtils.objectHash({
    grade: relic.grade,
    enhance: relic.enhance,
    part: relic.part,
    set: relic.set,
    mainStatType: relic.main?.stat,
    substats: relic.substats.map((stat) => ({
      stat: stat.stat,
      value: Utils.truncate1000ths(TsUtils.precisionRound(stat.value)),
    })),
  })
}

function relicsAreDifferent(relic1?: Relic, relic2?: Relic) {
  if (!relic1 || !relic2) return true

  const relic1Hash = relicHash(relic1)
  const relic2Hash = relicHash(relic2)

  return relic1Hash != relic2Hash
}
