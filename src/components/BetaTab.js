import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useMemo } from 'react';
import {
  Button,
  Cascader,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Slider,
  Space,
  Switch,
  TreeSelect,
  Row,
  Typography,
  message,
  Upload,
  Flex,
  Segmented,
  theme,
  ConfigProvider,
  Modal,
  Image,
  Divider,
  Tag,
} from 'antd';
import styled from 'styled-components';
import '../style/style.css'
import { CharacterStats } from '../lib/characterStats';
import { CharacterPreview } from './CharacterPreview';

const { TextArea } = Input;
const { Text } = Typography;


export default function BetaTab({ style }) {
  console.log('Beta Tab')

  const showModal = () => {
    setIsScoringModalOpen(true);
  };

  return (
    <div style={style}>
      <Flex vertical gap={20} align='center'>
        <Button type="primary" onClick={showModal}>
          Open Modal
        </Button>
      </Flex>
    </div>
  );
};


            // footer={[
            //   <Button form={scoringAlgorithmForm} key="submit" htmlType="submit">
            //       Submit
            //   </Button>
            // ]}