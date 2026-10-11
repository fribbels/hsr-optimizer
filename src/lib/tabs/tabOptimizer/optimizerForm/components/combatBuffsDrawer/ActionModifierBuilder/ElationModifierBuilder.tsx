import { Group, NumberInput } from "@mantine/core"
import { useCombatBuffStore } from "../useCombatBuffsStore"
import { useShallow } from "zustand/react/shallow"

export function ElationModifierBuilder({ }: ElationModifierBuilder.Props) {
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
      />
      <NumberInput
        value={punchlineStacks}
        onChange={setPunchlineStacks}
        label='Scaling value'
        min={0}
        allowDecimal={false}
      />
    </Group>
  )
}

export namespace ElationModifierBuilder {
  export type Props = {}
}