import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { ConfirmModalProvider } from 'lib/interactions/confirmModal'
import { checkForUpdatesNotification } from 'lib/interactions/notifications'
import { LayoutHeader } from 'lib/layout/LayoutHeader'
import { LayoutSider } from 'lib/layout/LayoutSider'
import { GettingStartedDrawer } from 'lib/overlays/drawers/GettingStartedDrawer'
import { SettingsDrawer } from 'lib/overlays/drawers/SettingsDrawer'
import { StatTracesDrawer } from 'lib/overlays/drawers/StatTracesDrawer'
import { Gradient } from 'lib/rendering/gradient'
import { createMantineTheme } from 'lib/rendering/theme'
import DB from 'lib/state/db'
import Tabs from 'lib/tabs/Tabs'
import React, { useEffect } from 'react'

const App = () => {
  const colorTheme = window.store((s) => s.colorTheme)
  const mantineTheme = createMantineTheme(colorTheme)

  useEffect(() => {
    Gradient.setTheme(colorTheme)
  }, [colorTheme])

  useEffect(() => {
    checkForUpdatesNotification(DB.getState().version)
  }, [])

  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
      <ModalsProvider>
      <Notifications position="top-right" />
      <ConfirmModalProvider>
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
          <LayoutHeader />
          <div style={{ display: 'flex', flex: 1 }}>
            <LayoutSider />
            <div
              style={{
                padding: '10px 10px 0 10px',
                margin: 0,
                minHeight: 280,
                marginLeft: 'auto',
                marginRight: 'auto',
                overflow: 'initial',
                display: 'flex',
                justifyContent: 'space-around',
                width: '100%',
              }}
            >
              <Tabs />
            </div>
            <SettingsDrawer />
            <GettingStartedDrawer />
            <StatTracesDrawer />
          </div>
        </div>
      </ConfirmModalProvider>
      </ModalsProvider>
    </MantineProvider>
  )
}

export default function WrappedApp() {
  return <App />
}
