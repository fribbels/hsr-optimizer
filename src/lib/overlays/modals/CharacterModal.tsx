import { Button, Flex, Modal, SegmentedControl, Select } from '@mantine/core'
import iconClasses from 'style/icons.module.css'
import { useForm } from '@mantine/form'
import { useFormOnOpen } from 'lib/hooks/useFormOnOpen'
import { Constants } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { getCharacterById } from 'lib/stores/characterStore'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { LightConeSelect } from 'lib/ui/selectors/LightConeSelect'
import {
  type OptionRender,
  renderTeammateOrnamentSetOptions,
  renderTeammateRelicSetOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/teammateCardUtils'
import { HeaderText } from 'lib/ui/HeaderText'
import {
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type {
  CharacterId,
} from 'types/character'
import type { LightConeId } from 'types/lightCone'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'

export type CharacterModalForm = {
  characterId?: CharacterId | null,
  lightCone?: LightConeId | null,
  characterEidolon: number,
  lightConeSuperimposition: number,
  teamOrnamentSet?: string,
  teamRelicSet?: string,
}

export function CharacterModal() {
  const open = useCharacterModalStore((s) => s.open)
  const closeOverlay = useCharacterModalStore((s) => s.closeOverlay)

  return (
    <Modal
      opened={open}
      size={400}
      centered
      onClose={closeOverlay}
    >
      {open && <CharacterModalContent />}
    </Modal>
  )
}

function CharacterModalContent() {
  const config = useCharacterModalStore((s) => s.config)!
  const closeOverlay = useCharacterModalStore((s) => s.closeOverlay)

  const initialCharacter = config.initialCharacter
  const onOk = config.onOk

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

  const [characterId, setCharacterId] = useState<CharacterId | null | undefined>(initialCharacter?.form.characterId ?? null)

  const teammateRelicSetOptions: OptionRender[] = useMemo(renderTeammateRelicSetOptions(tTeammateCard), [tTeammateCard])
  const teammateOrnamentSetOptions: OptionRender[] = useMemo(renderTeammateOrnamentSetOptions(tTeammateCard), [tTeammateCard])

  useFormOnOpen(characterForm, true, () => {
    setCharacterId(initialCharacter?.form.characterId ?? null)
    return {
      characterId: initialCharacter?.form.characterId,
      characterEidolon: initialCharacter?.form.characterEidolon ?? 0,
      lightCone: initialCharacter?.form.lightCone,
      lightConeSuperimposition: initialCharacter?.form.lightConeSuperimposition ?? 1,
      teamRelicSet: initialCharacter?.form.teamRelicSet,
      teamOrnamentSet: initialCharacter?.form.teamOrnamentSet,
    }
  })

  function onModalOk() {
    onOk(characterForm.getValues())
    closeOverlay()
  }

  const handleCancel = () => {
    closeOverlay()
  }

  return (
    <>
      <div>
        <Flex direction="column" gap={10}>
          <Flex direction="column" gap={5}>
            <HeaderText>{t('Character')}</HeaderText>
            <CharacterSelect
              value={characterForm.getValues().characterId ?? null}
              onChange={(characterId: CharacterId | null) => {
                characterForm.setFieldValue('characterId', characterId ?? undefined)
                setCharacterId(characterId)
                const dbCharacter = getCharacterById(characterId!)
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
              comboboxProps={{ keepMounted: false, width: 'auto' }}
              renderOption={({ option }) => {
                if (!option.value) return option.label
                return (
                  <Flex gap={10} align='center'>
                    <img src={Assets.getSetImage(option.value, Constants.Parts.PlanarSphere)} className={iconClasses.icon26} />
                    {option.label}
                  </Flex>
                )
              }}
              leftSection={(() => {
                const val = characterForm.getValues().teamRelicSet
                return val ? <img src={Assets.getSetImage(val, Constants.Parts.PlanarSphere)} className={iconClasses.icon20} /> : null
              })()}
              disabled={false}
              {...characterForm.getInputProps('teamRelicSet')}
            />

            <Select
              className='teammate-set-select'
              data={teammateOrnamentSetOptions.map((opt) => ({ value: opt.value, label: opt.desc }))}
              placeholder={tTeammateCard('OrnamentsPlaceholder')} // 'Ornaments'
              clearable
              comboboxProps={{ keepMounted: false, width: 'auto' }}
              renderOption={({ option }) => {
                if (!option.value) return option.label
                return (
                  <Flex gap={10} align='center'>
                    <img src={Assets.getSetImage(option.value, Constants.Parts.PlanarSphere)} className={iconClasses.icon26} />
                    {option.label}
                  </Flex>
                )
              }}
              leftSection={(() => {
                const val = characterForm.getValues().teamOrnamentSet
                return val ? <img src={Assets.getSetImage(val, Constants.Parts.PlanarSphere)} className={iconClasses.icon20} /> : null
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
    </>
  )
}
