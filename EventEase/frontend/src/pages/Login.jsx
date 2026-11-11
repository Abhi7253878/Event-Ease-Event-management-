import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../services/api';
export default function Login() {
  const { login, homePath } = useAuth(); const toast = useToast(); const nav = useNavigate(); const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '' }); const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try { const u = await login(f.email, f.password); toast.success(`Welcome back, ${u.name}`); nav(loc.state?.from || homePath(u), { replace: true }); }
    catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  return (<div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
    <form onSubmit={submit} className="card fade-up w-full max-w-md space-y-5 p-8">
      <div><h1 className="text-2xl font-extrabold">Welcome back</h1><p className="text-sm text-slate-500">Log in to your EventEase account</p></div>
      <div><label className="label">Email</label><input type="email" required className="input" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
      <div><label className="label">Password</label><input type="password" required className="input" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      <p className="text-center text-sm text-slate-500">New here? <Link to="/register" className="font-semibold text-brand-600">Create an account</Link></p>
    </form></div>);
}
