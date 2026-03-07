import {
  CameraOutlined,
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
} from '@ant-design/icons'
import {
  Button,
  ColorPicker,
  Flex,
  InputNumber,
  Segmented,
  Select,
} from 'antd'
import { AggregationColor } from 'antd/es/color-picker/color'
import { GlobalToken } from 'antd/lib/theme/interface'
import i18next from 'i18next'
import {
  DEFAULT_SHOWCASE_COLOR,
  editShowcasePreferences,
} from 'lib/characterPreview/showcaseCustomizationController'
import { useAsyncSimScoringExecution } from 'lib/characterPreview/useAsyncSimScoringExecution'
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
import { AsyncSimScoringExecution } from 'lib/scoring/dpsScore'
import {
  ScoringType,
  SimulationScore,
} from 'lib/scoring/simScoringUtils'
import DB, { AppPages } from 'lib/state/db'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { generateSpdPresets } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { defaultPadding } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import {
  modifyCustomColor,
  organizeColors,
  selectClosestColor,
} from 'lib/utils/colorUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import {
  getPalette,
  PaletteResponse,
} from 'lib/utils/vibrantFork'
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  Character,
  CharacterId,
} from 'types/character'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { ShowcasePreferences } from 'types/metadata'
import { ShowcaseSource } from './CharacterPreviewComponents'

export interface ShowcaseCustomizationSidebarRef {
  onPortraitLoad: (src: string, characterId: CharacterId) => void
}

export interface ShowcaseCustomizationSidebarProps {
  id: string
  source: ShowcaseSource
  characterId: CharacterId
  token: GlobalToken
  showcasePreferences: ShowcasePreferences
  asyncSimScoringExecution: AsyncSimScoringExecution | null
  scoringType: ScoringType
  seedColor: string
  setSeedColor: (color: string) => void
  colorMode: ShowcaseColorMode
  setColorMode: (colorMode: ShowcaseColorMode) => void
}

const ShowcaseCustomizationSidebar = forwardRef<ShowcaseCustomizationSidebarRef, ShowcaseCustomizationSidebarProps>(
  (props, ref) => {
    const {
      id,
      source,
      characterId,
      asyncSimScoringExecution,
      scoringType,
      seedColor,
      setSeedColor,
      colorMode,
      setColorMode,
    } = props

    const { t: tCustomization } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.CustomizationSidebar' })
    const { t: tScoring } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.ScoringSidebar' })
    const [colors, setColors] = useState<string[]>([])
    const globalShowcasePreferences = window.store((s) => s.showcasePreferences)
    const setGlobalShowcasePreferences = window.store((s) => s.setShowcasePreferences)
    const [loading, setLoading] = useState<boolean>(false)
    const showcaseDarkMode = window.store((s) => s.savedSession.showcaseDarkMode)
    const showcaseUID = window.store((s) => s.savedSession.showcaseUID)
    const showcasePreciseSpd = window.store((s) => s.savedSession.showcasePreciseSpd)
    const scoringMetadata = useScoringMetadata(characterId)
    const spdValue = scoringMetadata.stats[Stats.SPD]
    const deprioritizeBuffs = scoringMetadata.simulation?.deprioritizeBuffs ?? false
    const simScoringExecution = useAsyncSimScoringExecution(asyncSimScoringExecution)

    useImperativeHandle(ref, () => ({
      onPortraitLoad: (img: string, characterId: CharacterId) => {
        if (DB.getCharacterById(characterId)?.portrait) {
          getPalette(img, (palette: PaletteResponse) => {
            const primary = modifyCustomColor(
              selectClosestColor([palette.Vibrant, palette.DarkVibrant, palette.Muted, palette.DarkMuted, palette.LightVibrant, palette.LightMuted]),
            )

            setSeedColor(primary)
            urlToColorCache[img] = primary

            setColors(organizeColors(palette))
            // debugColors.defaults = [palette.Vibrant, palette.DarkVibrant, palette.Muted, palette.DarkMuted, palette.LightVibrant, palette.LightMuted]
          })
        } else {
          setTimeout(() => {
            // Delayed to update color palette after render
            getPalette(img, (palette: PaletteResponse) => {
              setColors(organizeColors(palette))
              // debugColors.defaults = [palette.Vibrant, palette.DarkVibrant, palette.Muted, palette.DarkMuted, palette.LightVibrant, palette.LightMuted]
            })
          }, 1000)
        }
      },
    }))

    function onColorSelectorChange(newColor: string) {
      if (newColor == DEFAULT_SHOWCASE_COLOR) return

      editShowcasePreferences(
        characterId,
        globalShowcasePreferences,
        setGlobalShowcasePreferences,
        { color: newColor, colorMode: ShowcaseColorMode.CUSTOM },
      )

      console.log('Set seed color to', newColor)

      setColorMode(ShowcaseColorMode.CUSTOM)
      setSeedColor(newColor)
    }

    function onColorModeChange(newColorMode: ShowcaseColorMode) {
      editShowcasePreferences(
        characterId,
        globalShowcasePreferences,
        setGlobalShowcasePreferences,
        { colorMode: newColorMode },
      )

      console.log('Set color mode to', newColorMode)

      setColorMode(newColorMode)
    }

    function onBrightnessModeChange(darkMode: boolean) {
      console.log('Set dark mode to', darkMode)

      window.store.getState().setSavedSessionKey(SavedSessionKeys.showcaseDarkMode, darkMode)
    }

    const onShowUIDChange = (showUID: boolean) => {
      console.log('Set show UID to', showUID)

      window.store
        .getState()
        .setSavedSessionKey(SavedSessionKeys.showcaseUID, showUID)
    }

    function onShowcasePreciseSpdChange(preciseSpd: boolean) {
      console.log('Set precise spd to', preciseSpd)

      window.store.getState().setSavedSessionKey(SavedSessionKeys.showcasePreciseSpd, preciseSpd)
    }

    function onShowcaseSpdValueChange(spdValue: number) {
      console.log('Set spd value to', spdValue)

      const scoringMetadata = DB.getScoringMetadata(characterId)
      const update = { stats: { ...scoringMetadata.stats, [Stats.SPD]: spdValue } }

      DB.updateCharacterScoreOverrides(characterId, update)
    }

    function onShowcaseSpdBenchmarkChangeEvent(event: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) {
      // @ts-ignore
      const value: string = event?.target?.value
      if (value == null) return onShowcaseSpdBenchmarkChange(undefined)

      const spdBenchmark = parseFloat(value)
      if (isNaN(spdBenchmark)) return onShowcaseSpdBenchmarkChange(undefined)

      onShowcaseSpdBenchmarkChange(spdBenchmark)
    }

    function onShowcaseSpdBenchmarkChange(spdBenchmark: number | undefined) {
      console.log('Set spd benchmark to', spdBenchmark)

      const showcaseTemporaryOptionsByCharacter = TsUtils.clone(window.store.getState().showcaseTemporaryOptionsByCharacter)
      if (!showcaseTemporaryOptionsByCharacter[characterId]) showcaseTemporaryOptionsByCharacter[characterId] = {}

      // -1 is used as the "current" setting
      const actualValue = spdBenchmark == -1 ? undefined : spdBenchmark

      showcaseTemporaryOptionsByCharacter[characterId].spdBenchmark = actualValue

      window.store.getState().setShowcaseTemporaryOptionsByCharacter(showcaseTemporaryOptionsByCharacter)
    }

    function onTraceClick() {
      window.store.getState().setStatTracesDrawerFocusCharacter(characterId)
      setOpen(OpenCloseIDs.TRACES_DRAWER)
    }

    function onShowcaseDeprioritizeBuffsChange(deprioritizeBuffs: boolean) {
      const scoringMetadata = DB.getScoringMetadata(characterId)
      if (scoringMetadata?.simulation) {
        console.log('Set deprioritizeBuffs to', deprioritizeBuffs)
        const update = { deprioritizeBuffs }
        DB.updateSimulationScoreOverrides(characterId, update)
      }
    }

    const presets = [
      {
        label: tCustomization('PaletteLabel'),
        colors: colors,
      },
      // {
      //   label: 'DEBUG',
      //   colors: debugColors.defaults,
      // },
    ]

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
        vertical
        gap={16}
        style={{
          position: 'absolute',
          marginLeft: 1076,
          width: 130,
        }}
      >
        <Flex
          vertical
          gap={6}
          style={{
            backgroundColor: 'rgb(29 42 71)',
            boxShadow: shadow,
            borderRadius: 5,
            padding: defaultPadding,
          }}
        >
          <Flex justify='space-between' align='center' style={{ position: 'relative' }}>
            <span></span>
            <HeaderText style={{ textAlign: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {tScoring('Stats.Header') /* Stats */}
            </HeaderText>

            <a
              href='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/score-customization.md'
              target='_blank'
              style={{ display: 'inline-flex', alignItems: 'center' }}
              rel='noreferrer'
            >
              <img src={Assets.getQuestion()} style={{ height: 16, width: 16, opacity: 0.6, marginLeft: 'auto' }} />
            </a>
          </Flex>

          <HorizontalDivider />

          <Button
            icon={<SettingOutlined />}
            onClick={onTraceClick}
          >
            {tScoring('Stats.ButtonText') /* Traces */}
          </Button>

          <HorizontalDivider />

          <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
            {tScoring('SpdPrecision.Header') /* SPD precision */}
          </HeaderText>

          <Segmented
            options={spdPrecisionOptions}
            block
            value={showcasePreciseSpd}
            onChange={onShowcasePreciseSpdChange}
          />

          {scoringType != ScoringType.NONE
            && (
              <>
                <HorizontalDivider />

                <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
                  {tScoring('SpdWeight.Header') /* SPD weight */}
                </HeaderText>

                <Segmented
                  options={spdWeightOptions}
                  block
                  value={spdValue}
                  onChange={onShowcaseSpdValueChange}
                />
              </>
            )}

          {scoringType == ScoringType.COMBAT_SCORE
            && (
              <>
                <HorizontalDivider />

                <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
                  {tScoring('BenchmarkSpd.Header') /* SPD benchmark */}
                </HeaderText>

                <InputNumber
                  size='small'
                  controls={false}
                  style={{ width: '100%' }}
                  value={sanitizePositiveNumberElseUndefined(window.store.getState().showcaseTemporaryOptionsByCharacter[characterId]?.spdBenchmark)}
                  addonAfter={
                    <SelectSpdPresets
                      spdFilter={simScoringExecution?.result?.originalSpd}
                      onShowcaseSpdBenchmarkChange={onShowcaseSpdBenchmarkChange}
                      characterId={characterId}
                      simScoringResult={simScoringExecution?.result ?? null}
                    />
                  }
                  placeholder='...'
                  min={0}
                  onBlur={onShowcaseSpdBenchmarkChangeEvent}
                  onPressEnter={onShowcaseSpdBenchmarkChangeEvent}
                />
              </>
            )}

          {scoringType == ScoringType.COMBAT_SCORE
            && (
              <>
                <HorizontalDivider />

                <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
                  {tScoring('BuffPriority.Header') /* Buff priority */}
                </HeaderText>

                <Segmented
                  options={buffPriorityOptions}
                  block
                  value={deprioritizeBuffs}
                  onChange={onShowcaseDeprioritizeBuffsChange}
                />
              </>
            )}
        </Flex>

        <Flex
          vertical
          gap={6}
          style={{
            backgroundColor: 'rgb(29 42 71)',
            boxShadow: shadow,
            borderRadius: 5,
            padding: defaultPadding,
          }}
        >
          <HeaderText style={{ textAlign: 'center' }}>
            {tCustomization('Label')}
          </HeaderText>

          <HorizontalDivider />

          <ColorPicker
            presets={presets}
            defaultValue='#1677ff'
            value={seedColor}
            onChangeComplete={(value: AggregationColor) => {
              const color = value.toHexString()
              onColorSelectorChange(color)
            }}
            disabledAlpha
            disabledFormat
            showText
          />

          <HorizontalDivider />

          <Segmented
            vertical
            options={[
              { value: ShowcaseColorMode.AUTO, label: tCustomization('Modes.Auto') },
              { value: ShowcaseColorMode.CUSTOM, label: tCustomization('Modes.Custom') },
              { value: ShowcaseColorMode.STANDARD, label: tCustomization('Modes.Standard') },
            ]}
            value={colorMode}
            onChange={onColorModeChange}
          />

          <HorizontalDivider />

          <Segmented
            options={[
              { value: false, label: <SunOutlined /> },
              { value: true, label: <MoonOutlined /> },
            ]}
            block
            value={showcaseDarkMode}
            onChange={onBrightnessModeChange}
          />

          {source == ShowcaseSource.SHOWCASE_TAB
            && (
              <>
                <HorizontalDivider />

                <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
                  {tCustomization('ShowUID') /* Show UID */}
                </HeaderText>

                <Segmented
                  options={[
                    { value: true, label: <CheckOutlined /> },
                    { value: false, label: <CloseOutlined /> },
                  ]}
                  block
                  value={showcaseUID}
                  onChange={onShowUIDChange}
                />
              </>
            )}

          <HorizontalDivider />

          <Flex justify='space-between'>
            <Button
              icon={<CameraOutlined style={{ fontSize: 30 }} />}
              loading={loading}
              onClick={() => clipboardClicked(id, 'clipboard', setLoading, props.seedColor)}
              type='primary'
              style={{ height: 50, width: 50, borderRadius: 8 }}
            >
            </Button>
            <Button
              icon={<DownloadOutlined style={{ fontSize: 30 }} />}
              loading={loading}
              onClick={() => clipboardClicked(id, 'download', setLoading, props.seedColor)}
              type='primary'
              style={{ height: 50, width: 50, borderRadius: 8 }}
            >
            </Button>
          </Flex>
        </Flex>
      </Flex>
    )
  },
)

ShowcaseCustomizationSidebar.displayName = 'ShowcaseCustomizationSidebar'
export default ShowcaseCustomizationSidebar

function SelectSpdPresets(props: {
  characterId: string,
  onShowcaseSpdBenchmarkChange: (n: number) => void,
  simScoringResult: SimulationScore | null,
  spdFilter?: number,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })
  const { t: tCharacterTab } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.ScoringSidebar.BenchmarkSpd' })

  const spdPresetOptions = useMemo(() => {
    const { categories } = generateSpdPresets(t)

    const categoryOptions = categories.map((category) => {
      // Skip the first preset (SPD0 / "No minimum speed") since "Base SPD" covers that
      const presets = Object.values(category.presets).slice(1).map((preset) => ({
        ...preset,
        disabled: props.spdFilter != null && preset.value != null && preset.value > props.spdFilter,
        label: <div>{preset.label}</div>,
      }))
      return {
        label: <span>{category.label}</span>,
        options: presets,
      }
    })

    return [
      {
        label: <span>{tCharacterTab('BenchmarkOptionsLabel') /* Benchmark options */}</span>,
        title: 'benchmark',
        options: [
          {
            label: (
              <b>
                <span>{tCharacterTab('CurrentSpdLabel') /* Current SPD - The benchmark will match your basic SPD */}</span>
              </b>
            ),
            value: -1,
          },
          {
            label: <span>{tCharacterTab('BaseSpdLabel') /* Base SPD - The benchmark will target a minimal SPD build */}</span>,
            value: 0,
          },
        ],
      },
      ...categoryOptions,
    ]
  }, [t, tCharacterTab, props.spdFilter])

  return (
    <Select
      style={{ width: 34 }}
      labelRender={() => <></>}
      dropdownStyle={{ width: 'fit-content' }}
      popupClassName='spd-preset-dropdown'
      options={spdPresetOptions}
      placement='bottomRight'
      listHeight={800}
      value={null}
      onChange={props.onShowcaseSpdBenchmarkChange}
    />
  )
}

function clipboardClicked(elementId: string, action: string, setLoading: (b: boolean) => void, _color: string) {
  setLoading(true)
  setTimeout(() => {
    void Utils.screenshotElementById(elementId, action, getActiveCharacterName()).finally(() => {
      setLoading(false)
    })
  }, 100)
}

function sanitizePositiveNumberElseUndefined(n?: number) {
  return n == undefined || n < 0 ? undefined : n
}

const shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

const STANDARD_COLOR = '#799ef4'

export function standardShowcasePreferences() {
  return {
    color: STANDARD_COLOR,
    colorMode: ShowcaseColorMode.STANDARD,
  }
}

export function defaultShowcasePreferences(color: string) {
  return {
    color: color,
    colorMode: ShowcaseColorMode.AUTO,
  }
}

export const urlToColorCache: Record<string, string> = {}

export function getOverrideColorMode(
  colorMode: ShowcaseColorMode,
  globalShowcasePreferences: Record<string, ShowcasePreferences>,
  character: Character,
) {
  if (colorMode == ShowcaseColorMode.STANDARD) {
    return ShowcaseColorMode.STANDARD
  }

  const savedColorMode = globalShowcasePreferences[character.id]?.colorMode

  if (!savedColorMode || savedColorMode == ShowcaseColorMode.STANDARD) {
    return ShowcaseColorMode.AUTO
  }

  return savedColorMode
}

function getActiveCharacterName() {
  const t = i18next.getFixedT(null, 'gameData', 'Characters')
  let charId: CharacterId | null | undefined
  switch (window.store.getState().activeKey) {
    case AppPages.CHARACTERS:
      charId = useCharacterTabStore.getState().focusCharacter
      break
    case AppPages.SHOWCASE:
      charId = useShowcaseTabStore.getState().selectedCharacter?.id
      break
    default:
      return
  }
  if (!charId) return
  return t(`${charId}.LongName`)
}

export function getDefaultColor(characterId: CharacterId, portraitUrl: string, colorMode: ShowcaseColorMode) {
  if (colorMode == ShowcaseColorMode.STANDARD) {
    return STANDARD_COLOR
  }

  if (DB.getCharacterById(characterId)?.portrait && urlToColorCache[portraitUrl]) {
    return urlToColorCache[portraitUrl]
  }

  const configColor = getCharacterConfig(characterId)?.display.showcaseColor
  if (configColor) {
    return configColor
  }

  return '#000000'
}
