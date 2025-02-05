import { SyncOutlined } from '@ant-design/icons'
import { Button, Flex, Form as AntDForm, Select, Typography } from 'antd'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Constants, SACERDOS_RELIVED_ORDEAL_1_STACK, SACERDOS_RELIVED_ORDEAL_2_STACK, Sets } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import { CharacterConditionalsDisplay } from 'lib/tabs/tabOptimizer/conditionals/CharacterConditionalsDisplay'
import { LightConeConditionalDisplay } from 'lib/tabs/tabOptimizer/conditionals/LightConeConditionalDisplay'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import LightConeSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import FormCard from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { ReactElement } from 'types/components'
import { Form, TeammateProperty } from 'types/form'

const { Text } = Typography

const rightPanelWidth = 110

const parentW = rightPanelWidth
const parentH = rightPanelWidth

const lcWidth = 120

const lcParentW = lcWidth
const lcParentH = lcWidth
const lcInnerW = lcWidth
const lcInnerH = lcWidth

const cardHeight = 480

const optionRender = (option: {
  data: {
    value: string
    desc: string
  }
}) => (
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

function getTeammateProperty(index: number) {
  return `teammate${index}` as TeammateProperty
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
  const activeTeammateSets: {
    teamRelicSet?: string
    teamOrnamentSet?: string
  } = {}
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
  const fieldsValue = window.optimizerForm.getFieldsValue() as Form
  return [fieldsValue.teammate0, fieldsValue.teammate1, fieldsValue.teammate2].filter((teammate) => teammate?.characterId).length
}

type OptionRender = {
  value: string
  desc: string
  label: ReactElement
}

const TeammateCard = (props: {
  index: number
}) => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateCard' })
  const teammateProperty = useMemo(() => getTeammateProperty(props.index), [props.index])
  const teammateCharacterId: string = AntDForm.useWatch([teammateProperty, 'characterId'], window.optimizerForm)
  const teammateEidolon: number = AntDForm.useWatch([teammateProperty, 'characterEidolon'], window.optimizerForm)

  const teammateLightConeId: string = AntDForm.useWatch([teammateProperty, 'lightCone'], window.optimizerForm)
  const teammateSuperimposition: number = AntDForm.useWatch([teammateProperty, 'lightConeSuperimposition'], window.optimizerForm)

  const [teammateSelectModalOpen, setTeammateSelectModalOpen] = useState(false)

  const [teammateLightConeSelectOpen, setTeammateLightConeSelectOpen] = useState(false)

  const disabled = teammateCharacterId == null

  const teammateRelicSetOptions: OptionRender[] = useMemo(() => {
    return [
      {
        value: Sets.MessengerTraversingHackerspace,
        desc: t('TeammateSets.Messenger.Desc'), // `4 Piece: ${Sets.MessengerTraversingHackerspace} (+12% SPD)`,
        label: labelRender(Sets.MessengerTraversingHackerspace, t('TeammateSets.Messenger.Text')), // labelRender(Sets.MessengerTraversingHackerspace, '12% SPD'),
      },
      {
        value: Sets.WatchmakerMasterOfDreamMachinations,
        desc: t('TeammateSets.Watchmaker.Desc'), // `4 Piece: ${Sets.WatchmakerMasterOfDreamMachinations} (+30% BE)`,
        label: labelRender(Sets.WatchmakerMasterOfDreamMachinations, t('TeammateSets.Watchmaker.Text')), // labelRender(Sets.WatchmakerMasterOfDreamMachinations, '30% BE'),
      },
      {
        value: SACERDOS_RELIVED_ORDEAL_1_STACK,
        desc: t('TeammateSets.Sacerdos1Stack.Desc'), // `4 Piece: ${Sets.SacerdosRelivedOrdeal} - 1 stack (+20% CD)`,
        label: labelRender(Sets.SacerdosRelivedOrdeal, t('TeammateSets.Sacerdos1Stack.Text')), // labelRender(Sets.SacerdosRelivedOrdeal, '20% CD'),
      },
      {
        value: SACERDOS_RELIVED_ORDEAL_2_STACK,
        desc: t('TeammateSets.Sacerdos2Stack.Desc'), // `4 Piece: ${Sets.SacerdosRelivedOrdeal} - 2 stack (+40% CD)`,
        label: labelRender(Sets.SacerdosRelivedOrdeal, t('TeammateSets.Sacerdos2Stack.Text')), // labelRender(Sets.SacerdosRelivedOrdeal, '40% CD'),
      },
    ]
  }, [t])
  const teammateOrnamentSetOptions: OptionRender[] = useMemo(() => {
    return [
      {
        value: Sets.BrokenKeel,
        desc: t('TeammateSets.Keel.Desc'), // `${Sets.BrokenKeel} (+10% CD)`,
        label: labelRender(Sets.BrokenKeel, t('TeammateSets.Keel.Text')), // labelRender(Sets.BrokenKeel, '10% CD'),
      },
      {
        value: Sets.FleetOfTheAgeless,
        desc: t('TeammateSets.Ageless.Desc'), // `${Sets.FleetOfTheAgeless} (+8% ATK)`,
        label: labelRender(Sets.FleetOfTheAgeless, t('TeammateSets.Ageless.Text')), // labelRender(Sets.FleetOfTheAgeless, '8% ATK'),
      },
      {
        value: Sets.PenaconyLandOfTheDreams,
        desc: t('TeammateSets.Penacony.Desc'), // `${Sets.PenaconyLandOfTheDreams} (+10% DMG for same element)`,
        label: labelRender(Sets.PenaconyLandOfTheDreams, t('TeammateSets.Penacony.Text')), // labelRender(Sets.PenaconyLandOfTheDreams, '10% DMG'),
      },
      {
        value: Sets.LushakaTheSunkenSeas,
        desc: t('TeammateSets.Lushaka.Desc'), // `${Sets.LushakaTheSunkenSeas} (+12% ATK)`,
        label: labelRender(Sets.LushakaTheSunkenSeas, t('TeammateSets.Lushaka.Text')), // labelRender(Sets.LushakaTheSunkenSeas, '12% ATK'),
      },
    ]
  }, [t])

  const superimpositionOptions = useMemo(() => {
    const options: {
      value: number
      label: string
    }[] = []
    for (let i = 1; i <= 5; i++) {
      options.push({ value: i, label: t('SuperimpositionN', { superimposition: i }) })
    }
    return options
  }, [t])

  const eidolonOptions = useMemo(() => {
    const options: {
      value: number
      label: string
    }[] = []
    for (let i = 0; i <= 6; i++) {
      options.push({ value: i, label: t('EidolonN', { eidolon: i }) })
    }
    return options
  }, [t])

  function updateTeammate() {
    window.store.getState().setTeammateCount(countTeammates())

    if (!teammateCharacterId) {
      window.optimizerForm.setFieldValue([teammateProperty], getDefaultTeammateForm())
      return
    }

    const displayFormValues = OptimizerTabController.formToDisplay(OptimizerTabController.getForm())
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

    const characterConditionals = CharacterConditionalsResolver.get({
      characterId: teammateCharacterId,
      characterEidolon: teammateValues.characterEidolon,
    })

    if (characterConditionals.teammateDefaults) {
      teammateValues.characterConditionals = Object.assign({}, characterConditionals.teammateDefaults(), teammateValues.characterConditionals)
    }

    window.optimizerForm.setFieldValue([teammateProperty], teammateValues)
  }

  useEffect(() => {
    updateTeammate()
  }, [teammateCharacterId, props.index])

  useEffect(() => {
    if (!teammateLightConeId) return

    const displayFormValues = OptimizerTabController.formToDisplay(OptimizerTabController.getForm())
    const lightConeConditionals = LightConeConditionalsResolver.get({
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
          <AntDForm.Item name={[teammateProperty, `characterId`]} style={{ flex: 1 }}>
            <CharacterSelect
              value=''
              selectStyle={{}}
              externalOpen={teammateSelectModalOpen}
              setExternalOpen={setTeammateSelectModalOpen}
            />
          </AntDForm.Item>

          <Button
            icon={<SyncOutlined/>}
            style={{ width: 35 }}
            disabled={disabled}
            onClick={() => {
              updateTeammate()
              Message.success(t('TeammateSyncSuccessMessage'))// 'Synced teammate info'
            }}
          />

          <AntDForm.Item name={[teammateProperty, `characterEidolon`]}>
            <Select
              showSearch
              style={{ width: 110 }}
              options={eidolonOptions}
              placeholder={t('EidolonPlaceholder')}// 'Eidolon'
              disabled={disabled}
            />
          </AntDForm.Item>
        </Flex>

        <Flex>
          <Flex vertical style={{ minWidth: 258, marginLeft: 5 }}>
            <CharacterConditionalsDisplay
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

            <AntDForm.Item name={[teammateProperty, `teamRelicSet`]}>
              <Select
                className='teammate-set-select'
                style={{ width: 110 }}
                options={teammateRelicSetOptions}
                placeholder={t('RelicsPlaceholder')}// 'Relics'
                allowClear
                popupMatchSelectWidth={false}
                optionLabelProp='label'
                optionRender={optionRender}
                disabled={disabled}
              />
            </AntDForm.Item>

            <AntDForm.Item name={[teammateProperty, `teamOrnamentSet`]}>
              <Select
                className='teammate-set-select'
                style={{ width: 110 }}
                options={teammateOrnamentSetOptions}
                placeholder={t('OrnamentsPlaceholder')}// 'Ornaments'
                allowClear
                popupMatchSelectWidth={false}
                optionLabelProp='label'
                optionRender={optionRender}
                disabled={disabled}
              />
            </AntDForm.Item>
          </Flex>
        </Flex>

        <Flex gap={5}>
          <AntDForm.Item name={[teammateProperty, `lightCone`]}>
            <LightConeSelect
              value=''
              selectStyle={{ width: 258 }}
              characterId={teammateCharacterId}
              externalOpen={teammateLightConeSelectOpen}
              setExternalOpen={setTeammateLightConeSelectOpen}
            />
          </AntDForm.Item>

          <AntDForm.Item name={[teammateProperty, `lightConeSuperimposition`]}>
            <Select
              showSearch
              style={{ width: 110 }}
              options={superimpositionOptions}
              placeholder={t('SuperimpositionPlaceholder')}// 'Superimposition'
              disabled={disabled}
            />
          </AntDForm.Item>
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
