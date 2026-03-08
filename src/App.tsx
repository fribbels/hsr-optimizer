import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import {
  ConfigProvider,
  Layout,
  Modal,
  theme,
} from 'antd'
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

const { getDesignToken } = theme
const { Content } = Layout

const App = () => {
  const [modalApi, modalContextHolder] = Modal.useModal()

  window.modalApi = modalApi

  const colorTheme = window.store((s) => s.colorTheme)
  const globalThemeConfig = window.store((s) => s.globalThemeConfig)
  const mantineTheme = createMantineTheme(colorTheme)

  useEffect(() => {
    Gradient.setToken(getDesignToken({
      token: colorTheme,
    }))
  }, [colorTheme])

  useEffect(() => {
    checkForUpdatesNotification(DB.getState().version)
  }, [])

  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
      <Notifications position="top-right" />
      <ConfigProvider theme={globalThemeConfig}>
        {modalContextHolder}
        <Layout style={{ minHeight: '100%' }}>
          <LayoutHeader />
          <Layout hasSider>
            <LayoutSider />
            <Content
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
            </Content>
            <SettingsDrawer />
            <GettingStartedDrawer />
            <StatTracesDrawer />
          </Layout>
        </Layout>
      </ConfigProvider>
    </MantineProvider>
  )
}

export default function WrappedApp() {
  return <App />
}
