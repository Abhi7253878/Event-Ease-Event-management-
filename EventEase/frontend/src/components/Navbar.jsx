import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
export function Notifications() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ notifications: [], unread: 0 });
  const load = () => api.get('/notifications').then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);
  const readAll = async () => { await api.patch('/notifications/read-all'); load(); };
  const readOne = async id => { await api.patch(`/notifications/${id}/read`); load(); };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative rounded-full p-2 hover:bg-slate-100" aria-label="Notifications">
        <Bell className="h-5 w-5" />{data.unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{data.unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3"><b className="text-sm">Notifications</b>{data.unread > 0 && <button onClick={readAll} className="text-xs font-medium text-brand-600">Mark all read</button>}</div>
          <div className="max-h-80 overflow-y-auto">
            {data.notifications.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No notifications</p>}
            {data.notifications.map(n => (
              <button key={n._id} onClick={() => !n.isRead && readOne(n._id)} className={`block w-full border-b px-4 py-3 text-left hover:bg-slate-50 ${n.isRead ? '' : 'bg-brand-50/60'}`}>
                <p className="text-sm font-semibold">{n.title}</p><p className="text-xs text-slate-500">{n.message}</p>
              </button>))}
          </div>
        </div>)}
    </div>
  );
}
export default function Navbar() {
  const { user, logout, homePath } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const link = ({ isActive }) => `text-sm font-medium transition hover:text-brand-600 ${isActive ? 'text-brand-600' : 'text-slate-600'}`;
  return (
    <header className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold"><span className="rounded-lg bg-brand-600 p-1.5 text-white"><CalendarDays className="h-5 w-5" /></span>Event<span className="text-brand-600">Ease</span></Link>
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" end className={link}>Home</NavLink><NavLink to="/events" className={link}>Explore</NavLink><NavLink to="/about" className={link}>About</NavLink><NavLink to="/contact" className={link}>Contact</NavLink>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (<>
            <Notifications />
            <Link to={homePath()} className="btn-outline py-2"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
            <button onClick={() => { logout(); nav('/'); }} className="rounded-full p-2 hover:bg-slate-100" title="Logout"><LogOut className="h-5 w-5" /></button>
          </>) : (<><Link to="/login" className="btn-outline py-2">Log in</Link><Link to="/register" className="btn-primary py-2">Sign up</Link></>)}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="space-y-3 border-t bg-white px-4 py-4 md:hidden" onClick={() => setOpen(false)}>
          <Link className="block" to="/">Home</Link><Link className="block" to="/events">Explore</Link><Link className="block" to="/about">About</Link><Link className="block" to="/contact">Contact</Link>
          {user ? (<><Link className="block font-semibold text-brand-600" to={homePath()}>Dashboard</Link><button onClick={() => { logout(); nav('/'); }}>Logout</button></>) : (<><Link className="block" to="/login">Log in</Link><Link className="block font-semibold text-brand-600" to="/register">Sign up</Link></>)}
        </div>)}
    </header>
  );
}
