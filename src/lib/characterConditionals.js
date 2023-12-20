import {Flex, Form, InputNumber, Slider, Switch, Typography} from "antd";
import React, {useState} from "react";
import styled from "styled-components";
import {HeaderText} from "../components/HeaderText";
import { Constants } from './constants'
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";

let Stats = Constants.Stats
const InputNumberStyled = styled(InputNumber)`
  width: 62px
`
const Text = styled(Typography)`
  white-space: pre-line;
`

let justify = 'flex-start'
let align = 'center'
let inputWidth = 75
let numberWidth = 60
let sliderWidth = 110

function FormSwitch(props) {
  return (
    <Flex justify={justify} align={align}>
      <div style={{minWidth: inputWidth, display: 'block'}}>
        <Form.Item name={['characterConditionals', props.name]} valuePropName='checked'>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
        </Form.Item>
      </div>
      <Text>{props.text}</Text>
    </Flex>
  )
}

function FormNumberPercent(props) {
  return (
    <div style={{minWidth: inputWidth, display: 'block'}}>
      <Form.Item name={['characterConditionals', props.name]}>
        <InputNumberStyled
          size='small'
          controls={false}
          formatter={(value) => `${value}%`}
          parser={(value) => value.replace('%', '')}
        />
      </Form.Item>
    </div>
  )
}

function FormSlider(props) {
  const [disabled, setDisabled] = useState(false);
  const onChange = (checked) => {
    setDisabled(!checked);
  };

  return (
    <Flex vertical gap={10} style={{marginBottom: 5}}>
      <Flex justify={justify} align={align}>
        <div style={{minWidth: inputWidth, display: 'block'}}>
          <Form.Item name={['characterConditionals', props.switchName]} valuePropName='checked'>
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              checked={!disabled}
              onChange={onChange}
            />
          </Form.Item>
        </div>
        <Text>{props.text}</Text>
      </Flex>
      <Flex align='center' justify='space-between' style={{height: 10}}>
        <Text>{`${props.min * 100}%`}</Text>
        <Form.Item name={['characterConditionals', props.name]}>
          <Slider
            min={props.min}
            max={props.max}
            step={0.01}
            tooltip={{
              formatter: (value) => `${Math.round(value * 100)}%`
            }}
            disabled={disabled}
            style={{
              width: sliderWidth
            }}
          />
        </Form.Item>
        <Text>{`${props.max * 100}%`}</Text>
      </Flex>
    </Flex>
  )
}

const characterOptionMapping = {
  1212: jingliu,
}

// TODO profile & convert to array for performance?
const baseComputedStatsObject = {
  [Stats.HP_P]: 0,
  [Stats.ATK_P]: 0,
  [Stats.DEF_P]: 0,
  [Stats.SPD_P]: 0,
  [Stats.HP]: 0,
  [Stats.ATK]: 0,
  [Stats.DEF]: 0,
  [Stats.SPD]: 0,
  [Stats.CD]: 0,
  [Stats.CR]: 0,
  [Stats.EHR]: 0,
  [Stats.RES]: 0,
  [Stats.BE]: 0,
  [Stats.ERR]: 0,
  [Stats.OHB]: 0,

  DEF_SHRED: 0,
  DMG_TAKEN_MULTI: 0,
  ALL_DMG_MULTI: 0,
  RES_PEN: 0,
  DMG_RED_MULTI: 0,

  BASIC_SCALING: 0,
  SKILL_SCALING: 0,
  ULT_SCALING: 0,
  FUA_SCALING: 0,

  BASIC_BOOST: 0,
  SKILL_BOOST: 0,
  ULT_BOOST: 0,
  FUA_BOOST: 0,

  BASIC_DMG: 0,
  SKILL_DMG: 0,
  ULT_DMG: 0,
  FUA_DMG: 0,
}

function jingliu(e) {
  let talentCrBuff = talent(e, 0.50, 0.52)
  let talentHpDrainAtkBuffMax = talent(e, 1.80, 1.98)

  let basicScaling = talent(e, 1.0, 1.1)
  let skillScaling = skill(e, 2.0, 2.2)
  let skillEnhancedScaling = skill(e, 2.5, 2.75)
  let ultScaling = ult(e, 3.0, 3.24)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='talentEnhancedState' text='Enhanced state'/>
        <FormSlider name='talentHpDrainAtkBuff' switchName='talentHpDrainAtkBuffEnabled' text='HP drain ATK buff' min={0} max={talentHpDrainAtkBuffMax} />
        <FormSwitch name='e1CdBuff' text='E1 ult active' />
        <FormSwitch name='e2SkillDmgBuff' text='E2 skill buff' />
      </Flex>
    ),
    defaults: () => ({
      talentEnhancedState: true,
      talentHpDrainAtkBuffEnabled: true,
      talentHpDrainAtkBuff: talentHpDrainAtkBuffMax,
      e1CdBuff: true,
      e2SkillDmgBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Skills
      x[Stats.CR]    += (r.talentEnhancedState) ? talentCrBuff : 0
      x[Stats.ATK_P] += (r.talentEnhancedState && r.talentHpDrainAtkBuffEnabled) ? r.talentHpDrainAtkBuff : 0

      // Traces
      x[Stats.RES]   += (r.talentEnhancedState) ? 0.35 : 0
      x.ULT_BOOST    += (r.talentEnhancedState) ? 0.20 : 0

      // Eidolons
      x[Stats.CD]    += (e >= 1 && e1CdBuff) ? 0.24 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling

      x.SKILL_SCALING += (r.talentEnhancedState) ? skillEnhancedScaling : skillScaling
      x.SKILL_SCALING += (e >= 1 && r.talentEnhancedState && request.enemyCount == 1) ? 1 : 0

      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 1 && request.enemyCount == 1) ? 1 : 0

      x.FUA_SCALING += 0

      // BOOST
      x.SKILL_BOOST += (r.talentEnhancedState && r.e2SkillDmgBuff) ? 0.80 : 0

      return x
    },
    calculatePassives: (c, request) => {

    },
    calculateBaseMultis: (c, request) => {
      let x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += 0
    }
  }
}

function basic(e, value1, value2) {
  return e >= 5 ? value2 : value1
}

let skill = basic

function ult(e, value1, value2) {
  return e >= 2 ? value2 : value1
}
let talent = ult

function p4(set) {
  return set >> 2
}

function p2(set) {
  return Math.min(1, set >> 1)
}

export const CharacterConditionals = {
  get: (request) => {
    let characterFn = characterOptionMapping[request.characterId]
    return characterFn(request)
  },
  getDisplayForCharacter: (id, eidolon) => {
    console.warn('getDisplayForCharacter', id)
    if (!id) {
      return (<div></div>)
    }

    let characterFn = characterOptionMapping[id]
    let display = characterFn(eidolon).display()

    return (
      <Flex vertical gap={10}>
        <HeaderText>Character passives</HeaderText>
        {display}
      </Flex>
    )
    // 	enhanced skill
    // 	crit rate%
    // 	atk bonus
    // 	utl dmg%
    // 	crit dmg%,
    // 	additional dmg vs 1
    // 	enhanced skill
    // 	dmg%
    // 	atk bonus
    // 	crit dmg%

    // toggle: Spectral Transmigration -> CR + 50% + 35% RES + Ult 20%
    // number: hp drain: 180% atk
    // toggle E1 -> 24% CD
    // toggle E1 single target -> 100% ATK
    // toggle E2 -> skill +80%
    // toggle E6 -> 50% CD

    // After using Ultimate, increases the DMG of the next Enhanced Skill by 80%.


  },
}