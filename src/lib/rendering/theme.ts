import type { GlobalToken } from 'antd/es/theme/interface'

export type ColorTheme = {
  colorTextBase: string
  colorBgBase: string
  colorPrimary: string
  colorSecondary: string
  colorTertiary: string
  colorBgContainer: string
  colorBgMenu: string
  headerBg: string
}

// Only the fields we care about
export type ColorThemeOverrides = {
  colorTextBase: string
  colorBgBase: string
  colorPrimary: string
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
