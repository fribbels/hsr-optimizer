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

export const Themes: { [key: string]: ColorTheme } = {
  BLUE: { // 182239
    colorTextBase: '#ffffff', // Text
    colorBgBase: '#182239', // Background
    colorPrimary: '#1677FF', // Buttons
    // colorPrimary: '#182239',
    // colorSecondary: '#182239',
    // colorTertiary: '#182239',
    // colorBgContainer: '#243356',
    // colorBgMenu: '#001529',
  },
  ALT: {
    colorTextBase: '#ffffff',
    colorBgBase: '#381236',
    colorPrimary: '#AB5DD9',
    // colorBgBase: '#3d15ab',
    // colorPrimary: '#e84505',
    // colorSecondary: '#ffffff',
    // colorTertiary: '#ffffff',
    // colorBgContainer: '#ffffff',
    // colorBgMenu: '#21b33b',
  },
}

export function getGridTheme(token: GlobalToken) {
  return {
    '--ag-background-color': token.colorBgContainer,
    '--ag-odd-row-background-color': token.colorBgElevated,
    '--ag-header-background-color': token.colorBgLayout,
    '--ag-border-color': token.colorBgElevated,
    '--ag-row-hover-color': token.colorPrimary,
  }
}
