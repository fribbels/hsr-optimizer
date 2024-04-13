import MenuDrawer from 'components/MenuDrawer.jsx'
import { Layout } from 'antd'

const { Sider } = Layout

export function LayoutSider() {
  const menuSidebarOpen = window.store((s) => s.menuSidebarOpen)

  return (
    <Sider
      width={170}
      style={{
        background: '#243356',
      }}
      collapsible
      collapsedWidth={0}
      collapsed={!menuSidebarOpen}
      trigger={null}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#243356',
        }}
      >
        <MenuDrawer />
      </div>
    </Sider>
  )
}
