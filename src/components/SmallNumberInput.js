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
} from 'antd';
import '../style/style.css'
const { TextArea } = Input;
const { Text } = Typography;

const MultiSelector = () => {
  return (
    <>
        <InputNumber size="small" controls={false}/>
    </>
  );
};
export default () => <MultiSelector />;