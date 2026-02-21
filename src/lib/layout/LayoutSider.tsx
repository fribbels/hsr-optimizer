import {
  Flex,
  Layout,
  theme,
} from 'antd'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { HEADER_HEIGHT } from 'lib/layout/LayoutHeader'
import MenuDrawer from 'lib/overlays/drawers/MenuDrawer'
import { useScrollLockState } from 'lib/rendering/scrollController'

const { useToken } = theme
const { Sider } = Layout

export function LayoutSider() {
  const { token } = useToken()

  const { isLocked, offset } = useScrollLockState()

  const { isOpen: isOpenMenuSidebar } = useOpenClose(OpenCloseIDs.MENU_SIDEBAR)

  return (
    <Flex
      style={{
        position: isLocked ? 'relative' : 'sticky',
        top: isLocked && offset > HEADER_HEIGHT ? offset - HEADER_HEIGHT : 0,
      }}
    >
      <Sider
        width={170}
        style={{
          background: token.colorBgContainer,
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden',
        }}
        collapsible
        collapsedWidth={48}
        collapsed={!isOpenMenuSidebar}
        trigger={null}
      >
        <div
          style={{
            height: '100%',
            overflowY: 'auto',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
          className='layout-sider-scroll'
        >
          <MenuDrawer />
        </div>
      </Sider>
    </Flex>
  )
}
