import styled from 'styled-components'
import { Button, Flex, Form, Image, InputNumber, Modal, Radio, Select } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { Constants } from 'lib/constants'
import { HeaderText } from './HeaderText'
import { RelicAugmenter } from 'lib/relicAugmenter'
import { Message } from 'lib/message'
import PropTypes from 'prop-types'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
import { enhanceOptions, generateImageLabel, getSetOptions, substatOptions } from 'components/SelectOptions'

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

function renderMainStat(relic) {
  let mainStat = relic.main?.stat
  let mainValue = relic.main?.value

  if (!mainStat) return {}

  return renderStat(mainStat, mainValue)
}

function renderSubstat(relic, index) {
  let substat = relic.substats[index]
  if (!substat || !substat.stat) return {}

  let stat = substat.stat
  let value = substat.value

  return renderStat(stat, value)
}

function renderStat(stat, value) {
  if (Utils.isFlat(stat) && stat != Constants.Stats.SPD) {
    return {
      stat: stat,
      value: Math.floor(value),
    }
  } else {
    return {
      stat: stat,
      value: Utils.precisionRound(Math.floor(value * 10) / 10),
    }
  }
}

// selectedRelic, onOk, setOpen, open, type
export default function RelicModal(props) {
  const [relicForm] = Form.useForm()
  const [mainStatOptions, setMainStatOptions] = useState([])
  const characters = window.store((s) => s.characters)

  const characterOptions = useMemo(() => Utils.generateCurrentCharacterOptions(characters), [characters])
  const setOptions = useMemo(() => getSetOptions(), [])

  useEffect(() => {
    let defaultValues = {
      grade: 5,
      enhance: 15,
      part: Constants.Parts.Head,
      mainStatType: Constants.Stats.HP,
      mainStatValue: Math.floor(Constants.MainStatsValues[Constants.Stats.HP][5]['base'] + Constants.MainStatsValues[Constants.Stats.HP][5]['increment'] * 15),
    }

    let relic = props.selectedRelic
    if (!relic || props.type != 'edit') {
      // Ignore
    } else {
      defaultValues = {
        equippedBy: relic.equippedBy == undefined ? 'None' : relic.equippedBy,
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
    let mainStatOptions = []
    if (props.selectedRelic?.part) {
      mainStatOptions = Object.entries(Constants.PartsMainStats[props.selectedRelic?.part]).map((entry) => ({
        label: generateImageLabel(entry[1], (x) => Assets.getStatIcon(x, true), 22),
        value: entry[1],
      }))
    }
    setMainStatOptions(mainStatOptions || [])
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
  }, [relicForm, mainStatOptions, props.selectedRelic?.main?.stat])

  const onFinish = (x) => {
    console.log('Form finished', x)
    if (!x.part) {
      return Message.error('Part field is missing')
    }
    if (!x.mainStatType) {
      return Message.error('Main stat is missing')
    }
    if (!x.mainStatValue) {
      return Message.error('Main stat is missing')
    }
    if (!x.set) {
      return Message.error('Set field is missing')
    }
    if (x.enhance == undefined) {
      return Message.error('Enhance field is missing')
    }
    if (x.grade == undefined) {
      return Message.error('Grade field is missing')
    }
    if (x.grade > 5 || x.grade < 2) {
      return Message.error('Grade value is invalid')
    }
    if (x.enhance > 15 || x.enhance < 0) {
      return Message.error('Enhance value is invalid')
    }
    if (!Constants.SetsRelicsNames.includes(x.set) && !Constants.SetsOrnamentsNames.includes(x.set)) {
      return Message.error('Set value is invalid')
    }
    if (Constants.SetsRelicsNames.includes(x.set) && (x.part == Constants.Parts.PlanarSphere || x.part == Constants.Parts.LinkRope)) {
      return Message.error('The selected set is not an ornament set')
    }
    if (Constants.SetsOrnamentsNames.includes(x.set) && (x.part == Constants.Parts.Head
      || x.part == Constants.Parts.Hands
      || x.part == Constants.Parts.Body
      || x.part == Constants.Parts.Feet)) {
      return Message.error('The selected set is not a relic set')
    }
    if (x.substatType0 != undefined && x.substatValue0 == undefined || x.substatType0 == undefined && x.substatValue0 != undefined) {
      return Message.error('Substat 1 is invalid')
    }
    if (x.substatType1 != undefined && x.substatValue1 == undefined || x.substatType1 == undefined && x.substatValue1 != undefined) {
      return Message.error('Substat 2 is invalid')
    }
    if (x.substatType2 != undefined && x.substatValue2 == undefined || x.substatType2 == undefined && x.substatValue2 != undefined) {
      return Message.error('Substat 3 is invalid')
    }
    if (x.substatType3 != undefined && x.substatValue3 == undefined || x.substatType3 == undefined && x.substatValue3 != undefined) {
      return Message.error('Substat 4 is invalid')
    }

    if (x.substatType3 != undefined && (x.substatType0 == undefined || x.substatType1 == undefined || x.substatType2 == undefined)) {
      return Message.error('Substats are out of order')
    }
    if (x.substatType2 != undefined && (x.substatType0 == undefined || x.substatType1 == undefined)) {
      return Message.error('Substats are out of order')
    }
    if (x.substatType1 != undefined && (x.substatType0 == undefined)) {
      return Message.error('Substats are out of order')
    }

    let substatTypes = [x.substatType0, x.substatType1, x.substatType2, x.substatType3].filter((x) => x != undefined)
    if (new Set(substatTypes).size !== substatTypes.length) {
      return Message.error('Duplicate substats, only one of each type is allowed')
    }
    if (substatTypes.includes(x.mainStatType)) {
      return Message.error('Substat type is the same as the main stat')
    }

    if (x.substatValue0 >= 1000 || x.substatValue1 >= 1000 || x.substatValue2 >= 1000 || x.substatValue3 >= 1000) {
      return Message.error('Substat value is too big')
    }
    if (x.mainStatValue >= 1000) {
      return Message.error('Main stat value is too big')
    }
    if (x.substatValue0 <= 0 || x.substatValue1 <= 0 || x.substatValue2 <= 0 || x.substatValue3 <= 0) {
      return Message.error('Substat values should be positive')
    }
    if (x.mainStatValue <= 0) {
      return Message.error('Main stat values should be positive')
    }

    let relic = {
      equippedBy: x.equippedBy == 'None' ? undefined : x.equippedBy,
      enhance: x.enhance,
      grade: x.grade,
      part: x.part,
      set: x.set,
      main: {
        stat: x.mainStatType,
        value: x.mainStatValue,
      },
    }
    let substats = []
    if (x.substatType0 != undefined && x.substatValue0 != undefined) {
      substats.push({
        stat: x.substatType0,
        value: x.substatValue0,
      })
    }
    if (x.substatType1 != undefined && x.substatValue1 != undefined) {
      substats.push({
        stat: x.substatType1,
        value: x.substatValue1,
      })
    }
    if (x.substatType2 != undefined && x.substatValue2 != undefined) {
      substats.push({
        stat: x.substatType2,
        value: x.substatValue2,
      })
    }
    if (x.substatType3 != undefined && x.substatValue3 != undefined) {
      substats.push({
        stat: x.substatType3,
        value: x.substatValue3,
      })
    }
    relic.substats = substats
    RelicAugmenter.augment(relic)

    console.log('Completed relic', relic)

    props.onOk(relic)
    props.setOpen(false)
  }
  const onFinishFailed = () => {
    Message.error('Submit failed!')
    props.setOpen(false)
  }
  const onValuesChange = (x) => {
    let mainStatOptions = []
    if (x.part) {
      mainStatOptions = Object.entries(Constants.PartsMainStats[x.part]).map((entry) => ({
        label: entry[1],
        value: entry[1],
      }))
      setMainStatOptions(mainStatOptions)
      relicForm.setFieldValue('mainStatType', mainStatOptions[0]?.value)
    }

    let mainStatType = mainStatOptions[0]?.value || relicForm.getFieldValue('mainStatType')
    let enhance = relicForm.getFieldValue('enhance')
    let grade = relicForm.getFieldValue('grade')

    if (mainStatType != undefined && enhance != undefined && grade != undefined) {
      const specialStats = [Constants.Stats.OHB, Constants.Stats.Physical_DMG, Constants.Stats.Physical_DMG, Constants.Stats.Fire_DMG, Constants.Stats.Ice_DMG, Constants.Stats.Lightning_DMG, Constants.Stats.Wind_DMG, Constants.Stats.Quantum_DMG, Constants.Stats.Imaginary_DMG]
      const floorStats = [Constants.Stats.HP, Constants.Stats.ATK, Constants.Stats.SPD]

      let mainStatValue = Constants.MainStatsValues[mainStatType][grade]['base'] + Constants.MainStatsValues[mainStatType][grade]['increment'] * enhance

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

  const handleCancel = () => {
    props.setOpen(false)
  }
  const handleOk = () => {
    relicForm.submit()
  }

  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

  return (
    <Form
      form={relicForm}
      layout="vertical"
      preserve={false}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      onValuesChange={onValuesChange}
    >
      <Modal
        width={350}
        centered
        destroyOnClose
        open={props.open} //
        onCancel={() => props.setOpen(false)}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Submit
          </Button>,
        ]}
      >
        <Flex vertical gap={5}>

          <HeaderText>Equipped by</HeaderText>
          <Form.Item size="default" name="equippedBy">
            <Select
              showSearch
              filterOption={filterOption}
              style={{ width: 300 }}
              options={characterOptions}
            />
          </Form.Item>

          <HeaderText>Part</HeaderText>

          <Form.Item size="default" name="part">
            <Radio.Group buttonStyle="solid">
              <RadioIcon value={Constants.Parts.Head} src={Assets.getPart(Constants.Parts.Head)} />
              <RadioIcon value={Constants.Parts.Hands} src={Assets.getPart(Constants.Parts.Hands)} />
              <RadioIcon value={Constants.Parts.Body} src={Assets.getPart(Constants.Parts.Body)} />
              <RadioIcon value={Constants.Parts.Feet} src={Assets.getPart(Constants.Parts.Feet)} />
              <RadioIcon value={Constants.Parts.PlanarSphere} src={Assets.getPart(Constants.Parts.PlanarSphere)} />
              <RadioIcon value={Constants.Parts.LinkRope} src={Assets.getPart(Constants.Parts.LinkRope)} />
            </Radio.Group>
          </Form.Item>

          <HeaderText>Set</HeaderText>
          <Form.Item size="default" name="set">
            <Select
              showSearch
              allowClear
              style={{
                width: 300,
              }}
              placeholder="Sets"
              options={setOptions}
              maxTagCount="responsive"
            >
            </Select>
          </Form.Item>

          <HeaderText>Enhance / Grade</HeaderText>

          <Flex gap={10}>
            <Form.Item size="default" name="enhance">
              <Select
                showSearch
                style={{ width: 145 }}
                options={enhanceOptions}
              />
            </Form.Item>
            <Form.Item size="default" name="grade">
              <Select
                showSearch
                style={{ width: 145 }}
                options={[
                  { value: 2, label: '2 ★' },
                  { value: 3, label: '3 ★' },
                  { value: 4, label: '4 ★' },
                  { value: 5, label: '5 ★' },
                ]}
              />
            </Form.Item>
          </Flex>

          <HeaderText>Main stat</HeaderText>

          <Flex gap={10}>
            <Form.Item size="default" name="mainStatType">
              <Select
                showSearch
                style={{
                  width: 200,
                }}
                placeholder="Main Stat"
                maxTagCount="responsive"
                options={mainStatOptions}
                disabled={mainStatOptions.length <= 1}
              />
            </Form.Item>

            <Form.Item size="default" name="mainStatValue">
              <InputNumberStyled controls={false} disabled />
            </Form.Item>
          </Flex>

          <HeaderText>Substats</HeaderText>

          <Flex gap={10}>
            <Form.Item size="default" name="substatType0">
              <Select
                showSearch
                allowClear
                style={{
                  width: 200,
                }}
                placeholder="Substat"
                maxTagCount="responsive"
                options={substatOptions}
              />
            </Form.Item>

            <Form.Item size="default" name="substatValue0">
              <InputNumberStyled controls={false} />
            </Form.Item>
          </Flex>

          <Flex gap={10}>
            <Form.Item size="default" name="substatType1">
              <Select
                showSearch
                allowClear
                style={{
                  width: 200,
                }}
                placeholder="Substat"
                maxTagCount="responsive"
                options={substatOptions}
              />
            </Form.Item>

            <Form.Item size="default" name="substatValue1">
              <InputNumberStyled controls={false} />
            </Form.Item>
          </Flex>

          <Flex gap={10}>
            <Form.Item size="default" name="substatType2">
              <Select
                showSearch
                allowClear
                style={{
                  width: 200,
                }}
                placeholder="Substat"
                maxTagCount="responsive"
                options={substatOptions}
              />
            </Form.Item>

            <Form.Item size="default" name="substatValue2">
              <InputNumberStyled controls={false} />
            </Form.Item>
          </Flex>

          <Flex gap={10}>
            <Form.Item size="default" name="substatType3">
              <Select
                showSearch
                allowClear
                style={{
                  width: 200,
                }}
                placeholder="Substat"
                maxTagCount="responsive"
                options={substatOptions}
              />
            </Form.Item>

            <Form.Item size="default" name="substatValue3">
              <InputNumberStyled controls={false} />
            </Form.Item>
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
