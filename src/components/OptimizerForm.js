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
  theme,
  Popover,
  Tag,
  Modal, Card,
} from 'antd';
import React, { useState, useMemo, useEffect, Fragment } from 'react';
import '../style/style.css'
import { Optimizer } from '../lib/optimizer';
import styled from 'styled-components';
import { Constants } from '../lib/constants';
import VerticalDivider from './VerticalDivider';
import FormRow from './optimizerTab/FormRow';
import FilterContainer from './optimizerTab/FilterContainer';
import FormCard from './optimizerTab/FormCard';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { HeaderText } from './HeaderText';
import { OptimizerTabController } from '../lib/optimizerTabController';
import { TooltipImage } from './TooltipImage';
import { SaveState } from '../lib/saveState';
import {CharacterConditionals} from "../lib/characterConditionals";
import {LightConeConditionals} from "../lib/lightConeConditionals";
const { TextArea } = Input;
const { Text } = Typography;
const { SHOW_CHILD } = Cascader;

let HorizontalDivider = styled(Divider)`
  margin: 5px 0px;
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
        <img src={imageSrc} style={{ width: 26, height: 26 }}></img>
        <div style={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap' }}>
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

function FilterRow(props) {
  return (
    <Flex justify='space-between'>
      <Form.Item size="default" name={`min${props.name}`}>
        <InputNumberStyled size="small" controls={false} />
      </Form.Item>
      <FormStatTextStyled>{props.label}</FormStatTextStyled>
      <Form.Item size="default" name={`max${props.name}`}>
        <InputNumberStyled size="small" controls={false} />
      </Form.Item>
    </Flex>
  )
}

let panelWidth = 200;
let defaultGap = 5;

export default function OptimizerForm() {
  const [optimizerForm] = Form.useForm();
  window.optimizerForm = optimizerForm

  const characterEidolon = Form.useWatch('characterEidolon', optimizerForm);
  const lightConeSuperimposition = Form.useWatch('lightConeSuperimposition', optimizerForm);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [optimizerPermutationSearched, setOptimizerPermutationSearched] = useState(0)
  const [optimizerPermutationResults, setOptimizerPermutationResults] = useState(0)
  const [optimizerPermutationDetails, setOptimizerPermutationDetails] = useState({
    Head: 0,
    Hands: 0,
    Body: 0,
    Feet: 0,
    PlanarSphere: 0,
    LinkRope: 0,
    HeadTotal: DB.getRelics().filter(x => x.part == Constants.Parts.Head).length,
    HandsTotal: DB.getRelics().filter(x => x.part == Constants.Parts.Hands).length,
    BodyTotal: DB.getRelics().filter(x => x.part == Constants.Parts.Body).length,
    FeetTotal: DB.getRelics().filter(x => x.part == Constants.Parts.Feet).length,
    PlanarSphereTotal: DB.getRelics().filter(x => x.part == Constants.Parts.PlanarSphere).length,
    LinkRopeTotal: DB.getRelics().filter(x => x.part == Constants.Parts.LinkRope).length,
    permutations: 0,
    searched: 0,
    results: 0
  });
  window.setOptimizerPermutationSearched = setOptimizerPermutationSearched
  window.setOptimizerPermutationResults = setOptimizerPermutationResults
  window.setOptimizerPermutationDetails = setOptimizerPermutationDetails

  const setChampionOfStreetwiseBoxingOptions = useMemo(() => {
    let options = []
    for (let i = 0; i <= 5; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${i * 5}% ATK)`
      })
    }

    return options
  }, []);
  const setWastelanderOfBanditryDesert = useMemo(() => {
    return [
      {
        display: 'Off',
        value: 0,
        label: 'Off'
      },
      {
        display: 'CR',
        value: 1,
        label: 'Debuffed (+10% CR)'
      },
      {
        display: 'CR+CD',
        value: 2,
        label: 'Imprisoned (+10% CR + 20% CD)'
      }
    ]
  }, []);
  const setLongevousDiscipleOptions = useMemo(() => {
    let options = []
    for (let i = 0; i <= 2; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${i * 8}% CR)`
      })
    }

    return options
  }, []);
  const setTheAshblazingGrandDukeOptions = useMemo(() => {
    let options = []
    for (let i = 0; i <= 8; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${6 * i}% ATK)`
      })
    }

    return options
  }, []);
  const setPrisonerInDeepConfinementOptions = useMemo(() => {
    let options = []
    for (let i = 0; i <= 3; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${6 * i}% DEF ignore)`
      })
    }

    return options
  }, []);

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

  const [selectedLightCone, setSelectedLightCone] = useState({ id: 'None', name: 'Light Cone' });
  window.selectedLightCone = selectedLightCone
  window.setSelectedLightCone = (x) => {
    setSelectedLightCone(x)


  }

  useEffect(() => {
    let lcFn = LightConeConditionals.get(optimizerForm.getFieldsValue())
    let form = optimizerForm.getFieldsValue()
    let defaults = lcFn.defaults()
    let lightConeForm = form.lightConeConditionals || {}

    // We can't apply the form to dynamically generated elements so we use an effect to set the form value to default
    // Only if there's a missing field
    Object.assign(defaults, lightConeForm)
    if (Object.values(defaults).includes(undefined)) {
      optimizerForm.setFieldValue('lightConeConditionals', lcFn.defaults())
    }
  }, [selectedLightCone])

  const initialCharacter = useMemo(() => {
    let characters = DB.getCharacters()
    if (characters && characters.length > 0) {
      let character = characters[0]
      // let character = Utils.randomElement(characters)
      console.log('Initial character', character)
      lightConeSelectorChange(character.form.lightCone)

      return characterOptions.find(x => x.id == character.id)
    } else {
      return Utils.randomElement(characterOptions)
    }
  }, []);

  const [selectedCharacter, setSelectedCharacter] = useState(() => initialCharacter);
  window.setSelectedCharacter = setSelectedCharacter
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

  const enemyLevelOptions = useMemo(() => {
    let levelStats = []
    for (let i = 95; i >= 1; i--) {
      levelStats.push({
        value: i,
        label: `Lv. ${i}`
      })
    }

    return levelStats
  }, []);

  const enemyCountOptions = useMemo(() => {
    let levelStats = []
    for (let i = 1; i <= 5; i++) {
      levelStats.push({
        value: i,
        label: `${i} target${i > 1 ? 's' : ''}`
      })
    }

    return levelStats
  }, []);

  const enemyResistanceOptions = useMemo(() => {
    let levelStats = []
    for (let i = 20; i <= 60; i += 20) {
      levelStats.push({
        value: i/100,
        label: `${i}% RES`
      })
    }

    return levelStats
  }, []);

  const enemyHpPercentOptions = useMemo(() => {
    let levelStats = []
    for (let i = 100; i >= 1; i--) {
      levelStats.push({
        value: i/100,
        label: `${i}% HP`
      })
    }

    return levelStats
  }, []);

  const superimpositionOptions = useMemo(() => {
    return [
      { value: 1, label: 'S1' },
      { value: 2, label: 'S2' },
      { value: 3, label: 'S3' },
      { value: 4, label: 'S4' },
      { value: 5, label: 'S5' },
    ]
  }, []);

  const eidolonOptions = useMemo(() => {
    return [
      { value: 0, label: 'E0' },
      { value: 1, label: 'E1' },
      { value: 2, label: 'E2' },
      { value: 3, label: 'E3' },
      { value: 4, label: 'E4' },
      { value: 5, label: 'E5' },
      { value: 6, label: 'E6' },
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
    if (keys.length == 1 && (keys[0].startsWith('min') || keys[0].startsWith('max') || keys[0].startsWith('buff') || keys[0] == 'characterConditionals') || keys[0] == 'lightConeConditionals') {
      return;
    }
    let request = allValues
    let relics = DB.getRelics()
    console.log('Values changed', request, changedValues)
    // console.log('Unfiltered relics', relics)

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
  let parentW = panelWidth;
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
      "enemyLevel": 95,
      "mainHead": [],
      "mainHands": [],
      "setConditionals": {
        "The Ashblazing Grand Duke": [undefined, 2],
        "Prisoner in Deep Confinement": [undefined, true]
      }
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
        style={{ display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 22, alignItems: 'center', overflow: 'hidden' }}
      >
        <Flex>
          <img title={value} src={Assets.getSetImage(value, Constants.Parts.PlanarSphere)} style={{ width: 26, height: 26 }}></img>
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
            <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
          </React.Fragment>
      } else {
        inner =
          <React.Fragment>
            <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
            <img title={pieces[2]} src={Assets.getSetImage(pieces[2], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
          </React.Fragment>
      }
    } else {
      inner =
        <React.Fragment>
          <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
          <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
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
        style={{ display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 22, alignItems: 'center', overflow: 'hidden' }}
      >
        <Flex>
          {inner}
        </Flex>
      </Tag>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <Form
        form={optimizerForm}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onValuesChange={onValuesChange}
        initialValues={initialValues}
      >
        <FilterContainer >
          <FormRow gap={defaultGap}>
            <FormCard>
              <div style={{ width: `${parentW}px`, height: `${parentH}px`, overflow: 'hidden', borderRadius: '10px' }}>
                <Image
                  preview={false}
                  width={innerW}
                  src={Assets.getCharacterPreview(selectedCharacter)}
                  style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerW - parentH) / 2 / innerW * -100}%)` }}
                />
              </div>
            </FormCard>

            <FormCard>
              <Flex justify='space-between' align='center'>
                <HeaderText>Character</HeaderText>
                <TooltipImage type={Hint.character()} />
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
                <TooltipImage type={Hint.lightCone()} />
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
            </FormCard>

            <FormCard>
              <Flex vertical gap={defaultGap}>
                <Flex justify='space-between' align='center'>
                  <HeaderText>Main Stats</HeaderText>
                  <TooltipImage type={Hint.mainStats()} />
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
                  <TooltipImage type={Hint.sets()} />
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
            </FormCard>

            <FormCard>
              <Flex justify='space-between' align='center'>
                <HeaderText>Stat Filters</HeaderText>
                <TooltipImage type={Hint.statFilters()} />
              </Flex>

              <FilterRow name='Atk' label='ATK' />
              <FilterRow name='Hp' label='HP' />
              <FilterRow name='Def' label='DEF' />
              <FilterRow name='Spd' label='SPD' />
              <FilterRow name='Cr' label='CR' />
              <FilterRow name='Cd' label='CD' />
              <FilterRow name='Ehr' label='EHR' />
              <FilterRow name='Res' label='RES' />
              <FilterRow name='Be' label='BE' />
            </FormCard>

            <FormCard>
              <Flex vertical gap={defaultGap}>
                <Flex justify='space-between' align='center'>
                  <HeaderText>Rating Filters</HeaderText>
                  <TooltipImage type={Hint.ratingFilters()} />
                </Flex>

                <FilterRow name='Cv' label='CV' />
                <FilterRow name='Dmg' label='DMG' />
                <FilterRow name='Mcd' label='MCD' />
                <FilterRow name='Ehp' label='EHP' />
              </Flex>

              <Flex vertical gap={defaultGap}>
                <Flex justify='space-between' align='center'>
                  <HeaderText>Combat Buffs</HeaderText>
                  <TooltipImage type={Hint.combatBuffs()} />
                </Flex>

                <Flex vertical gap={defaultGap}>
                  <Flex justify='space-between'>
                    <Text>
                      ATK
                    </Text>
                    <Form.Item size="default" name='buffAtk'>
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify='space-between'>
                    <Text>
                      ATK %
                    </Text>
                    <Form.Item size="default" name='buffAtkP'>
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify='space-between'>
                    <Text>
                      Crit Rate %
                    </Text>
                    <Form.Item size="default" name='buffCr'>
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify='space-between'>
                    <Text>
                      Crit Dmg %
                    </Text>
                    <Form.Item size="default" name='buffCd'>
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>
                </Flex>
              </Flex>
            </FormCard>
          </FormRow>

          <FormRow>
            <FormCard>
              <Flex justify='space-between' align='center'>
                <HeaderText>Optimizer Options</HeaderText>
                <TooltipImage type={Hint.optimizerOptions()} />
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
                <Text>Rank filter</Text>
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
                <TooltipImage type={Hint.actions()} />
              </Flex>

              <Flex gap={defaultGap} style={{ marginBottom: 2 }} vertical>
                <Flex gap={defaultGap}>
                  <Button type="primary" htmlType="submit" style={{ width: '100px' }} >
                    Start
                  </Button>
                  <Button type="primary" onClick={cancelClicked} style={{ width: '100px' }} >
                    Cancel
                  </Button>
                </Flex>
                <Flex gap={defaultGap}>

                  <Button type="primary" onClick={filterClicked} style={{ width: '100px' }} >
                    Filter
                  </Button>
                  <Button type="primary" onClick={resetClicked} style={{ width: '100px' }} >
                    Reset
                  </Button>
                </Flex>
              </Flex>
            </FormCard>

            <FormCard>
              <Flex justify='space-between' align='center'>
                <HeaderText>Permutations</HeaderText>
                <TooltipImage type={Hint.optimizationDetails()} />
              </Flex>

              <PermutationDisplayPanel
                optimizerPermutationDetails={optimizerPermutationDetails}
                searched={optimizerPermutationSearched}
                results={optimizerPermutationResults}
              />

              <HeaderText>
                Build
              </HeaderText>

              <Flex gap={defaultGap} justify='space-around'>
                <Button type="primary" onClick={OptimizerTabController.equipClicked} style={{ width: '100px' }} >
                  Equip
                </Button>
              </Flex>
            </FormCard>

            <FormCard>
              <HeaderText>Conditionals</HeaderText>

              <Button onClick={() => setDrawerOpen(true)}>
                Conditional set effects
              </Button>

              <HeaderText>Enemy</HeaderText>

              <Flex gap={defaultGap} justify='space-between'>
                <Form.Item size="default" name='enemyLevel'>
                  <Select
                    showSearch
                    filterOption={filterOption}
                    style={{ width: (panelWidth - defaultGap) / 2 }}
                    options={enemyLevelOptions}
                  />
                </Form.Item>
                <Form.Item size="default" name='enemyCount'>
                  <Select
                    showSearch
                    filterOption={filterOption}
                    style={{ width: (panelWidth - defaultGap) / 2 }}
                    options={enemyCountOptions}
                  />
                </Form.Item>
              </Flex>

              <Flex gap={defaultGap} justify='space-between'>
                <Form.Item size="default" name='enemyResistance'>
                  <Select
                    showSearch
                    filterOption={filterOption}
                    style={{ width: (panelWidth - defaultGap) / 2 }}
                    options={enemyResistanceOptions}
                  />
                </Form.Item>
                <Form.Item size="default" name='enemyHpPercent'>
                  <Select
                    showSearch
                    filterOption={filterOption}
                    style={{ width: (panelWidth - defaultGap) / 2 }}
                    options={enemyHpPercentOptions}
                  />
                </Form.Item>
              </Flex>

              <Flex align='center'>
                <Form.Item name="enemyElementalWeak" valuePropName="checked">
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    defaultChecked
                    style={{ width: 45, marginRight: 10 }}
                  />
                </Form.Item>
                <Text>Elemental weakness</Text>
              </Flex>

              <Flex align='center'>
                <Form.Item name="enemyQuantumWeak" valuePropName="checked">
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    defaultChecked
                    style={{ width: 45, marginRight: 10 }}
                  />
                </Form.Item>
                <Text>Quantum weakness</Text>
              </Flex>

              <Flex align='center'>
                <Form.Item name="enemyWeaknessBroken" valuePropName="checked">
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    style={{ width: 45, marginRight: 10 }}
                  />
                </Form.Item>
                <Text>Weakness broken</Text>
              </Flex>

              <ConfigProvider
                theme={{
                  token: {
                    opacityLoading: 0.15
                  }
                }}
              >
                <Drawer
                  title="Conditional set effects"
                  placement="right"
                  onClose={() => setDrawerOpen(false)}
                  open={drawerOpen}
                  width={750}
                  forceRender
                >
                  <Flex justify='center'>
                    <Flex vertical gap={defaultGap}>
                      <Flex gap={defaultGap} align='center' justify='flex-start'>
                        <Text style={{ width: setConditionalsIconWidth }}></Text>
                        <Text style={{ width: setConditionalsNameWidth }}></Text>
                        <Text style={{ marginLeft: 'auto' }}>4 Piece</Text>
                      </Flex>
                      <ConditionalSetOption set={Constants.Sets.PasserbyOfWanderingCloud} p4Checked />
                      <ConditionalSetOption set={Constants.Sets.MusketeerOfWildWheat} p4Checked />
                      <ConditionalSetOption set={Constants.Sets.KnightOfPurityPalace} p4Checked />
                      <ConditionalSetOption set={Constants.Sets.HunterOfGlacialForest} />
                      <ConditionalSetOption set={Constants.Sets.ChampionOfStreetwiseBoxing} selectOptions={setChampionOfStreetwiseBoxingOptions} />
                      <ConditionalSetOption set={Constants.Sets.GuardOfWutheringSnow} p4Checked />
                      <ConditionalSetOption set={Constants.Sets.FiresmithOfLavaForging} />
                      <ConditionalSetOption set={Constants.Sets.GeniusOfBrilliantStars} />
                      <ConditionalSetOption set={Constants.Sets.BandOfSizzlingThunder} />
                      <ConditionalSetOption set={Constants.Sets.EagleOfTwilightLine} p4Checked />
                      <ConditionalSetOption set={Constants.Sets.ThiefOfShootingMeteor} p4Checked />
                      <ConditionalSetOption set={Constants.Sets.WastelanderOfBanditryDesert} selectOptions={setWastelanderOfBanditryDesert} />
                      <ConditionalSetOption set={Constants.Sets.LongevousDisciple} selectOptions={setLongevousDiscipleOptions} />
                      <ConditionalSetOption set={Constants.Sets.MessengerTraversingHackerspace} />
                      <ConditionalSetOption set={Constants.Sets.TheAshblazingGrandDuke} selectOptions={setTheAshblazingGrandDukeOptions} />
                      <ConditionalSetOption set={Constants.Sets.PrisonerInDeepConfinement} selectOptions={setPrisonerInDeepConfinementOptions}/>
                    </Flex>

                    <VerticalDivider />

                    <Flex vertical gap={defaultGap} style={{ marginLeft: 5 }}>
                      <Flex gap={defaultGap} align='center' justify='flex-start'>
                        <Text style={{ width: setConditionalsIconWidth }}></Text>
                        <Text style={{ width: setConditionalsNameWidth }}></Text>
                        <Text style={{ marginLeft: 'auto' }}>2 Piece</Text>
                      </Flex>
                      <ConditionalSetOption set={Constants.Sets.SpaceSealingStation} p2Checked />
                      <ConditionalSetOption set={Constants.Sets.FleetOfTheAgeless} p2Checked />
                      <ConditionalSetOption set={Constants.Sets.PanCosmicCommercialEnterprise} p2Checked />
                      <ConditionalSetOption set={Constants.Sets.BelobogOfTheArchitects} p2Checked />
                      <ConditionalSetOption set={Constants.Sets.CelestialDifferentiator} />
                      <ConditionalSetOption set={Constants.Sets.InertSalsotto} p2Checked />
                      <ConditionalSetOption set={Constants.Sets.TaliaKingdomOfBanditry} p2Checked />
                      <ConditionalSetOption set={Constants.Sets.SprightlyVonwacq} p2Checked />
                      <ConditionalSetOption set={Constants.Sets.RutilantArena} p2Checked />
                      <ConditionalSetOption set={Constants.Sets.BrokenKeel} p2Checked />
                      <ConditionalSetOption set={Constants.Sets.FirmamentFrontlineGlamoth} p2Checked />
                      <ConditionalSetOption set={Constants.Sets.PenaconyLandOfTheDreams} p2Checked />
                    </Flex>
                  </Flex>
                </Drawer>
              </ConfigProvider>
            </FormCard>

            <FormCard>
              {CharacterConditionals.getDisplayForCharacter(selectedCharacter.id, characterEidolon)}
            </FormCard>

            <FormCard>
              {LightConeConditionals.getDisplayForLightCone(selectedLightCone.id, lightConeSuperimposition)}
            </FormCard>
          </FormRow>
        </FilterContainer>
      </Form>
    </div>
  );
};
let shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'
// let shadow = 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px'
// let shadow = 'rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px, rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px, rgba(0, 0, 0, 0.07) 0px 16px 16px'
// let shadow = 'rgba(0, 0, 0, 0.2) 0px 12px 28px 0px, rgba(0, 0, 0, 0.1) 0px 2px 4px 0px, rgba(255, 255, 255, 0.05) 0px 0px 0px 1px inset'
// let shadow = 'rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px'
// function FormRow(props) {
//   return (
//     <div style={{backgroundColor: '#293a4f', padding: 20, boxShadow: shadow}}>
//       <Flex gap={20}>
//         {props.children}
//       </Flex>
//     </div>
//   )
// }

const setConditionalsIconWidth = 40
const setConditionalsNameWidth = 200
const setConditionalsWidth = 80

function ConditionalSetOption(props) {
  if (Constants.SetsRelicsNames.includes(props.set)) {
    let inputType = (<Switch disabled={props.p4Checked} />)
    if (props.selectOptions) {
      inputType = (
        <Select
          optionLabelProp="display"
          listHeight={500}
          size='small'
          style={{ width: setConditionalsWidth }}
          dropdownStyle={{ width: 250 }}
          options={props.selectOptions}
        />
      )
    }

    return (
      <Flex gap={defaultGap} align='center' justify='flex-start'>
        <Flex style={{ width: setConditionalsIconWidth }}>
          <img src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)} style={{ width: 36, height: 36 }}></img>
        </Flex>
        <Text style={{ width: setConditionalsNameWidth, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{props.set}</Text>
        <Flex style={{ width: setConditionalsWidth }} justify='flex-end'>
          <Form.Item name={['setConditionals', props.set, 1]} valuePropName={props.selectOptions ? 'value' : 'checked'}>
            {inputType}
          </Form.Item>
        </Flex>
      </Flex>
    )
  } else {
    return (
      <Flex gap={defaultGap} align='center' justify='flex-start'>
        <Flex style={{ width: setConditionalsIconWidth }}>
          <img src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)} style={{ width: 36, height: 36 }}></img>
        </Flex>
        <Text style={{ width: setConditionalsNameWidth, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{props.set}</Text>
        <Flex style={{ width: setConditionalsWidth }} justify='flex-end'>
          <Form.Item name={['setConditionals', props.set, 1]} valuePropName='checked'>
            <Switch disabled={props.p2Checked} />
          </Form.Item>
        </Flex>
      </Flex>
    )
  }
}

function PermutationDisplayPanel(props) {
  return (
    <Flex vertical>
      <PermutationDisplay left='Head' right={props.optimizerPermutationDetails.Head} total={props.optimizerPermutationDetails.HeadTotal} />
      <PermutationDisplay left='Hands' right={props.optimizerPermutationDetails.Hands} total={props.optimizerPermutationDetails.HandsTotal} />
      <PermutationDisplay left='Body' right={props.optimizerPermutationDetails.Body} total={props.optimizerPermutationDetails.BodyTotal} />
      <PermutationDisplay left='Feet' right={props.optimizerPermutationDetails.Feet} total={props.optimizerPermutationDetails.FeetTotal} />
      <PermutationDisplay left='Link Rope' right={props.optimizerPermutationDetails.LinkRope} total={props.optimizerPermutationDetails.LinkRopeTotal} />
      <PermutationDisplay left='Planar Sphere' right={props.optimizerPermutationDetails.PlanarSphere} total={props.optimizerPermutationDetails.PlanarSphereTotal} />
      <div style={{ height: 10 }}></div>
      <PermutationDisplay left='Perms' right={props.optimizerPermutationDetails.permutations} />
      <PermutationDisplay left='Searched' right={props.searched} />
      <PermutationDisplay left='Results' right={props.results} />
    </Flex>
  )
}


function PermutationDisplay(props) {
  let rightText = props.total
    ? `${Number(props.right).toLocaleString()} / ${Number(props.total).toLocaleString()}`
    : `${Number(props.right).toLocaleString()}`

  return (
    <Flex justify='space-between'>
      <Text style={{ lineHeight: '24px' }}>
        {props.left}
      </Text>
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
      <Text style={{ lineHeight: '24px' }}>
        {rightText}
      </Text>
    </Flex>
  )
}
