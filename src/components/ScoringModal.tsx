import React, { useEffect } from 'react'
import { Button, Divider, Flex, Form, InputNumber, Modal, Popconfirm, Select, Typography } from 'antd'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { Assets } from 'lib/assets'
import DB from 'lib/db'
import { Parts, Stats } from 'lib/constants'
import { usePublish } from 'hooks/usePublish'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'
import { useTranslation } from 'react-i18next'
import { ColorizedLinkWithIcon } from 'components/common/ColorizedLink'
import { ScoringMetadata } from 'lib/characterScorer'
import { TsUtils } from 'lib/TsUtils'

const { Text } = Typography

const TitleDivider = styled(Divider)`
    margin-top: 10px !important;
    margin-bottom: 10px !important;
`

const InputNumberStyled = styled(InputNumber)`
    width: 62px
`

export default function ScoringModal() {
  const { t } = useTranslation(['modals', 'common'])

  const pubRefreshRelicsScore = usePublish()

  const [scoringAlgorithmForm] = Form.useForm()

  const scoringAlgorithmFocusCharacter = window.store((s) => s.scoringAlgorithmFocusCharacter)
  const setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)
  const charactersById = window.store((s) => s.charactersById)

  const setScoringModalOpen = window.store((s) => s.setScoringModalOpen)
  const scoringModalOpen = window.store((s) => s.scoringModalOpen)

  function characterSelectorChange(id: string) {
    setScoringAlgorithmFocusCharacter(id)
  }

  // Cleans up 0's to not show up on the form
  function getScoringValuesForDisplay(scoringMetadata: ScoringMetadata) {
    for (const x of Object.entries(scoringMetadata.stats)) {
      if (x[1] == 0) {
        // @ts-ignore
        scoringMetadata.stats[x[0]] = null
      }
    }

    return scoringMetadata
  }

  useEffect(() => {
    const id = scoringAlgorithmFocusCharacter
    if (id) {
      let scoringMetadata = TsUtils.clone(DB.getScoringMetadata(id))
      scoringMetadata = getScoringValuesForDisplay(scoringMetadata)
      scoringAlgorithmForm.setFieldsValue(scoringMetadata)

      // console.log('Scoring modal opening set as:', scoringMetadata)
    }
  }, [scoringAlgorithmFocusCharacter, scoringModalOpen, scoringAlgorithmForm])

  const panelWidth = 225
  const defaultGap = 5
  const selectWidth = 360

  function StatValueRow(props: { stat: string }) {
    return (
      <Flex justify='flex-start' style={{ width: panelWidth }} align='center' gap={5}>
        <Form.Item name={['stats', props.stat]}>
          <InputNumberStyled controls={false} size='small'/>
        </Form.Item>
        <Flex>
          <img src={Assets.getStatIcon(props.stat)} style={{ width: 25, height: 25, marginRight: 3 }}></img>
          <Text style={{ lineHeight: 1.8 }}>
            {
              // @ts-ignore
              t(`common:ReadableStats.${props.stat}`)
            }
          </Text>
        </Flex>
      </Flex>
    )
  }

  StatValueRow.propTypes = {
    stat: PropTypes.string,
  }

  function onModalOk() {
    console.log('onModalOk OK')
    const values = scoringAlgorithmForm.getFieldsValue() as ScoringMetadata
    onFinish(values)
    setScoringModalOpen(false)
    pubRefreshRelicsScore('refreshRelicsScore', 'null')
  }

  const onFinish = (scoringMetadata: ScoringMetadata) => {
    if (!scoringAlgorithmFocusCharacter) return

    console.log('Form finished', scoringMetadata)
    scoringMetadata.stats[Stats.ATK_P] = scoringMetadata.stats[Stats.ATK]
    scoringMetadata.stats[Stats.DEF_P] = scoringMetadata.stats[Stats.DEF]
    scoringMetadata.stats[Stats.HP_P] = scoringMetadata.stats[Stats.HP]

    const defaultScoringMetadata = TsUtils.clone(DB.getMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata)
    const existingScoringMetadata = DB.getScoringMetadata(scoringAlgorithmFocusCharacter)

    defaultScoringMetadata.simulation = existingScoringMetadata.simulation

    scoringMetadata.modified = false
    for (const stat of Object.values(Stats)) {
      if (nullUndefinedToZero(scoringMetadata.stats[stat]) != nullUndefinedToZero(defaultScoringMetadata.stats[stat])) {
        scoringMetadata.modified = true
      }
    }

    DB.updateCharacterScoreOverrides(scoringAlgorithmFocusCharacter, scoringMetadata)
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
      if (scoringAlgorithmFocusCharacter) {
        const defaultScoringMetadata = DB.getMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata
        const displayScoringMetadata = getScoringValuesForDisplay(defaultScoringMetadata)
        scoringAlgorithmForm.setFieldsValue(displayScoringMetadata)
      }
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
    setScoringModalOpen(false)
  }

  const previewSrc = (scoringAlgorithmFocusCharacter) ? Assets.getCharacterPreviewById(scoringAlgorithmFocusCharacter) : Assets.getBlank()

  return (
    <Modal
      open={scoringModalOpen}
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
              <Form.Item name='characterId'>
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
              <StatValueRow stat={Stats.ATK}/>
              <StatValueRow stat={Stats.HP}/>
              <StatValueRow stat={Stats.DEF}/>
              <StatValueRow stat={Stats.SPD}/>
              <StatValueRow stat={Stats.CR}/>
              <StatValueRow stat={Stats.CD}/>
              <StatValueRow stat={Stats.EHR}/>
              <StatValueRow stat={Stats.RES}/>
              <StatValueRow stat={Stats.BE}/>
            </Flex>
            <Flex vertical gap={3}>
              <StatValueRow stat={Stats.ERR}/>
              <StatValueRow stat={Stats.OHB}/>
              <StatValueRow stat={Stats.Physical_DMG}/>
              <StatValueRow stat={Stats.Fire_DMG}/>
              <StatValueRow stat={Stats.Ice_DMG}/>
              <StatValueRow stat={Stats.Lightning_DMG}/>
              <StatValueRow stat={Stats.Wind_DMG}/>
              <StatValueRow stat={Stats.Quantum_DMG}/>
              <StatValueRow stat={Stats.Imaginary_DMG}/>
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
              <Form.Item name={['parts', Parts.Body]}>
                <Select
                  mode='multiple'
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  placeholder={t('common:Parts.Body')}
                  maxTagCount='responsive'
                >
                  <Select.Option value={Stats.HP_P}>{t(`common:Stats.${Stats.HP_P}`)}</Select.Option>
                  <Select.Option value={Stats.ATK_P}>{t(`common:Stats.${Stats.ATK_P}`)}</Select.Option>
                  <Select.Option value={Stats.DEF_P}>{t(`common:Stats.${Stats.DEF_P}`)}</Select.Option>
                  <Select.Option value={Stats.CR}>{t(`common:Stats.${Stats.CR}`)}</Select.Option>
                  <Select.Option value={Stats.CD}>{t(`common:Stats.${Stats.CD}`)}</Select.Option>
                  <Select.Option value={Stats.OHB}>{t(`common:Stats.${Stats.OHB}`)}</Select.Option>
                  <Select.Option value={Stats.EHR}>{t(`common:Stats.${Stats.EHR}`)}</Select.Option>
                </Select>
              </Form.Item>
            </Flex>

            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                {t('common:Parts.Feet')}
              </Text>
              <Form.Item name={['parts', Parts.Feet]}>
                <Select
                  mode='multiple'
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  placeholder={t('common:Parts.Feet')}
                  maxTagCount='responsive'
                >
                  <Select.Option value={Stats.HP_P}>{t(`common:Stats.${Stats.HP_P}`)}</Select.Option>
                  <Select.Option value={Stats.ATK_P}>{t(`common:Stats.${Stats.ATK_P}`)}</Select.Option>
                  <Select.Option value={Stats.DEF_P}>{t(`common:Stats.${Stats.DEF_P}`)}</Select.Option>
                  <Select.Option value={Stats.SPD}>{t(`common:Stats.${Stats.SPD}`)}</Select.Option>
                </Select>
              </Form.Item>
            </Flex>
          </Flex>
          <Flex vertical gap={defaultGap * 2}>
            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                {t('common:Parts.PlanarSphere')}
              </Text>
              <Form.Item name={['parts', Parts.PlanarSphere]}>
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
                  <Select.Option value={Stats.HP_P}>{t(`common:Stats.${Stats.HP_P}`)}</Select.Option>
                  <Select.Option value={Stats.ATK_P}>{t(`common:Stats.${Stats.ATK_P}`)}</Select.Option>
                  <Select.Option value={Stats.DEF_P}>{t(`common:Stats.${Stats.DEF_P}`)}</Select.Option>
                  <Select.Option value={Stats.Physical_DMG}>{t(`common:Stats.${Stats.Physical_DMG}`)}</Select.Option>
                  <Select.Option value={Stats.Fire_DMG}>{t(`common:Stats.${Stats.Fire_DMG}`)}</Select.Option>
                  <Select.Option value={Stats.Ice_DMG}>{t(`common:Stats.${Stats.Ice_DMG}`)}</Select.Option>
                  <Select.Option value={Stats.Lightning_DMG}>{t(`common:Stats.${Stats.Lightning_DMG}`)}</Select.Option>
                  <Select.Option value={Stats.Wind_DMG}>{t(`common:Stats.${Stats.Wind_DMG}`)}</Select.Option>
                  <Select.Option value={Stats.Quantum_DMG}>{t(`common:Stats.${Stats.Quantum_DMG}`)}</Select.Option>
                  <Select.Option value={Stats.Imaginary_DMG}>{t(`common:Stats.${Stats.Imaginary_DMG}`)}</Select.Option>
                </Select>
              </Form.Item>
            </Flex>

            <Flex vertical gap={1} justify='flex-start'>
              <Text style={{ marginLeft: 5 }}>
                {t('common:Parts.LinkRope')}
              </Text>

              <Form.Item name={['parts', Parts.LinkRope]}>
                <Select
                  mode='multiple'
                  allowClear
                  style={{
                    width: selectWidth,
                  }}
                  placeholder={t('common:Parts.LinkRope')}
                  maxTagCount='responsive'
                >
                  <Select.Option value={Stats.HP_P}>{t(`common:Stats.${Stats.HP_P}`)}</Select.Option>
                  <Select.Option value={Stats.ATK_P}>{t(`common:Stats.${Stats.ATK_P}`)}</Select.Option>
                  <Select.Option value={Stats.DEF_P}>{t(`common:Stats.${Stats.DEF_P}`)}</Select.Option>
                  <Select.Option value={Stats.BE}>{t(`common:Stats.${Stats.BE}`)}</Select.Option>
                  <Select.Option value={Stats.ERR}>{t(`common:Stats.${Stats.ERR}`)}</Select.Option>
                </Select>
              </Form.Item>
            </Flex>
          </Flex>
        </Flex>

        <Divider style={{ marginTop: 10, marginBottom: 40 }}>
          <ColorizedLinkWithIcon
            text={t('Scoring.WeightMethodology.Header')}
            linkIcon={true}
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md'
          />
        </Divider>
      </Form>
    </Modal>
  )
}

function nullUndefinedToZero(x: number | null) {
  if (x == null) return 0
  return x
}
