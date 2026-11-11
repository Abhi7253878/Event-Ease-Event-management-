import { Link, useParams } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Spinner, ErrorBox, Badge, statusColor } from '../../components/UI';
import { fmtDate, fmtDateTime, fmtPrice } from '../../utils/format';
export default function BookingDetails() {
  const { id } = useParams(); const { data, loading, error, reload } = useFetch(`/registrations/${id}`);
  if (loading) return <Spinner />; if (error) return <ErrorBox message={error} retry={reload} />;
  const r = data.registration, e = r.event;
  const Row = ({ k, v }) => <div className="flex justify-between border-b py-3 text-sm last:border-0"><span className="text-slate-500">{k}</span><span className="font-semibold">{v}</span></div>;
  return (<div className="mx-auto max-w-2xl">
    <Link to="/my-registrations" className="text-sm font-medium text-brand-600">← Back to registrations</Link>
    <div className="card mt-4 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white"><p className="text-xs uppercase tracking-widest text-indigo-200">Booking reference</p><p className="mt-1 font-mono text-2xl font-bold">{r.bookingReference}</p></div>
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between"><h1 className="text-xl font-bold">{e.title}</h1><Badge color={statusColor(r.registrationStatus)}>{r.registrationStatus}</Badge></div>
        <Row k="Attendee" v={r.user.name} /><Row k="Email" v={r.user.email} /><Row k="Date" v={fmtDate(e.date)} /><Row k="Time" v={`${e.startTime} – ${e.endTime}`} /><Row k="Location" v={e.location} /><Row k="Category" v={e.category?.name} /><Row k="Price" v={fmtPrice(e.ticketPrice)} /><Row k="Booked on" v={fmtDateTime(r.registeredAt)} />
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500"><QrCode className="h-8 w-8" />Show this booking reference at the venue entrance.</div>
        <Link to={`/events/${e._id}`} className="btn-outline mt-4 w-full">View event page</Link>
      </div>
    </div></div>);
}
