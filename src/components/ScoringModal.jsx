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
import { Trans, useTranslation } from 'react-i18next'

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
  const { t } = useTranslation(['modals', 'common'])

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

      // console.log('Scoring modal opening set as:', scoringMetadata)
    }
  }, [scoringAlgorithmFocusCharacter, isScoringModalOpen, scoringAlgorithmForm])

  const panelWidth = 225
  const defaultGap = 5
  const selectWidth = 360

  function StatValueRow(props) {
    return (
      <Flex justify='flex-start' style={{ width: panelWidth }} align='center' gap={5}>
        <Form.Item size='default' name={['stats', props.stat]}>
          <InputNumberStyled controls={false} size='small'/>
        </Form.Item>
        <Flex>
          <img src={Assets.getStatIcon(props.stat)} style={{ width: 25, height: 25, marginRight: 3 }}></img>
          <Text style={{ lineHeight: 1.8 }}>{t(`common:ReadableStats.${props.stat}`)}</Text>
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
        title={t('Scoring.ResetAllConfirm.Title')/* Reset the scoring algorithm for all characters? */}
        description={t('Scoring.ResetAllConfirm.Description')/* You will lose any custom scoring settings you have set on any character. */}
        onConfirm={resetAllCharacters}
        okText={t('Scoring.ResetAllConfirm.Yes')/* Yes */}
        cancelText={t('Scoring.ResetAllConfirm.No')/* No */}
      >
        <Button danger>{t('Scoring.Footer.ResetAll')/* Reset all characters */}</Button>
      </Popconfirm>
    )
  }

  const handleCancel = () => {
    setIsScoringModalOpen(false)
  }

  const previewSrc = (scoringAlgorithmFocusCharacter) ? Assets.getCharacterPreviewById(scoringAlgorithmFocusCharacter) : Assets.getBlank()

  const weightMethodologyCollapse = (
    <Text>
      <PStyled style={{ margin: '7px 0px' }}>
        {
          t('Scoring.WeightMethodology.Paragraph1')
          // Substat weights are graded on a 0.0 to 1.0 scale in increments of 0.25, based on how valuable each stat is to the character. Weights are evaluated based on the following general ruleset:
        }
      </PStyled>

      <Flex justify='space-between' style={{ marginRight: 30 }}>
        <ul>
          {/* the raw text inside this Trans component has no effect on the translation, to update the text you must update the appropriate values in the localisation files */}
          <Trans t={t} i18nKey='Scoring.WeightMethodology.Paragraph2'>
            <li><u>Speed weight:</u></li>
            <li>— SPD is given a value of 1.0 for every character. This is due to the importance of speed tuning in team compositions, and the optimizer should be used to maximize each character's stats at a certain speed breakpoint.</li>
            <br/>
            <li><u>CRIT Rate / CRIT Damage weight:</u></li>
            <li>— Crit DPS in general are given the weights 0.75 ATK | 1.0 SPD | 1.0 CR | 1.0 CD, unless they have any other special scaling.</li>
            <li>— ATK is weighted slightly than CR and CD rolls because in general crit substats will provide a higher boost to damage.</li>
            <br/>
            <li><u>HP / DEF weight:</u></li>
            <li>— Defensive supports are given 2.0 weight to distribute between HP and DEF.</li>
            <li>— For each additional (0.75 | 1.0) stat weight that they scale with, deduct 0.5 down to a minimum of 1.0.</li>
            <li>— If 2.0 still remains and one of the stats is worth more than the other (Huohuo and HP% for example), assign a 1.0 / 0.75 split.</li>
            <li>— Offensive supports follow the same ruleset, except they start with 1.5 weight to distribute between HP and DEF.</li>
            <br/>
            <li><u>RES weight:</u></li>
            <li>— Support characters are granted 0.5 RES weight by default, with an additional 0.25 weight if they have synergy with RES or have critical team-saving abilities.</li>
          </Trans>
        </ul>
      </Flex>

      <PStyled style={{ margin: '7px 0px' }}>
        {
          t('Scoring.WeightMethodology.Paragraph3')
          // These weights are the defaults, but each player may have different preferences. Feel free to adjust the weights to fit a certain playstyle. DPS characters should rely on the optimizer and Combat Score to evaluate their performance in combat, since substats scores don't take into account external factors like team buffs or passive effects.
        }
      </PStyled>
    </Text>
  )

  const calculationsMethodologyCollapse = (
    <Text>
      {/* the raw text inside these Trans components have no effect on the translation, to update the text you must update the appropriate values in the localisation files */}
      <PStyled style={{ margin: '7px 0px' }}>
        <Trans t={t} i18nKey='Scoring.CalculationMethodology.Paragraph1'>
          Relic scores are calculated by
          {' '}
          <code>Score = substatScore / idealScore * {{ percentToScore }}</code>
          .
          This allows for characters with fewer desired stats to achieve scores comparable to characters with many desired stats.
        </Trans>
      </PStyled>
      <PStyled style={{ margin: '7px 0px' }}>
        {
          t('Scoring.CalculationMethodology.Paragraph2')
          // The idealScore is the substatScore for a theoretical perfect relic. By adjusting the score to the maximum possible relic, this means that when a weighted substat is occupied by the main stat, the score value of the remaining substat weights increases.
        }
      </PStyled>
      <PStyled style={{ margin: '7px 0px' }}>
        <Trans t={t} i18nKey='Scoring.CalculationMethodology.Paragraph3'>
          The substatScore is calculated by
          {' '}
          <code>SubstatScore = weight * normalization * value</code>
          .
          The weight of each stat is defined above, on a scale of 0 to 1.
          The normalization of each stat is calculated based on the ratio of their main stat values to Crit DMG with max value
          {' '}
          <code>64.8</code>
          :
        </Trans>
      </PStyled>
      <Flex justify='space-between' style={{ marginRight: 120 }}>
        <Trans t={t} i18nKey='Scoring.CalculationMethodology.Paragraph4'>
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
        </Trans>
      </Flex>
      <PStyled style={{ margin: '7px 0px' }}>
        <Trans t={t} i18nKey='Scoring.CalculationMethodology.Paragraph5'>
          Flat ATK/HP/DEF have a separate calculation:
          {' '}
          Their weights are automatically calculated based on the weights given to their respective % counterparts
          <code> % stat weight * flat stat low roll / (baseStats[stat] * 2 * % stat low roll)</code>
          the weight calculation for flat atk for Seele for example would be:
          <code> 0.75 * 19 / (640 * 2 * 0.03888) = 0.75 * 19 / (640.33 * 2 * 0.03888) = 0.28619</code>
          .
        </Trans>
      </PStyled>
      <PStyled style={{ margin: '7px 0px' }}>
        <Trans t={t} i18nKey='Scoring.CalculationMethodology.Paragraph6'>
          The normalization is calculated based on the normalization for the respective % counterparts:
          <li>
            <code>64.8 / % main stat value * % stat high roll value / flat stat high roll value</code>
            . in combination with the adjusted weights, this allows for flat stats to be accurately scored when compared against their % counterparts.
          </li>
        </Trans>
      </PStyled>

      <PStyled style={{ margin: '7px 0px' }}>
        <Trans t={t} i18nKey='Scoring.CalculationMethodology.Paragraph7'>
          A letter grade is assigned based on the number of normalized min rolls of each substat.
          The score for each min roll is equivalent to
          {' '}
          <code>{{ minRollValue }}</code>
          {'\n'}
          The general scale for grade by rolls is
          <code>F=1, D=2, C=3, B=4, A=5, S=6, SS=7, SSS=8, WTF=9</code>
          {' '}
          with a
          {' '}
          <code>+</code>
          {' '}
          assigned for an additional half roll.
        </Trans>
      </PStyled>

      <PStyled style={{ margin: '7px 0px' }}>
        <Trans t={t} i18nKey='Scoring.CalculationMethodology.Paragraph8'>
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
        </Trans>
      </PStyled>

      <PStyled style={{ margin: '7px 0px' }}>
        <Trans t={t} i18nKey='Scoring.CalculationMethodology.Paragraph9'>
          Relics with main stats (body/feet/sphere/rope) are granted extra rolls to compensate for the difficulty of obtaining optimal main stats with desired substats.
          These numbers were calculated by a simulation of relic rolls accounting for main stat drop rate and expected substat value.
          These rolls are first multiplied by the min roll value of
          {' '}
          <code>{{ minRollValue }}</code>
          {' '}
          and then, if the main stat is not optimal, scaled down by the stat weight to obtain the bonus score value.
        </Trans>
      </PStyled>

      <Flex justify='space-between' style={{ marginRight: 30 }}>
        <Trans t={t} i18nKey='Scoring.CalculationMethodology.Paragraph10'>
          <ul>
            <li><code>Body — HP %: {{ mainStatBonusBodyHPP: (mainStatBonuses[Constants.Parts.Body][Constants.Stats.HP_P]).toFixed(1) }}</code></li>
            <li><code>Body — ATK %: {{ mainStatBonusBodyATKP: (mainStatBonuses[Constants.Parts.Body][Constants.Stats.ATK_P]).toFixed(1) }}</code></li>
            <li><code>Body — DEF %: {{ mainStatBonusBodyDEFP: (mainStatBonuses[Constants.Parts.Body][Constants.Stats.DEF_P]).toFixed(1) }}</code></li>
            <li><code>Body — CR: {{ mainStatBonusBodyCR: (mainStatBonuses[Constants.Parts.Body][Constants.Stats.CR]).toFixed(1) }}</code></li>
            <li><code>Body — CD: {{ mainStatBonusBodyCD: (mainStatBonuses[Constants.Parts.Body][Constants.Stats.CD]).toFixed(1) }}</code></li>
          </ul>
          <ul>
            <li><code>Body — OHB: {{ mainStatBonusBodyOHB: (mainStatBonuses[Constants.Parts.Body][Constants.Stats.OHB]).toFixed(1) }}</code></li>
            <li><code>Body — EHR: {{ mainStatBonusBodyEHR: (mainStatBonuses[Constants.Parts.Body][Constants.Stats.EHR]).toFixed(1) }}</code></li>
            <li><code>Feet — HP %: {{ mainStatBonusFeetHPP: (mainStatBonuses[Constants.Parts.Feet][Constants.Stats.HP_P]).toFixed(1) }}</code></li>
            <li><code>Feet — ATK %: {{ mainStatBonusFeetATKP: (mainStatBonuses[Constants.Parts.Feet][Constants.Stats.ATK_P]).toFixed(1) }}</code></li>
            <li><code>Feet — DEF %: {{ mainStatBonusFeetDEFP: (mainStatBonuses[Constants.Parts.Feet][Constants.Stats.DEF_P]).toFixed(1) }}</code></li>
          </ul>
          <ul>
            <li><code>Feet — SPD: {{ mainStatBonusFeetSPD: (mainStatBonuses[Constants.Parts.Feet][Constants.Stats.SPD]).toFixed(1) }}</code></li>
            <li><code>Sphere — HP %: {{ mainStatBonusSphereHPP: (mainStatBonuses[Constants.Parts.PlanarSphere][Constants.Stats.HP_P]).toFixed(1) }}</code></li>
            <li><code>Sphere — ATK %: {{ mainStatBonusSphereATKP: (mainStatBonuses[Constants.Parts.PlanarSphere][Constants.Stats.ATK_P]).toFixed(1) }}</code></li>
            <li><code>Sphere — DEF %: {{ mainStatBonusSphereDEFP: (mainStatBonuses[Constants.Parts.PlanarSphere][Constants.Stats.DEF_P]).toFixed(1) }}</code></li>
            <li><code>Sphere — Elemental DMG %: {{ mainStatBonusSphereElem: (dmgOrbMainstatBonus).toFixed(1) }}</code></li>
          </ul>
          <ul>
            <li><code>Rope — HP %: {{ mainStatBonusRopeHPP: (mainStatBonuses[Constants.Parts.LinkRope][Constants.Stats.HP_P]).toFixed(1) }}</code></li>
            <li><code>Rope — ATK %: {{ mainStatBonusRopeATKP: (mainStatBonuses[Constants.Parts.LinkRope][Constants.Stats.ATK_P]).toFixed(1) }}</code></li>
            <li><code>Rope — DEF %: {{ mainStatBonusRopeDEFP: (mainStatBonuses[Constants.Parts.LinkRope][Constants.Stats.DEF_P]).toFixed(1) }}</code></li>
            <li><code>Rope — BE: {{ mainStatBonusRopeBE: (mainStatBonuses[Constants.Parts.LinkRope][Constants.Stats.BE]).toFixed(1) }}</code></li>
            <li><code>Rope — ERR: {{ mainStatBonusRopeERR: (mainStatBonuses[Constants.Parts.LinkRope][Constants.Stats.ERR]).toFixed(1) }}</code></li>
          </ul>
        </Trans>
      </Flex>

      <PStyled style={{ margin: '7px 0px' }}>
        {
          t('Scoring.CalculationMethodology.Paragraph11')
          // This scoring method is still experimental and subject to change, please come by the discord server to share any feedback!
        }
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
        <Button key='back' onClick={handleCancel}>
          {t('Scoring.Footer.Cancel')/* Cancel */}
        </Button>,
        <Button key='default' onClick={handleResetDefault}>
          {t('Scoring.Footer.Reset')/* Reset to default */}
        </Button>,
        <ResetAllCharactersButton key='resetAll'/>,
        <Button key='submit' type='primary' onClick={onModalOk}>
          {t('Scoring.Footer.Save')/* Save changes */}
        </Button>,
      ]}
    >
      <Form
        form={scoringAlgorithmForm}
        preserve={false}
        layout='vertical'
        onFinish={onFinish}
      >

        <TitleDivider>{t('Scoring.StatWeightsHeader')/* Stat weights */}</TitleDivider>

        <Flex gap={10} vertical>
          <Flex gap={20} justify='space-between'>
            <Flex vertical gap={5}>
              <Form.Item size='default' name='characterId'>
                <CharacterSelect
                  value=''
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

        <TitleDivider>{t('Scoring.MainstatsHeader')/* Optimal mainstats */}</TitleDivider>

        <Flex justify='space-between'>
          <Flex vertical gap={defaultGap * 2}>
            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                {t('common:Parts.Body')}
              </Text>
              <Form.Item size='default' name={['parts', Constants.Parts.Body]}>
                <Select
                  mode='multiple'
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  placeholder={t('common:Parts.Body')}
                  maxTagCount='responsive'
                >
                  <Select.Option value={Constants.Stats.HP_P}>{t(`common:Stats.${Constants.Stats.HP_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.ATK_P}>{t(`common:Stats.${Constants.Stats.ATK_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.DEF_P}>{t(`common:Stats.${Constants.Stats.DEF_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.CR}>{t(`common:Stats.${Constants.Stats.CR}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.CD}>{t(`common:Stats.${Constants.Stats.CD}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.OHB}>{t(`common:Stats.${Constants.Stats.OHB}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.EHR}>{t(`common:Stats.${Constants.Stats.EHR}`)}</Select.Option>
                </Select>
              </Form.Item>
            </Flex>

            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                {t('common:Parts.Feet')}
              </Text>
              <Form.Item size='default' name={['parts', Constants.Parts.Feet]}>
                <Select
                  mode='multiple'
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  placeholder={t('common:Parts.Feet')}
                  maxTagCount='responsive'
                >
                  <Select.Option value={Constants.Stats.HP_P}>{t(`common:Stats.${Constants.Stats.HP_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.ATK_P}>{t(`common:Stats.${Constants.Stats.ATK_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.DEF_P}>{t(`common:Stats.${Constants.Stats.DEF_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.SPD}>{t(`common:Stats.${Constants.Stats.SPD}`)}</Select.Option>
                </Select>
              </Form.Item>
            </Flex>
          </Flex>
          <Flex vertical gap={defaultGap * 2}>
            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                {t('common:Parts.PlanarSphere')}
              </Text>
              <Form.Item size='default' name={['parts', Constants.Parts.PlanarSphere]}>
                <Select
                  mode='multiple'
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  placeholder={t('common:Parts.PlanarSphere')}
                  listHeight={400}
                  maxTagCount='responsive'
                >
                  <Select.Option value={Constants.Stats.HP_P}>{t(`common:Stats.${Constants.Stats.HP_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.ATK_P}>{t(`common:Stats.${Constants.Stats.ATK_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.DEF_P}>{t(`common:Stats.${Constants.Stats.DEF_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.Physical_DMG}>{t(`common:Stats.${Constants.Stats.Physical_DMG}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.Fire_DMG}>{t(`common:Stats.${Constants.Stats.Fire_DMG}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.Ice_DMG}>{t(`common:Stats.${Constants.Stats.Ice_DMG}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.Lightning_DMG}>{t(`common:Stats.${Constants.Stats.Lightning_DMG}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.Wind_DMG}>{t(`common:Stats.${Constants.Stats.Wind_DMG}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.Quantum_DMG}>{t(`common:Stats.${Constants.Stats.Quantum_DMG}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.Imaginary_DMG}>{t(`common:Stats.${Constants.Stats.Imaginary_DMG}`)}</Select.Option>
                </Select>
              </Form.Item>
            </Flex>

            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                {t('common:Parts.LinkRope')}
              </Text>

              <Form.Item size='default' name={['parts', Constants.Parts.LinkRope]}>
                <Select
                  mode='multiple'
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  placeholder={t('common:Parts.LinkRope')}
                  maxTagCount='responsive'
                >
                  <Select.Option value={Constants.Stats.HP_P}>{t(`common:Stats.${Constants.Stats.HP_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.ATK_P}>{t(`common:Stats.${Constants.Stats.ATK_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.DEF_P}>{t(`common:Stats.${Constants.Stats.DEF_P}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.BE}>{t(`common:Stats.${Constants.Stats.BE}`)}</Select.Option>
                  <Select.Option value={Constants.Stats.ERR}>{t(`common:Stats.${Constants.Stats.ERR}`)}</Select.Option>
                </Select>
              </Form.Item>
            </Flex>
          </Flex>
        </Flex>

        <TitleDivider>{t('Scoring.WeightMethodology.Header')/* Substat weight methodology */}</TitleDivider>

        <Collapse
          ghost
          items={[{
            key: '1',
            label: t('Scoring.WeightMethodology.RevealText')/* Click to show details */,
            children: weightMethodologyCollapse,
          }]}
        >
        </Collapse>

        <TitleDivider>{t('Scoring.CalculationMethodology.Header')/* Calculations */}</TitleDivider>

        <Collapse
          ghost
          items={[{
            key: '1',
            label: t('modals:Scoring.CalculationMethodology.RevealText')/* Click to show details */,
            children: calculationsMethodologyCollapse,
          }]}
        >
        </Collapse>
      </Form>
    </Modal>
  )
}
