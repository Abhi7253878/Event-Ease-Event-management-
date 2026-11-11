import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
    const expired = () => setUser(null);
    window.addEventListener('auth-expired', expired);
    return () => window.removeEventListener('auth-expired', expired);
  }, []);
  const login = async (email, password) => { const { data } = await api.post('/auth/login', { email, password }); localStorage.setItem('token', data.token); setUser(data.user); return data.user; };
  const register = async form => { const { data } = await api.post('/auth/register', form); localStorage.setItem('token', data.token); setUser(data.user); return data.user; };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  const homePath = u => ({ admin: '/admin', organizer: '/organizer', attendee: '/dashboard' }[(u || user)?.role] || '/');
  return <Ctx.Provider value={{ user, setUser, loading, login, register, logout, homePath }}>{children}</Ctx.Provider>;
}
