import {
  Button,
  Divider,
  Cascader,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Slider,
  Drawer,
  ConfigProvider,
  Space,
  Switch,
  Row,
  Col,
  Typography,
  message,
  Upload,
  Image,
  Flex,
  Tooltip,
  Popover,
  Tag,
} from 'antd';
import React, { useState, useMemo, useEffect, Fragment } from 'react';
import '../style/style.css'
import { Optimizer } from '../lib/optimizer';
import styled from 'styled-components';
import { Constants } from '../lib/constants';
import VerticalDivider from './VerticalDivider';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { HeaderText } from './HeaderText';
import { OptimizerTabController } from '../lib/optimizerTabController';
import { TooltipImage } from './TooltipImage';
import { SaveState } from '../lib/saveState';
const { TextArea } = Input;
const { Text } = Typography;
const { SHOW_CHILD } = Cascader;

function generateOrnamentsOptions() {
  return Object.values(Constants.SetsOrnaments).map(x => {
    return {
      value: x,
      label: 
        <Flex gap={5} align='center'>
          <img src={Assets.getSetImage(x, Constants.Parts.PlanarSphere)} style={{width: 26, height: 26}}></img>
          <div style={{display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap'}}>
            {x}
          </div>
        </Flex>
    }
  })
}

function generateSetsOptions() {
  let result = [
    {
      value: '4 Piece',
      label: '4 Piece',
      children: []
    },
    {
      value: '2 Piece',
      label: '2 Piece',
      children: []
    }
  ];

  let children = Object.entries(Constants.SetsRelics).map(set => {
    return {
      value: set[1],
      label: set[1]
    }
  })
  let childrenWithAny = Object.entries(Constants.SetsRelics).map(set => {
    return {
      value: set[1],
      label: set[1]
    }
  })
  childrenWithAny.push({
    value: 'Any',
    label: 'Any'
  })

  function generateLabel(value, parens, label) {
    let imageSrc = value == 'Any' ? Assets.getBlank() : Assets.getSetImage(value, Constants.Parts.Head)
    return (
      <Flex gap={5} align='center'>
        <img src={imageSrc} style={{width: 26, height: 26}}></img>
        <div style={{display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap'}}>
          {parens + label}
        </div>
      </Flex> 
    )
  }

  for (let set of Object.entries(Constants.SetsRelics)) {
    result[0].children.push({
      value: set[1],
      label: generateLabel(set[1], '(4) ', set[1])
    })

    result[1].children.push({
      value: set[1],
      label: generateLabel(set[1], '(2) ', set[1]),
      children: childrenWithAny.map(x => {
        let parens = x.value == 'Any' ? '(0) ' : '(2) ';
        let imageSrc = x.value == 'Any' ? Assets.getBlank() : Assets.getSetImage(x.value, Constants.Parts.Head)
        return {
          value: x.value,
          label: generateLabel(x.value, parens, x.label)
        }
      })
    })
  }

  return result;
}

const FormStatTextStyled = styled(Text)`
  width: 40px;
  display: block;
  text-align: center;
`

const InputNumberStyled = styled(InputNumber)`
  width: 62px
`

let panelWidth = 180;
let defaultGap = 5;

export default function OptimizerForm() {
  const [optimizerForm] = Form.useForm();
  window.optimizerForm = optimizerForm

  const characterOptions = useMemo(() => {
    let characterData = JSON.parse(JSON.stringify(DB.getMetadata().characters));

    for (let value of Object.values(characterData)) {
      value.value = value.id;
      value.label = value.displayName;
    }

    return Object.values(characterData).sort((a, b) => a.label.localeCompare(b.label))
  }, []);

  const lightConeOptions = useMemo(() => {
    let lcData = JSON.parse(JSON.stringify(DB.getMetadata().lightCones));

    for (let value of Object.values(lcData)) {
      value.value = value.id;
      value.label = value.name;
    }

    return Object.values(lcData).sort((a, b) => a.label.localeCompare(b.label))
  }, []);

  const initialCharacter = useMemo(() => {
    let characters = DB.getCharacters()
    if (characters && characters.length > 0) {
      let character = characters[0]
      // let character = Utils.randomElement(characters)
      console.log('Initial character', character)
      return characterOptions.find(x => x.id == character.id)
    } else {
      return Utils.randomElement(characterOptions)
    }
  }, []);

  const [selectedCharacter, setSelectedCharacter] = useState(() => initialCharacter);
  window.setSelectedCharacter = setSelectedCharacter

  const [selectedLightCone, setSelectedLightCone] = useState({id: 'None', name: 'Light Cone'});
  useEffect(() => {
  }, [selectedCharacter])
  
  const levelOptions = useMemo(() => {
    let levelStats = []
    for (let i = 80; i >= 1; i--) {
      levelStats.push({
        value: i,
        label: `Lv. ${i}`
      })
    }

    return levelStats
  }, []);

  const superimpositionOptions = useMemo(() => {
    return [
      {value: 1, label: 'S1'},
      {value: 2, label: 'S2'},
      {value: 3, label: 'S3'},
      {value: 4, label: 'S4'},
      {value: 5, label: 'S5'},
    ]
  }, []);

  const eidolonOptions = useMemo(() => {
    return [
      {value: 0, label: 'E0'},
      {value: 1, label: 'E1'},
      {value: 2, label: 'E2'},
      {value: 3, label: 'E3'},
      {value: 4, label: 'E4'},
      {value: 5, label: 'E5'},
      {value: 6, label: 'E6'},
    ]
  }, []);

  function characterSelectorChange(id) {
    setSelectedCharacter(characterOptions.find(x => x.id == id))
    OptimizerTabController.changeCharacter(id)
  }

  function lightConeSelectorChange(id) {
    setSelectedLightCone(lightConeOptions.find(x => x.id == id))
  }

  const onFinish = (x) => {
    OptimizerTabController.fixForm(x);
    if (!OptimizerTabController.validateForm(x)) {
      return
    }
    DB.addFromForm(x)
    SaveState.save()
    console.log('Form finished', x);

    Optimizer.optimize(x)
  };

  const onFinishFailed = (x) => {
    message.error('Submit failed!');
  };

  const onValuesChange = (changedValues, allValues) => {
    if (!changedValues) return;
    let keys = Object.keys(changedValues)
    if (keys.length == 1 && (keys[0].startsWith('min') || keys[0].startsWith('max') || keys[0].startsWith('buff'))) {
      return;
    }
    let request = allValues
    let relics = DB.getRelics()
    console.log('Values changed', request, changedValues)
    console.log('Unfiltered relics', relics)

    let preFilteredRelicsByPart = RelicFilters.splitRelicsByPart(relics);
    
    relics = RelicFilters.applyMainFilter(request, relics)
    relics = RelicFilters.applyEnhanceFilter(request, relics)
    relics = RelicFilters.applyRankFilter(request, relics)
    relics = RelicFilters.applySetFilter(request, relics)

    relics = RelicFilters.splitRelicsByPart(relics)
    relics = RelicFilters.applyCurrentFilter(request, relics);

    let permutationDetails = {
      Head: relics.Head.length,
      Hands: relics.Hands.length,
      Body: relics.Body.length,
      Feet: relics.Feet.length,
      PlanarSphere: relics.PlanarSphere.length,
      LinkRope: relics.LinkRope.length,
      HeadTotal: preFilteredRelicsByPart[Constants.Parts.Head].length,
      HandsTotal: preFilteredRelicsByPart[Constants.Parts.Hands].length,
      BodyTotal: preFilteredRelicsByPart[Constants.Parts.Body].length,
      FeetTotal: preFilteredRelicsByPart[Constants.Parts.Feet].length,
      PlanarSphereTotal: preFilteredRelicsByPart[Constants.Parts.PlanarSphere].length,
      LinkRopeTotal: preFilteredRelicsByPart[Constants.Parts.LinkRope].length,
      permutations: relics.Head.length * relics.Hands.length * relics.Body.length * relics.Feet.length * relics.PlanarSphere.length * relics.LinkRope.length
    }
    setOptimizerPermutationDetails(permutationDetails)
    console.log('Filtered relics', relics, permutationDetails)
  }
  window.onOptimizerFormValuesChange = onValuesChange;

  const filterOption = (input, option) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  let parentH = 285;
  let parentW = 220;
  let innerW = 300;

  const initialValues = useMemo(() => {
    if (selectedCharacter) {
      let matchingCharacter = DB.getCharacterById(selectedCharacter.id)
      if (matchingCharacter) {
        return OptimizerTabController.getDisplayFormValues(matchingCharacter.form)
      }
    }
    
    let defaultForm = {
      "characterId": initialCharacter.id,
      "mainBody": [
      ],
      "mainFeet": [
      ],
      "mainPlanarSphere": [
      ],
      "mainLinkRope": [
      ],
      "relicSets": [
      ],
      "ornamentSets": [
      ],
      "characterLevel": 80,
      "characterEidolon": 0,
      "lightConeLevel": 80,
      "lightConeSuperimposition": 1,
      "predictMaxedMainStat": true,
      "rankFilter": true,
      "keepCurrentRelics": false,
      "enhance": 9,
      "grade": 5,
      "mainHead": [],
      "mainHands": []
    }
    return defaultForm
  }, [initialCharacter]);
  // TODO use memo?

  useEffect(() => {
    onValuesChange({}, initialValues)
  }, [initialValues])
  

  function cancelClicked(x) {
    console.log('Cancel clicked');
    Optimizer.cancel()
  }

  function resetClicked(x) {
    console.log('Reset clicked');
    OptimizerTabController.resetFilters()
  }
  
  function filterClicked(x) {
    console.log('Filter clicked');
    OptimizerTabController.applyRowFilters()
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
        style={{display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 22, alignItems: 'center', overflow: 'hidden'}}
      >
        <Flex>
          <img title={value} src={Assets.getSetImage(value, Constants.Parts.PlanarSphere)} style={{width: 26, height: 26}}></img>
        </Flex>
      </Tag>
    );
  }

  function relicSetTagRenderer(props) {
    const { label, value, closable, onClose } = props;
    // "2 PieceBand of Sizzling Thunder__RC_CASCADER_SPLIT__Guard of Wuthering Snow"
    // 3 -> render both, any render one, 2 -> render first twice
    let pieces = value.split('__RC_CASCADER_SPLIT__')
    let inner
    if (pieces.length == 3) {
      if (pieces[2] == 'Any') {
        inner = 
          <React.Fragment>
            <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{width: 26, height: 26}}></img>
          </React.Fragment>
      } else {
        inner = 
          <React.Fragment>
            <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{width: 26, height: 26}}></img>
            <img title={pieces[2]} src={Assets.getSetImage(pieces[2], Constants.Parts.Head)} style={{width: 26, height: 26}}></img>
          </React.Fragment>
      }
    } else {
      inner = 
        <React.Fragment>
          <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{width: 26, height: 26}}></img>
          <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{width: 26, height: 26}}></img>
        </React.Fragment>
    }

    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 22, alignItems: 'center', overflow: 'hidden'}}
      >
        <Flex>
          {inner}
        </Flex>
      </Tag>
    );
  }
  
  return (
    <div style={{position: 'relative', overflow: 'hidden'}}>
      <Form
        form={optimizerForm}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onValuesChange={onValuesChange}
        initialValues={initialValues}
      >
        <Flex gap={defaultGap}>
          <Flex vertical gap={defaultGap}>
            <div style={{width: `${parentW}px`, height: `${parentH}px`, overflow: 'hidden', borderRadius: '10px'}}>
              <Image
                preview={false}
                width={innerW}
                src={Assets.getCharacterPreview(selectedCharacter)}
                style={{transform: `translate(${(innerW - parentW)/2/innerW * -100}%, ${(innerW - parentH)/2/innerW * -100}%)`}}
              />
            </div>
          </Flex>
          
          <VerticalDivider/>

          <Flex vertical gap={defaultGap} style={{ width: panelWidth }}>
            <Flex justify='space-between' align='center'>
              <HeaderText>Character</HeaderText>
              <TooltipImage type={Hint.character()}/>
            </Flex>
            <Flex gap={defaultGap}>
              <Form.Item size="default" name='characterId'>
                <Select
                  showSearch
                  filterOption={filterOption}
                  style={{ width: panelWidth }}
                  onChange={characterSelectorChange}
                  options={characterOptions}
                />
              </Form.Item>
            </Flex>
            <Flex gap={defaultGap} justify='space-between'>
              <Form.Item size="default" name='characterLevel'>
                <Select
                  showSearch
                  style={{ width: (panelWidth - defaultGap) / 2 }}
                  options={levelOptions}
                />
              </Form.Item>
              <Form.Item size="default" name='characterEidolon'>
                <Select
                  showSearch
                  style={{ width: (panelWidth - defaultGap) / 2 }}
                  options={eidolonOptions}
                />
              </Form.Item>
            </Flex>
          
            <Flex justify='space-between' align='center'>
              <HeaderText>Light Cone</HeaderText>
              <TooltipImage type={Hint.lightCone()}/>
            </Flex>
            <Flex vertical gap={defaultGap}>
              <Flex gap={defaultGap}>
                <Form.Item size="default" name='lightCone'>
                  <Select
                    showSearch
                    filterOption={filterOption}
                    style={{ width: panelWidth }}
                    onChange={lightConeSelectorChange}
                    options={lightConeOptions}
                  />
                </Form.Item>
              </Flex>
              <Flex gap={defaultGap} justify='space-between'>
                <Form.Item size="default" name='lightConeLevel'>
                  <Select
                    showSearch
                    style={{ width: (panelWidth - defaultGap) / 2 }}
                    options={levelOptions}
                  />
                </Form.Item>
                <Form.Item size="default" name='lightConeSuperimposition'>
                  <Select
                    showSearch
                    style={{ width: (panelWidth - defaultGap) / 2 }}
                    options={superimpositionOptions}
                  />
                </Form.Item>
              </Flex>
            </Flex>
          </Flex>

          <VerticalDivider/>

          <Flex vertical gap={16}>
            <Flex vertical gap={defaultGap}>
              <Flex justify='space-between' align='center'>
                <HeaderText>Main Stats</HeaderText>
                <TooltipImage type={Hint.mainStats()}/>
              </Flex>
              <Form.Item size="default" name='mainBody'>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: panelWidth,
                  }}
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
              
              <Form.Item size="default" name='mainFeet'>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: panelWidth,
                  }}
                  placeholder="Feet"
                  maxTagCount='responsive'>
                  <Select.Option value={Constants.Stats.HP_P}>HP%</Select.Option>
                  <Select.Option value={Constants.Stats.ATK_P}>ATK%</Select.Option>
                  <Select.Option value={Constants.Stats.DEF_P}>DEF%</Select.Option>
                  <Select.Option value={Constants.Stats.SPD}>Speed</Select.Option>
                </Select>
              </Form.Item>        
              
              <Form.Item size="default" name='mainPlanarSphere'>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: panelWidth,
                  }}
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
              
              <Form.Item size="default" name='mainLinkRope'>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: panelWidth,
                  }}
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

            <Flex vertical gap={defaultGap}>
              <Flex justify='space-between' align='center'>
                <HeaderText>Sets</HeaderText>
                <TooltipImage type={Hint.sets()}/>
              </Flex>

              <Form.Item size="default" name='ornamentSets'>
                <Select
                  dropdownStyle={{
                    width: 250
                  }}
                  listHeight={500}
                  mode="multiple"
                  allowClear
                  style={{
                    width: panelWidth
                  }}
                  options={generateOrnamentsOptions()}
                  tagRender={ornamentSetTagRenderer}
                  placeholder="Planar Ornaments"
                  maxTagCount='responsive'>
                </Select>
              </Form.Item>
              <ConfigProvider
                theme={{
                  components: {
                    Cascader: {
                      dropdownHeight: 625,
                      controlItemWidth: 100,
                      controlWidth: 100
                    },
                  },
                }}
              >
                <Form.Item size="default" name='relicSets'>
                    <Cascader
                      placeholder="Relics"
                      options={generateSetsOptions()}
                      showCheckedStrategy={SHOW_CHILD}
                      tagRender={relicSetTagRenderer}
                      placement='bottomLeft'
                      maxTagCount='responsive'
                      multiple={true}
                      expandTrigger="hover"
                    />
                </Form.Item>
              </ConfigProvider>
            </Flex>
          </Flex>

          <VerticalDivider/>

          <Flex vertical gap={defaultGap} style={{ width: panelWidth }}>
            <Flex justify='space-between' align='center'>
              <HeaderText>Stat Filters</HeaderText>
              <TooltipImage type={Hint.statFilters()}/>
            </Flex>
            <Space align='center'>
              <Form.Item size="default" name='minAtk'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>
              <FormStatTextStyled>ATK</FormStatTextStyled>
              <Form.Item size="default" name='maxAtk'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>        
            </Space>

            <Space align='center'>
              <Form.Item size="default" name='minHp'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>
              <FormStatTextStyled>HP</FormStatTextStyled>
              <Form.Item size="default" name='maxHp'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>        
            </Space>

            <Space align='center'>
              <Form.Item size="default" name='minDef'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>
              <FormStatTextStyled>DEF</FormStatTextStyled>
              <Form.Item size="default" name='maxDef'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>        
            </Space>
          
            <Space align='center'>
              <Form.Item size="default" name='minSpd'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>
              <FormStatTextStyled>SPD</FormStatTextStyled>
              <Form.Item size="default" name='maxSpd'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>        
            </Space>

            <Space align='center'>
              <Form.Item size="default" name='minCr'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>
              <FormStatTextStyled>CR</FormStatTextStyled>
              <Form.Item size="default" name='maxCr'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>        
            </Space>
          
            <Space align='center'>
              <Form.Item size="default" name='minCd'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>
              <FormStatTextStyled>CD</FormStatTextStyled>
              <Form.Item size="default" name='maxCd'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>        
            </Space>
          
            <Space align='center'>
              <Form.Item size="default" name='minEhr'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>
              <FormStatTextStyled>EHR</FormStatTextStyled>
              <Form.Item size="default" name='maxEhr'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>        
            </Space>
          
            <Space align='center'>
              <Form.Item size="default" name='minRes'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>
              <FormStatTextStyled>RES</FormStatTextStyled>
              <Form.Item size="default" name='maxRes'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>        
            </Space>
          
            <Space align='center'>
              <Form.Item size="default" name='minBe'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>
              <FormStatTextStyled>BE</FormStatTextStyled>
              <Form.Item size="default" name='maxBe'>
                <InputNumberStyled size="small" controls={false}/>
              </Form.Item>        
            </Space>
          </Flex>

          <VerticalDivider/>

          <Flex vertical gap={7} style={{ width: panelWidth }}>
            <Flex vertical gap={defaultGap}>
              <Flex justify='space-between' align='center'>
                <HeaderText>Rating Filters</HeaderText>
                <TooltipImage type={Hint.ratingFilters()}/>
              </Flex>
              
              <Space align='center'>
                <Form.Item size="default" name='minCv'>
                  <InputNumberStyled size="small" controls={false}/>
                </Form.Item>
                <FormStatTextStyled>CV</FormStatTextStyled>
                <Form.Item size="default" name='maxCv'>
                  <InputNumberStyled size="small" controls={false}/>
                </Form.Item>        
              </Space>
              
              <Space align='center'>
                <Form.Item size="default" name='minDmg'>
                  <InputNumberStyled size="small" controls={false}/>
                </Form.Item>
                <FormStatTextStyled>DMG</FormStatTextStyled>
                <Form.Item size="default" name='maxDmg'>
                  <InputNumberStyled size="small" controls={false}/>
                </Form.Item>        
              </Space>

              <Space align='center'>
                <Form.Item size="default" name='minMcd'>
                  <InputNumberStyled size="small" controls={false}/>
                </Form.Item>
                <FormStatTextStyled>MCD</FormStatTextStyled>
                <Form.Item size="default" name='maxMcd'>
                  <InputNumberStyled size="small" controls={false}/>
                </Form.Item>        
              </Space>
              
              <Space align='center'>
                <Form.Item size="default" name='minEhp'>
                  <InputNumberStyled size="small" controls={false}/>
                </Form.Item>
                <FormStatTextStyled>EHP</FormStatTextStyled>
                <Form.Item size="default" name='maxEhp'>
                  <InputNumberStyled size="small" controls={false}/>
                </Form.Item>        
              </Space>
            </Flex>

            <Flex vertical gap={defaultGap}>
              <Flex justify='space-between' align='center'>
                <HeaderText>Combat Buffs</HeaderText>
                <TooltipImage type={Hint.combatBuffs()}/>
              </Flex>

              <Flex vertical gap={defaultGap}>
                <Flex justify='space-between'>
                  <Text>
                    ATK
                  </Text>
                  <Form.Item size="default" name='buffAtk'>
                    <InputNumberStyled size="small" controls={false}/>
                  </Form.Item>
                </Flex>
              
                <Flex justify='space-between'>
                  <Text>
                    ATK %
                  </Text>
                  <Form.Item size="default" name='buffAtkP'>
                    <InputNumberStyled size="small" controls={false}/>
                  </Form.Item>
                </Flex>
              
                <Flex justify='space-between'>
                  <Text>
                    Crit Rate %
                  </Text>
                  <Form.Item size="default" name='buffCr'>
                    <InputNumberStyled size="small" controls={false}/>
                  </Form.Item>
                </Flex>
              
                <Flex justify='space-between'>
                  <Text>
                    Crit Dmg %
                  </Text>
                  <Form.Item size="default" name='buffCd'>
                    <InputNumberStyled size="small" controls={false}/>
                  </Form.Item>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <VerticalDivider/>

          <Flex vertical gap={defaultGap} style={{ width: panelWidth }}> 
            <Flex justify='space-between' align='center'>
              <HeaderText>Optimizer Options</HeaderText>
              <TooltipImage type={Hint.optimizerOptions()}/>
            </Flex>

            <Flex>
              <Form.Item name="rankFilter" valuePropName="checked">
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  defaultChecked
                  style={{width: 45, marginRight: 10}}
                />
              </Form.Item>
              <Text>Rank filter</Text>
            </Flex>

            <Flex>
              <Form.Item name="predictMaxedMainStat" valuePropName="checked">
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  defaultChecked
                  style={{width: 45, marginRight: 10}}
                />
              </Form.Item>
              <Text>Maxed main stat</Text>
            </Flex>

            <Flex>
              <Form.Item name="keepCurrentRelics" valuePropName="checked">
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  defaultChecked
                  style={{width: 45, marginRight: 10}}
                />
              </Form.Item>
              <Text>Keep current relics</Text>
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
            <Flex justify='space-between' align='center'>
              <HeaderText>Actions</HeaderText>
              <TooltipImage type={Hint.actions()}/>
            </Flex>
            <Flex gap={defaultGap} style={{marginBottom: 2}} vertical>
              <Flex gap={defaultGap}>
                <Button type="primary" htmlType="submit" style={{width: '100px'}} >
                  Start
                </Button>
                <Button type="primary" onClick={cancelClicked} style={{width: '100px'}} >
                  Cancel
                </Button>
              </Flex>
              <Flex gap={defaultGap}>

                <Button type="primary" onClick={filterClicked} style={{width: '100px'}} >
                  Filter
                </Button>
                <Button type="primary" onClick={resetClicked} style={{width: '100px'}} >
                  Reset
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Form>
    </div>
  );
};
