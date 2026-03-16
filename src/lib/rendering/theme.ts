import { createTheme, MantineColorsTuple, MantineThemeOverride } from '@mantine/core'

export type ColorThemeOverrides = {
  colorPrimary: string
}

export const Themes: { [key: string]: ColorThemeOverrides } = {
  BLUE: {
    colorPrimary: '#1677FF',
  },
}

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
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '10px',
      lg: '12px',
      xl: '16px',
    },
    components: {
      Input: {
        defaultProps: { size: 'xs' },
        styles: {
          input: {
            '--input-padding-inline-start': '6px',
            '--input-padding-inline-end': '6px',
            lineHeight: '30px',
          },
        },
      },
      InputBase: {
        defaultProps: { size: 'xs' },
      },
      InputWrapper: {
        defaultProps: { size: 'xs' },
      },
      Combobox: {
        defaultProps: {
          width: 'target',
        },
      },
      Select: {
        defaultProps: {
          size: 'xs',
          checkIconPosition: 'right',
          comboboxProps: { keepMounted: false, width: 'target' },
        },
      },
      MultiSelect: {
        defaultProps: {
          size: 'xs',
          comboboxProps: { keepMounted: false },
        },
      },
      TextInput: {
        defaultProps: { size: 'xs' },
      },
      NumberInput: {
        defaultProps: { size: 'xs' },
      },
      ColorInput: {
        defaultProps: { size: 'xs' },
      },
      Checkbox: {
        defaultProps: { size: 'xs' },
      },
      Switch: {
        defaultProps: { size: 'sm' },
      },
      Radio: {
        defaultProps: { size: 'xs' },
      },
      SegmentedControl: {
        defaultProps: {
          size: 'xs',
          withItemsBorders: false,
        },
      },
      Button: {
        defaultProps: { size: 'xs' },
        styles: {
          label: {
            fontSize: '14px',
            fontWeight: 'normal',
          },
        },
      },
      Pagination: {
        defaultProps: { size: 'xs' },
      },
      Slider: {
        defaultProps: { size: 'xs' },
      },
      Tabs: {
        defaultProps: { size: 'xs' },
      },
      Modal: {
        defaultProps: { lockScroll: false },
      },
      Drawer: {
        defaultProps: {
          lockScroll: false,
          transitionProps: { duration: 150 },
        },
      },
      Timeline: {
        defaultProps: { size: 'md' },
      },
      Accordion: {
        styles: {
          item: { borderBottom: 'none' },
        },
      },
    },
  })
}
