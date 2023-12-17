import {Flex, Form, InputNumber, Switch, Typography} from "antd";
import React from "react";
import styled from "styled-components";
import {HeaderText} from "../components/HeaderText";

const InputNumberStyled = styled(InputNumber)`
  width: 62px
`
const Text = styled(Typography)`
  white-space: pre-line;
`

let justify = 'flex-start'
let align = 'center'
let inputWidth = 75

function FormSwitch(props) {
  return (
    <div style={{minWidth: inputWidth, display: 'block'}}>
      <Form.Item name={['characterConditionals', props.name]} valuePropName='checked'>
        <Switch/>
      </Form.Item>
    </div>
  )
}

function FormNumber(props) {
  return (
    <div style={{minWidth: inputWidth, display: 'block'}}>
      <Form.Item name={['characterConditionals', props.name]}>
        <InputNumberStyled size='small' controls={false}/>
      </Form.Item>
    </div>
  )
}

const characterOptionGetter = {
  1212: jingliu,
}

function jingliu(character) {
  let e = character.characterEidolon

  let talentCritBuff = e < 2 ? 50 : 52
  let talentAtkBuff = e < 2 ? 180 : 198


  return {
    display: ( // Jingliu
      <Flex vertical gap={10} >
        <Flex justify={justify} align={align}>
          <FormSwitch name='enhancedState' />
          <Text>{`Enhanced state`}</Text>
        </Flex>
        <Flex justify={justify} align={align}>
          <FormNumber name='talentAtkBuff' />
          <Text>{`HP drain ATK buff`}</Text>
        </Flex>
        <Flex justify={justify} align={align}>
          <FormSwitch name='e1Ult' />
          <Text>{`E1 ult active`}</Text>
        </Flex>
        <Flex justify={justify} align={align}>
          <FormSwitch name='e1Single' />
          <Text>{`E1 single target`}</Text>
        </Flex>
        <Flex justify={justify} align={align}>
          <FormSwitch name='e2Skill' />
          <Text>{`E2 skill buff`}</Text>
        </Flex>
        <Flex justify={justify} align={align}>
          <FormSwitch name='e6Buff' />
          <Text>{`E6 cdmg buff`}</Text>
        </Flex>
      </Flex>
    ),
    defaults: {
      talentEnhancedState: true,
      talentAtkBuff: talentAtkBuff,
      talentCritBuff: talentCritBuff,

    }
  }
}

export const CharacterConditionals = {
  getDisplayForCharacter: (character) => {
    console.warn('getDisplayForCharacter', character)
    let characterOptionFn = characterOptionGetter[character.id]
    if (!characterOptionFn) {
      return (<div></div>)
    }

    let characterOption = characterOptionFn(character)

    return (
      <Flex vertical gap={10}>
        <HeaderText>Character passives</HeaderText>
        {characterOption.display}
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