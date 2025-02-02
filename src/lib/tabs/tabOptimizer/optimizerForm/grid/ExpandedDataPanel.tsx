import { CustomCellRendererProps } from 'ag-grid-react'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'

export function ExpandedDataPanel(props: CustomCellRendererProps<OptimizerDisplayDataStatSim>) {
  const string = props.data?.id
  return (
    <div>id = {string}</div>
  )
}
