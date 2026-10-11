import { Button, Group, NumberInput, Stack } from "@mantine/core"
import { CombatActionModifier, CombatBuff } from "types/form"
import { useShallow } from "zustand/react/shallow"
import { useCombatBuffStore } from "../useCombatBuffsStore"
import { ModifierKindSelect } from "./ModifierKindSelect"
import { optimizerTabDefaultGap } from "../../../grid/optimizerGridColumns"
import { DamageElementSelect } from "./DamageElementSelect"
import { AbilitySelect } from "./AbilitySelect"
import { DamageFunctionType } from "lib/optimization/engine/damage/damageCalculator"

export function ActionModifierBuilder({
  addBuff,
  hidden,
}: {
  addBuff: (buff: CombatBuff) => void,
  hidden: boolean,
}) {
  const {
    modifierKind,
    setModifierKind,
    damageElement,
    setDamageElement,
    abilityTargets,
    setAbilityTargets,
  } = useCombatBuffStore(useShallow((s) => ({
    modifierKind: s.modifierKind,
    setModifierKind: s.setModifierKind,
    damageElement: s.damageElement,
    setDamageElement: s.setDamageElement,
    abilityTargets: s.abilityTargets,
    setAbilityTargets: s.setAbilityTargets,
  })))
  return (
    <Stack gap={optimizerTabDefaultGap} style={{ display: hidden ? 'none' : undefined }}>
      <Group wrap="nowrap">
        <ModifierKindSelect value={modifierKind} onChange={setModifierKind} />
        <DamageElementSelect value={damageElement} onChange={setDamageElement} />
      </Group>
      <AbilitySelect value={abilityTargets} onChange={setAbilityTargets} />
      {modifierKind === DamageFunctionType.Elation && <ElationElements />}
      {modifierKind === DamageFunctionType.Break && <BreakElements />}
      <Button
        onClick={() => {
          const modifier = validateActionModifier()
          if (!modifier) return
          addBuff(modifier)
        }}
      >
        Apply modifier
      </Button>
    </Stack>
  )
}

function ElationElements() {
  const {
    elationScaling,
    setElationScaling,
    punchlineStacks,
    setPunchlineStacks
  } = useCombatBuffStore(useShallow((s) => ({
    elationScaling: s.elationScaling,
    setElationScaling: s.setElationScaling,
    punchlineStacks: s.punchlineStacks,
    setPunchlineStacks: s.setPunchlineStacks,
  })))
  return (
    <Group>
      <NumberInput
        value={elationScaling}
        onChange={setElationScaling}
        label='Elation scaling'
        min={0}
        suffix="%"
        flex={1}
      />
      <NumberInput
        value={punchlineStacks}
        onChange={setPunchlineStacks}
        label='Scaling value'
        min={0}
        allowDecimal={false}
        flex={1}
      />
    </Group>
  )
}

function BreakElements() {
  const {
    breakScaling,
    setBreakScaling,
  } = useCombatBuffStore(useShallow((s) => ({
    breakScaling: s.breakScaling,
    setBreakScaling: s.setBreakScaling
  })))
  return (
    <NumberInput value={breakScaling} onChange={setBreakScaling} suffix="%" label='Break scaling' />
  )
}

function validateActionModifier(): CombatActionModifier | null {
  //TODO:
  return null
}