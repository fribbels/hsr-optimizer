import { IconRefresh } from '@tabler/icons-react'
import { Button, Flex, Select, Text } from '@mantine/core'
import { TFunction } from 'i18next'
import { showcaseOutlineLight } from 'lib/characterPreview/CharacterPreviewComponents'
import { applyTeamAwareSetConditionalPresetsToStore } from 'lib/conditionals/evaluation/applyPresets'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  Constants,
  SACERDOS_RELIVED_ORDEAL_1_STACK,
  SACERDOS_RELIVED_ORDEAL_2_STACK,
  Sets,
} from 'lib/constants/constants'
import { teammateOrnamentOptions, teammateRelicOptions } from 'lib/sets/setConfigRegistry'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { generateConditionalResolverMetadata } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { CharacterConditionalsDisplay } from 'lib/tabs/tabOptimizer/conditionals/CharacterConditionalsDisplay'
import { LightConeConditionalDisplay } from 'lib/tabs/tabOptimizer/conditionals/LightConeConditionalDisplay'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import LightConeSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import FormCard from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { ArrayFilters } from 'lib/utils/arrayUtils'
import {
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  Character,
  CharacterId,
} from 'types/character'
import { ReactElement } from 'types/components'
import {
  Form,
  TeammateProperty,
} from 'types/form'
import {
  LightConeId,
  SuperImpositionLevel,
} from 'types/lightCone'
import { DBMetadata } from 'types/metadata'

const rightPanelWidth = 110

const parentW = rightPanelWidth
const parentH = rightPanelWidth

const lcWidth = 120

const lcParentW = lcWidth
const lcParentH = lcWidth
const lcInnerW = lcWidth
const lcInnerH = lcWidth

const cardHeight = 490

export function optionRenderer() {
  return (option: {
    data: {
      value: string;
      desc: string;
    };
  }) => (
    option.data.value
      ? (
        <Flex gap={10} align='center'>
          <Flex>
            <img
              src={Assets.getSetImage(option.data.value, Constants.Parts.PlanarSphere)}
              style={{ width: 26, height: 26 }}
            />
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
}

export const labelRender = (set: string, text: string) => (
  <Flex align='center' gap={3}>
    <img src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)} style={{ width: 20, height: 20 }}></img>
    <Text style={{ fontSize: 12 }}>
      {text}
    </Text>
  </Flex>
)

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
  Sets.SacerdosRelivedOrdeal,
  Sets.WarriorGoddessOfSunAndThunder,
  Sets.WorldRemakingDeliverer,
  Sets.DivinerOfDistantReach,
]
const teammateOrnamentSets = [
  Sets.BrokenKeel,
  Sets.FleetOfTheAgeless,
  Sets.PenaconyLandOfTheDreams,
  Sets.LushakaTheSunkenSeas,
  Sets.AmphoreusTheEternalLand,
]

// Find 4 piece relic sets and 2 piece ornament sets
function calculateTeammateSets(teammateCharacter: Character) {
  const relics = Object.values(teammateCharacter.equipped).map((id) => DB.getRelicById(id)).filter(ArrayFilters.nonNullable)
  const activeTeammateSets: {
    teamRelicSet?: string;
    teamOrnamentSet?: string;
  } = {}
  for (const set of teammateRelicSets) {
    if (relics.filter((relic) => relic.set == set).length == 4) {
      if (set == Sets.MessengerTraversingHackerspace) continue
      if (set == Sets.SacerdosRelivedOrdeal) {
        if (
          teammateCharacter.id == '1313' // Sunday
          || teammateCharacter.id == '1306' // Sparkle
        ) {
          activeTeammateSets.teamRelicSet = SACERDOS_RELIVED_ORDEAL_2_STACK
        } else {
          activeTeammateSets.teamRelicSet = SACERDOS_RELIVED_ORDEAL_1_STACK
        }
      } else {
        activeTeammateSets.teamRelicSet = set
      }
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
  const state = useOptimizerFormStore.getState()
  return state.teammates.filter((teammate) => teammate?.characterId).length
}

export type OptionRender = {
  value: string;
  desc: string;
  label: ReactElement;
}

export function renderTeammateRelicSetOptions(t: TFunction<'optimizerTab', 'TeammateCard'>) {
  return () => {
    return teammateRelicOptions.map((option) => ({
      value: option.value,
      desc: option.desc(t),
      label: labelRender(option.value, option.label(t)),
    }))
  }
}

export function renderTeammateOrnamentSetOptions(t: TFunction<'optimizerTab', 'TeammateCard'>) {
  return () => {
    return teammateOrnamentOptions.map((option) => ({
      value: option.value,
      desc: option.desc(t),
      label: labelRender(option.value, option.label(t)),
    }))
  }
}

const TeammateCard = (props: {
  index: number;
  dbMetadata: DBMetadata;
}) => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateCard' })
  const tmIndex = props.index as 0 | 1 | 2
  const teammateCharacterId = useOptimizerFormStore((s) => s.teammates[tmIndex].characterId) as CharacterId
  const teammateEidolon = useOptimizerFormStore((s) => s.teammates[tmIndex].characterEidolon)

  const teammateLightConeId = useOptimizerFormStore((s) => s.teammates[tmIndex].lightCone) as LightConeId
  const teammateSuperimposition = useOptimizerFormStore((s) => s.teammates[tmIndex].lightConeSuperimposition) as SuperImpositionLevel

  const teammateTeamRelicSet = useOptimizerFormStore((s) => s.teammates[tmIndex].teamRelicSet)
  const teammateTeamOrnamentSet = useOptimizerFormStore((s) => s.teammates[tmIndex].teamOrnamentSet)

  const [teammateSelectModalOpen, setTeammateSelectModalOpen] = useState(false)

  const [teammateLightConeSelectOpen, setTeammateLightConeSelectOpen] = useState(false)

  const disabled = teammateCharacterId == null

  const teammateRelicSetOptions: OptionRender[] = useMemo(renderTeammateRelicSetOptions(t), [t])
  const teammateOrnamentSetOptions: OptionRender[] = useMemo(renderTeammateOrnamentSetOptions(t), [t])

  const superimpositionOptions = useMemo(() => {
    const options: {
      value: number;
      label: string;
    }[] = []
    for (let i = 1; i <= 5; i++) {
      options.push({ value: i, label: t('SuperimpositionN', { superimposition: i }) })
    }
    return options
  }, [t])

  const eidolonOptions = useMemo(() => {
    const options: {
      value: number;
      label: string;
    }[] = []
    for (let i = 0; i <= 6; i++) {
      options.push({ value: i, label: t('EidolonN', { eidolon: i }) })
    }
    return options
  }, [t])

  return (
    <FormCard size='medium' height={cardHeight} style={{ overflow: 'auto' }}>
      <Flex direction="column" gap={5}>
        <Flex gap={5}>
          <CharacterSelect
            value={teammateCharacterId}
            onChange={(id) => {
              if (id) {
                useOptimizerFormStore.getState().setTeammateField(tmIndex, 'characterId', id)
                updateTeammate({ [`teammate${props.index}` as TeammateProperty]: { characterId: id } })
              } else {
                updateTeammate({ [`teammate${props.index}` as TeammateProperty]: { characterId: null } })
              }
            }}
            selectStyle={{}}
            externalOpen={teammateSelectModalOpen}
            setExternalOpen={setTeammateSelectModalOpen}
          />

          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            style={{ width: 35 }}
            disabled={disabled}
            onClick={() => {
              updateTeammate({ [`teammate${props.index}` as TeammateProperty]: { characterId: teammateCharacterId } })
              Message.success(t('TeammateSyncSuccessMessage')) // 'Synced teammate info'
            }}
          />

          <Select
            searchable
            style={{ width: 110 }}
            data={eidolonOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
            value={teammateEidolon != null ? String(teammateEidolon) : null}
            onChange={(val) => { if (val != null) useOptimizerFormStore.getState().setTeammateField(tmIndex, 'characterEidolon', Number(val)) }}
            placeholder={t('EidolonPlaceholder')} // 'Eidolon'
            disabled={disabled}
          />
        </Flex>

        <Flex>
          <Flex direction="column" style={{ minWidth: 258, marginLeft: 5 }}>
            <CharacterConditionalsDisplay
              id={teammateCharacterId}
              eidolon={teammateEidolon}
              teammateIndex={props.index}
            />
          </Flex>
          <Flex direction="column" gap={5}>
            <div
              style={{
                width: `${rightPanelWidth}px`,
                height: `${rightPanelWidth}px`,
                backgroundColor: 'rgb(255 255 255 / 2%)',
                borderRadius: rightPanelWidth,
                border: teammateCharacterId ? showcaseOutlineLight : undefined,
              }}
            >
              <img
                width={rightPanelWidth}
                height={rightPanelWidth}
                src={Assets.getCharacterAvatarById(teammateCharacterId)}
                onClick={() => setTeammateSelectModalOpen(true)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <Select
              className='teammate-set-select'
              style={{ width: 110 }}
              data={teammateRelicSetOptions.map((opt) => ({ value: opt.value, label: opt.desc }))}
              value={teammateTeamRelicSet}
              onChange={(val) => useOptimizerFormStore.getState().setTeammateField(tmIndex, 'teamRelicSet', val ?? undefined)}
              placeholder={t('RelicsPlaceholder')} // 'Relics'
              clearable
              comboboxProps={{ width: 'auto' }}
              disabled={disabled}
            />

            <Select
              className='teammate-set-select'
              style={{ width: 110 }}
              data={teammateOrnamentSetOptions.map((opt) => ({ value: opt.value, label: opt.desc }))}
              value={teammateTeamOrnamentSet}
              onChange={(val) => useOptimizerFormStore.getState().setTeammateField(tmIndex, 'teamOrnamentSet', val ?? undefined)}
              placeholder={t('OrnamentsPlaceholder')} // 'Ornaments'
              clearable
              comboboxProps={{ width: 'auto' }}
              disabled={disabled}
            />
          </Flex>
        </Flex>

        <Flex gap={5}>
          <LightConeSelect
            value={teammateLightConeId ?? null}
            onChange={(id) => {
              if (id) {
                useOptimizerFormStore.getState().setTeammateField(tmIndex, 'lightCone', id)
                updateTeammate({ [`teammate${props.index}` as TeammateProperty]: { lightCone: id } })
              } else {
                updateTeammate({ [`teammate${props.index}` as TeammateProperty]: { lightCone: null } })
              }
            }}
            selectStyle={{ width: 258 }}
            characterId={teammateCharacterId}
            externalOpen={teammateLightConeSelectOpen}
            setExternalOpen={setTeammateLightConeSelectOpen}
          />

          <Select
            searchable
            style={{ width: 110 }}
            data={superimpositionOptions.map((opt) => ({ value: String(opt.value), label: opt.label }))}
            value={teammateSuperimposition != null ? String(teammateSuperimposition) : null}
            onChange={(val) => { if (val != null) useOptimizerFormStore.getState().setTeammateField(tmIndex, 'lightConeSuperimposition', Number(val)) }}
            placeholder={t('SuperimpositionPlaceholder')} // 'Superimposition'
            disabled={disabled}
          />
        </Flex>

        <Flex>
          <Flex direction="column" style={{ minWidth: 258, marginLeft: 5 }}>
            <LightConeConditionalDisplay
              id={teammateLightConeId}
              superImposition={teammateSuperimposition}
              teammateIndex={props.index}
              dbMetadata={props.dbMetadata}
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

const TEAMMATE_PROPERTIES: TeammateProperty[] = ['teammate0', 'teammate1', 'teammate2']

const PROPERTY_TO_INDEX: Record<string, 0 | 1 | 2> = { teammate0: 0, teammate1: 1, teammate2: 2 }

export function updateTeammate(changedValues: Partial<Form>) {
  const property = TEAMMATE_PROPERTIES.find((p) => changedValues[p])
  const updatedTeammate = property && changedValues[property]
  if (!updatedTeammate) return
  const teammateIndex = PROPERTY_TO_INDEX[property]

  window.store.getState().setTeammateCount(countTeammates())

  if (updatedTeammate.lightCone) {
    const store = useOptimizerFormStore.getState()
    const teammate = store.teammates[teammateIndex]
    const conditionalResolverMetadata = generateConditionalResolverMetadata(teammate as any, DB.getMetadata())
    const controller = LightConeConditionalsResolver.get(conditionalResolverMetadata)

    if (!controller.teammateDefaults) return

    const mergedConditionals = Object.assign({}, controller.teammateDefaults(), teammate.lightConeConditionals)
    useOptimizerFormStore.getState().setTeammateField(teammateIndex, 'lightConeConditionals', mergedConditionals)
  } else if (updatedTeammate.characterId) {
    const teammateCharacterId = updatedTeammate.characterId

    const store = useOptimizerFormStore.getState()
    const currentTeammate = store.teammates[teammateIndex]
    const teammateCharacter = DB.getCharacterById(teammateCharacterId)

    let lightCone = currentTeammate.lightCone
    let lightConeSuperimposition = currentTeammate.lightConeSuperimposition
    let characterEidolon = currentTeammate.characterEidolon
    let teamRelicSet = currentTeammate.teamRelicSet
    let teamOrnamentSet = currentTeammate.teamOrnamentSet

    if (teammateCharacter) {
      // Fill out fields based on the teammate's form
      lightCone = teammateCharacter.form.lightCone
      lightConeSuperimposition = teammateCharacter.form.lightConeSuperimposition || 1
      characterEidolon = teammateCharacter.form.characterEidolon
      const activeTeammateSets = calculateTeammateSets(teammateCharacter)
      teamRelicSet = activeTeammateSets.teamRelicSet
      teamOrnamentSet = activeTeammateSets.teamOrnamentSet
    } else {
      lightConeSuperimposition = 1
      characterEidolon = 0
    }

    const characterConditionals = CharacterConditionalsResolver.get({
      characterId: teammateCharacterId,
      characterEidolon: characterEidolon,
    })

    let characterConditionalsValues = currentTeammate.characterConditionals
    if (characterConditionals.teammateDefaults) {
      characterConditionalsValues = Object.assign({}, characterConditionals.teammateDefaults(), characterConditionalsValues)
    }

    // Update all teammate fields at once
    const storeActions = useOptimizerFormStore.getState()
    storeActions.setTeammateField(teammateIndex, 'characterId', teammateCharacterId)
    storeActions.setTeammateField(teammateIndex, 'characterEidolon', characterEidolon)
    storeActions.setTeammateField(teammateIndex, 'lightCone', lightCone)
    storeActions.setTeammateField(teammateIndex, 'lightConeSuperimposition', lightConeSuperimposition)
    storeActions.setTeammateField(teammateIndex, 'teamRelicSet', teamRelicSet)
    storeActions.setTeammateField(teammateIndex, 'teamOrnamentSet', teamOrnamentSet)
    storeActions.setTeammateField(teammateIndex, 'characterConditionals', characterConditionalsValues)

    applyTeamAwareSetConditionalPresetsToStore()
  } else if (updatedTeammate.characterId === null) {
    useOptimizerFormStore.getState().clearTeammate(teammateIndex)
  } else if (updatedTeammate.lightCone === null) {
    useOptimizerFormStore.getState().clearTeammateLightCone(teammateIndex)
  }
}
