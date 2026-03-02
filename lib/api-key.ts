import { createHash, randomBytes } from 'crypto'

export function generateApiKey(): { fullKey: string; prefix: string; hash: string } {
  const raw = 'ayb_' + randomBytes(28).toString('hex')
  const prefix = raw.substring(0, 16)
  const hash = createHash('sha256').update(raw).digest('hex')
  return { fullKey: raw, prefix, hash }
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  starter: 1000,
  pro: 10000,
}
