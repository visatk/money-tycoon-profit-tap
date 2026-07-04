import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Screen } from '@/types'
import {
  GameContext,
  useGameStateProvider,
} from '@/hooks/useGameState'
import { initTelegramSDK, useTelegram } from '@/hooks/useTelegram'
import { SplashScreen } from '@/screens/SplashScreen'
import { HubScreen } from '@/screens/HubScreen'
import { BusinessScreen } from '@/screens/BusinessScreen'
import { InvestmentsScreen } from '@/screens/InvestmentsScreen'
import { LuxuryScreen } from '@/screens/LuxuryScreen'
import { MiniGamesScreen } from '@/screens/MiniGamesScreen'
import { QuestsScreen } from '@/screens/QuestsScreen'
import { LeaderboardScreen } from '@/screens/LeaderboardScreen'
import { BottomNav } from '@/components/BottomNav'
import { authApi } from '@/lib/api'

// Initialize Telegram SDK as early as possible
initTelegramSDK()

const BOTTOM_NAV_SCREENS: Array<Screen['id']> = [
  'hub',
  'investments',
  'luxury',
  'quests',
  'leaderboard',
]

function AppContent() {
  const gameProvider = useGameStateProvider()
  const { initDataRaw } = useTelegram()
  const [screen, setScreen] = useState<Screen>({ id: 'splash' })

  // Authenticate with Telegram on first load
  useEffect(() => {
    if (initDataRaw) {
      authApi.validate(initDataRaw).catch(() => {
        // Non-fatal; game state still loads
      })
    }
  }, [initDataRaw])

  // Load game state after auth
  useEffect(() => {
    if (screen.id !== 'splash') {
      gameProvider.reload()
    }
  }, [screen.id]) // eslint-disable-line

  const navigate = useCallback((target: Screen) => {
    setScreen(target)
  }, [])

  const showBottomNav = BOTTOM_NAV_SCREENS.includes(screen.id)

  return (
    <GameContext.Provider value={gameProvider}>
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          height: '100dvh',
          maxWidth: 480,
          margin: '0 auto',
          background: 'linear-gradient(145deg, #080c1a 0%, #0d1528 50%, #080c1a 100%)',
        }}
      >
        {/* Ambient background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.04) 0%, transparent 60%)',
          }}
        />

        {/* Screen content */}
        <div className="relative flex flex-col flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {screen.id === 'splash' && (
              <MotionScreen key="splash">
                <SplashScreen onReady={() => setScreen({ id: 'hub' })} />
              </MotionScreen>
            )}

            {screen.id === 'hub' && (
              <MotionScreen key="hub">
                <HubScreen onNavigate={navigate} />
              </MotionScreen>
            )}

            {screen.id === 'business' && (
              <MotionScreen key={`business-${screen.businessId}`}>
                <BusinessScreen
                  businessId={screen.businessId}
                  onBack={() => setScreen({ id: 'hub' })}
                />
              </MotionScreen>
            )}

            {screen.id === 'investments' && (
              <MotionScreen key="investments">
                <InvestmentsScreen />
              </MotionScreen>
            )}

            {screen.id === 'luxury' && (
              <MotionScreen key="luxury">
                <LuxuryScreen />
              </MotionScreen>
            )}

            {screen.id === 'minigames' && (
              <MotionScreen key="minigames">
                <MiniGamesScreen />
              </MotionScreen>
            )}

            {screen.id === 'quests' && (
              <MotionScreen key="quests">
                <QuestsScreen />
              </MotionScreen>
            )}

            {screen.id === 'leaderboard' && (
              <MotionScreen key="leaderboard">
                <LeaderboardScreen />
              </MotionScreen>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom navigation */}
        {showBottomNav && (
          <BottomNav
            activeScreen={screen.id as 'hub' | 'investments' | 'luxury' | 'quests' | 'leaderboard'}
            onNavigate={navigate}
          />
        )}
      </div>
    </GameContext.Provider>
  )
}

function MotionScreen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export default AppContent
