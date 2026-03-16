import { useForm } from '@mantine/form'
import { Button, Flex, Modal, Select } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
import { useFormOnOpen } from 'lib/hooks/useFormOnOpen'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { getCharacterById, useCharacterStore } from 'lib/stores/characterStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { ReactElement } from 'types/components'

export type SwitchRelicsFormSelectedCharacter = {
  key: string,
  label: ReactElement,
  title: string,
  value: CharacterId,
}

export type SwitchRelicsForm = {
  selectedCharacter: SwitchRelicsFormSelectedCharacter,
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

  useFormOnOpen(characterForm, true, () => ({
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

        <Flex direction="column" gap={defaultGap}>
          <Flex gap={defaultGap}>
            <Select
              searchable
              style={{ width: panelWidth }}
              data={characterOptions.map((opt) => ({ value: opt.value, label: opt.title ?? opt.value }))}
              leftSection={(() => {
                const val = characterForm.getValues().selectedCharacter
                return val ? <img src={Assets.getCharacterAvatarById(val)} className={iconClasses.icon22} /> : null
              })()}
              renderOption={({ option }) => {
                return (
                  <Flex align='center' gap={10}>
                    <img src={Assets.getCharacterAvatarById(option.value)} className={iconClasses.icon22} />
                    {option.label}
                  </Flex>
                )
              }}
              {...characterForm.getInputProps('selectedCharacter')}
            />
          </Flex>
        </Flex>
      </div>
      <Flex justify='flex-end' gap={8} style={{ marginTop: 16 }}>
        <Button key='back' variant="default" onClick={close}>
          {tCommon('Cancel') /* Cancel */}
        </Button>
        <Button key='submit' onClick={onModalOk}>
          {tCommon('Save') /* Save */}
        </Button>
      </Flex>
    </>
  )
}
