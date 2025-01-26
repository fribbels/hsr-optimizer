import { ConfigProvider, Layout, message, Modal, notification, theme } from 'antd'
import { checkForUpdatesNotification } from 'lib/interactions/notifications'
import { LayoutHeader } from 'lib/layout/LayoutHeader'
import { LayoutSider } from 'lib/layout/LayoutSider'
import { GettingStartedDrawer } from 'lib/overlays/drawers/GettingStartedDrawer'
import { SettingsDrawer } from 'lib/overlays/drawers/SettingsDrawer'
import { StatTracesDrawer } from 'lib/overlays/drawers/StatTracesDrawer'
import { Gradient } from 'lib/rendering/gradient'
import DB from 'lib/state/db'
import Tabs from 'lib/tabs/Tabs'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const { getDesignToken } = theme
const { Content } = Layout

const App = () => {
  const [messageApi, messageContextHolder] = message.useMessage()
  const [notificationApi, notificationContextHolder] = notification.useNotification()
  const [modalApi, modalContextHolder] = Modal.useModal()
  const { i18n } = useTranslation()

  window.messageApi = messageApi
  window.notificationApi = notificationApi
  window.modalApi = modalApi

  const colorTheme = window.store((s) => s.colorTheme)
  const globalThemeConfig = window.store((s) => s.globalThemeConfig)

  useEffect(() => {
    Gradient.setToken(getDesignToken({
      token: colorTheme,
    }))
  }, [colorTheme])

  useEffect(() => {
    checkForUpdatesNotification(DB.getState().version)
  }, [])

  useEffect(() => {
    console.log('setting language to:', i18n.resolvedLanguage)
  }, [i18n.resolvedLanguage])

  return (
    <ConfigProvider theme={globalThemeConfig}>
      {messageContextHolder}
      {notificationContextHolder}
      {modalContextHolder}
      <Layout style={{ minHeight: '100%' }}>
        <LayoutHeader/>
        <Layout hasSider>
          <LayoutSider/>
          <Content
            style={{
              padding: 10,
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
            <Tabs/>
          </Content>
          <SettingsDrawer/>
          <GettingStartedDrawer/>
          <StatTracesDrawer/>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default function WrappedApp() {
  return (
    <App/>
  )
}
