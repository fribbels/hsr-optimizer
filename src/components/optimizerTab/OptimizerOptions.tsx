/* eslint-disable react/prop-types */
import * as React from 'react';
import { Flex, Form, Radio, RadioChangeEvent, Select, Switch, Typography } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { Hint } from "../../lib/hint";
import { HeaderText } from '../HeaderText';
import { TooltipImage } from '../TooltipImage';

import FormCard from './FormCard';

const { Text } = Typography;

const OptimizerOptions = ({ defaultGap = 0 as number, panelWidth = 0 as number }): JSX.Element => {
  const setStatDisplay = global.store(s => s.setStatDisplay);

  const onChangeStatDisplay = (e: RadioChangeEvent) => {
    const { target: { value } } = e;
    setStatDisplay(value);
  };

  return (
    <FormCard>
      <Flex justify='space-between' align='center'>
        <HeaderText>Optimizer options</HeaderText>
        <TooltipImage type={Hint.optimizerOptions()} />
      </Flex>

      <Flex align='center'>
          <Form.Item name="predictMaxedMainStat" valuePropName="checked">
              <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  defaultChecked
                  style={{ width: 45, marginRight: 10 }}
              />
          </Form.Item>
          <Text>Maxed main stat</Text>
      </Flex>

      <Flex align='center'>
        <Form.Item name="rankFilter" valuePropName="checked">
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
            style={{ width: 45, marginRight: 10 }}
          />
        </Form.Item>
        <Text>Character rank filter</Text>
      </Flex>

      <Flex align='center'>
        <Form.Item name="includeEquippedRelics" valuePropName="checked">
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
            style={{ width: 45, marginRight: 10 }}
          />
        </Form.Item>
        <Text>Use equipped</Text>
      </Flex>

      <Flex align='center'>
        <Form.Item name="keepCurrentRelics" valuePropName="checked">
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
            style={{ width: 45, marginRight: 10 }}
          />
        </Form.Item>
        <Text>Keep current relics</Text>
      </Flex>

      <Flex justify='space-between' align='center' style={{ marginTop: 15 }}>
        <HeaderText>Relic enhance / rarity</HeaderText>
        {/*<TooltipImage type={Hint.optimizerOptions()} />*/}
      </Flex>

      <Flex justify='space-between'>
        <Form.Item name="enhance">
          <Select
            style={{ width: (panelWidth - defaultGap) / 2 }}
            options={[
              { value: 0, label: '+0' },
              { value: 3, label: '+3' },
              { value: 6, label: '+6' },
              { value: 9, label: '+9' },
              { value: 12, label: '+12' },
              { value: 15, label: '+15' },
            ]}
          />
        </Form.Item>

        <Form.Item name="grade">
          <Select
            style={{ width: (panelWidth - defaultGap) / 2 }}
            options={[
              { value: 2, label: '2+ stars' },
              { value: 3, label: '3+ stars' },
              { value: 4, label: '4+ stars' },
              { value: 5, label: '5 stars' },
            ]}
          />
        </Form.Item>
      </Flex>

      <Flex justify='space-between' align='center' style={{ marginTop: 15 }}>
        <HeaderText>Stat display</HeaderText>
        {/*<TooltipImage type={Hint.optimizerOptions()} />*/}
      </Flex>

      <Form.Item name="statDisplay">
        <Radio.Group
          onChange={onChangeStatDisplay}
          optionType="button"
          buttonStyle="solid"
          style={{ width: '100%', display: 'flex' }}
        >
          <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value={'base'} defaultChecked>Base stats</Radio>
          <Radio style={{ display: 'flex', flex: 1, justifyContent: 'center', paddingInline: 0 }} value={'combat'}>Combat stats</Radio>
        </Radio.Group>
      </Form.Item>

      {/*
      <Button type="primary" onClick={showDrawer}>
        Advanced Options
      </Button>
      <Drawer
        placement="right"
        closable={false}
        onClose={onClose}
        open={open}
        getContainer={false}
        width={250}
      >
        <HeaderText>
          Damage Buffs
          Coming Soon
        </HeaderText>

        <Divider style={{marginTop: '8px', marginBottom: '12px'}}/>

      </Drawer>

      <Text>Actions</Text>
      <Button type="primary" onClick={saveCharacterClicked} style={{width: '100%'}}>
        Save Character
      </Button> */}
    </FormCard>

  );
};

export default OptimizerOptions;