import { Link } from 'react-router-dom';
import { CalendarDays, Users, CalendarClock, PlusCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import useFetch from '../../hooks/useFetch';
import { Spinner, ErrorBox, StatCard, PageHeader, Empty, Badge, statusColor, Table } from '../../components/UI';
import { fmtDate, fmtDateTime } from '../../utils/format';
export default function OrganizerDashboard() {
  const { data, loading, error, reload } = useFetch('/users/dashboard/organizer');
  if (loading) return <Spinner />; if (error) return <ErrorBox message={error} retry={reload} />;
  const s = data.stats;
  return (<>
    <PageHeader title="Organizer Dashboard" subtitle="Performance of your events" action={<Link to="/organizer/create" className="btn-primary"><PlusCircle className="h-4 w-4" />Create event</Link>} />
    <div className="grid gap-4 md:grid-cols-3"><StatCard icon={CalendarDays} label="Total events" value={s.totalEvents} /><StatCard icon={Users} label="Total participants" value={s.totalParticipants} tint="bg-emerald-50 text-emerald-600" /><StatCard icon={CalendarClock} label="Upcoming events" value={s.upcomingEvents} tint="bg-amber-50 text-amber-600" /></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="card p-5"><h3 className="mb-4 font-bold">Registrations (last 7 days)</h3><ResponsiveContainer width="100%" height={240}><LineChart data={data.trend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Line type="monotone" dataKey="registrations" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div>
      <div className="card p-5"><h3 className="mb-4 font-bold">Registrations vs capacity</h3><ResponsiveContainer width="100%" height={240}><BarChart data={data.perEvent}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" fontSize={10} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Bar dataKey="registrations" fill="#4f46e5" radius={[6, 6, 0, 0]} /><Bar dataKey="capacity" fill="#c7d2fe" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
    </div>
    <h2 className="mb-3 mt-8 text-lg font-bold">Recent registrations</h2>
    {data.recent.length === 0 ? <Empty title="No registrations yet" /> : <Table head={['Attendee', 'Event', 'When']}>{data.recent.map(r => <tr key={r._id}><td className="td font-medium">{r.user?.name}<div className="text-xs text-slate-400">{r.user?.email}</div></td><td className="td">{r.event?.title}</td><td className="td">{fmtDateTime(r.registeredAt)}</td></tr>)}</Table>}
    <h2 className="mb-3 mt-8 text-lg font-bold">Your events</h2>
    {data.events.length === 0 ? <Empty title="You haven't created an event" action={<Link to="/organizer/create" className="btn-primary">Create your first event</Link>} /> :
      <Table head={['Event', 'Date', 'Registered', 'Status', '']}>{data.events.map(e => <tr key={e._id}><td className="td font-semibold">{e.title}</td><td className="td">{fmtDate(e.date)}</td><td className="td">{e.registrationCount}/{e.capacity}</td><td className="td"><Badge color={statusColor(e.status)}>{e.status}</Badge></td><td className="td"><Link className="font-medium text-brand-600" to={`/organizer/events/${e._id}/participants`}>Participants</Link></td></tr>)}</Table>}
  </>);
}
