import {
  Button,
  Flex,
  Paper,
  SegmentedControl,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import type { UseFormReturnType } from '@mantine/form'
import {
  IconBoltFilled,
  IconCheck,
  IconSettings,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import {
  OverlayText,
} from 'lib/characterPreview/CharacterPreviewComponents'
import { DPSScoreDisclaimer } from 'lib/characterPreview/DPSScoreDisclaimer'
import { Lingsha } from 'lib/conditionals/character/1200/Lingsha'
import { Jade } from 'lib/conditionals/character/1300/Jade'
import { TheHerta } from 'lib/conditionals/character/1400/TheHerta'
import { TrailblazerRemembranceStelle } from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import { VictoryInABlink } from 'lib/conditionals/lightcone/4star/VictoryInABlink'
import { IntotheUnreachableVeil } from 'lib/conditionals/lightcone/5star/IntotheUnreachableVeil'
import { ScentAloneStaysTrue } from 'lib/conditionals/lightcone/5star/ScentAloneStaysTrue'
import { YetHopeIsPriceless } from 'lib/conditionals/lightcone/5star/YetHopeIsPriceless'
import { Sets } from 'lib/constants/constants'
import { buildSpdPresetOptions } from 'lib/constants/spdPresetConfig'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { Assets } from 'lib/rendering/assets'
import { DEFAULT_LC_IMAGE_OFFSET } from 'lib/rendering/lcImageTransform'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { BenchmarkResults } from 'lib/tabs/tabBenchmarks/BenchmarkResults'
import { BenchmarkSetting } from 'lib/tabs/tabBenchmarks/BenchmarkSettings'
import {
  applyTeamAwareSetConditionalPresetsToBenchmarkFormInstance,
  handleBenchmarkFormSubmit,
  handleCharacterSelectChange,
  handleResetBenchmarks,
} from 'lib/tabs/tabBenchmarks/benchmarksTabController'
import { CharacterEidolonFormRadio } from 'lib/tabs/tabBenchmarks/CharacterEidolonFormRadio'
import { LightConeSuperimpositionFormRadio } from 'lib/tabs/tabBenchmarks/LightConeSuperimpositionFormRadio'
import {
  type BenchmarkForm,
  useBenchmarksTabStore,
} from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { SetsSection } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/SetsSection'
import { CenteredImage } from 'lib/ui/CenteredImage'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { ComboboxNumberInput } from 'lib/ui/ComboboxNumberInput'
import { CustomHorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { LightConeSelect } from 'lib/ui/selectors/LightConeSelect'
import {
  useEffect,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import teammateClasses from 'style/teammateCard.module.css'
import type {
  CharacterId,
} from 'types/character'
import type { ReactElement } from 'types/components'
import { useShallow } from 'zustand/react/shallow'
import styles from './BenchmarksTab.module.css'

const GAP = 8

const BOOLEAN_SEGMENTS = [
  {
    label: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconCheck size={16} />
      </div>
    ),
    value: 'true',
  },
  {
    label: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconX size={16} />
      </div>
    ),
    value: 'false',
  },
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
    updateTeammate,
    teammate0,
    teammate1,
    teammate2,
  } = useBenchmarksTabStore(useShallow((s) => ({
    updateTeammate: s.updateTeammate,
    teammate0: s.teammate0,
    teammate1: s.teammate1,
    teammate2: s.teammate2,
  })))

  useEffect(() => {
    benchmarkForm.setValues(defaultForm as BenchmarkForm)
    updateTeammate(0, defaultForm.teammate0)
    updateTeammate(1, defaultForm.teammate1)
    updateTeammate(2, defaultForm.teammate2)
    handleCharacterSelectChange(defaultForm.characterId ?? null, benchmarkForm)
  }, [])

  useEffect(() => {
    applyTeamAwareSetConditionalPresetsToBenchmarkFormInstance(benchmarkForm, teammate0, teammate1, teammate2)
  }, [teammate0, teammate1, teammate2])

  return (
    <Flex direction='column' className={styles.container} align='center' gap='xl'>
      <ColorizedTitleWithInfo
        text={t('Title') /* 'Benchmark Generator' */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/benchmark-generator.md'
      />

      <Paper p='xl' withBorder className={styles.inputPaper}>
        <BenchmarkInputs form={benchmarkForm} />
      </Paper>

      <DPSScoreDisclaimer />

      <BenchmarkResults />
    </Flex>
  )
}

function BenchmarkInputs({ form }: { form: UseFormReturnType<BenchmarkForm> }) {
  return (
    <Flex direction='column' align='center'>
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
  const characterId = form.values.characterId ?? ''
  const lightCone = form.values.lightCone ?? ''

  const lightConeMetadata = getGameMetadata().lightCones[lightCone]
  const lcOffset = lightConeMetadata?.imageOffset ?? DEFAULT_LC_IMAGE_OFFSET

  return (
    <Flex direction='column' gap={GAP}>
      <Flex direction='column' gap={GAP}>
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
  const characterId = form.values.characterId ?? ''

  return (
    <Flex direction='column' gap={GAP} className={styles.middlePanel} justify='space-between'>
      <Flex direction='column' gap={GAP}>
        <HeaderText>{t('CharacterHeader') /* Character */}</HeaderText>
        <CharacterSelect
          value={form.values.characterId}
          onChange={(id: CharacterId | null) => {
            if (id) form.setFieldValue('characterId', id)
            handleCharacterSelectChange(id, form)
          }}
          showIcon={false}
          clearable={false}
        />
        <CharacterEidolonFormRadio form={form} />
      </Flex>

      <Flex direction='column' gap={GAP}>
        <HeaderText>{t('LCHeader') /* Light Cone */}</HeaderText>
        <LightConeSelect
          value={form.values.lightCone}
          characterId={characterId}
          onChange={(id) => {
            if (id) form.setFieldValue('lightCone', id)
          }}
          clearable={false}
        />
        <LightConeSuperimpositionFormRadio form={form} />
      </Flex>

      <TeammatesSection />
    </Flex>
  )
}

function RightPanel({ form }: { form: UseFormReturnType<BenchmarkForm> }) {
  const loading = useBenchmarksTabStore((s) => s.loading)
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'RightPanel' })
  const { t: tOptimizerTab } = useTranslation('optimizerTab')

  return (
    <Flex direction='column' className={styles.rightPanel} justify='space-between'>
      <Flex direction='column' gap={GAP}>
        <HeaderText>{t('Settings.Header') /* Settings */}</HeaderText>

        <SpdBenchmarkSetting form={form} />
        <BenchmarkSetting label='ERR' itemName='errRope' form={form}>
          <SegmentedControl fullWidth style={{ width: 80 }} data={BOOLEAN_SEGMENTS} />
        </BenchmarkSetting>
        <BenchmarkSetting label='SubDPS' itemName='subDps' form={form}>
          <SegmentedControl fullWidth style={{ width: 80 }} data={BOOLEAN_SEGMENTS} />
        </BenchmarkSetting>

        <CustomHorizontalDivider height={8} />

        <HeaderText>{t('SetsHeader') /* Benchmark sets */}</HeaderText>

        <Flex direction='column' gap={5}>
          <SetsSection simType={StatSimTypes.Benchmarks} form={form} />
          <Button
            onClick={() => setOpen(OpenCloseIDs.BENCHMARKS_SETS_DRAWER)}
            leftSection={<IconSettings size={16} />}
            variant='default'
          >
            {tOptimizerTab('SetConditionals.Title') /* Conditional set effects */}
          </Button>
        </Flex>
      </Flex>

      <Flex direction='column' gap={GAP}>
        <Button
          onClick={() => handleBenchmarkFormSubmit(form.getValues())}
          loading={loading}
          leftSection={<IconBoltFilled size={16} />}
          className={styles.generateButton}
        >
          {t('ButtonText.Generate') /* Generate benchmarks */}
        </Button>
        <Button
          onClick={handleResetBenchmarks}
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
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'RightPanel.Settings' })
  const { t: tOptimizerTab } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })

  const options = useMemo(() => buildSpdPresetOptions(tOptimizerTab), [tOptimizerTab])

  return (
    <Flex align='center' gap={10} justify='space-between'>
      {t('SPD')}
      <ComboboxNumberInput
        value={form.getInputProps('basicSpd').value}
        onChange={(val) => form.setFieldValue('basicSpd', val ?? 0)}
        options={options}
        style={{ width: 80 }}
      />
    </Flex>
  )
}

function TeammatesSection() {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'MiddlePanel' })
  return (
    <Flex direction='column'>
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
    onCharacterModalOk,
    setSelectedTeammateIndex,
    teammate,
  } = useBenchmarksTabStore(useShallow((s) => ({
    onCharacterModalOk: s.onCharacterModalOk,
    setSelectedTeammateIndex: s.setSelectedTeammateIndex,
    teammate: [s.teammate0, s.teammate1, s.teammate2][index],
  })))
  const characterId = teammate?.characterId
  const lightCone = teammate?.lightCone
  const characterEidolon = teammate?.characterEidolon ?? 0
  const lightConeSuperimposition = teammate?.lightConeSuperimposition ?? 1

  return (
    <div
      className={`custom-grid ${teammateClasses.teammateCard}`}
      style={{ cursor: 'pointer' }}
      onClick={() => {
        setSelectedTeammateIndex(index)
        useCharacterModalStore.getState().openOverlay({
          initialCharacter: teammate ? { form: teammate } : undefined,
          onOk: onCharacterModalOk,
          showSetSelection: true,
        })
      }}
    >
      <Flex direction='column' align='center'>
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
