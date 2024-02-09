import React, { useCallback, useMemo, useState } from "react";
import FormCard from "./FormCard.js";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Image, Select, Typography } from "antd";
import { defaultGap } from "../../lib/constantsUi.ts";
import { Utils } from "../../lib/utils.js";
import { eidolonOptions, superimpositionOptions } from "../../lib/constants.ts";
import { Assets } from "../../lib/assets.js";
import { CharacterConditionals } from "../../lib/characterConditionals.js";
import { LightConeConditionals } from "../../lib/lightConeConditionals.js";

const { Text } = Typography;

const panelWidth = 160

const rightPanelWidth = 110

const parentW = rightPanelWidth;
const parentH = 140;
const innerW = rightPanelWidth;
const innerH = 140;

const cardHeight = 450

const TeammateCard: React.FC = (props: { index: number }) => {
  const [teammateEnabled, setTeammateEnabled] = useState(false)
  const [teammateCharacterId, setTeammateCharacterId] = useState()
  const [teammateLightConeId, setTeammateLightConeId] = useState()

  const characterConditionalsContent = useMemo(() => {
    return CharacterConditionals.getDisplayForCharacter(teammateCharacterId, 0)
  }, [teammateCharacterId])

  const lightConeConditionalsContent = useMemo(() => {
    return LightConeConditionals.getDisplayLightConePassives(teammateLightConeId, 0)
  }, [teammateLightConeId])


  const characterOptions = useMemo(() => Utils.generateCharacterOptions(), []);
  const lightConeOptions = useMemo(() => Utils.generateLightConeOptions(), []);

  const characterSelectorChange = useCallback(id => {
    setTeammateCharacterId(id);
  }, [setTeammateCharacterId]);

  const lightConeSelectorChange = useCallback(id => {
    setTeammateLightConeId(id);
  }, [setTeammateLightConeId]);

  const i = props.index

  function addTeammateClicked() {
    setTeammateEnabled(true)
  }

  if (!teammateEnabled) {
    return (
      <FormCard size='medium' height={cardHeight}>
        <Flex justify='space-around' style={{paddingTop: 175}}>
          <Button
            type="text"
            shape="circle"
            icon={<PlusCircleOutlined style={{fontSize: '35px'}} />}
            onClick={addTeammateClicked}
            style={{
              width: 60,
              height: 60
            }}
          >
          </Button>
        </Flex>
      </FormCard>
    )
  }

  return (
    <FormCard size='medium' height={cardHeight}>
      <Flex vertical gap={defaultGap}>
        <Flex gap={5}>
          <Form.Item name={`teammate${i}CharacterId`}>
            <Select
              showSearch
              filterOption={Utils.labelFilterOption}
              style={{ width: 250 }}
              options={characterOptions}
              onChange={characterSelectorChange}
              placeholder='Character'
            />
          </Form.Item>

          <Form.Item name={`teammate${i}CharacterEidolon`}>
            <Select
              showSearch
              style={{ width: 110 }}
              options={eidolonOptions}
              placeholder='Eidolon'
            />
          </Form.Item>
        </Flex>

        <Flex>
          <Flex vertical style={{minWidth: 250, marginLeft: 5}}>
            {characterConditionalsContent}
          </Flex>
          <Flex>
            <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px' }}>
              <Image
                preview={false}
                width={rightPanelWidth}
                src={Assets.getCharacterAvatarById(teammateCharacterId)}
                style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)` }}
              />
            </div>
          </Flex>
        </Flex>

        <div style={{height: 10}}/>

        <Flex gap={5}>
          <Form.Item name={`teammate${i}LightConeId`}>
            <Select
              showSearch
              filterOption={Utils.labelFilterOption}
              style={{ width: 250 }}
              options={lightConeOptions}
              onChange={lightConeSelectorChange}
              placeholder='Light Cone'
            />
          </Form.Item>

          <Form.Item name={`teammate${i}LightConeSuperimposition`}>
            <Select
              showSearch
              style={{ width: 110 }}
              options={superimpositionOptions}
              placeholder='Superimposition'
            />
          </Form.Item>
        </Flex>

        <Flex>
          <Flex vertical style={{minWidth: 250, marginLeft: 5}}>
            {lightConeConditionalsContent}
          </Flex>
          <Flex>
            <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px' }}>
              <Image
                preview={false}
                width={rightPanelWidth}
                src={Assets.getLightConeIconById(teammateLightConeId)}
                style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)` }}
              />
            </div>
          </Flex>
        </Flex>
      </Flex>
    </FormCard>
  )
};

export default TeammateCard;

