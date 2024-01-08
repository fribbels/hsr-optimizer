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

export default function RelicScorerTab(props) {
  console.log('RelicScorerTab')

  const [loading, setLoading] = useState(false);
  const [availableCharacters, setAvailableCharacters] = useState([])

  let scorerId = store(s => s.scorerId);
  let setScorerId = store(s => s.setScorerId);

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

    setScorerId(x.scorerId);
    SaveState.save()

    // fetch('http://127.0.0.1:5000/getAccount', options)
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
          data.detailInfo.avatarDetailList[3],
          data.detailInfo.avatarDetailList[0],
          data.detailInfo.avatarDetailList[1],
          data.detailInfo.avatarDetailList[2],
        ]
        .filter(x => !!x)
        .filter((item, index, array) => {
          return array.findIndex((i) => i.avatarId === item.avatarId) === index;
        });


        console.log('characters', characters)

        let converted = characters.map(x => CharacterConverter.convert(x))
        setAvailableCharacters(converted)
        setLoading(false)
        console.log(converted)
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
    let setSelectedScoringCharacter = store(s => s.setSelectedScoringCharacter);

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
      setSelectedScoringCharacter(selectedCharacter?.id)
      setIsScoringModalOpen(true)
    }

    async function downloadClicked() { // deprecated
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
  let savedId = scorerId
  if (savedId) {
    try {
      let parsed = parseInt(savedId)
      initialId = isNaN(parsed) ? undefined : parsed
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{display: props.active ? 'block' : 'none'}}>
      <Flex vertical gap={0} align='center'>
        <Flex gap={10} vertical align='center'>
          <Text>Input your account ID to score your support characters. The scorer will display the character's stats at level 80 with maxed traces</Text>
        </Flex>
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