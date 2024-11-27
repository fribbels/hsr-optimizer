import { CameraOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button, ColorPicker, Flex, Segmented, theme, ThemeConfig } from 'antd'
import { AggregationColor } from 'antd/es/color-picker/color'
import { GlobalToken } from 'antd/lib/theme/interface'
import chroma from 'chroma-js'
import { DEFAULT_SHOWCASE_COLOR, editShowcasePreferences } from 'lib/characterPreview/showcaseCustomizationController'
import { ShowcaseColorMode } from 'lib/constants/constants'
import DB from 'lib/state/db'
import { defaultPadding } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { colorTransparent, organizeColors, selectColor, showcaseSegmentedColor } from 'lib/utils/colorUtils'
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

    useImperativeHandle(ref, () => ({
      onPortraitLoad: (img: string, characterId: string) => {
        if (DB.getCharacterById(characterId)?.portrait) {
          getPalette(img, (palette: PaletteResponse) => {
            const primary = selectColor(palette.DarkVibrant, palette.DarkMuted)

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

        <Flex justify='space-between'>
          <Button
            icon={<CameraOutlined style={{ fontSize: 30 }}/>}
            loading={loading}
            onClick={() => clipboardClicked(id, 'clipboard', setLoading)}
            type='primary'
            style={{ height: 50, width: 50, borderRadius: 8 }}
          >
          </Button>
          <Button
            icon={<DownloadOutlined style={{ fontSize: 30 }}/>}
            loading={loading}
            onClick={() => clipboardClicked(id, 'download', setLoading)}
            type='primary'
            style={{ height: 50, width: 50, borderRadius: 8 }}
          >
          </Button>
        </Flex>
      </Flex>
    )
  },
)

function clipboardClicked(elementId: string, action: string, setLoading: (b: boolean) => void) {
  setLoading(true)
  setTimeout(() => {
    Utils.screenshotElementById(elementId, action).finally(() => {
      setLoading(false)
    })
  }, 100)
}

function setTheme(color: string, setOverrideTheme: (overrideTheme: ThemeConfig) => void) {
  setOverrideTheme({
    algorithm: theme.darkAlgorithm,
    token: {
      colorBgLayout: color,
      colorPrimary: color,
    },
    components: {
      Segmented: {
        trackBg: colorTransparent(),
        itemSelectedBg: showcaseSegmentedColor(color),
      },
    },
  })
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
    1002: ['#60828b'], // danheng
    1003: ['#d6b5c2'], // himeko
    1004: ['#6385d8'], // welt
    1005: ['#b3859b'], // kafka
    1006: ['#8483eb'], // silverwolf
    1008: ['#59578e'], // arlan
    1009: ['#655c9a'], // asta
    1013: ['#6250a2'], // herta
    1101: ['#375ee1'], // bronya
    1102: ['#5f55eb'], // seele
    1103: ['#3821ad'], // serval
    1104: ['#0f4eef'], // gepard
    1105: ['#6a85a0'], // natasha
    1106: ['#4b88e0'], // pela
    1107: ['#2c2f4f'], // clara
    1108: ['#28285e'], // sampo
    1109: ['#f2d7c0'], // hook
    1110: ['#24649c'], // lynx
    1111: ['#c2525c'], // luka
    1112: ['#365396'], // topaz
    1201: ['#5f94a3'], // qingque
    1202: ['#e6d3d4'], // tingyun
    1203: ['#6b9199'], // luocha
    1204: ['#263339'], // jingyuan
    1205: ['#2c3758'], // blade
    1206: ['#f1d6bc'], // sushang
    1207: ['#687093'], // yukong
    1208: ['#9e58bf'], // fuxuan
    1209: ['#507eae'], // yanqing
    1210: ['#ef9784'], // guinaifen
    1211: ['#2a415c'], // bailu
    1212: ['#0b2fbc'], // jingliu
    1213: ['#203e4a'], // imbibitorlunae
    1214: ['#5d6b9d'], // xueyi
    1215: ['#69629f'], // hanya
    1217: ['#81bad1'], // huohuo
    1218: ['#e6dad5'], // jiaoqiu
    1220: ['#7ba1b3'], // feixiao
    1221: ['#e9d7d2'], // yunli
    1222: ['#e2dbd8'], // lingsha
    1223: ['#575aa0'], // moze
    1224: ['#e4bae4'], // march7thImaginary
    1225: ['#e6d0c3'], // fugue
    1301: ['#e1cac7'], // gallagher
    1302: ['#9e0e1d'], // argenti
    1303: ['#7c86a9'], // ruanmei
    1304: ['#decfbb'], // aventurine
    1305: ['#324073'], // drratio
    1306: ['#1028cd'], // sparkle
    1307: ['#6c41c9'], // blackswan
    1308: ['#605985'], // acheron
    1309: ['#cfc5d5'], // robin
    1310: ['#8fbdcd'], // firefly
    1312: ['#b0b7d0'], // misha
    1313: ['#203163'], // sunday
    1314: ['#5644ac'], // jade
    1315: ['#a4a0d3'], // boothill
    1317: ['#35448f'], // rappa
    8001: ['#5f81f4'], // trailblazerdestruction
    8002: ['#5f81f4'], // trailblazerdestruction
    8003: ['#dfafa4'], // trailblazerpreservation
    8004: ['#dfafa4'], // trailblazerpreservation
    8005: ['#8d7abc'], // trailblazerharmony
    8006: ['#8d7abc'], // trailblazerharmony
  }

  return (defaults[characterId] ?? ['#000000'])[0]
}
