import React, { useEffect, useState } from 'react'
import { Button, Divider, Flex, Form, InputNumber, Modal, Popconfirm, Select, Typography } from 'antd'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { Assets } from 'lib/assets'
import { Utils } from 'lib/utils'
import DB from 'lib/db'
import { Constants } from 'lib/constants.ts'
import { usePublish } from 'hooks/usePublish'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'
import { useTranslation } from 'react-i18next'
import { ColorizedLinkWithIcon } from 'components/common/ColorizedLink'

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

        <Divider style={{ marginTop: 10, marginBottom: 40 }}>
          <ColorizedLinkWithIcon text={t('Scoring.WeightMethodology.Header')} linkIcon={true} url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md'/>
        </Divider>
      </Form>
    </Modal>
  )
}
