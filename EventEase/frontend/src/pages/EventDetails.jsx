import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, User as U, Ticket } from 'lucide-react';
import api, { assetUrl, errMsg } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner, ErrorBox, Badge } from '../components/UI';
import { fmtDate, fmtPrice, gradientFor } from '../utils/format';
export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const { data, loading, error, reload } = useFetch(`/events/${id}`);
  const [busy, setBusy] = useState(false);
  if (loading) return <Spinner className="min-h-[60vh]" />;
  if (error) return <div className="mx-auto max-w-xl px-4 py-16"><ErrorBox message={error} retry={reload} /></div>;
  const { event: e, myRegistration } = data;
  const left = e.capacity - e.registrationCount;
  const closed = e.status !== 'upcoming' || new Date(e.date) < new Date(new Date().toDateString());
  const isOwner = user && (user._id === e.organizer._id);
  const book = async () => {
    if (!user) return nav('/login', { state: { from: loc.pathname } });
    setBusy(true);
    try { await api.post('/registrations', { eventId: e._id }); toast.success('Registration confirmed!'); reload(); } catch (er) { toast.error(errMsg(er)); } finally { setBusy(false); }
  };
  const cancel = async () => {
    if (!window.confirm('Cancel your registration?')) return;
    try { await api.delete(`/registrations/${myRegistration._id}`); toast.success('Registration cancelled'); reload(); } catch (er) { toast.error(errMsg(er)); }
  };
  let action;
  if (myRegistration) action = (<><div className="rounded-xl bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700">✓ You're registered<br /><span className="font-mono text-xs">{myRegistration.bookingReference}</span></div><Link to={`/bookings/${myRegistration._id}`} className="btn-outline w-full">View booking</Link><button className="btn-danger w-full" onClick={cancel}>Cancel registration</button></>);
  else if (isOwner) action = <Link to={`/organizer/events/${e._id}/edit`} className="btn-primary w-full">Manage this event</Link>;
  else if (closed) action = <button className="btn-primary w-full" disabled>Registration closed</button>;
  else if (left <= 0) action = <button className="btn-primary w-full" disabled>Sold out</button>;
  else if (e.ticketPrice > 0) action = <><button className="btn-primary w-full" disabled>Paid booking unavailable</button><p className="text-center text-xs text-slate-500">Online payment isn't implemented yet in this version.</p></>;
  else action = <button className="btn-primary w-full" onClick={book} disabled={busy}>{busy ? 'Booking…' : user ? 'Register for free' : 'Log in to register'}</button>;
  const Row = ({ i: I, children }) => <p className="flex items-center gap-3 text-sm"><I className="h-5 w-5 text-brand-600" />{children}</p>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="h-64 overflow-hidden rounded-3xl md:h-96">{e.bannerImage ? <img src={assetUrl(e.bannerImage)} alt="" className="h-full w-full object-cover" /> : <div className={`h-full bg-gradient-to-br ${gradientFor(e._id)}`} />}</div>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2"><Badge color="indigo">{e.category?.name}</Badge><Badge color={e.status === 'upcoming' ? 'green' : 'slate'}>{e.status}</Badge></div>
          <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">{e.title}</h1>
          <p className="mt-2 text-slate-500">Organized by <b>{e.organizer.name}</b></p>
          <h2 className="mb-2 mt-8 text-lg font-bold">About this event</h2>
          <p className="whitespace-pre-line leading-relaxed text-slate-600">{e.description}</p>
        </div>
        <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-24">
          <p className="text-3xl font-extrabold text-brand-600">{fmtPrice(e.ticketPrice)}</p>
          <Row i={Calendar}>{fmtDate(e.date)}</Row><Row i={Clock}>{e.startTime} – {e.endTime}</Row><Row i={MapPin}>{e.location}</Row>
          <Row i={Users}>{left > 0 ? `${left} of ${e.capacity} seats left` : 'Fully booked'}</Row><Row i={U}>{e.organizer.name}</Row>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-brand-600" style={{ width: `${Math.min(100, (e.registrationCount / e.capacity) * 100)}%` }} /></div>
          <div className="space-y-2 pt-2">{action}</div>
          {user && user.role !== 'attendee' && !isOwner && <p className="flex items-center gap-1 text-xs text-slate-400"><Ticket className="h-3 w-3" />Signed in as {user.role}</p>}
        </aside>
      </div>
    </div>
  );
}
