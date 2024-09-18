import { useEffect, useMemo, useState } from 'react'
import FormCard from 'components/optimizerTab/FormCard.js'
import { SyncOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Select, SelectProps, Typography } from 'antd'
import { Constants, eidolonOptions, SACERDOS_RELIVED_ORDEAL_1_STACK, SACERDOS_RELIVED_ORDEAL_2_STACK, Sets, superimpositionOptions } from 'lib/constants.ts'
import { Assets } from 'lib/assets.js'
import { CharacterConditionals } from 'lib/characterConditionals.js'
import { LightConeConditionals } from 'lib/lightConeConditionals.js'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import { CharacterConditionalDisplay } from 'components/optimizerTab/conditionals/CharacterConditionalDisplay.tsx'
import { LightConeConditionalDisplay } from 'components/optimizerTab/conditionals/LightConeConditionalDisplay.tsx'
import DB from 'lib/db.js'
import { Character } from 'types/Character'
import { Message } from 'lib/message.js'
import LightConeSelect from 'components/optimizerTab/optimizerForm/LightConeSelect.tsx'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect.tsx'

const { Text } = Typography

const rightPanelWidth = 110

const parentW = rightPanelWidth
const parentH = rightPanelWidth
const innerW = rightPanelWidth
const innerH = rightPanelWidth

const lcWidth = 120

const lcParentW = lcWidth
const lcParentH = lcWidth
const lcInnerW = lcWidth
const lcInnerH = lcWidth

const cardHeight = 480

const optionRender = (option) => (
  option.data.value
    ? (
      <Flex gap={10} align='center'>
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
  <Flex align='center' gap={3}>
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
    {
      value: SACERDOS_RELIVED_ORDEAL_1_STACK,
      desc: `4 Piece: ${Sets.SacerdosRelivedOrdeal} - 1 stack (+20% CD)`,
      label: labelRender(Sets.SacerdosRelivedOrdeal, '20% CD'),
    },
    {
      value: SACERDOS_RELIVED_ORDEAL_2_STACK,
      desc: `4 Piece: ${Sets.SacerdosRelivedOrdeal} - 2 stack (+40% CD)`,
      label: labelRender(Sets.SacerdosRelivedOrdeal, '40% CD'),
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
      desc: `${Sets.PenaconyLandOfTheDreams} (+10% DMG for same element)`,
      label: labelRender(Sets.PenaconyLandOfTheDreams, '10% DMG'),
    },
    {
      value: Sets.LushakaTheSunkenSeas,
      desc: `${Sets.LushakaTheSunkenSeas} (+12% ATK)`,
      label: labelRender(Sets.LushakaTheSunkenSeas, '12% ATK'),
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

const teammateRelicSets = [
  Sets.MessengerTraversingHackerspace,
  Sets.WatchmakerMasterOfDreamMachinations,
]
const teammateOrnamentSets = [
  Sets.BrokenKeel,
  Sets.FleetOfTheAgeless,
  Sets.PenaconyLandOfTheDreams,
  Sets.LushakaTheSunkenSeas,
]

// Find 4 piece relic sets and 2 piece ornament sets
function calculateTeammateSets(teammateCharacter: Character) {
  const relics = Object.values(teammateCharacter.equipped).map((id) => DB.getRelicById(id)).filter((x) => x)
  const activeTeammateSets: { teamRelicSet?: string; teamOrnamentSet?: string } = {}
  for (const set of teammateRelicSets) {
    if (relics.filter((relic) => relic.set == set).length == 4 && set != Sets.MessengerTraversingHackerspace) {
      activeTeammateSets.teamRelicSet = set
    }
  }

  for (const set of teammateOrnamentSets) {
    if (relics.filter((relic) => relic.set == set).length == 2) {
      activeTeammateSets.teamOrnamentSet = set
    }
  }

  return activeTeammateSets
}

function countTeammates() {
  const fieldsValue = window.optimizerForm.getFieldsValue()
  return [fieldsValue.teammate0, fieldsValue.teammate1, fieldsValue.teammate2].filter((teammate) => teammate?.characterId).length
}

const TeammateCard = (props: { index: number }) => {
  const teammateProperty = useMemo(() => getTeammateProperty(props.index), [props.index])
  const teammateCharacterId = Form.useWatch([teammateProperty, 'characterId'], window.optimizerForm)
  const teammateEidolon = Form.useWatch([teammateProperty, 'characterEidolon'], window.optimizerForm)

  const teammateLightConeId = Form.useWatch([teammateProperty, 'lightCone'], window.optimizerForm)
  const teammateSuperimposition = Form.useWatch([teammateProperty, 'lightConeSuperimposition'], window.optimizerForm)

  const [teammateSelectModalOpen, setTeammateSelectModalOpen] = useState(false)

  const [teammateLightConeSelectOpen, setTeammateLightConeSelectOpen] = useState(false)

  const disabled = teammateCharacterId == null

  function updateTeammate() {
    window.store.getState().setTeammateCount(countTeammates())

    if (!teammateCharacterId) {
      window.optimizerForm.setFieldValue([teammateProperty], getDefaultTeammateForm())
      return
    }

    const displayFormValues = OptimizerTabController.getDisplayFormValues(OptimizerTabController.getForm())
    const teammateValues = displayFormValues[teammateProperty]
    const teammateCharacter = DB.getCharacterById(teammateCharacterId)
    if (teammateCharacter) {
      // Fill out fields based on the teammate's form
      teammateValues.lightCone = teammateCharacter.form.lightCone
      teammateValues.lightConeSuperimposition = teammateCharacter.form.lightConeSuperimposition || 1
      teammateValues.characterEidolon = teammateCharacter.form.characterEidolon

      const activeTeammateSets = calculateTeammateSets(teammateCharacter)
      teammateValues.teamRelicSet = activeTeammateSets.teamRelicSet
      teammateValues.teamOrnamentSet = activeTeammateSets.teamOrnamentSet
    } else {
      teammateValues.lightConeSuperimposition = 1
      teammateValues.characterEidolon = 0
    }

    const characterConditionals = CharacterConditionals.get({
      characterId: teammateCharacterId,
      characterEidolon: teammateValues.characterEidolon,
      characterConditionals: {},
      lightConeSuperimposition: teammateValues.lightConeSuperimposition,
      lightConeConditionals: {},
    })

    if (!characterConditionals.teammateDefaults) return
    teammateValues.characterConditionals = Object.assign({}, characterConditionals.teammateDefaults(), teammateValues.characterConditionals)

    window.optimizerForm.setFieldValue([teammateProperty], teammateValues)
  }

  useEffect(() => {
    updateTeammate()
  }, [teammateCharacterId, props.index])

  useEffect(() => {
    if (!teammateLightConeId) return

    const displayFormValues = OptimizerTabController.getDisplayFormValues(OptimizerTabController.getForm())
    const lightConeConditionals = LightConeConditionals.get({
      lightCone: teammateLightConeId,
      lightConeSuperimposition: teammateSuperimposition,
    })

    if (!lightConeConditionals.teammateDefaults) return
    const mergedConditionals = Object.assign({}, lightConeConditionals.teammateDefaults(), displayFormValues[teammateProperty].lightConeConditionals)
    window.optimizerForm.setFieldValue([teammateProperty, 'lightConeConditionals'], mergedConditionals)
  }, [teammateLightConeId, teammateSuperimposition, props.index])

  return (
    <FormCard size='medium' height={cardHeight} style={{ overflow: 'auto' }}>
      <Flex vertical gap={5}>
        <Flex gap={5}>
          <Form.Item name={[teammateProperty, `characterId`]} style={{ flex: 1 }}>
            <CharacterSelect
              value=''
              selectStyle={{}}
              externalOpen={teammateSelectModalOpen}
              setExternalOpen={setTeammateSelectModalOpen}
            />
          </Form.Item>

          <Button
            icon={<SyncOutlined/>}
            style={{ width: 35 }}
            disabled={disabled}
            onClick={() => {
              updateTeammate()
              Message.success('Synced teammate info')
            }}
          />

          <Form.Item name={[teammateProperty, `characterEidolon`]}>
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
          <Flex vertical style={{ minWidth: 258, marginLeft: 5 }}>
            <CharacterConditionalDisplay
              id={teammateCharacterId}
              eidolon={teammateEidolon}
              teammateIndex={props.index}
            />
          </Flex>
          <Flex vertical gap={5}>
            <div style={{ width: `${rightPanelWidth}px`, height: `${rightPanelWidth}px`, borderRadius: '10px' }}>
              <img
                width={rightPanelWidth}
                height={rightPanelWidth}
                src={Assets.getCharacterAvatarById(teammateCharacterId)}
                onClick={() => setTeammateSelectModalOpen(true)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <Form.Item name={[teammateProperty, `teamRelicSet`]}>
              <Select
                className='teammate-set-select'
                style={{ width: 110 }}
                options={teammateRelicSetOptions}
                placeholder='Relics'
                allowClear
                popupMatchSelectWidth={false}
                optionLabelProp='label'
                optionRender={optionRender}
                disabled={disabled}
              />
            </Form.Item>

            <Form.Item name={[teammateProperty, `teamOrnamentSet`]}>
              <Select
                className='teammate-set-select'
                style={{ width: 110 }}
                options={teammateOrnamentSetOptions}
                placeholder='Ornaments'
                allowClear
                popupMatchSelectWidth={false}
                optionLabelProp='label'
                optionRender={optionRender}
                disabled={disabled}
              />
            </Form.Item>
          </Flex>
        </Flex>

        <div style={{ height: 1 }}/>

        <Flex gap={5}>
          <Form.Item name={[teammateProperty, `lightCone`]}>
            <LightConeSelect
              value=''
              selectStyle={{ width: 258 }}
              characterId={teammateCharacterId}
              externalOpen={teammateLightConeSelectOpen}
              setExternalOpen={setTeammateLightConeSelectOpen}
            />
          </Form.Item>

          <Form.Item name={[teammateProperty, `lightConeSuperimposition`]}>
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
          <Flex vertical style={{ minWidth: 258, marginLeft: 5 }}>
            <LightConeConditionalDisplay
              id={teammateLightConeId}
              superImposition={teammateSuperimposition}
              teammateIndex={props.index}
            />
          </Flex>
          <Flex>
            <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px' }}>
              <img
                width={lcWidth}
                src={Assets.getLightConeIconById(teammateLightConeId)}
                style={{
                  marginLeft: -5,
                  transform: `translate(${(lcInnerW - lcParentW) / 2 / lcInnerW * -100}%, ${(lcInnerH - lcParentH) / 2 / lcInnerH * -100}%)`,
                  cursor: 'pointer',
                }}
                onClick={() => setTeammateLightConeSelectOpen(true)}
              />
            </div>
          </Flex>
        </Flex>
      </Flex>
    </FormCard>
  )
}

export default TeammateCard
