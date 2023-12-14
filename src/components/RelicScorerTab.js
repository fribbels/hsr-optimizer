import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useReducer } from 'react';
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
import '../style/style.css'
import { CharacterStats } from '../lib/characterStats';
import { CharacterPreview } from './CharacterPreview';
import { SaveState } from '../lib/saveState';

const { TextArea } = Input;
const { Text } = Typography;

export default function RelicScorerTab({ style }) {
  console.log('RelicScorerTab')

  const [loading, setLoading] = useState(false);
  const [availableCharacters, setAvailableCharacters] = useState([])

  const [scorerForm] = Form.useForm();
  window.scorerForm = scorerForm

  function buttonClick() {
    setLoading(true)
  }

  function onFinish(x) {
    console.log('finish', x)
    // let data = CharacterStats.getTestData()

    const options = {
      method: 'POST',
      body: x.scorerId, 
    };

    DB.setScorerId(x.scorerId);
    SaveState.save()

    fetch('https://08hm0krwt2.execute-api.us-west-2.amazonaws.com/dev/getAccount', options)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        if (!data.status || data.status != 'SUCCESS') {
          setLoading(false)
          Message.error('Error loading ID')
          return 'ERROR'
        }
        data = data.data
        let characters = [
          data.detail_info.assist_avatar,
          data.detail_info.avatar_detail_list[0],
          data.detail_info.avatar_detail_list[1],
          data.detail_info.avatar_detail_list[2],
        ]
        .filter(x => !!x)
        .filter((item, index, array) => {
          return array.findIndex((i) => i.avatar_id === item.avatar_id) === index;
        });


        console.log('characters', characters)

        let converted = characters.map(x => CharacterConverter.convert(x))
        setAvailableCharacters(converted)
        console.log(converted)
        setLoading(false)
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setLoading(false)
      });
  }

  function CharacterPreviewSelection(props) {
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [modalSrc, setModalSrc] = useState(Assets.getBlank());
    const [selectedCharacter, setSelectedCharacter] = useState(availableCharacters[0]);

    const [, forceUpdate] = React.useReducer(o => !o, true);
    window.forceRelicScorerTabUpdate = forceUpdate

    console.log('CharacterPreviewSelection', props)

    let options = []
    for (let i = 0; i < props.availableCharacters.length; i++) {
      let availableCharacter = props.availableCharacters[i]
      options.push({
        label: (
          <img style={{width: 100}} src={Assets.getCharacterAvatarById(availableCharacter.id)}></img>
        ),
        value: availableCharacter.id,
      })
    }

    function selectionChange(selected) {
      console.log('selectionChange', selected)
      setSelectedCharacter(props.availableCharacters.find(x => x.id == selected))
    }

    function scoringClicked() {
      setSelectedScoringAlgorithmCharacter(selectedCharacter)
      setIsScoringModalOpen(true)
    }

    async function downloadClicked() {
      setDownloadLoading(true);

      Utils.screenshotElement(document.getElementById('previewWrapper')).then(src => {
        setModalSrc(src)
        setPreviewVisible(true)
        setDownloadLoading(false);
      }).catch((e) => {
        console.warn(e)
        setDownloadLoading(false)
        Message.warning('Error generating image')
      })
    }

    return (
      <Flex vertical align='center' gap={20} style={{ marginBottom: 100 }}>
        <Flex gap={30}>
          <Button
            type="primary"
            style={{ width: 200 }}
            onClick={scoringClicked}
          >
            Scoring algorithm
          </Button>
          <Button
            type="primary"
            style={{ display: selectedCharacter ? 'block' : 'none', width: 200 }}
            loading={downloadLoading}
            onClick={downloadClicked}
          >
            Save as image
          </Button>
        </Flex>
        <Flex vertical align='center'>
          <Segmented options={options} onChange={selectionChange} />
          <div style={{ display: modalSrc != Assets.getBlank() ? 'block' : 'none', marginTop: modalSrc ? 10 : 0 }}>
            <Image
              width={200}
              src={modalSrc}
              preview={{
                visible: previewVisible,
                onVisibleChange: (visible, prevVisible) => setPreviewVisible(visible)
              }}
            />
          </div>
        </Flex>
        <div id='previewWrapper' style={{ padding: '5px', backgroundColor: '#182239' }}>
          <CharacterPreview class='relicScorerCharacterPreview' character={selectedCharacter} source='scorer' />
        </div>
      </Flex>
    )
  }
  let initialId = undefined
  let savedId = DB.getScorerId() 
  if (savedId) {
    try {
      let parsed = parseInt(savedId)
      initialId = isNaN(parsed) ? undefined : parsed
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={style}>
      <Flex vertical gap={0} align='center'>
        <Text>Input your account ID to score your support characters. The scorer will display the character's stats at level 80 with maxed traces</Text>

        <Form
          form={scorerForm}
          onFinish={onFinish}
          initialValues={{ scorerId: initialId }}
        >
          <Flex style={{ margin: 20, width: 1000 }} justify="center" align="center" gap={10}>
            <Text style={{ width: 'fit-content' }}>Account ID:</Text>
            <Form.Item size="default" name='scorerId'>
              <Input style={{ width: 150 }} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} onClick={buttonClick}>
              Submit
            </Button>
          </Flex>
        </Form>
        <CharacterPreviewSelection availableCharacters={availableCharacters}/>
      </Flex>
    </div>
  );
};