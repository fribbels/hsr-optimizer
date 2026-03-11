import { Flex } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { HEADER_HEIGHT } from 'lib/layout/LayoutHeader'
import MenuDrawer from 'lib/overlays/drawers/MenuDrawer'
import { useScrollLockState } from 'lib/rendering/scrollController'

export function LayoutSider() {

  const { isLocked, offset } = useScrollLockState()
  const { isOpen: isOpenMenuSidebar } = useOpenClose(OpenCloseIDs.MENU_SIDEBAR)

  const siderWidth = isOpenMenuSidebar ? 170 : 48

  return (
    <Flex
      style={{
        position: isLocked ? 'relative' : 'sticky',
        top: isLocked && offset > HEADER_HEIGHT ? offset - HEADER_HEIGHT : 0,
      }}
    >
      <div
        style={{
          width: siderWidth,
          minWidth: siderWidth,
          background: 'var(--mantine-color-dark-7)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden',
          transition: 'width 0.2s',
        }}
      >
        <div
          style={{
            height: '100%',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className='layout-sider-scroll'
        >
          <MenuDrawer />
        </div>
      </div>
    </Flex>
  )
}
