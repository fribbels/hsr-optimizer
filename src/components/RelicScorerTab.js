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
import { CharacterStats } from '../lib/characterStats';
import { CharacterPreview } from './CharacterPreview';
const { TextArea } = Input;
const { Text } = Typography;

export default function RelicScorerTab({ style }) {

  const [scorerForm] = Form.useForm();
  window.scorerForm = scorerForm

  const [selectedCharacter, setSelectedCharacter] = useState();
  const [loading, setLoading] = useState(false);

  function buttonClick() {
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      console.warn('Timeout')
      
    }, 10000);
  }

  function onFinish(x) {
    console.log('finish', x)
    // let data = CharacterStats.getTestData()

    const options = {
      method: 'POST',
      body: x.scorerId, 
    };

    fetch('https://08hm0krwt2.execute-api.us-west-2.amazonaws.com/dev/getAccount', options)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse the response as JSON
      })
      .then(data => {
        console.log(data); // Now you can work with the 'data' variable containing the API response
        if (!data.status || data.status != 'SUCCESS') {
          return 'ERROR'
        }
        data = data.data
        let characters = [
          data.detail_info.assist_avatar,
          data.detail_info.avatar_detail_list[0],
          data.detail_info.avatar_detail_list[1],
          data.detail_info.avatar_detail_list[2],
        ].filter(x => !!x)

        console.log(characters)

        let converted = characters.map(x => CharacterConverter.convert(x))
        setSelectedCharacter(converted[3])
        console.log(converted)
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  }

  return (
    <div style={style}>
      <Flex vertical gap={10}>
        <Form
          form={scorerForm}
          onFinish={onFinish}
          initialValues={{ scorerId: 601069336 }}
        >
          <Flex style={{ margin: 20, width: 1000 }} justify="center" align="center" gap={10}>
            <Text style={{ width: 'fit-content' }}>Input ID:</Text>
            <Form.Item size="default" name='scorerId'>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} onClick={buttonClick}>
              Submit
            </Button>
          </Flex>
        </Form>
        <CharacterPreview character={selectedCharacter} source='scorer'/>
      </Flex>
    </div>
  );
};