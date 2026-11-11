import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { assetUrl, errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { toInputDate } from '../../utils/format';
export default function EventForm({ event }) {
  const nav = useNavigate(); const toast = useToast(); const cats = useFetch('/admin/categories');
  const [f, setF] = useState(event ? { title: event.title, description: event.description, category: event.category?._id || event.category, date: toInputDate(event.date), startTime: event.startTime, endTime: event.endTime, location: event.location, ticketPrice: event.ticketPrice, capacity: event.capacity, status: event.status } : { title: '', description: '', category: '', date: '', startTime: '10:00', endTime: '12:00', location: '', ticketPrice: 0, capacity: 50, status: 'upcoming' });
  const [file, setFile] = useState(null); const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(event ? event.ticketPrice > 0 : false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setBusy(true);
    const fd = new FormData(); Object.entries({ ...f, ticketPrice: paid ? f.ticketPrice : 0 }).forEach(([k, v]) => fd.append(k, v)); if (file) fd.append('bannerImage', file);
    try {
      if (event) await api.put(`/events/${event._id}`, fd); else await api.post('/events', fd);
      toast.success(event ? 'Event updated' : 'Event created'); nav('/organizer/events');
    } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="card max-w-3xl space-y-5 p-6">
      <div><label className="label">Title</label><input required maxLength={120} className="input" value={f.title} onChange={set('title')} /></div>
      <div><label className="label">Description</label><textarea required rows={5} className="input" value={f.description} onChange={set('description')} /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="label">Category</label><select required className="input" value={f.category} onChange={set('category')}><option value="">Select…</option>{cats.data?.categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
        <div><label className="label">Date</label><input required type="date" className="input" value={f.date} onChange={set('date')} /></div>
        <div><label className="label">Start time</label><input required type="time" className="input" value={f.startTime} onChange={set('startTime')} /></div>
        <div><label className="label">End time</label><input required type="time" className="input" value={f.endTime} onChange={set('endTime')} /></div>
        <div className="md:col-span-2"><label className="label">Location</label><input required className="input" value={f.location} onChange={set('location')} /></div>
        <div><label className="label">Capacity</label><input required type="number" min={1} className="input" value={f.capacity} onChange={set('capacity')} /></div>
        <div><label className="label">Ticket type</label><div className="flex gap-2"><select className="input" value={paid ? 'paid' : 'free'} onChange={e => setPaid(e.target.value === 'paid')}><option value="free">Free</option><option value="paid">Paid (display only)</option></select>{paid && <input type="number" min={1} className="input" placeholder="₹" value={f.ticketPrice} onChange={set('ticketPrice')} />}</div>{paid && <p className="mt-1 text-xs text-amber-600">Online payment isn't implemented — paid events are listed but cannot be booked.</p>}</div>
        {event && <div><label className="label">Status</label><select className="input" value={f.status} onChange={set('status')}><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>}
      </div>
      <div><label className="label">Banner image (JPG/PNG/WEBP, max 3MB)</label>{event?.bannerImage && !file && <img src={assetUrl(event.bannerImage)} className="mb-2 h-32 rounded-xl object-cover" alt="" />}<input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm" /></div>
      <div className="flex gap-3"><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : event ? 'Save changes' : 'Create event'}</button><button type="button" className="btn-outline" onClick={() => nav(-1)}>Cancel</button></div>
    </form>
  );
}
