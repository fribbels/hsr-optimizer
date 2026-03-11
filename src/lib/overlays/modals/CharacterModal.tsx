import { Button, Flex, Modal, SegmentedControl, Select } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Constants } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import LightConeSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import {
  OptionRender,
  renderTeammateOrnamentSetOptions,
  renderTeammateRelicSetOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard'
import { HeaderText } from 'lib/ui/HeaderText'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  Character,
  CharacterId,
} from 'types/character'
import { Form } from 'types/form'
import { LightConeId } from 'types/lightCone'

export type CharacterModalForm = {
  characterId?: CharacterId,
  lightCone?: LightConeId,
  characterEidolon: number,
  lightConeSuperimposition: number,
  teamOrnamentSet?: string,
  teamRelicSet?: string,
}

export default function CharacterModal(props: {
  open: boolean,
  onOk: (form: Form) => void,
  setOpen: (open: boolean) => void,
  initialCharacter?: Character | null,
}) {
  const characterForm = useForm<CharacterModalForm>({
    initialValues: {
      characterId: undefined,
      lightCone: undefined,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
      teamOrnamentSet: undefined,
      teamRelicSet: undefined,
    },
  })

  const { t } = useTranslation('modals', { keyPrefix: 'EditCharacter' })
  const { t: tCommon } = useTranslation('common')
  const { t: tTeammateCard } = useTranslation('optimizerTab', { keyPrefix: 'TeammateCard' })

  const [characterId, setCharacterId] = useState<CharacterId | null | undefined>(props.initialCharacter?.form.characterId ?? null)
  const [eidolon] = useState(props.initialCharacter?.form.characterEidolon ?? 0)
  const [superimposition, setSuperimposition] = useState(props.initialCharacter?.form.lightConeSuperimposition ?? 1)

  const teammateRelicSetOptions: OptionRender[] = useMemo(renderTeammateRelicSetOptions(tTeammateCard), [tTeammateCard])
  const teammateOrnamentSetOptions: OptionRender[] = useMemo(renderTeammateOrnamentSetOptions(tTeammateCard), [tTeammateCard])

  useEffect(() => {
    if (!props.open) return

    const defaultValues: CharacterModalForm = {
      characterId: props.initialCharacter?.form.characterId,
      characterEidolon: props.initialCharacter?.form.characterEidolon ?? 0,
      lightCone: props.initialCharacter?.form.lightCone,
      lightConeSuperimposition: props.initialCharacter?.form.lightConeSuperimposition ?? 1,
      teamRelicSet: props.initialCharacter?.form.teamRelicSet,
      teamOrnamentSet: props.initialCharacter?.form.teamOrnamentSet,
    }

    setCharacterId(props.initialCharacter?.form.characterId ?? null)

    characterForm.setValues(defaultValues)
  }, [props.open])

  function onModalOk() {
    const formValues = characterForm.getValues() as unknown as Form
    props.onOk(formValues)
    props.setOpen(false)
  }

  const handleCancel = () => {
    props.setOpen(false)
  }

  return (
    <Modal
      opened={props.open}
      size={400}
      centered
      onClose={handleCancel}
    >
      <div>
        <Flex direction="column" gap={10}>
          <Flex direction="column" gap={5}>
            <HeaderText>{t('Character')}</HeaderText>
            <CharacterSelect
              value={characterForm.getValues().characterId ?? null}
              withIcon={true}
              onChange={(characterId: CharacterId | null | undefined) => {
                characterForm.setFieldValue('characterId', characterId ?? undefined)
                setCharacterId(characterId)
                const dbCharacter = DB.getCharacterById(characterId!)
                const eidolonPreselect = characterId?.startsWith('80') ? 6 : (dbCharacter?.form?.characterEidolon ?? 0)
                const lightConePreselect = dbCharacter?.form?.lightCone ?? undefined
                const lightConeSuperimpositionPreselect = dbCharacter?.form?.lightConeSuperimposition ?? 1
                characterForm.setFieldValue('characterEidolon', eidolonPreselect)
                characterForm.setFieldValue('lightCone', lightConePreselect)
                characterForm.setFieldValue('lightConeSuperimposition', lightConeSuperimpositionPreselect)
              }}
            />
            <SegmentedControl
              fullWidth
              value={String(characterForm.getValues().characterEidolon ?? 0)}
              onChange={(val: string) => characterForm.setFieldValue('characterEidolon', Number(val))}
              data={[
                { label: t('EidolonButton', { eidolon: 0 }), value: '0' },
                { label: t('EidolonButton', { eidolon: 1 }), value: '1' },
                { label: t('EidolonButton', { eidolon: 2 }), value: '2' },
                { label: t('EidolonButton', { eidolon: 3 }), value: '3' },
                { label: t('EidolonButton', { eidolon: 4 }), value: '4' },
                { label: t('EidolonButton', { eidolon: 5 }), value: '5' },
                { label: t('EidolonButton', { eidolon: 6 }), value: '6' },
              ]}
            />
          </Flex>

          <Flex direction="column" gap={5}>
            <HeaderText>{t('Lightcone')}</HeaderText>
            <LightConeSelect
              value={characterForm.getValues().lightCone ?? null}
              withIcon={true}
              characterId={characterId}
              onChange={(lightCone) => {
                characterForm.setFieldValue('lightCone', lightCone ?? undefined)
                characterForm.setFieldValue('lightConeSuperimposition', 1)
              }}
            />
            <SegmentedControl
              fullWidth
              value={String(characterForm.getValues().lightConeSuperimposition ?? 1)}
              onChange={(val: string) => {
                setSuperimposition(Number(val))
                characterForm.setFieldValue('lightConeSuperimposition', Number(val))
              }}
              data={[
                { label: t('SuperimpositionButton', { superimposition: 1 }), value: '1' },
                { label: t('SuperimpositionButton', { superimposition: 2 }), value: '2' },
                { label: t('SuperimpositionButton', { superimposition: 3 }), value: '3' },
                { label: t('SuperimpositionButton', { superimposition: 4 }), value: '4' },
                { label: t('SuperimpositionButton', { superimposition: 5 }), value: '5' },
              ]}
            />
          </Flex>

          <Flex direction="column" gap={5}>
            <HeaderText>{t('Sets')}</HeaderText>

            <Select
              className='teammate-set-select'
              data={teammateRelicSetOptions.map((opt) => ({ value: opt.value, label: opt.desc }))}
              placeholder={tTeammateCard('RelicsPlaceholder')} // 'Relics'
              clearable
              comboboxProps={{ width: 'auto' }}
              renderOption={({ option }) => {
                if (!option.value) return option.label
                return (
                  <Flex gap={10} align='center'>
                    <img src={Assets.getSetImage(option.value, Constants.Parts.PlanarSphere)} style={{ width: 26, height: 26 }} />
                    {option.label}
                  </Flex>
                )
              }}
              leftSection={(() => {
                const val = characterForm.getValues().teamRelicSet
                return val ? <img src={Assets.getSetImage(val, Constants.Parts.PlanarSphere)} style={{ width: 20, height: 20 }} /> : null
              })()}
              disabled={false}
              {...characterForm.getInputProps('teamRelicSet')}
            />

            <Select
              className='teammate-set-select'
              data={teammateOrnamentSetOptions.map((opt) => ({ value: opt.value, label: opt.desc }))}
              placeholder={tTeammateCard('OrnamentsPlaceholder')} // 'Ornaments'
              clearable
              comboboxProps={{ width: 'auto' }}
              renderOption={({ option }) => {
                if (!option.value) return option.label
                return (
                  <Flex gap={10} align='center'>
                    <img src={Assets.getSetImage(option.value, Constants.Parts.PlanarSphere)} style={{ width: 26, height: 26 }} />
                    {option.label}
                  </Flex>
                )
              }}
              leftSection={(() => {
                const val = characterForm.getValues().teamOrnamentSet
                return val ? <img src={Assets.getSetImage(val, Constants.Parts.PlanarSphere)} style={{ width: 20, height: 20 }} /> : null
              })()}
              disabled={false}
              {...characterForm.getInputProps('teamOrnamentSet')}
            />
          </Flex>
        </Flex>
      </div>
      <Flex justify='flex-end' gap={8} style={{ marginTop: 16 }}>
        <Button key='back' onClick={handleCancel}>
          {tCommon('Cancel')}
        </Button>
        <Button key='submit' onClick={onModalOk}>
          {tCommon('Save')}
        </Button>
      </Flex>
    </Modal>
  )
}


