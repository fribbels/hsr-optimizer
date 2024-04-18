import React from 'react'
import { ConfigProvider, Layout, message, theme } from 'antd'
import Tabs from 'components/Tabs'
import { LayoutHeader } from 'components/LayoutHeader.tsx'
import { LayoutSider } from 'components/LayoutSider.tsx'

const { Content } = Layout

const App = () => {
  const [messageApi, messageContextHolder] = message.useMessage()
  window.messageApi = messageApi

  return (
    <ConfigProvider
      theme={{
        token: {
          motionUnit: 0.1,
          colorBgBase: '#182239',
          opacityLoading: 0.15, // FormSetConditionals.js
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
            handleColor: '#1668DC',
            handleActiveColor: '#1668DC',
            trackBg: '#1668DC',
            trackHoverBg: '#1668DC',
            dotBorderColor: '#1668DC',
            railHoverBg: '#ffffff80',
            railBg: '#ffffff12',
            handleLineWidth: 0,
            handleLineWidthHover: 0,
            handleSizeHover: 10,
          },
          InputNumber: {
            paddingInlineSM: 4,
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
              minWidth: 1300,
              marginLeft: 'auto',
              marginRight: 'auto',
              overflow: 'initial',
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
