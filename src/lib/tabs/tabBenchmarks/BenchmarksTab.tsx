import { CheckOutlined, CloseOutlined, DeleteOutlined, ThunderboltFilled } from '@ant-design/icons'
import { Button, Card, Flex, Form as AntDForm, InputNumber, Radio, Select } from 'antd'
import { OverlayText, showcaseOutline } from 'lib/characterPreview/CharacterPreviewComponents'
import { Sets } from 'lib/constants/constants'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { INTO_THE_UNREACHABLE_VEIL, JADE, LINGSHA, SCENT_ALONE_STAYS_TRUE, STELLE_REMEMBRANCE, THE_HERTA, VICTORY_IN_A_BLINK, YET_HOPE_IS_PRICELESS } from 'lib/simulations/tests/testMetadataConstants'
import DB from 'lib/state/db'
import { BenchmarkResults } from 'lib/tabs/tabBenchmarks/BenchmarkResults'
import { BenchmarkSetting } from 'lib/tabs/tabBenchmarks/BenchmarkSettings'
import { handleBenchmarkFormSubmit, handleCharacterSelectChange } from 'lib/tabs/tabBenchmarks/benchmarksTabController'
import { CharacterEidolonFormRadio } from 'lib/tabs/tabBenchmarks/CharacterEidolonFormRadio'
import { LightConeSuperimpositionFormRadio } from 'lib/tabs/tabBenchmarks/LightConeSuperimpositionFormRadio'
import { BenchmarkForm, SimpleCharacter, useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import LightConeSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import { generateSpdPresets } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { SetsSection } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { CenteredImage } from 'lib/ui/CenteredImage'
import { CustomHorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { ReactElement } from 'types/components'

const GAP = 8
const HEADER_GAP = 5
const MID_PANEL_WIDTH = 250
const RIGHT_PANEL_WIDTH = 250

const defaultForm: Partial<BenchmarkForm> = {
  characterId: THE_HERTA,
  lightCone: INTO_THE_UNREACHABLE_VEIL,
  simRelicSet1: Sets.ScholarLostInErudition,
  simRelicSet2: Sets.ScholarLostInErudition,
  simOrnamentSet: Sets.IzumoGenseiAndTakamaDivineRealm,
  basicSpd: undefined,
  teammate0: {
    characterId: JADE,
    lightCone: YET_HOPE_IS_PRICELESS,
    characterEidolon: 0,
    lightConeSuperimposition: 1,
  },
  teammate1: {
    characterId: STELLE_REMEMBRANCE,
    lightCone: VICTORY_IN_A_BLINK,
    characterEidolon: 6,
    lightConeSuperimposition: 5,
  },
  teammate2: {
    characterId: LINGSHA,
    lightCone: SCENT_ALONE_STAYS_TRUE,
    characterEidolon: 0,
    lightConeSuperimposition: 1,
  },
  characterEidolon: 0,
  lightConeSuperimposition: 1,
  errRope: false,
  subDps: false,
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

  const initialForm = useMemo(() => {
    return defaultForm
  }, [])

  useEffect(() => {
    benchmarkForm.setFieldsValue(initialForm)
    updateTeammate(0, initialForm.teammate0)
    updateTeammate(1, initialForm.teammate1)
    updateTeammate(2, initialForm.teammate2)
  }, [benchmarkForm])

  return (
    <Flex vertical style={{ minHeight: 1500, width: 1200, marginBottom: 200 }} align='center'>
      <Flex justify='space-around' style={{ margin: 15 }}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          Benchmark Generator (WIP BETA)
        </pre>
      </Flex>

      <Card style={{ width: 900, marginBottom: 30 }}>
        <AntDForm
          form={benchmarkForm}
          initialValues={initialForm}
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

const INPUT_WIDTH = 85

function RightPanel() {
  const {
    loading,
    resetCache,
  } = useBenchmarksTabStore()
  const benchmarkForm = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', benchmarkForm) ?? ''

  return (
    <Flex vertical style={{ width: RIGHT_PANEL_WIDTH }} justify='space-between'>
      <Flex vertical gap={GAP}>
        <HeaderText>Settings</HeaderText>

        <SpdBenchmarkSetting/>
        <BenchmarkSetting label='Energy regen rope' itemName='errRope'>
          <Radio.Group buttonStyle='solid' size='small' block style={{ width: INPUT_WIDTH }}>
            <Radio.Button value={true}><CheckOutlined/></Radio.Button>
            <Radio.Button value={false}><CloseOutlined/></Radio.Button>
          </Radio.Group>
        </BenchmarkSetting>
        <BenchmarkSetting label='Sub DPS' itemName='subDps'>
          <Radio.Group buttonStyle='solid' size='small' block style={{ width: INPUT_WIDTH }}>
            <Radio.Button value={true}><CheckOutlined/></Radio.Button>
            <Radio.Button value={false}><CloseOutlined/></Radio.Button>
          </Radio.Group>
        </BenchmarkSetting>

        <CustomHorizontalDivider height={8}/>

        <HeaderText>Benchmark sets</HeaderText>

        <Flex vertical gap={HEADER_GAP}>
          <SetsSection simType={StatSimTypes.Benchmarks}/>
        </Flex>
      </Flex>

      <Flex vertical gap={GAP}>
        <Button
          onClick={() => {
            const formValues = benchmarkForm.getFieldsValue()
            handleBenchmarkFormSubmit(formValues)
          }}
          loading={loading}
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
          icon={<DeleteOutlined/>}
        >
          Clear
        </Button>
      </Flex>
    </Flex>
  )
}

function SpdBenchmarkSetting() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })
  const { t: tCharacterTab } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.ScoringSidebar.BenchmarkSpd' })
  const benchmarkForm = AntDForm.useFormInstance<BenchmarkForm>()

  const presetOptions = useMemo(() => {
    // Optimizer has SPD0 as undefined for filters, we want to set it to 0
    const presets = TsUtils.clone(generateSpdPresets(t))
    presets['SPD0'].value = 0
    return Object.values(presets)
  }, [])

  const options = [
    {
      label: <span>{tCharacterTab('CommonBreakpointsLabel')/* Common SPD breakpoint presets (SPD buffs considered separately) */}</span>,
      options: presetOptions,
    },
  ]

  return (
    <BenchmarkSetting label='Benchmark basic SPD' itemName='basicSpd'>
      <InputNumber
        size='small'
        controls={false}
        style={{ width: INPUT_WIDTH }}
        addonAfter={(
          <Select
            style={{ width: 34 }}
            labelRender={() => <></>}
            dropdownStyle={{ width: 'fit-content' }}
            options={options}
            placement='bottomRight'
            listHeight={800}
            value={null}
            onChange={(value: number) => benchmarkForm.setFieldValue('basicSpd', value)}
          />
        )}
      />
    </BenchmarkSetting>
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
