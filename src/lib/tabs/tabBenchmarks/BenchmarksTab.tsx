import { CheckOutlined, CloseOutlined, ThunderboltFilled } from '@ant-design/icons'
import { Button, Card, Flex, Form as AntDForm, InputNumber, Radio } from 'antd'
import { OverlayText, showcaseOutline } from 'lib/characterPreview/CharacterPreviewComponents'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import { StatSimTypes } from 'lib/simulations/new/statSimulationTypes'
import DB from 'lib/state/db'
import { BenchmarkResults } from 'lib/tabs/tabBenchmarks/BenchmarkResults'
import { BenchmarkSetting } from 'lib/tabs/tabBenchmarks/BenchmarkSettings'
import { handleBenchmarkFormSubmit, handleCharacterSelectChange } from 'lib/tabs/tabBenchmarks/benchmarksTabController'
import { CharacterEidolonFormRadio } from 'lib/tabs/tabBenchmarks/CharacterEidolonFormRadio'
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
  errRope: false,
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
  } = useBenchmarksTabStore()

  useEffect(() => {
    benchmarkForm.setFieldsValue(defaultForm)
    updateTeammate(0, defaultForm.teammate0)
    updateTeammate(1, defaultForm.teammate1)
    updateTeammate(2, defaultForm.teammate2)
  }, [benchmarkForm])

  return (
    <Flex vertical style={{ minHeight: 1500, width: 1200, marginBottom: 200 }} align='center'>
      <Flex justify='space-around' style={{ margin: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          Benchmark Generator (BETA)
        </pre>
      </Flex>

      <Card style={{ width: 900, marginBottom: 30 }}>
        <AntDForm
          form={benchmarkForm}
          initialValues={defaultForm}
          preserve={false}
        >
          <BenchmarkInputs/>
        </AntDForm>
      </Card>

      <BenchmarkResults/>

      <CharacterModal
        onOk={onCharacterModalOk}
        open={isCharacterModalOpen}
        setOpen={setCharacterModalOpen}
        initialCharacter={characterModalInitialCharacter ? { form: characterModalInitialCharacter } as unknown as Character : undefined}
      />
    </Flex>
  )
}

function BenchmarkInputs() {
  const benchmarkForm = AntDForm.useFormInstance<BenchmarkForm>()

  return (
    <Flex vertical align='center'>
      <Flex gap={GAP * 3} style={{ width: '100%' }} justify='space-between'>
        <LeftPanel/>
        <MiddlePanel/>
        <RightPanel/>
      </Flex>
    </Flex>
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
          <CharacterSelect
            value=''
            onChange={(id: string) => handleCharacterSelectChange(id, form)}
          />
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
  const {
    resetCache,
  } = useBenchmarksTabStore()
  const benchmarkForm = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', benchmarkForm) ?? ''
  const width = 85

  return (
    <Flex vertical style={{ width: RIGHT_PANEL_WIDTH }} justify='space-between'>
      <Flex vertical gap={GAP}>
        <HeaderText>Benchmark sets</HeaderText>
        <Flex vertical gap={HEADER_GAP}>
          <SetsSection simType={StatSimTypes.Benchmarks}/>
        </Flex>

        <HeaderText>Settings</HeaderText>

        <BenchmarkSetting label='Benchmark basic SPD' itemName='basicSpd'>
          <InputNumber style={{ width: width }} size='small'/>
        </BenchmarkSetting>
        <BenchmarkSetting label='Energy regen rope' itemName='errRope'>
          <Radio.Group buttonStyle='solid' size='small' block style={{ width: width }}>
            <Radio.Button value={true}><CheckOutlined/></Radio.Button>
            <Radio.Button value={false}><CloseOutlined/></Radio.Button>
          </Radio.Group>
        </BenchmarkSetting>
      </Flex>

      <Flex vertical gap={GAP}>
        <Button
          onClick={() => {
            const formValues = benchmarkForm.getFieldsValue()
            handleBenchmarkFormSubmit(formValues)
          }}
          icon={<ThunderboltFilled/>}
          style={{ width: '100%', height: 40 }}
          type='primary'
        >
          Generate benchmarks
        </Button>
        <Button
          onClick={() => {
            resetCache()
          }}
          style={{ width: '100%' }}
          type='default'
        >
          Clear
        </Button>
      </Flex>
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
