import { useEffect, useMemo, useState } from 'react'
import FormCard from 'components/optimizerTab/FormCard.js'
import { PlusCircleOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Image, Select, SelectProps, Typography } from 'antd'
import { defaultGap } from 'lib/constantsUi.ts'
import { Utils } from 'lib/utils.js'
import { Constants, eidolonOptions, Sets, superimpositionOptions } from 'lib/constants.ts'
import { Assets } from 'lib/assets.js'
import { CharacterConditionals } from 'lib/characterConditionals.js'
import { LightConeConditionals } from 'lib/lightConeConditionals.js'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import { CharacterConditionalDisplay } from 'components/optimizerForm/conditionals/CharacterConditionalDisplay.tsx'
import { LightConeConditionalDisplay } from 'components/optimizerForm/conditionals/LightConeConditionalDisplay.tsx'

const { Text } = Typography

const rightPanelWidth = 110

const parentW = rightPanelWidth
const parentH = rightPanelWidth
const innerW = rightPanelWidth
const innerH = rightPanelWidth

const cardHeight = 480

const optionRender = (option) => (
  option.data.value
    ? (
      <Flex gap={10} align="center">
        <Flex>
          <img src={Assets.getSetImage(option.data.value, Constants.Parts.PlanarSphere)} style={{ width: 26, height: 26 }}></img>
        </Flex>
        {option.data.desc}
      </Flex>
    )
    : (
      <Text>
        None
      </Text>
    )
)

const labelRender = (set: string, text: string) => (
  <Flex align="center" gap={3}>
    <img src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)} style={{ width: 20, height: 20 }}></img>
    <Text style={{ fontSize: 12 }}>
      {text}
    </Text>
  </Flex>
)

const teammateRelicSetOptions: SelectProps['options'] = (() => {
  return [
    {
      value: Sets.MessengerTraversingHackerspace,
      desc: `4 Piece: ${Sets.MessengerTraversingHackerspace} (+12% SPD)`,
      label: labelRender(Sets.MessengerTraversingHackerspace, '12% SPD'),
    },
    {
      value: Sets.WatchmakerMasterOfDreamMachinations,
      desc: `4 Piece: ${Sets.WatchmakerMasterOfDreamMachinations} (+30% BE)`,
      label: labelRender(Sets.WatchmakerMasterOfDreamMachinations, '30% BE'),
    },
  ]
})()
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
})()

function getTeammateProperty(index: number) {
  return `teammate${index}`
}

function getDefaultTeammateForm() {
  return {
    characterEidolon: 0,
    characterConditionals: {},
    lightConeSuperimposition: 1,
    lightConeConditionals: {},
  }
}

const TeammateCard = (props: { index: number }) => {
  const teammateProperty = useMemo(() => getTeammateProperty(props.index), [props.index])
  const teammateCharacterId = Form.useWatch([teammateProperty, 'characterId'], window.optimizerForm)
  const teammateEidolon = Form.useWatch([teammateProperty, 'characterEidolon'], window.optimizerForm)

  const teammateLightConeId = Form.useWatch([teammateProperty, 'lightCone'], window.optimizerForm)
  const teammateSuperimposition = Form.useWatch([teammateProperty, 'lightConeSuperimposition'], window.optimizerForm)

  const [teammateEnabled, setTeammateEnabled] = useState(true)

  const disabled = teammateCharacterId == null

  const characterOptions = useMemo(() => Utils.generateCharacterOptions(), [])
  const lightConeOptions = useMemo(() => Utils.generateLightConeOptions(), [])

  useEffect(() => {
    if (!teammateCharacterId) {
      window.optimizerForm.setFieldValue([teammateProperty], getDefaultTeammateForm())
      return
    }

    const displayFormValues = OptimizerTabController.getDisplayFormValues(OptimizerTabController.getForm())
    const characterConditionals = CharacterConditionals.get({
      characterId: teammateCharacterId,
      characterEidolon: teammateEidolon,
      characterConditionals: {},
      lightConeSuperimposition: 1,
      lightConeConditionals: {},
    })

    console.log('Teammate character conditionals', characterConditionals)

    if (!characterConditionals.teammateDefaults) return
    const mergedForm = Object.assign({}, characterConditionals.teammateDefaults(), displayFormValues[teammateProperty].characterConditionals)
    window.optimizerForm.setFieldValue([teammateProperty, 'characterConditionals'], mergedForm)
  }, [teammateCharacterId, teammateEidolon, props.index])

  useEffect(() => {
    if (!teammateLightConeId) return

    const displayFormValues = OptimizerTabController.getDisplayFormValues(OptimizerTabController.getForm())
    const lightConeConditionals = LightConeConditionals.get({
      lightCone: teammateLightConeId,
      lightConeSuperimposition: teammateSuperimposition,
    })

    console.log('Teammate lc conditionals', lightConeConditionals)

    if (!lightConeConditionals.teammateDefaults) return
    const mergedForm = Object.assign({}, lightConeConditionals.teammateDefaults(), displayFormValues[teammateProperty].lightConeConditionals)
    window.optimizerForm.setFieldValue([teammateProperty, 'lightConeConditionals'], mergedForm)
  }, [teammateLightConeId, teammateSuperimposition, props.index])

  function addTeammateClicked() {
    setTeammateEnabled(true)
  }

  if (!teammateEnabled) {
    return (
      <FormCard size="medium" height={cardHeight}>
        <Flex justify="space-around" style={{ paddingTop: 175 }}>
          <Button
            type="text"
            shape="circle"
            icon={<PlusCircleOutlined style={{ fontSize: '35px' }} />}
            onClick={addTeammateClicked}
            style={{
              width: 60,
              height: 60,
            }}
          >
          </Button>
        </Flex>
      </FormCard>
    )
  }

  return (
    <FormCard size="medium" height={cardHeight} style={{ overflow: 'auto' }}>
      <Flex vertical gap={defaultGap}>
        <Flex gap={5}>
          <Form.Item name={[teammateProperty, `characterId`]}>
            <Select
              showSearch
              filterOption={Utils.labelFilterOption}
              style={{ width: 250 }}
              options={characterOptions}
              placeholder="Character"
              allowClear
            />
          </Form.Item>

          <Form.Item name={[teammateProperty, `characterEidolon`]}>
            <Select
              showSearch
              style={{ width: 110 }}
              options={eidolonOptions}
              placeholder="Eidolon"
              disabled={disabled}
            />
          </Form.Item>
        </Flex>

        <Flex>
          <Flex vertical style={{ minWidth: 250, marginLeft: 5 }}>
            <CharacterConditionalDisplay
              id={teammateCharacterId}
              eidolon={teammateEidolon}
              teammateIndex={props.index}
            />
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

            <Form.Item name={[teammateProperty, `teamRelicSet`]}>
              <Select
                className="teammate-set-select"
                style={{ width: 110 }}
                options={teammateRelicSetOptions}
                placeholder="Relics"
                allowClear
                popupMatchSelectWidth={false}
                optionLabelProp="label"
                optionRender={optionRender}
                disabled={disabled}
              />
            </Form.Item>

            <Form.Item name={[teammateProperty, `teamOrnamentSet`]}>
              <Select
                className="teammate-set-select"
                style={{ width: 110 }}
                options={teammateOrnamentSetOptions}
                placeholder="Ornaments"
                allowClear
                popupMatchSelectWidth={false}
                optionLabelProp="label"
                optionRender={optionRender}
                disabled={disabled}
              />
            </Form.Item>
          </Flex>
        </Flex>

        <div style={{ height: 5 }} />

        <Flex gap={5}>
          <Form.Item name={[teammateProperty, `lightCone`]}>
            <Select
              showSearch
              filterOption={Utils.labelFilterOption}
              style={{ width: 250 }}
              options={lightConeOptions}
              placeholder="Light Cone"
              disabled={disabled}
            />
          </Form.Item>

          <Form.Item name={[teammateProperty, `lightConeSuperimposition`]}>
            <Select
              showSearch
              style={{ width: 110 }}
              options={superimpositionOptions}
              placeholder="Superimposition"
              disabled={disabled}
            />
          </Form.Item>
        </Flex>

        <Flex>
          <Flex vertical style={{ minWidth: 250, marginLeft: 5 }}>
            <LightConeConditionalDisplay
              id={teammateLightConeId}
              superImposition={teammateSuperimposition}
              teammateIndex={props.index}
            />
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
}

export default TeammateCard
