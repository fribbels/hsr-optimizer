import {
  Button,
  Divider,
  Flex,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Typography,
} from 'antd'
import { usePublish } from 'hooks/usePublish'
import {
  Constants,
  Parts,
  Sets,
  SetsOrnaments,
  SetsOrnamentsNames,
  SetsRelics,
  SetsRelicsNames,
  Stats,
} from 'lib/constants/constants'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { VerticalDivider } from 'lib/ui/Dividers'
import { TsUtils } from 'lib/utils/TsUtils'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { CharacterId } from 'types/character'
import { ScoringMetadata } from 'types/metadata'

const { Text } = Typography

const TitleDivider = styled(Divider)`
    margin-top: 10px !important;
    margin-bottom: 10px !important;
`

const InputNumberStyled = styled(InputNumber)`
    width: 62px
`

type ScoringAlgorithmForm = Pick<ScoringMetadata, 'stats' | 'parts' | 'characterId' | 'sets'> & {
  relicsList: [Sets, number][],
  ornamentsList: [Sets, number][],
}

function SetPicker(props: {
  placeholder: string,
  names: string[],
  selectedValues: string[],
  add: (value: string) => void,
  remove: (value: string) => void,
}) {
  return (
    <Select
      mode='multiple'
      style={{ width: '100%' }}
      placeholder={props.placeholder}
      onChange={(values) => {
        // Find values that were added
        const newValues = values.filter((v) => !props.selectedValues.includes(v))
        // Find values that were removed
        const removedValues = props.selectedValues.filter((v) => !values.includes(v))

        // Add new values
        if (newValues.length > 0) {
          props.add(newValues[0])
        }

        // Remove deleted values
        if (removedValues.length > 0) {
          props.remove(removedValues[0])
        }
      }}
      maxTagCount='responsive'
      options={props.names.map((set) => ({
        value: set,
        label: (
          <Flex gap={5}>
            <img src={Assets.getSetImage(set, Constants.Parts.Head)} style={{ width: 24, height: 24 }}></img>
            {set}
          </Flex>
        ),
      })).reverse()}
      filterOption={(input, option) => (option?.value ?? '').toLowerCase().includes(input.toLowerCase())}
      value={props.selectedValues}
    />
  )
}

export default function ScoringModal() {
  const { t } = useTranslation(['modals', 'common'])

  const [scoringAlgorithmForm] = Form.useForm<ScoringAlgorithmForm>()

  const scoringAlgorithmFocusCharacter = window.store((s) => s.scoringAlgorithmFocusCharacter)
  const setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)

  const { close: closeScoringModal, isOpen: isOpenScoringModal } = useOpenClose(OpenCloseIDs.SCORING_MODAL)

  function characterSelectorChange(id: CharacterId | null | undefined) {
    setScoringAlgorithmFocusCharacter(id)
  }

  // Cleans up 0's to not show up on the form
  function getScoringValuesForDisplay(scoringMetadata: ScoringMetadata) {
    scoringMetadata = TsUtils.clone(scoringMetadata)
    const sets = Object.entries(scoringMetadata.sets ?? {}) as [Sets, number][]

    const scoringMetadataWithSetsList: ScoringAlgorithmForm = {
      ...scoringMetadata,
      relicsList: sets.filter((set) => SetsRelicsNames.includes(set[0] as SetsRelics)),
      ornamentsList: sets.filter((set) => SetsOrnamentsNames.includes(set[0] as SetsOrnaments)),
    }

    for (const x of Object.entries(scoringMetadataWithSetsList.stats)) {
      if (x[1] == 0) {
        // @ts-ignore
        scoringMetadataWithSetsList.stats[x[0]] = null
      }
    }

    return scoringMetadataWithSetsList
  }

  function getScoringValuesForOverrides(scoringMetadata: ScoringAlgorithmForm) {
    // Merge the setsList into the sets object
    scoringMetadata.sets = Object.fromEntries(scoringMetadata.relicsList.concat(scoringMetadata.ornamentsList))

    // don't want to pollute the metadata object with the set lists
    const { relicsList, ornamentsList, ...metadataToMerge } = scoringMetadata

    return metadataToMerge
  }

  useEffect(() => {
    const id = scoringAlgorithmFocusCharacter
    if (id) {
      let scoringMetadata = getScoringValuesForDisplay(DB.getScoringMetadata(id))
      scoringMetadata.characterId = id
      scoringAlgorithmForm.setFieldsValue(scoringMetadata)

      // console.log('Scoring modal opening set as:', scoringMetadata)
    }
  }, [scoringAlgorithmFocusCharacter, isOpenScoringModal, scoringAlgorithmForm])

  const panelWidth = 220
  const defaultGap = 5
  const selectWidth = 260

  function StatValueRow(props: { stat: string }) {
    return (
      <Flex justify='flex-start' style={{ width: panelWidth }} align='center' gap={5}>
        <Form.Item name={['stats', props.stat]}>
          <InputNumberStyled controls={false} size='small' min={0} max={1} />
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

  function onModalOk() {
    const values = scoringAlgorithmForm.getFieldsValue()
    console.log('onModalOk OK', values)
    onFinish(getScoringValuesForOverrides(values))
    closeScoringModal()
  }

  const onFinish = (scoringMetadata: Partial<ScoringMetadata>) => {
    if (!scoringAlgorithmFocusCharacter) return

    console.log('Form finished', scoringMetadata)
    scoringMetadata.stats![Stats.ATK_P] = scoringMetadata.stats![Stats.ATK]
    scoringMetadata.stats![Stats.DEF_P] = scoringMetadata.stats![Stats.DEF]
    scoringMetadata.stats![Stats.HP_P] = scoringMetadata.stats![Stats.HP]

    DB.updateCharacterScoreOverrides(scoringAlgorithmFocusCharacter, scoringMetadata)
  }

  const handleResetDefault = () => {
    if (!scoringAlgorithmFocusCharacter) return

    const defaultScoringMetadata = DB.getMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata
    const displayScoringMetadata = getScoringValuesForDisplay(defaultScoringMetadata)
    const scoringMetadataToMerge: Partial<ScoringMetadata> = {
      stats: defaultScoringMetadata.stats,
      parts: defaultScoringMetadata.parts,
      sets: defaultScoringMetadata.sets,
    }

    scoringAlgorithmForm.setFieldsValue(displayScoringMetadata)
    DB.updateCharacterScoreOverrides(scoringAlgorithmFocusCharacter, scoringMetadataToMerge)
  }

  function ResetAllCharactersButton() {
    const resetAllCharacters = () => {
      console.log('Reset the scoring algorithm for all characters')
      const charactersById = useCharacterTabStore.getState().charactersById
      for (const character of Object.keys(charactersById) as CharacterId[]) {
        const defaultScoringMetadata = DB.getMetadata().characters[character].scoringMetadata
        const scoringMetadataToMerge: Partial<ScoringMetadata> = {
          stats: defaultScoringMetadata.stats,
          parts: defaultScoringMetadata.parts,
          sets: defaultScoringMetadata.sets,
        }
        DB.updateCharacterScoreOverrides(character, scoringMetadataToMerge)
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
        title={t('Scoring.ResetAllConfirm.Title') /* Reset the scoring algorithm for all characters? */}
        description={t('Scoring.ResetAllConfirm.Description') /* You will lose any custom scoring settings you have set on any character. */}
        onConfirm={resetAllCharacters}
        okText={t('common:Yes') /* Yes */}
        cancelText={t('common:No') /* No */}
      >
        <Button danger>{t('Scoring.Footer.ResetAll') /* Reset all characters */}</Button>
      </Popconfirm>
    )
  }

  const previewSrc = scoringAlgorithmFocusCharacter ? Assets.getCharacterPreviewById(scoringAlgorithmFocusCharacter) : Assets.getBlank()

  return (
    <Modal
      open={isOpenScoringModal}
      width={900}
      destroyOnClose
      centered
      forceRender
      onOk={onModalOk}
      onCancel={closeScoringModal}
      footer={[
        <Button key='back' onClick={closeScoringModal}>
          {t('common:Cancel') /* Cancel */}
        </Button>,
        <Button key='default' onClick={handleResetDefault}>
          {t('Scoring.Footer.Reset') /* Reset to default */}
        </Button>,
        <ResetAllCharactersButton key='resetAll' />,
        <Button key='submit' type='primary' onClick={onModalOk}>
          {t('Scoring.Footer.Save') /* Save changes */}
        </Button>,
      ]}
    >
      <Form
        form={scoringAlgorithmForm}
        preserve={false}
        layout='vertical'
      >
        <TitleDivider>{t('Scoring.StatWeightsHeader') /* Stat weights */}</TitleDivider>

        <Flex gap={20}>
          <Flex vertical gap={5}>
            <Form.Item name='characterId'>
              <CharacterSelect
                value={null}
                selectStyle={{}}
                onChange={characterSelectorChange}
              />
            </Form.Item>
            <div style={{ height: 230, width: panelWidth, overflow: 'hidden' }}>
              <img src={previewSrc} style={{ width: panelWidth }} />
            </div>
          </Flex>

          <VerticalDivider />

          <Flex vertical>
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
          </Flex>

          <VerticalDivider />

          <Flex vertical gap={3}>
            <StatValueRow stat={Stats.ATK} />
            <StatValueRow stat={Stats.HP} />
            <StatValueRow stat={Stats.DEF} />
            <StatValueRow stat={Stats.SPD} />
            <StatValueRow stat={Stats.CR} />
            <StatValueRow stat={Stats.CD} />
            <StatValueRow stat={Stats.EHR} />
            <StatValueRow stat={Stats.RES} />
            <StatValueRow stat={Stats.BE} />
          </Flex>
        </Flex>

        <TitleDivider>{t('Scoring.SetWeightsHeader') /* Set weights */} {'(EXPERIMENTAL)'}</TitleDivider>

        <Flex gap={20}>
          <Flex vertical gap={20} flex={1}>
            <Form.List name='relicsList'>
              {(fields, { add, remove }) => (
                <>
                  <Form.Item
                    noStyle
                    shouldUpdate
                  >
                    {(x) => {
                      const selectedValues = x.getFieldsValue()['relicsList']?.map((field: [string, number]) => field[0])
                      return (
                        <SetPicker
                          names={SetsRelicsNames}
                          add={(v) => add([v, 1])}
                          remove={(v) => {
                            const index = selectedValues.indexOf(v)
                            if (index !== -1) {
                              remove(index)
                            }
                          }}
                          placeholder={t('Scoring.SetWeights.AddRelicSetPlaceholder' /* Add relic set */)}
                          selectedValues={selectedValues}
                        />
                      )
                    }}
                  </Form.Item>

                  <Flex wrap gap={20}>
                    {fields.map((field) => (
                      <Form.Item
                        key={field.key}
                        noStyle
                        shouldUpdate
                      >
                        {(x) => {
                          const set = x.getFieldsValue()['relicsList'][field.name][0]
                          return (
                            <Flex vertical gap={5} align='center'>
                              <img src={Assets.getSetImage(set, Constants.Parts.Head)} style={{ width: 48, height: 48 }}></img>
                              <Form.Item
                                name={[field.name, 1]}
                              >
                                <InputNumberStyled controls={false} size='small' min={0} max={1} />
                              </Form.Item>
                            </Flex>
                          )
                        }}
                      </Form.Item>
                    ))}
                  </Flex>
                </>
              )}
            </Form.List>
          </Flex>

          <VerticalDivider />

          <Flex vertical gap={20} flex={1}>
            <Form.List name='ornamentsList'>
              {(fields, { add, remove }) => (
                <>
                  <Form.Item
                    noStyle
                    shouldUpdate
                  >
                    {(x) => {
                      const selectedValues = x.getFieldsValue()['ornamentsList']?.map((field: [string, number]) => field[0])
                      return (
                        <SetPicker
                          names={SetsOrnamentsNames}
                          add={(v) => add([v, 1])}
                          remove={(v) => {
                            const index = selectedValues.indexOf(v)
                            if (index !== -1) {
                              remove(index)
                            }
                          }}
                          placeholder={t('Scoring.SetWeights.AddOrnamentSetPlaceholder' /* Add ornament set */)}
                          selectedValues={selectedValues}
                        />
                      )
                    }}
                  </Form.Item>

                  <Flex wrap gap={20}>
                    {fields.map((field) => (
                      <Form.Item
                        key={field.key}
                        noStyle
                        shouldUpdate
                      >
                        {(x) => {
                          const set = x.getFieldsValue()['ornamentsList'][field.name][0]
                          return (
                            <Flex vertical gap={5} align='center'>
                              <img src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)} style={{ width: 48, height: 48 }}></img>
                              <Form.Item
                                name={[field.name, 1]}
                              >
                                <InputNumberStyled controls={false} size='small' min={0} max={1} />
                              </Form.Item>
                            </Flex>
                          )
                        }}
                      </Form.Item>
                    ))}
                  </Flex>
                </>
              )}
            </Form.List>
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
