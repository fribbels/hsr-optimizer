import {
  Skeleton,
  type SkeletonProps,
} from '@mantine/core'
import {
  memo,
  type ReactNode,
  Suspense,
  use,
  useEffect,
  useState,
} from 'react'
import { DeferCreate } from './DeferredRender'

interface CommonProps extends SkeletonProps {
  skeletonClassName?: string
  textSpanClassName?: string
  fallback?: ReactNode
  disableDefer?: boolean
}
interface SimpleProps extends CommonProps {
  promise: Promise<ReactNode>
  selector?: never
}
interface ComplexProps<T = any> extends CommonProps {
  promise: Promise<T>
  selector(arg: NoInfer<T>): ReactNode
}
type Props = SimpleProps | ComplexProps
export const SuspenseNode = memo(function SuspenseText(props: Props) {
  if (props.disableDefer) {
    return (
      <Suspense fallback={props.fallback ?? <SuspenseTextPending {...props} />}>
        <SuspenseTextReady {...props} />
      </Suspense>
    )
  }
  return (
    <DeferCreate>
      <Suspense fallback={props.fallback ?? <SuspenseTextPending {...props} />}>
        <SuspenseTextReady {...props} />
      </Suspense>
    </DeferCreate>
  )
})

function SuspenseTextPending(props: Props) {
  const { promise, selector, skeletonClassName, textSpanClassName, disableDefer, fallback, ...skeletonProps } = props
  // for some reason the skeleton doesn't render unless dummy text is inserted as a child
  return <Skeleton {...skeletonProps} className={skeletonClassName}>foo</Skeleton>
}

function SuspenseTextReady({ selector, promise, textSpanClassName }: Props) {
  const [node, setNode] = useState<ReactNode>(null)
  const res = use(promise)
  useEffect(() => {
    setNode(selector ? selector(res) : res)
  }, [res, selector])
  if (textSpanClassName) return <span className={textSpanClassName}>{node}</span>
  return node
}
