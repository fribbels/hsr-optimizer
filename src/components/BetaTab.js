import React from 'react';
import '../style/style.css'
import { Button, Flex } from "antd";
import PropTypes from "prop-types"

export default function BetaTab(props) {
  const { active } = props

  console.log('Beta Tab')

  const showModal = () => {
    global.setIsScoringModalOpen(true);
  };

  return (
    <div style={{display: active ? 'block' : 'none'}}>
      <Flex vertical gap={20} align='center'>
        <Button type="primary" onClick={showModal}>
          Open Modal
        </Button>
      </Flex>
    </div>
  );
}

BetaTab.propTypes = {
  active: PropTypes.bool
};