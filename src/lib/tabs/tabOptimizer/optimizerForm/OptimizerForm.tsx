import { Flex } from '@mantine/core'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { generateConditionalResolverMetadata } from 'lib/optimization/combo/comboInitializers'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  getCharacterById,
  useCharacterStore,
} from 'lib/stores/character/characterStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { CharacterConditionalsDisplay } from 'lib/tabs/tabOptimizer/conditionals/CharacterConditionalsDisplay'
import { LightConeConditionalDisplay } from 'lib/tabs/tabOptimizer/conditionals/LightConeConditionalDisplay'
import { AdvancedOptionsPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/AdvancedOptionsPanel'
import { CharacterSelectorDisplay } from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelectorDisplay'
import { ComboFilters } from 'lib/tabs/tabOptimizer/optimizerForm/components/ComboFilter'
import { OptimizerOptionsDisplay } from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerOptionsDisplay'
import { OptimizerTabCharacterPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerTabCharacterPanel'
import { RelicMainSetFilters } from 'lib/tabs/tabOptimizer/optimizerForm/components/RelicMainSetFilters'
import {
  MinMaxRatingFilters,
  MinMaxStatFilters,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/ResultFilters'
import { StatSimulationDisplay } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { SubstatWeightFilters } from 'lib/tabs/tabOptimizer/optimizerForm/components/SubstatWeightFilters'
import { TeammateCard } from 'lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard'
import { FilterContainer } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FilterContainer'
import { FormCard } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import {
  FormRow,
  TeammateFormRow,
} from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormRow'
import { OptimizerMenuIds } from 'lib/tabs/tabOptimizer/optimizerForm/layout/optimizerMenuIds'
import { updateCharacter } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { DeferCreate } from 'lib/ui/DeferredRender'
import { mergeDefinedValues } from 'lib/utils/objectUtils'
import {
  memo,
  useEffect,
  useMemo,
} from 'react'
import type { DBMetadata } from 'types/metadata'

export function OptimizerForm() {
  // On first load, load from last session, else display the first character from the roster
  useEffect(() => {
    const characters = useCharacterStore.getState().characters || []
    const savedSessionCharacterId = useGlobalStore.getState().savedSession[SavedSessionKeys.optimizerCharacterId]
    updateCharacter(savedSessionCharacterId ?? characters[0]?.id)
  }, [])

  const dbMetadata = useMemo(() => getGameMetadata(), [])

  return (
    <div style={{ position: 'relative' }}>
      <FilterContainer>
        <FormRow id={OptimizerMenuIds.characterOptions}>
          <OptimizerTabCharacterPanel />

          <FormCard>
            <CharacterSelectorDisplay />
          </FormCard>

          <FormCard>
            <CharacterConditionalDisplayWrapper />
          </FormCard>

          <FormCard justify='space-between'>
            <LightConeConditionalDisplayWrapper metadata={dbMetadata} />
          </FormCard>

          <FormCard>
            <OptimizerOptionsDisplay />
          </FormCard>
        </FormRow>

        <FormRow id={OptimizerMenuIds.relicAndStatFilters}>
          <FormCard>
            <RelicMainSetFilters />
          </FormCard>

          <FormCard>
            <SubstatWeightFilters />
          </FormCard>

          <FormCard>
            <MinMaxStatFilters />
          </FormCard>

          <FormCard>
            <MinMaxRatingFilters />
          </FormCard>

          <FormCard>
            <ComboFilters />
          </FormCard>
        </FormRow>

        <TeammateFormRow id={OptimizerMenuIds.teammates}>
          <TeammateCard index={0} dbMetadata={dbMetadata} />
          <TeammateCard index={1} dbMetadata={dbMetadata} />
          <TeammateCard index={2} dbMetadata={dbMetadata} />
        </TeammateFormRow>

        <DeferCreate>
          <FormRow id={OptimizerMenuIds.characterStatsSimulation}>
            <StatSimulationDisplay />
          </FormRow>
        </DeferCreate>
      </FilterContainer>
    </div>
  )
}

// Wrap these and use local state to limit rerenders
const CharacterConditionalDisplayWrapper = memo(function CharacterConditionalDisplayWrapper() {
  const charId = useOptimizerRequestStore((s) => s.characterId)
  const eidolon = useOptimizerRequestStore((s) => s.characterEidolon)

  return (
    <CharacterConditionalsDisplay
      id={charId}
      eidolon={eidolon}
    />
  )
})

const LightConeConditionalDisplayWrapper = memo(function LightConeConditionalDisplayWrapper({ metadata }: { metadata: DBMetadata }) {
  const lcId = useOptimizerRequestStore((s) => s.lightCone)
  const superimposition = useOptimizerRequestStore((s) => s.lightConeSuperimposition)
  const charId = useOptimizerRequestStore((s) => s.characterId)

  // Hook into light cone changes to set defaults
  useEffect(() => {
    if (!charId || !lcId) return

    const conditionalResolverMetadata = generateConditionalResolverMetadata({
      characterId: charId,
      characterEidolon: 0, // Assuming eidolon is not needed for light cone metadata
      lightCone: lcId,
      lightConeSuperimposition: superimposition,
    }, metadata)
    const controller = LightConeConditionalsResolver.get(conditionalResolverMetadata)
    const defaults = { ...controller.defaults() }
    const lightConeForm = getCharacterById(charId)?.form.lightConeConditionals || {}
    mergeDefinedValues(defaults, lightConeForm)

    useOptimizerRequestStore.getState().setLightConeConditionals(defaults)
  }, [lcId, superimposition, charId])

  return (
    <Flex direction='column' justify='space-between' style={{ height: '100%', marginBottom: 8 }}>
      <LightConeConditionalDisplay
        id={lcId}
        superImposition={superimposition}
        dbMetadata={metadata}
      />
      <AdvancedOptionsPanel />
    </Flex>
  )
})
