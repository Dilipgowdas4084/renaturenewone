export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

export function getValidAccessToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded || decoded.exp * 1000 < Date.now()) return null;

  return token;
}

export function storeTokens({ token, refreshToken }) {
  localStorage.setItem('token', token);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
}

function liveTokenPayload(token) {
  const decoded = token ? decodeToken(token) : null;
  return decoded && decoded.exp * 1000 > Date.now() ? decoded : null;
}

// Logged in = a valid access token, or a valid refresh token that the API
// client / ProtectedRoute will use to get a new access token. (Access tokens
// only last 15 minutes; the session itself lasts as long as the refresh token.)
export function isLoggedIn() {
  return Boolean(liveTokenPayload(localStorage.getItem('token')) || liveTokenPayload(localStorage.getItem('refreshToken')));
}

export function getCurrentRole() {
  const payload = liveTokenPayload(localStorage.getItem('token')) || liveTokenPayload(localStorage.getItem('refreshToken'));
  return payload ? payload.role : null;
}

export function dashboardPathFor(role) {
  return role === 'admin' ? '/admin/dashboard' : '/member-dashboard';
}
