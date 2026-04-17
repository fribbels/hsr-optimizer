import {
  Skeleton,
  type SkeletonProps,
} from '@mantine/core'
import { usePromise } from 'hooks/usePromise'
import {
  memo,
  type ReactNode,
  useRef,
} from 'react'

interface BaseProps {
  textSpanClassName?: string
  fallback?: ReactNode
  keepPrevious?: boolean
}
interface SimpleProps extends BaseProps, SkeletonProps {
  promise: Promise<ReactNode>
  selector?: never
}
interface ComplexProps<T = any> extends BaseProps, SkeletonProps {
  promise: Promise<T>
  selector(arg: T): ReactNode
}
type Props = SimpleProps | ComplexProps

export const SuspenseNode = memo(function SuspenseNode(props: Props) {
  const { promise, selector, textSpanClassName, fallback, keepPrevious, ...skeletonProps } = props
  const output = usePromise(promise)
  const prevNodeRef = useRef<ReactNode>(null)

  if (output === null) {
    if (keepPrevious && prevNodeRef.current !== null) {
      return textSpanClassName ? <span className={textSpanClassName}>{prevNodeRef.current}</span> : prevNodeRef.current
    }
    if (fallback !== undefined) return fallback
    return <Skeleton {...skeletonProps}>foo</Skeleton>
  }

  const node = selector ? selector(output) : (output as ReactNode)
  prevNodeRef.current = node
  return textSpanClassName ? <span className={textSpanClassName}>{node}</span> : node
})
