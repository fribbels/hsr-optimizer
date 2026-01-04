import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  SettingOutlined,
  ThunderboltFilled,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Flex,
  Form as AntDForm,
  InputNumber,
  Radio,
  Select,
} from 'antd'
import {
  OverlayText,
  showcaseOutline,
} from 'lib/characterPreview/CharacterPreviewComponents'
import { applyTeamAwareSetConditionalPresetsToBenchmarkFormInstance } from 'lib/conditionals/evaluation/applyPresets'
import { Sets } from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import {
  INTO_THE_UNREACHABLE_VEIL,
  JADE,
  LINGSHA,
  SCENT_ALONE_STAYS_TRUE,
  STELLE_REMEMBRANCE,
  THE_HERTA,
  VICTORY_IN_A_BLINK,
  YET_HOPE_IS_PRICELESS,
} from 'lib/simulations/tests/testMetadataConstants'
import DB from 'lib/state/db'
import { BenchmarkResults } from 'lib/tabs/tabBenchmarks/BenchmarkResults'
import { BenchmarkSetting } from 'lib/tabs/tabBenchmarks/BenchmarkSettings'
import {
  handleBenchmarkFormSubmit,
  handleCharacterSelectChange,
} from 'lib/tabs/tabBenchmarks/benchmarksTabController'
import { CharacterEidolonFormRadio } from 'lib/tabs/tabBenchmarks/CharacterEidolonFormRadio'
import { LightConeSuperimpositionFormRadio } from 'lib/tabs/tabBenchmarks/LightConeSuperimpositionFormRadio'
import {
  BenchmarkForm,
  SimpleCharacterSets,
  useBenchmarksTabStore,
} from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import { FormSetConditionals } from 'lib/tabs/tabOptimizer/optimizerForm/components/FormSetConditionals'
import LightConeSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import {
  generateSpdPresets,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { SetsSection } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { DPSScoreDisclaimer } from 'lib/tabs/tabShowcase/ShowcaseTab'
import { CenteredImage } from 'lib/ui/CenteredImage'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { CustomHorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import {
  useEffect,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  Character,
  CharacterId,
} from 'types/character'
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
  const { t } = useTranslation('benchmarksTab')
  const [benchmarkForm] = AntDForm.useForm<BenchmarkForm>()
  const {
    isCharacterModalOpen,
    characterModalInitialCharacter,
    setCharacterModalOpen,
    onCharacterModalOk,
    updateTeammate,
    teammate0,
    teammate1,
    teammate2,
  } = useBenchmarksTabStore()

  const initialForm = useMemo(() => {
    return defaultForm
  }, [])

  useEffect(() => {
    benchmarkForm.setFieldsValue(initialForm)
    updateTeammate(0, initialForm.teammate0)
    updateTeammate(1, initialForm.teammate1)
    updateTeammate(2, initialForm.teammate2)
    handleCharacterSelectChange(initialForm.characterId, benchmarkForm)
  }, [])

  useEffect(() => {
    applyTeamAwareSetConditionalPresetsToBenchmarkFormInstance(benchmarkForm, teammate0, teammate1, teammate2)
  }, [teammate0, teammate1, teammate2])

  return (
    <Flex vertical style={{ minHeight: 1500, width: 1200, marginBottom: 200 }} align='center' gap={8}>
      <ColorizedTitleWithInfo
        text={t('Title') /* 'Benchmark Generator' */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/benchmark-generator.md'
      />

      <Card style={{ width: 900 }}>
        <AntDForm
          form={benchmarkForm}
          initialValues={initialForm}
          preserve={false}
        >
          <BenchmarkInputs />
        </AntDForm>
      </Card>

      <DPSScoreDisclaimer />

      <BenchmarkResults />

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
  return (
    <Flex vertical align='center'>
      <Flex gap={GAP * 3} style={{ width: '100%' }} justify='space-between'>
        <LeftPanel />
        <MiddlePanel />
        <RightPanel />
      </Flex>
    </Flex>
  )
}

function LeftPanel() {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'LeftPanel' })
  const form = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', form) ?? ''
  const lightCone = AntDForm.useWatch('lightCone', form) ?? ''

  const lightConeMetadata = DB.getMetadata().lightCones[lightCone]
  const offset = lightConeMetadata?.imageCenter ?? undefined

  return (
    <Flex vertical gap={GAP}>
      <Flex vertical gap={GAP}>
        <HeaderText>{t('Header') /* Benchmark */}</HeaderText>
        <CenteredImage
          src={Assets.getCharacterPreviewById(characterId)}
          containerW={250}
          containerH={325}
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
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'MiddlePanel' })
  const form = AntDForm.useFormInstance<BenchmarkForm>()
  const characterId = AntDForm.useWatch('characterId', form) ?? ''

  return (
    <Flex vertical gap={GAP} style={{ width: MID_PANEL_WIDTH }} justify='space-between'>
      <Flex vertical gap={GAP}>
        <HeaderText>{t('CharacterHeader') /* Character */}</HeaderText>
        <AntDForm.Item name='characterId' noStyle>
          <CharacterSelect
            value={null}
            onChange={(id: CharacterId | null | undefined) => handleCharacterSelectChange(id, form)}
          />
        </AntDForm.Item>
        <CharacterEidolonFormRadio />
      </Flex>

      <Flex vertical gap={GAP}>
        <HeaderText>{t('LCHeader') /* Light Cone */}</HeaderText>
        <AntDForm.Item name='lightCone' noStyle>
          <LightConeSelect value={null} characterId={characterId} />
        </AntDForm.Item>
        <LightConeSuperimpositionFormRadio />
      </Flex>

      <TeammatesSection />
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
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'RightPanel' })
  const { t: tOptimizerTab } = useTranslation('optimizerTab')

  return (
    <Flex vertical style={{ width: RIGHT_PANEL_WIDTH }} justify='space-between'>
      <Flex vertical gap={GAP}>
        <HeaderText>{t('Settings.Header') /* Settings */}</HeaderText>

        <SpdBenchmarkSetting />
        <BenchmarkSetting label='ERR' itemName='errRope'>
          <Radio.Group buttonStyle='solid' size='small' block style={{ width: INPUT_WIDTH }}>
            <Radio.Button value={true}>
              <CheckOutlined />
            </Radio.Button>
            <Radio.Button value={false}>
              <CloseOutlined />
            </Radio.Button>
          </Radio.Group>
        </BenchmarkSetting>
        <BenchmarkSetting label='SubDPS' itemName='subDps'>
          <Radio.Group buttonStyle='solid' size='small' block style={{ width: INPUT_WIDTH }}>
            <Radio.Button value={true}>
              <CheckOutlined />
            </Radio.Button>
            <Radio.Button value={false}>
              <CloseOutlined />
            </Radio.Button>
          </Radio.Group>
        </BenchmarkSetting>

        <CustomHorizontalDivider height={8} />

        <HeaderText>{t('SetsHeader') /* Benchmark sets */}</HeaderText>

        <Flex vertical gap={HEADER_GAP}>
          <SetsSection simType={StatSimTypes.Benchmarks} />
          <Button
            onClick={() => setOpen(OpenCloseIDs.BENCHMARKS_SETS_DRAWER)}
            icon={<SettingOutlined />}
            type='dashed'
          >
            {tOptimizerTab('SetConditionals.Title') /* Conditional set effects */}
          </Button>
        </Flex>

        <FormSetConditionals id={OpenCloseIDs.BENCHMARKS_SETS_DRAWER} />
      </Flex>

      <Flex vertical gap={GAP}>
        <Button
          onClick={() => {
            const formValues = benchmarkForm.getFieldsValue()
            console.log(formValues)
            handleBenchmarkFormSubmit(formValues)
          }}
          loading={loading}
          icon={<ThunderboltFilled />}
          style={{ width: '100%', height: 40 }}
          type='primary'
        >
          {t('ButtonText.Generate') /* Generate benchmarks */}
        </Button>
        <Button
          onClick={() => {
            resetCache()
          }}
          style={{ width: '100%' }}
          type='default'
          icon={<DeleteOutlined />}
        >
          {t('ButtonText.Clear') /* Clear */}
        </Button>
      </Flex>
    </Flex>
  )
}

function SpdBenchmarkSetting() {
  const { t: tOptimizerTab } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })
  const benchmarkForm = AntDForm.useFormInstance<BenchmarkForm>()

  const options = useMemo(() => {
    const { categories } = generateSpdPresets(tOptimizerTab)
    return categories.map((category) => {
      const presetOptions = Object.values(category.presets).map((preset) => ({
        ...preset,
        // Optimizer tab has SPD0 as undefined for filters, we want to set it to 0
        value: preset.value ?? 0,
        label: <div>{preset.label}</div>,
      }))
      return {
        label: <span>{category.label}</span>,
        options: presetOptions,
      }
    })
  }, [tOptimizerTab])

  return (
    <BenchmarkSetting label='SPD' itemName='basicSpd'>
      <InputNumber
        size='small'
        controls={false}
        style={{ width: INPUT_WIDTH }}
        addonAfter={
          <Select
            style={{ width: 34 }}
            labelRender={() => <></>}
            dropdownStyle={{ width: 'fit-content' }}
            popupClassName='spd-preset-dropdown'
            options={options}
            placement='bottomRight'
            listHeight={800}
            value={null}
            onChange={(value: number) => benchmarkForm.setFieldValue('basicSpd', value)}
          />
        }
      />
    </BenchmarkSetting>
  )
}

function TeammatesSection() {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'MiddlePanel' })
  return (
    <Flex vertical>
      <HeaderText>{t('TeammatesHeader') /* Teammates */}</HeaderText>
      <Flex justify='space-around'>
        <Teammate index={0} />
        <Teammate index={1} />
        <Teammate index={2} />
      </Flex>
    </Flex>
  )
}

const iconSize = 64
const setSize = 24

function Teammate({ index }: { index: number }) {
  const { t } = useTranslation('common')
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
          text={t('EidolonNShort', { eidolon: characterEidolon })}
          top={-12}
        />

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={Assets.getLightConeIconById(lightCone)}
            style={{ height: iconSize, marginTop: -3 }}
          />

          {teammate && teammate.teamRelicSet && (
            <img
              style={{
                position: 'absolute',
                top: 3,
                right: -4,
                width: setSize,
                height: setSize,
                borderRadius: '50%',
                backgroundColor: 'rgba(50, 50, 50, 0.5)',
                border: showcaseOutline,
              }}
              src={Assets.getSetImage(teammate.teamRelicSet)}
            />
          )}

          {teammate && teammate.teamOrnamentSet && (
            <img
              style={{
                position: 'absolute',
                top: 27,
                right: -4,
                width: setSize,
                height: setSize,
                borderRadius: '50%',
                backgroundColor: 'rgba(50, 50, 50, 0.5)',
                border: showcaseOutline,
              }}
              src={Assets.getSetImage(teammate.teamOrnamentSet)}
            />
          )}
        </div>

        <OverlayText
          text={t('SuperimpositionNShort', { superimposition: lightConeSuperimposition })}
          top={-18}
        />
      </Flex>
    </Card.Grid>
  )
}

function getTeammate(index: number, teammate0?: SimpleCharacterSets, teammate1?: SimpleCharacterSets, teammate2?: SimpleCharacterSets) {
  if (index == 0) return teammate0
  if (index == 1) return teammate1
  return teammate2
}
