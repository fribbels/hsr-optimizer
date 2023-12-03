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
import { Assets } from '../lib/assets';

const { TextArea } = Input;
const { Text } = Typography;


const InputNumberStyled = styled(InputNumber)`
  width: 62px
`

function generateOrnamentsOptions() {
  return Object.values(Constants.SetsOrnaments).map(x => {
    return {
      value: x,
      label:
        <Flex gap={5} align='center'>
          <img src={Assets.getSetImage(x, Constants.Parts.PlanarSphere)} style={{ width: 26, height: 26 }}></img>
          <div style={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap' }}>
            {x}
          </div>
        </Flex>
    }
  })
}

function generateRelicsOptions() {
  return Object.values(Constants.SetsRelics).map(x => {
    return {
      value: x,
      label:
        <Flex gap={5} align='center'>
          <img src={Assets.getSetImage(x, Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
          <div style={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap' }}>
            {x}
          </div>
        </Flex>
    }
  })
}

function ornamentSetTagRenderer(props) {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 32, alignItems: 'center', overflow: 'hidden' }}
    >
      <Flex>
        <img title={value} src={Assets.getSetImage(value, Constants.Parts.PlanarSphere)} style={{ width: 40, height: 40 }}></img>
      </Flex>
    </Tag>
  );
}

function relicSetTagRenderer(props) {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 32, alignItems: 'center', overflow: 'hidden' }}
    >
      <Flex>
        <img title={value} src={Assets.getSetImage(value, Constants.Parts.PlanarSphere)} style={{ width: 40, height: 40 }}></img>
      </Flex>
    </Tag>
  );
}

export default function ScoringModal() {
  const [scoringAlgorithmForm] = Form.useForm();
  const [selectedScoringCharacter, setSelectedScoringCharacter] = useState();
  window.setSelectedScoringAlgorithmCharacter = function (character) {
    setSelectedScoringCharacter(character)
    if (character && character.id) {
      characterSelectorChange(character.id)
    }
  }

  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  window.setIsScoringModalOpen = setIsScoringModalOpen


  function characterSelectorChange(id) {
    setSelectedScoringCharacter(characterOptions.find(x => x.id == id))
    let character = DB.getCharacterById(id)
    if (character) {
      let defaultScores = JSON.parse(JSON.stringify(DB.getMetadata().characters[id].scores))
      defaultScores.characterId = id
      for (let x of Object.entries(defaultScores.stats)) {
        if (x[1] == 0) {
          defaultScores.stats[x[0]] = undefined
        }
      }
      scoringAlgorithmForm.setFieldsValue(defaultScores)

      console.log(defaultScores)
    }
  }

  const panelWidth = 225
  const defaultGap = 5
  const selectWidth = 360

  const characterOptions = useMemo(() => {
    let characterData = JSON.parse(JSON.stringify(DB.getMetadata().characters));

    for (let value of Object.values(characterData)) {
      value.value = value.id;
      value.label = value.displayName;
    }

    return Object.values(characterData).sort((a, b) => a.label.localeCompare(b.label))
  }, []);

  const showModal = () => {
    setIsScoringModalOpen(true);
  };
  const handleOk = () => {
    setIsScoringModalOpen(false);
  };
  const handleCancel = () => {
    setIsScoringModalOpen(false);
  };

  function StatValueRow(props) {
    return (
      <Flex justify="flex-start" style={{ width: panelWidth }} align='center' gap={5}>
        <Form.Item size="default" name={['stats', props.stat]}>
          <InputNumberStyled controls={false} />
        </Form.Item>
        <Flex>
          <img src={Assets.getStatIcon(props.stat)} style={{ width: 25, height: 25, marginRight: 3 }}></img>
          <Text style={{ lineHeight: 1.8 }}>{Constants.StatsToReadable[props.stat]}</Text>
        </Flex>
      </Flex>
    )
  }

  function onModalOk() {
    console.log('Modal OK');
    scoringAlgorithmForm.submit()
    setIsScoringModalOpen(false)

    // TODO ...
    setTimeout(() => forceRelicScorerTabUpdate(), 100)
    setTimeout(() => forceCharacterTabUpdate(), 100)
  }

  const onFinish = (x) => {
    console.log('Form finished', x);
    x.stats[Constants.Stats.ATK_P] = x.stats[Constants.Stats.ATK]
    x.stats[Constants.Stats.DEF_P] = x.stats[Constants.Stats.DEF]
    x.stats[Constants.Stats.HP_P] = x.stats[Constants.Stats.HP]

    x.modified = true
    DB.getMetadata().characters[selectedScoringCharacter.id].scores = x
  };

  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  let previewSrc = (selectedScoringCharacter && selectedScoringCharacter.id) ? Assets.getCharacterPreviewById(selectedScoringCharacter.id) : Assets.getBlank()
  
  return (
    <Modal
      title='Scoring algorithm'
      open={isScoringModalOpen}
      width={800}
      onOk={onModalOk}
      onCancel={handleCancel}
    >
      <Form
        form={scoringAlgorithmForm}
        layout="vertical"
        onFinish={onFinish}
      >
        <Flex gap={10} vertical>
          <Flex gap={20} justify='space-between'>
            <Flex vertical gap={5}>
              <Form.Item size="default" name='characterId'>
                <Select
                  showSearch
                  filterOption={filterOption}
                  style={{ width: panelWidth }}
                  onChange={characterSelectorChange}
                  options={characterOptions}
                />
              </Form.Item>
              <img src={previewSrc} style={{ width: panelWidth }} />
            </Flex>
            <Flex vertical gap={3}>
              <StatValueRow stat={Constants.Stats.ATK} />
              <StatValueRow stat={Constants.Stats.HP} />
              <StatValueRow stat={Constants.Stats.DEF} />
              <StatValueRow stat={Constants.Stats.SPD} />
              <StatValueRow stat={Constants.Stats.CR} />
              <StatValueRow stat={Constants.Stats.CD} />
              <StatValueRow stat={Constants.Stats.EHR} />
              <StatValueRow stat={Constants.Stats.RES} />
              <StatValueRow stat={Constants.Stats.BE} />
            </Flex>
            <Flex vertical gap={3}>
              <StatValueRow stat={Constants.Stats.ERR} />
              <StatValueRow stat={Constants.Stats.OHB} />
              <StatValueRow stat={Constants.Stats.Physical_DMG} />
              <StatValueRow stat={Constants.Stats.Fire_DMG} />
              <StatValueRow stat={Constants.Stats.Ice_DMG} />
              <StatValueRow stat={Constants.Stats.Lightning_DMG} />
              <StatValueRow stat={Constants.Stats.Wind_DMG} />
              <StatValueRow stat={Constants.Stats.Quantum_DMG} />
              <StatValueRow stat={Constants.Stats.Imaginary_DMG} />
            </Flex>
          </Flex>
        </Flex>
        <Divider />

        <Flex justify='space-between'>
          <Flex vertical gap={defaultGap * 2}>
            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                Body
              </Text>
              <Form.Item size="default" name={['parts', Constants.Parts.Body]}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  size={"large"}
                  placeholder="Body"
                  maxTagCount='responsive'>
                  <Select.Option value={Constants.Stats.HP_P}>HP%</Select.Option>
                  <Select.Option value={Constants.Stats.ATK_P}>ATK%</Select.Option>
                  <Select.Option value={Constants.Stats.DEF_P}>DEF%</Select.Option>
                  <Select.Option value={Constants.Stats.CR}>CRIT Rate</Select.Option>
                  <Select.Option value={Constants.Stats.CD}>CRIT DMG</Select.Option>
                  <Select.Option value={Constants.Stats.OHB}>Outgoing Healing</Select.Option>
                  <Select.Option value={Constants.Stats.EHR}>Effect HIT Rate</Select.Option>
                </Select>
              </Form.Item>
            </Flex>

            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                Feet
              </Text>
              <Form.Item size="default" name={['parts', Constants.Parts.Feet]}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  size={"large"}
                  placeholder="Feet"
                  maxTagCount='responsive'>
                  <Select.Option value={Constants.Stats.HP_P}>HP%</Select.Option>
                  <Select.Option value={Constants.Stats.ATK_P}>ATK%</Select.Option>
                  <Select.Option value={Constants.Stats.DEF_P}>DEF%</Select.Option>
                  <Select.Option value={Constants.Stats.SPD}>Speed</Select.Option>
                </Select>
              </Form.Item>
            </Flex>
          </Flex>
          <Flex vertical gap={defaultGap * 2}>
            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                Planar Sphere
              </Text>
              <Form.Item size="default" name={['parts', Constants.Parts.PlanarSphere]}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  size={"large"}
                  placeholder="Planar Sphere"
                  listHeight={400}
                  maxTagCount='responsive'>
                  <Select.Option value={Constants.Stats.HP_P}>HP%</Select.Option>
                  <Select.Option value={Constants.Stats.ATK_P}>ATK%</Select.Option>
                  <Select.Option value={Constants.Stats.DEF_P}>DEF%</Select.Option>
                  <Select.Option value={Constants.Stats.Physical_DMG}>Physical DMG</Select.Option>
                  <Select.Option value={Constants.Stats.Fire_DMG}>Fire DMG</Select.Option>
                  <Select.Option value={Constants.Stats.Ice_DMG}>Ice DMG</Select.Option>
                  <Select.Option value={Constants.Stats.Lightning_DMG}>Lightning DMG</Select.Option>
                  <Select.Option value={Constants.Stats.Wind_DMG}>Wind DMG</Select.Option>
                  <Select.Option value={Constants.Stats.Quantum_DMG}>Quantum DMG</Select.Option>
                  <Select.Option value={Constants.Stats.Imaginary_DMG}>Imaginary DMG</Select.Option>
                </Select>
              </Form.Item>
            </Flex>

            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                Link rope
              </Text>

              <Form.Item size="default" name={['parts', Constants.Parts.LinkRope]}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  size={"large"}
                  placeholder="Link Rope"
                  maxTagCount='responsive'>
                  <Select.Option value={Constants.Stats.HP_P}>HP%</Select.Option>
                  <Select.Option value={Constants.Stats.ATK_P}>ATK%</Select.Option>
                  <Select.Option value={Constants.Stats.DEF_P}>DEF%</Select.Option>
                  <Select.Option value={Constants.Stats.BE}>Break Effect</Select.Option>
                  <Select.Option value={Constants.Stats.ERR}>Energy Regeneration Rate</Select.Option>
                </Select>
              </Form.Item>
            </Flex>
          </Flex>
        </Flex>

        <Divider />

        <p>
          "asdf"
        </p>
{/* 
        <Divider />

        <Flex justify='space-between' align='center'>

          <Flex vertical gap={1} justify='flex-start'>
            <Text style={{ marginLeft: 5 }}>
              Relic sets
            </Text>
            <Form.Item size="default" name='relicSets'>
              <Select
                dropdownStyle={{
                  width: 250
                }}
                size={"large"}
                listHeight={800}
                mode="multiple"
                allowClear
                style={{
                  width: selectWidth
                }}
                options={generateRelicsOptions()}
                tagRender={relicSetTagRenderer}
                placeholder="Relic Sets"
                maxTagCount='responsive'>
              </Select>
            </Form.Item>
          </Flex>


          <Flex vertical gap={1} justify='flex-start'>
            <Text style={{ marginLeft: 5 }}>
              Planar Ornaments
            </Text>
            <Form.Item size="default" name='ornamentSets'>
              <Select
                dropdownStyle={{
                  width: 250
                }}
                size={"large"}
                listHeight={500}
                mode="multiple"
                allowClear
                style={{
                  width: selectWidth
                }}
                options={generateOrnamentsOptions()}
                tagRender={ornamentSetTagRenderer}
                placeholder="Planar Ornaments"
                maxTagCount='responsive'>
              </Select>
            </Form.Item>
          </Flex>
        </Flex> */}
      </Form>
    </Modal>
  );
};


// footer={[
//   <Button form={scoringAlgorithmForm} key="submit" htmlType="submit">
//       Submit
//   </Button>
// ]}