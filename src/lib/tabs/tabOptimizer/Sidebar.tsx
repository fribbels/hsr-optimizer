import { useMediaQuery } from '@mantine/hooks'
import { SettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import { useGlobalStore } from 'lib/stores/appStore'
import { OptimizerSidebar } from 'lib/tabs/tabOptimizer/sidebar/OptimizerSidebar'

export { isRemembrance } from 'lib/tabs/tabOptimizer/sidebar/MemoViewSelect'

export default function Sidebar() {
  const lg = useMediaQuery('(min-width: 992px)')
  const xl = useMediaQuery('(min-width: 1200px)')
  const xxl = useMediaQuery('(min-width: 1600px)')

  const breakpointNoShow = useGlobalStore.getState().settings[SettingOptions.PermutationsSidebarBehavior.name] == SettingOptions.PermutationsSidebarBehavior.NoShow
  const breakpointShowXL = useGlobalStore.getState().settings[SettingOptions.PermutationsSidebarBehavior.name] == SettingOptions.PermutationsSidebarBehavior.ShowXL
  const breakpointShowXXL = useGlobalStore.getState().settings[SettingOptions.PermutationsSidebarBehavior.name] == SettingOptions.PermutationsSidebarBehavior.ShowXXL

  // replacing ?? with || breaks the logic
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const isFullSize = breakpointNoShow || !((lg && breakpointShowXL && !xl) || (lg && breakpointShowXXL && !xxl))

  return <OptimizerSidebar isFullSize={isFullSize} />
}
