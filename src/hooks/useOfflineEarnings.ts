import { useState, useEffect } from 'react'
import type { OfflineEarnings } from '@/types'
import { gameApi } from '@/lib/api'

export function useOfflineEarnings() {
  const [offlineData, setOfflineData] = useState<OfflineEarnings | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (shown) return
    gameApi.offlineEarnings().then((result) => {
      if (result.ok && result.data && result.data.earnings > 10) {
        setOfflineData(result.data)
      }
    })
    setShown(true)
  }, [shown])

  const collect = async (): Promise<number> => {
    const result = await gameApi.collectOffline()
    if (result.ok && result.data) {
      setOfflineData(null)
      return result.data.earnings
    }
    return 0
  }

  const dismiss = () => setOfflineData(null)

  return { offlineData, collect, dismiss }
}
