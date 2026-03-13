import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { ConfirmModalProvider } from 'lib/interactions/confirmModal'
import { checkForUpdatesNotification } from 'lib/interactions/notifications'
import { LayoutHeader } from 'lib/layout/LayoutHeader'
import { LayoutSider } from 'lib/layout/LayoutSider'
import { GlobalModals } from 'lib/overlays/GlobalModals'
import { Gradient } from 'lib/rendering/gradient'
import { createMantineTheme } from 'lib/rendering/theme'
import { useGlobalStore } from 'lib/stores/appStore'
import Tabs from 'lib/tabs/Tabs'
import React, { useEffect } from 'react'

export default function App() {
  const colorTheme = useGlobalStore((s) => s.colorTheme)
  const mantineTheme = createMantineTheme(colorTheme)

  useEffect(() => {
    Gradient.setTheme(colorTheme)
  }, [colorTheme])

  useEffect(() => {
    checkForUpdatesNotification(useGlobalStore.getState().version)
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
