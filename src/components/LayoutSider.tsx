import MenuDrawer from 'components/MenuDrawer.jsx'
import { Layout, theme } from 'antd'

const { useToken } = theme
const { Sider } = Layout

export function LayoutSider() {
  const { token } = useToken()

  const menuSidebarOpen = window.store((s) => s.menuSidebarOpen)

  return (
    <Sider
      width={170}
      style={{
        background: token.colorBgContainer,
      }}
      collapsible
      collapsedWidth={48}
      collapsed={!menuSidebarOpen}
      trigger={null}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
        }}
      >
        <MenuDrawer/>
      </div>
    </Sider>
  )
}
