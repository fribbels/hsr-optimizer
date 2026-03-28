import type { ReactNode } from 'react'
import { useCallback, useRef } from 'react'

/**
 * Ref-based tooltip positioning that bypasses recharts' buggy coordinate system.
 * Updates tooltip position via direct DOM manipulation — zero React re-renders from mouse movement.
 */
export function useChartTooltip() {
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !tooltipRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    tooltipRef.current.style.left = `${e.clientX - rect.left + 12}px`
    tooltipRef.current.style.top = `${e.clientY - rect.top - 20}px`
  }, [])

  return { containerRef, tooltipRef, handleMouseMove }
}

export function ChartTooltipContainer({ tooltipRef, visible, children }: {
  tooltipRef: React.RefObject<HTMLDivElement | null>
  visible: boolean
  children: ReactNode
}) {
  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 10,
        visibility: visible ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>
  )
}

export function ChartTooltipContent({ children }: { children: ReactNode }) {
  return (
    <div
      className='pre-font'
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--layer-2)',
        padding: 8,
        borderRadius: 2,
      }}
    >
      {children}
    </div>
  )
}
