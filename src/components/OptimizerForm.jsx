import { Button, Cascader, Divider, Flex, Form, Image, Select, Switch, Tag, Typography } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Optimizer } from 'lib/optimizer/optimizer'
import styled from 'styled-components'
import {
  Constants,
  eidolonOptions,
  enemyCountOptions,
  enemyHpPercentOptions,
  enemyLevelOptions,
  enemyResistanceOptions,
  levelOptions,
  RelicSetFilterOptions,
  superimpositionOptions,
} from 'lib/constants.ts'
import { FormRow, OptimizerMenuIds, TeammateFormRow } from './optimizerTab/FormRow'
import FilterContainer from './optimizerTab/FilterContainer'
import FormCard from 'components/optimizerTab/FormCard'
import OptimizerOptions from './optimizerTab/OptimizerOptions.tsx'
import { CheckOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons'
import { HeaderText } from './HeaderText'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { TooltipImage } from './TooltipImage'
import { SaveState } from 'lib/saveState'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { FormStatRollSlider, FormStatRollSliderTopPercent } from './optimizerTab/FormStatRollSlider'
import { v4 as uuidv4 } from 'uuid'
import { getDefaultForm } from 'lib/defaultForm'
import { FormSetConditionals } from 'components/optimizerTab/FormSetConditionals'
import { Assets } from 'lib/assets'
import PropTypes from 'prop-types'
import DB from 'lib/db'
import { Hint } from 'lib/hint'
import { Utils } from 'lib/utils.js'

import InputNumberStyled from './optimizerForm/InputNumberStyled.tsx'
import FilterRow from './optimizerForm/FilterRow.tsx'
import GenerateOrnamentsOptions from './optimizerForm/OrnamentsOptions.tsx'
import GenerateSetsOptions from './optimizerForm/SetsOptions.tsx'
import RecommendedPresetsButton from './optimizerForm/RecommendedPresetsButton'
import { CharacterConditionalDisplay } from './optimizerForm/conditionals/CharacterConditionalDisplay'
import { LightConeConditionalDisplay } from './optimizerForm/conditionals/LightConeConditionalDisplay'
import TeammateCard from 'components/optimizerTab/TeammateCard'

const { Text } = Typography
const { SHOW_CHILD } = Cascader

let HorizontalDivider = styled(Divider)`
  margin: 5px 0px;
`

let panelWidth = 203
let defaultGap = 5

export default function OptimizerForm() {
  console.log('======================================================================= RENDER OptimizerForm')
  const [optimizerForm] = Form.useForm()
  window.optimizerForm = window.optimizerForm = optimizerForm

  // hooks
  const characterEidolon = Form.useWatch('characterEidolon', optimizerForm)
  const lightCone = Form.useWatch('lightCone', optimizerForm)
  const lightConeSuperimposition = Form.useWatch('lightConeSuperimposition', optimizerForm)
  const setConditionalSetEffectsDrawerOpen = window.store((s) => s.setConditionalSetEffectsDrawerOpen)
  const [selectedLightCone, setSelectedLightCone] = useState({ id: 'None', name: 'Light Cone' })
  const characterOptions = useMemo(() => Utils.generateCharacterOptions(), [])
  const lightConeOptions = useMemo(() => Utils.generateLightConeOptions(), [])
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)
  const setOptimizerTabFocusCharacter = window.store((s) => s.setOptimizerTabFocusCharacter)
  const setOptimizationInProgress = window.store((s) => s.setOptimizationInProgress)

  useEffect(() => {
    OptimizerTabController.changeCharacter(optimizerTabFocusCharacter, setSelectedLightCone)
  }, [optimizerTabFocusCharacter])

  const characterSelectorChange = useCallback((id) => {
    setOptimizerTabFocusCharacter(id)
  }, [setOptimizerTabFocusCharacter])

  const lightConeSelectorChange = useCallback((id) => {
    setSelectedLightCone(lightConeOptions.find((x) => x.id == id))
    OptimizerTabController.changeCharacter(optimizerTabFocusCharacter, setSelectedLightCone, id)
  }, [lightConeOptions, optimizerTabFocusCharacter])

  useEffect(() => {
    let lcFn = LightConeConditionals.get(optimizerForm.getFieldsValue())
    let form = optimizerForm.getFieldsValue()
    let defaults = lcFn.defaults()
    let lightConeForm = form.lightConeConditionals || {}

    // We can't apply the form to dynamically generated elements, so we use an effect to set the form value to default
    // Only if there's a missing field (TODO: Possibly out of date - verify if this is still true)
    Object.assign(defaults, lightConeForm)
    console.log('useMemo lcFn.defaults()', defaults, lcFn.defaults(), lightConeForm)
    console.log(lcFn.defaults.valueOf())

    if (lightCone === '21034') { // Today Is Another Peaceful Day
      defaults.maxEnergyStacks = Math.min(160, DB.getMetadata().characters[optimizerTabFocusCharacter].max_sp)
    }

    optimizerForm.setFieldValue('lightConeConditionals', defaults)
  }, [optimizerTabFocusCharacter, lightCone, lightConeSuperimposition])

  const initialCharacter = useMemo(() => {
    console.log('@initialCharacter')
    let characters = DB.getCharacters() // retrieve instance localStore saved chars

    if (optimizerTabFocusCharacter) {
      return characters.find((x) => x.id == optimizerTabFocusCharacter)
    }

    if (characters && characters.length > 0) {
      let character = characters[0]
      lightConeSelectorChange(character.form.lightCone)
      setOptimizerTabFocusCharacter(character.id)
      return characterOptions.find((x) => x.id == character.id)
    }
  }, [optimizerTabFocusCharacter, lightConeSelectorChange, setOptimizerTabFocusCharacter, characterOptions])

  const initialValues = useMemo(() => {
    if (optimizerTabFocusCharacter) {
      const matchingCharacter = DB.getCharacterById(optimizerTabFocusCharacter)

      if (matchingCharacter) {
        if (matchingCharacter?.form?.lightCone) {
          setSelectedLightCone(lightConeOptions.find((x) => x.id == matchingCharacter.form.lightCone))
        } else {
          console.warn(`@OptimizerForm.initialValues: No character form found for ${optimizerTabFocusCharacter}`, matchingCharacter)
        }
        return OptimizerTabController.getDisplayFormValues(matchingCharacter.form)
      } else {
        // TODO: render-cycle flows through this before DB.getCharacterById() returns the character
        // console.warn(`@OptimizerForm.initialValues: No character found for ${optimizerTabFocusCharacter}`);
      }
    }

    return getDefaultForm(initialCharacter)
    // We only want to update this once for the initial character
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCharacter])

  useEffect(() => {
    onValuesChange({}, initialValues)
  }, [initialValues])

  const onValuesChange = (changedValues, allValues, bypass) => {
    if (!changedValues || !allValues || !allValues.characterId) return
    let keys = Object.keys(changedValues)
    if (bypass) {
      // Allow certain values to refresh permutations.
      // Sliders should only update at the end of the drag
    } else if (keys.length == 1 && (
      keys[0].startsWith('min')
      || keys[0].startsWith('max')
      || keys[0].startsWith('buff')
      || keys[0].startsWith('weights')
      || keys[0].startsWith('statDisplay')
      || keys[0].startsWith('teammate')
      || keys[0] == 'characterConditionals'
      || keys[0] == 'lightConeConditionals')) {
      return
    }
    const request = allValues

    console.log('@onValuesChange', request, changedValues)

    // Add any new characters to the list
    if (!DB.getCharacterById(allValues.characterId)) {
      DB.addFromForm(allValues)
    }

    // If the rank changes, re-order the characters priority list
    if (changedValues.rank != null && DB.getCharacterById(allValues.characterId).rank != allValues.rank) {
      DB.insertCharacter(allValues.characterId, allValues.rank)
      DB.refreshCharacters()
    }

    const [relics, preFilteredRelicsByPart] = Optimizer.getFilteredRelics(request, allValues.characterId)

    const permutationDetails = {
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
    }
    window.store.getState().setPermutationDetails(permutationDetails)
    window.store.getState().setPermutations(relics.Head.length * relics.Hands.length * relics.Body.length * relics.Feet.length * relics.PlanarSphere.length * relics.LinkRope.length)
  }
  window.onOptimizerFormValuesChange = onValuesChange

  let parentW = 233
  let parentH = 350
  let innerW = 350
  let innerH = 400

  function cancelClicked() {
    console.log('Cancel clicked')
    setOptimizationInProgress(false)
    Optimizer.cancel(window.store.getState().optimizationId)
  }
  window.optimizerCancelClicked = cancelClicked

  function resetClicked() {
    console.log('Reset clicked')
    OptimizerTabController.resetFilters()
  }
  window.optimizerResetClicked = resetClicked

  function filterClicked() {
    console.log('Filter clicked')
    OptimizerTabController.applyRowFilters()
  }
  window.optimizerFilterClicked = filterClicked

  function startClicked() {
    console.log('Start clicked')

    /*
     * We dont actually want to submit the form as it would kick off a re-render
     * Intercept the event and just call the optimizer directly
     */
    const form = optimizerForm.getFieldsValue()

    OptimizerTabController.fixForm(form)
    if (!OptimizerTabController.validateForm(form)) {
      return
    }

    document.getElementById('optimizerGridContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' })

    DB.addFromForm(form)
    SaveState.save()

    let optimizationId = uuidv4()
    window.store.getState().setOptimizationId(optimizationId)
    form.optimizationId = optimizationId
    form.statDisplay = window.store.getState().statDisplay

    console.log('Form finished', form)

    setOptimizationInProgress(true)
    Optimizer.optimize(form)
  }
  window.optimizerStartClicked = startClicked

  function OrnamentSetTagRenderer(props) {
    const { value, closable, onClose } = props
    const onPreventMouseDown = (event) => {
      event.preventDefault()
      event.stopPropagation()
    }
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
    )
  }
  OrnamentSetTagRenderer.propTypes = {
    value: PropTypes.string,
    closable: PropTypes.bool,
    onClose: PropTypes.func,
  }
  function RelicSetTagRenderer(props) {
    const { value, closable, onClose } = props
    /*
     * The value comes in as:
     * "2 PieceBand of Sizzling Thunder__RC_CASCADER_SPLIT__Guard of Wuthering Snow"
     */
    /*
     *['4 Piece', 'Passerby of Wandering Cloud']
     *['2 + 2 Piece', 'Knight of Purity Palace', 'Hunter of Glacial Forest']
     *['2 + Any', 'Knight of Purity Palace']
     */

    let pieces = value.split('__RC_CASCADER_SPLIT__')
    let inner

    if (pieces[0] == RelicSetFilterOptions.relic4Piece) {
      inner
        = (
          <React.Fragment>
            <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
            <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
          </React.Fragment>
        )
    }

    if (pieces[0] == RelicSetFilterOptions.relic2Plus2Piece) {
      inner
        = (
          <React.Fragment>
            <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
            <img title={pieces[2]} src={Assets.getSetImage(pieces[2], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
          </React.Fragment>
        )
    }

    if (pieces[0] == RelicSetFilterOptions.relic2PlusAny) {
      inner
        = (
          <React.Fragment>
            <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
          </React.Fragment>
        )
    }

    RelicSetTagRenderer.propTypes = {
      value: PropTypes.string,
      closable: PropTypes.bool,
      onClose: PropTypes.func,
    }

    const onPreventMouseDown = (event) => {
      event.preventDefault()
      event.stopPropagation()
    }
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
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <Form
        form={optimizerForm}
        layout="vertical"
        onValuesChange={onValuesChange}
        initialValues={initialValues}
      >
        <FormSetConditionals />

        <FilterContainer>
          <FormRow id={OptimizerMenuIds.characterOptions}>
            {/* Character Portrait */}
            <FormCard style={{ overflow: 'hidden' }}>
              <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px' }}>
                <Image
                  preview={false}
                  width={innerW}
                  src={Assets.getCharacterPreviewById(optimizerTabFocusCharacter)}
                  style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)` }}
                />
              </div>
            </FormCard>

            {/* Character Levels/Eids + Light Cone Superimps */}
            <FormCard>
              <Flex justify="space-between" align="center">
                <HeaderText>Character</HeaderText>
                <TooltipImage type={Hint.character()} />
              </Flex>
              <Flex gap={defaultGap}>
                <Form.Item size="default" name="characterId">
                  <Select
                    showSearch
                    filterOption={Utils.labelFilterOption}
                    style={{ width: panelWidth }}
                    onChange={characterSelectorChange}
                    options={characterOptions}
                    optionLabelProp="label"
                    placeholder="Character"
                  />
                </Form.Item>
              </Flex>
              <Flex gap={defaultGap} justify="space-between">
                <Form.Item size="default" name="characterLevel">
                  <Select
                    showSearch
                    style={{ width: (panelWidth - defaultGap) / 2 }}
                    options={levelOptions}
                    placeholder="Level"
                  />
                </Form.Item>
                <Form.Item size="default" name="characterEidolon">
                  <Select
                    showSearch
                    style={{ width: (panelWidth - defaultGap) / 2 }}
                    options={eidolonOptions}
                    placeholder="Eidolon"
                  />
                </Form.Item>
              </Flex>

              <Flex justify="space-between" align="center">
                <HeaderText>Light cone</HeaderText>
                <TooltipImage type={Hint.lightCone()} />
              </Flex>
              <Flex vertical gap={defaultGap}>
                <Flex gap={defaultGap}>
                  <Form.Item size="default" name="lightCone">
                    <Select
                      showSearch
                      filterOption={Utils.labelFilterOption}
                      style={{ width: panelWidth }}
                      onChange={lightConeSelectorChange}
                      options={lightConeOptions}
                      placeholder="Light Cone"
                    />
                  </Form.Item>
                </Flex>
                <Flex gap={defaultGap} justify="space-between">
                  <Form.Item size="default" name="lightConeLevel">
                    <Select
                      showSearch
                      style={{ width: (panelWidth - defaultGap) / 2 }}
                      options={levelOptions}
                      placeholder="Level"
                    />
                  </Form.Item>
                  <Form.Item size="default" name="lightConeSuperimposition">
                    <Select
                      showSearch
                      style={{ width: (panelWidth - defaultGap) / 2 }}
                      options={superimpositionOptions}
                      placeholder="Superimposition"
                    />
                  </Form.Item>
                </Flex>
              </Flex>

              <Flex justify="space-between" align="center">
                <HeaderText>Presets</HeaderText>
              </Flex>

              <RecommendedPresetsButton />
            </FormCard>

            <FormCard>
              <CharacterConditionalDisplay
                id={optimizerTabFocusCharacter}
                eidolon={characterEidolon}
              />
            </FormCard>
            {/* Light Cone Card */}
            <FormCard justify="space-between">
              <LightConeConditionalDisplay
                id={selectedLightCone?.id}
                superImposition={lightConeSuperimposition}
              />

              <Flex vertical gap={5} style={{ marginBottom: 5 }}>
                <Flex justify="space-between" align="center">
                  <HeaderText style={{}}>Enemy options</HeaderText>
                  <TooltipImage type={Hint.enemyOptions()} />
                </Flex>

                <Flex gap={defaultGap} justify="space-between">
                  <Form.Item size="default" name="enemyLevel">
                    <Select
                      showSearch
                      filterOption={Utils.labelFilterOption}
                      style={{ width: (panelWidth - defaultGap) / 2 }}
                      options={enemyLevelOptions}
                    />
                  </Form.Item>
                  <Form.Item size="default" name="enemyCount">
                    <Select
                      showSearch
                      filterOption={Utils.labelFilterOption}
                      style={{ width: (panelWidth - defaultGap) / 2 }}
                      options={enemyCountOptions}
                    />
                  </Form.Item>
                </Flex>

                <Flex gap={defaultGap} justify="space-between">
                  <Form.Item size="default" name="enemyResistance">
                    <Select
                      showSearch
                      filterOption={Utils.labelFilterOption}
                      style={{ width: (panelWidth - defaultGap) / 2 }}
                      options={enemyResistanceOptions}
                    />
                  </Form.Item>
                  <Form.Item size="default" name="enemyHpPercent">
                    <Select
                      showSearch
                      filterOption={Utils.labelFilterOption}
                      style={{ width: (panelWidth - defaultGap) / 2 }}
                      options={enemyHpPercentOptions}
                    />
                  </Form.Item>
                </Flex>

                <Flex align="center">
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

                <Flex align="center">
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

          <FormRow id={OptimizerMenuIds.relicAndStatFilters}>
            <FormCard>
              <Flex vertical gap={defaultGap}>
                <Flex justify="space-between" align="center">
                  <HeaderText>Main stats</HeaderText>
                  <TooltipImage type={Hint.mainStats()} />
                </Flex>
                <Form.Item size="default" name="mainBody">
                  <Select
                    mode="multiple"
                    allowClear
                    style={{
                      width: panelWidth,
                    }}
                    placeholder="Body"
                    optionLabelProp="label"
                    maxTagCount="responsive"
                    suffixIcon={<img style={{ width: 16 }} src="https://d28ecrnsw8u0fj.cloudfront.net/assets/misc/partBody.png" />}
                  >
                    <Select.Option value={Constants.Stats.HP_P} label="HP%">HP%</Select.Option>
                    <Select.Option value={Constants.Stats.ATK_P} label="ATK%">ATK%</Select.Option>
                    <Select.Option value={Constants.Stats.DEF_P} label="DEF%">DEF%</Select.Option>
                    <Select.Option value={Constants.Stats.CR} label="CR">CRIT Rate</Select.Option>
                    <Select.Option value={Constants.Stats.CD} label="CD">CRIT DMG</Select.Option>
                    <Select.Option value={Constants.Stats.OHB} label="HEAL">Outgoing Healing</Select.Option>
                    <Select.Option value={Constants.Stats.EHR} label="EHR">Effect HIT Rate</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item size="default" name="mainFeet">
                  <Select
                    mode="multiple"
                    allowClear
                    style={{
                      width: panelWidth,
                    }}
                    placeholder="Feet"
                    optionLabelProp="label"
                    maxTagCount="responsive"
                    suffixIcon={<img style={{ width: 16 }} src="https://d28ecrnsw8u0fj.cloudfront.net/assets/misc/partFeet.png" />}
                  >
                    <Select.Option value={Constants.Stats.HP_P} label="HP%">HP%</Select.Option>
                    <Select.Option value={Constants.Stats.ATK_P} label="ATK%">ATK%</Select.Option>
                    <Select.Option value={Constants.Stats.DEF_P} label="DEF%">DEF%</Select.Option>
                    <Select.Option value={Constants.Stats.SPD} label="SPD">Speed</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item size="default" name="mainPlanarSphere">
                  <Select
                    mode="multiple"
                    allowClear
                    style={{
                      width: panelWidth,
                    }}
                    placeholder="Planar Sphere"
                    optionLabelProp="label"
                    listHeight={400}
                    maxTagCount="responsive"
                    suffixIcon={<img style={{ width: 16 }} src="https://d28ecrnsw8u0fj.cloudfront.net/assets/misc/partPlanarSphere.png" />}
                  >
                    <Select.Option value={Constants.Stats.HP_P} label="HP%">HP%</Select.Option>
                    <Select.Option value={Constants.Stats.ATK_P} label="ATK%">ATK%</Select.Option>
                    <Select.Option value={Constants.Stats.DEF_P} label="DEF%">DEF%</Select.Option>
                    <Select.Option value={Constants.Stats.Physical_DMG} label="Physical">Physical DMG</Select.Option>
                    <Select.Option value={Constants.Stats.Fire_DMG} label="Fire">Fire DMG</Select.Option>
                    <Select.Option value={Constants.Stats.Ice_DMG} label="Ice">Ice DMG</Select.Option>
                    <Select.Option value={Constants.Stats.Lightning_DMG} label="Lightning">Lightning DMG</Select.Option>
                    <Select.Option value={Constants.Stats.Wind_DMG} label="Wind">Wind DMG</Select.Option>
                    <Select.Option value={Constants.Stats.Quantum_DMG} label="Quantum">Quantum DMG</Select.Option>
                    <Select.Option value={Constants.Stats.Imaginary_DMG} label="Imaginary">Imaginary DMG</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item size="default" name="mainLinkRope">
                  <Select
                    mode="multiple"
                    allowClear
                    style={{
                      width: panelWidth,
                    }}
                    placeholder="Link Rope"
                    optionLabelProp="label"
                    maxTagCount="responsive"
                    suffixIcon={<img style={{ width: 16 }} src="https://d28ecrnsw8u0fj.cloudfront.net/assets/misc/partLinkRope.png" />}
                  >
                    <Select.Option value={Constants.Stats.HP_P} label="HP%">HP%</Select.Option>
                    <Select.Option value={Constants.Stats.ATK_P} label="ATK%">ATK%</Select.Option>
                    <Select.Option value={Constants.Stats.DEF_P} label="DEF%">DEF%</Select.Option>
                    <Select.Option value={Constants.Stats.BE} label="BE">Break Effect</Select.Option>
                    <Select.Option value={Constants.Stats.ERR} label="Energy">Energy Regeneration Rate</Select.Option>
                  </Select>
                </Form.Item>
              </Flex>

              <Flex vertical gap={defaultGap}>
                <Flex justify="space-between" align="center">
                  <HeaderText>Sets</HeaderText>
                  <TooltipImage type={Hint.sets()} />
                </Flex>
                <Form.Item size="default" name="relicSets">
                  <Cascader
                    placeholder="Relics"
                    options={GenerateSetsOptions()}
                    showCheckedStrategy={SHOW_CHILD}
                    tagRender={RelicSetTagRenderer}
                    placement="bottomLeft"
                    maxTagCount="responsive"
                    multiple={true}
                    expandTrigger="hover"
                  />
                </Form.Item>

                <Form.Item size="default" name="ornamentSets">
                  <Select
                    dropdownStyle={{
                      width: 250,
                    }}
                    listHeight={500}
                    mode="multiple"
                    allowClear
                    style={{
                      width: panelWidth,
                    }}
                    options={GenerateOrnamentsOptions()}
                    tagRender={OrnamentSetTagRenderer}
                    placeholder="Planar Ornaments"
                    maxTagCount="responsive"
                  >
                  </Select>
                </Form.Item>
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
                <Flex justify="space-between" align="center">
                  <HeaderText>Substat weight filter</HeaderText>
                  <TooltipImage type={Hint.substatWeightFilter()} />
                </Flex>

                <Flex vertical gap={0}>
                  <FormStatRollSlider text="HP" name={Constants.Stats.HP_P} />
                  <FormStatRollSlider text="ATK" name={Constants.Stats.ATK_P} />
                  <FormStatRollSlider text="DEF" name={Constants.Stats.DEF_P} />
                  <FormStatRollSlider text="SPD" name={Constants.Stats.SPD} />
                  <FormStatRollSlider text="CR" name={Constants.Stats.CR} />
                  <FormStatRollSlider text="CD" name={Constants.Stats.CD} />
                  <FormStatRollSlider text="EHR" name={Constants.Stats.EHR} />
                  <FormStatRollSlider text="RES" name={Constants.Stats.RES} />
                  <FormStatRollSlider text="BE" name={Constants.Stats.BE} />
                </Flex>
                <HorizontalDivider />
                <Text>Top % of weighted relics</Text>
                <FormStatRollSliderTopPercent />
              </Flex>
            </FormCard>

            <FormCard>
              <Flex justify="space-between" align="center">
                <HeaderText>Stat filters</HeaderText>
                <TooltipImage type={Hint.statFilters()} />
              </Flex>
              <Flex vertical gap={5}>
                <FilterRow name="Hp" label="HP" />
                <FilterRow name="Atk" label="ATK" />
                <FilterRow name="Def" label="DEF" />
                <FilterRow name="Spd" label="SPD" />
                <FilterRow name="Cr" label="CR" />
                <FilterRow name="Cd" label="CD" />
                <FilterRow name="Ehr" label="EHR" />
                <FilterRow name="Res" label="RES" />
                <FilterRow name="Be" label="BE" />
                <FilterRow name="Err" label="ERR" />
              </Flex>
            </FormCard>

            <FormCard>
              <Flex vertical gap={defaultGap}>
                <Flex justify="space-between" align="center">
                  <HeaderText>Rating filters</HeaderText>
                  <TooltipImage type={Hint.ratingFilters()} />
                </Flex>

                <FilterRow name="Cv" label="CV" />
                <FilterRow name="Weight" label="WEIGHT" />
                <FilterRow name="Ehp" label="EHP" />
                <FilterRow name="Basic" label="BASIC" />
                <FilterRow name="Skill" label="SKILL" />
                <FilterRow name="Ult" label="ULT" />
                <FilterRow name="Fua" label="FUA" />
                <FilterRow name="Dot" label="DOT" />
              </Flex>
            </FormCard>

            <FormCard>
              <Flex vertical gap={defaultGap}>
                <Flex justify="space-between" align="center">
                  <HeaderText>Combat buffs</HeaderText>
                  <TooltipImage type={Hint.combatBuffs()} />
                </Flex>

                <Flex vertical gap={defaultGap}>
                  <Flex justify="space-between">
                    <Text>
                      ATK
                    </Text>
                    <Form.Item size="default" name="buffAtk">
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify="space-between">
                    <Text>
                      ATK %
                    </Text>
                    <Form.Item size="default" name="buffAtkP">
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify="space-between">
                    <Text>
                      Crit Rate %
                    </Text>
                    <Form.Item size="default" name="buffCr">
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify="space-between">
                    <Text>
                      Crit Dmg %
                    </Text>
                    <Form.Item size="default" name="buffCd">
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify="space-between">
                    <Text>
                      SPD
                    </Text>
                    <Form.Item size="default" name="buffSpd">
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify="space-between">
                    <Text>
                      SPD %
                    </Text>
                    <Form.Item size="default" name="buffSpdP">
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify="space-between">
                    <Text>
                      BE %
                    </Text>
                    <Form.Item size="default" name="buffBe">
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify="space-between">
                    <Text>
                      Dmg Boost %
                    </Text>
                    <Form.Item size="default" name="buffDmgBoost">
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify="space-between">
                    <Text>
                      Def Shred %
                    </Text>
                    <Form.Item size="default" name="buffDefShred">
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>

                  <Flex justify="space-between">
                    <Text>
                      RES Pen %
                    </Text>
                    <Form.Item size="default" name="buffResPen">
                      <InputNumberStyled size="small" controls={false} />
                    </Form.Item>
                  </Flex>
                </Flex>
              </Flex>
            </FormCard>
          </FormRow>

          <TeammateFormRow id={OptimizerMenuIds.teammates}>
            <TeammateCard index={0} />
            <TeammateCard index={1} />
            <TeammateCard index={2} />
          </TeammateFormRow>
        </FilterContainer>
      </Form>
    </div>
  )
}
