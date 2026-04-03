import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { HEADER_HEIGHT } from 'lib/layout/LayoutHeader'
import { MenuDrawer } from 'lib/overlays/drawers/MenuDrawer'
import { useScrollLockState } from 'lib/layout/scrollController'
import classes from 'lib/layout/layout.module.css'

const SIDEBAR_WIDTH = 160

export function LayoutSider() {
  const { isLocked, offset } = useScrollLockState()
  const { isOpen: isOpenMenuSidebar } = useOpenClose(OpenCloseIDs.MENU_SIDEBAR)

  const siderWidth = isOpenMenuSidebar ? SIDEBAR_WIDTH : 56

  const siderStyle: React.CSSProperties = {
    width: siderWidth,
    minWidth: siderWidth,
  }

  return (
    <div
      className={classes.siderBackground}
      style={siderStyle}
    >
      <div
        className={classes.siderPanel}
        style={{
          position: isLocked ? 'relative' : 'sticky',
          top: isLocked && offset > HEADER_HEIGHT ? offset - HEADER_HEIGHT : 0,
        }}
      >
        <div className={`${classes.scrollContainer} layout-sider-scroll`}>
          <MenuDrawer collapsed={!isOpenMenuSidebar} />
        </div>
      </div>
    </div>
  )
}
