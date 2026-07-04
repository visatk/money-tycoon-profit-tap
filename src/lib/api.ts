import type {
  ApiResponse,
  GameState,
  TapResult,
  OfflineEarnings,
  ActiveMarketEvent,
  BusinessId,
  LeaderboardEntry,
  AssetPrice,
  QuestProgress,
} from '@/types'

const BASE_URL = '/api'

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const initData =
    typeof window !== 'undefined'
      ? (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData ?? ''
      : ''

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-init-data': initData,
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }))
    return { ok: false, error: (err as { error: string }).error ?? 'Unknown error' }
  }

  return res.json() as Promise<ApiResponse<T>>
}

function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

function get<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'GET' })
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  validate: (initData: string) =>
    post<{ userId: string; firstName: string; username?: string }>('/auth/validate', { initData }),
}

// ─── Game ─────────────────────────────────────────────────────────────────────
export const gameApi = {
  state: () => get<GameState>('/game/state'),
  tap: (businessId: BusinessId, taps = 1) => post<TapResult>('/game/tap', { businessId, taps }),
  upgrade: (businessId: BusinessId, upgradeId: string) =>
    post<{ newBalance: number; newTapIncome: number; newAutoIncome: number }>('/game/upgrade', { businessId, upgradeId }),
  hire: (businessId: BusinessId, managerId: string) =>
    post<{ newBalance: number; newAutoIncome: number; newManagersHired: number }>('/game/hire', { businessId, managerId }),
  offlineEarnings: () => get<OfflineEarnings>('/game/offline'),
  collectOffline: () => post<{ earnings: number; newBalance: number }>('/game/collect', {}),
}

// ─── Events ───────────────────────────────────────────────────────────────────
export const eventsApi = {
  active: () => get<ActiveMarketEvent[]>('/events/active'),
}

// ─── Investments ──────────────────────────────────────────────────────────────
export const investApi = {
  assets: () => get<AssetPrice[]>('/invest/assets'),
  portfolio: () =>
    get<{
      positions: Array<{
        assetId: string
        amount: number
        purchasePrice: number
        currentPrice: number
        currentValue: number
        pnl: number
        pnlPct: number
      }>
      totalValue: number
      totalPnl: number
    }>('/invest/portfolio'),
  buy: (assetId: string, spendAmount: number) =>
    post<{ unitsBought: number; pricePerUnit: number; newBalance: number }>('/invest/buy', { assetId, spendAmount }),
  sell: (assetId: string, sellAmount: number) =>
    post<{ proceeds: number; newBalance: number }>('/invest/sell', { assetId, sellAmount }),
}

// ─── Luxury ───────────────────────────────────────────────────────────────────
export const luxuryApi = {
  owned: () => get<string[]>('/luxury/owned'),
  buy: (itemId: string) =>
    post<{ itemId: string; newBalance: number; incomeBonus: number }>('/luxury/buy', { itemId }),
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const leaderboardApi = {
  global: () => get<LeaderboardEntry[]>('/leaderboard/global'),
  rank: () => get<{ rank: number; total: number; netWorth: number; level: number }>('/leaderboard/rank'),
}

// ─── Quests ───────────────────────────────────────────────────────────────────
export const questsApi = {
  today: () =>
    get<
      Array<{
        questId: string
        target: number
        progress: number
        completed: boolean
        claimed: boolean
        reward: { type: string; amount: number }
      }>
    >('/quests/today'),
  claim: (questId: string) =>
    post<{ reward: { type: string; amount: number }; newBalance: number }>('/quests/claim', { questId }),
  progress: (questId: string, amount: number) =>
    post<{ newProgress: number; target: number; completed: boolean }>('/quests/progress', { questId, amount }),
}

// ─── Mini-games ───────────────────────────────────────────────────────────────
export const minigameApi = {
  config: (id: string) => get<Record<string, unknown>>(`/minigame/${id}/config`),
  submitTapFrenzy: (taps: number) =>
    post<{ taps: number; reward: number; newBalance: number }>('/minigame/tap_frenzy/submit', { taps }),
  submitMemoryMatch: (solved: boolean, timeMs: number) =>
    post<{ reward: number; newBalance: number }>('/minigame/memory_match/submit', { solved, timeMs }),
  submitFortuneWheel: () =>
    post<{ prize: string; reward: number; newBalance: number }>('/minigame/fortune_wheel/submit', {}),
}
