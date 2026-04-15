import { useMediaQuery } from '@mantine/hooks'
import { SettingOptions } from 'lib/constants/settingsConstants'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { OptimizerSidebar } from 'lib/tabs/tabOptimizer/sidebar/OptimizerSidebar'

export function Sidebar() {
  const lg = useMediaQuery('(min-width: 992px)')
  const xl = useMediaQuery('(min-width: 1200px)')
  const xxl = useMediaQuery('(min-width: 1600px)')

  const sidebarBehavior = useGlobalStore((s) => s.settings.PermutationsSidebarBehavior)
  const breakpointNoShow = sidebarBehavior === SettingOptions.PermutationsSidebarBehavior.NoShow
  const breakpointShowXL = sidebarBehavior === SettingOptions.PermutationsSidebarBehavior.ShowXL
  const breakpointShowXXL = sidebarBehavior === SettingOptions.PermutationsSidebarBehavior.ShowXXL

  // replacing ?? with || breaks the logic
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const isFullSize = breakpointNoShow || !((lg && breakpointShowXL && !xl) || (lg && breakpointShowXXL && !xxl))

  return <OptimizerSidebar isFullSize={isFullSize} />
}
