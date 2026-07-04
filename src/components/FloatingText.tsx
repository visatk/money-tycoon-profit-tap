import { motion } from 'motion/react'
import { formatCurrency } from '@/lib/utils'

interface FloatingTextProps {
  amount: number
  x: number
  y: number
}

export function FloatingText({ amount, x, y }: FloatingTextProps) {
  // Random horizontal drift
  const drift = (Math.random() - 0.5) * 60

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x: drift / 2, scale: 0.8 }}
      animate={{ opacity: 0, y: -90, x: drift, scale: 1.1 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute z-50 text-lg font-bold select-none"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        color: '#fbbf24',
        textShadow: '0 0 12px rgba(251,191,36,0.9), 0 2px 4px rgba(0,0,0,0.8)',
        whiteSpace: 'nowrap',
      }}
    >
      +{formatCurrency(amount)}
    </motion.div>
  )
}
