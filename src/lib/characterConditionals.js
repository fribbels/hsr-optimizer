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

function jingliu(e) {
  let talentCritBuff = talent(e, 0.50, 0.52)
  let talentHpDrainAtkBuff = talent(e, 1.80, 1.98)

  let basicMulti = talent(e, 1.0, 1.1)
  let skillMulti = skill(e, 2.0, 2.2)
  let skillMultiEnhanced = skill(e, 2.5, 2.75)
  let ultMulti = ult(e, 3.0, 3.24)

  return {
    display: () => ( // Jingliu
      <Flex vertical gap={10} >
        <FormSwitch name='talentEnhancedState' text='Enhanced state'/>
        <FormSlider name='talentHpDrainAtkBuff' switchName='talentHpDrainAtkBuffEnabled' text='HP drain ATK buff' min={0} max={talentHpDrainAtkBuff} />
        <FormSwitch name='e1CdBuff' text='E1 ult active' />
        <FormSwitch name='e2SkillDmgBuff' text='E2 skill buff' />
      </Flex>
    ),
    defaults: () => ({
      talentEnhancedState: true,
      talentHpDrainAtkBuffEnabled: true,
      talentHpDrainAtkBuff: talentHpDrainAtkBuff,
      e1CdBuff: true,
      e2SkillDmgBuff: true,
    }),
    buffCalculator: (c, request) => {
      let x = c.x; let sets = c.sets; let conditionals = request.characterConditionals


      x[Stats.CR]    += (conditionals.talentEnhancedState) ? talentCritBuff : 0
      x[Stats.ATK_P] += (conditionals.talentEnhancedState && conditionals.talentHpDrainAtkBuffEnabled) ? talentHpDrainAtkBuff : 0
      x[Stats.CD]    += (e >= 1 && conditionals.e1CdBuff) ? 0.24 : 0
    },
    damageCalculator: (c, request) => {
      let x = c.x; let sets = c.sets; let conditionals = request.characterConditionals

      c.BASIC = 100 * (1 + 0 + 0.10*p4(sets.MusketeerOfWildWheat)   + 0.20*(x[Stats.CR] >= 0.70 ? 1 : 0)*p2(sets.RutilantArena))
      c.SKILL = 100 * (1 + 0 + 0.12*p4(sets.FiresmithOfLavaForging) + 0.20*(x[Stats.CR] >= 0.70 ? 1 : 0)*p2(sets.RutilantArena))
      c.ULT =   100 * (1 + 0 + 0.15*(x[Stats.CR] >= 0.50 ? 1 : 0)*p2(c.sets.InertSalsotto))
      c.FUA =   100 * (1 + 0 + 0.15*(x[Stats.CR] >= 0.50 ? 1 : 0)*p2(c.sets.InertSalsotto))
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