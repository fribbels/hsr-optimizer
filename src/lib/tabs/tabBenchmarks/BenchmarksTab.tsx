import {
  IconBoltFilled,
  IconCheck,
  IconSettings,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { Button, Flex, NumberInput, Paper, SegmentedControl, Select } from '@mantine/core'
import { useForm, UseFormReturnType } from '@mantine/form'
import {
  OverlayText,
} from 'lib/characterPreview/CharacterPreviewComponents'
import { applyTeamAwareSetConditionalPresetsToBenchmarkFormInstance } from 'lib/conditionals/evaluation/applyPresets'
import { Sets } from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { CharacterModal } from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { Jade } from 'lib/conditionals/character/1300/Jade'
import { Lingsha } from 'lib/conditionals/character/1200/Lingsha'
import { TheHerta } from 'lib/conditionals/character/1400/TheHerta'
import { TrailblazerRemembranceStelle } from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import { IntotheUnreachableVeil } from 'lib/conditionals/lightcone/5star/IntotheUnreachableVeil'
import { ScentAloneStaysTrue } from 'lib/conditionals/lightcone/5star/ScentAloneStaysTrue'
import { VictoryInABlink } from 'lib/conditionals/lightcone/4star/VictoryInABlink'
import { YetHopeIsPriceless } from 'lib/conditionals/lightcone/5star/YetHopeIsPriceless'
import { getGameMetadata } from 'lib/state/gameMetadata'
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
import { CharacterSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import { FormSetConditionals } from 'lib/tabs/tabOptimizer/optimizerForm/components/FormSetConditionals'
import { LightConeSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import {
  generateSpdPresets,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { SetsSection } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/SetsSection'
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
  CharacterId,
} from 'types/character'
import { ReactElement } from 'types/components'
import styles from './BenchmarksTab.module.css'
import teammateClasses from 'style/teammateCard.module.css'

const GAP = 8

const BOOLEAN_SEGMENTS = [
  { label: <IconCheck />, value: 'true' },
  { label: <IconX />, value: 'false' },
]

const defaultForm: Partial<BenchmarkForm> = {
  characterId: TheHerta.id,
  lightCone: IntotheUnreachableVeil.id,
  simRelicSet1: Sets.ScholarLostInErudition,
  simRelicSet2: Sets.ScholarLostInErudition,
  simOrnamentSet: Sets.IzumoGenseiAndTakamaDivineRealm,
  basicSpd: undefined,
  teammate0: {
    characterId: Jade.id,
    lightCone: YetHopeIsPriceless.id,
    characterEidolon: 0,
    lightConeSuperimposition: 1,
  },
  teammate1: {
    characterId: TrailblazerRemembranceStelle.id,
    lightCone: VictoryInABlink.id,
    characterEidolon: 6,
    lightConeSuperimposition: 5,
  },
  teammate2: {
    characterId: Lingsha.id,
    lightCone: ScentAloneStaysTrue.id,
    characterEidolon: 0,
    lightConeSuperimposition: 1,
  },
  characterEidolon: 0,
  lightConeSuperimposition: 1,
  errRope: false,
  subDps: false,
}

export function BenchmarksTab(): ReactElement {
  const { t } = useTranslation('benchmarksTab')
  const benchmarkForm = useForm<BenchmarkForm>({
    initialValues: defaultForm as BenchmarkForm,
  })
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

  useEffect(() => {
    benchmarkForm.setValues(defaultForm as BenchmarkForm)
    updateTeammate(0, defaultForm.teammate0)
    updateTeammate(1, defaultForm.teammate1)
    updateTeammate(2, defaultForm.teammate2)
    handleCharacterSelectChange(defaultForm.characterId, benchmarkForm)
  }, [])

  useEffect(() => {
    applyTeamAwareSetConditionalPresetsToBenchmarkFormInstance(benchmarkForm, teammate0, teammate1, teammate2)
  }, [teammate0, teammate1, teammate2])

  return (
    <Flex direction="column" className={styles.container} align='center' gap={8}>
      <ColorizedTitleWithInfo
        text={t('Title') /* 'Benchmark Generator' */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/benchmark-generator.md'
      />

      <Paper p="xs" withBorder className={styles.inputPaper}>
        <BenchmarkInputs form={benchmarkForm} />
      </Paper>

      <DPSScoreDisclaimer />

      <BenchmarkResults />

      <CharacterModal
        onOk={onCharacterModalOk}
        open={isCharacterModalOpen}
        setOpen={setCharacterModalOpen}
        initialCharacter={characterModalInitialCharacter ? { form: characterModalInitialCharacter } : undefined}
      />
    </Flex>
  )
}

function BenchmarkInputs({ form }: { form: UseFormReturnType<BenchmarkForm> }) {
  return (
    <Flex direction="column" align='center'>
      <Flex gap={GAP * 3} className={styles.inputRow} justify='space-between'>
        <LeftPanel form={form} />
        <MiddlePanel form={form} />
        <RightPanel form={form} />
      </Flex>
    </Flex>
  )
}

function LeftPanel({ form }: { form: UseFormReturnType<BenchmarkForm> }) {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'LeftPanel' })
  const characterId = form.getValues().characterId ?? ''
  const lightCone = form.getValues().lightCone ?? ''

  const lightConeMetadata = getGameMetadata().lightCones[lightCone]
  const lcOffset = lightConeMetadata?.imageOffset ?? { x: 0, y: 0, s: 1.15 }

  return (
    <Flex direction="column" gap={GAP}>
      <Flex direction="column" gap={GAP}>
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
        imageOffset={lcOffset}
      />
    </Flex>
  )
}

function MiddlePanel({ form }: { form: UseFormReturnType<BenchmarkForm> }) {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'MiddlePanel' })
  const characterId = form.getValues().characterId ?? ''

  return (
    <Flex direction="column" gap={GAP} className={styles.middlePanel} justify='space-between'>
      <Flex direction="column" gap={GAP}>
        <HeaderText>{t('CharacterHeader') /* Character */}</HeaderText>
        <CharacterSelect
          value={form.getValues().characterId}
          onChange={(id: CharacterId | null | undefined) => {
            if (id) form.setFieldValue('characterId', id)
            handleCharacterSelectChange(id, form)
          }}
        />
        <CharacterEidolonFormRadio form={form} />
      </Flex>

      <Flex direction="column" gap={GAP}>
        <HeaderText>{t('LCHeader') /* Light Cone */}</HeaderText>
        <LightConeSelect
          value={form.getValues().lightCone}
          characterId={characterId}
          onChange={(id) => {
            if (id) form.setFieldValue('lightCone', id)
          }}
        />
        <LightConeSuperimpositionFormRadio form={form} />
      </Flex>

      <TeammatesSection />
    </Flex>
  )
}

function RightPanel({ form }: { form: UseFormReturnType<BenchmarkForm> }) {
  const {
    loading,
    resetCache,
  } = useBenchmarksTabStore()
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'RightPanel' })
  const { t: tOptimizerTab } = useTranslation('optimizerTab')

  return (
    <Flex direction="column" className={styles.rightPanel} justify='space-between'>
      <Flex direction="column" gap={GAP}>
        <HeaderText>{t('Settings.Header') /* Settings */}</HeaderText>

        <SpdBenchmarkSetting form={form} />
        <BenchmarkSetting label='ERR' itemName='errRope' form={form}>
          <SegmentedControl fullWidth className={styles.inputControl} data={BOOLEAN_SEGMENTS} />
        </BenchmarkSetting>
        <BenchmarkSetting label='SubDPS' itemName='subDps' form={form}>
          <SegmentedControl fullWidth className={styles.inputControl} data={BOOLEAN_SEGMENTS} />
        </BenchmarkSetting>

        <CustomHorizontalDivider height={8} />

        <HeaderText>{t('SetsHeader') /* Benchmark sets */}</HeaderText>

        <Flex direction="column" gap={5}>
          <SetsSection simType={StatSimTypes.Benchmarks} form={form} />
          <Button
            onClick={() => setOpen(OpenCloseIDs.BENCHMARKS_SETS_DRAWER)}
            leftSection={<IconSettings size={16} />}
            variant='default'
          >
            {tOptimizerTab('SetConditionals.Title') /* Conditional set effects */}
          </Button>
        </Flex>

        <FormSetConditionals id={OpenCloseIDs.BENCHMARKS_SETS_DRAWER} />
      </Flex>

      <Flex direction="column" gap={GAP}>
        <Button
          onClick={() => handleBenchmarkFormSubmit(form.getValues())}
          loading={loading}
          leftSection={<IconBoltFilled size={16} />}
          className={styles.generateButton}
        >
          {t('ButtonText.Generate') /* Generate benchmarks */}
        </Button>
        <Button
          onClick={resetCache}
          className={styles.clearButton}
          variant='default'
          leftSection={<IconTrash size={16} />}
        >
          {t('ButtonText.Clear') /* Clear */}
        </Button>
      </Flex>
    </Flex>
  )
}

function SpdBenchmarkSetting({ form }: { form: UseFormReturnType<BenchmarkForm> }) {
  const { t: tOptimizerTab } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })

  const options = useMemo(() => {
    const { categories } = generateSpdPresets(tOptimizerTab)
    const seen = new Set<string>()
    return categories.map((category) => {
      const presetOptions = Object.values(category.presets)
        .map((preset) => ({
          // Optimizer tab has SPD0 as undefined for filters, we want to set it to 0
          value: String(preset.value ?? 0),
          label: String(preset.label),
        }))
        .filter((opt) => {
          if (seen.has(opt.value)) return false
          seen.add(opt.value)
          return true
        })
      return {
        group: category.label,
        items: presetOptions,
      }
    })
  }, [tOptimizerTab])

  return (
    <BenchmarkSetting label='SPD' itemName='basicSpd' form={form}>
      <NumberInput
        hideControls
        className={styles.inputControl}
        rightSection={
          <Select
            className={styles.spdSelect}
            comboboxProps={{ width: 'fit-content' }}
            data={options}
            maxDropdownHeight={800}
            value={null}
            onChange={(value) => {
              if (value != null) form.setFieldValue('basicSpd', Number(value))
            }}
          />
        }
      />
    </BenchmarkSetting>
  )
}

function TeammatesSection() {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'MiddlePanel' })
  return (
    <Flex direction="column">
      <HeaderText>{t('TeammatesHeader') /* Teammates */}</HeaderText>
      <Flex justify='space-around'>
        <Teammate index={0} />
        <Teammate index={1} />
        <Teammate index={2} />
      </Flex>
    </Flex>
  )
}

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

  const teammate = [teammate0, teammate1, teammate2][index]
  const characterId = teammate?.characterId
  const lightCone = teammate?.lightCone
  const characterEidolon = teammate?.characterEidolon ?? 0
  const lightConeSuperimposition = teammate?.lightConeSuperimposition ?? 1

  return (
    <div
      className={`custom-grid ${teammateClasses.teammateCard}`}
      style={{ cursor: 'pointer' }}
      onClick={() => {
        setCharacterModalInitialCharacter(teammate)
        setCharacterModalOpen(true)
        setSelectedTeammateIndex(index)
      }}
    >
      <Flex direction="column" align='center'>
        <img
          src={Assets.getCharacterAvatarById(characterId)}
          className={teammateClasses.teammateAvatar}
        />

        <OverlayText
          text={t('EidolonNShort', { eidolon: characterEidolon })}
          top={-12}
        />

        <div className={teammateClasses.iconWrapper}>
          <img
            src={Assets.getLightConeIconById(lightCone)}
            className={styles.lcIcon}
          />

          {teammate && teammate.teamRelicSet && (
            <img
              className={teammateClasses.relicBadge}
              src={Assets.getSetImage(teammate.teamRelicSet)}
            />
          )}

          {teammate && teammate.teamOrnamentSet && (
            <img
              className={teammateClasses.ornamentBadge}
              src={Assets.getSetImage(teammate.teamOrnamentSet)}
            />
          )}
        </div>

        <OverlayText
          text={t('SuperimpositionNShort', { superimposition: lightConeSuperimposition })}
          top={-18}
        />
      </Flex>
    </div>
  )
}

