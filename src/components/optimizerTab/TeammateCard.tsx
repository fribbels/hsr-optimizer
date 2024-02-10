import React, { useEffect, useMemo, useState } from "react";
import FormCard from "./FormCard.js";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Image, Select, Typography } from "antd";
import { defaultGap } from "../../lib/constantsUi.ts";
import { Utils } from "../../lib/utils.js";
import { Constants, eidolonOptions, Sets, superimpositionOptions } from "../../lib/constants.ts";
import { Assets } from "../../lib/assets.js";
import { CharacterConditionals } from "../../lib/characterConditionals.js";
import { LightConeConditionals } from "../../lib/lightConeConditionals.js";
import { OptimizerTabController } from "../../lib/optimizerTabController.js";

const { Text } = Typography;

const panelWidth = 160

const rightPanelWidth = 110

const parentW = rightPanelWidth;
const parentH = rightPanelWidth;
const innerW = rightPanelWidth;
const innerH = rightPanelWidth;

const cardHeight = 450

const optionRender = (option) => (
  option.data.value
  ?
  <Flex gap={10} align='center'>
    <Flex>
      <img src={Assets.getSetImage(option.data.value, Constants.Parts.PlanarSphere)} style={{ width: 26, height: 26 }}></img>
    </Flex>
    {option.data.desc}
  </Flex>
  :
  <Text>
    None
  </Text>
)

const labelRender = (set, text) => (
  <Flex align='center' gap={3}>
    <img src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)} style={{ width: 20, height: 20, }}></img>
    <Text style={{fontSize: 12}}>
      {text}
    </Text>
  </Flex>
)

const teammateRelicSetOptions = (() => {
  return [
    {
      value: Sets.MessengerTraversingHackerspace,
      desc: `${Sets.MessengerTraversingHackerspace} (+12% SPD)`,
      label: labelRender(Sets.MessengerTraversingHackerspace, '12% SPD'),
    },
    {
      value: Sets.WatchmakerMasterOfDreamMachinations,
      desc: `${Sets.WatchmakerMasterOfDreamMachinations} (+30% BE)`,
      label: labelRender(Sets.WatchmakerMasterOfDreamMachinations, '30% BE'),
    },
  ]
})();
const teammateOrnamentSetOptions = (() => {
  return [
    {
      value: Sets.BrokenKeel,
      desc: `${Sets.BrokenKeel} (+10% CD)`,
      label: labelRender(Sets.BrokenKeel, '10% CD'),
    },
    {
      value: Sets.FleetOfTheAgeless,
      desc: `${Sets.FleetOfTheAgeless} (+8% ATK)`,
      label: labelRender(Sets.FleetOfTheAgeless, '8% ATK'),
    },
    {
      value: Sets.PenaconyLandOfTheDreams,
      desc: `${Sets.PenaconyLandOfTheDreams} (+10% DMG)`,
      label: labelRender(Sets.PenaconyLandOfTheDreams, '10% DMG'),
    },
  ]
})();

function teammateProperty(index: number) {
  return `teammate${index}`
}

const TeammateCard: React.FC = (props: { index: number }) => {
  const teammateCharacterId = Form.useWatch([teammateProperty(props.index), 'characterId'], global.optimizerForm);
  const teammateEidolon = Form.useWatch([teammateProperty(props.index), 'characterEidolon'], global.optimizerForm);

  const teammateLightConeId = Form.useWatch([teammateProperty(props.index), 'lightCone'], global.optimizerForm);
  const teammateSuperimposition = Form.useWatch([teammateProperty(props.index), 'lightConeSuperimposition'], global.optimizerForm);

  const [teammateEnabled, setTeammateEnabled] = useState(true)

  const disabled = teammateCharacterId == null

  const characterConditionalsContent = useMemo(() => {
    return CharacterConditionals.getDisplayForCharacter(teammateCharacterId, teammateEidolon, props.index)
  }, [teammateCharacterId, teammateEidolon])

  const lightConeConditionalsContent = useMemo(() => {
    return LightConeConditionals.getDisplayLightConePassives(teammateLightConeId, teammateSuperimposition, props.index)
  }, [teammateLightConeId, teammateSuperimposition])

  const characterOptions = useMemo(() => Utils.generateCharacterOptions(), []);
  const lightConeOptions = useMemo(() => Utils.generateLightConeOptions(), []);

  useEffect(() => {
    if (!teammateCharacterId) return
    console.log('!!!!!!!!!!!!!!!', teammateCharacterId, teammateEidolon)

    const displayFormValues = OptimizerTabController.getDisplayFormValues(OptimizerTabController.getForm())

    const characterConditionals = CharacterConditionals.get({
      characterId: teammateCharacterId,
      characterEidolon: teammateEidolon
    })
    console.log('!!!!!!!!!!!!!!!', characterConditionals)

    if (!characterConditionals.teammateDefaults) return
    displayFormValues[`teammate${props.index}`].characterConditionals = characterConditionals.teammateDefaults()
    global.optimizerForm.setFieldsValue(displayFormValues)
  }, [teammateCharacterId, teammateEidolon])

  useEffect(() => {
    if (!teammateLightConeId) return
    console.log('!!!!!!!!!!!!!!!', teammateLightConeId, teammateSuperimposition)

    const displayFormValues = OptimizerTabController.getDisplayFormValues(OptimizerTabController.getForm())

    const lightConeConditionals = LightConeConditionals.get({
      lightCone: teammateLightConeId,
      lightConeSuperimposition: teammateSuperimposition
    })
    console.log('!!!!!!!!!!!!!!!', lightConeConditionals)

    if (!lightConeConditionals.teammateDefaults) return
    displayFormValues[`teammate${props.index}`].lightConeConditionals = lightConeConditionals.teammateDefaults()
    console.log('???', displayFormValues)
    global.optimizerForm.setFieldsValue(displayFormValues)
  }, [teammateLightConeId, teammateSuperimposition])

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
    <FormCard size='medium' height={cardHeight} style={{overflow: 'auto'}}>
      <Flex vertical gap={defaultGap}>
        <Flex gap={5}>
          <Form.Item name={[`teammate${i}`, `characterId`]}>
            <Select
              showSearch
              filterOption={Utils.labelFilterOption}
              style={{ width: 250 }}
              options={characterOptions}
              placeholder='Character'
            />
          </Form.Item>

          <Form.Item name={[`teammate${i}`, `characterEidolon`]}>
            <Select
              showSearch
              style={{ width: 110 }}
              options={eidolonOptions}
              placeholder='Eidolon'
              disabled={disabled}
            />
          </Form.Item>
        </Flex>

        <Flex>
          <Flex vertical style={{minWidth: 250, marginLeft: 5}}>
            {characterConditionalsContent}
          </Flex>
          <Flex vertical gap={5}>
            <div style={{ width: `${rightPanelWidth}px`, height: `${rightPanelWidth}px`, borderRadius: '10px' }}>
              <Image
                preview={false}
                width={rightPanelWidth}
                height={rightPanelWidth}
                src={Assets.getCharacterAvatarById(teammateCharacterId)}
                // style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)` }}
              />
            </div>

            <Form.Item name={[`teammate${i}`, `relicSet`]}>
              <Select
                className='teammate-set-select'
                style={{ width: 110 }}
                options={teammateRelicSetOptions}
                placeholder='Relics'
                allowClear
                popupMatchSelectWidth={false}
                optionLabelProp="label"
                optionRender={optionRender}
                disabled={disabled}
              />
            </Form.Item>

            <Form.Item name={[`teammate${i}`, `ornamentSet`]}>
              <Select
                className='teammate-set-select'
                style={{ width: 110 }}
                options={teammateOrnamentSetOptions}
                placeholder='Ornaments'
                allowClear
                popupMatchSelectWidth={false}
                optionLabelProp="label"
                optionRender={optionRender}
                disabled={disabled}
              />
            </Form.Item>
          </Flex>
        </Flex>

        <div style={{height: 15}}/>

        <Flex gap={5}>
          <Form.Item name={[`teammate${i}`, `lightCone`]}>
            <Select
              showSearch
              filterOption={Utils.labelFilterOption}
              style={{ width: 250 }}
              options={lightConeOptions}
              placeholder='Light Cone'
              disabled={disabled}
            />
          </Form.Item>

          <Form.Item name={[`teammate${i}`, `lightConeSuperimposition`]}>
            <Select
              showSearch
              style={{ width: 110 }}
              options={superimpositionOptions}
              placeholder='Superimposition'
              disabled={disabled}
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

