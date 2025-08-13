import {
  Layout,
  theme,
} from 'antd'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import MenuDrawer from 'lib/overlays/drawers/MenuDrawer'

const { useToken } = theme
const { Sider } = Layout

export function LayoutSider() {
  const { token } = useToken()

  const { isOpen: isOpenMenuSidebar } = useOpenClose(OpenCloseIDs.MENU_SIDEBAR)

  return (
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
        className="layout-sider-scroll"
      >
        <MenuDrawer />
      </div>
    </Sider>
  )
}
