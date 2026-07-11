import { Pela } from 'lib/conditionals/character/1100/Pela'
import { MortenaxBlade } from 'lib/conditionals/character/1500/MortenaxBlade'
import {
  applyScoringMetadataPresets,
} from 'lib/conditionals/evaluation/applyPresets'
import { Sets } from 'lib/constants/constants'
import { defaultSetConditionals } from 'lib/optimization/defaultForm'
import { Metadata } from 'lib/state/metadataInitializer'
import { clone } from 'lib/utils/objectUtils'
import type { Form } from 'types/form'
import {
  describe,
  expect,
  it,
} from 'vitest'

Metadata.initialize()

function buildPelaForm() {
  return {
    characterId: Pela.id,
    setConditionals: clone(defaultSetConditionals),
  } as Form
}

describe('applyPresets', () => {
  it('does not apply teammate-gated scoring metadata presets without matching teammates', () => {
    const form = buildPelaForm()

    applyScoringMetadataPresets(form, [])

    expect(form.setConditionals[Sets.TheAshblazingGrandDuke][1]).toBe(
      defaultSetConditionals[Sets.TheAshblazingGrandDuke][1],
    )
  })

  it('applies teammate-gated scoring metadata presets with matching teammates', () => {
    const form = buildPelaForm()

    applyScoringMetadataPresets(form, [{ id: MortenaxBlade.id, eidolon: 2 }])

    expect(form.setConditionals[Sets.TheAshblazingGrandDuke][1]).toBe(5)
  })
})
