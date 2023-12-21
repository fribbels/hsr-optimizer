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
let numberWidth = 65
let sliderWidth = 140

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
  const [inputValue, setInputValue] = useState(1);
  const onChange = (newValue) => {
    setInputValue(newValue);
  };

  let multiplier = (props.percent ? 100 : 1)
  let step = props.percent ? 0.01 : 1
  let symbol = props.percent ? '%' : ''

  return (
    <Flex vertical gap={5} style={{marginBottom: 0}}>
      <Flex justify={justify} align={align}>
        <div style={{minWidth: inputWidth, display: 'block'}}>
          <Form.Item name={['characterConditionals', props.name]}>
            <InputNumber
              min={props.min}
              max={props.max}
              controls={false}
              size='small'
              style={{
                width: numberWidth,
              }}
              parser={(value) => value == null || value == '' ? 0 : precisionRound(value / multiplier) }
              formatter={(value) => `${precisionRound(value * multiplier)}`}
              addonAfter={symbol}
              onChange={onChange}
            />
          </Form.Item>
        </div>
        <Text>{props.text}</Text>
      </Flex>
      <Flex align='center' justify='flex-start' gap={10}>
        <Form.Item name={['characterConditionals', props.name]}>
          <Slider
            min={props.min}
            max={props.max}
            step={step}
            value={typeof inputValue === 'number' ? inputValue : 0}
            style={{
              minWidth: sliderWidth,
              marginTop: 0,
              marginBottom: 0,
              marginLeft: 1
            }}
            tooltip={{
              formatter: (value) => `${precisionRound(value * multiplier)}${symbol}`
            }}
            onChange={onChange}
          />
        </Form.Item>
        <Text style={{minWidth: 20, marginBottom: 2, textAlign: 'center'}}>{`${precisionRound(props.max * multiplier)}${symbol}`}</Text>
      </Flex>
    </Flex>
  )
}

function precisionRound(number, precision = 8) {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

const characterOptionMapping = {
  1212: jingliu,
  1302: argenti, // verify ult dmg
  1008: arlan,
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

  ELEMENTAL_DMG: 0,
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

  BASIC_DEF_PEN: 0,
  SKILL_DEF_PEN: 0,
  ULT_DEF_PEN: 0,
  FUA_DEF_PEN: 0,
}


function arlan(e) {
  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.40, 2.64)
  let ultScaling = ult(e, 3.20, 3.456)

  let talentMissingHpDmgBoostMax = talent(e, 0.72, 0.792)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSlider name='selfCurrentHpPercent' text='Self current HP%' min={0.01} max={1.0} percent />
      </Flex>
    ),
    defaults: () => ({
      selfCurrentHpPercent: 1.00,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x.ELEMENTAL_DMG += Math.min(talentMissingHpDmgBoostMax, 1 - r.selfCurrentHpPercent)

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.SKILL_BOOST += (e >= 1 && r.selfCurrentHpPercent <= 0.50) ? 0.10 : 0
      x.ULT_BOOST += (e >= 6 && r.selfCurrentHpPercent <= 0.50) ? 0.20 : 0

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

function argenti(e) {
  let talentMaxStacks = (e >= 4) ? 12 : 10

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 1.20, 1.32)
  let ultScaling = ult(e, 1.60, 1.728)
  let ultEnhancedScaling = ult(e, 2.80, 3.024)
  let ultEnhancedExtraHitScaling = ult(e, 0.95, 1.026)
  let talentCrStackValue = talent(e, 0.025, 0.028)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='ultEnhanced' text='Enhanced ult'/>
        <FormSlider name='talentStacks' text='Talent stacks' min={0} max={talentMaxStacks} />
        <FormSlider name='ultEnhancedExtraHits' text='Ult extra hits' min={0} max={6} />
        <FormSwitch name='e2UltAtkBuff' text='E2 ult ATK buff'/>
      </Flex>
    ),
    defaults: () => ({
      ultEnhanced: true,
      talentStacks: talentMaxStacks,
      ultEnhancedExtraHits: 6,
      e2UltAtkBuff: true
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Skills
      x[Stats.CR] += (r.talentStacks) * talentCrStackValue

      // Traces

      // Eidolons
      x[Stats.CD] += (e >= 1) ? (r.talentStacks) * 0.04 : 0
      x[Stats.ATK_P] += (e >= 2 && r.e2UltAtkBuff) ? 0.40 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += (r.ultEnhanced) ? ultEnhancedScaling : ultScaling
      x.ULT_SCALING += (r.ultEnhancedExtraHits) * ultEnhancedExtraHitScaling

      // BOOST
      x.ULT_BOOST += (request.enemyHpPercent <= 0.5) ? 0.15 : 0
      x.ULT_DEF_PEN += (e >= 6) ? 0.30 : 0

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

function jingliu(e) {
  let talentCrBuff = talent(e, 0.50, 0.52)
  let talentHpDrainAtkBuffMax = talent(e, 1.80, 1.98)

  let basicScaling = basic(e, 1.00, 1.10)
  let skillScaling = skill(e, 2.00, 2.20)
  let skillEnhancedScaling = skill(e, 2.50, 2.75)
  let ultScaling = ult(e, 3.00, 3.24)

  return {
    display: () => (
      <Flex vertical gap={10} >
        <FormSwitch name='talentEnhancedState' text='Enhanced state'/>
        <FormSlider name='talentHpDrainAtkBuff' text='HP drain ATK buff' min={0} max={talentHpDrainAtkBuffMax} percent />
        <FormSwitch name='e1CdBuff' text='E1 ult active' />
        <FormSwitch name='e2SkillDmgBuff' text='E2 skill buff' />
      </Flex>
    ),
    defaults: () => ({
      talentEnhancedState: true,
      talentHpDrainAtkBuff: talentHpDrainAtkBuffMax,
      e1CdBuff: true,
      e2SkillDmgBuff: true,
    }),
    precomputeEffects: (request) => {
      let r = request.characterConditionals
      let x = Object.assign({}, baseComputedStatsObject)

      // Skills
      x[Stats.CR]    += (r.talentEnhancedState) ? talentCrBuff : 0
      x[Stats.ATK_P] += (r.talentEnhancedState) ? r.talentHpDrainAtkBuff : 0

      // Traces
      x[Stats.RES]   += (r.talentEnhancedState) ? 0.35 : 0
      x.ULT_BOOST    += (r.talentEnhancedState) ? 0.20 : 0

      // Eidolons
      x[Stats.CD]    += (e >= 1 && r.e1CdBuff) ? 0.24 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling

      x.SKILL_SCALING += (r.talentEnhancedState) ? skillEnhancedScaling : skillScaling
      x.SKILL_SCALING += (e >= 1 && r.talentEnhancedState && request.enemyCount == 1) ? 1 : 0

      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 1 && request.enemyCount == 1) ? 1 : 0

      x.FUA_SCALING += 0

      // BOOST
      x.SKILL_BOOST += (e >= 2 && r.talentEnhancedState && r.e2SkillDmgBuff) ? 0.80 : 0

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

function skill(e, value1, value2) {
  return e >= 3 ? value2 : value1
}

let talent = skill

function ult(e, value1, value2) {
  return e >= 5 ? value2 : value1
}
let basic = ult

function p4(set) {
  return set >> 2
}

function p2(set) {
  return Math.min(1, set >> 1)
}

export const CharacterConditionals = {
  get: (request) => {
    let characterFn = characterOptionMapping[request.characterId]
    return characterFn(request.characterEidolon)
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