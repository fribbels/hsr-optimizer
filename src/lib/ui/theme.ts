import { createTheme, type CSSVariablesResolver, type MantineThemeOverride } from '@mantine/core'
import chroma from 'chroma-js'
import { deriveCustomLayers, deriveDarkPalette, derivePrimaryPalette } from './themeColors'

export function createMantineTheme(seed: string): MantineThemeOverride {
  const [h] = chroma(seed).hsl()
  const { layer1, layer2, layer3 } = deriveCustomLayers(h)
  return createTheme({
    primaryColor: 'primary',
    primaryShade: { light: 6, dark: 5 },
    colors: {
      primary: derivePrimaryPalette(seed),
      dark: deriveDarkPalette(h),
    },
    other: { layer1, layer2, layer3 },
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
        styles: { input: { lineHeight: '30px' } },
      },
      InputBase: { defaultProps: { size: 'xs' } },
      InputWrapper: { defaultProps: { size: 'xs' } },
      Combobox: { defaultProps: { width: 'target' } },
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
          checkIconPosition: 'right',
          comboboxProps: { keepMounted: false },
        },
      },
      TextInput: { defaultProps: { size: 'xs' } },
      NumberInput: { defaultProps: { size: 'xs' } },
      ColorInput: { defaultProps: { size: 'xs' } },
      Checkbox: { defaultProps: { size: 'xs' } },
      Switch: { defaultProps: { size: 'sm' } },
      Pill: {
        styles: { root: { backgroundColor: 'var(--control-bg)' } },
      },
      Radio: { defaultProps: { size: 'xs' } },
      SegmentedControl: {
        defaultProps: { size: 'xs', withItemsBorders: false },
        styles: {
          root: { backgroundColor: 'var(--control-bg)' },
          label: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 22, paddingBlock: 0 },
          innerLabel: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
        },
      },
      Button: {
        defaultProps: { size: 'xs' },
        styles: { label: { fontSize: '14px', fontWeight: 'normal' } },
      },
      Pagination: { defaultProps: { size: 'xs' } },
      Slider: { defaultProps: { size: 'xs' } },
      Tabs: { defaultProps: { size: 'xs' } },
      Modal: { defaultProps: { lockScroll: false, padding: 16, withCloseButton: false } },
      Drawer: {
        defaultProps: { lockScroll: false, padding: 16, transitionProps: { duration: 150 } },
      },
      Timeline: { defaultProps: { size: 'md' } },
      Divider: { styles: { root: { borderColor: 'rgba(255, 255, 255, 0.10)' } } },
      Notification: { styles: { root: { padding: '12px 14px 12px 26px' } } },
      Accordion: { styles: { item: { borderBottom: 'none' } } },
    },
  })
}

export const themeResolver: CSSVariablesResolver = (theme) => ({
  variables: {
    '--layer-1': theme.other.layer1,
    '--layer-2': theme.other.layer2,
    '--layer-3': theme.other.layer3,
    '--control-bg': 'rgba(0, 0, 0, 0.15)',
    '--control-bg-light': '#ffffff40',
  },
  light: {},
  dark: {},
})
