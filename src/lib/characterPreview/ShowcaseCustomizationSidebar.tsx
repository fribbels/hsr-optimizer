import { CameraOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button, ColorPicker, ColorPickerProps, Flex, Segmented, theme, ThemeConfig } from 'antd'
import { AggregationColor } from 'antd/es/color-picker/color'
import { GlobalToken } from 'antd/lib/theme/interface'
import { DEFAULT_SHOWCASE_COLOR, editShowcasePreferences } from 'lib/characterPreview/showcaseCustomizationController'
import { defaultPadding } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HorizontalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { colorTransparent, showcaseSegmentedColor } from 'lib/utils/colorUtils'
import { Utils } from 'lib/utils/utils'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShowcasePreferences } from 'types/metadata'

export enum ShowcaseColorMode {
  DEFAULT = 'DEFAULT',
  CUSTOM = 'CUSTOM'
}

export function ShowcaseCustomizationSidebar(props: {
  characterId: string,
  token: GlobalToken,
  colors: string[]
  showcasePreferences: ShowcasePreferences
  setOverrideTheme: (overrideTheme: ThemeConfig) => void
}) {
  const {
    characterId,
    token,
    colors,
    showcasePreferences,
    setOverrideTheme,
  } = props

  const { t } = useTranslation(['charactersTab'])
  const [primaryColor, setPrimaryColor] = useState<string>(showcasePreferences.color ?? DEFAULT_SHOWCASE_COLOR)
  const [colorMode, setColorMode] = useState<ShowcaseColorMode>(showcasePreferences.colorMode ?? ShowcaseColorMode.DEFAULT)
  const globalShowcasePreferences = window.store((s) => s.showcasePreferences)
  const setGlobalShowcasePreferences = window.store((s) => s.setShowcasePreferences)

  const displayColor = colorMode == ShowcaseColorMode.DEFAULT ? DEFAULT_SHOWCASE_COLOR : primaryColor

  useEffect(() => {
    if (colorMode == ShowcaseColorMode.DEFAULT) {
      setTheme(displayColor, setOverrideTheme)
    } else {
      setTheme(displayColor, setOverrideTheme)
    }

    editShowcasePreferences(
      characterId,
      globalShowcasePreferences,
      setGlobalShowcasePreferences,
      { colorMode: colorMode },
    )
  }, [colorMode])

  // useEffect(() => {
  //   if (primaryColor == DEFAULT_SHOWCASE_COLOR) return
  //
  //   setColorMode(ShowcaseColorMode.CUSTOM)
  //
  //   editShowcasePreferences(
  //     characterId,
  //     globalShowcasePreferences,
  //     setGlobalShowcasePreferences,
  //     { color: primaryColor, colorMode: ShowcaseColorMode.CUSTOM },
  //   )
  // }, [primaryColor])

  function onColorSelectorChange(color: string) {
    if (color == DEFAULT_SHOWCASE_COLOR) return

    setColorMode(ShowcaseColorMode.CUSTOM)

    editShowcasePreferences(
      characterId,
      globalShowcasePreferences,
      setGlobalShowcasePreferences,
      { color: color, colorMode: ShowcaseColorMode.CUSTOM },
    )

    setPrimaryColor(color)
    setTheme(color, setOverrideTheme)
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
        marginLeft: 1100,
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
        value={displayColor}
        onChange={(value: AggregationColor, css: string) => {
          const color = value.toHexString()
          console.log(color)
          onColorSelectorChange(color)
        }}
        disabledAlpha
        showText
      />

      <HorizontalDivider/>

      <Segmented
        vertical
        options={[
          { value: ShowcaseColorMode.DEFAULT, label: 'Default' },
          { value: ShowcaseColorMode.CUSTOM, label: 'Custom' },
        ]}
        value={colorMode}
        onChange={setColorMode}
      />

      <HorizontalDivider/>

      <Flex justify='space-between'>
        <Button
          icon={<CameraOutlined style={{ fontSize: 30 }}/>}
          onClick={clipboardClicked}
          type='primary'
          style={{ height: 50, width: 50, borderRadius: 8, marginBottom: 5 }}
        >
        </Button>
        <Button
          icon={<DownloadOutlined style={{ fontSize: 30 }}/>}
          onClick={clipboardClicked}
          type='primary'
          style={{ height: 50, width: 50, borderRadius: 8, marginBottom: 5 }}
        >
        </Button>
      </Flex>
    </Flex>
  )
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

function clipboardClicked() {
  // Use a small timeout here so the spinner doesn't lag while the image is being generated
  setTimeout(() => {
    Utils.screenshotElementById('characterTabPreview', 'clipboard').finally(() => {
    })
  }, 100)
}

type Presets = Required<ColorPickerProps>['presets'][number]
