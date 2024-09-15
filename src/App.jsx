import React, { useEffect } from 'react'
import { ConfigProvider, Layout, message, Modal, notification, theme } from 'antd'
import Tabs from 'components/Tabs'
import { LayoutHeader } from 'components/LayoutHeader.tsx'
import { LayoutSider } from 'components/LayoutSider.tsx'
import { SettingsDrawer } from 'components/SettingsDrawer'
import { checkForUpdatesNotification } from 'lib/notifications'

const { useToken, getDesignToken } = theme
const { Content } = Layout

const App = () => {
  const [messageApi, messageContextHolder] = message.useMessage()
  const [notificationApi, notificationContextHolder] = notification.useNotification()
  const [modalApi, modalContextHolder] = Modal.useModal()

  window.messageApi = messageApi
  window.notificationApi = notificationApi
  window.modalApi = modalApi

  const colorTheme = store((s) => s.colorTheme)
  useEffect(() => {
    Gradient.setToken(getDesignToken({
      token: colorTheme,
    }))
  }, [colorTheme])

  useEffect(() => {
    checkForUpdatesNotification(DB.getState().version)
  }, [])

  return (
    <ConfigProvider
      theme={{
        token: {
          motionUnit: 0.1,
          opacityLoading: 0.20, // FormSetConditionals.js
          colorBgBase: colorTheme.colorBgBase,
          colorTextBase: colorTheme.colorTextBase,
          colorPrimary: colorTheme.colorPrimary,
          colorPrimaryBorderHover: colorTheme.colorPrimary,
          screenXL: 1530,
          screenXLMin: 1530,
          screenXXL: 1660,
          screenXXLMin: 1660,
        },
        components: {
          // OptimizerForm.js
          Cascader: {
            dropdownHeight: 800,
            controlItemWidth: 100,
            controlWidth: 100,
          },

          Collapse: {
            contentPadding: '0px 0px',
          },

          // MenuDrawer.js
          Menu: {
            margin: 2,
            itemPaddingInline: 0,
            subMenuItemBg: 'rgba(255, 255, 255, 0.05)',
          },

          Table: {
            headerBg: '#00000036',
            cellPaddingInlineSM: 5,
            cellPaddingBlockSM: 6,
          },

          Slider: {
            dotBorderColor: colorTheme.colorPrimary,
            dotActiveBorderColor: colorTheme.colorPrimary,
            handleActiveColor: colorTheme.colorPrimary,
            handleColor: colorTheme.colorPrimary,
            handleColorDisabled: colorTheme.colorPrimary,
            trackBg: colorTheme.colorPrimary,
            trackHoverBg: colorTheme.colorPrimary,
            railHoverBg: '#ffffff80',
            railBg: '#ffffff12',
            handleSize: 5,
            handleSizeHover: 5,
            handleLineWidth: 3,
            handleLineWidthHover: 3,
            railSize: 3,
          },
          InputNumber: {
            paddingInlineSM: 6,
          },
          Tag: {
            defaultColor: '#ffffff',
          },
          Notification: {
            width: 450,
          },
        },
        algorithm: theme.darkAlgorithm,
      }}
    >
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
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
