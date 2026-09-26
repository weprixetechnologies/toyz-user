const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://72.60.219.181:46711/api/v1';

export function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token') || '';
  }
  return '';
}

export function getRefreshToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token') || '';
  }
  return '';
}

export function setRefreshToken(token) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('refresh_token', token);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }
}

export function setAuthToken(token) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }
}

export function getUserProfile() {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user_profile');
    if (userStr) {
      try { return JSON.parse(userStr); } catch (e) { }
    }
  }
  return null;
}

export function setUserProfile(user) {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('user_profile');
    }
  }
}

export async function fetchApi(endpoint, options = {}, isRetry = false) {
  const token = getAuthToken();
  const guestToken = typeof window !== 'undefined' ? localStorage.getItem('guest_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(guestToken ? { 'x-guest-token': guestToken } : {}),
    ...(options.headers || {})
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) } : {})
  };

  try {
    const response = await fetch(url, config);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle Token Expiry
      if (response.status === 401 && !isRetry) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.success && refreshData.data && refreshData.data.tokens) {
                setAuthToken(refreshData.data.tokens.accessToken || refreshData.data.tokens.access_token);
                setRefreshToken(refreshData.data.tokens.refreshToken || refreshData.data.tokens.refresh_token);
                return fetchApi(endpoint, options, true);
              }
            }
          } catch (e) {
            console.error('Refresh token failed', e);
          }
        }
      }

      const errorMessage = typeof data === 'object' && data.message ? data.message : `HTTP error ${response.status}`;
      return {
        success: false,
        status: response.status,
        message: errorMessage,
        error: errorMessage,
        data: null
      };
    }

    return typeof data === 'object' ? data : { success: true, data };
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    return {
      success: false,
      status: 500,
      message: err.message || 'Network error, please check connection.',
      error: err.message
    };
  }
}

export const api = {
  get: (url, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const fullUrl = query ? `${url}?${query}` : url;
    return fetchApi(fullUrl, { method: 'GET' });
  },
  post: (url, body) => fetchApi(url, { method: 'POST', body }),
  put: (url, body) => fetchApi(url, { method: 'PUT', body }),
  delete: (url) => fetchApi(url, { method: 'DELETE' })
};

export default api;
