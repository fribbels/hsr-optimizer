import React, { useEffect, useState } from 'react'
import { Button, Collapse, Divider, Flex, Form, InputNumber, Modal, Popconfirm, Select, Typography } from 'antd'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { Assets } from 'lib/assets'
import { Utils } from 'lib/utils'
import DB from 'lib/db'
import { Constants } from 'lib/constants.ts'
import { usePublish } from 'hooks/usePublish'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'
import { dmgOrbMainstatBonus, mainStatBonuses, minRollValue, percentToScore } from 'lib/relicScorerPotential'
// ^ can be hardcoded later, this makes initial balance adjustments less of a hassle

const { Text } = Typography

const TitleDivider = styled(Divider)`
    margin-top: 10px !important;
    margin-bottom: 10px !important;
`
const InputNumberStyled = styled(InputNumber)`
    width: 62px
`
const PStyled = styled.p`
`

export default function ScoringModal() {
  const pubRefreshRelicsScore = usePublish()

  const [scoringAlgorithmForm] = Form.useForm()
  window.scoringAlgorithmForm = scoringAlgorithmForm

  const scoringAlgorithmFocusCharacter = window.store((s) => s.scoringAlgorithmFocusCharacter)
  const setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)
  const charactersById = window.store((s) => s.charactersById)

  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false)
  window.setIsScoringModalOpen = setIsScoringModalOpen

  function characterSelectorChange(id) {
    setScoringAlgorithmFocusCharacter(id)
  }

  // Cleans up 0's to not show up on the form
  function getScoringValuesForDisplay(scoringMetadata) {
    for (const x of Object.entries(scoringMetadata.stats)) {
      if (x[1] == 0) {
        scoringMetadata.stats[x[0]] = null
      }
    }

    return scoringMetadata
  }

  useEffect(() => {
    const id = scoringAlgorithmFocusCharacter
    if (id) {
      let scoringMetadata = Utils.clone(DB.getScoringMetadata(id))
      scoringMetadata = getScoringValuesForDisplay(scoringMetadata)
      scoringAlgorithmForm.setFieldsValue(scoringMetadata)

      console.log('Scoring modal opening set as:', scoringMetadata)
    }
  }, [scoringAlgorithmFocusCharacter, isScoringModalOpen, scoringAlgorithmForm])

  const panelWidth = 225
  const defaultGap = 5
  const selectWidth = 360

  function StatValueRow(props) {
    return (
      <Flex justify="flex-start" style={{ width: panelWidth }} align="center" gap={5}>
        <Form.Item size="default" name={['stats', props.stat]}>
          <InputNumberStyled controls={false} size="small"/>
        </Form.Item>
        <Flex>
          <img src={Assets.getStatIcon(props.stat)} style={{ width: 25, height: 25, marginRight: 3 }}></img>
          <Text style={{ lineHeight: 1.8 }}>{Constants.StatsToReadable[props.stat]}</Text>
        </Flex>
      </Flex>
    )
  }

  StatValueRow.propTypes = {
    stat: PropTypes.string,
  }

  function onModalOk() {
    console.log('onModalOk OK')
    const values = scoringAlgorithmForm.getFieldsValue()
    onFinish(values)
    setIsScoringModalOpen(false)
    pubRefreshRelicsScore('refreshRelicsScore', 'null')
  }

  const onFinish = (x) => {
    if (!scoringAlgorithmFocusCharacter) return

    console.log('Form finished', x)
    x.stats[Constants.Stats.ATK_P] = x.stats[Constants.Stats.ATK]
    x.stats[Constants.Stats.DEF_P] = x.stats[Constants.Stats.DEF]
    x.stats[Constants.Stats.HP_P] = x.stats[Constants.Stats.HP]

    const defaultScoringMetadata = Utils.clone(DB.getMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata)
    const existingScoringMetadata = DB.getScoringMetadata(scoringAlgorithmFocusCharacter)

    defaultScoringMetadata.simulation = existingScoringMetadata.simulation

    function nullUndefinedToZero(x) {
      if (x == null) return 0
      return x
    }

    x.modified = false
    for (const stat of Object.values(Constants.Stats)) {
      if (nullUndefinedToZero(x.stats[stat]) != nullUndefinedToZero(defaultScoringMetadata.stats[stat])) {
        x.modified = true
      }
    }

    DB.updateCharacterScoreOverrides(scoringAlgorithmFocusCharacter, x)
  }

  const handleResetDefault = () => {
    if (!scoringAlgorithmFocusCharacter) return

    const defaultScoringMetadata = DB.getMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata
    const displayScoringMetadata = getScoringValuesForDisplay(defaultScoringMetadata)

    DB.updateCharacterScoreOverrides(scoringAlgorithmFocusCharacter, defaultScoringMetadata)
    scoringAlgorithmForm.setFieldsValue(displayScoringMetadata)
  }

  function ResetAllCharactersButton() {
    const resetAllCharacters = () => {
      console.log('Reset the scoring algorithm for all characters')
      for (const character of Object.keys(charactersById)) {
        const defaultScoringMetadata = DB.getMetadata().characters[character].scoringMetadata
        DB.updateCharacterScoreOverrides(character, defaultScoringMetadata)
      }

      // Update values for current screen
      const defaultScoringMetadata = DB.getMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata
      const displayScoringMetadata = getScoringValuesForDisplay(defaultScoringMetadata)
      scoringAlgorithmForm.setFieldsValue(displayScoringMetadata)
    }

    return (
      <Popconfirm
        title="Reset the scoring algorithm for all characters?"
        description="You will lose any custom scoring settings you have set on any character."
        onConfirm={resetAllCharacters}
        okText="Yes"
        cancelText="No"
      >
        <Button danger>Reset all characters</Button>
      </Popconfirm>
    )
  }

  const handleCancel = () => {
    setIsScoringModalOpen(false)
  }

  const previewSrc = (scoringAlgorithmFocusCharacter) ? Assets.getCharacterPreviewById(scoringAlgorithmFocusCharacter) : Assets.getBlank()

  const methodologyCollapse = (
    <Text>
      <PStyled style={{ margin: '7px 0px' }}>
        Relic scores are calculated by
        {' '}
        <code>Score = substatScore / idealScore * {percentToScore}</code>
        .
        This allows for characters with fewer desired stats to achieve scores comparable to characters with many desired stats
      </PStyled>
      <PStyled style={{ margin: '7px 0px' }}>
        The idealScore is the substatScore for a theoretical perfect relic
      </PStyled>
      <PStyled style={{ margin: '7px 0px' }}>
        The substatScore is calculated by
        {' '}
        <code>SubstatScore = weight * normalization * value</code>
        .
        The weight of each stat is defined above, on a scale of 0 to 1.
        The normalization of each stat is calculated based on the ratio of their main stat values to Crit DMG with max value
        {' '}
        <code>64.8</code>
        :
      </PStyled>
      <Flex justify="space-between" style={{ marginRight: 120 }}>
        <ul>
          <li><code>CD BE = 64.8 / 64.8 == 1.0</code></li>
          <li><code>DEF% = 64.8 / 54.0 == 1.2</code></li>
          <li><code>HP% ATK% EHR RES = 64.8 / 43.2 == 1.5</code></li>
          <li><code>CR = 64.8 / 32.4 == 2</code></li>
        </ul>
        <ul>
          <li><code>SPD = 64.8 / 25.032 == 2.59</code></li>
          <li><code>OHB = 64.8 / 34.561 == 1.87</code></li>
          <li><code>ERR = 64.8 / 19.439 == 3.33</code></li>
          <li><code>ELEMENTAL DMG = 64.8 / 38.88 == 1.67</code></li>
        </ul>
      </Flex>
      <PStyled style={{ margin: '7px 0px' }}>
        Flat ATK/HP/DEF have a separate calculation:
        {' '}
        Their weights are automatically calculated based on the weights given to their respective % counterparts
        <code> % stat weight * flat stat low roll / (baseStats.HP * 2 * % stat low roll)</code>
        the weight calculation for flat atk for Seele for example would be:
        <code> 0.75 * 19 / (baseStats.HP * 2 * 0.03888)</code>
        .
      </PStyled>
      <PStyled style={{ margin: '7px 0px' }}>
        The normalization is calculated based on the normalization for the respective % counterparts:
        <li>
          <code>64.8 / % main stat value * % stat high roll value / flat stat high roll value</code>
          . in combination with the adjusted weights, this allows for flat stats to be accurately scored when compared against their % counterparts
        </li>
      </PStyled>

      <PStyled style={{ margin: '7px 0px' }}>
        A letter grade is assigned based on the number of normalized min rolls of each substat.
        The score for each min roll is equivalent to
        {' '}
        <code>{minRollValue}</code>
        {'\n'}
        The general scale for grade by rolls is
        <code>F=1, D=2, C=3, B=4, A=5, S=6, SS=7, SSS=8, WTF=9</code>
        {' '}
        with a
        {' '}
        <code>+</code>
        {' '}
        assigned for an additional half roll.
      </PStyled>

      <PStyled style={{ margin: '7px 0px' }}>
        Character scores are calculated by
        {' '}
        <code>Score = sum(relic scores) + sum(main stat scores)</code>
        .
        Only the feet/body/sphere/rope relics have main stat scores.
        The main stat score for a 5 star maxed relic is
        {' '}
        <code>64.8</code>
        {' '}
        if the main stat is optimal, otherwise scaled down by the stat weight.
        Non 5 star relic scores are also scaled down by their maximum enhance.
        Characters are expected to have 3 full sets, so 3 rolls worth of score is deducted for each missing set.
      </PStyled>

      <PStyled style={{ margin: '7px 0px' }}>
        Body/feet/sphere/rope relics are granted extra rolls to compensate for the difficulty of obtaining optimal main stats with desired substats.
        These numbers were calculated by a simulation of relic rolls accounting for main stat drop rate and expected substat value.
        <li style={{ fontWeight: 'bolder' }}>TODO: figure out new mainstat bonuses and add explainer here for how we figured it out</li>
        These rolls are first multiplied by the min roll value of
        {' '}
        <code>{minRollValue}</code>
        {' '}
        and then, if the main stat is not optimal, scaled down by the stat weight to obtain the bonus score value.
      </PStyled>

      <Flex justify="space-between" style={{ marginRight: 30 }}>
        <ul>
          <li><code>Body HP_P {(mainStatBonuses[Constants.Parts.Body][Constants.Stats.HP_P]).toFixed(3)}</code></li>
          <li><code>Body ATK_P {(mainStatBonuses[Constants.Parts.Body][Constants.Stats.ATK_P]).toFixed(3)}</code></li>
          <li><code>Body DEF_P {(mainStatBonuses[Constants.Parts.Body][Constants.Stats.DEF_P]).toFixed(3)}</code></li>
          <li><code>Body CR {(mainStatBonuses[Constants.Parts.Body][Constants.Stats.CR]).toFixed(3)}</code></li>
          <li><code>Body CD {(mainStatBonuses[Constants.Parts.Body][Constants.Stats.CD]).toFixed(3)}</code></li>
        </ul>
        <ul>
          <li><code>Body OHB {(mainStatBonuses[Constants.Parts.Body][Constants.Stats.OHB]).toFixed(3)}</code></li>
          <li><code>Body EHR {(mainStatBonuses[Constants.Parts.Body][Constants.Stats.EHR]).toFixed(3)}</code></li>
          <li><code>Feet HP_P {(mainStatBonuses[Constants.Parts.Feet][Constants.Stats.HP_P]).toFixed(3)}</code></li>
          <li><code>Feet ATK_P {(mainStatBonuses[Constants.Parts.Feet][Constants.Stats.ATK_P]).toFixed(3)}</code></li>
          <li><code>Feet DEF_P {(mainStatBonuses[Constants.Parts.Feet][Constants.Stats.DEF_P]).toFixed(3)}</code></li>
        </ul>
        <ul>
          <li><code>Feet SPD {(mainStatBonuses[Constants.Parts.Feet][Constants.Stats.SPD]).toFixed(3)}</code></li>
          <li><code>PlanarSphere HP_P {(mainStatBonuses[Constants.Parts.PlanarSphere][Constants.Stats.HP_P]).toFixed(3)}</code></li>
          <li><code>PlanarSphere ATK_P {(mainStatBonuses[Constants.Parts.PlanarSphere][Constants.Stats.ATK_P]).toFixed(3)}</code></li>
          <li><code>PlanarSphere DEF_P {(mainStatBonuses[Constants.Parts.PlanarSphere][Constants.Stats.DEF_P]).toFixed(3)}</code></li>
          <li><code>PlanarSphere ELEM {(dmgOrbMainstatBonus).toFixed(3)}</code></li>
        </ul>
        <ul>
          <li><code>LinkRope HP_P {(mainStatBonuses[Constants.Parts.LinkRope][Constants.Stats.HP_P]).toFixed(3)}</code></li>
          <li><code>LinkRope ATK_P {(mainStatBonuses[Constants.Parts.LinkRope][Constants.Stats.ATK_P]).toFixed(3)}</code></li>
          <li><code>LinkRope DEF_P {(mainStatBonuses[Constants.Parts.LinkRope][Constants.Stats.DEF_P]).toFixed(3)}</code></li>
          <li><code>LinkRope BE {(mainStatBonuses[Constants.Parts.LinkRope][Constants.Stats.BE]).toFixed(3)}</code></li>
          <li><code>LinkRope ERR {(mainStatBonuses[Constants.Parts.LinkRope][Constants.Stats.ERR]).toFixed(3)}</code></li>
        </ul>
      </Flex>

      <PStyled style={{ margin: '7px 0px' }}>
        This scoring method is still experimental and subject to change, please come by the discord server to share any feedback!
      </PStyled>
    </Text>
  )

  return (
    <Modal
      open={isScoringModalOpen}
      width={900}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      forceRender
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="default" onClick={handleResetDefault}>
          Reset to default
        </Button>,
        <ResetAllCharactersButton key="resetAll"/>,
        <Button key="submit" type="primary" onClick={onModalOk}>
          Save changes
        </Button>,
      ]}
    >
      <Form
        form={scoringAlgorithmForm}
        preserve={false}
        layout="vertical"
        onFinish={onFinish}
      >

        <TitleDivider>Stat weights</TitleDivider>

        <Flex gap={10} vertical>
          <Flex gap={20} justify="space-between">
            <Flex vertical gap={5}>
              <Form.Item size="default" name="characterId">
                <CharacterSelect
                  value=""
                  selectStyle={{}}
                  onChange={characterSelectorChange}
                />
              </Form.Item>
              <div style={{ height: 230, width: panelWidth, overflow: 'hidden' }}>
                <img src={previewSrc} style={{ width: panelWidth }}/>
              </div>
            </Flex>
            <Flex vertical gap={3}>
              <StatValueRow stat={Constants.Stats.ATK}/>
              <StatValueRow stat={Constants.Stats.HP}/>
              <StatValueRow stat={Constants.Stats.DEF}/>
              <StatValueRow stat={Constants.Stats.SPD}/>
              <StatValueRow stat={Constants.Stats.CR}/>
              <StatValueRow stat={Constants.Stats.CD}/>
              <StatValueRow stat={Constants.Stats.EHR}/>
              <StatValueRow stat={Constants.Stats.RES}/>
              <StatValueRow stat={Constants.Stats.BE}/>
            </Flex>
            <Flex vertical gap={3}>
              <StatValueRow stat={Constants.Stats.ERR}/>
              <StatValueRow stat={Constants.Stats.OHB}/>
              <StatValueRow stat={Constants.Stats.Physical_DMG}/>
              <StatValueRow stat={Constants.Stats.Fire_DMG}/>
              <StatValueRow stat={Constants.Stats.Ice_DMG}/>
              <StatValueRow stat={Constants.Stats.Lightning_DMG}/>
              <StatValueRow stat={Constants.Stats.Wind_DMG}/>
              <StatValueRow stat={Constants.Stats.Quantum_DMG}/>
              <StatValueRow stat={Constants.Stats.Imaginary_DMG}/>
            </Flex>
          </Flex>
        </Flex>

        <TitleDivider>Optimal main stats</TitleDivider>

        <Flex justify="space-between">
          <Flex vertical gap={defaultGap * 2}>
            <Flex vertical gap={1} justify="flex-start">
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
                  placeholder="Body"
                  maxTagCount="responsive"
                >
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

            <Flex vertical gap={1} justify="flex-start">
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
                  placeholder="Feet"
                  maxTagCount="responsive"
                >
                  <Select.Option value={Constants.Stats.HP_P}>HP%</Select.Option>
                  <Select.Option value={Constants.Stats.ATK_P}>ATK%</Select.Option>
                  <Select.Option value={Constants.Stats.DEF_P}>DEF%</Select.Option>
                  <Select.Option value={Constants.Stats.SPD}>Speed</Select.Option>
                </Select>
              </Form.Item>
            </Flex>
          </Flex>
          <Flex vertical gap={defaultGap * 2}>
            <Flex vertical gap={1} justify="flex-start">
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
                  placeholder="Planar Sphere"
                  listHeight={400}
                  maxTagCount="responsive"
                >
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

            <Flex vertical gap={1} justify="flex-start">
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
                  placeholder="Link Rope"
                  maxTagCount="responsive"
                >
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

        <TitleDivider>Calculations</TitleDivider>

        <Collapse
          ghost
          items={[{
            key: '1',
            label: 'Click to show details',
            children: methodologyCollapse,
          }]}
        >
        </Collapse>
      </Form>
    </Modal>
  )
}
