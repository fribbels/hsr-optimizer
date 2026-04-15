import {
  Button,
  Flex,
  Modal,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useFormOnOpen } from 'lib/overlays/modals/useFormOnOpen'
import { Assets } from 'lib/rendering/assets'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { SearchableCombobox } from 'lib/ui/SearchableCombobox'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { ReactElement } from 'types/components'

export type SwitchRelicsFormSelectedCharacter = {
  key: string,
  label: ReactElement,
  title: string,
  value: CharacterId,
}

const panelWidth = 325 - 47

export function SwitchRelicsModal() {
  const { isOpen, close } = useOpenClose(OpenCloseIDs.SWITCH_RELICS_MODAL)

  return (
    <Modal
      opened={isOpen}
      size={panelWidth + 47}
      centered
      onClose={close}
    >
      {isOpen && <SwitchRelicsModalContent close={close} />}
    </Modal>
  )
}

function SwitchRelicsModalContent({ close }: { close: () => void }) {
  const focusCharacter = useCharacterTabStore((s) => s.focusCharacter)
  const currentCharacter = useCharacterStore((s) => focusCharacter ? s.charactersById[focusCharacter] : null) ?? null
  const characterForm = useForm({ initialValues: { selectedCharacter: null as string | null } })
  const characters = useCharacterStore((s) => s.characters)

  const { t } = useTranslation('modals', { keyPrefix: 'SwitchRelics' })
  const { t: tCommon } = useTranslation('common')
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })

  const characterOptions = useMemo(() =>
    generateCharacterList(
      {
        currentCharacters: characters,
        excludeCharacters: currentCharacter ? [currentCharacter] : [],
        withNobodyOption: false,
        longNameLabel: true,
        longNameTitle: true,
      },
      tCharacters,
    ), [characters, currentCharacter, tCharacters])

  const comboboxOptions = useMemo(() =>
    characterOptions.map((opt) => ({
      value: opt.value,
      label: opt.title ?? opt.value,
      icon: Assets.getCharacterAvatarById(opt.value),
    })), [characterOptions])

  useFormOnOpen(characterForm, () => ({
    selectedCharacter: null,
  }))

  function onModalOk() {
    const { selectedCharacter } = characterForm.getValues()
    CharacterTabController.onSwitchRelicsOk({ value: selectedCharacter as CharacterId } as SwitchRelicsFormSelectedCharacter)
    close()
  }

  return (
    <>
      <div>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('Title') /* Switch relics with character */}</HeaderText>
        </Flex>

        <Flex direction='column' gap={defaultGap}>
          <Flex gap={defaultGap}>
            <SearchableCombobox
              options={comboboxOptions}
              value={characterForm.values.selectedCharacter}
              onChange={(val) => characterForm.setFieldValue('selectedCharacter', val)}
              placeholder={t('Placeholder')}
              style={{ width: panelWidth }}
            />
          </Flex>
        </Flex>
      </div>
      <Flex justify='flex-end' gap={8} style={{ marginTop: 16 }}>
        <Button key='back' variant='default' onClick={close}>
          {tCommon('Cancel') /* Cancel */}
        </Button>
        <Button key='submit' onClick={onModalOk}>
          {tCommon('Save') /* Save */}
        </Button>
      </Flex>
    </>
  )
}
