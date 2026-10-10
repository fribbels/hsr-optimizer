import { Select } from "@mantine/core";
import { labelToString } from "lib/characterPreview/buffsAnalysis/buffUtils";
import { AKey, type AKeyValue, type AKeyType } from "lib/optimization/engine/config/keys";
import { newStatsConfig } from "lib/optimization/engine/config/statsConfig";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const statOptions = (Object.keys(newStatsConfig) as AKeyType[])

function generateStatOptions(): Array<{ value: AKeyValue, label: string }> {
  return statOptions.map((statKey) => {
    const { label } = newStatsConfig[statKey]
    return {
      value: AKey[statKey],
      label: labelToString(label)
    }
  })
}

export function StatSelect({
  value,
  onChange,
  style
}: {
  value: AKeyValue | null
  onChange: (value: AKeyValue | null) => void
  style?: React.CSSProperties
}) {
  const { i18n } = useTranslation()
  const statOptions = useMemo(() => generateStatOptions(), [i18n.resolvedLanguage])

  return (
    <Select
      style={style}
      data={statOptions}
      value={value}
      onChange={onChange}
      clearable
      searchable
      label='Stat'
    />
  )
}