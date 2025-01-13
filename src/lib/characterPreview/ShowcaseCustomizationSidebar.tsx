import { CameraOutlined, DownloadOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, ColorPicker, Flex, Segmented, ThemeConfig } from 'antd'
import { AggregationColor } from 'antd/es/color-picker/color'
import { GlobalToken } from 'antd/lib/theme/interface'
import chroma from 'chroma-js'
import { DEFAULT_SHOWCASE_COLOR, editShowcasePreferences } from 'lib/characterPreview/showcaseCustomizationController'
import { ShowcaseColorMode } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import DB from 'lib/state/db'
import { defaultPadding } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { organizeColors, selectColor } from 'lib/utils/colorUtils'
import { Utils } from 'lib/utils/utils'
import { getPalette, PaletteResponse } from 'lib/utils/vibrantFork'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { ShowcasePreferences } from 'types/metadata'

export interface ShowcaseCustomizationSidebarRef {
  onPortraitLoad: (src: string, characterId: string) => void
}

export interface ShowcaseCustomizationSidebarProps {
  id: string
  characterId: string
  token: GlobalToken
  showcasePreferences: ShowcasePreferences
  setOverrideTheme: (overrideTheme: ThemeConfig) => void
  seedColor: string
  setSeedColor: (color: string) => void
  colorMode: ShowcaseColorMode
  setColorMode: (colorMode: ShowcaseColorMode) => void
}

const debugColors: { defaults: string[] } = {
  defaults: [],
}

export const ShowcaseCustomizationSidebar = forwardRef<ShowcaseCustomizationSidebarRef, ShowcaseCustomizationSidebarProps>(
  (props, ref) => {
    const {
      id,
      characterId,
      seedColor,
      setSeedColor,
      colorMode,
      setColorMode,
    } = props

    const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.CustomizationSidebar' })
    const [colors, setColors] = useState<string[]>([])
    const globalShowcasePreferences = window.store((s) => s.showcasePreferences)
    const setGlobalShowcasePreferences = window.store((s) => s.setShowcasePreferences)
    const [loading, setLoading] = useState<boolean>(false)
    const showcaseDarkMode = window.store((s) => s.savedSession.showcaseDarkMode)

    useImperativeHandle(ref, () => ({
      onPortraitLoad: (img: string, characterId: string) => {
        if (DB.getCharacterById(characterId)?.portrait) {
          getPalette(img, (palette: PaletteResponse) => {
            const primary = selectColor(palette.LightMuted, palette.LightVibrant)

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

      console.log(chroma(newColor).luminance())

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

    const presets = [
      {
        label: t('PaletteLabel'),
        colors: colors,
      },
      // {
      //   label: 'DEBUG',
      //   colors: debugColors.defaults,
      // },
    ]

    return (
      <Flex
        vertical
        gap={8}
        style={{
          position: 'absolute',
          marginLeft: 1085,
          width: 130,
          backgroundColor: 'rgb(29 42 71)',
          boxShadow: shadow,
          borderRadius: 5,
          padding: defaultPadding,
        }}
      >
        <HeaderText style={{ textAlign: 'center', marginBottom: 2 }}>
          {t('Label')}
        </HeaderText>

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
            { value: ShowcaseColorMode.AUTO, label: t('Modes.Auto') },
            { value: ShowcaseColorMode.CUSTOM, label: t('Modes.Custom') },
            { value: ShowcaseColorMode.STANDARD, label: t('Modes.Standard') },
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
    )
  },
)

function clipboardClicked(elementId: string, action: string, setLoading: (b: boolean) => void, color: string) {
  setLoading(true)
  setTimeout(() => {
    Utils.screenshotElementById(elementId, action/*, color*/).finally(() => {
      setLoading(false)
    })
  }, 100)
}

const shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

const STANDARD_COLOR = '#2d58b6'

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

  if (urlToColorCache[portraitUrl]) {
    return urlToColorCache[portraitUrl]
  }

  const defaults: Record<string, string[]> = {
    1001: ['#718fe5'], // march7th
    1002: ['#7dd3ea'], // danheng
    1003: ['#d6b5c2'], // himeko
    1004: ['#6385d8'], // welt
    1005: ['#d684a9'], // kafka
    1006: ['#8483eb'], // silverwolf
    1008: ['#817fd1'], // arlan
    1009: ['#a092ef'], // asta
    1013: ['#653ae9'], // herta
    1101: ['#375ee1'], // bronya
    1102: ['#5f55eb'], // seele
    1103: ['#8772f4'], // serval
    1104: ['#0f4eef'], // gepard
    1105: ['#6a85a0'], // natasha
    1106: ['#4b88e0'], // pela
    1107: ['#a99dd1'], // clara
    1108: ['#7777c9'], // sampo
    1109: ['#c8d0f0'], // hook
    1110: ['#2e93c6'], // lynx
    1111: ['#e9858e'], // luka
    1112: ['#1d3f9c'], // topaz
    1201: ['#8fdde6'], // qingque
    1202: ['#ecd5da'], // tingyun
    1203: ['#97e0ef'], // luocha
    1204: ['#b7dde2'], // jingyuan
    1205: ['#4d69be'], // blade
    1206: ['#154da1'], // sushang
    1207: ['#90a0e6'], // yukong
    1208: ['#da91f2'], // fuxuan
    1209: ['#6db1f4'], // yanqing
    1210: ['#f9f5f2'], // guinaifen
    1211: ['#2a415c'], // bailu
    1212: ['#0e37cc'], // jingliu
    1213: ['#72c3de'], // imbibitorlunae
    1214: ['#3571e7'], // xueyi
    1215: ['#9a90e6'], // hanya
    1217: ['#81bad1'], // huohuo
    1218: ['#f4dfe7'], // jiaoqiu
    1220: ['#7ed3da'], // feixiao
    1221: ['#a3d3dc'], // yunli
    1222: ['#f5e6ed'], // lingsha
    1223: ['#575aa0'], // moze
    1224: ['#eacbea'], // march7thImaginary
    1225: ['#fce4f7'], // fugue
    1301: ['#f9efee'], // gallagher
    1302: ['#d6616c'], // argenti
    1303: ['#1a48ba'], // ruanmei
    1304: ['#7cbcea'], // aventurine
    1305: ['#3151c7'], // drratio
    1306: ['#5866bc'], // sparkle
    1307: ['#7f58d6'], // blackswan
    1308: ['#8982d6'], // acheron
    1309: ['#bb9cf4'], // robin
    1310: ['#8fbdcd'], // firefly
    1312: ['#b0b7d0'], // misha
    1313: ['#7e95e9'], // sunday
    1314: ['#8a74dc'], // jade
    1315: ['#a49ed2'], // boothill
    1317: ['#7789e2'], // rappa
    8001: ['#5f81f4'], // trailblazerdestruction
    8002: ['#5f81f4'], // trailblazerdestruction
    8003: ['#dfafa4'], // trailblazerpreservation
    8004: ['#dfafa4'], // trailblazerpreservation
    8005: ['#8d7abc'], // trailblazerharmony
    8006: ['#8d7abc'], // trailblazerharmony

    1401: ['#7336ed'], // the herta
    1402: ['#8cb7e7'], // aglaea
    8007: ['#f0a4fa'], // trailblazerremembrance
    8008: ['#f0a4fa'], // trailblazerremembrance

    1403: ['#8a8def'], // tribbie
    1404: ['#fa94b7'], // mydei
  }

  return (defaults[characterId] ?? ['#000000'])[0]
}
