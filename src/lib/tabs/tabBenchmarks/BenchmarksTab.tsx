import { Button, Card, Flex, Form as AntDForm, InputNumber, Radio } from 'antd'
import { OverlayText, showcaseOutline } from 'lib/characterPreview/CharacterPreviewComponents'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import { cloneWorkerResult } from 'lib/scoring/simScoringUtils'
import { runCustomBenchmarkOrchestrator } from 'lib/simulations/new/orchestrator/runCustomBenchmarkOrchestrator'
import { StatSimTypes } from 'lib/simulations/new/statSimulationTypes'
import DB from 'lib/state/db'
import { BenchmarkResults } from 'lib/tabs/tabBenchmarks/BenchmarkResults'
import { CharacterEidolonFormRadio, RadioButton } from 'lib/tabs/tabBenchmarks/CharacterEidolonFormRadio'
import { LightConeSuperimpositionFormRadio } from 'lib/tabs/tabBenchmarks/LightConeSuperimpositionFormRadio'
import { BenchmarkForm, SimpleCharacter, useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import LightConeSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import { SetsSection } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { CenteredImage } from 'lib/ui/CenteredImage'
import { HeaderText } from 'lib/ui/HeaderText'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { ReactElement } from 'types/components'

const GAP = 8
const HEADER_GAP = 5
const MID_PANEL_WIDTH = 250
const RIGHT_PANEL_WIDTH = 250

const defaultForm = {
  characterId: '1212',
  characterEidolon: 0,
  lightCone: '23014',
  lightConeSuperimposition: 1,
  percentage: 200,
  simRelicSet1: 'Scholar Lost in Erudition',
  simRelicSet2: 'Scholar Lost in Erudition',
  simOrnamentSet: 'Rutilant Arena',
  basicSpd: 100,
  teammate0: {
    characterId: '1101',
    characterEidolon: 3,
    lightCone: '23003',
    lightConeSuperimposition: 1,
  },
  teammate1: {
    characterId: '1309',
    characterEidolon: 0,
    lightCone: '22002',
    lightConeSuperimposition: 5,
  },
  teammate2: {
    characterId: '1217',
    characterEidolon: 1,
    lightCone: '21000',
    lightConeSuperimposition: 5,
  },
}

export default function BenchmarksTab(): ReactElement {
  const [benchmarkForm] = AntDForm.useForm<BenchmarkForm>()
  const {
    isCharacterModalOpen,
    characterModalInitialCharacter,
    setCharacterModalOpen,
    onCharacterModalOk,
    updateTeammate,
    setResults,
  } = useBenchmarksTabStore()

  // Initialize teammates when component mounts
  useEffect(() => {
    benchmarkForm.setFieldsValue(defaultForm)
    updateTeammate(0, defaultForm.teammate0)
    updateTeammate(1, defaultForm.teammate1)
    updateTeammate(2, defaultForm.teammate2)
  }, [benchmarkForm])

  return (
    <AntDForm
      form={benchmarkForm}
      initialValues={defaultForm}
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
          const formValues = benchmarkForm.getFieldsValue()
          const { teammate0, teammate1, teammate2 } = useBenchmarksTabStore.getState()

          // Merge form and the teammate state management
          const mergedBenchmarkForm: BenchmarkForm = {
            ...formValues,
            teammate0,
            teammate1,
            teammate2,
          }

          console.log('Complete benchmark data:', mergedBenchmarkForm)

          runCustomBenchmarkOrchestrator(mergedBenchmarkForm).then((orchestrator) => {
            console.log(orchestrator)
            console.log(cloneWorkerResult(orchestrator.perfectionSimResult!))

            setResults(mergedBenchmarkForm, orchestrator)
          })
        }}
        >
          Generate benchmarks
        </Button>

        <BenchmarkResults/>
      </Flex>

      <CharacterModal
        onOk={onCharacterModalOk}
        open={isCharacterModalOpen}
        setOpen={setCharacterModalOpen}
        initialCharacter={characterModalInitialCharacter ? { form: characterModalInitialCharacter } as unknown as Character : undefined}
      />
    </AntDForm>
  )
}

function LeftPanel() {
  const form = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', form) ?? ''
  const lightCone = AntDForm.useWatch('lightCone', form) ?? ''

  const lightConeMetadata = DB.getMetadata().lightCones[lightCone]
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
        src={Assets.getLightConePortraitById(lightCone)}
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
    <Flex vertical gap={GAP} style={{ width: MID_PANEL_WIDTH }} justify='space-between'>
      <Flex vertical gap={GAP}>
        <HeaderText>Character</HeaderText>
        <AntDForm.Item name='characterId' noStyle>
          <CharacterSelect value=''/>
        </AntDForm.Item>
        <CharacterEidolonFormRadio/>
      </Flex>

      <Flex vertical gap={GAP}>
        <HeaderText>Light Cone</HeaderText>
        <AntDForm.Item name='lightCone' noStyle>
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
    <Flex vertical gap={GAP} style={{ width: RIGHT_PANEL_WIDTH }}>
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
        <SetsSection simType={StatSimTypes.Benchmarks}/>
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

function Teammate({ index }: { index: number }) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])
  const {
    setCharacterModalOpen,
    setCharacterModalInitialCharacter,
    setSelectedTeammateIndex,
    teammate0,
    teammate1,
    teammate2,
  } = useBenchmarksTabStore()

  const teammate = getTeammate(index, teammate0, teammate1, teammate2)
  const characterId = teammate?.characterId
  const lightCone = teammate?.lightCone
  const characterEidolon = teammate?.characterEidolon ?? 0
  const lightConeSuperimposition = teammate?.lightConeSuperimposition ?? 1

  return (
    <Card.Grid
      style={{
        width: '33.3333%',
        textAlign: 'center',
        padding: 1,
        boxShadow: 'none',
      }}
      className='custom-grid'
      hoverable={true}
      onClick={() => {
        setCharacterModalInitialCharacter(teammate)
        setCharacterModalOpen(true)
        setSelectedTeammateIndex(index)
      }}
    >
      <Flex vertical align='center' gap={0}>
        <img
          src={Assets.getCharacterAvatarById(characterId)}
          style={{
            height: iconSize,
            width: iconSize,
            borderRadius: iconSize,
            backgroundColor: 'rgba(124, 124, 124, 0.1)',
            border: showcaseOutline,
          }}
        />

        <OverlayText
          text={t('common:EidolonNShort', { eidolon: characterEidolon })}
          top={-12}
        />

        <img
          src={Assets.getLightConeIconById(lightCone)}
          style={{ height: iconSize, marginTop: -3 }}
        />

        <OverlayText
          text={t('common:SuperimpositionNShort', { superimposition: lightConeSuperimposition })}
          top={-18}
        />
      </Flex>
    </Card.Grid>
  )
}

function getTeammate(index: number, teammate0?: SimpleCharacter, teammate1?: SimpleCharacter, teammate2?: SimpleCharacter) {
  if (index == 0) return teammate0
  if (index == 1) return teammate1
  return teammate2
}
