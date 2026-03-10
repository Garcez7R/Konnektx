const TOKEN_KEY = 'konnektx_token'

export function setAccessToken(token: string) {
  if (!token) return
  localStorage.setItem(TOKEN_KEY, token)
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function captureTokenFromUrl() {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  let token = ''
  if (url.hash.startsWith('#token=')) {
    token = decodeURIComponent(url.hash.replace('#token=', ''))
    url.hash = ''
  } else if (url.searchParams.has('token')) {
    token = url.searchParams.get('token') || ''
    url.searchParams.delete('token')
  }
  if (token) {
    setAccessToken(token)
    window.history.replaceState({}, document.title, url.toString())
    return token
  }
  return null
}
