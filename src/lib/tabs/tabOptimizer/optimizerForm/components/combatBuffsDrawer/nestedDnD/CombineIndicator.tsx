import { PropsWithChildren } from "react";

export function CombineIndicator({ children, active }: CombineIndicator.Props) {
  return (
    <div>
      {children}
    </div>
  )
}

export namespace CombineIndicator {
  export interface Props extends PropsWithChildren {
    active: boolean
  }
}