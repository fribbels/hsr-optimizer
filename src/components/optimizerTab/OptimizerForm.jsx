import { Form, Image } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Optimizer } from 'lib/optimizer/optimizer'
import { Constants } from 'lib/constants.ts'
import { FormRow, OptimizerMenuIds, TeammateFormRow } from 'components/optimizerTab/FormRow'
import FilterContainer from 'components/optimizerTab/FilterContainer'
import FormCard from 'components/optimizerTab/FormCard'
import OptimizerOptionsDisplay from 'components/optimizerTab/OptimizerOptionsDisplay.tsx'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { SaveState } from 'lib/saveState'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { getDefaultForm } from 'lib/defaultForm'
import { FormSetConditionals } from 'components/optimizerTab/FormSetConditionals'
import { Assets } from 'lib/assets'
import DB from 'lib/db'
import { Utils } from 'lib/utils.js'
import { CharacterConditionalDisplay } from 'components/optimizerForm/conditionals/CharacterConditionalDisplay'
import { LightConeConditionalDisplay } from 'components/optimizerForm/conditionals/LightConeConditionalDisplay'
import TeammateCard from 'components/optimizerTab/TeammateCard'
import CharacterSelectorDisplay from 'components/optimizerTab/CharacterSelectorDisplay.tsx'
import EnemyOptionsDisplay from 'components/optimizerTab/EnemyOptionsDisplay'
import RelicMainSetFilters from 'components/optimizerTab/RelicMainSetFilters'
import { SubstatWeightFilters } from 'components/optimizerTab/SubstatWeightFilters'
import { MinMaxRatingFilters, MinMaxStatFilters } from 'components/optimizerTab/ResultFilters'
import { CombatBuffsFilters } from 'components/optimizerTab/CombatBuffsFilters'

let panelWidth = 203
let defaultGap = 5

export default function OptimizerForm() {
  console.log('======================================================================= RENDER OptimizerForm')
  const [optimizerForm] = Form.useForm()
  window.optimizerForm = window.optimizerForm = optimizerForm

  // hooks
  const characterEidolon = Form.useWatch('characterEidolon', optimizerForm)
  const lightCone = Form.useWatch('lightCone', optimizerForm)
  const lightConeSuperimposition = Form.useWatch('lightConeSuperimposition', optimizerForm)
  const [selectedLightCone, setSelectedLightCone] = useState({ id: 'None', name: 'Light Cone' })
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)
  const setOptimizerTabFocusCharacter = window.store((s) => s.setOptimizerTabFocusCharacter)
  const setOptimizationInProgress = window.store((s) => s.setOptimizationInProgress)
  const characterOptions = useMemo(() => Utils.generateCharacterOptions(), [])
  const lightConeOptions = useMemo(() => Utils.generateLightConeOptions(optimizerTabFocusCharacter), [optimizerTabFocusCharacter])

  useEffect(() => {
    OptimizerTabController.changeCharacter(optimizerTabFocusCharacter, setSelectedLightCone)
  }, [optimizerTabFocusCharacter])

  const characterSelectorChange = useCallback((id) => {
    setOptimizerTabFocusCharacter(id)
  }, [setOptimizerTabFocusCharacter])

  const lightConeSelectorChange = useCallback((id) => {
    setSelectedLightCone(lightConeOptions.find((x) => x.id == id))
    OptimizerTabController.changeCharacter(optimizerTabFocusCharacter, setSelectedLightCone, id)
  }, [lightConeOptions, optimizerTabFocusCharacter])

  useEffect(() => {
    let lcFn = LightConeConditionals.get(optimizerForm.getFieldsValue())
    let form = optimizerForm.getFieldsValue()
    let defaults = lcFn.defaults()
    let lightConeForm = form.lightConeConditionals || {}

    // We can't apply the form to dynamically generated elements, so we use an effect to set the form value to default
    // Only if there's a missing field (TODO: Possibly out of date - verify if this is still true)
    Object.assign(defaults, lightConeForm)
    console.log('useMemo lcFn.defaults()', defaults, lcFn.defaults(), lightConeForm)
    console.log(lcFn.defaults.valueOf())

    if (lightCone === '21034') { // Today Is Another Peaceful Day
      defaults.maxEnergyStacks = Math.min(160, DB.getMetadata().characters[optimizerTabFocusCharacter].max_sp)
    }

    optimizerForm.setFieldValue('lightConeConditionals', defaults)
  }, [optimizerTabFocusCharacter, lightCone, lightConeSuperimposition])

  const initialCharacter = useMemo(() => {
    console.log('@initialCharacter')
    let characters = DB.getCharacters() // retrieve instance localStore saved chars

    if (optimizerTabFocusCharacter) {
      return characters.find((x) => x.id == optimizerTabFocusCharacter)
    }

    if (characters && characters.length > 0) {
      let character = characters[0]
      lightConeSelectorChange(character.form.lightCone)
      setOptimizerTabFocusCharacter(character.id)
      return characterOptions.find((x) => x.id == character.id)
    }
  }, [optimizerTabFocusCharacter, lightConeSelectorChange, setOptimizerTabFocusCharacter, characterOptions])

  const initialValues = useMemo(() => {
    if (optimizerTabFocusCharacter) {
      const matchingCharacter = DB.getCharacterById(optimizerTabFocusCharacter)

      if (matchingCharacter) {
        if (matchingCharacter?.form?.lightCone) {
          setSelectedLightCone(lightConeOptions.find((x) => x.id == matchingCharacter.form.lightCone))
        } else {
          console.warn(`@OptimizerForm.initialValues: No character form found for ${optimizerTabFocusCharacter}`, matchingCharacter)
        }
        return OptimizerTabController.getDisplayFormValues(matchingCharacter.form)
      } else {
        // TODO: render-cycle flows through this before DB.getCharacterById() returns the character
        // console.warn(`@OptimizerForm.initialValues: No character found for ${optimizerTabFocusCharacter}`);
      }
    }

    return getDefaultForm(initialCharacter)
    // We only want to update this once for the initial character
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCharacter])

  useEffect(() => {
    onValuesChange({}, initialValues)
  }, [initialValues])

  const onValuesChange = (changedValues, allValues, bypass) => {
    if (!changedValues || !allValues || !allValues.characterId) return
    let keys = Object.keys(changedValues)
    if (bypass) {
      // Allow certain values to refresh permutations.
      // Sliders should only update at the end of the drag
    } else if (keys.length == 1 && (
      keys[0].startsWith('min')
      || keys[0].startsWith('max')
      || keys[0].startsWith('buff')
      || keys[0].startsWith('weights')
      || keys[0].startsWith('statDisplay')
      || keys[0].startsWith('teammate')
      || keys[0] == 'characterConditionals'
      || keys[0] == 'lightConeConditionals')) {
      return
    }
    const request = allValues

    console.log('@onValuesChange', request, changedValues)

    // Add any new characters to the list
    if (!DB.getCharacterById(allValues.characterId)) {
      DB.addFromForm(allValues)
    }

    // If the rank changes, re-order the characters priority list
    if (changedValues.rank != null && DB.getCharacterById(allValues.characterId).rank != allValues.rank) {
      DB.insertCharacter(allValues.characterId, allValues.rank)
      DB.refreshCharacters()
    }

    const [relics, preFilteredRelicsByPart] = Optimizer.getFilteredRelics(request, allValues.characterId)

    const permutationDetails = {
      Head: relics.Head.length,
      Hands: relics.Hands.length,
      Body: relics.Body.length,
      Feet: relics.Feet.length,
      PlanarSphere: relics.PlanarSphere.length,
      LinkRope: relics.LinkRope.length,
      HeadTotal: preFilteredRelicsByPart[Constants.Parts.Head].length,
      HandsTotal: preFilteredRelicsByPart[Constants.Parts.Hands].length,
      BodyTotal: preFilteredRelicsByPart[Constants.Parts.Body].length,
      FeetTotal: preFilteredRelicsByPart[Constants.Parts.Feet].length,
      PlanarSphereTotal: preFilteredRelicsByPart[Constants.Parts.PlanarSphere].length,
      LinkRopeTotal: preFilteredRelicsByPart[Constants.Parts.LinkRope].length,
    }
    window.store.getState().setPermutationDetails(permutationDetails)
    window.store.getState().setPermutations(relics.Head.length * relics.Hands.length * relics.Body.length * relics.Feet.length * relics.PlanarSphere.length * relics.LinkRope.length)
  }
  window.onOptimizerFormValuesChange = onValuesChange

  let parentW = 233
  let parentH = 350
  let innerW = 350
  let innerH = 400

  function cancelClicked() {
    console.log('Cancel clicked')
    setOptimizationInProgress(false)
    Optimizer.cancel(window.store.getState().optimizationId)
  }
  window.optimizerCancelClicked = cancelClicked

  function resetClicked() {
    console.log('Reset clicked')
    OptimizerTabController.resetFilters()
  }
  window.optimizerResetClicked = resetClicked

  function filterClicked() {
    console.log('Filter clicked')
    OptimizerTabController.applyRowFilters()
  }
  window.optimizerFilterClicked = filterClicked

  function startClicked() {
    console.log('Start clicked')

    /*
     * We dont actually want to submit the form as it would kick off a re-render
     * Intercept the event and just call the optimizer directly
     */
    const form = optimizerForm.getFieldsValue()

    OptimizerTabController.fixForm(form)
    if (!OptimizerTabController.validateForm(form)) {
      return
    }

    document.getElementById('optimizerGridContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' })

    DB.addFromForm(form)
    SaveState.save()

    let optimizationId = Utils.randomId()
    window.store.getState().setOptimizationId(optimizationId)
    form.optimizationId = optimizationId
    form.statDisplay = window.store.getState().statDisplay

    console.log('Form finished', form)

    setOptimizationInProgress(true)
    Optimizer.optimize(form)
  }
  window.optimizerStartClicked = startClicked

  return (
    <div style={{ position: 'relative' }}>
      <Form
        form={optimizerForm}
        layout="vertical"
        onValuesChange={onValuesChange}
        initialValues={initialValues}
      >
        <FormSetConditionals />

        <FilterContainer>
          <FormRow id={OptimizerMenuIds.characterOptions}>
            {/* Character portrait card */}

            <FormCard style={{ overflow: 'hidden' }}>
              <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px' }}>
                <Image
                  preview={false}
                  width={innerW}
                  src={Assets.getCharacterPreviewById(optimizerTabFocusCharacter)}
                  style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)` }}
                />
              </div>
            </FormCard>

            {/* Character/lc selector card */}

            <FormCard>
              <CharacterSelectorDisplay
                characterOptions={characterOptions}
                characterSelectorChange={characterSelectorChange}
                lightConeOptions={lightConeOptions}
                lightConeSelectorChange={lightConeSelectorChange}
              />
            </FormCard>

            {/* Character conditionals card */}

            <FormCard>
              <CharacterConditionalDisplay
                id={optimizerTabFocusCharacter}
                eidolon={characterEidolon}
              />
            </FormCard>

            {/* Light cone conditionals card */}

            <FormCard justify="space-between">
              <LightConeConditionalDisplay
                id={selectedLightCone?.id}
                superImposition={lightConeSuperimposition}
              />

              <EnemyOptionsDisplay />
            </FormCard>

            {/* Optimizer options card */}

            <FormCard>
              <OptimizerOptionsDisplay
                defaultGap={defaultGap}
                panelWidth={panelWidth}
              />
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
              <CombatBuffsFilters />
            </FormCard>
          </FormRow>

          <TeammateFormRow id={OptimizerMenuIds.teammates}>
            <TeammateCard index={0} />
            <TeammateCard index={1} />
            <TeammateCard index={2} />
          </TeammateFormRow>
        </FilterContainer>
      </Form>
    </div>
  )
}
