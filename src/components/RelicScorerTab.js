import React, { useEffect, useState } from 'react';
import { Button, Flex, Form, Input, Segmented, Typography, } from 'antd';
import { CharacterPreview } from 'components/CharacterPreview';
import { SaveState } from 'lib/saveState';
import { Message } from "lib/message";
import { CharacterConverter } from "lib/characterConverter";
import { Assets } from "lib/assets";
import PropTypes from "prop-types";
import DB from "lib/db";
import { useSubscribe } from 'hooks/useSubscribe';
import { Utils } from "../lib/utils";
import { CameraOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function RelicScorerTab() {
  console.log('RelicScorerTab')

  const [loading, setLoading] = useState(false);
  const [availableCharacters, setAvailableCharacters] = useState([])
  const [selectedCharacter, setSelectedCharacter] = useState();

  let scorerId = global.store(s => s.scorerId);
  let setScorerId = global.store(s => s.setScorerId);

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

    // fetch('http://127.0.0.1:5000/getAccount', options) // Local testing
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
        if (converted.length) {
          setSelectedCharacter(converted[0])
        }
        setLoading(false)
        console.log(converted)
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setLoading(false)
      });
  }

  function scoringClicked() {
    global.setIsScoringModalOpen(true)
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
    <div>
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
            <Button
              style={{ width: 200 }}
              onClick={scoringClicked}
            >
              Scoring algorithm
            </Button>
          </Flex>
        </Form>
        <CharacterPreviewSelection
          availableCharacters={availableCharacters}
          setSelectedCharacter={setSelectedCharacter}
          selectedCharacter={selectedCharacter}
        />
      </Flex>
    </div>
  );
}
RelicScorerTab.propTypes = {
  active: PropTypes.bool,
}

function CharacterPreviewSelection(props) {
  let setScoringAlgorithmFocusCharacter = global.store(s => s.setScoringAlgorithmFocusCharacter);

  const [screenshotLoading, setScreenshotLoading] = useState(false);

  // TODO: Revisit if force updates are necessary
  const [, forceUpdate] = React.useReducer(o => !o, true);
  window.forceRelicScorerTabUpdate = () => {
    console.log('RelicScorerTab ::::: forceRelicScorerTabUpdate')
    forceUpdate();
  }

  useSubscribe('refreshRelicsScore', () => {
    // TODO: understand why setTimeout is needed and refactor
    setTimeout(() => { forceUpdate() }, 100);
  });

  console.log('CharacterPreviewSelection', props)

  useEffect(() => {
    setScoringAlgorithmFocusCharacter(props.selectedCharacter?.id)
  }, [props.selectedCharacter?.id, setScoringAlgorithmFocusCharacter])

  let options = []
  for (let i = 0; i < props.availableCharacters.length; i++) {
    let availableCharacter = props.availableCharacters[i]
    options.push({
      label: (
        <Flex align='center'>
          <img style={{ width: 100 }} src={Assets.getCharacterAvatarById(availableCharacter.id)}></img>
        </Flex>
      ),
      value: availableCharacter.id,
    })
  }

  function selectionChange(selected) {
    console.log('selectionChange', selected)
    props.setSelectedCharacter(props.availableCharacters.find(x => x.id == selected))
    setScoringAlgorithmFocusCharacter(selected)
  }

  async function importClicked() {
    let newRelics = props.availableCharacters
    .flatMap(x => Object.values(x.equipped))
    .filter(x => !!x)

    console.log('importClicked', props.availableCharacters, newRelics)
    DB.mergeVerifiedRelicsWithState(newRelics)
    SaveState.save()
  }

  async function screenshotClicked() {
    setScreenshotLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      Utils.screenshotElementById('relicScorerPreview').finally(() => {
        setScreenshotLoading(false)
      })
    }, 50)
  }

  return (
    <Flex vertical align='center' gap={5} style={{ marginBottom: 100 }}>
      <Flex gap={10} style={{ display: (props.availableCharacters.length > 0) ? 'flex' : 'none' }}>
        <Button onClick={importClicked} style={{width: 200}}>
          Import relics into optimizer
        </Button>
        <Button onClick={screenshotClicked} style={{width: 200}} icon={<CameraOutlined />} loading={screenshotLoading}>
          Screenshot
        </Button>
      </Flex>

      <Flex vertical align='center'>
        <Segmented options={options} onChange={selectionChange} value={props.selectedCharacter?.id} />
      </Flex>
      <div id='previewWrapper' style={{ padding: '5px', backgroundColor: '#182239' }}>
        <CharacterPreview class='relicScorerCharacterPreview' character={props.selectedCharacter} source='scorer' id='relicScorerPreview'/>
      </div>
    </Flex>
  )
}
CharacterPreviewSelection.propTypes = {
  availableCharacters: PropTypes.array,
  selectedCharacter: PropTypes.object,
  setSelectedCharacter: PropTypes.func,
}