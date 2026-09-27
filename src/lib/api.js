const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://72.60.219.181:46711/api/v1';

// ─── Token Storage ────────────────────────────────────────────────────────────

export const tokenStore = {
  getAccess() { return (typeof window !== 'undefined' && localStorage.getItem('access_token')) || null; },
  getRefresh() { return (typeof window !== 'undefined' && localStorage.getItem('refresh_token')) || null; },
  getGuest() { return (typeof window !== 'undefined' && localStorage.getItem('guest_token')) || null; },

  setAccess(token) { _lsSet('access_token', token); },
  setRefresh(token) { _lsSet('refresh_token', token); },

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('guest_token');
    localStorage.removeItem('user_profile');
  },
};

function _lsSet(key, value) {
  if (typeof window === 'undefined') return;
  value ? localStorage.setItem(key, value) : localStorage.removeItem(key);
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function getUserProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUserProfile(user) {
  if (typeof window === 'undefined') return;
  user
    ? localStorage.setItem('user_profile', JSON.stringify(user))
    : localStorage.removeItem('user_profile');
}

// ─── Logout ───────────────────────────────────────────────────────────────────

// Override this in your app to redirect to /login or emit an event.
export let onSessionExpired = () => {
  tokenStore.clear();
  if (typeof window !== 'undefined') window.location.href = '/login';
};

export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}

// ─── Token Refresh (singleton promise — prevents race conditions) ──────────────

let _refreshPromise = null;

async function _doRefresh() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    const tokens = json?.data?.tokens;
    if (!json.success || !tokens) return false;

    tokenStore.setAccess(tokens.accessToken || tokens.access_token);
    tokenStore.setRefresh(tokens.refreshToken || tokens.refresh_token);

    // Persist updated user profile if the refresh response includes one
    if (json.data?.user) setUserProfile(json.data.user);

    return true;
  } catch {
    return false;
  }
}

async function refreshOnce() {
  if (!_refreshPromise) {
    _refreshPromise = _doRefresh().finally(() => { _refreshPromise = null; });
  }
  return _refreshPromise;
}

// ─── Core Fetch ───────────────────────────────────────────────────────────────

/**
 * @param {string} endpoint  - Absolute URL or path relative to API_BASE_URL
 * @param {object} [options] - fetch-compatible options; `body` may be an object
 * @param {boolean} [_retry] - Internal flag; do not pass from call sites
 */
async function _fetch(endpoint, options = {}, _retry = false) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const accessToken = tokenStore.getAccess();
  const guestToken = tokenStore.getGuest();

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(guestToken ? { 'x-guest-token': guestToken } : {}),
    ...(options.headers ?? {}),
  };

  const config = {
    method: options.method ?? 'GET',
    headers,
    ...(options.body !== undefined
      ? { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) }
      : {}),
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    // Network-level failure (offline, DNS, CORS preflight abort, etc.)
    return _err(0, err.message || 'Network error — check your connection.');
  }

  // Parse body
  let data;
  try {
    const ct = response.headers.get('content-type') ?? '';
    data = ct.includes('application/json') ? await response.json() : await response.text();
  } catch {
    data = null;
  }

  // Happy path
  if (response.ok) {
    return typeof data === 'object' && data !== null ? data : { success: true, data };
  }

  // ── 401: attempt token refresh once ─────────────────────────────────────────
  if (response.status === 401 && !_retry) {
    const refreshed = await refreshOnce();

    if (refreshed) {
      return _fetch(endpoint, options, true /* _retry */);
    }
    console.warn('Token refresh failed or no refresh token — session is dead.');

    // Refresh failed or no refresh token — session is dead
    onSessionExpired();
    return _err(401, 'Session expired. Please log in again.');
  }

  // ── Other error responses ────────────────────────────────────────────────────
  const message =
    (typeof data === 'object' && data?.message) ||
    `Request failed with status ${response.status}`;

  return _err(response.status, message);
}

function _err(status, message) {
  return { success: false, status, message, error: message, data: null };
}

// ─── Public API Surface ───────────────────────────────────────────────────────

/**
 * Serialise a flat or shallow-nested params object to a query string.
 * Nested objects are JSON-stringified so they round-trip cleanly.
 */
function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    qs.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  return qs.toString();
}

export const api = {
  get(url, params = {}, options = {}) {
    const qs = buildQuery(params);
    return _fetch(qs ? `${url}?${qs}` : url, { ...options, method: 'GET' });
  },

  post(url, body, options = {}) {
    return _fetch(url, { ...options, method: 'POST', body });
  },

  put(url, body, options = {}) {
    return _fetch(url, { ...options, method: 'PUT', body });
  },

  patch(url, body, options = {}) {
    return _fetch(url, { ...options, method: 'PATCH', body });
  },

  delete(url, options = {}) {
    return _fetch(url, { ...options, method: 'DELETE' });
  },
};

export default api;

// ─── Legacy aliases (remove once call sites are updated) ─────────────────────
/** @deprecated Use tokenStore.setAccess() */
export const setAuthToken = (t) => tokenStore.setAccess(t);
/** @deprecated Use tokenStore.setRefresh() */
export const setRefreshToken = (t) => tokenStore.setRefresh(t);
/** @deprecated Use tokenStore.getAccess() */
export const getAuthToken = () => tokenStore.getAccess();
/** @deprecated Use tokenStore.getRefresh() */
export const getRefreshToken = () => tokenStore.getRefresh();
/** @deprecated Use api.get/post/etc. */
export const fetchApi = (endpoint, options) => _fetch(endpoint, options);