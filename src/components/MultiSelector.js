
import {
  InputNumber,
} from 'antd';
import React from 'react';
import { Select, Space } from 'antd';
const options = [];
for (let i = 10; i < 36; i++) {
  options.push({
    label: i.toString(36) + i,
    value: i.toString(36) + i,
  });
}
const handleChange = (value) => {
  console.log(`selected ${value}`);
};


export const CustomFormItem = ({value, onChange}) => {
  return (
    <InputNumber size="small" controls={false}/>
  )
}


export const MultiSelector = () => {
  return (
    <Space
      style={{
        width: '100%',
      }}
      direction="vertical"
    >
    </Space>
  )
      }
    