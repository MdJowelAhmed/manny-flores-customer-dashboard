export interface JwtPayload {
  id?: string
  role?: string
  [key: string]: unknown
}

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1]
    if (!base64) return null
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}
