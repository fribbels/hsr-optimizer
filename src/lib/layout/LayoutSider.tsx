import { Flex } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { HEADER_HEIGHT } from 'lib/layout/LayoutHeader'
import { MenuDrawer } from 'lib/overlays/drawers/MenuDrawer'
import { useScrollLockState } from 'lib/layout/scrollController'
import { useNavDebugStore } from 'lib/overlays/drawers/navDebugStore'
import classes from 'lib/layout/layout.module.css'
import { useShallow } from 'zustand/react/shallow'

const shadowMap: Record<string, string> = {
  none: 'none',
  subtle: '2px 0 8px rgba(0,0,0,0.15)',
  medium: '4px 0 16px rgba(0,0,0,0.25)',
  strong: '6px 0 24px rgba(0,0,0,0.4)',
}

export function LayoutSider() {
  const { isLocked, offset } = useScrollLockState()
  const { isOpen: isOpenMenuSidebar } = useOpenClose(OpenCloseIDs.MENU_SIDEBAR)

  const { sidebarWidth, panelBgOpacity, panelBorder, panelShadow, panelBlur } = useNavDebugStore(useShallow((s) => ({
    sidebarWidth: s.sidebarWidth,
    panelBgOpacity: s.panelBgOpacity,
    panelBorder: s.panelBorder,
    panelShadow: s.panelShadow,
    panelBlur: s.panelBlur,
  })))

  const siderWidth = isOpenMenuSidebar ? sidebarWidth : 48

  const siderStyle: React.CSSProperties = {
    width: siderWidth,
    minWidth: siderWidth,
    ...(panelShadow !== 'none' && { boxShadow: shadowMap[panelShadow] }),
    ...(panelBlur > 0 && { backdropFilter: `blur(${panelBlur}px)` }),
    ...(panelBgOpacity < 100 && { background: `rgba(20, 17, 28, ${panelBgOpacity / 100})` }),
    ...(!panelBorder && { borderRight: 'none' }),
  }

  return (
    <Flex
      style={{
        position: isLocked ? 'relative' : 'sticky',
        top: isLocked && offset > HEADER_HEIGHT ? offset - HEADER_HEIGHT : 0,
      }}
    >
      <div
        className={classes.siderPanel}
        style={siderStyle}
      >
        <div className={`${classes.scrollContainer} layout-sider-scroll`}>
          <MenuDrawer collapsed={!isOpenMenuSidebar} />
        </div>
      </div>
    </Flex>
  )
}
