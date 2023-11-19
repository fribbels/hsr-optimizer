import React from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { Menu } from 'antd';

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
    getItem('Relics', '2'),
    getItem('Characters', '3'),
    getItem('Import / Export', '4'),
  ]),
  getItem('Tools', 'sub2', <AppstoreOutlined />, [
    getItem('Coming soon', '6'),
  ]),
  getItem('Links', 'sub4', <AppstoreOutlined />, [
    getItem(
      <a href="https://discord.gg/rDmB4Un7qg" target="_blank" rel="noopener noreferrer">
        Discord <LinkOutlined />
      </a>,
      'link1',
      // <LinkOutlined />,
    ),
    getItem(
      <a href="https://github.com/fribbels/hsr-optimizer" target="_blank" rel="noopener noreferrer">
        Github <LinkOutlined />
      </a>,
      'link2',
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
    <Menu
      onClick={onClick}
      style={{
        height: '100%'
      }}
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1', 'sub2', 'sub4']}
      mode="inline"
      items={items}
    />
  );
};
export default MenuDrawer;