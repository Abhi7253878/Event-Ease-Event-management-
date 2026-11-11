import { useState } from 'react';
import api, { assetUrl, errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/UI';
export default function Profile() {
  const { user, setUser } = useAuth(); const toast = useToast();
  const [f, setF] = useState({ name: user.name, phone: user.phone || '', password: '' }); const [file, setFile] = useState(null); const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setBusy(true);
    const fd = new FormData(); fd.append('name', f.name); fd.append('phone', f.phone); if (f.password) fd.append('password', f.password); if (file) fd.append('profileImage', file);
    try { const { data } = await api.put('/users/profile', fd); setUser(data.user); setF({ ...f, password: '' }); toast.success('Profile updated'); } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  return (<div className="max-w-2xl"><PageHeader title="My Profile" subtitle="Manage your personal information" />
    <form onSubmit={submit} className="card space-y-5 p-6">
      <div className="flex items-center gap-4">
        {user.profileImage ? <img src={assetUrl(user.profileImage)} className="h-20 w-20 rounded-full object-cover" alt="" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white">{user.name[0]}</div>}
        <div><p className="font-bold">{user.name}</p><p className="text-sm text-slate-500">{user.email} · <span className="capitalize">{user.role}</span></p><input type="file" accept="image/*" className="mt-2 text-sm" onChange={e => setFile(e.target.files[0])} /></div>
      </div>
      <div><label className="label">Full name</label><input required className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
      <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
      <div><label className="label">New password (leave blank to keep)</label><input type="password" minLength={6} className="input" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
      <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form></div>);
}
