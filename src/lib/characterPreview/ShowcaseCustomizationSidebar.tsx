import { CameraOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button, ColorPicker, Flex, Segmented, theme, ThemeConfig } from 'antd'
import { AggregationColor } from 'antd/es/color-picker/color'
import { GlobalToken } from 'antd/lib/theme/interface'
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
import { ShowcasePreferences } from 'types/metadata'

export enum ShowcaseColorMode {
  DEFAULT = 'DEFAULT',
  CUSTOM = 'CUSTOM'
}

export interface ShowcaseCustomizationSidebarRef {
  onPortraitLoad: (src: string, characterId: string) => void
}

export interface ShowcaseCustomizationSidebarProps {
  characterId: string,
  token: GlobalToken,
  showcasePreferences: ShowcasePreferences
  setOverrideTheme: (overrideTheme: ThemeConfig) => void
  seedColor: string,
  setSeedColor: (color: string) => void
  colorMode: ShowcaseColorMode
  setColorMode: (colorMode: ShowcaseColorMode) => void
}

export const ShowcaseCustomizationSidebar = forwardRef<ShowcaseCustomizationSidebarRef, ShowcaseCustomizationSidebarProps>(
  (props, ref) => {
    const {
      characterId,
      seedColor,
      setSeedColor,
      colorMode,
      setColorMode,
    } = props

    const { t } = useTranslation(['charactersTab'])
    const [colors, setColors] = useState<string[]>([])
    const globalShowcasePreferences = window.store((s) => s.showcasePreferences)
    const setGlobalShowcasePreferences = window.store((s) => s.setShowcasePreferences)

    useImperativeHandle(ref, () => ({
      onPortraitLoad: (img: string, characterId: string) => {
        if (DB.getCharacterById(characterId)?.portrait) {
          getPalette(img, (palette: PaletteResponse) => {
            const primary = selectColor(palette.DarkVibrant, palette.DarkMuted)

            setSeedColor(primary)
            urlToColorCache[img] = primary

            setColors(organizeColors(palette))
          })
        } else {
          setTimeout(() => {
            getPalette(img, (palette: PaletteResponse) => {
              const primary = selectColor(palette.DarkVibrant, palette.DarkMuted)

              setColors(organizeColors(palette))
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

    const presets = [
      {
        label: 'Portrait colors',
        colors: colors,
      },
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
          Customization
        </HeaderText>

        <ColorPicker
          presets={presets}
          defaultValue='#1677ff'
          value={seedColor}
          onChangeComplete={(value: AggregationColor) => {
            const color = value.toHexString()
            console.log(color)
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
            { value: ShowcaseColorMode.DEFAULT, label: 'Auto' },
            { value: ShowcaseColorMode.CUSTOM, label: 'Custom' },
          ]}
          value={colorMode}
          onChange={onColorModeChange}
        />

        <HorizontalDivider/>

        <Flex justify='space-between'>
          <Button
            icon={<CameraOutlined style={{ fontSize: 30 }}/>}
            onClick={clipboardClicked}
            type='primary'
            style={{ height: 50, width: 50, borderRadius: 8 }}
          >
          </Button>
          <Button
            icon={<DownloadOutlined style={{ fontSize: 30 }}/>}
            onClick={clipboardClicked}
            type='primary'
            style={{ height: 50, width: 50, borderRadius: 8 }}
          >
          </Button>
        </Flex>
      </Flex>
    )
  },
)

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

function clipboardClicked() {
  // Use a small timeout here so the spinner doesn't lag while the image is being generated
  setTimeout(() => {
    Utils.screenshotElementById('characterTabPreview', 'clipboard').finally(() => {
    })
  }, 100)
}

export const urlToColorCache: Record<string, string> = {}

export function getDefaultColor(characterId: string, portraitUrl: string) {
  if (urlToColorCache[portraitUrl]) return urlToColorCache[portraitUrl]

  return '#000000'
}
