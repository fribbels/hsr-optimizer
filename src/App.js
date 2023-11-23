import logo from './logo.svg';

import React, {useEffect} from "react"
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

import { LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, notification, Typography, message } from 'antd';
import MenuDrawer from './components/MenuDrawer'
import Tabs from './components/Tabs'
import { Helmet } from 'react-helmet';
import { SmileOutlined } from '@ant-design/icons';

import {
  ConfigProvider,
} from 'antd';

const { Header, Sider, Content, Footer } = Layout;

const App = () => {
  const [notificationApi, notificationContextHolder] = notification.useNotification();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [activeKey, setActiveKey] = React.useState("1");

  window.notificationApi = notificationApi
  window.messageApi = messageApi

  useEffect(() => {
  }, [])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgBase: '#182239'
        },
        algorithm: theme.darkAlgorithm,
      }}
    >      
      <Helmet>
        <title>Fribbels Honkai Star Rail Optimizer</title>
        <meta name="description" content="A relic optimizer for Honkai: Star Rail" />
        
        {/* Open Graph Protocol metadata for link previews */}
        <meta property="og:title" content="Fribbels Star Rail Optimizer" />
        <meta property="og:description" content="A relic optimizer for Honkai: Star Rail" />
        <meta property="og:image" content="URL to an image for the link preview" />
        <meta property="og:url" content="https://fribbels.github.io/hsr-optimizer" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card metadata for link previews on Twitter */}
        <meta name="twitter:title" content="Fribbels Star Rail Optimizer" />
        <meta name="twitter:description" content="A relic optimizer for Honkai: Star Rail" />
        <meta name="twitter:image" content="URL to an image for the link preview on Twitter." />
      </Helmet>
      {notificationContextHolder}
      {messageContextHolder}
      <Layout style={{'minHeight': '100%'}}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 50
          }}
        >
          <a href="/">
            <Typography
              style={{fontWeight: 600, fontSize: 22}}
              color="inherit"
            >
              Fribbels Star Rail Optimizer
            </Typography>
          </a>
        </Header>
        <Layout>
          <Sider
            width={200}
          >
            <MenuDrawer setActiveKey={setActiveKey}/>
          </Sider>
          <Layout
            style={{
            }}
          >
            <Content
              style={{
                padding: 10,
                margin: 0,
                minHeight: 280,
              }}
            >
              <Tabs activeKey={activeKey}/>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};
export default App;