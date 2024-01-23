import React, { Profiler } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { /* ConfigProvider, */ Menu, Typography } from 'antd';
import { DiscordIcon } from '../icons/DiscordIcon';
import { GithubIcon } from '../icons/GithubIcon';
import { CoffeeIcon } from '../icons/CoffeeIcon';
import PropTypes from "prop-types";

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
  getItem('Menu', 'sub1', <MenuOutlined />, [
    getItem('Optimizer', 'optimizer'),
    getItem('Characters', 'characters'),
    getItem('Relics', 'relics'),
    getItem('Import / Save', 'import'),
    getItem('Getting started', '#getting-started'),
  ]),
  getItem('Tools', 'sub2', <MenuOutlined />, [
    getItem('Relic scorer', '#scorer'),
    getItem('Coming soon', 'coming-soon'),
  ]),
  getItem('Links', 'sub4', <MenuOutlined />, [
    getItem(
      <Typography.Link href="https://discord.gg/rDmB4Un7qg" target="_blank" rel="noopener noreferrer">
        <DiscordIcon style={{ marginRight: 5 }} /> Discord
      </Typography.Link>,
      'link discord',
    ),
    getItem(
      <Typography.Link href="https://www.patreon.com/fribbels" target="_blank" rel="noopener noreferrer">
        <CoffeeIcon style={{ marginRight: 5 }} /> Donate
      </Typography.Link>,
      'link donate',
    ),
    getItem(
      <Typography.Link href="https://github.com/fribbels/hsr-optimizer" target="_blank" rel="noopener noreferrer">
        <GithubIcon style={{ marginRight: 5 }} /> Github
      </Typography.Link>,
      'link github',
    ),
  ]),
];

const MenuDrawer = (props) => {
  const { hashes } = props;
  const [activeKey, setActiveKey] = global.store(s => [s.activeKey, s.setActiveKey]);

  const onClick = (e) => {
    if (e.key && e.key.includes('link')) return

    if (hashes.includes(e.key)) {
      history.replaceState(null, null, e.key)
    } else {
      history.replaceState(null, null, ' ');
    }
    setActiveKey(e.key)
  };
  function callback(
    id, // the "id" prop of the Profiler tree that has just committed
    phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
    actualDuration, // time spent rendering the committed update
    baseDuration, // estimated time to render the entire subtree without memoization
    startTime, // when React began rendering this update
    commitTime, // when React committed this update
    interactions // the Set of interactions belonging to this update
  ) {
    console.log('===================================================================================================')
    console.log(`MenuDrawer id: ${id} :: phase [${phase}] :: interactions ${interactions}`);
    console.log('===================================================================================================')
  }
  return (
    <Profiler id="MenuDrawer" onRender={callback}>
      <Menu
        onClick={onClick}
        // inlineIndent={15}
        style={{
          height: '100%',
          overflow: 'auto'

        }}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1', 'sub2', 'sub4']}
        selectedKeys={activeKey}
        mode="inline"
        items={items}
      />
    </Profiler>
  );
};
MenuDrawer.propTypes = {
  hashes: PropTypes.array,
}

export default MenuDrawer;