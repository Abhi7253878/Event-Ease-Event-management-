import { Link } from 'react-router-dom';
import { Ticket, CalendarClock, CheckCircle2, Search } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { Spinner, ErrorBox, StatCard, PageHeader, Empty, Badge } from '../../components/UI';
import EventCard from '../../components/EventCard';
import { fmtDate } from '../../utils/format';
export default function UserDashboard() {
  const { data, loading, error, reload } = useFetch('/users/dashboard/attendee');
  const disc = useFetch('/events?limit=3');
  if (loading) return <Spinner />; if (error) return <ErrorBox message={error} retry={reload} />;
  return (<>
    <PageHeader title="My Dashboard" subtitle="Your event activity at a glance" action={<Link to="/events" className="btn-primary"><Search className="h-4 w-4" />Find events</Link>} />
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard icon={Ticket} label="Total registrations" value={data.stats.total} /><StatCard icon={CalendarClock} label="Upcoming events" value={data.stats.upcoming} tint="bg-amber-50 text-amber-600" /><StatCard icon={CheckCircle2} label="Completed events" value={data.stats.completed} tint="bg-emerald-50 text-emerald-600" />
    </div>
    <h2 className="mb-3 mt-8 text-lg font-bold">Recent bookings</h2>
    {data.recent.length === 0 ? <Empty title="No bookings yet" text="Register for an event to see it here." action={<Link to="/events" className="btn-primary">s</Link>} /> :
      <div className="card divide-y">{data.recent.map(r => (
        <Link key={r._id} to={`/bookings/${r._id}`} className="flex items-center justify-between p-4 hover:bg-slate-50"><div><p className="font-semibold">{r.event.title}</p><p className="text-sm text-slate-500">{fmtDate(r.event.date)} · {r.event.location}</p></div><Badge color="green">{r.bookingReference}</Badge></Link>))}</div>}
    <h2 className="mb-3 mt-8 text-lg font-bold">Discover more</h2>
    <div className="grid gap-6 md:grid-cols-3">{disc.data?.events.map(e => <EventCard key={e._id} event={e} />)}</div>
  </>);
}
