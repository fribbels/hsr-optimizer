import React from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { ConfigProvider, Menu, Typography } from 'antd';

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}
const items = [
  getItem('Menu', 'sub1',  <AppstoreOutlined />, [
    getItem('Optimizer', '1'), 
    getItem('Characters', '3'),
    getItem('Relics', '2'),
    getItem('Import', '4'),
    getItem('Guide', '5'),
  ]),
  getItem('Tools', 'sub2', <AppstoreOutlined />, [
    getItem('Coming soon', '6'),
  ]),
  getItem('Links', 'sub4', <AppstoreOutlined />, [
    getItem(
      <Typography.Link href="https://discord.gg/rDmB4Un7qg" target="_blank" rel="noopener noreferrer">
        Discord <LinkOutlined />
      </Typography.Link>,
      'link discord',
      // <LinkOutlined />,
    ),
    getItem(
      <Typography.Link href="https://www.patreon.com/fribbels" target="_blank" rel="noopener noreferrer">
        Donate <LinkOutlined />
      </Typography.Link>,
      'link donate',
      // <LinkOutlined />,
    ),
    getItem(
      <Typography.Link href="https://github.com/fribbels/hsr-optimizer" target="_blank" rel="noopener noreferrer">
        Github <LinkOutlined />
      </Typography.Link>,
      'link github',
      // <LinkOutlined />,
    ),
  ]),
];

const MenuDrawer = ({setActiveKey}) => {
  const onClick = (e) => {
    if (e.key && e.key.includes('link')) return
    
    console.log('click ', e);
    setActiveKey(e.key)
  };
  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            margin: 2
          },
        },
      }}
    >
      <Menu
        onClick={onClick}
        // inlineIndent={15} 
        style={{
          height: '100%'
        }}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1', 'sub2', 'sub4']}
        mode="inline"
        items={items}
      />
    </ConfigProvider>
  );
};
export default MenuDrawer;