import { useMemo } from 'react'
import type { SetConfig } from 'types/setConfig'
import { SetRow } from './SetRow'
import classes from './RelicSetFilterModal.module.css'

export function SetGrid({ configs, checkedNames, onToggle, search }: {
  configs: SetConfig[]
  checkedNames: Set<string>
  onToggle: (name: string) => void
  search: string
}) {
  const columns = useMemo(() => {
    const cols: SetConfig[][] = [[], [], [], []]
    configs.forEach((c, i) => cols[i % 4].push(c))
    return cols
  }, [configs])

  const q = search.toLowerCase()

  return (
    <div className={classes.setGrid}>
      {columns.map((col, ci) => (
        <div key={ci} className={classes.gridColumn}>
          {col.map((config) => (
            <SetRow
              key={config.id}
              config={config}
              checked={checkedNames.has(config.id)}
              dimmed={!!search && !config.id.toLowerCase().includes(q)}
              onToggle={onToggle}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
