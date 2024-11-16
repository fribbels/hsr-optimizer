import { Flex, Image } from 'antd'
import Rarity from 'lib/characterPreview/Rarity'
import StatText from 'lib/characterPreview/StatText'
import { Assets } from 'lib/rendering/assets'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { DBMetadataCharacter } from 'types/metadata'

export function ShowcaseCharacterHeader(props: {
  characterLevel: number,
  characterEidolon: number,
  characterName: string
  characterPath: string,
  characterElement: string,
  characterMetadata: DBMetadataCharacter
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    characterLevel,
    characterEidolon,
    characterName,
    characterPath,
    characterElement,
    characterMetadata,
  } = props

  return (
    <Flex vertical>
      <Flex justify='space-around' style={{ height: 26, marginBottom: 6 }} align='center'>
        <Image
          preview={false}
          width={32}
          src={Assets.getElement(characterElement)}
        />
        <Rarity rarity={characterMetadata.rarity}/>
        <Image
          preview={false}
          width={32}
          src={Assets.getPathFromClass(characterPath)}
        />
      </Flex>
      <Flex vertical>
        <StatText style={{ fontSize: 24, lineHeight: '30px', fontWeight: 400, textAlign: 'center' }}>
          {characterName}
        </StatText>
        <StatText style={{ fontSize: 16, fontWeight: 400, textAlign: 'center' }}>
          {`${t('common:LevelShort', { level: characterLevel })} ${t('common:EidolonNShort', { eidolon: characterEidolon })}`}
        </StatText>
      </Flex>
    </Flex>
  )
}
