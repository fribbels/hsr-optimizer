import { useForm } from '@mantine/form'
import { PopConfirm } from 'lib/ui/PopConfirm'
import { Button, Divider, Flex, Modal, MultiSelect, NumberInput, Text } from '@mantine/core'
import { usePublish } from 'hooks/usePublish'
import {
  Constants,
  Parts,
  Stats,
} from 'lib/constants/constants'
import {
  SetsOrnaments,
  SetsOrnamentsNames,
  SetsRelics,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import { getGameMetadata } from 'lib/state/gameMetadata'
import DB, { useGlobalStore } from 'lib/state/db'
import { useCharacterStore } from 'lib/stores/characterStore'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { VerticalDivider } from 'lib/ui/Dividers'
import { TsUtils } from 'lib/utils/TsUtils'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { ScoringMetadata } from 'types/metadata'
import classes from './ScoringModal.module.css'

const TitleDivider = (props: React.ComponentPropsWithoutRef<typeof Divider>) => (
  <Divider my={10} {...props} />
)

const InputNumberStyled = (props: React.ComponentPropsWithoutRef<typeof NumberInput>) => (
  <NumberInput w={62} {...props} />
)

type ScoringAlgorithmForm = Pick<ScoringMetadata, 'stats' | 'parts' | 'characterId'> & {
  relicsList?: [string, number][]
  ornamentsList?: [string, number][]
}

function SetPicker(props: {
  placeholder: string,
  names: string[],
  selectedValues: string[],
  add: (value: string) => void,
  remove: (value: string) => void,
}) {
  return (
    <MultiSelect
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
      data={[...props.names].reverse().map((set) => ({
        value: set,
        label: set,
      }))}
      renderOption={({ option }) => (
        <Flex gap={5}>
          <img src={Assets.getSetImage(option.value, Constants.Parts.Head)} className={classes.setPickerIcon}></img>
          {option.label}
        </Flex>
      )}
      searchable
      value={props.selectedValues}
    />
  )
}

export default function ScoringModal() {
  const { t } = useTranslation(['modals', 'common'])

  const scoringAlgorithmForm = useForm<ScoringAlgorithmForm>({
    initialValues: {
      stats: {} as ScoringAlgorithmForm['stats'],
      parts: {} as ScoringAlgorithmForm['parts'],
      characterId: '' as CharacterId,
      relicsList: [],
      ornamentsList: [],
    },
  })

  const scoringAlgorithmFocusCharacter = useGlobalStore((s) => s.scoringAlgorithmFocusCharacter)
  const setScoringAlgorithmFocusCharacter = useGlobalStore((s) => s.setScoringAlgorithmFocusCharacter)

  const { close: closeScoringModal, isOpen: isOpenScoringModal } = useOpenClose(OpenCloseIDs.SCORING_MODAL)

  function characterSelectorChange(id: CharacterId | null | undefined) {
    setScoringAlgorithmFocusCharacter(id)
  }

  // Cleans up 0's to not show up on the form
  function getScoringValuesForDisplay(scoringMetadata: ScoringMetadata) {
    scoringMetadata = TsUtils.clone(scoringMetadata)

    const scoringMetadataForForm: ScoringAlgorithmForm = {
      ...scoringMetadata,
    }

    for (const x of Object.entries(scoringMetadataForForm.stats)) {
      if (x[1] == 0) {
        // @ts-ignore
        scoringMetadataForForm.stats[x[0]] = null
      }
    }

    return scoringMetadataForForm
  }

  function getScoringValuesForOverrides(scoringMetadata: ScoringAlgorithmForm) {
    return scoringMetadata
  }

  useEffect(() => {
    const id = scoringAlgorithmFocusCharacter
    if (id) {
      let scoringMetadata = getScoringValuesForDisplay(DB.getScoringMetadata(id))
      scoringMetadata.characterId = id
      scoringAlgorithmForm.setValues(scoringMetadata)

      // console.log('Scoring modal opening set as:', scoringMetadata)
    }
  }, [scoringAlgorithmFocusCharacter, isOpenScoringModal])

  const panelWidth = 220
  const defaultGap = 5
  const selectWidth = 260

  function StatValueRow(props: { stat: string }) {
    return (
      <Flex justify='flex-start' style={{ width: panelWidth }} align='center' gap={5}>
        <InputNumberStyled
          hideControls
          size='xs'
          min={0}
          max={1}
          {...scoringAlgorithmForm.getInputProps(`stats.${props.stat}`)}
        />
        <Flex>
          <img src={Assets.getStatIcon(props.stat)} className={classes.statIcon}></img>
          <Text className={classes.statText}>
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
    const values = scoringAlgorithmForm.getValues()
    onFinish(getScoringValuesForOverrides(values))
    closeScoringModal()
  }

  const onFinish = (scoringMetadata: Partial<ScoringMetadata>) => {
    if (!scoringAlgorithmFocusCharacter) return

    scoringMetadata.stats![Stats.ATK_P] = scoringMetadata.stats![Stats.ATK]
    scoringMetadata.stats![Stats.DEF_P] = scoringMetadata.stats![Stats.DEF]
    scoringMetadata.stats![Stats.HP_P] = scoringMetadata.stats![Stats.HP]

    DB.updateCharacterScoreOverrides(scoringAlgorithmFocusCharacter, scoringMetadata)
  }

  const handleResetDefault = () => {
    if (!scoringAlgorithmFocusCharacter) return

    const defaultScoringMetadata = getGameMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata
    const displayScoringMetadata = getScoringValuesForDisplay(defaultScoringMetadata)
    const scoringMetadataToMerge: Partial<ScoringMetadata> = {
      stats: defaultScoringMetadata.stats,
      parts: defaultScoringMetadata.parts,
    }

    scoringAlgorithmForm.setValues(displayScoringMetadata)
    DB.updateCharacterScoreOverrides(scoringAlgorithmFocusCharacter, scoringMetadataToMerge)
  }

  function ResetAllCharactersButton() {
    const resetAllCharacters = () => {
      const charactersById = useCharacterStore.getState().charactersById
      for (const character of Object.keys(charactersById) as CharacterId[]) {
        const defaultScoringMetadata = getGameMetadata().characters[character].scoringMetadata
        const scoringMetadataToMerge: Partial<ScoringMetadata> = {
          stats: defaultScoringMetadata.stats,
          parts: defaultScoringMetadata.parts,
        }
        DB.updateCharacterScoreOverrides(character, scoringMetadataToMerge)
      }

      // Update values for current screen
      if (scoringAlgorithmFocusCharacter) {
        const defaultScoringMetadata = getGameMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata
        const displayScoringMetadata = getScoringValuesForDisplay(defaultScoringMetadata)
        scoringAlgorithmForm.setValues(displayScoringMetadata)
      }
    }

    return (
      <PopConfirm
        title={t('Scoring.ResetAllConfirm.Title') /* Reset the scoring algorithm for all characters? */}
        description={t('Scoring.ResetAllConfirm.Description') /* You will lose any custom scoring settings you have set on any character. */}
        onConfirm={resetAllCharacters}
        okText={t('common:Yes') /* Yes */}
        cancelText={t('common:No') /* No */}
      >
        <Button color="red">{t('Scoring.Footer.ResetAll') /* Reset all characters */}</Button>
      </PopConfirm>
    )
  }

  const previewSrc = scoringAlgorithmFocusCharacter ? Assets.getCharacterPreviewById(scoringAlgorithmFocusCharacter) : Assets.getBlank()

  const relicsList = scoringAlgorithmForm.getValues().relicsList ?? []
  const ornamentsList = scoringAlgorithmForm.getValues().ornamentsList ?? []

  return (
    <Modal
      opened={isOpenScoringModal}
      size={900}
      centered
      onClose={closeScoringModal}
    >
      <div>
        <TitleDivider label={t('Scoring.StatWeightsHeader') /* Stat weights */} labelPosition='center' />

        <Flex gap={20}>
          <Flex direction="column" gap={5}>
            <CharacterSelect
              value={scoringAlgorithmForm.getValues().characterId || null}
              selectStyle={{}}
              onChange={characterSelectorChange}
            />
            <div className={classes.previewContainer} style={{ height: 230, width: panelWidth }}>
              <img src={previewSrc} style={{ width: panelWidth }} />
            </div>
          </Flex>

          <VerticalDivider />

          <Flex direction="column">
            <Flex justify='space-between'>
              <Flex direction="column" gap={defaultGap * 2}>
                <Flex direction="column" gap={1} justify='flex-start'>
                  <Text className={classes.partLabel}>
                    {t('common:Parts.Body')}
                  </Text>
                  <MultiSelect
                    clearable
                    style={{
                      width: selectWidth,
                    }}
                    placeholder={t('common:Parts.Body')}
                    data={[
                      { value: Stats.HP_P, label: t(`common:Stats.${Stats.HP_P}`) },
                      { value: Stats.ATK_P, label: t(`common:Stats.${Stats.ATK_P}`) },
                      { value: Stats.DEF_P, label: t(`common:Stats.${Stats.DEF_P}`) },
                      { value: Stats.CR, label: t(`common:Stats.${Stats.CR}`) },
                      { value: Stats.CD, label: t(`common:Stats.${Stats.CD}`) },
                      { value: Stats.OHB, label: t(`common:Stats.${Stats.OHB}`) },
                      { value: Stats.EHR, label: t(`common:Stats.${Stats.EHR}`) },
                    ]}
                    {...scoringAlgorithmForm.getInputProps(`parts.${Parts.Body}`)}
                  />
                </Flex>

                <Flex direction="column" gap={1} justify='flex-start'>
                  <Text className={classes.partLabel}>
                    {t('common:Parts.Feet')}
                  </Text>
                  <MultiSelect
                    clearable
                    style={{
                      width: selectWidth,
                    }}
                    placeholder={t('common:Parts.Feet')}
                    data={[
                      { value: Stats.HP_P, label: t(`common:Stats.${Stats.HP_P}`) },
                      { value: Stats.ATK_P, label: t(`common:Stats.${Stats.ATK_P}`) },
                      { value: Stats.DEF_P, label: t(`common:Stats.${Stats.DEF_P}`) },
                      { value: Stats.SPD, label: t(`common:Stats.${Stats.SPD}`) },
                    ]}
                    {...scoringAlgorithmForm.getInputProps(`parts.${Parts.Feet}`)}
                  />
                </Flex>
                <Flex direction="column" gap={1} justify='flex-start'>
                  <Text className={classes.partLabel}>
                    {t('common:Parts.PlanarSphere')}
                  </Text>
                  <MultiSelect
                    clearable
                    style={{
                      width: selectWidth,
                    }}
                    placeholder={t('common:Parts.PlanarSphere')}
                    maxDropdownHeight={400}
                    data={[
                      { value: Stats.HP_P, label: t(`common:Stats.${Stats.HP_P}`) },
                      { value: Stats.ATK_P, label: t(`common:Stats.${Stats.ATK_P}`) },
                      { value: Stats.DEF_P, label: t(`common:Stats.${Stats.DEF_P}`) },
                      { value: Stats.Physical_DMG, label: t(`common:Stats.${Stats.Physical_DMG}`) },
                      { value: Stats.Fire_DMG, label: t(`common:Stats.${Stats.Fire_DMG}`) },
                      { value: Stats.Ice_DMG, label: t(`common:Stats.${Stats.Ice_DMG}`) },
                      { value: Stats.Lightning_DMG, label: t(`common:Stats.${Stats.Lightning_DMG}`) },
                      { value: Stats.Wind_DMG, label: t(`common:Stats.${Stats.Wind_DMG}`) },
                      { value: Stats.Quantum_DMG, label: t(`common:Stats.${Stats.Quantum_DMG}`) },
                      { value: Stats.Imaginary_DMG, label: t(`common:Stats.${Stats.Imaginary_DMG}`) },
                    ]}
                    {...scoringAlgorithmForm.getInputProps(`parts.${Parts.PlanarSphere}`)}
                  />
                </Flex>

                <Flex direction="column" gap={1} justify='flex-start'>
                  <Text className={classes.partLabel}>
                    {t('common:Parts.LinkRope')}
                  </Text>

                  <MultiSelect
                    clearable
                    style={{
                      width: selectWidth,
                    }}
                    placeholder={t('common:Parts.LinkRope')}
                    data={[
                      { value: Stats.HP_P, label: t(`common:Stats.${Stats.HP_P}`) },
                      { value: Stats.ATK_P, label: t(`common:Stats.${Stats.ATK_P}`) },
                      { value: Stats.DEF_P, label: t(`common:Stats.${Stats.DEF_P}`) },
                      { value: Stats.BE, label: t(`common:Stats.${Stats.BE}`) },
                      { value: Stats.ERR, label: t(`common:Stats.${Stats.ERR}`) },
                    ]}
                    {...scoringAlgorithmForm.getInputProps(`parts.${Parts.LinkRope}`)}
                  />
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <VerticalDivider />

          <Flex direction="column" gap={3}>
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

        <Flex gap={20} style={{display: 'none'}}>
          <Flex direction="column" gap={20} flex={1}>
            {(() => {
              const selectedValues = relicsList.map((field: [string, number]) => field[0])
              return (
                <>
                  <SetPicker
                    names={SetsRelicsNames}
                    add={(v) => {
                      scoringAlgorithmForm.setFieldValue('relicsList', [...relicsList, [v, 1]])
                    }}
                    remove={(v) => {
                      const index = selectedValues.indexOf(v)
                      if (index !== -1) {
                        scoringAlgorithmForm.setFieldValue(
                          'relicsList',
                          relicsList.filter((_, i) => i !== index),
                        )
                      }
                    }}
                    placeholder={t('Scoring.SetWeights.AddRelicSetPlaceholder' /* Add relic set */)}
                    selectedValues={selectedValues}
                  />

                  <Flex wrap="wrap" gap={20}>
                    {relicsList.map((item, index) => {
                      const set = item[0]
                      return (
                        <Flex key={index} direction="column" gap={5} align='center'>
                          <img src={Assets.getSetImage(set, Constants.Parts.Head)} className={classes.setItemIcon}></img>
                          <InputNumberStyled
                            hideControls
                            size='xs'
                            min={0}
                            max={1}
                            {...scoringAlgorithmForm.getInputProps(`relicsList.${index}.1`)}
                          />
                        </Flex>
                      )
                    })}
                  </Flex>
                </>
              )
            })()}
          </Flex>

          <VerticalDivider />

          <Flex direction="column" gap={20} flex={1}>
            {(() => {
              const selectedValues = ornamentsList.map((field: [string, number]) => field[0])
              return (
                <>
                  <SetPicker
                    names={SetsOrnamentsNames}
                    add={(v) => {
                      scoringAlgorithmForm.setFieldValue('ornamentsList', [...ornamentsList, [v, 1]])
                    }}
                    remove={(v) => {
                      const index = selectedValues.indexOf(v)
                      if (index !== -1) {
                        scoringAlgorithmForm.setFieldValue(
                          'ornamentsList',
                          ornamentsList.filter((_, i) => i !== index),
                        )
                      }
                    }}
                    placeholder={t('Scoring.SetWeights.AddOrnamentSetPlaceholder' /* Add ornament set */)}
                    selectedValues={selectedValues}
                  />

                  <Flex wrap="wrap" gap={20}>
                    {ornamentsList.map((item, index) => {
                      const set = item[0]
                      return (
                        <Flex key={index} direction="column" gap={5} align='center'>
                          <img src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)} className={classes.setItemIcon}></img>
                          <InputNumberStyled
                            hideControls
                            size='xs'
                            min={0}
                            max={1}
                            {...scoringAlgorithmForm.getInputProps(`ornamentsList.${index}.1`)}
                          />
                        </Flex>
                      )
                    })}
                  </Flex>
                </>
              )
            })()}
          </Flex>
        </Flex>

        <Divider
          className={classes.bottomDivider}
          label={
            <ColorizedLinkWithIcon
              text={t('Scoring.WeightMethodology.Header')}
              linkIcon={true}
              url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md'
            />
          }
          labelPosition='center'
        />
      </div>
      <Flex justify='flex-end' gap={8} className={classes.footerActions}>
        <Button key='back' variant="default" onClick={closeScoringModal}>
          {t('common:Cancel') /* Cancel */}
        </Button>
        <Button key='default' variant="default" onClick={handleResetDefault}>
          {t('Scoring.Footer.Reset') /* Reset to default */}
        </Button>
        <ResetAllCharactersButton key='resetAll' />
        <Button key='submit' onClick={onModalOk}>
          {t('Scoring.Footer.Save') /* Save changes */}
        </Button>
      </Flex>
    </Modal>
  )
}
