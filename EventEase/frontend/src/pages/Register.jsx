import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../services/api';
export default function Register() {
  const { register, homePath } = useAuth(); const toast = useToast(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'attendee' }); const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try { const u = await register(f); toast.success('Account created!'); nav(homePath(u), { replace: true }); }
    catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  return (<div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
    <form onSubmit={submit} className="card fade-up w-full max-w-md space-y-5 p-8">
      <div><h1 className="text-2xl font-extrabold">Create your account</h1><p className="text-sm text-slate-500">Join EventEase in under a minute</p></div>
      <div className="grid grid-cols-2 gap-2">{[['attendee', 'Attend events'], ['organizer', 'Organize events']].map(([v, l]) => <button type="button" key={v} onClick={() => setF({ ...f, role: v })} className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${f.role === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200'}`}>{l}</button>)}</div>
      <div><label className="label">Full name</label><input required minLength={2} className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
      <div><label className="label">Email</label><input type="email" required className="input" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
      <div><label className="label">Password</label><input type="password" required minLength={6} className="input" placeholder="At least 6 characters" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      <p className="text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-brand-600">Log in</Link></p>
    </form></div>);
}
