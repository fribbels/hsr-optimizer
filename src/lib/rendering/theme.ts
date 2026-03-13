export type ColorThemeOverrides = {
  colorPrimary: string,
}

export const Themes: { [key: string]: ColorThemeOverrides } = {
  BLUE: {
    colorPrimary: '#1677FF',
  },
}

import { createTheme, MantineColorsTuple, MantineThemeOverride } from '@mantine/core'

const primaryShades: MantineColorsTuple = [
  '#f3f0ff', '#e5deff', '#c9b8ff', '#ab8eff', '#9070fc',
  '#7C5CFC', '#6b4ae6', '#5a3ad0', '#4a2db8', '#381fa0',
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
      Input: { defaultProps: { size: 'xs' }, styles: { input: { '--input-padding-inline-start': '4px', '--input-padding-inline-end': '4px' } } },
      InputWrapper: { defaultProps: { size: 'xs' } },
      Select: { defaultProps: { size: 'xs', checkIconPosition: 'right' } },
      MultiSelect: { defaultProps: { size: 'xs' } },
      TextInput: { defaultProps: { size: 'xs' } },
      NumberInput: { defaultProps: { size: 'xs' } },
      ColorInput: { defaultProps: { size: 'xs' } },
      Checkbox: { defaultProps: { size: 'xs' } },
      Switch: { defaultProps: { size: 'sm' } },
      Radio: { defaultProps: { size: 'xs' } },
      SegmentedControl: { defaultProps: { size: 'xs' } },
      Button: { defaultProps: { size: 'xs' } },
      Pagination: { defaultProps: { size: 'xs' } },
      Slider: { defaultProps: { size: 'xs' } },
      Tabs: { defaultProps: { size: 'xs' } },
      Modal: { defaultProps: { lockScroll: false } },
      Drawer: { defaultProps: { lockScroll: false } },
    },
  })
}
