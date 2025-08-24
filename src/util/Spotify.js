// Spotify utility using Authorization Code with PKCE (no client secret in browser)
// Fill in your Spotify Client ID below before using.

let accessToken = ''
let tokenExpiresAt = 0
let refreshToken = ''

const clientId = '3bc74030b1044b04ae04f645ab79cddf' // Updated Client ID
const redirectUri = window.location.origin + '/' // e.g., http://localhost:3001/
const scope = 'playlist-modify-public'

// Storage keys
const STORAGE = {
  codeVerifier: 'spotify_code_verifier',
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expiresAt: 'spotify_expires_at',
}

function base64UrlEncode(bytes) {
  let binary = ''
  const len = bytes.length
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function generateCodeVerifier() {
  const random = new Uint8Array(32)
  crypto.getRandomValues(random)
  return base64UrlEncode(random)
}

async function sha256(input) {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(digest)
}

async function codeChallengeFromVerifier(verifier) {
  const hashed = await sha256(verifier)
  return base64UrlEncode(hashed)
}

function loadTokensFromStorage() {
  try {
    const storedToken = sessionStorage.getItem(STORAGE.accessToken)
    const storedRefresh = sessionStorage.getItem(STORAGE.refreshToken)
    const storedExpires = Number(sessionStorage.getItem(STORAGE.expiresAt) || '0')
    if (storedToken && storedExpires && Date.now() < storedExpires - 60_000) {
      accessToken = storedToken
      refreshToken = storedRefresh || ''
      tokenExpiresAt = storedExpires
    }
  } catch {}
}

function saveTokens(tokenResponse) {
  accessToken = tokenResponse.access_token
  const expiresIn = Number(tokenResponse.expires_in || 3600)
  tokenExpiresAt = Date.now() + expiresIn * 1000
  refreshToken = tokenResponse.refresh_token || refreshToken || ''
  try {
    sessionStorage.setItem(STORAGE.accessToken, accessToken)
    sessionStorage.setItem(STORAGE.expiresAt, String(tokenExpiresAt))
    if (refreshToken) sessionStorage.setItem(STORAGE.refreshToken, refreshToken)
  } catch {}
}

async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem(STORAGE.codeVerifier)
  if (!verifier) return
  const params = new URLSearchParams()
  params.set('client_id', clientId)
  params.set('grant_type', 'authorization_code')
  params.set('code', code)
  params.set('redirect_uri', redirectUri)
  params.set('code_verifier', verifier)
  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  if (!resp.ok) return
  const json = await resp.json()
  saveTokens(json)
  // Clean URL
  try {
    const cleanPath = window.location.pathname || '/'
    window.history.replaceState({}, document.title, cleanPath)
  } catch {}
}

async function refreshAccessToken() {
  if (!refreshToken) return
  const params = new URLSearchParams()
  params.set('client_id', clientId)
  params.set('grant_type', 'refresh_token')
  params.set('refresh_token', refreshToken)
  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  if (!resp.ok) return
  const json = await resp.json()
  saveTokens(json)
}

async function ensureAccessToken() {
  // Load any persisted tokens
  loadTokensFromStorage()
  if (accessToken && Date.now() < tokenExpiresAt - 60_000) return accessToken

  // If we have a refresh token, try to refresh
  if (refreshToken) {
    await refreshAccessToken()
    if (accessToken && Date.now() < tokenExpiresAt - 60_000) return accessToken
  }

  // See if we've been redirected back with a code
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  if (code) {
    
    await exchangeCodeForToken(code)
    if (accessToken && Date.now() < tokenExpiresAt - 60_000) return accessToken
  }

  // Start PKCE flow
  if (!clientId) {
    console.warn('Spotify clientId not set. Set clientId in src/util/Spotify.js')
    return ''
  }
  const verifier = generateCodeVerifier()
  const challenge = await codeChallengeFromVerifier(verifier)
  try { sessionStorage.setItem(STORAGE.codeVerifier, verifier) } catch {}
  const authUrl = new URL('https://accounts.spotify.com/authorize')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('code_challenge', challenge)
  authUrl.searchParams.set('scope', scope)
  
  window.location.assign(authUrl.toString())
  return ''
}

const Spotify = {
  async search(term) {
    if (!term) return []
    const token = await ensureAccessToken()
    if (!token) return []
    const resp = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    if (!resp.ok) return []
    const json = await resp.json()
    if (!json.tracks || !json.tracks.items) return []
    return json.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists?.[0]?.name || '',
      album: track.album?.name || '',
      uri: track.uri,
    }))
  },

  async savePlaylist(name, trackUris) {
  if (!name || !trackUris || trackUris.length === 0) return
  // Filter out any non-spotify:track URIs just in case
  trackUris = trackUris.filter(u => typeof u === 'string' && /^spotify:track:/.test(u))
  if (trackUris.length === 0) return
    const token = await ensureAccessToken()
    if (!token) return
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    // Get current user ID
    const meResp = await fetch('https://api.spotify.com/v1/me', { headers })
  if (!meResp.ok) return false
    const me = await meResp.json()
    const userId = me.id

    // Create playlist
    const createResp = await fetch(`https://api.spotify.com/v1/users/${encodeURIComponent(userId)}/playlists`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name }),
    })
  if (!createResp.ok) return false
    const playlist = await createResp.json()
    const playlistId = playlist.id

    // Add tracks
    const addResp = await fetch(`https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}/tracks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ uris: trackUris }),
    })
    if (!addResp.ok) {
      try { console.error('[Jammming] Failed to add tracks:', addResp.status, await addResp.text()) } catch {}
      return false
    }
    return true
  },
}

export default Spotify
