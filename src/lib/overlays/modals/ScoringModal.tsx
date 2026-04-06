import { type UseFormReturnType, useForm } from '@mantine/form'
import { Button, CheckIcon, Combobox, Divider, Flex, Modal, MultiSelect, NumberInput } from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  Parts,
  Stats,
  type SubStats,
} from 'lib/constants/constants'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { getScoringMetadata, useScoringStore } from 'lib/stores/scoring/scoringStore'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { VerticalDivider } from 'lib/ui/Dividers'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { ScoringMetadata } from 'types/metadata'
import iconClasses from 'style/icons.module.css'
import classes from 'lib/overlays/modals/ScoringModal.module.css'

const TitleDivider = (props: React.ComponentPropsWithoutRef<typeof Divider>) => (
  <Divider my={10} {...props} />
)

const InputNumberStyled = (props: React.ComponentPropsWithoutRef<typeof NumberInput>) => (
  <NumberInput w={62} {...props} />
)

type ScoringAlgorithmForm = Pick<ScoringMetadata, 'stats' | 'parts' | 'characterId'>

const panelWidth = 220

const statRenderOption: React.ComponentProps<typeof MultiSelect>['renderOption'] = ({ option, checked }) => (
  <Flex align='center' gap={10} justify='space-between' w='100%'>
    <Flex align='center' gap={10}>
      <img src={Assets.getStatIcon(option.value, true)} className={iconClasses.icon22} />
      {option.label}
    </Flex>
    {checked && <CheckIcon size={12} />}
  </Flex>
)

// Cleans up 0's to not show up on the form
// Uses empty string instead of null — react-number-format treats null as "use internal state"
// which causes stale values to persist when switching characters
function getScoringValuesForDisplay(scoringMetadata: ScoringMetadata): ScoringAlgorithmForm {
  const scoringMetadataForForm: ScoringAlgorithmForm = { ...scoringMetadata, stats: { ...scoringMetadata.stats } }
  for (const x of Object.entries(scoringMetadataForForm.stats)) {
    if (x[1] === 0) {
      // @ts-expect-error - Setting stat weight to '' for display (form shows empty instead of 0)
      scoringMetadataForForm.stats[x[0]] = ''
    }
  }
  return scoringMetadataForForm
}

function StatValueRow({ stat, form }: { stat: SubStats, form: UseFormReturnType<ScoringAlgorithmForm> }) {
  const { t } = useTranslation('common')
  return (
    <Flex style={{ width: panelWidth }} align='center' gap={5}>
      <InputNumberStyled
        hideControls
        min={0}
        max={1}
        {...form.getInputProps(`stats.${stat}`)}
      />
      <Flex>
        <img src={Assets.getStatIcon(stat)} className={classes.statIcon}></img>
        <div className={classes.statText}>
          {t(`ReadableStats.${stat}`)}
        </div>
      </Flex>
    </Flex>
  )
}

function ResetAllCharactersButton({ focusCharacter, form }: {
  focusCharacter: CharacterId | null | undefined,
  form: UseFormReturnType<ScoringAlgorithmForm>,
}) {
  const { t } = useTranslation(['modals', 'common'])

  const resetAllCharacters = () => {
    const charactersById = useCharacterStore.getState().charactersById
    for (const character of Object.keys(charactersById) as CharacterId[]) {
      const defaultScoringMetadata = getGameMetadata().characters[character].scoringMetadata
      const scoringMetadataToMerge: Partial<ScoringMetadata> = {
        stats: { ...defaultScoringMetadata.stats },
        parts: { ...defaultScoringMetadata.parts },
      }
      useScoringStore.getState().updateCharacterOverrides(character, scoringMetadataToMerge)
    }
    SaveState.delayedSave()

    // Update values for current screen
    if (focusCharacter) {
      const defaultScoringMetadata = getGameMetadata().characters[focusCharacter].scoringMetadata
      const displayScoringMetadata = getScoringValuesForDisplay(defaultScoringMetadata)
      form.setValues(displayScoringMetadata)
    }
  }

  return (
    <Button
      color="red"
      onClick={() => modals.openConfirmModal({
        title: t('Scoring.ResetAllConfirm.Title'),
        children: t('Scoring.ResetAllConfirm.Description'),
        labels: { confirm: t('common:Yes'), cancel: t('common:No') },
        centered: true,
        onConfirm: resetAllCharacters,
      })}
    >
      {t('Scoring.Footer.ResetAll') /* Reset all characters */}
    </Button>
  )
}

export function ScoringModal() {
  const { close: closeScoringModal, isOpen: isOpenScoringModal } = useOpenClose(OpenCloseIDs.SCORING_MODAL)

  return (
    <Modal
      opened={isOpenScoringModal}
      size={1000}
      centered
      onClose={closeScoringModal}
    >
      {isOpenScoringModal && <ScoringModalContent close={closeScoringModal} />}
    </Modal>
  )
}

function ScoringModalContent({ close }: { close: () => void }) {
  const { t } = useTranslation(['modals', 'common'])

  const scoringAlgorithmForm = useForm<ScoringAlgorithmForm>({
    initialValues: {
      stats: {} as ScoringAlgorithmForm['stats'],
      parts: {} as ScoringAlgorithmForm['parts'],
      characterId: '' as CharacterId,
    },
  })

  const scoringAlgorithmFocusCharacter = useGlobalStore((s) => s.scoringAlgorithmFocusCharacter)
  const setScoringAlgorithmFocusCharacter = useGlobalStore((s) => s.setScoringAlgorithmFocusCharacter)

  function characterSelectorChange(id: CharacterId | null) {
    setScoringAlgorithmFocusCharacter(id)
  }

  useEffect(() => {
    const id = scoringAlgorithmFocusCharacter
    if (id) {
      const scoringMetadata = getScoringValuesForDisplay(getScoringMetadata(id))
      scoringMetadata.characterId = id
      scoringAlgorithmForm.setValues(scoringMetadata)
    }
  }, [scoringAlgorithmFocusCharacter])

  function onModalOk() {
    const values = scoringAlgorithmForm.getValues()
    onFinish(values)
    close()
  }

  const onFinish = (scoringMetadata: Partial<ScoringMetadata>) => {
    if (!scoringAlgorithmFocusCharacter) return

    const stats = { ...scoringMetadata.stats! }
    stats[Stats.ATK_P] = stats[Stats.ATK]
    stats[Stats.DEF_P] = stats[Stats.DEF]
    stats[Stats.HP_P] = stats[Stats.HP]

    useScoringStore.getState().updateCharacterOverrides(scoringAlgorithmFocusCharacter, { ...scoringMetadata, stats })
    SaveState.delayedSave()
  }

  const handleResetDefault = () => {
    if (!scoringAlgorithmFocusCharacter) return

    const defaultScoringMetadata = getGameMetadata().characters[scoringAlgorithmFocusCharacter].scoringMetadata
    const displayScoringMetadata = getScoringValuesForDisplay(defaultScoringMetadata)
    const scoringMetadataToMerge: Partial<ScoringMetadata> = {
      stats: { ...defaultScoringMetadata.stats },
      parts: { ...defaultScoringMetadata.parts },
    }

    scoringAlgorithmForm.setValues(displayScoringMetadata)
    useScoringStore.getState().updateCharacterOverrides(scoringAlgorithmFocusCharacter, scoringMetadataToMerge); SaveState.delayedSave()
  }

  const previewSrc = scoringAlgorithmFocusCharacter ? Assets.getCharacterPreviewById(scoringAlgorithmFocusCharacter) : Assets.getBlank()

  const defaultGap = 5
  const selectWidth = '100%'

  return (
    <>
      <div>
        <TitleDivider label={t('Scoring.StatWeightsHeader') /* Stat weights */} labelPosition='center' />

        <Flex gap={20}>
          <Flex direction="column" gap={5}>
            <CharacterSelect
              value={scoringAlgorithmForm.getValues().characterId || null}
              onChange={characterSelectorChange}
              showIcon={false}
              clearable={false}
            />
            <div className={classes.previewContainer} style={{ height: 230, width: panelWidth }}>
              <img src={previewSrc} style={{ width: panelWidth }} />
            </div>
          </Flex>

          <VerticalDivider />

          <Flex direction="column" style={{ flex: 1 }}>
            <Flex justify='space-between'>
              <Flex direction="column" gap={defaultGap * 2} style={{ width: '100%' }}>
                <Flex direction="column" gap={1}>
                  <div className={classes.partLabel}>
                    {t('common:Parts.Body')}
                  </div>
                  <MultiSelect
                    className={classes.partMultiSelect}
                    clearable
                    style={{ width: selectWidth }}
                    placeholder={t('common:Parts.Body')}
                    renderOption={statRenderOption}
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

                <Flex direction="column" gap={1}>
                  <div className={classes.partLabel}>
                    {t('common:Parts.Feet')}
                  </div>
                  <MultiSelect
                    className={classes.partMultiSelect}
                    clearable
                    style={{ width: selectWidth }}
                    placeholder={t('common:Parts.Feet')}
                    renderOption={statRenderOption}
                    data={[
                      { value: Stats.HP_P, label: t(`common:Stats.${Stats.HP_P}`) },
                      { value: Stats.ATK_P, label: t(`common:Stats.${Stats.ATK_P}`) },
                      { value: Stats.DEF_P, label: t(`common:Stats.${Stats.DEF_P}`) },
                      { value: Stats.SPD, label: t(`common:Stats.${Stats.SPD}`) },
                    ]}
                    {...scoringAlgorithmForm.getInputProps(`parts.${Parts.Feet}`)}
                  />
                </Flex>

                <Flex direction="column" gap={1}>
                  <div className={classes.partLabel}>
                    {t('common:Parts.PlanarSphere')}
                  </div>
                  <MultiSelect
                    className={classes.partMultiSelect}
                    clearable
                    style={{ width: selectWidth }}
                    placeholder={t('common:Parts.PlanarSphere')}
                    maxDropdownHeight={400}
                    renderOption={statRenderOption}
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

                <Flex direction="column" gap={1}>
                  <div className={classes.partLabel}>
                    {t('common:Parts.LinkRope')}
                  </div>
                  <MultiSelect
                    className={classes.partMultiSelect}
                    clearable
                    style={{ width: selectWidth }}
                    placeholder={t('common:Parts.LinkRope')}
                    renderOption={statRenderOption}
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
            <StatValueRow stat={Stats.ATK} form={scoringAlgorithmForm} />
            <StatValueRow stat={Stats.HP} form={scoringAlgorithmForm} />
            <StatValueRow stat={Stats.DEF} form={scoringAlgorithmForm} />
            <StatValueRow stat={Stats.SPD} form={scoringAlgorithmForm} />
            <StatValueRow stat={Stats.CR} form={scoringAlgorithmForm} />
            <StatValueRow stat={Stats.CD} form={scoringAlgorithmForm} />
            <StatValueRow stat={Stats.EHR} form={scoringAlgorithmForm} />
            <StatValueRow stat={Stats.RES} form={scoringAlgorithmForm} />
            <StatValueRow stat={Stats.BE} form={scoringAlgorithmForm} />
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
        <Button key='back' variant="default" onClick={close}>
          {t('common:Cancel') /* Cancel */}
        </Button>
        <Button key='default' variant="default" onClick={handleResetDefault}>
          {t('Scoring.Footer.Reset') /* Reset to default */}
        </Button>
        <ResetAllCharactersButton key='resetAll' focusCharacter={scoringAlgorithmFocusCharacter} form={scoringAlgorithmForm} />
        <Button key='submit' onClick={onModalOk}>
          {t('Scoring.Footer.Save') /* Save changes */}
        </Button>
      </Flex>
    </>
  )
}
