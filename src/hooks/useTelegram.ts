import { useCallback } from 'react'
import {
  retrieveLaunchParams,
  hapticFeedback,
  viewport,
  miniApp,
  themeParams,
  init,
} from '@telegram-apps/sdk'

let initialized = false

export function initTelegramSDK(): void {
  if (initialized) return
  try {
    init()
    initialized = true
    // Expand the mini app to full height
    if (viewport.mount.isAvailable()) {
      void viewport.mount()
      viewport.expand()
    }
    if (miniApp.mount.isAvailable()) {
      void miniApp.mount()
    }
    if (themeParams.mount.isAvailable()) {
      void themeParams.mount()
    }
  } catch {
    // Running outside Telegram (dev mode)
    initialized = true
  }
}

export function useTelegram() {
  let user = null as { id: number; firstName: string; username?: string } | null
  let initData = ''
  let initDataRaw = ''

  try {
    const lp = retrieveLaunchParams()
    initData = lp.initDataRaw ?? ''
    initDataRaw = lp.initDataRaw ?? ''
    user = lp.initData
      ? {
          id: 0,
          firstName: 'Tycoon',
        }
      : null

    // Try to get actual user from initData
    if (initDataRaw) {
      const params = new URLSearchParams(initDataRaw)
      const userStr = params.get('user')
      if (userStr) {
        const parsed = JSON.parse(userStr)
        user = { id: parsed.id, firstName: parsed.first_name, username: parsed.username }
      }
    }
  } catch {
    // Outside Telegram
    user = { id: 0, firstName: 'Dev User' }
  }

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    try {
      if (hapticFeedback.isSupported()) {
        hapticFeedback.impactOccurred(type)
      }
    } catch {
      // Not supported
    }
  }, [])

  const triggerNotification = useCallback((type: 'error' | 'success' | 'warning') => {
    try {
      if (hapticFeedback.isSupported()) {
        hapticFeedback.notificationOccurred(type)
      }
    } catch {
      // Not supported
    }
  }, [])

  return {
    user,
    initData,
    initDataRaw,
    triggerHaptic,
    triggerNotification,
    isTelegram: typeof window !== 'undefined' && !!(window as unknown as { Telegram?: unknown }).Telegram,
  }
}
