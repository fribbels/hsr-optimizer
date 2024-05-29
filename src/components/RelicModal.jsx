import styled from 'styled-components'
import { Button, Col, Flex, Form, Image, InputNumber, Modal, Radio, Row, Select, Space } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { Constants, SubStatValues } from 'lib/constants'
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

  useEffect(() => { // Set the proper values for the level-up buttons
    let low0 = 0
    let mid0 = 0
    let high0 = 0

    let low1 = 0
    let mid1 = 0
    let high1 = 0

    let low2 = 0
    let mid2 = 0
    let high2 = 0

    let low3 = 0
    let mid3 = 0
    let high3 = 0
    if (props.selectedRelic != undefined && props.type == 'edit') {
      low0 = SubStatValues[props.selectedRelic.substats[0].stat][props.selectedRelic.grade].low + props.selectedRelic.substats[0].value
      mid0 = SubStatValues[props.selectedRelic.substats[0].stat][props.selectedRelic.grade].mid + props.selectedRelic.substats[0].value
      high0 = SubStatValues[props.selectedRelic.substats[0].stat][props.selectedRelic.grade].high + props.selectedRelic.substats[0].value

      low1 = SubStatValues[props.selectedRelic.substats[1].stat][props.selectedRelic.grade].low + props.selectedRelic.substats[1].value
      mid1 = SubStatValues[props.selectedRelic.substats[1].stat][props.selectedRelic.grade].mid + props.selectedRelic.substats[1].value
      high1 = SubStatValues[props.selectedRelic.substats[1].stat][props.selectedRelic.grade].high + props.selectedRelic.substats[1].value

      low2 = SubStatValues[props.selectedRelic.substats[2].stat][props.selectedRelic.grade].low + props.selectedRelic.substats[2].value
      mid2 = SubStatValues[props.selectedRelic.substats[2].stat][props.selectedRelic.grade].mid + props.selectedRelic.substats[2].value
      high2 = SubStatValues[props.selectedRelic.substats[2].stat][props.selectedRelic.grade].high + props.selectedRelic.substats[2].value

      low3 = SubStatValues[props.selectedRelic.substats[3].stat][props.selectedRelic.grade].low + props.selectedRelic.substats[3].value
      mid3 = SubStatValues[props.selectedRelic.substats[3].stat][props.selectedRelic.grade].mid + props.selectedRelic.substats[3].value
      high3 = SubStatValues[props.selectedRelic.substats[3].stat][props.selectedRelic.grade].high + props.selectedRelic.substats[3].value

      if (Utils.isFlat(props.selectedRelic.substats[0].stat)) {
        if (props.selectedRelic.substats[0].stat == Constants.Stats.SPD) {
          setHide0('none')
          low0 = Math.floor(props.selectedRelic.substats[0].value) + 2
          mid0 = undefined
          high0 = Math.floor(props.selectedRelic.substats[0].value) + 3
        } else {
          setHide0('inline')
          low0 = Math.floor(low0)
          mid0 = Math.floor(mid0)
          high0 = Math.floor(high0)
        }
        setButton0low(parseFloat(low0))
        setButton0mid(parseFloat(mid0))
        setButton0high(parseFloat(high0))
        setPrecision0(0)
      } else {
        low0 = Math.floor(10 * low0) / 10
        mid0 = Math.floor(10 * mid0) / 10
        high0 = Math.floor(10 * high0) / 10
        setHide0('inline')

        setButton0low(parseFloat(low0).toFixed(1))
        setButton0mid(parseFloat(mid0).toFixed(1))
        setButton0high(parseFloat(high0).toFixed(1))
        setPrecision0(1)
      }
      if (Utils.isFlat(props.selectedRelic.substats[1].stat)) {
        if (props.selectedRelic.substats[1].stat == Constants.Stats.SPD) {
          setHide1('none')
          low1 = Math.floor(props.selectedRelic.substats[1].value) + 2
          mid1 = undefined
          high1 = Math.floor(props.selectedRelic.substats[1].value) + 3
        } else {
          setHide1('inline')
          low1 = Math.floor(low1)
          mid1 = Math.floor(mid1)
          high1 = Math.floor(high1)
        }
        setButton1low(parseFloat(low1))
        setButton1mid(parseFloat(mid1))
        setButton1high(parseFloat(high1))
        setPrecision1(0)
      } else {
        low1 = Math.floor(10 * low1) / 10
        mid1 = Math.floor(10 * mid1) / 10
        high1 = Math.floor(10 * high1) / 10
        setHide1('inline')

        setButton1low(parseFloat(low1).toFixed(1))
        setButton1mid(parseFloat(mid1).toFixed(1))
        setButton1high(parseFloat(high1).toFixed(1))
        setPrecision1(1)
      }
      if (Utils.isFlat(props.selectedRelic.substats[2].stat)) {
        if (props.selectedRelic.substats[2].stat == Constants.Stats.SPD) {
          setHide2('none')
          low2 = Math.floor(props.selectedRelic.substats[2].value) + 2
          mid2 = undefined
          high2 = Math.floor(props.selectedRelic.substats[2].value) + 3
        } else {
          setHide2('inline')
          low2 = Math.floor(low2)
          mid2 = Math.floor(mid2)
          high2 = Math.floor(high2)
        }
        setButton2low(parseFloat(low2))
        setButton2mid(parseFloat(mid2))
        setButton2high(parseFloat(high2))
        setPrecision2(0)
      } else {
        low2 = Math.floor(10 * low2) / 10
        mid2 = Math.floor(10 * mid2) / 10
        high2 = Math.floor(10 * high2) / 10
        setHide2('inline')

        setButton2low(parseFloat(low2).toFixed(1))
        setButton2mid(parseFloat(mid2).toFixed(1))
        setButton2high(parseFloat(high2).toFixed(1))
        setPrecision2(1)
      }
      if (Utils.isFlat(props.selectedRelic.substats[3].stat)) {
        if (props.selectedRelic.substats[3].stat == Constants.Stats.SPD) {
          setHide3('none')
          low3 = Math.floor(props.selectedRelic.substats[3].value) + 2
          mid3 = undefined
          high3 = Math.floor(props.selectedRelic.substats[3].value) + 3
        } else {
          setHide3('inline')
          low3 = Math.floor(low3)
          mid3 = Math.floor(mid3)
          high3 = Math.floor(high3)
        }
        setButton3low(parseFloat(low3))
        setButton3mid(parseFloat(mid3))
        setButton3high(parseFloat(high3))
        setPrecision3(0)
      } else {
        low3 = Math.floor(10 * low3) / 10
        mid3 = Math.floor(10 * mid3) / 10
        high3 = Math.floor(10 * high3) / 10
        setHide3('inline')

        setButton3low(parseFloat(low3).toFixed(1))
        setButton3mid(parseFloat(mid3).toFixed(1))
        setButton3high(parseFloat(high3).toFixed(1))
        setPrecision3(1)
      }
    } else {
      setButton0low(undefined)
      setButton0mid(undefined)
      setButton0high(undefined)
      setHide0('inline')

      setButton1low(undefined)
      setButton1mid(undefined)
      setButton1high(undefined)
      setHide1('inline')

      setButton2low(undefined)
      setButton2mid(undefined)
      setButton2high(undefined)
      setHide2('inline')

      setButton3low(undefined)
      setButton3mid(undefined)
      setButton3high(undefined)
      setHide3('inline')
    }
  }, [props.selectedRelic, props.type])

  useEffect(() => {
    if (props.selectedRelic) {
      setTrueStats({
        substat0: props.selectedRelic.substats[0].value,
        substat1: props.selectedRelic.substats[1].value,
        substat2: props.selectedRelic.substats[2].value,
        substat3: props.selectedRelic.substats[3].value,
      })
    }
  }, [props.selectedRelic])

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

  const plusThree = () => {
    relicForm.setFieldValue('enhance', Math.min(relicForm.getFieldValue('enhance') + 3, 15))
  }

  const [wearerID, setWearerID] = useState('None')

  const [hide0, setHide0] = useState('inline')

  const [hide1, setHide1] = useState('inline')

  const [hide2, setHide2] = useState('inline')

  const [hide3, setHide3] = useState('inline')

  const [button0low, setButton0low] = useState(undefined)

  const [button0mid, setButton0mid] = useState(undefined)

  const [button0high, setButton0high] = useState(undefined)

  const [button1low, setButton1low] = useState(undefined)

  const [button1mid, setButton1mid] = useState(undefined)

  const [button1high, setButton1high] = useState(undefined)

  const [button2low, setButton2low] = useState(undefined)

  const [button2mid, setButton2mid] = useState(undefined)

  const [button2high, setButton2high] = useState(undefined)

  const [button3low, setButton3low] = useState(undefined)

  const [button3mid, setButton3mid] = useState(undefined)

  const [button3high, setButton3high] = useState(undefined)

  const [trueStats, setTrueStats] = useState({
    substat0: 0,
    substat1: 0,
    substat2: 0,
    substat3: 0,
  })

  const [precision0, setPrecision0] = useState(0)

  const [precision1, setPrecision1] = useState(0)

  const [precision2, setPrecision2] = useState(0)

  const [precision3, setPrecision3] = useState(0)

  const upgrade0low = () => {
    const stat = relicForm.getFieldValue('substatType0')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].low
    const stats = trueStats
    if (stat == Constants.Stats.SPD) {
      stats.substat0 += 2
      setButton0low(Math.floor(stats.substat0) + 2)
      setButton0high(Math.floor(stats.substat0) + 3)
      relicForm.setFieldValue('substatValue0', Math.floor(stats.substat0))
    } else if (Utils.isFlat(stat)) {
      stats.substat0 += increment
      setButton0low(Math.floor(stats.substat0 + SubStatValues[stat][grade].low))
      setButton0mid(Math.floor(stats.substat0 + SubStatValues[stat][grade].mid))
      setButton0high(Math.floor(stats.substat0 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue0', Math.floor(stats.substat0))
    } else {
      stats.substat0 += increment
      setButton0low(parseFloat(Math.floor(10 * (stats.substat0 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton0mid(parseFloat(Math.floor(10 * (stats.substat0 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton0high(parseFloat(Math.floor(10 * (stats.substat0 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue0', parseFloat(Math.floor(10 * stats.substat0) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade0mid = () => {
    const stat = relicForm.getFieldValue('substatType0')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].mid
    const stats = trueStats
    stats.substat0 += increment
    if (Utils.isFlat(stat)) {
      setButton0low(Math.floor(stats.substat0 + SubStatValues[stat][grade].low))
      setButton0mid(Math.floor(stats.substat0 + SubStatValues[stat][grade].mid))
      setButton0high(Math.floor(stats.substat0 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue0', Math.floor(stats.substat0))
    } else {
      setButton0low(parseFloat(Math.floor(10 * (stats.substat0 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton0mid(parseFloat(Math.floor(10 * (stats.substat0 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton0high(parseFloat(Math.floor(10 * (stats.substat0 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue0', parseFloat(Math.floor(10 * stats.substat0) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade0high = () => {
    const stat = relicForm.getFieldValue('substatType0')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].high
    const stats = trueStats
    if (stat == Constants.Stats.SPD) {
      stats.substat0 += 3
      setButton0low(Math.floor(stats.substat0) + 2)
      setButton0high(Math.floor(stats.substat0) + 3)
      relicForm.setFieldValue('substatValue0', Math.floor(stats.substat0))
    } else if (Utils.isFlat(stat)) {
      stats.substat0 += increment
      setButton0low(Math.floor(stats.substat0 + SubStatValues[stat][grade].low))
      setButton0mid(Math.floor(stats.substat0 + SubStatValues[stat][grade].mid))
      setButton0high(Math.floor(stats.substat0 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue0', Math.floor(stats.substat0))
    } else {
      stats.substat0 += increment
      setButton0low(parseFloat(Math.floor(10 * (stats.substat0 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton0mid(parseFloat(Math.floor(10 * (stats.substat0 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton0high(parseFloat(Math.floor(10 * (stats.substat0 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue0', parseFloat(Math.floor(10 * stats.substat0) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade1low = () => {
    const stat = relicForm.getFieldValue('substatType1')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].low
    const stats = trueStats
    if (stat == Constants.Stats.SPD) {
      stats.substat1 += 2
      setButton1low(Math.floor(stats.substat1) + 2)
      setButton1high(Math.floor(stats.substat1) + 3)
      relicForm.setFieldValue('substatValue1', Math.floor(stats.substat1))
    } else if (Utils.isFlat(stat)) {
      stats.substat1 += increment
      setButton1low(Math.floor(stats.substat1 + SubStatValues[stat][grade].low))
      setButton1mid(Math.floor(stats.substat1 + SubStatValues[stat][grade].mid))
      setButton1high(Math.floor(stats.substat1 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue1', Math.floor(stats.substat1))
    } else {
      stats.substat1 += increment
      setButton1low(parseFloat(Math.floor(10 * (stats.substat1 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton1mid(parseFloat(Math.floor(10 * (stats.substat1 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton1high(parseFloat(Math.floor(10 * (stats.substat1 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue1', parseFloat(Math.floor(10 * stats.substat1) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade1mid = () => {
    const stat = relicForm.getFieldValue('substatType1')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].mid
    const stats = trueStats
    stats.substat1 += increment
    if (Utils.isFlat(stat)) {
      setButton1low(Math.floor(stats.substat1 + SubStatValues[stat][grade].low))
      setButton1mid(Math.floor(stats.substat1 + SubStatValues[stat][grade].mid))
      setButton1high(Math.floor(stats.substat1 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue1', Math.floor(stats.substat1))
    } else {
      setButton1low(parseFloat(Math.floor(10 * (stats.substat1 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton1mid(parseFloat(Math.floor(10 * (stats.substat1 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton1high(parseFloat(Math.floor(10 * (stats.substat1 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue1', parseFloat(Math.floor(10 * stats.substat1) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade1high = () => {
    const stat = relicForm.getFieldValue('substatType1')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].high
    const stats = trueStats
    if (stat == Constants.Stats.SPD) {
      stats.substat1 += 3
      setButton1low(Math.floor(stats.substat1) + 2)
      setButton1high(Math.floor(stats.substat1) + 3)
      relicForm.setFieldValue('substatValue1', Math.floor(stats.substat1))
    } else if (Utils.isFlat(stat)) {
      stats.substat1 += increment
      setButton1low(Math.floor(stats.substat1 + SubStatValues[stat][grade].low))
      setButton1mid(Math.floor(stats.substat1 + SubStatValues[stat][grade].mid))
      setButton1high(Math.floor(stats.substat1 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue1', Math.floor(stats.substat1))
    } else {
      stats.substat1 += increment
      setButton1low(parseFloat(Math.floor(10 * (stats.substat1 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton1mid(parseFloat(Math.floor(10 * (stats.substat1 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton1high(parseFloat(Math.floor(10 * (stats.substat1 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue1', parseFloat(Math.floor(10 * stats.substat1) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade2low = () => {
    const stat = relicForm.getFieldValue('substatType2')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].low
    const stats = trueStats
    if (stat == Constants.Stats.SPD) {
      stats.substat2 += 2
      setButton2low(Math.floor(stats.substat2) + 2)
      setButton2high(Math.floor(stats.substat2) + 3)
      relicForm.setFieldValue('substatValue2', Math.floor(stats.substat2))
    } else if (Utils.isFlat(stat)) {
      stats.substat2 += increment
      setButton2low(Math.floor(stats.substat2 + SubStatValues[stat][grade].low))
      setButton2mid(Math.floor(stats.substat2 + SubStatValues[stat][grade].mid))
      setButton2high(Math.floor(stats.substat2 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue2', Math.floor(stats.substat2))
    } else {
      stats.substat2 += increment
      setButton2low(parseFloat(Math.floor(10 * (stats.substat2 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton2mid(parseFloat(Math.floor(10 * (stats.substat2 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton2high(parseFloat(Math.floor(10 * (stats.substat2 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue2', parseFloat(Math.floor(10 * stats.substat2) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade2mid = () => {
    const stat = relicForm.getFieldValue('substatType2')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].mid
    const stats = trueStats
    stats.substat2 += increment
    if (Utils.isFlat(stat)) {
      setButton2low(Math.floor(stats.substat2 + SubStatValues[stat][grade].low))
      setButton2mid(Math.floor(stats.substat2 + SubStatValues[stat][grade].mid))
      setButton2high(Math.floor(stats.substat2 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue2', Math.floor(stats.substat2))
    } else {
      setButton2low(parseFloat(Math.floor(10 * (stats.substat2 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton2mid(parseFloat(Math.floor(10 * (stats.substat2 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton2high(parseFloat(Math.floor(10 * (stats.substat2 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue2', parseFloat(Math.floor(10 * stats.substat2) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade2high = () => {
    const stat = relicForm.getFieldValue('substatType2')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].high
    const stats = trueStats
    if (stat == Constants.Stats.SPD) {
      stats.substat2 += 3
      setButton2low(Math.floor(stats.substat2) + 2)
      setButton2high(Math.floor(stats.substat2) + 3)
      relicForm.setFieldValue('substatValue2', Math.floor(stats.substat2))
    } else if (Utils.isFlat(stat)) {
      stats.substat2 += increment
      setButton2low(Math.floor(stats.substat2 + SubStatValues[stat][grade].low))
      setButton2mid(Math.floor(stats.substat2 + SubStatValues[stat][grade].mid))
      setButton2high(Math.floor(stats.substat2 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue2', Math.floor(stats.substat2))
    } else {
      stats.substat2 += increment
      setButton2low(parseFloat(Math.floor(10 * (stats.substat2 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton2mid(parseFloat(Math.floor(10 * (stats.substat2 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton2high(parseFloat(Math.floor(10 * (stats.substat2 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue2', parseFloat(Math.floor(10 * stats.substat2) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade3low = () => {
    const stat = relicForm.getFieldValue('substatType3')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].low
    const stats = trueStats
    if (stat == Constants.Stats.SPD) {
      stats.substat3 += 2
      setButton3low(Math.floor(stats.substat3) + 2)
      setButton3high(Math.floor(stats.substat3) + 3)
      relicForm.setFieldValue('substatValue3', Math.floor(stats.substat3))
    } else if (Utils.isFlat(stat)) {
      stats.substat3 += increment
      setButton3low(Math.floor(stats.substat3 + SubStatValues[stat][grade].low))
      setButton3mid(Math.floor(stats.substat3 + SubStatValues[stat][grade].mid))
      setButton3high(Math.floor(stats.substat3 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue3', Math.floor(stats.substat3))
    } else {
      stats.substat3 += increment
      setButton3low(parseFloat(Math.floor(10 * (stats.substat3 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton3mid(parseFloat(Math.floor(10 * (stats.substat3 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton3high(parseFloat(Math.floor(10 * (stats.substat3 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue3', parseFloat(Math.floor(10 * stats.substat3) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade3mid = () => {
    const stat = relicForm.getFieldValue('substatType3')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].mid
    const stats = trueStats
    stats.substat3 += increment
    if (Utils.isFlat(stat)) {
      setButton3low(Math.floor(stats.substat3 + SubStatValues[stat][grade].low))
      setButton3mid(Math.floor(stats.substat3 + SubStatValues[stat][grade].mid))
      setButton3high(Math.floor(stats.substat3 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue3', Math.floor(stats.substat3))
    } else {
      setButton3low(parseFloat(Math.floor(10 * (stats.substat3 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton3mid(parseFloat(Math.floor(10 * (stats.substat3 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton3high(parseFloat(Math.floor(10 * (stats.substat3 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue3', parseFloat(Math.floor(10 * stats.substat3) / 10).toFixed(1))
    }
    plusThree()
  }

  const upgrade3high = () => {
    const stat = relicForm.getFieldValue('substatType3')
    const grade = relicForm.getFieldValue('grade')
    const increment = SubStatValues[stat][grade].high
    const stats = trueStats
    if (stat == Constants.Stats.SPD) {
      stats.substat3 += 3
      setButton3low(Math.floor(stats.substat3) + 2)
      setButton3high(Math.floor(stats.substat3) + 3)
      relicForm.setFieldValue('substatValue3', Math.floor(stats.substat3))
    } else if (Utils.isFlat(stat)) {
      stats.substat3 += increment
      setButton3low(Math.floor(stats.substat3 + SubStatValues[stat][grade].low))
      setButton3mid(Math.floor(stats.substat3 + SubStatValues[stat][grade].mid))
      setButton3high(Math.floor(stats.substat3 + SubStatValues[stat][grade].high))
      relicForm.setFieldValue('substatValue3', Math.floor(stats.substat3))
    } else {
      stats.substat3 += increment
      setButton3low(parseFloat(Math.floor(10 * (stats.substat3 + SubStatValues[stat][grade].low)) / 10).toFixed(1))
      setButton3mid(parseFloat(Math.floor(10 * (stats.substat3 + SubStatValues[stat][grade].mid)) / 10).toFixed(1))
      setButton3high(parseFloat(Math.floor(10 * (stats.substat3 + SubStatValues[stat][grade].high)) / 10).toFixed(1))
      relicForm.setFieldValue('substatValue3', parseFloat(Math.floor(10 * stats.substat3) / 10).toFixed(1))
    }
    plusThree()
  }

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
        width={525}
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
          <Space size={15} direction="vertical">
            <Row gutter={[10, 5]}>
              <Col span={16}>
                <Flex vertical gap={5}>
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
                        style={{ width: 115 }}
                        options={enhanceOptions}
                      />
                    </Form.Item>

                    <Form.Item size="default">
                      <Button style={{ width: 50 }} onClick={plusThree}>
                        +3
                      </Button>
                    </Form.Item>

                    <Form.Item size="default" name="grade">
                      <Select
                        showSearch
                        style={{ width: 115 }}
                        options={[
                          { value: 2, label: '2 ★' },
                          { value: 3, label: '3 ★' },
                          { value: 4, label: '4 ★' },
                          { value: 5, label: '5 ★' },
                        ]}
                      />
                    </Form.Item>
                  </Flex>
                </Flex>
              </Col>
              <Col span={8}>
                <Flex vertical gap={5}>
                  <HeaderText>Equipped by</HeaderText>
                  <Form.Item size="default" name="equippedBy">
                    <Select
                      showSearch
                      filterOption={filterOption}
                      style={{ width: 150, height: 35 }}
                      options={characterOptions}
                      onChange={(e) => {
                        setWearerID(relicForm.getFieldValue('equippedBy'))
                      }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Image
                      style={{ marginLeft: 13 }}
                      width={123}
                      preview={false}
                      src={Assets.getCharacterIconById(wearerID)}
                      onLoad={(e) => {
                        setWearerID(relicForm.getFieldValue('equippedBy'))
                      }}
                    />
                  </Form.Item>
                </Flex>
              </Col>
            </Row>
            <Row>
              <Col span={16}>
                <Flex vertical gap={5}>
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
                </Flex>
              </Col>
            </Row>
          </Space>

          <Row>
            <Col span={16}>
              <Flex vertical gap={5}>

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
                      onChange={(e) => {
                        const stat = relicForm.getFieldValue('substatType0')
                        if (stat) {
                          if (stat == Constants.Stats.SPD) {
                            setPrecision0(0)
                            setHide0('none')
                            setButton0low(2)
                            setButton0mid(undefined)
                            setButton0high(3)
                            relicForm.setFieldValue('substatValue0', 0)
                            setTrueStats({ substat0: 0 })
                          } else {
                            let low = SubStatValues[stat][5].low
                            let mid = SubStatValues[stat][5].mid
                            let high = SubStatValues[stat][5].high
                            if ([Constants.Stats.HP, Constants.Stats.DEF, Constants.Stats.ATK].includes(stat)) {
                              setPrecision0(0)
                              low = Math.floor(low)
                              mid = Math.floor(mid)
                              high = Math.floor(high)
                            } else {
                              setPrecision0(1)
                              low = Math.floor(10 * low) / 10
                              mid = Math.floor(10 * mid) / 10
                              high = Math.floor(10 * high) / 10
                            }
                            setButton0low(low)
                            setButton0mid(mid)
                            setButton0high(high)
                            relicForm.setFieldValue('substatValue0', 0)
                            setTrueStats({ substat0: 0 })
                            setHide0('inline')
                          }
                        } else {
                          relicForm.setFieldValue('substatValue0', undefined)
                          setTrueStats({ substat0: 0 })
                          setButton0low(undefined)
                          setButton0mid(undefined)
                          setButton0high(undefined)
                          setHide0('inline')
                        }
                      }}
                    />
                  </Form.Item>

                  <Form.Item size="default" name="substatValue0">
                    <InputNumberStyled controls={false} precision={precision0} />
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
                      onChange={(e) => {
                        const stat = relicForm.getFieldValue('substatType1')
                        if (stat) {
                          if (stat == Constants.Stats.SPD) {
                            setPrecision1(0)
                            setHide1('none')
                            setButton1low(2)
                            setButton1mid(undefined)
                            setButton1high(3)
                            relicForm.setFieldValue('substatValue1', 0)
                            setTrueStats({ substat1: 0 })
                          } else {
                            let low = SubStatValues[stat][5].low
                            let mid = SubStatValues[stat][5].mid
                            let high = SubStatValues[stat][5].high
                            if ([Constants.Stats.HP, Constants.Stats.DEF, Constants.Stats.ATK].includes(stat)) {
                              setPrecision1(0)
                              low = Math.floor(low)
                              mid = Math.floor(mid)
                              high = Math.floor(high)
                            } else {
                              setPrecision1(1)
                              low = Math.floor(10 * low) / 10
                              mid = Math.floor(10 * mid) / 10
                              high = Math.floor(10 * high) / 10
                            }
                            setButton1low(low)
                            setButton1mid(mid)
                            setButton1high(high)
                            relicForm.setFieldValue('substatValue1', 0)
                            setTrueStats({ substat1: 0 })
                            setHide1('inline')
                          }
                        } else {
                          relicForm.setFieldValue('substatValue1', undefined)
                          setTrueStats({ substat1: 0 })
                          setButton1low(undefined)
                          setButton1mid(undefined)
                          setButton1high(undefined)
                          setHide1('inline')
                        }
                      }}
                    />
                  </Form.Item>

                  <Form.Item size="default" name="substatValue1">
                    <InputNumberStyled controls={false} precision={precision1} />
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
                      onChange={(e) => {
                        const stat = relicForm.getFieldValue('substatType2')
                        if (stat) {
                          if (stat == Constants.Stats.SPD) {
                            setPrecision2(0)
                            setHide2('none')
                            setButton2low(2)
                            setButton2mid(undefined)
                            setButton2high(3)
                            relicForm.setFieldValue('substatValue2', 0)
                            setTrueStats({ substat2: 0 })
                          } else {
                            let low = SubStatValues[stat][5].low
                            let mid = SubStatValues[stat][5].mid
                            let high = SubStatValues[stat][5].high
                            if ([Constants.Stats.HP, Constants.Stats.DEF, Constants.Stats.ATK].includes(stat)) {
                              setPrecision2(0)
                              low = Math.floor(low)
                              mid = Math.floor(mid)
                              high = Math.floor(high)
                            } else {
                              setPrecision2(1)
                              low = Math.floor(10 * low) / 10
                              mid = Math.floor(10 * mid) / 10
                              high = Math.floor(10 * high) / 10
                            }
                            setButton2low(low)
                            setButton2mid(mid)
                            setButton2high(high)
                            relicForm.setFieldValue('substatValue2', 0)
                            setTrueStats({ substat2: 0 })
                            setHide2('inline')
                          }
                        } else {
                          relicForm.setFieldValue('substatValue2', undefined)
                          setTrueStats({ substat2: 0 })
                          setButton2low(undefined)
                          setButton2mid(undefined)
                          setButton2high(undefined)
                          setHide2('inline')
                        }
                      }}
                    />
                  </Form.Item>

                  <Form.Item size="default" name="substatValue2">
                    <InputNumberStyled controls={false} precision={precision2} />
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
                      onChange={(e) => {
                        const stat = relicForm.getFieldValue('substatType3')
                        if (stat) {
                          if (stat == Constants.Stats.SPD) {
                            setPrecision3(0)
                            setHide3('none')
                            setButton3low(2)
                            setButton3mid(undefined)
                            setButton3high(3)
                            relicForm.setFieldValue('substatValue3', 0)
                            setTrueStats({ substat3: 0 })
                          } else {
                            let low = SubStatValues[stat][5].low
                            let mid = SubStatValues[stat][5].mid
                            let high = SubStatValues[stat][5].high
                            if ([Constants.Stats.HP, Constants.Stats.DEF, Constants.Stats.ATK].includes(stat)) {
                              setPrecision3(0)
                              low = Math.floor(low)
                              mid = Math.floor(mid)
                              high = Math.floor(high)
                            } else {
                              setPrecision3(1)
                              low = Math.floor(10 * low) / 10
                              mid = Math.floor(10 * mid) / 10
                              high = Math.floor(10 * high) / 10
                            }
                            setButton3low(low)
                            setButton3mid(mid)
                            setButton3high(high)
                            relicForm.setFieldValue('substatValue3', 0)
                            setTrueStats({ substat3: 0 })
                            setHide3('inline')
                          }
                        } else {
                          relicForm.setFieldValue('substatValue3', undefined)
                          setTrueStats({ substat3: 0 })
                          setButton3low(undefined)
                          setButton3mid(undefined)
                          setButton3high(undefined)
                          setHide3('inline')
                        }
                      }}
                    />
                  </Form.Item>

                  <Form.Item size="default" name="substatValue3">
                    <InputNumberStyled controls={false} precision={precision3} />
                  </Form.Item>
                </Flex>
              </Flex>
            </Col>
            <Col span={8}>
              <Flex vertical gap={5}>
                <HeaderText>Upgrade Options</HeaderText>
                <Form.Item size="default" name="substat0Upgrader">
                  <Button.Group>
                    <Space size={3}>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        onClick={upgrade0low}
                      >
                        {button0low}
                      </Button>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        disabled={hide0 == 'none'}
                        onClick={upgrade0mid}
                      >
                        {hide0 == 'none' ? '' : button0mid}
                      </Button>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        onClick={upgrade0high}
                      >
                        {button0high}
                      </Button>
                    </Space>
                  </Button.Group>
                </Form.Item>
                <Form.Item size="default" name="substat1Upgrader">
                  <Button.Group>
                    <Space size={3}>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        onClick={upgrade1low}
                      >
                        {button1low}
                      </Button>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        disabled={hide1 == 'none'}
                        onClick={upgrade1mid}
                      >
                        {hide1 == 'none' ? '' : button1mid}
                      </Button>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        onClick={upgrade1high}
                      >
                        {button1high}
                      </Button>
                    </Space>
                  </Button.Group>
                </Form.Item>
                <Form.Item size="default" name="substat2Upgrader">
                  <Button.Group>
                    <Space size={3}>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        onClick={upgrade2low}
                      >
                        {button2low}
                      </Button>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        disabled={hide2 == 'none'}
                        onClick={upgrade2mid}
                      >
                        {hide2 == 'none' ? '' : button2mid}
                      </Button>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        onClick={upgrade2high}
                      >
                        {button2high}
                      </Button>
                    </Space>
                  </Button.Group>
                </Form.Item>
                <Form.Item size="default" name="substat3Upgrader">
                  <Button.Group>
                    <Space size={3}>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        onClick={upgrade3low}
                      >
                        {button3low}
                      </Button>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        disabled={hide3 == 'none'}
                        onClick={upgrade3mid}
                      >
                        {hide3 == 'none' ? '' : button3mid}
                      </Button>
                      <Button
                        style={{ width: 50, padding: 0 }}
                        onClick={upgrade3high}
                      >
                        {button3high}
                      </Button>
                    </Space>
                  </Button.Group>
                </Form.Item>
              </Flex>
            </Col>
          </Row>
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
