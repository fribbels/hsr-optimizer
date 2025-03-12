import { CameraOutlined, CheckOutlined, CloseOutlined, DownloadOutlined, MoonOutlined, SettingOutlined, SunOutlined } from '@ant-design/icons'
import { Button, ColorPicker, Flex, InputNumber, Segmented, Select, ThemeConfig } from 'antd'
import { AggregationColor } from 'antd/es/color-picker/color'
import { GlobalToken } from 'antd/lib/theme/interface'
import { usePublish } from 'hooks/usePublish'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { DEFAULT_SHOWCASE_COLOR, editShowcasePreferences } from 'lib/characterPreview/showcaseCustomizationController'
import { NONE_SCORE, ShowcaseColorMode, SIMULATION_SCORE, Stats } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { generateSpdPresets } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { defaultPadding } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { modifyCustomColor, organizeColors, selectClosestColor } from 'lib/utils/colorUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { getPalette, PaletteResponse } from 'lib/utils/vibrantFork'
import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { ShowcasePreferences } from 'types/metadata'

export interface ShowcaseCustomizationSidebarRef {
  onPortraitLoad: (src: string, characterId: string) => void
}

export interface ShowcaseCustomizationSidebarProps {
  id: string
  source: ShowcaseSource
  characterId: string
  token: GlobalToken
  showcasePreferences: ShowcasePreferences
  simScoringResult: SimulationScore | null
  scoringType: string
  setOverrideTheme: (overrideTheme: ThemeConfig) => void
  seedColor: string
  setSeedColor: (color: string) => void
  colorMode: ShowcaseColorMode
  setColorMode: (colorMode: ShowcaseColorMode) => void
}

const debugColors: { defaults: string[] } = {
  defaults: [],
}

const ShowcaseCustomizationSidebar = forwardRef<ShowcaseCustomizationSidebarRef, ShowcaseCustomizationSidebarProps>(
  (props, ref) => {
    const {
      id,
      source,
      characterId,
      simScoringResult,
      scoringType,
      seedColor,
      setSeedColor,
      colorMode,
      setColorMode,
    } = props

    const { t: tCustomization } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.CustomizationSidebar' })
    const { t: tScoring } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.ScoringSidebar' })
    const pubRefreshRelicsScore = usePublish()
    const [colors, setColors] = useState<string[]>([])
    const globalShowcasePreferences = window.store((s) => s.showcasePreferences)
    const setGlobalShowcasePreferences = window.store((s) => s.setShowcasePreferences)
    const [loading, setLoading] = useState<boolean>(false)
    const showcaseDarkMode = window.store((s) => s.savedSession.showcaseDarkMode)
    const showcaseUID = window.store((s) => s.savedSession.showcaseUID)
    const showcasePreciseSpd = window.store((s) => s.savedSession.showcasePreciseSpd)
    const scoringMetadata = window.store(() => DB.getScoringMetadata(characterId))
    const spdValue = window.store(() => scoringMetadata.stats[Stats.SPD])
    const deprioritizeBuffs = window.store(() => scoringMetadata.simulation?.deprioritizeBuffs ?? false)

    useImperativeHandle(ref, () => ({
      onPortraitLoad: (img: string, characterId: string) => {
        if (DB.getCharacterById(characterId)?.portrait) {
          getPalette(img, (palette: PaletteResponse) => {
            const primary = modifyCustomColor(selectClosestColor([palette.Vibrant, palette.DarkVibrant, palette.Muted, palette.DarkMuted, palette.LightVibrant, palette.LightMuted]))

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

      const scoringMetadata = TsUtils.clone(DB.getScoringMetadata(characterId))
      scoringMetadata.stats[Stats.SPD] = spdValue

      DB.updateCharacterScoreOverrides(characterId, scoringMetadata)
      // pubRefreshRelicsScore('refreshRelicsScore', 'null')
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

      const showcaseTemporaryOptions = TsUtils.clone(window.store.getState().showcaseTemporaryOptions)
      if (!showcaseTemporaryOptions[characterId]) showcaseTemporaryOptions[characterId] = {}

      // -1 is used as the "current" setting
      const actualValue = spdBenchmark == -1 ? undefined : spdBenchmark

      showcaseTemporaryOptions[characterId].spdBenchmark = actualValue

      window.store.getState().setShowcaseTemporaryOptions(showcaseTemporaryOptions)
    }

    function onTraceClick() {
      window.store.getState().setStatTracesDrawerFocusCharacter(characterId)
      window.store.getState().setStatTracesDrawerOpen(true)
    }

    function onShowcaseDeprioritizeBuffsChange(deprioritizeBuffs: boolean) {
      const scoringMetadata = DB.getScoringMetadata(characterId)
      if (scoringMetadata?.simulation) {
        console.log('Set deprioritizeBuffs to', deprioritizeBuffs)

        const simulationMetadata = TsUtils.clone(scoringMetadata.simulation)
        simulationMetadata.deprioritizeBuffs = deprioritizeBuffs
        DB.updateSimulationScoreOverrides(characterId, simulationMetadata)
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
          { value: false, label: tScoring('SpdPrecision.Low')/* '.0' */ },
          { value: true, label: tScoring('SpdPrecision.High')/* '.000' */ },
        ],
        spdWeightOptions: [
          { value: 1, label: tScoring('SpdWeight.Max')/* '100%' */ },
          { value: 0, label: tScoring('SpdWeight.Min')/* '0%' */ },
        ],
        buffPriorityOptions: [
          { value: false, label: tScoring('BuffPriority.High')/* 'High' */ },
          { value: true, label: tScoring('BuffPriority.Low')/* 'Low' */ },
        ],
      }
    }, [tScoring])

    if (source != ShowcaseSource.SHOWCASE_TAB && source != ShowcaseSource.CHARACTER_TAB) return <></>

    return (
      <Flex
        vertical
        gap={16}
        style={{
          position: 'absolute',
          marginLeft: 1085,
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
              {tScoring('Stats.Header')/* Stats */}
            </HeaderText>

            <a
              href='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/score-customization.md'
              target='_blank'
              style={{ display: 'inline-flex', alignItems: 'center' }} rel='noreferrer'
            >
              <img src={Assets.getQuestion()} style={{ height: 16, width: 16, opacity: 0.6, marginLeft: 'auto' }}/>
            </a>
          </Flex>

          <HorizontalDivider/>

          <Button
            icon={<SettingOutlined/>}
            onClick={onTraceClick}
          >
            {tScoring('Stats.ButtonText')/* Traces */}
          </Button>

          <HorizontalDivider/>

          <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
            {tScoring('SpdPrecision.Header')/* SPD precision */}
          </HeaderText>

          <Segmented
            options={spdPrecisionOptions}
            block
            value={showcasePreciseSpd}
            onChange={onShowcasePreciseSpdChange}
          />

          {scoringType != NONE_SCORE
          && (
            <>
              <HorizontalDivider/>

              <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
                {tScoring('SpdWeight.Header')/* SPD weight */}
              </HeaderText>

              <Segmented
                options={spdWeightOptions}
                block
                value={spdValue}
                onChange={onShowcaseSpdValueChange}
              />
            </>
          )}

          {scoringType == SIMULATION_SCORE
          && (
            <>
              <HorizontalDivider/>

              <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
                {tScoring('BenchmarkSpd.Header')/* SPD benchmark */}
              </HeaderText>

              <InputNumber
                size='small'
                controls={false}
                style={{ width: '100%' }}
                value={sanitizePositiveNumberElseUndefined(window.store.getState().showcaseTemporaryOptions[characterId]?.spdBenchmark)}
                addonAfter={(
                  <SelectSpdPresets
                    spdFilter={simScoringResult?.originalSpd}
                    onShowcaseSpdBenchmarkChange={onShowcaseSpdBenchmarkChange}
                    characterId={characterId}
                    simScoringResult={simScoringResult}
                  />
                )}
                min={0}
                onBlur={onShowcaseSpdBenchmarkChangeEvent}
                onPressEnter={onShowcaseSpdBenchmarkChangeEvent}
              />
            </>
          )}

          {scoringType == SIMULATION_SCORE
          && (
            <>
              <HorizontalDivider/>

              <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
                {tScoring('BuffPriority.Header')/* Buff priority */}
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

          <HorizontalDivider/>

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

          <HorizontalDivider/>

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

          <HorizontalDivider/>

          <Segmented
            options={[
              { value: false, label: <SunOutlined/> },
              { value: true, label: <MoonOutlined/> },
            ]}
            block
            value={showcaseDarkMode}
            onChange={onBrightnessModeChange}
          />

          {
            source == ShowcaseSource.SHOWCASE_TAB
            && (
              <>
                <HorizontalDivider/>

                <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
                  {tCustomization('ShowUID')/* Show UID */}
                </HeaderText>

                <Segmented
                  options={[
                    { value: true, label: <CheckOutlined/> },
                    { value: false, label: <CloseOutlined/> },
                  ]}
                  block
                  value={showcaseUID}
                  onChange={onShowUIDChange}
                />
              </>
            )
          }

          <HorizontalDivider/>

          <Flex justify='space-between'>
            <Button
              icon={<CameraOutlined style={{ fontSize: 30 }}/>}
              loading={loading}
              onClick={() => clipboardClicked(id, 'clipboard', setLoading, props.seedColor)}
              type='primary'
              style={{ height: 50, width: 50, borderRadius: 8 }}
            >
            </Button>
            <Button
              icon={<DownloadOutlined style={{ fontSize: 30 }}/>}
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
  characterId: string
  onShowcaseSpdBenchmarkChange: (n: number) => void
  simScoringResult: SimulationScore | null
  spdFilter?: number
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })
  const { t: tCharacterTab } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.ScoringSidebar.BenchmarkSpd' })

  const spdPresetOptions = useMemo(() => {
    const presets = Object.values(TsUtils.clone(generateSpdPresets(t))).slice(1)
    if (props.spdFilter != null) {
      presets.map((preset) => {
        preset.disabled = preset.value != null && preset.value > props.spdFilter!
      })
    }

    return [
      {
        label: <span>{tCharacterTab('BenchmarkOptionsLabel')/* Benchmark options */}</span>,
        title: 'benchmark',
        options: [
          {
            label: <b><span>{tCharacterTab('CurrentSpdLabel')/* Current SPD - The benchmark will match your basic SPD */}</span></b>,
            value: -1,
          },
          {
            label: <span>{tCharacterTab('BaseSpdLabel')/* Base SPD - The benchmark will target a minimal SPD build */}</span>,
            value: 0,
          },
        ],
      },
      {
        label: <span>{tCharacterTab('CommonBreakpointsLabel')/* Common SPD breakpoint presets (SPD buffs considered separately) */}</span>,
        options: presets,
      },
    ]
  }, [t, tCharacterTab, props.spdFilter, props.characterId, props.simScoringResult])

  return (
    <Select
      style={{ width: 34 }}
      labelRender={() => <></>}
      dropdownStyle={{ width: 'fit-content' }}
      options={spdPresetOptions}
      placement='bottomRight'
      listHeight={800}
      value={null}
      onChange={props.onShowcaseSpdBenchmarkChange}
    />
  )
}

function clipboardClicked(elementId: string, action: string, setLoading: (b: boolean) => void, color: string) {
  setLoading(true)
  setTimeout(() => {
    Utils.screenshotElementById(elementId, action).finally(() => {
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

export function getDefaultColor(characterId: string, portraitUrl: string, colorMode: ShowcaseColorMode) {
  if (colorMode == ShowcaseColorMode.STANDARD) {
    return STANDARD_COLOR
  }

  if (DB.getCharacterById(characterId)?.portrait && urlToColorCache[portraitUrl]) {
    return urlToColorCache[portraitUrl]
  }

  const defaults: Record<string, string[]> = {
    1001: ['#718fe5'], // march7th
    1002: ['#7dd3ea'], // danheng
    1003: ['#d6b5c2'], // himeko
    1004: ['#6385d8'], // welt
    1005: ['#ea8abc'], // kafka
    1006: ['#8483eb'], // silverwolf
    1008: ['#817fd1'], // arlan
    1009: ['#9e80e6'], // asta
    1013: ['#8969ea'], // herta
    1101: ['#375ee1'], // bronya
    1102: ['#5f55eb'], // seele
    1103: ['#8772f4'], // serval
    1104: ['#0f4eef'], // gepard
    1105: ['#82b5e9'], // natasha
    1106: ['#4b88e0'], // pela
    1107: ['#a99dd1'], // clara
    1108: ['#7777c9'], // sampo
    1109: ['#c8d0f0'], // hook
    1110: ['#53b1e1'], // lynx
    1111: ['#5d8ce2'], // luka
    1112: ['#0f349b'], // topaz
    1201: ['#87d2da'], // qingque
    1202: ['#f4b5d4'], // tingyun
    1203: ['#8ce2f4'], // luocha
    1204: ['#94e6f1'], // jingyuan
    1205: ['#4d69be'], // blade
    1206: ['#81adf1'], // sushang
    1207: ['#90a0e6'], // yukong
    1208: ['#dd9cf2'], // fuxuan
    1209: ['#6db1f4'], // yanqing
    1210: ['#88aade'], // guinaifen
    1211: ['#5f9ce2'], // bailu
    1212: ['#3e65f2'], // jingliu
    1213: ['#72c3de'], // imbibitorlunae
    1214: ['#3571e7'], // xueyi
    1215: ['#9a90e6'], // hanya
    1217: ['#8cf4fc'], // huohuo
    1218: ['#fff4f8'], // jiaoqiu
    1220: ['#7fd9e1'], // feixiao
    1221: ['#a2e9f5'], // yunli
    1222: ['#ffeef5'], // lingsha
    1223: ['#575aa0'], // moze
    1224: ['#f7b6f7'], // march7thImaginary
    1225: ['#fce4f7'], // fugue
    1301: ['#7c7c99'], // gallagher
    1302: ['#f77784'], // argenti
    1303: ['#3964d1'], // ruanmei
    1304: ['#7cbcea'], // aventurine
    1305: ['#3151c7'], // drratio
    1306: ['#5866bc'], // sparkle
    1307: ['#a37df4'], // blackswan
    1308: ['#837bd4'], // acheron
    1309: ['#d7a4f1'], // robin
    1310: ['#a0efec'], // firefly
    1312: ['#b0b7d0'], // misha
    1313: ['#7e95e9'], // sunday
    1314: ['#8a74dc'], // jade
    1315: ['#a49ed2'], // boothill
    1317: ['#7789e2'], // rappa
    8001: ['#5f81f4'], // trailblazerdestruction
    8002: ['#5f81f4'], // trailblazerdestruction
    8003: ['#756d96'], // trailblazerpreservation
    8004: ['#756d96'], // trailblazerpreservation
    8005: ['#8d7abc'], // trailblazerharmony
    8006: ['#8d7abc'], // trailblazerharmony

    1401: ['#aa81fa'], // the herta
    1402: ['#86bdf1'], // aglaea
    8007: ['#f0a1fa'], // trailblazerremembrance
    8008: ['#f0a1fa'], // trailblazerremembrance

    1403: ['#979af7'], // tribbie
    1404: ['#ff94b1'], // mydei

    1405: ['#93d4c2'], // anaxa
    1407: ['#b985fd'], // castorice
  }

  return (defaults[characterId] ?? ['#000000'])[0]
}
