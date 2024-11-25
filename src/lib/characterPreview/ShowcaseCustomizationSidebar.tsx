import { CameraOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button, ColorPicker, Flex, Segmented, theme, ThemeConfig } from 'antd'
import { AggregationColor } from 'antd/es/color-picker/color'
import { GlobalToken } from 'antd/lib/theme/interface'
import chroma from 'chroma-js'
import { DEFAULT_SHOWCASE_COLOR, editShowcasePreferences } from 'lib/characterPreview/showcaseCustomizationController'
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

export enum ShowcaseColorMode {
  AUTO = 'AUTO',
  CUSTOM = 'CUSTOM',
  STANDARD = 'STANDARD',
}

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

const STANDARD_COLOR = '#103076'

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
    1001: ['#648fe3'], // march7th
    1002: ['#e8af94'], // danheng
    1003: ['#d6b5c2'], // himeko
    1004: ['#6385d8'], // welt
    1005: ['#543446'], // kafka
    1006: ['#323e67'], // silverwolf
    1008: ['#18095e'], // arlan
    1009: ['#655c9a'], // asta
    1013: ['#5b5099'], // herta
    1101: ['#517adc'], // bronya
    1102: ['#250a7c'], // seele
    1103: ['#3821ad'], // serval
    1104: ['#0f4eef'], // gepard
    1105: ['#6a85a0'], // natasha
    1106: ['#4b88e0'], // pela
    1107: ['#2c2f4f'], // clara
    1108: ['#28285e'], // sampo
    1109: ['#d7cdc3'], // hook
    1110: ['#104473'], // lynx
    1111: ['#46091a'], // luka
    1112: ['#304c8e'], // topaz
    1201: ['#5f94a3'], // qingque
    1202: ['#a6857f'], // tingyun
    1203: ['#224053'], // luocha
    1204: ['#283840'], // jingyuan
    1205: ['#2c3758'], // blade
    1206: ['#d3b2a5'], // sushang
    1207: ['#687093'], // yukong
    1208: ['#7953a4'], // fuxuan
    1209: ['#507eae'], // yanqing
    1210: ['#5f3b36'], // guinaifen
    1211: ['#2a415c'], // bailu
    1212: ['#3750af'], // jingliu
    1213: ['#203e4a'], // imbibitorlunae
    1214: ['#5d6b9d'], // xueyi
    1215: ['#69629f'], // hanya
    1217: ['#2b4f58'], // huohuo
    1218: ['#dfc4bd'], // jiaoqiu
    1220: ['#2f4759'], // feixiao
    1221: ['#e9d7d2'], // yunli
    1222: ['#e3bc9f'], // lingsha
    1223: ['#575aa0'], // moze
    1224: ['#f2a1cf'], // march7thImaginary
    1225: ['#d1a09d'], // fugue
    1301: ['#3c2425'], // gallagher
    1302: ['#460405'], // argenti
    1303: ['#7c86a9'], // ruanmei
    1304: ['#decfbb'], // aventurine
    1305: ['#242d54'], // drratio
    1306: ['#0b1e67'], // sparkle
    1307: ['#2c195e'], // blackswan
    1308: ['#2a2d60'], // acheron
    1309: ['#494250'], // robin
    1310: ['#446680'], // firefly
    1312: ['#354462'], // misha
    1313: ['#203163'], // sunday
    1314: ['#1d136c'], // jade
    1315: ['#a4a0d3'], // boothill
    1317: ['#1b1a3f'], // rappa
    8001: ['#5f81f4'], // trailblazerdestruction
    8002: ['#5f81f4'], // trailblazerdestruction
    8003: ['#c65d36'], // trailblazerpreservation
    8004: ['#c65d36'], // trailblazerpreservation
    8005: ['#6c5d83'], // trailblazerharmony
    8006: ['#6c5d83'], // trailblazerharmony
  }

  return (defaults[characterId] ?? ['#000000'])[0]
}
