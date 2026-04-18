import {
  Button,
  Flex,
} from '@mantine/core'
import {
  IconMenu2,
  IconX,
} from '@tabler/icons-react'
import {
  AppPages,
  BASE_PATH,
} from 'lib/constants/appPages'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { LanguageSelector } from 'lib/i18n/LanguageSelector'
import classes from 'lib/layout/layout.module.css'
import { Assets } from 'lib/rendering/assets'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'

export const HEADER_HEIGHT = 48

export function LayoutHeader() {
  const { isOpen: isOpenMenuSidebar, toggle: toggleMenuSidebar } = useOpenClose(OpenCloseIDs.MENU_SIDEBAR)

  const handleToggleSidebar = () => {
    toggleMenuSidebar()
    // Persist the new collapsed state (toggled = opposite of current)
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.sidebarCollapsed, isOpenMenuSidebar)
    SaveState.delayedSave()
  }

  return (
    <header className={classes.header} style={{ height: HEADER_HEIGHT }}>
      <Flex align='center' justify='space-between' className={classes.headerInner}>
        <Flex gap={8} align='center'>
          <Flex align='center' justify='center' style={{ width: 56, minWidth: 56 }}>
            <Button
              variant='transparent'
              onClick={handleToggleSidebar}
              className={classes.menuButton}
            >
              {isOpenMenuSidebar ? <IconX size={16} /> : <IconMenu2 size={16} />}
            </Button>
          </Flex>
          <a
            href={BASE_PATH}
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey) return
              e.preventDefault()
              useGlobalStore.getState().setActiveKey(AppPages.HOME)
            }}
          >
            <Flex align='center'>
              <img src={Assets.getLogo()} className={classes.logo} />
              <div className={classes.title}>
                Fribbels Star Rail Optimizer
              </div>
            </Flex>
          </a>
        </Flex>
        <div>
          <LanguageSelector />
        </div>
      </Flex>
    </header>
  )
}
