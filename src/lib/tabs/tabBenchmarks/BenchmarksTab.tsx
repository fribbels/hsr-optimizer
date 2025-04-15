import { Button, Card, Flex, Form as AntDForm, InputNumber, Radio } from 'antd'
import { OverlayText, showcaseOutline } from 'lib/characterPreview/CharacterPreviewComponents'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import { StatSimTypes } from 'lib/simulations/new/statSimulationTypes'
import DB from 'lib/state/db'
import { CharacterEidolonFormRadio, RadioButton } from 'lib/tabs/tabBenchmarks/CharacterEidolonFormRadio'
import { LightConeSuperimpositionFormRadio } from 'lib/tabs/tabBenchmarks/LightConeSuperimpositionFormRadio'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import LightConeSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import { SetsSection } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { CenteredImage } from 'lib/ui/CenteredImage'
import { HeaderText } from 'lib/ui/HeaderText'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { ReactElement } from 'types/components'
import { Form } from 'types/form'
import { create } from 'zustand'

// Define the type for a teammate

type BenchmarkForm = {
  characterId: string
  lightConeId: string
  percentage: number
  basicSpd: number
  teammates: SimpleCharacter[]
}

export type SimpleCharacter = {
  characterId: string
  lightConeId: string
  characterEidolon: number
  lightConeSuperimposition: number
}

type BenchmarksTabState = {
  characterModalInitialCharacter: SimpleCharacter | undefined
  isCharacterModalOpen: boolean
  selectedTeammateIndex: number | undefined
  teammates: SimpleCharacter[]
  onCharacterModalOk: (character: Form) => void
  setCharacterModalOpen: (isOpen: boolean) => void
  setCharacterModalInitialCharacter: (character: SimpleCharacter) => void
  setSelectedTeammateIndex: (index: number | undefined) => void
  updateTeammate: (index: number, data: SimpleCharacter) => void
  initializeTeammates: () => void
}

const GAP = 8
const HEADER_GAP = 5
const PANEL_WIDTH = 250

// Default empty teammate
const emptyTeammate: SimpleCharacter = {
  characterId: '',
  characterEidolon: 0,
  lightConeId: '',
  lightConeSuperimposition: 1,
}

// Create a Zustand store for managing the BenchmarksTab state
const BenchmarksTabStore = create<BenchmarksTabState>((set, get) => ({
  characterModalInitialCharacter: { characterId: '', characterEidolon: 0, lightConeId: '', lightConeSuperimposition: 1 },
  isCharacterModalOpen: false,
  selectedTeammateIndex: undefined,
  teammates: [
    { ...emptyTeammate },
    { ...emptyTeammate },
    { ...emptyTeammate },
  ],

  // Initialize teammates - can be called to reset to default if needed
  initializeTeammates: () => set({
    teammates: [
      { ...emptyTeammate },
      { ...emptyTeammate },
      { ...emptyTeammate },
    ],
  }),

  // Update a specific teammate with new data
  updateTeammate: (index, data) => set((state) => {
    const newTeammates = [...state.teammates]
    newTeammates[index] = data
    return { teammates: newTeammates }
  }),

  // Handler for when a character is selected in the modal
  onCharacterModalOk: (form: Form) => {
    const character: SimpleCharacter = {
      characterId: form.characterId,
      characterEidolon: form.characterEidolon,
      lightConeId: form.lightCone,
      lightConeSuperimposition: form.lightConeSuperimposition,
    }

    const { selectedTeammateIndex, updateTeammate } = get()

    if (selectedTeammateIndex != null && character) {
      updateTeammate(selectedTeammateIndex, character)
    }

    set({
      isCharacterModalOpen: false,
      selectedTeammateIndex: undefined,
    })
  },

  setCharacterModalOpen: (isOpen) => set({ isCharacterModalOpen: isOpen }),
  setCharacterModalInitialCharacter: (character: SimpleCharacter) => set({ characterModalInitialCharacter: character }),
  setSelectedTeammateIndex: (index) => set({ selectedTeammateIndex: index }),
}))

export default function BenchmarksTab(): ReactElement {
  const [benchmarkForm] = AntDForm.useForm<BenchmarkForm>()
  const {
    isCharacterModalOpen,
    characterModalInitialCharacter,
    setCharacterModalOpen,
    onCharacterModalOk,
    initializeTeammates,
  } = BenchmarksTabStore()

  // Initialize teammates when component mounts
  useEffect(() => {
    initializeTeammates()
    // Set default form values if needed
    benchmarkForm.setFieldsValue({
      percentage: 100,
      basicSpd: 100,
      teammates: [], // We manage teammates through the store, not the form
    })
  }, [benchmarkForm, initializeTeammates])

  return (
    <AntDForm
      form={benchmarkForm}
      preserve={false}
      layout='vertical'
    >
      <Flex vertical style={{ height: 1400, width: 1200 }} align='center' gap={GAP}>
        <Flex gap={GAP * 3}>
          <LeftPanel/>
          <MiddlePanel/>
          <RightPanel/>
        </Flex>
        <Button onClick={() => {
          // Combine form values with teammates data
          const formValues = benchmarkForm.getFieldsValue()
          const { teammates } = BenchmarksTabStore.getState()

          const completeData = {
            ...formValues,
            teammates,
          }

          console.log('Complete benchmark data:', completeData)
          // Call your generation function here with completeData
        }}
        >
          Generate benchmarks
        </Button>
      </Flex>

      <CharacterModal
        onOk={onCharacterModalOk}
        open={isCharacterModalOpen}
        setOpen={setCharacterModalOpen}
        initialCharacter={{ form: characterModalInitialCharacter } as unknown as Character}
      />
    </AntDForm>
  )
}

function LeftPanel() {
  const form = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', form) ?? ''
  const lightConeId = AntDForm.useWatch('lightConeId', form) ?? ''

  const lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  const offset = lightConeMetadata?.imageCenter ?? undefined

  return (
    <Flex vertical gap={GAP}>
      <Flex vertical gap={GAP}>
        <HeaderText>Benchmark</HeaderText>
        <CenteredImage
          src={Assets.getCharacterPreviewById(characterId)}
          containerW={250}
          containerH={300}
        />
      </Flex>
      <CenteredImage
        src={Assets.getLightConePortraitById(lightConeId)}
        containerW={250}
        containerH={90}
        zoom={1.05}
        centerY={offset}
        relativeHeight={585}
      />
    </Flex>
  )
}

function MiddlePanel() {
  const form = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', form) ?? ''

  return (
    <Flex vertical gap={GAP} style={{ width: PANEL_WIDTH }} justify='space-between'>
      <Flex vertical gap={GAP}>
        <HeaderText>Character</HeaderText>
        <AntDForm.Item name='characterId' noStyle>
          <CharacterSelect value=''/>
        </AntDForm.Item>
        <CharacterEidolonFormRadio/>
      </Flex>

      <Flex vertical gap={GAP}>
        <HeaderText>Light Cone</HeaderText>
        <AntDForm.Item name='lightConeId' noStyle>
          <LightConeSelect value='' characterId={characterId}/>
        </AntDForm.Item>
        <LightConeSuperimpositionFormRadio/>
      </Flex>

      <TeammatesSection/>
    </Flex>
  )
}

function RightPanel() {
  const form = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', form) ?? ''

  return (
    <Flex vertical gap={GAP} style={{ width: PANEL_WIDTH }}>
      <HeaderText>Benchmark type</HeaderText>
      <Flex style={{ width: '100%' }}>
        <AntDForm.Item name='percentage' noStyle>
          <Radio.Group
            buttonStyle='solid'
            style={{ width: '100%', display: 'flex' }}
          >
            <RadioButton value={100} text='100%'/>
            <RadioButton value={200} text='200%'/>
          </Radio.Group>
        </AntDForm.Item>
      </Flex>

      <HeaderText>Benchmark sets</HeaderText>
      <Flex vertical gap={HEADER_GAP}>
        <SetsSection simType={StatSimTypes.SubstatRolls}/>
      </Flex>

      <HeaderText>Benchmark basic SPD</HeaderText>
      <AntDForm.Item name='basicSpd' noStyle>
        <InputNumber style={{ width: '100%' }}/>
      </AntDForm.Item>
    </Flex>
  )
}

function TeammatesSection() {
  return (
    <Flex vertical>
      <HeaderText>Teammates</HeaderText>
      <Flex justify='space-around'>
        <Teammate index={0}/>
        <Teammate index={1}/>
        <Teammate index={2}/>
      </Flex>
    </Flex>
  )
}

const iconSize = 64

type TeammateProps = {
  index: number
}

function Teammate({ index }: TeammateProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])
  const {
    setCharacterModalOpen,
    setCharacterModalInitialCharacter,
    setSelectedTeammateIndex,
    teammates,
  } = BenchmarksTabStore()

  const teammate = teammates[index] || emptyTeammate

  return (
    <Card.Grid
      style={{
        width: '33.3333%',
        textAlign: 'center',
        padding: 1,
        boxShadow: 'none',
      }}
      hoverable={true}
      onClick={() => {
        setCharacterModalInitialCharacter(teammate)
        setCharacterModalOpen(true)
        setSelectedTeammateIndex(index)
      }}
      className='custom-grid'
    >
      <Flex vertical align='center' gap={0}>
        <img
          src={Assets.getCharacterAvatarById(teammate.characterId)}
          style={{
            height: iconSize,
            width: iconSize,
            borderRadius: iconSize,
            backgroundColor: 'rgba(124, 124, 124, 0.1)',
            border: showcaseOutline,
          }}
        />
        <OverlayText
          text={t('common:EidolonNShort', { eidolon: teammate.characterEidolon })}
          top={-12}
        />

        <img
          src={Assets.getLightConeIconById(teammate.lightConeId)}
          style={{ height: iconSize, marginTop: -3 }}
        />

        <OverlayText
          text={t('common:SuperimpositionNShort', { superimposition: teammate.lightConeSuperimposition })}
          top={-18}
        />
      </Flex>
    </Card.Grid>
  )
}
