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
