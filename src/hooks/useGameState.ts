import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
} from 'react'
import type { GameState, BusinessId, ActiveMarketEvent, BusinessState } from '@/types'
import { gameApi, luxuryApi } from '@/lib/api'
import { applyIncomeTick } from '@/lib/incomeEngine'
import { INCOME_TICK_MS } from '@/lib/gameConstants'

// ─── State ────────────────────────────────────────────────────────────────────
interface ExtendedGameState extends GameState {
  loading: boolean
  error: string | null
  offlineEarnings: number | null
}

const initialState: ExtendedGameState = {
  loading: true,
  error: null,
  offlineEarnings: null,
  player: {
    id: '',
    firstName: '',
    netWorth: 0,
    level: 1,
    xp: 0,
    lastSeen: Date.now(),
    createdAt: Date.now(),
  },
  balance: 0,
  businesses: [],
  investments: [],
  luxuryOwned: [],
  questProgress: [],
  activeEvents: [],
  lastSync: 0,
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_OFFLINE_EARNINGS'; payload: number }
  | { type: 'ADD_BALANCE'; payload: number }
  | { type: 'SUBTRACT_BALANCE'; payload: number }
  | { type: 'SET_EVENTS'; payload: ActiveMarketEvent[] }
  | { type: 'APPLY_TAP'; payload: { businessId: BusinessId; income: number; newTapCount: number } }
  | { type: 'APPLY_UPGRADE'; payload: { businessId: BusinessId; upgradeId: string; newBalance: number; newTapIncome: number; newAutoIncome: number } }
  | { type: 'APPLY_HIRE'; payload: { businessId: BusinessId; newManagersHired: number; newAutoIncome: number; newBalance: number } }
  | { type: 'APPLY_LUXURY'; payload: { itemId: string; newBalance: number } }
  | { type: 'APPLY_INCOME_TICK'; payload: number }
  | { type: 'DISMISS_OFFLINE' }

function reducer(state: ExtendedGameState, action: Action): ExtendedGameState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload, loading: false, error: null, lastSync: Date.now() }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_OFFLINE_EARNINGS':
      return { ...state, offlineEarnings: action.payload }
    case 'DISMISS_OFFLINE':
      return { ...state, offlineEarnings: null }
    case 'ADD_BALANCE':
      return { ...state, balance: state.balance + action.payload }
    case 'SUBTRACT_BALANCE':
      return { ...state, balance: state.balance - action.payload }
    case 'SET_EVENTS':
      return { ...state, activeEvents: action.payload }
    case 'APPLY_TAP': {
      const businesses = state.businesses.map((b) =>
        b.businessId === action.payload.businessId
          ? { ...b, tapCount: action.payload.newTapCount, totalEarned: b.totalEarned + action.payload.income }
          : b,
      )
      return { ...state, balance: state.balance + action.payload.income, businesses }
    }
    case 'APPLY_UPGRADE': {
      const businesses = state.businesses.map((b) =>
        b.businessId === action.payload.businessId
          ? {
              ...b,
              upgradesPurchased: [...b.upgradesPurchased, action.payload.upgradeId],
              tapIncome: action.payload.newTapIncome,
              autoIncome: action.payload.newAutoIncome,
            }
          : b,
      )
      return { ...state, balance: action.payload.newBalance, businesses }
    }
    case 'APPLY_HIRE': {
      const businesses = state.businesses.map((b) =>
        b.businessId === action.payload.businessId
          ? { ...b, managersHired: action.payload.newManagersHired, autoIncome: action.payload.newAutoIncome }
          : b,
      )
      return { ...state, balance: action.payload.newBalance, businesses }
    }
    case 'APPLY_LUXURY':
      return {
        ...state,
        balance: action.payload.newBalance,
        luxuryOwned: [...state.luxuryOwned, action.payload.itemId],
      }
    case 'APPLY_INCOME_TICK':
      return { ...state, balance: state.balance + action.payload }
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface GameContextValue {
  state: ExtendedGameState
  dispatch: Dispatch<Action>
  tap: (businessId: BusinessId) => Promise<void>
  upgrade: (businessId: BusinessId, upgradeId: string) => Promise<boolean>
  hire: (businessId: BusinessId, managerId: string) => Promise<boolean>
  buyLuxury: (itemId: string) => Promise<boolean>
  collectOffline: () => Promise<void>
  getBusiness: (id: BusinessId) => BusinessState | undefined
  reload: () => Promise<void>
}

export const GameContext = createContext<GameContextValue | null>(null)

export function useGameState(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameState must be used within GameProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function useGameStateProvider(): GameContextValue {
  const [state, dispatch] = useReducer(reducer, initialState)
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Load game state
  const reload = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const result = await gameApi.state()
    if (result.ok && result.data) {
      dispatch({ type: 'SET_STATE', payload: result.data })

      // Check offline earnings
      const offlineResult = await gameApi.offlineEarnings()
      if (offlineResult.ok && offlineResult.data && offlineResult.data.earnings > 0) {
        dispatch({ type: 'SET_OFFLINE_EARNINGS', payload: offlineResult.data.earnings })
      }
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error ?? 'Failed to load game' })
    }
  }, [])

  // Income tick
  useEffect(() => {
    tickIntervalRef.current = setInterval(() => {
      const { businesses, activeEvents } = stateRef.current
      if (businesses.length === 0) return
      const tickIncome = applyIncomeTick(businesses, activeEvents)
      if (tickIncome > 0) {
        dispatch({ type: 'APPLY_INCOME_TICK', payload: tickIncome })
      }
    }, INCOME_TICK_MS)

    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
    }
  }, [])

  const tapQueueRef = useRef<Record<BusinessId, number>>({} as Record<BusinessId, number>)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const syncTaps = useCallback(() => {
    const queue = { ...tapQueueRef.current }
    tapQueueRef.current = {} as Record<BusinessId, number>

    for (const [bId, count] of Object.entries(queue)) {
      if (count > 0) {
        gameApi.tap(bId as BusinessId, count).catch(() => {
          // Failure handling could be robust, but for a clicker it's okay to drop rarely
        })
      }
    }
  }, [])

  const tap = useCallback((businessId: BusinessId): Promise<void> => {
    const biz = stateRef.current.businesses.find((b) => b.businessId === businessId)
    if (!biz) return Promise.resolve()
    
    // Optimistic update
    const income = biz.tapIncome
    dispatch({ type: 'APPLY_TAP', payload: { businessId, income, newTapCount: biz.tapCount + 1 } })

    // Queue for batch sync
    tapQueueRef.current[businessId] = (tapQueueRef.current[businessId] || 0) + 1
    
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = setTimeout(syncTaps, 1000)
    
    return Promise.resolve()
  }, [syncTaps])

  const upgrade = useCallback(async (businessId: BusinessId, upgradeId: string): Promise<boolean> => {
    const result = await gameApi.upgrade(businessId, upgradeId)
    if (result.ok && result.data) {
      dispatch({ type: 'APPLY_UPGRADE', payload: { businessId, upgradeId, ...result.data } })
      return true
    }
    return false
  }, [])

  const hire = useCallback(async (businessId: BusinessId, managerId: string): Promise<boolean> => {
    const result = await gameApi.hire(businessId, managerId)
    if (result.ok && result.data) {
      dispatch({ type: 'APPLY_HIRE', payload: { businessId, ...result.data } })
      return true
    }
    return false
  }, [])

  const buyLuxury = useCallback(async (itemId: string): Promise<boolean> => {
    const result = await luxuryApi.buy(itemId)
    if (result.ok && result.data) {
      dispatch({ type: 'APPLY_LUXURY', payload: { itemId, newBalance: result.data.newBalance } })
      return true
    }
    return false
  }, [])

  const collectOffline = useCallback(async () => {
    const result = await gameApi.collectOffline()
    if (result.ok && result.data) {
      dispatch({ type: 'ADD_BALANCE', payload: result.data.earnings })
      dispatch({ type: 'DISMISS_OFFLINE' })
    }
  }, [])

  const getBusiness = useCallback(
    (id: BusinessId) => stateRef.current.businesses.find((b) => b.businessId === id),
    [],
  )

  return { state, dispatch, tap, upgrade, hire, buyLuxury, collectOffline, getBusiness, reload }
}
