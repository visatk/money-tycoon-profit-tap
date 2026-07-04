import { useEffect, useRef, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface NetWorthCounterProps {
  value: number
  className?: string
  prefix?: string
}

export function NetWorthCounter({ value, className, prefix = '' }: NetWorthCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const from = prevValueRef.current
    const to = value
    if (from === to) return

    prevValueRef.current = to
    const duration = 400
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(from + (to - from) * eased)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{formatCurrency(displayValue)}
    </span>
  )
}
