import {
  theme,
  ThemeConfig,
} from 'antd'
import type { GlobalToken } from 'antd/es/theme/interface'

export type ColorTheme = {
  colorTextBase: string,
  colorBgBase: string,
  colorPrimary: string,
  colorSecondary: string,
  colorTertiary: string,
  colorBgContainer: string,
  colorBgMenu: string,
  headerBg: string,
}

// Only the fields we care about
export type ColorThemeOverrides = {
  colorTextBase: string,
  colorBgBase: string,
  colorPrimary: string,
}

export const Themes: { [key: string]: ColorThemeOverrides } = {
  BLUE: { // 182239
    colorTextBase: '#ffffff', // Text
    colorBgBase: '#182239', // Background
    colorPrimary: '#1677FF', // Buttons
  },
  ALT: {
    colorTextBase: '#ffffff', // Text
    colorBgBase: '#182239', // Background
    colorPrimary: '#1677FF', // Buttons
  },
}

export function getGridTheme(token: GlobalToken) {
  return {
    '--ag-background-color': token.colorBgContainer,
    '--ag-odd-row-background-color': token.colorBgElevated,
    '--ag-header-background-color': token.colorBgLayout,
    '--ag-border-color': token.colorBorderSecondary,
    '--ag-row-hover-color': token.colorPrimary,
  }
}

export function getGlobalThemeConfigFromColorTheme(colorTheme: ColorThemeOverrides): ThemeConfig {
  return {
    token: {
      motionUnit: 0.1,
      opacityLoading: 0.20,
      colorBgBase: colorTheme.colorBgBase,
      colorTextBase: colorTheme.colorTextBase,
      colorPrimary: colorTheme.colorPrimary,
      colorPrimaryBorderHover: colorTheme.colorPrimary,
      screenXL: 1530,
      screenXLMin: 1530,
      screenXXL: 1660,
      screenXXLMin: 1660,
    },
    components: {
      Collapse: {
        contentPadding: '0px 0px',
      },

      Menu: {
        margin: 2,
        itemPaddingInline: 0,
        subMenuItemBg: 'rgba(255, 255, 255, 0.05)',
      },

      Table: {
        headerBg: '#00000036',
        cellPaddingInlineSM: 5,
        cellPaddingBlockSM: 6,
      },

      Slider: {
        dotBorderColor: colorTheme.colorPrimary,
        dotActiveBorderColor: colorTheme.colorPrimary,
        handleActiveColor: colorTheme.colorPrimary,
        handleColor: colorTheme.colorPrimary,
        handleColorDisabled: colorTheme.colorPrimary,
        trackBg: colorTheme.colorPrimary,
        trackHoverBg: colorTheme.colorPrimary,
        railHoverBg: '#ffffff80',
        railBg: '#ffffff12',
        handleSize: 5,
        handleSizeHover: 5,
        handleLineWidth: 3,
        handleLineWidthHover: 3,
        railSize: 3,
      },
      InputNumber: {
        paddingInlineSM: 6,
      },
      Tag: {
        defaultColor: '#ffffff',
      },
      Notification: {
        width: 450,
      },
      Dropdown: {
        zIndexPopup: 900,
      },
      Alert: {
        colorInfo: '#4bc65d',
        colorInfoBg: '#1f3464',
        colorInfoBorder: '#334d8a',
      },
    },
    algorithm: theme.darkAlgorithm,
  }
}
