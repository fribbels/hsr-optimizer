import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { ConfirmModalProvider } from 'lib/interactions/confirmModal'
import { checkForUpdatesNotification } from 'lib/interactions/notifications'
import { LayoutHeader } from 'lib/layout/LayoutHeader'
import { LayoutSider } from 'lib/layout/LayoutSider'
import { GlobalModals } from 'lib/overlays/GlobalModals'
import { Gradient } from 'lib/rendering/gradient'
import { createMantineTheme, Themes } from 'lib/rendering/theme'
import { useGlobalStore } from 'lib/stores/appStore'
import { Tabs } from 'lib/tabs/Tabs'
import { useEffect } from 'react'

const mantineTheme = createMantineTheme(Themes.BLUE)
Gradient.setTheme(Themes.BLUE)

export function App() {
  // Defer update notification past initial load to avoid blocking the first paint.
  useEffect(() => {
    const timerId = setTimeout(() => checkForUpdatesNotification(useGlobalStore.getState().version), 5000)
    return () => clearTimeout(timerId)
  }, [])

  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme='dark'>
      <ModalsProvider>
        <Notifications position='top-right' />
        <ConfirmModalProvider>
          <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <LayoutHeader />
            <div style={{ display: 'flex', flex: 1 }}>
              <LayoutSider />
              <div
                style={{
                  padding: '10px 10px 0 10px',
                  margin: '0 auto',
                  minHeight: 280,
                  overflow: 'initial',
                  display: 'flex',
                  justifyContent: 'space-around',
                  width: '100%',
                }}
              >
                <Tabs />
              </div>
            </div>
          </div>
          <GlobalModals />
        </ConfirmModalProvider>
      </ModalsProvider>
    </MantineProvider>
  )
}
