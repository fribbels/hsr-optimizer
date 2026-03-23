import {
  IconCamera,
  IconCheck,
  IconDownload,
  IconMoon,
  IconSettings,
  IconSun,
  IconX,
} from '@tabler/icons-react'
import { Button, ColorInput, Flex, SegmentedControl } from '@mantine/core'

import i18next from 'i18next'
import { DEFAULT_SHOWCASE_COLOR, resolveShowcaseTheme } from 'lib/characterPreview/showcaseColorService'
import {
  editShowcasePreferences,
} from 'lib/characterPreview/showcaseCustomizationController'
import {
  ShowcaseColorMode,
  Stats,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'

import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import {
  ScoringType,
} from 'lib/scoring/simScoringUtils'
import { AppPages } from 'lib/constants/appPages'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/appStore'
import { getScoringMetadata, useScoringStore } from 'lib/stores/scoringStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { buildSpdPresetOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/spdPresetConfig'
import { defaultPadding } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { ComboboxNumberInput } from 'lib/ui/ComboboxNumberInput'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { getSelectedCharacter } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { useScreenshotAction } from 'lib/hooks/useScreenshotAction'
import React, {
  memo,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  type CharacterId,
} from 'types/character'
import { cardTotalW } from 'lib/constants/constantsUi'
import { ShowcaseSource } from './CharacterPreviewComponents'
import classes from './ShowcaseCustomizationSidebar.module.css'

interface ShowcaseCustomizationSidebarProps {
  id: string
  source: ShowcaseSource
  characterId: CharacterId
  originalSpd: number | undefined
  scoringType: ScoringType
  seedColor: string
  effectiveColorMode: ShowcaseColorMode
  portraitSwatches: string[]
}

export const ShowcaseCustomizationSidebar = memo(function ShowcaseCustomizationSidebar(props: ShowcaseCustomizationSidebarProps) {
    const {
      id,
      source,
      characterId,
      originalSpd,
      scoringType,
      seedColor,
      effectiveColorMode,
      portraitSwatches,
    } = props

    const { t: tCustomization } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.CustomizationSidebar' })
    const { t: tScoring } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.ScoringSidebar' })
    const { loading, trigger: screenshot } = useScreenshotAction(id)
    const showcaseDarkMode = useGlobalStore((s) => s.savedSession.showcaseDarkMode)
    const showcaseUID = useGlobalStore((s) => s.savedSession.showcaseUID)
    const showcasePreciseSpd = useGlobalStore((s) => s.savedSession.showcasePreciseSpd)
    const spdBenchmark = useShowcaseTabStore(
      (s) => s.showcaseTemporaryOptionsByCharacter[characterId]?.spdBenchmark
    )
    const scoringMetadata = useScoringMetadata(characterId)
    const spdValue = scoringMetadata.stats[Stats.SPD]
    const deprioritizeBuffs = scoringMetadata.simulation?.deprioritizeBuffs ?? false

    // Local color state for responsive ColorInput during drag — store only updates on drag end.
    // setState-during-render pattern (React 19) — syncs local state without an extra effect render.
    const [localColor, setLocalColor] = useState(seedColor)
    const [prevSeedColor, setPrevSeedColor] = useState(seedColor)
    if (seedColor !== prevSeedColor) {
      setPrevSeedColor(seedColor)
      setLocalColor(seedColor)
    }

    function onColorDrag(newColor: string) {
      setLocalColor(newColor)
      // Imperatively update CSS vars for instant card preview without React re-render
      const theme = resolveShowcaseTheme(newColor, showcaseDarkMode)
      const el = document.getElementById(id)
      if (el) {
        el.style.setProperty('--showcase-card-bg', theme.cardBackgroundColor)
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

    const onShowUIDChange = (showUID: boolean) => {
      useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.showcaseUID, showUID)
      SaveState.delayedSave()
    }

    function onShowcasePreciseSpdChange(preciseSpd: boolean) {
      useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.showcasePreciseSpd, preciseSpd)
      SaveState.delayedSave()
    }

    function onShowcaseSpdValueChange(spdValue: number) {
      const scoringMetadata = getScoringMetadata(characterId)
      const update = { stats: { ...scoringMetadata.stats, [Stats.SPD]: spdValue } }

      useScoringStore.getState().updateCharacterOverrides(characterId, update)
      SaveState.delayedSave()
    }


    function onShowcaseSpdBenchmarkChange(spdBenchmark: number | undefined) {
      const actualValue = spdBenchmark === -1 ? undefined : spdBenchmark
      useShowcaseTabStore.getState().setSpdBenchmark(characterId, actualValue)
    }

    function onTraceClick() {
      useGlobalStore.getState().setStatTracesDrawerFocusCharacter(characterId)
      setOpen(OpenCloseIDs.TRACES_DRAWER)
    }

    function onShowcaseDeprioritizeBuffsChange(deprioritizeBuffs: boolean) {
      const scoringMetadata = getScoringMetadata(characterId)
      if (scoringMetadata?.simulation) {
        const update = { deprioritizeBuffs }
        useScoringStore.getState().updateSimulationOverrides(characterId, update)
        SaveState.delayedSave()
      }
    }

    const { spdPrecisionOptions, spdWeightOptions, buffPriorityOptions } = useMemo(() => {
      return {
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
      }
    }, [tScoring])

    if (source === ShowcaseSource.BUILDS_MODAL) return <></>

    return (
      <Flex
        direction="column"
        gap={16}
        className={classes.sidebarContainer}
        style={{ marginLeft: cardTotalW + 8 }}
      >
        <Flex
          direction="column"
          gap={6}
          style={cardStyle}
        >
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

          <Button
            leftSection={<IconSettings size={16} />}
            onClick={onTraceClick}
            variant="default"
          >
            {tScoring('Stats.ButtonText') /* Traces */}
          </Button>

          <Button
            leftSection={<IconSettings size={16} />}
            onClick={() => setOpen(OpenCloseIDs.SCORING_MODAL)}
            variant="default"
          >
            {tScoring('Stats.WeightsButton') /* Weights */}
          </Button>

          <HorizontalDivider />

          <HeaderText className={classes.headerCenteredMb}>
            {tScoring('SpdPrecision.Header') /* SPD precision */}
          </HeaderText>

          <SegmentedControl
            data={spdPrecisionOptions.map((o) => ({ label: o.label, value: String(o.value) }))}
            fullWidth
            value={String(showcasePreciseSpd)}
            onChange={(value) => onShowcasePreciseSpdChange(value === 'true')}
          />

          {scoringType !== ScoringType.NONE
            && (
              <>
                <HorizontalDivider />

                <HeaderText className={classes.headerCenteredMb}>
                  {tScoring('SpdWeight.Header') /* SPD weight */}
                </HeaderText>

                <SegmentedControl
                  data={spdWeightOptions.map((o) => ({ label: o.label, value: String(o.value) }))}
                  fullWidth
                  value={String(spdValue)}
                  onChange={(value) => onShowcaseSpdValueChange(Number(value))}
                />
              </>
            )}

          {scoringType === ScoringType.COMBAT_SCORE
            && (
              <>
                <HorizontalDivider />

                <HeaderText className={classes.headerCenteredMb}>
                  {tScoring('BenchmarkSpd.Header') /* SPD benchmark */}
                </HeaderText>

                <SpdBenchmarkCombobox
                  spdBenchmark={spdBenchmark}
                  spdFilter={originalSpd}
                  onSpdBenchmarkChange={onShowcaseSpdBenchmarkChange}
                />
              </>
            )}

          {scoringType === ScoringType.COMBAT_SCORE
            && (
              <>
                <HorizontalDivider />

                <HeaderText className={classes.headerCenteredMb}>
                  {tScoring('BuffPriority.Header') /* Buff priority */}
                </HeaderText>

                <SegmentedControl
                  data={buffPriorityOptions.map((o) => ({ label: o.label, value: String(o.value) }))}
                  fullWidth
                  value={String(deprioritizeBuffs)}
                  onChange={(value) => onShowcaseDeprioritizeBuffsChange(value === 'true')}
                />
              </>
            )}
        </Flex>

        <Flex
          direction="column"
          gap={6}
          style={cardStyle}
        >
          <HeaderText className={classes.headerCentered}>
            {tCustomization('Label')}
          </HeaderText>

          <HorizontalDivider />

          <ColorInput
            swatches={portraitSwatches}
            value={localColor}
            onChange={onColorDrag}
            onChangeEnd={onColorChangeEnd}
            format="hex"
            styles={{ input: { textTransform: 'uppercase', fontFamily: 'monospace' } }}
          />

          <HorizontalDivider />

          <SegmentedControl
            orientation="vertical"
            fullWidth
            data={[
              { value: ShowcaseColorMode.AUTO, label: tCustomization('Modes.Auto') },
              { value: ShowcaseColorMode.CUSTOM, label: tCustomization('Modes.Custom') },
              { value: ShowcaseColorMode.STANDARD, label: tCustomization('Modes.Standard') },
            ]}
            value={effectiveColorMode}
            onChange={(value) => onColorModeChange(value as ShowcaseColorMode)}
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

          {source === ShowcaseSource.SHOWCASE_TAB
            && (
              <>
                <HorizontalDivider />

                <HeaderText className={classes.headerCenteredMb}>
                  {tCustomization('ShowUID') /* Show UID */}
                </HeaderText>

                <SegmentedControl
                  data={[
                    { value: 'true', label: <IconCheck /> },
                    { value: 'false', label: <IconX /> },
                  ]}
                  fullWidth
                  value={String(showcaseUID)}
                  onChange={(value) => onShowUIDChange(value === 'true')}
                />
              </>
            )}

          <HorizontalDivider />

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
      </Flex>
    )
})

function SpdBenchmarkCombobox(props: {
  spdBenchmark: number | undefined,
  spdFilter?: number,
  onSpdBenchmarkChange: (n: number | undefined) => void,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })
  const { t: tCharacterTab } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.ScoringSidebar.BenchmarkSpd' })

  const options = useMemo(() => buildSpdPresetOptions(t, {
    skipNoMinimum: true,
    disableAbove: props.spdFilter,
    extraGroups: [{
      group: tCharacterTab('BenchmarkOptionsLabel'),
      items: [
        { label: tCharacterTab('CurrentSpdLabel'), value: '-1' },
        { label: tCharacterTab('BaseSpdLabel'), value: '0' },
      ],
    }],
  }), [t, tCharacterTab, props.spdFilter])

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

const shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

const cardStyle = {
  backgroundColor: 'var(--bg-sidebar)',
  boxShadow: shadow,
  borderRadius: 6,
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
