import React, { useEffect } from 'react'
import { ConfigProvider, Layout, message, theme } from 'antd'
import Tabs from 'components/Tabs'
import { LayoutHeader } from 'components/LayoutHeader.tsx'
import { LayoutSider } from 'components/LayoutSider.tsx'

const { useToken, getDesignToken } = theme
const { Content } = Layout

const App = () => {
  const [messageApi, messageContextHolder] = message.useMessage()
  window.messageApi = messageApi

  const colorTheme = store((s) => s.colorTheme)
  useEffect(() => {
    Gradient.setToken(getDesignToken({
      token: colorTheme,
    }))
  }, [colorTheme])

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
        },
        components: {
          // OptimizerForm.js
          Cascader: {
            dropdownHeight: 660,
            controlItemWidth: 100,
            controlWidth: 100,
          },

          Collapse: {
            contentPadding: '0px 0px',
          },

          // MenuDrawer.js
          Menu: {
            margin: 2,
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
            paddingInlineSM: 4,
          },
          Tag: {
            defaultColor: '#ffffff',
          },
        },
        algorithm: theme.darkAlgorithm,
      }}
    >
      {messageContextHolder}
      <Layout style={{ minHeight: '100%' }}>
        <LayoutHeader />
        <Layout hasSider>
          <LayoutSider />
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
            <Tabs />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
