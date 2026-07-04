import { motion } from 'motion/react'
import type { Screen } from '@/types'
import { cn } from '@/lib/utils'

interface NavItem {
  id: Screen['id']
  label: string
  emoji: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'hub', label: 'Empire', emoji: '🏢' },
  { id: 'investments', label: 'Invest', emoji: '📈' },
  { id: 'luxury', label: 'Luxury', emoji: '💎' },
  { id: 'quests', label: 'Quests', emoji: '📋' },
  { id: 'leaderboard', label: 'Rank', emoji: '🏆' },
]

interface BottomNavProps {
  activeScreen: Screen['id']
  onNavigate: (screen: Screen) => void
  unreadQuests?: number
}

export function BottomNav({ activeScreen, onNavigate, unreadQuests = 0 }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-white/5"
      style={{
        background: 'linear-gradient(to top, rgba(8,12,26,0.98), rgba(8,12,26,0.92))',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate({ id: item.id } as Screen)}
              className="relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-white/8"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Emoji */}
              <motion.span
                animate={{ scale: isActive ? 1.2 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative text-xl"
              >
                {item.emoji}
                {/* Badge for quests */}
                {item.id === 'quests' && unreadQuests > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unreadQuests}
                  </span>
                )}
              </motion.span>

              {/* Label */}
              <span
                className={cn(
                  'relative text-[10px] font-medium transition-colors',
                  isActive ? 'text-amber-400' : 'text-white/30',
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
