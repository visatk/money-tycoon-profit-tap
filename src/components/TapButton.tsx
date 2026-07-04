import { useCallback, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'
import { FloatingText } from './FloatingText'

interface TapButtonProps {
  onTap: () => void
  income: number
  color?: string
  glowColor?: string
  emoji: string
  className?: string
  disabled?: boolean
}

interface FloatItem {
  id: number
  amount: number
  x: number
  y: number
}

export function TapButton({
  onTap,
  income,
  color = '#f59e0b',
  glowColor = 'rgba(245,158,11,0.4)',
  emoji,
  className,
  disabled,
}: TapButtonProps) {
  const [floats, setFloats] = useState<FloatItem[]>([])
  const floatCounter = useRef(0)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Spring physics for press animation
  const scale = useSpring(1, { stiffness: 400, damping: 15 })
  const glowOpacity = useSpring(0, { stiffness: 200, damping: 20 })

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return
      e.preventDefault()

      // Compute float position relative to button
      const rect = buttonRef.current?.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY
      const x = rect ? clientX - rect.left : 0
      const y = rect ? clientY - rect.top : 0

      // Add floating text
      const id = ++floatCounter.current
      setFloats((prev) => [...prev, { id, amount: income, x, y }])
      setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 1200)

      // Spring animation
      scale.set(0.88)
      glowOpacity.set(0.9)
      setTimeout(() => {
        scale.set(1.06)
        setTimeout(() => {
          scale.set(1)
          glowOpacity.set(0)
        }, 120)
      }, 80)

      onTap()
    },
    [disabled, income, onTap, scale, glowOpacity],
  )

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 60px 20px ${glowColor}`,
          opacity: glowOpacity,
        }}
      />

      {/* Button */}
      <motion.button
        ref={buttonRef}
        style={{ scale }}
        onClick={handleTap}
        onTouchStart={handleTap}
        disabled={disabled}
        className={cn(
          'relative size-52 rounded-full border-4 transition-colors select-none',
          'flex items-center justify-center text-7xl',
          'active:outline-none focus:outline-none',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        style={{
          background: `radial-gradient(circle at 35% 35%, ${color}33, ${color}11)`,
          borderColor: color,
          boxShadow: `0 0 30px ${glowColor}, inset 0 1px 0 ${color}44`,
        } as React.CSSProperties}
      >
        <span className="drop-shadow-lg">{emoji}</span>
      </motion.button>

      {/* Floating income texts */}
      {floats.map((f) => (
        <FloatingText key={f.id} amount={f.amount} x={f.x} y={f.y} />
      ))}
    </div>
  )
}
