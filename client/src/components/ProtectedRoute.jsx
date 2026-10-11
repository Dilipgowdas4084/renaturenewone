import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { decodeToken, storeTokens, clearTokens, dashboardPathFor } from '../utils/auth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [status, setStatus] = useState('checking');
  const [role, setRole] = useState(null);

  useEffect(() => {
      const check = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      let decoded = token ? decodeToken(token) : null;
      const isExpired = !decoded || decoded.exp * 1000 < Date.now();

      if (isExpired && refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          storeTokens({ token: res.data.token });
          decoded = decodeToken(res.data.token);
        } catch {
          decoded = null;
        }
      } else if (isExpired) {
        decoded = null;
      }

      if (!decoded) {
        clearTokens();
        setStatus('unauthenticated');
        return;
      }

      setRole(decoded.role);
      setStatus('authenticated');
    };

    check();
  }, []);

  if (status === 'checking') return null;

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in, just not for this area: send them to their own dashboard.
    return <Navigate to={dashboardPathFor(role)} replace />;
  }

  return children;
}
