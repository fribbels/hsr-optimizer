import React, { useEffect, useMemo, useState } from 'react'
import { Button, Collapse, Divider, Flex, Form, InputNumber, Modal, Popconfirm, Select, Typography } from 'antd'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { Assets } from 'lib/assets'
import { Utils } from 'lib/utils'
import DB from 'lib/db'
import { Constants } from 'lib/constants.ts'
import { usePublish } from 'hooks/usePublish'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'

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

  let scoringAlgorithmFocusCharacter = window.store((s) => s.scoringAlgorithmFocusCharacter)
  let setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)
  let charactersById = window.store((s) => s.charactersById)

  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false)
  window.setIsScoringModalOpen = setIsScoringModalOpen

  function characterSelectorChange(id) {
    setScoringAlgorithmFocusCharacter(id)
  }

  // Cleans up 0's to not show up on the form
  function getScoringValuesForDisplay(scoringMetadata) {
    for (let x of Object.entries(scoringMetadata.stats)) {
      if (x[1] == 0) {
        scoringMetadata.stats[x[0]] = null
      }
    }

    return scoringMetadata
  }

  useEffect(() => {
    let id = scoringAlgorithmFocusCharacter
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

  const characterOptions = useMemo(() => {
    return Utils.generateCharacterOptions()
  }, [])

  function StatValueRow(props) {
    return (
      <Flex justify="flex-start" style={{ width: panelWidth }} align="center" gap={5}>
        <Form.Item size="default" name={['stats', props.stat]}>
          <InputNumberStyled controls={false} size="small" />
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
    scoringAlgorithmForm.submit()
    setIsScoringModalOpen(false)
    pubRefreshRelicsScore('refreshRelicsScore', 'null')
  }

  const onFinish = (x) => {
    if (!scoringAlgorithmFocusCharacter) return

    console.log('Form finished', x)
    x.stats[Constants.Stats.ATK_P] = x.stats[Constants.Stats.ATK]
    x.stats[Constants.Stats.DEF_P] = x.stats[Constants.Stats.DEF]
    x.stats[Constants.Stats.HP_P] = x.stats[Constants.Stats.HP]

    let defaultScoringMetadata = DB.getMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata

    function nullUndefinedToZero(x) {
      if (x == null) return 0
      return x
    }

    x.modified = false
    for (let stat of Object.values(Constants.Stats)) {
      if (nullUndefinedToZero(x.stats[stat]) != nullUndefinedToZero(defaultScoringMetadata.stats[stat])) {
        x.modified = true
      }
    }

    DB.updateCharacterScoreOverrides(scoringAlgorithmFocusCharacter, x)
  }

  const handleResetDefault = () => {
    if (!scoringAlgorithmFocusCharacter) return

    let defaultScoringMetadata = DB.getMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata
    let displayScoringMetadata = getScoringValuesForDisplay(defaultScoringMetadata)

    DB.updateCharacterScoreOverrides(scoringAlgorithmFocusCharacter, defaultScoringMetadata)
    scoringAlgorithmForm.setFieldsValue(displayScoringMetadata)
  }

  function ResetAllCharactersButton() {

    const resetAllCharacters = () => {
      console.log("Reset the scoring algorithm for all characters")
      for (let character of Object.keys(charactersById)) {
        let defaultScoringMetadata = DB.getMetadata().characters[character].scoringMetadata
        DB.updateCharacterScoreOverrides(character, defaultScoringMetadata)
      }

      // Update values for current screen
      let defaultScoringMetadata = DB.getMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata
      let displayScoringMetadata = getScoringValuesForDisplay(defaultScoringMetadata)
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

  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

  let previewSrc = (scoringAlgorithmFocusCharacter) ? Assets.getCharacterPreviewById(scoringAlgorithmFocusCharacter) : Assets.getBlank()

  let methodologyCollapse = (
    <Text>
      <PStyled>
        Substat scoring is calculated by
        {' '}
        <code>Score = weight * normalization * value</code>
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
          <li><code>HP% ATK% EHR = 64.8 / 43.2 == 1.5</code></li>
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
        <code>1 / (2 * character base * 0.01) * (64.8 / (% main stat value))</code>
        .
        This converts the flat stat value to a percent equivalent by base stats, then normalizes it.
        Double the character base is used instead of character + light cone base due to the variable nature of light cone stats.
      </PStyled>

      <PStyled style={{ margin: '7px 0px' }}>
        A letter grade is assigned based on the number of normalized min rolls of each substat.
        The score for each min roll in theory should be equivalent to
        {' '}
        <code>5.184</code>
        , but is rounded down to
        {' '}
        <code>5.1</code>
        {' '}
        due to the game not displaying extra decimals.
        The general scale for grade by rolls is
        {' '}
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
        <code>Score = sum(relic substat scores) + sum(main stat scores)</code>
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
        These rolls are multiplied by the min roll value of
        {' '}
        <code>5.1</code>
        {' '}
        for the bonus score value.
      </PStyled>

      <Flex justify="space-between" style={{ marginRight: 30 }}>
        <ul>
          <li><code>Body HP_P 1.280</code></li>
          <li><code>Body ATK_P 1.278</code></li>
          <li><code>Body DEF_P 1.305</code></li>
          <li><code>Body CR 1.647</code></li>
          <li><code>Body CD 1.643</code></li>
        </ul>
        <ul>
          <li><code>Body OHB 1.713</code></li>
          <li><code>Body EHR 1.653</code></li>
          <li><code>Feet HP_P 1.045</code></li>
          <li><code>Feet ATK_P 1.000</code></li>
          <li><code>Feet DEF_P 1.002</code></li>
        </ul>
        <ul>
          <li><code>Feet SPD 1.573</code></li>
          <li><code>PlanarSphere HP_P 1.583</code></li>
          <li><code>PlanarSphere ATK_P 1.545</code></li>
          <li><code>PlanarSphere DEF_P 1.595</code></li>
          <li><code>PlanarSphere ELEM 1.747</code></li>
        </ul>
        <ul>
          <li><code>LinkRope HP_P 1.056</code></li>
          <li><code>LinkRope ATK_P 1.016</code></li>
          <li><code>LinkRope DEF_P 1.161</code></li>
          <li><code>LinkRope BE 1.417</code></li>
          <li><code>LinkRope ERR 2.000</code></li>
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
        <ResetAllCharactersButton key="resetAll" />,
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
                  selectStyle={{ }}
                  onChange={characterSelectorChange}
                />
              </Form.Item>
              <div style={{ height: 230, width: panelWidth, overflow: 'hidden' }}>
                <img src={previewSrc} style={{ width: panelWidth }} />
              </div>
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
