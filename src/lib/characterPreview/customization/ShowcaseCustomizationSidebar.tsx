import {
  Button,
  ColorInput,
  Flex,
  SegmentedControl,
} from '@mantine/core'
import {
  IconCamera,
  IconCheck,
  IconDownload,
  IconMoon,
  IconSettings,
  IconSun,
  IconX,
} from '@tabler/icons-react'
import i18next from 'i18next'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { withAlpha } from 'lib/characterPreview/color/colorUtils'
import {
  DEFAULT_SHOWCASE_COLOR,
  resolveShowcaseTheme,
} from 'lib/characterPreview/color/showcaseColorService'
import { editShowcasePreferences } from 'lib/characterPreview/customization/showcaseCustomizationController'
import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import { AppPages } from 'lib/constants/appPages'
import {
  ShowcaseColorMode,
  Stats,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import {
  cardTotalW,
  defaultGap,
  defaultPadding,
} from 'lib/constants/constantsUi'
import { buildSpdPresetOptions } from 'lib/constants/spdPresetConfig'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { useScreenshotAction } from 'lib/hooks/useScreenshotAction'
import { Assets } from 'lib/rendering/assets'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  getScoringMetadata,
  useScoringStore,
} from 'lib/stores/scoring/scoringStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import {
  getSelectedCharacter,
  useShowcaseTabStore,
} from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { ComboboxNumberInput } from 'lib/ui/ComboboxNumberInput'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import React, {
  memo,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { type CharacterId } from 'types/character'
import classes from './ShowcaseCustomizationSidebar.module.css'

interface ShowcaseCustomizationSidebarProps {
  id: string
  source: ShowcaseSource
  characterId: CharacterId
  scoringType: ScoringType
  seedColor: string
  effectiveColorMode: ShowcaseColorMode
  portraitSwatches: string[]
  cardBgAlpha: number
}

export const ShowcaseCustomizationSidebar = memo(function ShowcaseCustomizationSidebar({
  id,
  source,
  characterId,
  scoringType,
  seedColor,
  effectiveColorMode,
  portraitSwatches,
  cardBgAlpha,
}: ShowcaseCustomizationSidebarProps) {
  if (source === ShowcaseSource.BUILDS_MODAL) return null

  return (
    <Flex
      direction='column'
      gap={defaultGap + 2}
      className={classes.sidebarContainer}
      style={{ marginLeft: cardTotalW + 8 }}
    >
      <ScreenshotPanel id={id} />
      <ScoringPanel characterId={characterId} scoringType={scoringType} />
      <CustomizationPanel
        id={id}
        characterId={characterId}
        seedColor={seedColor}
        effectiveColorMode={effectiveColorMode}
        portraitSwatches={portraitSwatches}
        cardBgAlpha={cardBgAlpha}
        source={source}
      />
    </Flex>
  )
})

// =============================================================================

const ScreenshotPanel = memo(function ScreenshotPanel({ id }: { id: string }) {
  const { loading, trigger: screenshot } = useScreenshotAction(id)

  return (
    <Flex direction='column' gap={6} style={cardStyle}>
      <Flex gap={6}>
        <Button
          loading={loading}
          onClick={() => screenshot('clipboard', getActiveCharacterName())}
          className={classes.actionButton}
          style={{ height: 'auto' }}
        >
          <IconCamera size={18} />
        </Button>
        <Button
          loading={loading}
          onClick={() => screenshot('download', getActiveCharacterName())}
          className={classes.actionButton}
          style={{ height: 'auto' }}
        >
          <IconDownload size={18} />
        </Button>
      </Flex>
    </Flex>
  )
})

// =============================================================================

const ScoringPanel = memo(function ScoringPanel({ characterId, scoringType }: {
  characterId: CharacterId,
  scoringType: ScoringType,
}) {
  const { t: tScoring } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.ScoringSidebar' })
  const showcasePreciseSpd = useGlobalStore((s) => s.savedSession.showcasePreciseSpd)
  const spdBenchmark = useShowcaseTabStore((s) => s.showcaseTemporaryOptionsByCharacter[characterId]?.spdBenchmark)
  const scoringMetadata = useScoringMetadata(characterId)
  const spdValue = scoringMetadata.stats[Stats.SPD]
  const deprioritizeBuffs = scoringMetadata.simulation?.deprioritizeBuffs ?? false

  function onSpdPrecisionChange(preciseSpd: boolean) {
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.showcasePreciseSpd, preciseSpd)
    SaveState.delayedSave()
  }

  function onSpdValueChange(value: number) {
    useScoringStore.getState().updateCharacterOverrides(characterId, { stats: { [Stats.SPD]: value } })
    SaveState.delayedSave()
  }

  function onSpdBenchmarkChange(value: number | undefined) {
    useShowcaseTabStore.getState().setSpdBenchmark(characterId, value === -1 ? undefined : value)
  }

  function onDeprioritizeBuffsChange(value: boolean) {
    const meta = getScoringMetadata(characterId)
    if (meta?.simulation) {
      useScoringStore.getState().updateSimulationOverrides(characterId, { deprioritizeBuffs: value })
      SaveState.delayedSave()
    }
  }

  function onTraceClick() {
    useGlobalStore.getState().setStatTracesDrawerFocusCharacter(characterId)
    setOpen(OpenCloseIDs.TRACES_DRAWER)
  }

  const { spdPrecisionOptions, spdWeightOptions, buffPriorityOptions } = useMemo(() => ({
    spdPrecisionOptions: [
      { value: false, label: tScoring('SpdPrecision.Low') /* '.0' */ },
      { value: true, label: tScoring('SpdPrecision.High') /* '.000' */ },
    ],
    spdWeightOptions: [
      { value: 1, label: tScoring('SpdWeight.Max') /* '100%' */ },
      { value: 0, label: tScoring('SpdWeight.Min') /* '0%' */ },
    ],
    buffPriorityOptions: [
      { value: false, label: tScoring('BuffPriority.High') /* 'Main' */ },
      { value: true, label: tScoring('BuffPriority.Low') /* 'Sub' */ },
    ],
  }), [tScoring])

  return (
    <Flex direction='column' gap={6} style={cardStyle}>
      <Flex justify='space-between' align='center' style={{ position: 'relative' }}>
        <span></span>
        <HeaderText className={classes.centeredHeader}>
          {tScoring('Stats.Header') /* Stats */}
        </HeaderText>
        <a
          href='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/score-customization.md'
          target='_blank'
          className={classes.helpLink}
          rel='noreferrer'
        >
          <img src={Assets.getQuestion()} className={classes.helpIcon} />
        </a>
      </Flex>

      <HorizontalDivider />

      {scoringType === ScoringType.COMBAT_SCORE && (
        <>
          <HeaderText className={classes.headerCenteredMb}>
            {tScoring('BuffPriority.Header') /* DPS mode */}
          </HeaderText>
          <SegmentedControl
            data={buffPriorityOptions.map((o) => ({ label: o.label, value: String(o.value) }))}
            fullWidth
            value={String(deprioritizeBuffs)}
            onChange={(value) => onDeprioritizeBuffsChange(value === 'true')}
          />
          <HorizontalDivider />
        </>
      )}

      {scoringType !== ScoringType.NONE && (
        <>
          <HeaderText className={classes.headerCenteredMb}>
            {tScoring('SpdWeight.Header') /* SPD weight */}
          </HeaderText>
          <SegmentedControl
            data={spdWeightOptions.map((o) => ({ label: o.label, value: String(o.value) }))}
            fullWidth
            value={String(spdValue)}
            onChange={(value) => onSpdValueChange(Number(value))}
          />
          <HorizontalDivider />
        </>
      )}

      <HeaderText className={classes.headerCenteredMb}>
        {tScoring('SpdPrecision.Header') /* SPD precision */}
      </HeaderText>
      <SegmentedControl
        data={spdPrecisionOptions.map((o) => ({ label: o.label, value: String(o.value) }))}
        fullWidth
        value={String(showcasePreciseSpd)}
        onChange={(value) => onSpdPrecisionChange(value === 'true')}
      />

      {scoringType === ScoringType.COMBAT_SCORE && (
        <>
          <HorizontalDivider />
          <HeaderText className={classes.headerCenteredMb}>
            {tScoring('BenchmarkSpd.Header') /* SPD benchmark */}
          </HeaderText>
          <SpdBenchmarkCombobox
            spdBenchmark={spdBenchmark}
            onSpdBenchmarkChange={onSpdBenchmarkChange}
          />
        </>
      )}

      <HorizontalDivider />

      <Button
        leftSection={<IconSettings size={16} />}
        onClick={() => {
          useGlobalStore.getState().setScoringAlgorithmFocusCharacter(characterId)
          setOpen(OpenCloseIDs.SCORING_MODAL)
        }}
        variant='default'
      >
        {tScoring('Stats.WeightsButton') /* Weights */}
      </Button>

      <Button
        leftSection={<IconSettings size={16} />}
        onClick={onTraceClick}
        variant='default'
      >
        {tScoring('Stats.ButtonText') /* Traces */}
      </Button>
    </Flex>
  )
})

// =============================================================================

const CustomizationPanel = memo(function CustomizationPanel({
  id,
  characterId,
  seedColor,
  effectiveColorMode,
  portraitSwatches,
  cardBgAlpha,
  source,
}: {
  id: string,
  characterId: CharacterId,
  seedColor: string,
  effectiveColorMode: ShowcaseColorMode,
  portraitSwatches: string[],
  cardBgAlpha: number,
  source: ShowcaseSource,
}) {
  const { t: tCustomization } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.CustomizationSidebar' })
  const showcaseDarkMode = useGlobalStore((s) => s.savedSession.showcaseDarkMode)
  const showcaseUID = useGlobalStore((s) => s.savedSession.showcaseUID)

  // setState-during-render (React 19): syncs local drag color to external seedColor without an extra effect render.
  const [localColor, setLocalColor] = useState(seedColor)
  const [prevSeedColor, setPrevSeedColor] = useState(seedColor)
  if (seedColor !== prevSeedColor) {
    setPrevSeedColor(seedColor)
    setLocalColor(seedColor)
  }

  function onColorDrag(newColor: string) {
    setLocalColor(newColor)
    // Imperatively update CSS vars for instant card preview without a React re-render
    const theme = resolveShowcaseTheme(newColor, showcaseDarkMode)
    const el = document.getElementById(id)
    if (el) {
      el.style.setProperty('--showcase-card-bg', withAlpha(theme.cardBackgroundColor, cardBgAlpha))
      el.style.setProperty('--showcase-card-border', theme.cardBorderColor)
    }
  }

  function onColorChangeEnd(newColor: string) {
    if (newColor === DEFAULT_SHOWCASE_COLOR) return
    editShowcasePreferences(characterId, { color: newColor, colorMode: ShowcaseColorMode.CUSTOM })
  }

  function onColorModeChange(newColorMode: ShowcaseColorMode) {
    editShowcasePreferences(characterId, { colorMode: newColorMode })
  }

  function onBrightnessModeChange(darkMode: boolean) {
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.showcaseDarkMode, darkMode)
    SaveState.delayedSave()
  }

  function onShowUIDChange(showUID: boolean) {
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.showcaseUID, showUID)
    SaveState.delayedSave()
  }

  return (
    <Flex direction='column' gap={6} style={cardStyle}>
      <HeaderText className={classes.headerCentered}>
        {tCustomization('Label')}
      </HeaderText>

      <HorizontalDivider />

      <ColorInput
        swatches={portraitSwatches}
        value={localColor}
        onChange={onColorDrag}
        onChangeEnd={onColorChangeEnd}
        format='hex'
        styles={{
          input: { textTransform: 'uppercase', fontFamily: 'monospace' },
          colorPreview: { '--cs-radius': '4px' } as React.CSSProperties,
        }}
      />

      <HorizontalDivider />

      <SegmentedControl
        data={[
          { value: 'false', label: <IconSun size={14} /> },
          { value: 'true', label: <IconMoon size={14} /> },
        ]}
        fullWidth
        value={String(showcaseDarkMode)}
        onChange={(value) => onBrightnessModeChange(value === 'true')}
      />

      <HorizontalDivider />

      <SegmentedControl
        orientation='vertical'
        fullWidth
        data={[
          { value: ShowcaseColorMode.AUTO, label: tCustomization('Modes.Auto') },
          { value: ShowcaseColorMode.CUSTOM, label: tCustomization('Modes.Custom') },
          { value: ShowcaseColorMode.STANDARD, label: tCustomization('Modes.Standard') },
        ]}
        value={effectiveColorMode}
        onChange={(value) => onColorModeChange(value as ShowcaseColorMode)}
      />

      {source === ShowcaseSource.SHOWCASE_TAB && (
        <>
          <HorizontalDivider />
          <HeaderText className={classes.headerCenteredMb} style={{ marginBottom: 1 }}>
            {tCustomization('ShowUID') /* Show UID */}
          </HeaderText>
          <SegmentedControl
            data={[
              { value: 'true', label: <IconCheck size={14} /> },
              { value: 'false', label: <IconX size={14} /> },
            ]}
            fullWidth
            value={String(showcaseUID)}
            onChange={(value) => onShowUIDChange(value === 'true')}
          />
        </>
      )}
    </Flex>
  )
})

// =============================================================================

function SpdBenchmarkCombobox(props: {
  spdBenchmark: number | undefined,
  onSpdBenchmarkChange: (n: number | undefined) => void,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })
  const { t: tCharacterTab } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.ScoringSidebar.BenchmarkSpd' })

  const spdFilter = useSimScoringContext(ScoringSelector.Preview)?.originalSpd

  const options = useMemo(() =>
    buildSpdPresetOptions(t, {
      skipNoMinimum: true,
      disableAbove: spdFilter,
      extraGroups: [{
        group: tCharacterTab('BenchmarkOptionsLabel'),
        items: [
          { label: tCharacterTab('CurrentSpdLabel'), value: '-1' },
          { label: tCharacterTab('BaseSpdLabel'), value: '0' },
        ],
      }],
    }), [t, tCharacterTab, spdFilter])

  return (
    <ComboboxNumberInput
      value={sanitizePositiveNumberElseUndefined(props.spdBenchmark)}
      onChange={props.onSpdBenchmarkChange}
      options={options}
      min={0}
    />
  )
}

function sanitizePositiveNumberElseUndefined(n?: number) {
  return n == undefined || n < 0 ? undefined : n
}

const cardStyle = {
  backgroundColor: 'var(--layer-1)',
  boxShadow: 'var(--shadow-card)',
  borderRadius: 'var(--radius-md)',
  padding: defaultPadding,
}

function getActiveCharacterName() {
  const t = i18next.getFixedT(null, 'gameData', 'Characters')
  let charId: CharacterId | null | undefined
  switch (useGlobalStore.getState().activeKey) {
    case AppPages.CHARACTERS:
      charId = useCharacterTabStore.getState().focusCharacter
      break
    case AppPages.SHOWCASE:
      charId = getSelectedCharacter()?.id
      break
    default:
      return
  }
  if (!charId) return
  return t(`${charId}.LongName`)
}
