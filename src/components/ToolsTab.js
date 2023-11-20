import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
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
} from 'antd';
import '../style/style.css'
const { TextArea } = Input;
const { Text } = Typography;

export default function ToolsTab({style}) {
  return (
    <div style={style}>
      <Flex>
        <Text>Coming soon! Come drop by the <a href="https://discord.gg/rDmB4Un7qg">Discord server</a> if you have ideas or just want to hang out.</Text>
      </Flex>
    </div>
  );
};