import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useGameState } from '@/hooks/useGameState'

interface SplashScreenProps {
  onReady: () => void
}

export function SplashScreen({ onReady }: SplashScreenProps) {
  const { state, reload } = useGameState()

  useEffect(() => {
    reload().then(() => {
      setTimeout(onReady, 600)
    })
  }, [reload, onReady])

  const progress = state.loading ? 0.3 : 1

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(145deg, #080c1a 0%, #0d1528 50%, #080c1a 100%)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(251,191,36,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mb-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-8 rounded-full border border-amber-400/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-12 rounded-full border border-amber-400/5"
        />
        <div
          className="relative flex size-28 items-center justify-center rounded-3xl text-6xl"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))',
            border: '2px solid rgba(251,191,36,0.3)',
            boxShadow: '0 0 40px rgba(251,191,36,0.2), inset 0 1px 0 rgba(251,191,36,0.2)',
          }}
        >
          💰
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-2xl font-black tracking-wide text-white">
          Money Tycoon
        </h1>
        <p className="mt-1 text-sm font-medium tracking-widest text-amber-400/70 uppercase">
          Profit Tap
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 w-48"
      >
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
          />
        </div>
        <p className="mt-3 text-center text-xs text-white/30">
          {state.loading ? 'Loading your empire…' : 'Ready!'}
        </p>
      </motion.div>

      {/* Particle dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-1 rounded-full bg-amber-400/40"
          animate={{
            x: [0, (Math.random() - 0.5) * 200],
            y: [0, (Math.random() - 0.5) * 200],
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
          }}
          style={{
            left: `${30 + i * 8}%`,
            top: `${40 + (i % 3) * 10}%`,
          }}
        />
      ))}
    </motion.div>
  )
}
