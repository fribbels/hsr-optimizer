export type ColorThemeOverrides = {
  colorPrimary: string,
}

export const Themes: { [key: string]: ColorThemeOverrides } = {
  BLUE: {
    colorPrimary: '#1677FF',
  },
}

export function getGridTheme() {
  return {
    '--ag-background-color': 'var(--mantine-color-dark-7)',
    '--ag-odd-row-background-color': 'var(--mantine-color-dark-6)',
    '--ag-header-background-color': 'var(--bg-app)',
    '--ag-border-color': 'var(--border-color)',
    '--ag-row-hover-color': 'var(--mantine-color-primary-light)',
  }
}

import { createTheme, MantineColorsTuple, MantineThemeOverride } from '@mantine/core'

const primaryShades: MantineColorsTuple = [
  '#e5f0ff', '#ccdcff', '#99b5fb', '#6389f5', '#3868f0',
  '#1b54ee', '#0a49ef', '#0039d4', '#002fbe', '#1677FF',
]

export function createMantineTheme(_colorTheme: ColorThemeOverrides): MantineThemeOverride {
  return createTheme({
    primaryColor: 'primary',
    colors: {
      primary: primaryShades,
    },
    fontFamily: 'inherit',
    defaultRadius: 'sm',
    components: {
      Input: { defaultProps: { size: 'xs' } },
      InputWrapper: { defaultProps: { size: 'xs' } },
      Select: { defaultProps: { size: 'xs' } },
      MultiSelect: { defaultProps: { size: 'xs' } },
      TextInput: { defaultProps: { size: 'xs' } },
      NumberInput: { defaultProps: { size: 'xs' } },
      ColorInput: { defaultProps: { size: 'xs' } },
      Checkbox: { defaultProps: { size: 'xs' } },
      Switch: { defaultProps: { size: 'xs' } },
      Radio: { defaultProps: { size: 'xs' } },
      SegmentedControl: { defaultProps: { size: 'xs' } },
      Button: { defaultProps: { size: 'xs' } },
      Pagination: { defaultProps: { size: 'xs' } },
      Slider: { defaultProps: { size: 'xs' } },
      Tabs: { defaultProps: { size: 'xs' } },
    },
  })
}
