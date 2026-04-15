import { Flex } from '@mantine/core'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Hint } from 'lib/interactions/hint'
import { generateConditionalResolverMetadata } from 'lib/optimization/combo/comboInitializers'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { DisplayFormControl } from 'lib/tabs/tabOptimizer/conditionals/DisplayFormControl'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type {
  LightConeId,
  SuperImpositionLevel,
} from 'types/lightCone'
import type { DBMetadata } from 'types/metadata'

interface LightConeConditionalDisplayProps {
  id?: LightConeId
  superImposition: SuperImpositionLevel
  teammateIndex?: number
  dbMetadata: DBMetadata
}

export const LightConeConditionalDisplay = memo(
  function LightConeConditionalDisplay({ id, superImposition, teammateIndex, dbMetadata }: LightConeConditionalDisplayProps) {
    const { t } = useTranslation('optimizerTab')

    const wearerId: CharacterId = useOptimizerRequestStore((s) =>
      teammateIndex == null
        ? s.characterId!
        : s.teammates[teammateIndex as 0 | 1 | 2].characterId!
    )

    const conditionalResolverMetadata = generateConditionalResolverMetadata({
      characterId: wearerId,
      characterEidolon: 0, // Assuming eidolon is not needed for light cone metadata
      lightCone: id!,
      lightConeSuperimposition: superImposition,
    }, dbMetadata)
    const lightCone = LightConeConditionalsResolver.get(conditionalResolverMetadata, true)

    const content = teammateIndex != null
      ? (lightCone.teammateContent ? lightCone.teammateContent() : undefined)
      : lightCone.content()

    return (
      <Flex direction='column' gap={5}>
        {(teammateIndex == null) && (
          <Flex justify='space-between' align='center'>
            <HeaderText>{t('LightconePassives') /* Light cone passives */}</HeaderText>
            <TooltipImage type={Hint.lightConePassives()} />
          </Flex>
        )}
        <DisplayFormControl content={content} teammateIndex={teammateIndex} />
      </Flex>
    )
  },
)
