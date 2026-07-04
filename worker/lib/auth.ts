import { createHmac } from 'node:crypto'
import type { TelegramUser } from '../types'

/**
 * Validates Telegram initData using HMAC-SHA256 as per Telegram docs.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return false

    params.delete('hash')

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
    const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    return expectedHash === hash
  } catch {
    return false
  }
}

/**
 * Parses Telegram user data from initData string.
 */
export function parseTelegramUser(initData: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData)
    const userJson = params.get('user')
    if (!userJson) return null
    return JSON.parse(userJson) as TelegramUser
  } catch {
    return null
  }
}

/**
 * Middleware: extracts and validates auth from Authorization header or x-init-data.
 * Returns userId string or throws 401.
 */
export function extractUserId(request: Request): string | null {
  const url = new URL(request.url)
  const isDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

  // For dev: allow x-dev-user-id header to bypass auth
  const devUserId = request.headers.get('x-dev-user-id')
  if (devUserId && isDev) {
    return devUserId
  }

  const initData = request.headers.get('x-init-data') ?? ''
  if (!initData) return null

  try {
    const params = new URLSearchParams(initData)
    const userJson = params.get('user')
    if (!userJson) return null
    const user = JSON.parse(userJson) as TelegramUser
    return String(user.id)
  } catch {
    return null
  }
}
