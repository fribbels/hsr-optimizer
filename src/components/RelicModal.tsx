import styled from 'styled-components'
import { Button, Flex, Form, Image, Input, InputNumber, Modal, Radio, Select, theme } from 'antd'
import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react'
import { Constants, Stats } from 'lib/constants'
import { HeaderText } from './HeaderText'
import { Message } from 'lib/message'
import PropTypes from 'prop-types'
import { Utils } from 'lib/utils'
import { TsUtils } from 'lib/TsUtils'
import { Assets } from 'lib/assets'
import { enhanceOptions, generateImageLabel, getSetOptions, substatOptions } from 'components/SelectOptions'
import { Relic, Stat } from 'types/Relic'
import { Character } from 'types/Character'
import { calculateUpgradeValues, RelicForm, RelicUpgradeValues, validateRelic } from 'lib/relicModalController'
import { CaretRightOutlined } from '@ant-design/icons'
import { FormInstance } from 'antd/es/form/hooks/useForm'
import { generateCharacterList } from 'lib/displayUtils'

const { useToken } = theme

function RadioIcon(props) {
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

RadioIcon.propTypes = {
  value: PropTypes.string,
  src: PropTypes.string,
}

const InputNumberStyled = styled(InputNumber)`
    width: 90px
`

function renderMainStat(relic: Relic): Stat {
  const mainStat: string = relic.main?.stat
  const mainValue: number = relic.main?.value

  if (!mainStat) return {}

  return renderStat(mainStat, mainValue)
}

function renderSubstat(relic: Relic, index: number): Stat {
  const substat = relic.substats[index]
  if (!substat?.stat) return {}

  const stat = substat.stat
  const value = substat.value

  return renderStat(stat, value, relic)
}

function renderStat(stat: string, value: number, relic?: Relic): Stat {
  if (stat == Stats.SPD) {
    if (relic?.verified) {
      return {
        stat: stat,
        value: value.toFixed(1),
      }
    } else {
      return {
        stat: stat,
        value: value % 1 !== 0 ? value.toFixed(1) : Math.floor(value),
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
      value: Utils.precisionRound(Math.floor(value * 10) / 10).toFixed(1),
    }
  }
}

type MainStatOption = { label: ReactElement | string; value: string }

// selectedRelic, onOk, setOpen, open, type
export default function RelicModal(props: {
  selectedRelic: Relic
  type: string
  onOk: (relic: Relic) => void
  setOpen: (open: boolean) => void
  open: boolean
}) {
  const { token } = useToken()
  const [relicForm] = Form.useForm()
  const [mainStatOptions, setMainStatOptions] = useState<MainStatOption[]>([])
  const characters: Character[] = window.store((s) => s.characters)

  const characterOptions = useMemo(() => generateCharacterList({ currentCharacters: characters }), [characters])
  const setOptions = useMemo(() => getSetOptions(), [])
  const equippedBy: string = Form.useWatch('equippedBy', relicForm)
  const [upgradeValues, setUpgradeValues] = useState<RelicUpgradeValues[]>([])

  useEffect(() => {
    let defaultValues = {
      grade: 5,
      enhance: 15,
      part: Constants.Parts.Head,
      mainStatType: Constants.Stats.HP,
      mainStatValue: Math.floor(Constants.MainStatsValues[Constants.Stats.HP][5].base + Constants.MainStatsValues[Constants.Stats.HP][5].increment * 15),
    }

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
        substatValue0: renderSubstat(relic, 0).value,
        substatType1: renderSubstat(relic, 1).stat,
        substatValue1: renderSubstat(relic, 1).value,
        substatType2: renderSubstat(relic, 2).stat,
        substatValue2: renderSubstat(relic, 2).value,
        substatType3: renderSubstat(relic, 3).stat,
        substatValue3: renderSubstat(relic, 3).value,
      }
    }
    onValuesChange(defaultValues)
    relicForm.setFieldsValue(defaultValues)
  }, [props.selectedRelic, props.open, relicForm, props])

  useEffect(() => {
    let mainStatOptions: MainStatOption[] = []
    if (props.selectedRelic?.part) {
      mainStatOptions = Object.entries(Constants.PartsMainStats[props.selectedRelic?.part]).map((entry) => ({
        label: generateImageLabel(entry[1], (x) => Assets.getStatIcon(x, true), 22),
        value: entry[1],
      }))
    }

    setMainStatOptions(mainStatOptions)
    relicForm.setFieldValue('mainStatType', props.selectedRelic?.main?.stat)
  }, [props.selectedRelic?.part, props.selectedRelic?.main?.stat, relicForm])

  useEffect(() => {
    if (mainStatOptions.length > 0) {
      const mainStatValues = mainStatOptions.map((item) => item.value)
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

    console.log('Completed relic', relic)

    props.onOk(relic)
    props.setOpen(false)
  }
  const onFinishFailed = () => {
    Message.error('Submit failed!')
    props.setOpen(false)
  }
  const onValuesChange = (formValues: RelicForm) => {
    let mainStatOptions: MainStatOption[] = []
    if (formValues.part) {
      mainStatOptions = Object.entries(Constants.PartsMainStats[formValues.part]).map((entry) => ({
        label: entry[1],
        value: entry[1],
      }))
      setMainStatOptions(mainStatOptions)
      relicForm.setFieldValue('mainStatType', mainStatOptions[0]?.value)
    }

    const mainStatType: string = mainStatOptions[0]?.value || relicForm.getFieldValue('mainStatType')
    const enhance: number = relicForm.getFieldValue('enhance')
    const grade: number = relicForm.getFieldValue('grade')

    if (mainStatType != undefined && enhance != undefined && grade != undefined) {
      const specialStats = [Constants.Stats.OHB, Constants.Stats.Physical_DMG, Constants.Stats.Physical_DMG, Constants.Stats.Fire_DMG, Constants.Stats.Ice_DMG, Constants.Stats.Lightning_DMG, Constants.Stats.Wind_DMG, Constants.Stats.Quantum_DMG, Constants.Stats.Imaginary_DMG]
      const floorStats = [Constants.Stats.HP, Constants.Stats.ATK, Constants.Stats.SPD]

      let mainStatValue = TsUtils.calculateRelicMainStatValue(mainStatType, grade, enhance)

      if (specialStats.includes(mainStatType)) { // Outgoing Healing Boost and elemental damage bonuses has a weird rounding with one decimal place
        mainStatValue = Utils.truncate10ths(mainStatValue)
      } else if (floorStats.includes(mainStatType)) {
        mainStatValue = Math.floor(mainStatValue)
      } else {
        mainStatValue = mainStatValue.toFixed(1)
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
    relicForm.setFieldValue('enhance', Math.min(relicForm.getFieldValue('enhance') + 3, 15))
  }

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
        open={props.open} //
        onCancel={() => props.setOpen(false)}
        footer={[
          <Button key='back' onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key='submit' type='primary' onClick={handleOk}>
            Submit
          </Button>,
        ]}
      >
        <Flex vertical gap={5}>
          <Flex gap={10}>
            <Flex vertical gap={5}>

              <HeaderText>Part</HeaderText>

              <Form.Item name='part'>
                <Radio.Group buttonStyle='solid'>
                  <RadioIcon value={Constants.Parts.Head} src={Assets.getPart(Constants.Parts.Head)}/>
                  <RadioIcon value={Constants.Parts.Hands} src={Assets.getPart(Constants.Parts.Hands)}/>
                  <RadioIcon value={Constants.Parts.Body} src={Assets.getPart(Constants.Parts.Body)}/>
                  <RadioIcon value={Constants.Parts.Feet} src={Assets.getPart(Constants.Parts.Feet)}/>
                  <RadioIcon value={Constants.Parts.PlanarSphere} src={Assets.getPart(Constants.Parts.PlanarSphere)}/>
                  <RadioIcon value={Constants.Parts.LinkRope} src={Assets.getPart(Constants.Parts.LinkRope)}/>
                </Radio.Group>
              </Form.Item>

              <HeaderText>Set</HeaderText>
              <Form.Item name='set'>
                <Select
                  showSearch
                  allowClear
                  style={{
                    width: 300,
                  }}
                  placeholder='Sets'
                  options={setOptions}
                  maxTagCount='responsive'
                >
                </Select>
              </Form.Item>

              <HeaderText>Enhance / Grade</HeaderText>

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

              <HeaderText>Main stat</HeaderText>

              <Flex gap={10}>
                <Form.Item name='mainStatType'>
                  <Select
                    showSearch
                    style={{
                      width: 200,
                    }}
                    placeholder='Main Stat'
                    maxTagCount='responsive'
                    options={mainStatOptions}
                    disabled={mainStatOptions.length <= 1}
                  />
                </Form.Item>

                <Form.Item name='mainStatValue'>
                  <InputNumberStyled controls={false} disabled/>
                </Form.Item>
              </Flex>
            </Flex>

            <div style={{ display: 'block', minWidth: 12 }}/>

            <Flex vertical gap={5} style={{}}>
              <HeaderText>Equipped by</HeaderText>
              <Form.Item name='equippedBy'>
                <Select
                  showSearch
                  filterOption={Utils.titleFilterOption}
                  style={{ height: 35 }}
                  options={characterOptions}
                  optionLabelProp='title'
                />
              </Form.Item>

              <div style={{ height: 180, overflow: 'hidden', marginTop: 7, borderRadius: 10, boxShadow: `0px 0px 0px 1px ${token.colorBorder} inset` }}>
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
                <HeaderText>Substats</HeaderText>
                <Flex style={{ width: 180 }}>
                  <HeaderText>Substat upgrades</HeaderText>
                </Flex>
              </Flex>
              <SubstatInput index={0} upgrades={upgradeValues} relicForm={relicForm} resetUpgradeValues={resetUpgradeValues} plusThree={plusThree}/>
              <SubstatInput index={1} upgrades={upgradeValues} relicForm={relicForm} resetUpgradeValues={resetUpgradeValues} plusThree={plusThree}/>
              <SubstatInput index={2} upgrades={upgradeValues} relicForm={relicForm} resetUpgradeValues={resetUpgradeValues} plusThree={plusThree}/>
              <SubstatInput index={3} upgrades={upgradeValues} relicForm={relicForm} resetUpgradeValues={resetUpgradeValues} plusThree={plusThree}/>
            </Flex>
          </Flex>
        </Flex>
      </Modal>
    </Form>
  )
}
RelicModal.propTypes = {
  selectedRelic: PropTypes.object,
  type: PropTypes.string,
  onOk: PropTypes.func,
  setOpen: PropTypes.func,
  open: PropTypes.bool,
}

function SubstatInput(props: { index: number; upgrades: RelicUpgradeValues[]; relicForm: FormInstance; resetUpgradeValues: () => void; plusThree: () => void }) {
  const inputRef = useRef(null)
  const [hovered, setHovered] = React.useState(false)
  const statTypeField = `substatType${props.index}`
  const statValueField = `substatValue${props.index}`
  const field = props.relicForm.getFieldValue(statTypeField)

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select() // Select the entire text when focused
    }
  }

  function upgradeClicked(quality: string) {
    console.log(props, quality)

    props.relicForm.setFieldValue(statValueField, props.upgrades[props.index][quality])
    props.resetUpgradeValues()
    props.plusThree()
  }

  function UpgradeButton(subProps: { quality: string }) {
    const value = props.upgrades?.[props.index]?.[subProps.quality]

    return (
      <Flex style={{ width: '100%' }}>
        <Button
          type={hovered ? 'default' : 'dashed'}
          style={{ width: '100%', padding: 0 }}
          onClick={() => upgradeClicked(subProps.quality)}
          disabled={value == undefined} tabIndex={-1}
        >
          {value || ''}
        </Button>
      </Flex>
    )
  }

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
            placeholder='Substat'
            maxTagCount='responsive'
            options={substatOptions}
            listHeight={750}
            onChange={() => {
              props.relicForm.getFieldValue(statTypeField)
                ? props.relicForm.setFieldValue(statValueField, 0)
                : props.relicForm.setFieldValue(statValueField, undefined)
              props.resetUpgradeValues()
            }}
            tabIndex={0}
          />
        </Form.Item>

        <Form.Item name={`substatValue${props.index}`}>
          <Input
            ref={inputRef}
            onFocus={handleFocus}
            style={{ width: 80 }}
            onChange={props.resetUpgradeValues}
            tabIndex={0}
          />
        </Form.Item>
      </Flex>
      <CaretRightOutlined style={{ width: 12 }}/>
      <Flex gap={5} style={{ width: '100%' }}>
        <UpgradeButton quality='low'/>
        <UpgradeButton quality='mid'/>
        <UpgradeButton quality='high'/>
      </Flex>
    </Flex>
  )
}

function relicHash(relic: Relic) {
  return Utils.objectHash({
    grade: relic.grade,
    enhance: relic.enhance,
    part: relic.part,
    set: relic.set,
    mainStatType: relic.main?.stat,
    substats: relic.substats,
  })
}

function relicsAreDifferent(relic1: Relic, relic2: Relic) {
  if (!relic1 || !relic2) return true

  const relic1Hash = relicHash(relic1)
  const relic2Hash = relicHash(relic2)

  return relic1Hash != relic2Hash
}
