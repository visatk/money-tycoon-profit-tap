import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MINI_GAMES, WHEEL_REWARDS } from '@/lib/gameConstants'
import { formatCurrency } from '@/lib/utils'
import { minigameApi } from '@/lib/api'
import { useGameState } from '@/hooks/useGameState'

type ActiveGame = 'tap_frenzy' | 'memory_match' | 'fortune_wheel' | null

const MEMORY_CARDS = ['🏪', '🚕', '📦', '🏗️', '✈️', '🏭']

export function MiniGamesScreen() {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null)
  const { dispatch } = useGameState()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/5">
        <h1 className="text-lg font-bold text-white">Mini-Games</h1>
        <p className="text-xs text-white/40">Play to earn bonus rewards</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-3 space-y-3">
        {MINI_GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveGame(game.id)}
            className="w-full rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                {game.emoji}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">{game.name}</p>
                <p className="mt-0.5 text-xs text-white/50">{game.description}</p>
                <p className="mt-1.5 text-xs text-amber-400">Up to {formatCurrency(game.maxReward)}</p>
              </div>
              <div className="shrink-0 rounded-full bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-400">
                Play →
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Game overlays */}
      <AnimatePresence>
        {activeGame === 'tap_frenzy' && (
          <TapFrenzyGame onClose={() => setActiveGame(null)} onReward={(amount) => {
            dispatch({ type: 'ADD_BALANCE', payload: amount })
            setActiveGame(null)
          }} />
        )}
        {activeGame === 'memory_match' && (
          <MemoryMatchGame onClose={() => setActiveGame(null)} onReward={(amount) => {
            dispatch({ type: 'ADD_BALANCE', payload: amount })
            setActiveGame(null)
          }} />
        )}
        {activeGame === 'fortune_wheel' && (
          <FortuneWheelGame onClose={() => setActiveGame(null)} onReward={(amount) => {
            dispatch({ type: 'ADD_BALANCE', payload: amount })
            setActiveGame(null)
          }} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tap Frenzy ───────────────────────────────────────────────────────────────
function TapFrenzyGame({ onClose, onReward }: { onClose: () => void; onReward: (a: number) => void }) {
  const [taps, setTaps] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [done, setDone] = useState(false)
  const [reward, setReward] = useState(0)

  useEffect(() => {
    if (timeLeft <= 0) {
      setDone(true)
      minigameApi.submitTapFrenzy(taps).then((r) => { if (r.ok && r.data) setReward(r.data.reward) })
      return
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, taps])

  return (
    <GameOverlay>
      <div className="text-center">
        <h2 className="text-xl font-black text-white mb-2">👆 Tap Frenzy!</h2>
        {!done ? (
          <>
            <p className="text-5xl font-black text-amber-400 my-4">{timeLeft}s</p>
            <p className="text-2xl font-bold text-white mb-6">{taps} taps</p>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTaps((p) => p + 1)}
              className="size-48 rounded-full text-6xl border-4 border-amber-400 bg-amber-400/10 mx-auto flex items-center justify-center active:bg-amber-400/20">
              👆
            </motion.button>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-white my-3">{taps} taps!</p>
            <p className="text-3xl font-black text-amber-400 mb-6">+{formatCurrency(reward)}</p>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => onReward(reward)}
              className="w-full rounded-2xl py-4 font-bold text-black bg-amber-400">Collect!</motion.button>
          </>
        )}
        <button onClick={onClose} className="mt-4 text-sm text-white/30">Cancel</button>
      </div>
    </GameOverlay>
  )
}

// ─── Memory Match ─────────────────────────────────────────────────────────────
function MemoryMatchGame({ onClose, onReward }: { onClose: () => void; onReward: (a: number) => void }) {
  const allCards = [...MEMORY_CARDS, ...MEMORY_CARDS].sort(() => Math.random() - 0.5)
  const [cards] = useState(allCards)
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [startTime] = useState(Date.now())
  const [done, setDone] = useState(false)
  const [reward, setReward] = useState(0)

  const handleFlip = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return
    const newFlipped = [...flipped, i]
    setFlipped(newFlipped)
    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        const newMatched = [...matched, ...newFlipped]
        setMatched(newMatched)
        setFlipped([])
        if (newMatched.length === cards.length) {
          const elapsed = Date.now() - startTime
          setDone(true)
          minigameApi.submitMemoryMatch(true, elapsed).then((r) => { if (r.ok && r.data) setReward(r.data.reward) })
        }
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }

  return (
    <GameOverlay>
      <h2 className="text-xl font-black text-white mb-2 text-center">🃏 Memory Match</h2>
      {!done ? (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {cards.map((card, i) => {
            const isFlipped = flipped.includes(i) || matched.includes(i)
            return (
              <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => handleFlip(i)}
                className="aspect-square rounded-xl text-2xl flex items-center justify-center border"
                style={{
                  backgroundColor: isFlipped ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
                  borderColor: isFlipped ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)',
                }}>
                {isFlipped ? card : '❓'}
              </motion.button>
            )
          })}
        </div>
      ) : (
        <div className="text-center mt-4">
          <p className="text-3xl font-black text-amber-400 mb-4">+{formatCurrency(reward)}</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => onReward(reward)}
            className="w-full rounded-2xl py-4 font-bold text-black bg-amber-400">Collect!</motion.button>
        </div>
      )}
      <button onClick={onClose} className="mt-4 text-sm text-white/30 w-full text-center">Cancel</button>
    </GameOverlay>
  )
}

// ─── Fortune Wheel ────────────────────────────────────────────────────────────
function FortuneWheelGame({ onClose, onReward }: { onClose: () => void; onReward: (a: number) => void }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ prize: string; reward: number } | null>(null)
  const [rotation, setRotation] = useState(0)

  const spin = async () => {
    setSpinning(true)
    const spins = 5 + Math.random() * 5
    const newRot = rotation + spins * 360
    setRotation(newRot)

    const res = await minigameApi.submitFortuneWheel()
    setTimeout(() => {
      setSpinning(false)
      if (res.ok && res.data) setResult({ prize: res.data.prize, reward: res.data.reward })
    }, 3000)
  }

  return (
    <GameOverlay>
      <h2 className="text-xl font-black text-white mb-4 text-center">🎡 Fortune Wheel</h2>
      <div className="flex justify-center mb-6">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: [0.17, 0.67, 0.15, 1.0] }}
          className="relative size-56 rounded-full border-4 border-amber-400 bg-gradient-to-br from-amber-400/20 to-amber-600/10 flex items-center justify-center"
        >
          <div className="grid grid-cols-2 gap-1 p-4 text-[10px] text-center w-full">
            {WHEEL_REWARDS.slice(0, 8).map((r, i) => (
              <div key={i} className="text-white/60 truncate">{r.label}</div>
            ))}
          </div>
        </motion.div>
      </div>

      {!result ? (
        <motion.button whileTap={{ scale: 0.97 }} onClick={spin} disabled={spinning}
          className="w-full rounded-2xl py-4 font-bold text-black"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
          {spinning ? 'Spinning…' : '🎡 Spin!'}
        </motion.button>
      ) : (
        <div className="text-center">
          <p className="text-base text-white/60 mb-1">You won:</p>
          <p className="text-2xl font-black text-amber-400 mb-4">{result.prize}</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => onReward(result.reward)}
            className="w-full rounded-2xl py-4 font-bold text-black bg-amber-400">Collect!</motion.button>
        </div>
      )}
      <button onClick={onClose} className="mt-4 text-sm text-white/30 w-full text-center">Cancel</button>
    </GameOverlay>
  )
}

function GameOverlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end bg-black/80">
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full rounded-t-3xl border-t border-white/10 bg-[#0d1528] p-6 pb-10">
        {children}
      </motion.div>
    </motion.div>
  )
}
