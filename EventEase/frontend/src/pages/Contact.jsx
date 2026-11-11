import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useToast } from '../context/ToastContext';
export default function Contact() {
  const toast = useToast();
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const submit = e => { e.preventDefault(); toast.success('Thanks! Your message has been noted (demo form — no email is sent).'); setF({ name: '', email: '', message: '' }); };
  return (<div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2">
    <div><h1 className="text-4xl font-extrabold">Contact us</h1><p className="mt-3 text-slate-600">Questions about an event or your account? Reach out.</p>
      <div className="mt-8 space-y-4 text-sm"><p className="flex gap-3"><Mail className="text-brand-600" />support@eventease.com</p><p className="flex gap-3"><Phone className="text-brand-600" />+91 00000 00000</p><p className="flex gap-3"><MapPin className="text-brand-600" />India</p></div></div>
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div><label className="label">Name</label><input required className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
      <div><label className="label">Email</label><input required type="email" className="input" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
      <div><label className="label">Message</label><textarea required rows={4} className="input" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} /></div>
      <button className="btn-primary w-full">Send message</button>
    </form></div>);
}
