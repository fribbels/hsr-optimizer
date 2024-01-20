import {
  Button,
  Cascader,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Image,
  InputNumber,
  Select,
  Switch,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import '../style/style.css'
import { Optimizer } from '../lib/optimizer';
import styled from 'styled-components';
import { Constants } from '../lib/constants.ts';
import FormRow from './optimizerTab/FormRow';
import FilterContainer from './optimizerTab/FilterContainer';
import FormCard from './optimizerTab/FormCard';
import OptimizerOptions from './optimizerTab/OptimizerOptions.tsx';
import { CheckOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { HeaderText } from './HeaderText';
import { OptimizerTabController } from '../lib/optimizerTabController';
import { TooltipImage } from './TooltipImage';
import { SaveState } from '../lib/saveState';
import { CharacterConditionals } from "../lib/characterConditionals";
import { LightConeConditionals } from "../lib/lightConeConditionals";
import { FormStatRollSlider, FormStatRollSliderTopPercent } from "./optimizerTab/FormStatRollSlider";
import { v4 as uuidv4 } from "uuid";
import { getDefaultForm } from "../lib/defaultForm";
import { FormSetConditionals } from "./optimizerTab/FormSetConditionals";
import { RelicFilters } from "../lib/relicFilters";
import { Assets } from "../lib/assets";
import PropTypes from "prop-types";
import DB from "../lib/db";
import { Message } from "../lib/message";
import { Utils } from "../lib/utils";
import { Hint } from "../lib/hint";

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
FilterRow.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
}


let panelWidth = 203;
let defaultGap = 5;

export default function OptimizerForm() {
  console.log('======================================================================= RENDER')
  console.log('OptimizerForm')
  const [optimizerForm] = Form.useForm();
  window.optimizerForm = optimizerForm

  const characterEidolon = Form.useWatch('characterEidolon', optimizerForm);
  const lightConeSuperimposition = Form.useWatch('lightConeSuperimposition', optimizerForm);

  let setConditionalSetEffectsDrawerOpen = global.store(s => s.setConditionalSetEffectsDrawerOpen);

  const activeKey = global.store(s => s.activeKey)
  const characters = global.store(s => s.characters) // characters set in this localStorage instance
  const statDisplay = global.store(s => s.statDisplay)
  const setStatDisplay = global.store(s => s.setStatDisplay)
  const allCharacters = DB.getMetadata().characters;


  const [optimizationId, setOptimizationId] = useState();

  const characterOptions = useMemo(() => {
    let characterData = JSON.parse(JSON.stringify(allCharacters));

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

    // We can't apply the form to dynamically generated elements, so we use an effect to set the form value to default
    // Only if there's a missing field
    Object.assign(defaults, lightConeForm)
    if (Object.values(defaults).includes(undefined)) {
      optimizerForm.setFieldValue('lightConeConditionals', lcFn.defaults())
    }
  }, [selectedLightCone])

  window.getVal = () => statDisplay

  const initialCharacter = useMemo(() => {
    let characters = DB.getCharacters(); // retrieve instance localStore saved chars
    if (characters && characters.length > 0) {
      let character = characters[0];
      lightConeSelectorChange(character.form.lightCone)
      setStatDisplay(character.form.statDisplay || 'base')
      return characterOptions.find(x => x.id == character.id)
    }
  }, []);

  const [selectedCharacter, setSelectedCharacter] = useState(() => initialCharacter);
  window.setSelectedCharacter = setSelectedCharacter

  // TODO: refactor if/when view-routing/deep-linking implemented
  // coming from char tab
  const [selectedOptimizerCharacter, setSelectedOptimizerCharacter] = global.store(s => [s.selectedOptimizerCharacter, s.setSelectedOptimizerCharacter]);
  useEffect(() => {
    if (selectedOptimizerCharacter && selectedOptimizerCharacter.id !== selectedCharacter.id) {
      characterSelectorChange(selectedOptimizerCharacter.id);
      setSelectedOptimizerCharacter(null);
    }
  }, [selectedOptimizerCharacter]);

  useEffect(() => {
    if (activeKey == 'optimizer' && !selectedCharacter && characters && characters.length > 0 && characters[0].id) {
      characterSelectorChange(characters[0].id)
    }
  }, [activeKey])

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
    for (let i = 1; i <= 5; i += 2) {
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
        value: i / 100,
        label: `${i}% RES`
      })
    }

    return levelStats
  }, []);

  const enemyHpPercentOptions = useMemo(() => {
    let levelStats = []
    for (let i = 100; i >= 1; i--) {
      levelStats.push({
        value: i / 100,
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

    let optimizationId = uuidv4()
    setOptimizationId(optimizationId)
    x.optimizationId = optimizationId

    Optimizer.optimize(x)
  };

  const onFinishFailed = () => {
    Message.error('Submit failed!');
  };

  const onValuesChange = (changedValues, allValues, bypass) => {
    if (!changedValues || !allValues || !allValues.characterId) return;
    let keys = Object.keys(changedValues)
    if (bypass) {
      // Allow certain values to refresh permutations.
      // Sliders should only update at the end of the drag
    } else if (keys.length == 1 && (
      keys[0].startsWith('min') ||
      keys[0].startsWith('max') ||
      keys[0].startsWith('buff') ||
      keys[0].startsWith('weights') ||
      keys[0].startsWith('statDisplay') ||
      keys[0] == 'characterConditionals' ||
      keys[0] == 'lightConeConditionals')) {
      return;
    }
    let request = allValues

    console.log('Values changed', request, changedValues)

    let relics = Utils.clone(DB.getRelics())
    RelicFilters.calculateWeightScore(request, relics)

    relics = RelicFilters.applyEnhanceFilter(request, relics)
    relics = RelicFilters.applyRankFilter(request, relics)

    let preFilteredRelicsByPart = RelicFilters.splitRelicsByPart(relics);

    relics = RelicFilters.applyMainFilter(request, relics)
    relics = RelicFilters.applySetFilter(request, relics)

    relics = RelicFilters.splitRelicsByPart(relics)
    relics = RelicFilters.applyCurrentFilter(request, relics);
    relics = RelicFilters.applyTopFilter(request, relics, preFilteredRelicsByPart);

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
      LinkRopeTotal: preFilteredRelicsByPart[Constants.Parts.LinkRope].length
    }
    global.store.getState().setPermutationDetails(permutationDetails)
    global.store.getState().setPermutations(relics.Head.length * relics.Hands.length * relics.Body.length * relics.Feet.length * relics.PlanarSphere.length * relics.LinkRope.length)

    console.log('Filtered relics', relics, permutationDetails)
  }
  window.onOptimizerFormValuesChange = onValuesChange;

  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  let parentW = 233;
  let parentH = 350;
  let innerW = 350;
  let innerH = 400;

  const initialValues = useMemo(() => {
    if (selectedCharacter) {
      let matchingCharacter = DB.getCharacterById(selectedCharacter.id)
      if (matchingCharacter) {
        return OptimizerTabController.getDisplayFormValues(matchingCharacter.form)
      }
    }

    return getDefaultForm(initialCharacter)
  }, [initialCharacter]);

  useEffect(() => {
    onValuesChange({}, initialValues)
  }, [initialValues])


  function cancelClicked() {
    console.log('Cancel clicked');
    Optimizer.cancel(optimizationId)
  }
  window.optimizerCancelClicked = cancelClicked

  function resetClicked() {
    console.log('Reset clicked');
    OptimizerTabController.resetFilters()
  }
  window.optimizerResetClicked = resetClicked

  function filterClicked() {
    console.log('Filter clicked');
    OptimizerTabController.applyRowFilters()
  }
  window.optimizerFilterClicked = filterClicked

  function startClicked() {
    console.log('Start clicked');
    optimizerForm.submit()
  }
  window.optimizerStartClicked = startClicked

  function OrnamentSetTagRenderer(props) {
    const { value, closable, onClose } = props;
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
  OrnamentSetTagRenderer.propTypes = {
    value: PropTypes.string,
    closable: PropTypes.bool,
    onClose: PropTypes.func,
  }

  function RelicSetTagRenderer(props) {
    const { value, closable, onClose } = props;
    // The value comes in as:
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
    RelicSetTagRenderer.propTypes = {
      value: PropTypes.string,
      closable: PropTypes.bool,
      onClose: PropTypes.func,
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
        <FormSetConditionals />

        <FilterContainer>
          <FormRow gap={defaultGap} title='Character options'>
            <FormCard style={{ overflow: 'hidden' }}>
              <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px' }}>
                <Image
                  preview={false}
                  width={innerW}
                  src={Assets.getCharacterPreview(selectedCharacter)}
                  style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)` }}
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
                <HeaderText>Light cone</HeaderText>
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
              {CharacterConditionals.getDisplayForCharacter(selectedCharacter?.id, characterEidolon)}
            </FormCard>

            <FormCard justify='space-between'>
              {LightConeConditionals.getDisplayForLightCone(selectedLightCone?.id, lightConeSuperimposition)}

              <Flex vertical gap={5} style={{ marginBottom: 5 }}>
                <Flex justify='space-between' align='center'>
                  <HeaderText style={{}}>Enemy options</HeaderText>
                  <TooltipImage type={Hint.enemyOptions()} />
                </Flex>

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
                  <Form.Item name="enemyWeaknessBroken" valuePropName="checked">
                    <Switch
                      checkedChildren={<CheckOutlined />}
                      unCheckedChildren={<CloseOutlined />}
                      style={{ width: 45, marginRight: 10 }}
                    />
                  </Form.Item>
                  <Text>Weakness broken</Text>
                </Flex>
              </Flex>
            </FormCard>

            <OptimizerOptions defaultGap={defaultGap} panelWidth={panelWidth} />
          </FormRow>

          <FormRow title='Relic & stat filters'>
            <FormCard>
              <Flex vertical gap={defaultGap}>
                <Flex justify='space-between' align='center'>
                  <HeaderText>Main stats</HeaderText>
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
                    tagRender={OrnamentSetTagRenderer}
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
                      tagRender={RelicSetTagRenderer}
                      placement='bottomLeft'
                      maxTagCount='responsive'
                      multiple={true}
                      expandTrigger="hover"
                    />
                  </Form.Item>
                </ConfigProvider>
              </Flex>

              <Button
                onClick={() => setConditionalSetEffectsDrawerOpen(true)}
                icon={<SettingOutlined />}
              >
                Conditional set effects
              </Button>
            </FormCard>

            <FormCard>
              <Flex vertical gap={defaultGap}>
                <Flex justify='space-between' align='center'>
                  <HeaderText>Substat weight filter</HeaderText>
                  <TooltipImage type={Hint.substatWeightFilter()} />
                </Flex>

                <Flex vertical gap={0}>
                  <FormStatRollSlider text='HP' name={Constants.Stats.HP_P} />
                  <FormStatRollSlider text='ATK' name={Constants.Stats.ATK_P} />
                  <FormStatRollSlider text='DEF' name={Constants.Stats.DEF_P} />
                  <FormStatRollSlider text='SPD' name={Constants.Stats.SPD} />
                  <FormStatRollSlider text='CR' name={Constants.Stats.CR} />
                  <FormStatRollSlider text='CD' name={Constants.Stats.CD} />
                  <FormStatRollSlider text='EHR' name={Constants.Stats.EHR} />
                  <FormStatRollSlider text='RES' name={Constants.Stats.RES} />
                  <FormStatRollSlider text='BE' name={Constants.Stats.BE} />
                </Flex>
                <HorizontalDivider />
                <Text>Top % of weighted relics</Text>
                <FormStatRollSliderTopPercent />
              </Flex>
            </FormCard>

            <FormCard>
              <Flex justify='space-between' align='center'>
                <HeaderText>Stat filters</HeaderText>
                <TooltipImage type={Hint.statFilters()} />
              </Flex>
              <Flex vertical gap={5}>
                <FilterRow name='Hp' label='HP' />
                <FilterRow name='Atk' label='ATK' />
                <FilterRow name='Def' label='DEF' />
                <FilterRow name='Spd' label='SPD' />
                <FilterRow name='Cr' label='CR' />
                <FilterRow name='Cd' label='CD' />
                <FilterRow name='Ehr' label='EHR' />
                <FilterRow name='Res' label='RES' />
                <FilterRow name='Be' label='BE' />
              </Flex>
            </FormCard>

            <FormCard>
              <Flex vertical gap={defaultGap}>
                <Flex justify='space-between' align='center'>
                  <HeaderText>Rating filters</HeaderText>
                  <TooltipImage type={Hint.ratingFilters()} />
                </Flex>

                <FilterRow name='Cv' label='CV' />
                <FilterRow name='Weight' label='WEIGHT' />
                <FilterRow name='Ehp' label='EHP' />
                <FilterRow name='Basic' label='BASIC' />
                <FilterRow name='Skill' label='SKILL' />
                <FilterRow name='Ult' label='ULT' />
                <FilterRow name='Fua' label='FUA' />
                <FilterRow name='Dot' label='DOT' />
              </Flex>
            </FormCard>

            <FormCard>
              <Flex vertical gap={defaultGap}>
                <Flex justify='space-between' align='center'>
                  <HeaderText>Combat buffs</HeaderText>
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

                  <Flex justify='space-between'>
                    <Text>
                      SPD
                    </Text>
                    <Form.Item size="default" name='buffSpd'>
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify='space-between'>
                    <Text>
                      SPD %
                    </Text>
                    <Form.Item size="default" name='buffSpdP'>
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify='space-between'>
                    <Text>
                      BE %
                    </Text>
                    <Form.Item size="default" name='buffBe'>
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify='space-between'>
                    <Text>
                      Dmg Boost %
                    </Text>
                    <Form.Item size="default" name='buffDmgBoost'>
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify='space-between'>
                    <Text>
                      Def Shred %
                    </Text>
                    <Form.Item size="default" name='buffDefShred'>
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify='space-between'>
                    <Text>
                      RES Pen %
                    </Text>
                    <Form.Item size="default" name='buffResPen'>
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>
                </Flex>
              </Flex>
            </FormCard>
          </FormRow>
        </FilterContainer>
      </Form>
    </div>
  )
}
