import type { MantineTheme } from '@mantine/core'

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

export function getGridTheme(theme: MantineTheme) {
  return {
    '--ag-background-color': theme.colors.dark[7],
    '--ag-odd-row-background-color': theme.colors.dark[6],
    '--ag-header-background-color': theme.colors.dark[8],
    '--ag-border-color': theme.colors.dark[4],
    '--ag-row-hover-color': theme.colors.blue[6],
  }
}

import { createTheme, MantineColorsTuple, MantineThemeOverride } from '@mantine/core'

const primaryShades: MantineColorsTuple = [
  '#e5f0ff', '#ccdcff', '#99b5fb', '#6389f5', '#3868f0',
  '#1b54ee', '#0a49ef', '#0039d4', '#002fbe', '#1677FF',
]

export function createMantineTheme(colorTheme: ColorThemeOverrides): MantineThemeOverride {
  return createTheme({
    primaryColor: 'primary',
    colors: {
      primary: primaryShades,
      dark: [
        '#C1C2C5', '#A6A7AB', '#909296', '#5c5f66',
        '#373A40', '#2C2E33', '#25262b', '#1A1B1E',
        colorTheme.colorBgBase, '#101113',
      ],
    },
    fontFamily: 'inherit',
    defaultRadius: 'sm',
  })
}
