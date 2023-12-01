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
  Segmented,
  theme,
  ConfigProvider,
  Modal,
  Image,
} from 'antd';
import styled from 'styled-components';
import '../style/style.css'
import { CharacterStats } from '../lib/characterStats';
import { CharacterPreview } from './CharacterPreview';

const { TextArea } = Input;
const { Text } = Typography;


const InputNumberStyled = styled(InputNumber)`
  width: 62px
`

export default function BetaTab({ style }) {
  const [scoringAlgorithmForm] = Form.useForm();
  window.scoringAlgorithmForm = scoringAlgorithmForm

  console.log('Beta Tab')

  const [isModalOpen, setIsModalOpen] = useState(true);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function StatValueRow(props) {
    return (
      <Flex justify="space-between" style={{width: 200}}>
        <Flex>
          <img src={Assets.getStatIcon(props.stat)} style={{ width: 25, height: 25, marginRight: 3 }}></img>
          <Text>{props.stat}</Text>
        </Flex>
        <Form.Item size="default" name={`${props.stat}`}>
          <InputNumberStyled/>
        </Form.Item>
      </Flex>
    )
  }

  const onFinish = (x) => {
    console.log('Form finished', x);
  };


  return (
    <div style={style}>
      <Flex vertical gap={20} align='center'>
        <Button type="primary" onClick={showModal}>
          Open Modal
        </Button>
        <Modal
          title='Scoring algorithm'
          open={isModalOpen}
          onOk={scoringAlgorithmForm.submit}
          onCancel={handleCancel}
        >
          <Form
            form={scoringAlgorithmForm}
            layout="vertical"
            onFinish={onFinish}
          >
            <Flex vertical gap={5}>
              <StatValueRow stat={Constants.Stats.SPD}/>
              <StatValueRow stat={Constants.Stats.HP_P}/>
            </Flex>
          </Form>
        </Modal>
      </Flex>
    </div>
  );
};


            // footer={[
            //   <Button form={scoringAlgorithmForm} key="submit" htmlType="submit">
            //       Submit
            //   </Button>
            // ]}