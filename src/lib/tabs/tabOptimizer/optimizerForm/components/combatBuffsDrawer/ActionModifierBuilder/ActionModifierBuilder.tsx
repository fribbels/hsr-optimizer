import { Button, Group, NumberInput, Select, Stack } from "@mantine/core"
import { CombatActionModifier, CombatBuff } from "types/form"
import { useShallow } from "zustand/react/shallow"
import { useCombatBuffStore } from "../useCombatBuffsStore"
import { ModifierKindSelect } from "./ModifierKindSelect"
import { optimizerTabDefaultGap } from "../../../grid/optimizerGridColumns"
import { DamageElementSelect } from "./DamageElementSelect"
import { AbilitySelect } from "./AbilitySelect"
import { DamageFunctionType } from "lib/optimization/engine/damage/damageCalculator"
import { Stats } from "lib/constants/constants"
import { arrayIncludes } from "lib/utils/arrayUtils"
import { DamageTag } from "lib/optimization/engine/config/tag"
import { DamageTagSelect } from "../common/DamageTagSelect"
import { newStatsConfig } from "lib/optimization/engine/config/statsConfig"
import { labelToString } from "lib/characterPreview/buffsAnalysis/buffUtils"

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
      {modifierKind === DamageFunctionType.Crit && <CritElements />}
      {modifierKind === DamageFunctionType.Break && <BreakElements />}
      {modifierKind === DamageFunctionType.Elation && <ElationElements />}
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

function CritElements() {
  const {
    critDamageType,
    critScalingStat,
    critScalingValue,
    setCritDamageType,
    setCritScalingStat,
    setCritScalingValue,
  } = useCombatBuffStore(useShallow((s) => ({
    critDamageType: s.critDamageType,
    critScalingStat: s.critScalingStat,
    critScalingValue: s.critScalingValue,
    setCritDamageType: s.setCritDamageType,
    setCritScalingStat: s.setCritScalingStat,
    setCritScalingValue: s.setCritScalingValue,
  })))
  return (
    <Stack>
      <DamageTagSelect
        options={CritModifier.damageTypes}
        value={critDamageType}
        onChange={setCritDamageType}
        label='Damage types'
      />
      <Group>
        <Select
          data={CritModifier.scalingStats.map((stat) => {
            const { label } = newStatsConfig[stat]
            return { value: stat, label: labelToString(label) }
          })}
          value={critScalingStat}
          onChange={setCritScalingStat}
          label='Scaling stat'
        />
        <NumberInput
          value={critScalingValue}
          onChange={setCritScalingValue}
          suffix="%"
          label='Multiplier value'
        />
      </Group>
    </Stack>
  )
}

export namespace CritModifier {
  export const scalingStats = [Stats.HP, Stats.ATK, Stats.DEF] as const
  export type ScalingStat = typeof scalingStats[number]
  export function isScalingStat(stat: unknown): stat is ScalingStat {
    return arrayIncludes(scalingStats, stat)
  }
  export const damageTypes = [
    DamageTag.BASIC,
    DamageTag.SKILL,
    DamageTag.ULT,
    DamageTag.FUA,
    DamageTag.ADDITIONAL,
    DamageTag.ASSIST,
  ] as const
  export type DamageType = typeof damageTypes[number]
  export function isValidDamageType(type: unknown): type is DamageType {
    return arrayIncludes(damageTypes, type)
  }
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

function validateActionModifier(): CombatActionModifier | null {
  //TODO:
  return null
}